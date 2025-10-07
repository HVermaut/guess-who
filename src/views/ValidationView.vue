<template>
  <div class="validation-view">
    <div class="container">
      <!-- Header -->
      <div class="validation-header">
        <h1 class="title">Question {{ questionId }}</h1>
        <h2 class="question-text">{{ currentQuestion?.text }}</h2>
        <div class="score-summary">
          <span class="score-correct">✅ {{ correctCount }} bonnes réponses</span>
          <span class="score-incorrect">❌ {{ incorrectCount }} erreurs</span>
        </div>
      </div>

      <!-- Liste des résultats -->
      <div class="results-list" v-if="validationResults.length > 0">
        <div
          v-for="(result, index) in validationResults"
          :key="index"
          class="result-item"
          :class="{ correct: result.isCorrect, incorrect: !result.isCorrect }"
        >
          <div class="result-header">
            <span class="result-number">Réponse {{ index + 1 }}</span>
            <span class="result-icon">{{ result.isCorrect ? '✅' : '❌' }}</span>
          </div>

          <div class="result-content">
            <!-- Réponse -->
            <div class="answer-display">
              <p class="answer-text" :class="{ 'multiple-answers': result.answer.isMultiple }">
                {{ result.answer.text }}
              </p>
            </div>

            <!-- Comparaison des participants -->
            <div class="comparison">
              <!-- Réponse de Julie -->
              <div class="participant-choice julie-choice">
                <p class="choice-label">Votre choix :</p>
                <ParticipantPhoto
                  :src="getParticipantPhotoPath(result.julieParticipant?.photos?.profile)"
                  :name="result.julieParticipant?.name || 'Non répondu'"
                  :status="result.isCorrect ? 'correct' : 'incorrect'"
                  :clickable="false"
                />
              </div>

              <!-- Bonne réponse (si différente) -->
              <div class="participant-choice correct-choice" v-if="!result.isCorrect">
                <p class="choice-label">Bonne réponse :</p>
                <ParticipantPhoto
                  :src="getParticipantPhotoPath(result.correctParticipant?.photos?.profile)"
                  :name="result.correctParticipant?.name"
                  :status="'correct'"
                  :clickable="false"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Message de chargement -->
      <div v-else class="loading-section">
        <p class="loading-text">Validation en cours...</p>
      </div>

      <!-- Boutons de navigation -->
      <div class="navigation-buttons">
        <AppButton
          v-if="hasNextQuestion"
          label="Question suivante ➡️"
          size="medium"
          :rainbow="true"
          @click="goToNextQuestion"
        />
        <AppButton
          v-else
          label="Voir les résultats finaux 🏆"
          size="large"
          :rainbow="true"
          @click="goToResults"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuestionsStore } from '../stores/questions'
import { useParticipantsStore } from '../stores/participants'
import { useGameStateStore } from '../stores/gameState'
import AppButton from '../components/AppButton.vue'
import ParticipantPhoto from '../components/ParticipantPhoto.vue'

const route = useRoute()
const router = useRouter()
const questionsStore = useQuestionsStore()
const participantsStore = useParticipantsStore()
const gameStateStore = useGameStateStore()

const questionId = computed(() => route.params.id)
const currentQuestion = computed(() => questionsStore.getQuestionById(questionId.value))
const participants = computed(() => participantsStore.allParticipants)
const allQuestions = computed(() => questionsStore.allQuestions)

// Résultats de validation
const validationResults = ref([])
const correctCount = computed(() => validationResults.value.filter((r) => r.isCorrect).length)
const incorrectCount = computed(() => validationResults.value.filter((r) => !r.isCorrect).length)

// Navigation
const hasNextQuestion = computed(() => {
  const currentIndex = allQuestions.value.findIndex((q) => q.id === questionId.value)
  return currentIndex < allQuestions.value.length - 1
})

