# Plan d'implémentation - Guess Who (Vue.js 3)

## Vue d'ensemble du projet

Application web Vue.js 3 pour un jeu d'anniversaire où Julie doit deviner qui a donné quelles réponses aux questions posées aux participants.

## Architecture technique

### Stack technique

- **Framework** : Vue.js 3 avec Composition API
- **Router** : Vue Router 4
- **State Management** : Pinia (store Vue.js 3)
- **Build Tool** : Vite
- **Styling** : CSS custom avec les couleurs spécifiées
- **Typographies** : Google Fonts (Bitcount Prop Single Ink, Poppins)
- **Données** : JSON local (data.json)
- **Animations** : CSS animations pour les feux d'artifice
- **Audio** : Sons de validation/erreur (optionnel)
- **Médias** : Fichiers MP4 locaux pour extraits chansons + images pour films/séries

### Structure des données

- **Questions** : 12 questions prédéfinies
- **Utilisateurs** : 10 participants avec photos et réponses
- **Réponses de Julie** : Stockage des attributions dans `julieResponses`

## Palette de couleurs

- `#ED4C67` - Rouge principal (contour sélectionné)
- `#F79F1F` - Orange (contour par défaut)
- `#303952` - Bleu foncé
- `#C4E538` - Vert (bonnes réponses)
- `#EA2027` - Rouge (mauvaises réponses)
- `#ffffff` - Blanc
- `#000000` - Noir

## Plan d'implémentation par phases

### Phase 1 : Configuration et structure de base ✅

1. **Configuration du projet Vue.js 3**
   - [x] Configurer les Google Fonts dans `index.html`
   - [x] Créer le système de couleurs CSS (variables CSS)
   - [x] Configurer Vue Router pour la navigation
   - [x] Installer et configurer Pinia pour la gestion d'état

2. **Structure des composants Vue**
   - [x] `src/components/AppButton.vue` - Bouton avec style arc-en-ciel
   - [x] `src/components/ParticipantPhoto.vue` - Photo avec contours colorés
   - [x] `src/components/FireworksAnimation.vue` - Animation feux d'artifice
   - [x] `src/components/MediaPlayer.vue` - Lecteur MP4 et affichage d'images

3. **Stores Pinia**
   - [x] `src/stores/gameState.js` - État du jeu (question actuelle, réponses)
   - [x] `src/stores/participants.js` - Données des participants
   - [x] `src/stores/questions.js` - Données des questions

### Phase 2 : Écran d'accueil ✅

1. **Page d'accueil** (`src/views/HomeView.vue`)
   - [x] Photo principale
   - [x] Bouton "Guess Who" 🦄 (600px x 200px, texte 50px)
   - [x] Style arc-en-ciel pour le bouton
   - [x] Animation de transition vers les questions

2. **Animation de transition**
   - [x] Feux d'artifice CSS (3 secondes)
   - [x] Navigation automatique vers la première question

### Phase 3 : Système de questions ✅

1. **Layout des questions** (`src/views/QuestionView.vue`)
   - [x] Affichage du numéro de question
   - [x] Affichage de la question
   - [x] Affichage d'une réponse à la fois
   - [x] Grille des photos des participants

2. **Logique d'attribution**
   - [x] Sélection d'un participant pour une réponse
   - [x] Changement visuel du contour (orange → rouge puis persistance)
   - [x] Possibilité de modifier l'attribution
   - [x] Navigation vers la réponse suivante

3. **Gestion des questions spéciales**
   - [x] Questions films/séries : affichage d'images
   - [x] Questions chansons : intégration fichier MP4
   - [x] Interface adaptée pour chaque type

### Phase 4 : Validation et correction ✅

1. **Écran de validation** (`src/views/ValidationView.vue`)
   - [x] Bouton "Vérifier les réponses"
   - [x] Affichage des résultats (vert/rouge)
   - [x] Affichage des bonnes réponses à côté
   - [x] Bouton "Question suivante"

2. **Logique de scoring**
   - [x] Comparaison avec les vraies réponses
   - [x] Calcul des scores par participant
   - [x] Sauvegarde des résultats

### Phase 5 : Écran de résultats finaux

