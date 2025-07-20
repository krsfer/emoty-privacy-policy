const { Pool } = require('pg');
const logger = require('../utils/logger');

// Database connection pool
let pool;

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'emoty_beta',
    user: process.env.DB_USER || 'emoty_user',
    password: process.env.DB_PASSWORD,
    // Connection pool settings
    max: 20, // Maximum number of clients in pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000, // Return error after 2 seconds if connection could not be established
    maxUses: 7500, // Close (and replace) a connection after it has been used 7500 times
};

// Use DATABASE_URL if provided (for production/Heroku)
if (process.env.DATABASE_URL) {
    dbConfig.connectionString = process.env.DATABASE_URL;
    if (process.env.NODE_ENV === 'production') {
        dbConfig.ssl = {
            rejectUnauthorized: false
        };
    }
}

async function connectDB() {
    try {
        pool = new Pool(dbConfig);
        
        // Test the connection
        const client = await pool.connect();
        await client.query('SELECT NOW()');
        client.release();
        
        logger.info('Database connection established successfully');
        
        // Set up connection error handling
        pool.on('error', (err) => {
            logger.error('Unexpected error on idle database client', err);
        });
        
        return pool;
    } catch (error) {
        logger.error('Failed to connect to database:', error);
        throw error;
    }
}

function getDB() {
    if (!pool) {
        throw new Error('Database not connected. Call connectDB() first.');
    }
    return pool;
}

async function closeDB() {
    if (pool) {
        await pool.end();
        logger.info('Database connection closed');
    }
}

// Helper function to execute queries with error handling
async function query(text, params = []) {
    const client = await pool.connect();
    try {
        const start = Date.now();
        const result = await client.query(text, params);
        const duration = Date.now() - start;
        
        if (process.env.LOG_LEVEL === 'debug') {
            logger.debug('Query executed', {
                query: text,
                duration: `${duration}ms`,
                rows: result.rowCount
            });
        }
        
        return result;
    } catch (error) {
        logger.error('Database query error:', {
            query: text,
            params: params,
            error: error.message
        });
        throw error;
    } finally {
        client.release();
    }
}

// Helper function for transactions
async function transaction(callback) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error('Transaction rolled back:', error);
        throw error;
    } finally {
        client.release();
    }
}

module.exports = {
    connectDB,
    getDB,
    closeDB,
    query,
    transaction
};