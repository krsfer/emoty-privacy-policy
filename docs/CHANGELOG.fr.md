# Journal des modifications

Tous les changements notables d'Emoty seront documentés dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Versionnage Sémantique](https://semver.org/lang/fr/).

## Versions de l'Application Android Emoty

### [App v1.9.3] - 1er août 2025

#### 🔧 Corrections Critiques - Persistance des Emojis Noto
- **CORRIGÉ**: Les emojis Noto conservent désormais correctement leur apparence monochrome après le redémarrage de l'app
- **RÉSOLU**: Le système de persistance des motifs perdait l'état monochrome lors de la fermeture et réouverture de l'app
- **AMÉLIORÉ**: SequenceStateSerializer préserve maintenant la propriété isMonochrome à travers tous les mécanismes de persistance
- **OPTIMISÉ**: La persistance SharedPreferences de PatternOperationsManager inclut le suivi de l'état monochrome
- **AJOUTÉ**: Persistance automatique des motifs dans la méthode de cycle de vie onPause() pour une sauvegarde fiable

#### 🏗️ Améliorations de l'Architecture Technique - Gestion d'État Robuste
- **NOUVEAU**: Méthode restoreCharacterSequenceWithModesAndMonochrome() dans SequenceManager
- **AMÉLIORÉ**: La persistance basée sur Bundle (changements de configuration) préserve maintenant les états monochromes
- **OPTIMISÉ**: La persistance basée sur SharedPreferences (redémarrages d'app) inclut les tableaux d'état monochrome
- **AFFINÉ**: Les appels Character.fromEmoji() dans tout le code utilisent les vraies valeurs monochromes
- **RENFORCÉ**: Les opérations d'annulation/rétablissement maintiennent l'état complet incluant les informations monochromes

#### 🎯 Expérience Utilisateur - Comportement Visuel Cohérent
- **RÉSOLU**: Incohérence visuelle où les emojis Noto apparaissaient colorés après les sessions d'app
- **MAINTENU**: Compatibilité rétroactive avec les motifs sauvegardés existants sans données monochromes
- **ASSURÉ**: Gestion de repli gracieuse pour les données d'état monochrome corrompues ou manquantes
- **GARANTI**: Rendu fiable des emojis monochromes dans tous les scénarios d'utilisation de l'app

### [App v1.9.2] - 26 juillet 2025

#### 🎯 Expérience de Partage Améliorée - Découverte de Contenu Améliorée
- **NOUVEAU**: Menu de partage Material Design 3 avec révélation progressive basée sur le niveau
- **RENOMMÉ**: FAB "Outils" en FAB "Partager" pour une compréhension plus claire de la fonctionnalité
- **NOUVEAU**: Interface visuelle riche avec icônes, descriptions et indicateurs de format
- **NOUVEAU**: SharePatternAdapter avec RecyclerView pour un affichage sophistiqué des options
- **NOUVEAU**: Badges de niveau montrant les exigences de fonctionnalité (BASIC, PRO, EXPERT, MASTER)
- **NOUVEAU**: Filtrage intelligent des fonctionnalités évite de submerger les débutants tout en débloquant les outils avancés

#### 🎨 Améliorations du Tutoriel et de l'Interface - Meilleure Expérience Utilisateur
- **AMÉLIORÉ**: Positionnement des boutons de tutoriel avec fonctionnalité de support d'annulation
- **AMÉLIORÉ**: Boutons de tutoriel localisés s'affichant dans la langue de l'utilisateur
- **AMÉLIORÉ**: Ciblage précis des ballons pour des éléments et contrôles d'interface spécifiques
- **AFFINÉ**: Améliorations d'animation et espacement de mise en page plus propre dans toute l'app
- **AMÉLIORÉ**: Fonctionnalité d'effacement automatique pour le motif et la séquence lors du démarrage du tutoriel
- **AMÉLIORÉ**: Assombrissement de l'arrière-plan lors du tap sur les zones vides pendant le flux de tutoriel

#### 🔧 Implémentation Technique - Architecture Moderne
- **NOUVEAU**: Mises en page de dialogue personnalisées (dialog_share_pattern.xml, item_share_option.xml) remplaçant AlertDialog simple
- **NOUVEAU**: 9 icônes vectorielles complètes pour une couverture système visuelle complète
- **NOUVEAU**: Logique de révélation progressive basée sur l'évaluation du niveau UserProgressTracker
- **AMÉLIORÉ**: Ressources de chaînes multilingues pour toute la fonctionnalité de partage en anglais et français
- **NOUVEAU**: Énumération ShareOption avec exigences de niveau minimum et fonctionnalités de suivi
- **AMÉLIORÉ**: Intégration ImageShareHelper avec gestion sophistiquée de dialogue

---

## Versions du Site Web de Politique de Confidentialité

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