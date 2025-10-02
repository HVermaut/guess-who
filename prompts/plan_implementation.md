# Plan d'implémentation - Guess Who

## Vue d'ensemble du projet

Application web Svelte pour un jeu d'anniversaire où Julie doit deviner qui a donné quelles réponses aux questions posées aux participants.

## Architecture technique

### Stack technique

- **Framework** : SvelteKit (déjà initialisé)
- **Styling** : CSS custom avec les couleurs spécifiées
- **Typographies** : Google Fonts (Bitcount Prop Single Ink, Poppins)
- **Données** : JSON local (data.json)
- **Animations** : CSS animations pour les feux d'artifice
- **Audio** : Sons de validation/erreur (optionnel)
- **Vidéos** : Fichiers MP4 locaux pour extraits films/séries/chansons

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

### Phase 1 : Configuration et structure de base

1. **Configuration du projet**
   - [ ] Configurer les Google Fonts dans `app.html`
   - [ ] Créer le système de couleurs CSS (variables CSS)
   - [ ] Configurer le routing SvelteKit

2. **Structure des composants**
   - [ ] `src/lib/components/Button.svelte` - Bouton avec style arc-en-ciel
   - [ ] `src/lib/components/ParticipantPhoto.svelte` - Photo avec contours colorés
   - [ ] `src/lib/components/FireworksAnimation.svelte` - Animation feux d'artifice
   - [ ] `src/lib/components/VideoPlayer.svelte` - Lecteur vidéo MP4

3. **Stores Svelte**
   - [ ] `src/lib/stores/gameState.js` - État du jeu (question actuelle, réponses)
   - [ ] `src/lib/stores/participants.js` - Données des participants
   - [ ] `src/lib/stores/questions.js` - Données des questions

### Phase 2 : Écran d'accueil

1. **Page d'accueil** (`src/routes/+page.svelte`)
   - [ ] Photo principale
   - [ ] Bouton "Guess Who" 🦄 (600px x 200px, texte 50px)
   - [ ] Style arc-en-ciel pour le bouton
   - [ ] Animation de transition vers les questions

2. **Animation de transition**
   - [ ] Feux d'artifice CSS (3 secondes)
   - [ ] Redirection automatique vers la première question

### Phase 3 : Système de questions

1. **Layout des questions** (`src/routes/question/[id]/+page.svelte`)
   - [ ] Affichage du numéro de question
   - [ ] Affichage de la question
   - [ ] Affichage d'une réponse à la fois
   - [ ] Grille des photos des participants

2. **Logique d'attribution**
   - [ ] Sélection d'un participant pour une réponse
   - [ ] Changement visuel du contour (orange → rouge)
   - [ ] Possibilité de modifier l'attribution
   - [ ] Navigation vers la réponse suivante

3. **Gestion des questions spéciales**
   - [ ] Questions films/séries : intégration vidéo MP4
   - [ ] Questions chansons : intégration vidéo MP4
   - [ ] Interface adaptée pour chaque type

### Phase 4 : Validation et correction

1. **Écran de validation** (`src/routes/question/[id]/validate/+page.svelte`)
   - [ ] Bouton "Vérifier les réponses"
   - [ ] Affichage des résultats (vert/rouge)
   - [ ] Affichage des bonnes réponses
   - [ ] Bouton "Question suivante"

2. **Logique de scoring**
   - [ ] Comparaison avec les vraies réponses
   - [ ] Calcul des scores par participant
   - [ ] Sauvegarde des résultats

### Phase 5 : Écran de résultats finaux

1. **Page de transition** (`src/routes/results/intro/+page.svelte`)
   - [ ] Grande photo
   - [ ] Bouton "Voir les résultats" (même style que l'accueil)

2. **Page de résultats** (`src/routes/results/+page.svelte`)
   - [ ] Podium top 3 (qui Julie connaît le mieux)
   - [ ] Liste des autres participants avec pourcentages
   - [ ] Statistiques détaillées

### Phase 6 : Fonctionnalités avancées

1. **Intégration vidéo**
   - [ ] Composant de lecteur vidéo MP4 responsive
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

## Structure des routes prévues

```
/                           # Accueil
/question/[id]             # Questions (1-12)
/question/[id]/validate    # Validation des réponses
/results/intro             # Transition vers résultats
/results                   # Résultats finaux
```

## Composants réutilisables

### Button.svelte

- Props : `label`, `size`, `rainbow` (boolean)
- Styles : Arc-en-ciel, typo Bitcount Prop Single Ink

### ParticipantPhoto.svelte

- Props : `src`, `name`, `status` ('default', 'selected', 'correct', 'incorrect')
- Contours colorés selon le statut

### FireworksAnimation.svelte

- Animation CSS pure (3 secondes)
- Trigger programmatique

### VideoPlayer.svelte

- Props : `src`, `title`, `autoplay` (boolean)
- Contrôles personnalisés
- Responsive video element

## Fonctions utilitaires

### gameLogic.js

```javascript
-shuffleAnswers() - // Mélange les réponses
	checkAnswer() - // Vérifie une réponse
	calculateScores() - // Calcule les scores finaux
	getNextQuestion(); // Navigation
```

### dataManager.js

```javascript
-loadGameData() - // Charge data.json
	saveJulieResponse() - // Sauvegarde une réponse
	getParticipantScore(); // Score d'un participant
```

## Considérations techniques

### Performance

- Lazy loading des images
- Preload des vidéos MP4 les plus importantes
- Optimisation des animations CSS
- Compression audio pour les sons de validation

### Accessibilité

- Alt text pour toutes les images
- Navigation clavier
- Contraste des couleurs respecté

### Compatibilité

- Support navigateurs modernes
- Fallbacks pour les animations CSS
- Responsive design mobile-first

## Prochaines étapes immédiates

1. **Démarrage** : Configuration des fonts et couleurs
2. **Premier composant** : Button.svelte avec style arc-en-ciel
3. **Écran d'accueil** : Layout et navigation de base
4. **Structure des données** : Stores Svelte pour l'état du jeu

Ce plan servira de roadmap pour nos prochaines sessions de développement. Chaque phase peut être développée et testée indépendamment.
