# Journal des modifications

Tous les changements notables d'Emoty seront documentés dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Versionnage Sémantique](https://semver.org/lang/fr/).

## [2.2.0] - 20 juillet 2025

### Ajouté
- Système de journal des modifications localisé avec versions anglaise et française
- Pages de changelog accessibles à `/changelog/` et `/en-GB/changelog/`
- Liens de navigation vers le changelog dans le pied de page de toutes les pages
- Conversion markdown vers HTML pour le contenu du changelog
- Intégration du sélecteur de langue pour les pages de changelog

### Modifié
- Mise à jour du système de build pour traiter les fichiers markdown du changelog
- Amélioration du template de site avec le template de changelog

### Technique
- Ajout de la dépendance markdown aux exigences de build
- Mise à jour des fichiers de traduction avec le texte du pied de page changelog
- Intégration de la génération du changelog dans le processus de build et déploiement

## [2.1.0] - 19 juillet 2025

### Ajouté
- Amélioration de la fonctionnalité Assistance Créative avec des messages d'aide plus clairs
- Meilleure mise en avant de la disponibilité de l'assistance IA

### Modifié
- Mise à jour de la date d'entrée en vigueur de la politique de confidentialité au 19 juin 2025
- Standardisation du format du pied de page avec des séparateurs à puces sur toutes les pages

### Corrigé
- Style cohérent du pied de page sur les différents types de pages

## [2.0.0] - 19 juillet 2025

### Ajouté
- Implémentation du système de versionnage sémantique
- Gestion automatisée des versions avec les scripts npm
- Affichage de la version dans le pied de page du site
- Hooks Git pour la synchronisation automatique des versions
- Workflows GitHub pour la gestion des versions

### Modifié
- Refonte complète du système de suivi des versions
- Migration vers un versionnage sémantique approprié (MAJEUR.MINEUR.CORRECTIF)

### Technique
- Ajout de package.json pour la gestion des versions basée sur npm
- Création de scripts de build automatisés pour les mises à jour de version
- Intégration de l'affichage de la version sur toutes les pages du site

[2.2.0]: https://github.com/carcher54321/emoty-privacy-policy/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/carcher54321/emoty-privacy-policy/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/carcher54321/emoty-privacy-policy/releases/tag/v2.0.0