// Valider les réponses
const validateAnswers = () => {
  if (participants.value.length === 0) {
    console.log('Participants pas encore chargés')
    return
  }

  // IMPORTANT : Récupérer l'ordre mélangé EXACT utilisé dans QuestionView
  const shuffledAnswers = gameStateStore.getShuffledAnswers(questionId.value)

  if (!shuffledAnswers) {
    console.error('Ordre des réponses mélangées non trouvé pour la question', questionId.value)
    return
  }

  // Récupérer les réponses de Julie pour cette question
  const julieResponses = gameStateStore.julieResponses[questionId.value] || {}

  // Créer un dictionnaire des vraies réponses (basé sur l'ordre mélangé)
  const correctAnswersMap = {}
  shuffledAnswers.forEach((answer, index) => {
    correctAnswersMap[index] = answer.userId
  })

  // Comparer et créer les résultats
  const results = []
  shuffledAnswers.forEach((answer, index) => {
    const julieUserId = julieResponses[index]
    const correctUserId = answer.userId
    const isCorrect = julieUserId === correctUserId

    results.push({
      answer: answer,
      isCorrect: isCorrect,
      julieParticipant: participants.value.find((p) => p.id === julieUserId),
      correctParticipant: participants.value.find((p) => p.id === correctUserId),
    })
  })

  validationResults.value = results

  // Sauvegarder les résultats dans le store
  gameStateStore.validateAnswers(questionId.value, correctAnswersMap)
}

// Obtenir le chemin de la photo du participant
const getParticipantPhotoPath = (photoPath) => {
  if (!photoPath) return ''
  if (photoPath.startsWith('/') || photoPath.startsWith('http')) {
    return photoPath
  }
  return `/pictures/${photoPath}`
}

// Aller à la question suivante
const goToNextQuestion = () => {
  const currentIndex = allQuestions.value.findIndex((q) => q.id === questionId.value)
  if (currentIndex < allQuestions.value.length - 1) {
    const nextQuestion = allQuestions.value[currentIndex + 1]
    router.push(`/question/${nextQuestion.id}`)
  }
}

// Aller aux résultats finaux
const goToResults = () => {
  gameStateStore.completeGame()
  router.push('/results/intro')
}

onMounted(() => {
  validateAnswers()
})
</script>

<style scoped>
.validation-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  padding: 2rem;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
}

/* Header */
.validation-header {
  text-align: center;
  margin-bottom: 3rem;
  animation: fadeIn 0.6s ease-in;
}

.title {
  font-size: 2.5rem;
  color: var(--color-white);
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.question-text {
  font-size: 1.6rem;
  color: var(--color-white);
  margin-bottom: 1.5rem;
  font-weight: 500;
}

.score-summary {
  display: flex;
  justify-content: center;
  gap: 2rem;
  font-size: 1.3rem;
  font-weight: 600;
}

.score-correct {
  color: var(--color-white);
  background-color: rgba(196, 229, 56, 0.3);
  padding: 0.5rem 1.5rem;
  border-radius: 20px;
}

.score-incorrect {
  color: var(--color-white);
  background-color: rgba(234, 32, 39, 0.3);
  padding: 0.5rem 1.5rem;
  border-radius: 20px;
}

/* Liste des résultats */
.results-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.result-item {
  background: var(--color-white);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  animation: slideIn 0.5s ease-out;
  border-left: 8px solid transparent;
}

.result-item.correct {
  border-left-color: var(--color-success);
}

.result-item.incorrect {
  border-left-color: var(--color-error);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(0, 0, 0, 0.1);
}

.result-number {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-dark);
}

.result-icon {
  font-size: 1.8rem;
}

.result-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Affichage de la réponse */
.answer-display {
  background-color: rgba(48, 57, 82, 0.05);
  padding: 1rem 1.5rem;
  border-radius: 12px;
}

.answer-text {
  font-size: 1.3rem;
  color: var(--color-dark);
  font-weight: 600;
  text-align: center;
  margin: 0;
}

.answer-text.multiple-answers {
  white-space: pre-line;
  text-align: left;
  line-height: 1.8;
}

/* Comparaison des participants */
.comparison {
  display: flex;
  justify-content: center;
  gap: 3rem;
  flex-wrap: wrap;
}

.participant-choice {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.choice-label {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-dark);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.julie-choice .choice-label {
  color: var(--color-secondary);
}

.correct-choice .choice-label {
  color: var(--color-success);
}

/* Message de chargement */
.loading-section {
  text-align: center;
  padding: 3rem;
  margin-bottom: 3rem;
}

.loading-text {
  font-size: 1.5rem;
  color: var(--color-white);
  font-weight: 500;
  animation: pulse 1.5s ease-in-out infinite;
}

/* Navigation */
.navigation-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 3rem;
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

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .validation-view {
    padding: 1rem;
  }

  .title {
    font-size: 2rem;
  }

  .question-text {
    font-size: 1.3rem;
  }

  .score-summary {
    flex-direction: column;
    gap: 1rem;
  }

  .result-item {
    padding: 1.5rem;
  }

  .comparison {
    gap: 1.5rem;
  }

  .answer-text {
    font-size: 1.1rem;
  }
}
</style>
