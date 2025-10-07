<template>
  <div class="question-view">
    <div class="container">
      <!-- Header avec numéro de question -->
      <div class="question-header">
        <h1 class="question-number">Question {{ questionId }}</h1>
        <h2 class="question-text">{{ currentQuestion?.text }}</h2>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${progressPercentage}%` }"></div>
        </div>
      </div>

      <!-- Affichage de la réponse actuelle -->
      <div class="answer-section" v-if="currentAnswer">
        <div class="answer-card">
          <p class="answer-label">Réponse {{ currentAnswerIndex + 1 }} / {{ totalAnswers }}</p>

          <!-- Plusieurs médias (films/séries avec 3 images) -->
          <div
            v-if="currentAnswer.medias && currentAnswer.medias.length > 0"
            class="multiple-medias"
          >
            <div v-for="(media, index) in currentAnswer.medias" :key="index" class="media-item">
              <MediaPlayer :type="getMediaType(media)" :src="getMediaPath(media)" :title="''" />
            </div>
          </div>

          <!-- Média unique si présent et valide (image ou vidéo) -->
          <MediaPlayer
            v-else-if="currentAnswer.media && isValidMedia(currentAnswer.media)"
            :type="getMediaType(currentAnswer.media)"
            :src="getMediaPath(currentAnswer.media)"
            :title="shouldShowTextWithMedia() ? currentAnswer.text : ''"
          />

          <!-- Message "Pas de photo" si média absent pour les questions avec photos attendues -->
          <div v-else-if="shouldShowPhotoPlaceholder()" class="no-photo-message">
            <span class="no-photo-icon">📷</span>
            <p class="no-photo-text">Pas de photo</p>
          </div>

          <!-- Texte de la réponse (sauf si c'est la question 8 avec une photo) -->
          <div v-if="shouldShowAnswerText()" class="answer-text-container">
            <p class="answer-text" :class="{ 'multiple-answers': currentAnswer.isMultiple }">
              {{ currentAnswer.text }}
            </p>
          </div>
        </div>
      </div>

      <!-- Grille des participants -->
      <div class="participants-section" v-if="participants.length > 0">
        <h3 class="participants-title">Qui a donné cette réponse ?</h3>
        <div class="participants-grid">
          <div
            v-for="participant in participants"
            :key="participant.id"
            class="participant-card"
            @click="selectParticipant(participant.id)"
          >
            <ParticipantPhoto
              :src="getParticipantPhotoPath(participant.photos?.profile)"
              :name="participant.name"
              :status="getParticipantStatus(participant.id)"
              :clickable="true"
            />
            <!-- Indicateur de réponses attribuées pour LA QUESTION ACTUELLE UNIQUEMENT -->
            <div
              v-if="getAttributedAnswersForCurrentQuestion(participant.id) > 0"
              class="attributed-count"
            >
              <span class="count-badge">
                {{ getAttributedAnswersForCurrentQuestion(participant.id) }}
                {{
                  getAttributedAnswersForCurrentQuestion(participant.id) > 1
                    ? 'réponses'
                    : 'réponse'
                }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Message de chargement -->
      <div v-else class="loading-section">
        <p class="loading-text">Chargement des participants...</p>
      </div>

      <!-- Bouton de validation -->
      <div class="validation-button" v-if="allAnswersCompleted">
        <AppButton
          label="Voir les résultats de cette question ✅"
          size="large"
          :rainbow="true"
          @click="goToValidation"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuestionsStore } from '../stores/questions'
import { useParticipantsStore } from '../stores/participants'
import { useGameStateStore } from '../stores/gameState'
import AppButton from '../components/AppButton.vue'
import ParticipantPhoto from '../components/ParticipantPhoto.vue'
import MediaPlayer from '../components/MediaPlayer.vue'

const route = useRoute()
const router = useRouter()
const questionsStore = useQuestionsStore()
const participantsStore = useParticipantsStore()
const gameStateStore = useGameStateStore()

const questionId = computed(() => route.params.id)
const currentQuestion = computed(() => questionsStore.getQuestionById(questionId.value))
const participants = computed(() => participantsStore.allParticipants)

// Réponses mélangées pour la question actuelle
const shuffledAnswers = ref([])
const currentAnswerIndex = ref(0)

// Réponse actuelle
const currentAnswer = computed(() => shuffledAnswers.value[currentAnswerIndex.value])
const totalAnswers = computed(() => shuffledAnswers.value.length)

// Progression
const progressPercentage = computed(() => {
  if (totalAnswers.value === 0) return 0
  return ((currentAnswerIndex.value + 1) / totalAnswers.value) * 100
})

// Participant sélectionné pour la réponse actuelle
const selectedParticipantId = ref(null)
const hasSelectedParticipant = computed(() => selectedParticipantId.value !== null)

// Vérifier si toutes les réponses ont été complétées
const allAnswersCompleted = computed(() => {
  const responses = gameStateStore.julieResponses[questionId.value] || {}
  return Object.keys(responses).length === totalAnswers.value
})

// Charger les réponses pour la question
const loadAnswers = () => {
  // Vérifier que les participants sont chargés
  if (!participants.value || participants.value.length === 0) {
    console.log('Participants pas encore chargés, attente...')
    return
  }

  // Vérifier si on a déjà un ordre mélangé sauvegardé
  const savedShuffled = gameStateStore.getShuffledAnswers(questionId.value)

  if (savedShuffled) {
    // Utiliser l'ordre sauvegardé
    shuffledAnswers.value = savedShuffled
  } else {
    // Créer un nouvel ordre mélangé et le sauvegarder
    const answers = questionsStore.getAnswersForQuestion(questionId.value, participants.value)
    shuffledAnswers.value = questionsStore.shuffleAnswers(answers)
    gameStateStore.saveShuffledAnswers(questionId.value, shuffledAnswers.value)
  }

  currentAnswerIndex.value = 0
  selectedParticipantId.value = null

  // Charger la réponse précédemment sélectionnée si elle existe
  const savedResponse = gameStateStore.getJulieResponseForAnswer(
    questionId.value,
    currentAnswerIndex.value,
  )
  if (savedResponse) {
    selectedParticipantId.value = savedResponse
  }
}

// Obtenir le statut d'un participant pour la réponse actuelle
const getParticipantStatus = (participantId) => {
  if (selectedParticipantId.value === participantId) {
    return 'selected'
  }
  return 'default'
}

// Compter combien de réponses ont été attribuées à ce participant POUR LA QUESTION ACTUELLE UNIQUEMENT
const getAttributedAnswersForCurrentQuestion = (participantId) => {
  const responses = gameStateStore.julieResponses[questionId.value] || {}

  // Compter combien de fois ce participant a été sélectionné pour cette question
  let count = 0
  Object.values(responses).forEach((selectedUserId) => {
    if (selectedUserId === participantId) {
      count++
    }
  })

  return count
}

// Sélectionner un participant
const selectParticipant = (participantId) => {
  selectedParticipantId.value = participantId

  // Sauvegarder la réponse de Julie
  gameStateStore.saveJulieResponse(questionId.value, currentAnswerIndex.value, participantId)

  // Passer automatiquement à la réponse suivante après un court délai
  setTimeout(() => {
    if (currentAnswerIndex.value < totalAnswers.value - 1) {
      goToNextAnswer()
    }
    // Ne plus naviguer automatiquement vers la validation
    // L'utilisateur doit cliquer sur le bouton "Voir les résultats"
  }, 300)
}

// Aller à la réponse suivante
const goToNextAnswer = () => {
  if (!hasSelectedParticipant.value) return

  currentAnswerIndex.value++
  selectedParticipantId.value = null

  // Charger la réponse précédemment sélectionnée si elle existe
  const savedResponse = gameStateStore.getJulieResponseForAnswer(
    questionId.value,
    currentAnswerIndex.value,
  )
  if (savedResponse) {
    selectedParticipantId.value = savedResponse
  }
}

// Aller à la validation
const goToValidation = () => {
  if (!hasSelectedParticipant.value) return

  router.push(`/question/${questionId.value}/validate`)
}

// Vérifier si le média est valide (pour éviter d'afficher le MediaPlayer si le média est null ou une string vide)
const isValidMedia = (media) => {
  if (!media) return false
  if (typeof media === 'string' && media.trim() === '') return false
  // Pour la question 8, vérifier si c'est un chemin de fichier et pas juste du texte
  if (questionId.value === '8' && typeof media === 'string') {
    // Si ça contient une extension de fichier, c'est un média valide
    const hasImageExtension = /\.(jpg|jpeg|png|gif|webp)$/i.test(media)
    return hasImageExtension
  }
  return true
}

// Vérifier si on doit afficher le placeholder "Pas de photo"
const shouldShowPhotoPlaceholder = () => {
  // Questions qui devraient avoir des photos/médias :
  // Q2 (films), Q3 (séries), Q7 (célébrité), Q8 (doudou), Q11 (chanson), Q12 (chanson), Q13 (sibling), Q14 (childhood)
  const photoQuestions = ['2', '3', '7', '8', '11', '12', '13', '14']
  return photoQuestions.includes(questionId.value)
}

// Vérifier si on doit afficher le texte avec le média (dans le title du MediaPlayer)
const shouldShowTextWithMedia = () => {
  // Questions où le texte est important et doit être affiché dans le MediaPlayer title
  // Pour Q2, Q3 (films/séries avec titres), Q7, Q11, Q12 (avec descriptions)
  const textualMediaQuestions = ['2', '3', '7', '11', '12']
  return textualMediaQuestions.includes(questionId.value)
}

// Vérifier si on doit afficher le texte de la réponse en dessous du média
const shouldShowAnswerText = () => {
  // Questions où l'image seule suffit (pas besoin de répéter le texte)
  const imageOnlyQuestions = ['13', '14'] // Frère/sœur, enfance

  if (imageOnlyQuestions.includes(questionId.value)) {
    return false
  }

  // Si pas de média ni medias, toujours afficher le texte
  if (!currentAnswer.value || (!currentAnswer.value.media && !currentAnswer.value.medias)) {
    return true
  }

  // Pour toutes les autres questions (incluant Q8), afficher le texte en dessous
  return true
}

// Obtenir le type de média
const getMediaType = (mediaPath) => {
  if (!mediaPath) return 'image'
  const ext = mediaPath.split('.').pop().toLowerCase()
  return ['mp4', 'webm', 'ogg'].includes(ext) ? 'video' : 'image'
}

// Obtenir le chemin du média
const getMediaPath = (mediaPath) => {
  if (!mediaPath) return ''
  // Si c'est déjà un chemin absolu, le retourner tel quel
  if (mediaPath.startsWith('/') || mediaPath.startsWith('http')) {
    return mediaPath
  }

  // Vérifier si le fichier a déjà une extension
  const hasExtension = /\.(jpg|jpeg|png|gif|webp|mp4|webm|ogg)$/i.test(mediaPath)

  // Déterminer le sous-dossier en fonction du type de question
  // SEULEMENT pour les questions 2 (films) et 3 (séries)
  let folder = ''
  if (questionId.value === '2') {
    folder = 'films/'
  } else if (questionId.value === '3') {
    folder = 'series/'
  }
  // Pour toutes les autres questions (8, 13, 14, etc.), pas de sous-dossier

  // Si le fichier a déjà une extension, l'utiliser tel quel
  let finalPath
  if (hasExtension) {
    finalPath = `${folder}${mediaPath}`
  } else {
    // Si pas d'extension, c'est forcément pour les films/séries (questions 2 et 3)
    // Liste des fichiers qui sont en .webp (basé sur votre dossier)
    const webpFiles = [
      'the_holiday',
      'monstres_et_cie',
      'bodyguard',
      'douleur_et_gloire',
      'entretien_avec_un_vampire',
      'forrest_gump',
      'jurassic_park',
      'premier_jour_reste_vie',
      'pretty_woman',
      'un_homme_ideal',
      'baron_noir',
      'bridgerton',
      'charmed',
      'desperate_housewives',
      'dr_house',
      'house_of_cards',
      'les_freres_scott',
      'lost',
      'mentalist',
      'pretty_little_liars',
      'urgences',
    ]

    const ext = webpFiles.includes(mediaPath) ? 'webp' : 'jpg'
    finalPath = `${folder}${mediaPath}.${ext}`
  }

  // Ajouter le préfixe /pictures/
  return `/pictures/${finalPath}`
}

// Obtenir le chemin de la photo du participant
const getParticipantPhotoPath = (photoPath) => {
  if (!photoPath) return ''
  if (photoPath.startsWith('/') || photoPath.startsWith('http')) {
    return photoPath
  }
  return `/pictures/${photoPath}`
}

// Surveiller les changements de question
watch(questionId, () => {
  loadAnswers()
})

// Surveiller le chargement des participants
watch(
  participants,
  (newParticipants) => {
    if (newParticipants && newParticipants.length > 0 && shuffledAnswers.value.length === 0) {
      loadAnswers()
    }
  },
  { immediate: true },
)

onMounted(() => {
  loadAnswers()
})
</script>

<style scoped>
.question-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
}

/* Header */
.question-header {
  text-align: center;
  margin-bottom: 3rem;
  animation: fadeIn 0.6s ease-in;
}

.question-number {
  font-size: 2rem;
  color: var(--color-white);
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.question-text {
  font-size: 1.8rem;
  color: var(--color-white);
  margin-bottom: 1.5rem;
  font-weight: 500;
}

.progress-bar {
  width: 100%;
  max-width: 600px;
  height: 12px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  margin: 0 auto;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-success), var(--color-secondary));
  border-radius: 20px;
  transition: width 0.5s ease;
}

/* Section réponse */
.answer-section {
  margin-bottom: 3rem;
  animation: slideIn 0.5s ease-out;
}

.answer-card {
  background: var(--color-white);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  max-width: 800px;
  margin: 0 auto;
}

.answer-label {
  font-size: 1rem;
  color: var(--color-secondary);
  font-weight: 600;
  margin-bottom: 1.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Plusieurs médias (films/séries) */
.multiple-medias {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin: 1.5rem 0;
}

.media-item {
  display: flex;
  flex-direction: column;
}

/* Message "Pas de photo" */
.no-photo-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  background: rgba(255, 255, 255, 0.05);
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  margin: 1rem 0;
  min-height: 200px;
}

.no-photo-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.6;
  filter: grayscale(100%);
}

.no-photo-text {
  font-size: 1.3rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  font-style: italic;
  margin: 0;
}

.answer-text-container {
  margin-top: 1.5rem;
}

.answer-text {
  font-size: 1.5rem;
  color: var(--color-dark);
  font-weight: 600;
  text-align: center;
  line-height: 1.6;
}

.answer-text.multiple-answers {
  white-space: pre-line;
  text-align: left;
  padding: 1rem 2rem;
  background-color: rgba(103, 126, 234, 0.05);
  border-radius: 12px;
  line-height: 2;
}

/* Section participants */
.participants-section {
  margin-bottom: 3rem;
}

.participants-title {
  font-size: 1.5rem;
  color: var(--color-white);
  text-align: center;
  margin-bottom: 2rem;
  font-weight: 600;
}

.participants-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.participant-card {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  transition: transform 0.2s ease;
}

.participant-card:hover {
  transform: scale(1.05);
}

/* Indicateur de réponses attribuées */
.attributed-count {
  margin-top: 0.5rem;
}

.count-badge {
  display: inline-block;
  background-color: var(--color-secondary);
  color: var(--color-white);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  text-transform: lowercase;
}

/* Message de chargement */
.loading-section {
  text-align: center;
  padding: 3rem;
  margin-bottom: 3rem;
}

.loading-text {
  font-size: 1.3rem;
  color: var(--color-white);
  font-weight: 500;
  animation: pulse 1.5s ease-in-out infinite;
}

/* Bouton de validation */
.validation-button {
  display: flex;
  justify-content: center;
  margin-top: 3rem;
  animation: fadeIn 0.5s ease-in;
}

/* Navigation */
.navigation-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .question-view {
    padding: 1rem;
  }

  .question-number {
    font-size: 1.5rem;
  }

  .question-text {
    font-size: 1.3rem;
  }

  .answer-card {
    padding: 1.5rem;
  }

  .answer-text {
    font-size: 1.2rem;
  }

  .participants-grid {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 1rem;
  }

  /* Adapter les multiples médias pour mobile */
  .multiple-medias {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .multiple-medias {
    grid-template-columns: 1fr;
  }
}
</style>