1. **Page de transition** (`src/views/ResultsIntroView.vue`)
   - [ ] Grande photo
   - [ ] Bouton "Voir les résultats" (même style que l'accueil)

2. **Page de résultats** (`src/views/ResultsView.vue`)
   - [ ] Podium top 3 (qui Julie connaît le mieux)
   - [ ] Liste des autres participants avec pourcentages
   - [ ] Statistiques détaillées

### Phase 6 : Fonctionnalités avancées

1. **Intégration médias**
   - [ ] Composant de lecteur MP4 responsive pour les chansons
   - [ ] Composant d'affichage d'images pour films/séries
   - [ ] Gestion des erreurs de chargement
   - [ ] Interface utilisateur intuitive
   - [ ] Contrôles de lecture personnalisés

2. **Persistance des données**
   - [ ] Sauvegarde automatique des réponses
   - [ ] Possibilité de reprendre le jeu
   - [ ] Export des résultats

3. **Responsive Design**
   - [ ] Adaptation mobile/tablette
   - [ ] Optimisation des tailles de boutons
   - [ ] Adaptation des grilles de participants

## Structure des routes prévues (Vue Router)

```
/                           # Accueil (HomeView)
/question/:id               # Questions (QuestionView)
/question/:id/validate      # Validation des réponses (ValidationView)
/results/intro              # Transition vers résultats (ResultsIntroView)
/results                    # Résultats finaux (ResultsView)
```

## Composants réutilisables Vue.js

### AppButton.vue

- Props : `label`, `size`, `rainbow` (boolean), `@click`
- Styles : Arc-en-ciel, typo Bitcount Prop Single Ink
- Émissions : `click` event

### ParticipantPhoto.vue

- Props : `src`, `name`, `status` ('default', 'selected', 'correct', 'incorrect'), `@click`
- Contours colorés selon le statut
- Émissions : `select` event

### FireworksAnimation.vue

- Props : `show` (boolean), `duration` (number)
- Animation CSS pure (3 secondes par défaut)
- Trigger programmatique

### MediaPlayer.vue

- Props : `type` ('video', 'image'), `src`, `title`, `autoplay` (boolean)
- Support MP4 pour les chansons
- Support images pour films/séries
- Contrôles personnalisés

## Fonctions utilitaires Vue.js

### stores/gameLogic.js (Pinia)

```javascript
// Actions du store gameState
;-shuffleAnswers() - // Mélange les réponses
  checkAnswer() - // Vérifie une réponse
  calculateScores() - // Calcule les scores finaux
  goToNextQuestion() - // Navigation
  saveJulieResponse() // Sauvegarde des réponses
```

### utils/dataManager.js

```javascript
;-loadGameData() - // Charge data.json
  getParticipantScore() - // Score d'un participant
  exportResults() // Export des résultats
```

## Considérations techniques

### Performance

- Lazy loading des images et médias
- Preload des fichiers MP4 les plus importants
- Optimisation des animations CSS
- Compression audio pour les sons de validation
- Code splitting avec Vue Router

### Accessibilité

- Alt text pour toutes les images
- Navigation clavier
- Contraste des couleurs respecté

### Compatibilité

- Support navigateurs modernes (Vue.js 3 requirements)
- Fallbacks pour les animations CSS
- Responsive design mobile-first
- Progressive Web App (PWA) ready

## Prochaines étapes immédiates

1. **Démarrage** : Configuration des fonts et couleurs dans Vue.js 3
2. **Premier composant** : AppButton.vue avec style arc-en-ciel
3. **Écran d'accueil** : HomeView.vue avec navigation
4. **Structure des stores** : Configuration Pinia pour l'état du jeu
5. **Routing** : Configuration Vue Router pour la navigation

## Différences importantes avec Svelte

### Changements spécifiques détectés :

- **Médias** : Images pour films/séries au lieu de vidéos MP4
- **Contours** : Persistance du contour rouge jusqu'à la fin de la question
- **Validation** : Affichage des bonnes réponses "à côté" de chaque réponse

### Architecture Vue.js 3 :

- **Composition API** : Utilisation des `ref`, `reactive`, `computed`
- **Pinia** : Gestion d'état réactive et moderne
- **Vue Router 4** : Navigation avec params dynamiques
- **Single File Components** : Structure `.vue` avec `<template>`, `<script>`, `<style>`

Ce plan servira de roadmap pour nos prochaines sessions de développement Vue.js 3. Chaque phase peut être développée et testée indépendamment.
