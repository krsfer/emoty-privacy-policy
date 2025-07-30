/**
 * Emoty Language Detection
 * Automatically redirects users to their preferred language based on browser settings
 */

(function() {
    'use strict';
    
    // Configuration - will be replaced by template
    const config = {
        enabled: true,
        frenchLanguageCodes: ['fr', 'fr-FR', 'fr-CA', 'fr-BE', 'fr-CH'],
        storageKey: 'emoty_language_preference',
        redirectDelay: 0,
        frenchUrl: '/fr-FR/',
        englishUrl: '/'
    };
    
    // Don't run detection if disabled
    if (!config.enabled) return;
    
    // Don't redirect if this is already a language-specific page
    if (window.location.pathname !== '/') return;
    
    // Don't redirect search engine bots
    const userAgent = navigator.userAgent.toLowerCase();
    const isBot = /bot|crawler|spider|crawling/i.test(userAgent);
    if (isBot) return;
    
    // Check if user has already made a manual language choice
    const storedPreference = localStorage.getItem(config.storageKey);
    if (storedPreference) {
        // User has made a choice, redirect only if they're on the wrong page
        if (storedPreference === 'en' && window.location.pathname === '/') {
            // User prefers English but is on French page
            redirect(config.englishUrl);
        } else if (storedPreference === 'fr' && window.location.pathname === '/') {
            // User prefers French and is already on French page - do nothing
        }
        return;
    }
    
    // Don't redirect if user came from internal navigation
    const referrer = document.referrer;
    if (referrer && (referrer.includes('emoty.fr') || referrer.includes('localhost'))) {
        return;
    }
    
    // Get browser languages
    const browserLanguages = navigator.languages || [navigator.language || navigator.userLanguage];
    
    // Check if any browser language matches French
    const prefersFrench = browserLanguages.some(lang => {
        const langCode = lang.toLowerCase();
        return config.frenchLanguageCodes.some(frenchCode => 
            langCode === frenchCode.toLowerCase() || 
            langCode.startsWith(frenchCode.toLowerCase() + '-')
        );
    });
    
    // Redirect based on language preference
    if (prefersFrench && window.location.pathname === '/') {
        // User prefers French and is already on French page, just store preference
        localStorage.setItem(config.storageKey, 'fr');
        // No redirect needed - already on French page
    } else if (!prefersFrench && window.location.pathname === '/') {
        // User prefers English but is on French page, redirect to English
        localStorage.setItem(config.storageKey, 'en');
        redirect(config.englishUrl);
    }
    
    function redirect(url) {
        if (config.redirectDelay > 0) {
            setTimeout(() => {
                window.location.href = url;
            }, config.redirectDelay);
        } else {
            window.location.href = url;
        }
    }
    
    // Add language switcher event listeners to store preferences
    document.addEventListener('DOMContentLoaded', function() {
        // Find language switcher links
        const langLinks = document.querySelectorAll('a[href="/"], a[href="/fr-FR/"], a[href^="/fr-FR"], a[href="https://emoty.fr/"], a[href="https://emoty.fr/fr-FR/"]');
        
        langLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '/' || href === 'https://emoty.fr/') {
                    localStorage.setItem(config.storageKey, 'en');
                } else if (href.includes('/fr-FR')) {
                    localStorage.setItem(config.storageKey, 'fr');
                }
            });
        });
    });
})();