import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useGameStateStore = defineStore('gameState', () => {
  // État
  const currentQuestionId = ref(1)
  const currentAnswerIndex = ref(0)
  const julieResponses = ref({}) // { questionId: { answerIndex: userId } }
  const shuffledAnswersOrder = ref({}) // { questionId: [answers array] } - Ordre mélangé des réponses
  const validationResults = ref({}) // { questionId: { answerIndex: { isCorrect: boolean, correctUserId: string } } }
  const isGameComplete = ref(false)

  // Getters
  const getCurrentQuestion = computed(() => currentQuestionId.value)
  const getCurrentAnswerIndex = computed(() => currentAnswerIndex.value)
  const getJulieResponseForAnswer = computed(() => (questionId, answerIndex) => {
    return julieResponses.value[questionId]?.[answerIndex] || null
  })

  // Actions
  function saveShuffledAnswers(questionId, answers) {
    shuffledAnswersOrder.value[questionId] = answers
    // Sauvegarder dans localStorage
    localStorage.setItem('shuffledAnswersOrder', JSON.stringify(shuffledAnswersOrder.value))
  }

  function getShuffledAnswers(questionId) {
    return shuffledAnswersOrder.value[questionId] || null
  }

  function saveJulieResponse(questionId, answerIndex, userId) {
    if (!julieResponses.value[questionId]) {
      julieResponses.value[questionId] = {}
    }
    julieResponses.value[questionId][answerIndex] = userId

    // Sauvegarder dans localStorage
    localStorage.setItem('julieResponses', JSON.stringify(julieResponses.value))
  }

  function goToNextAnswer() {
    currentAnswerIndex.value++
  }

  function goToNextQuestion() {
    currentQuestionId.value++
    currentAnswerIndex.value = 0
  }

  function goToQuestion(questionId) {
    currentQuestionId.value = questionId
    currentAnswerIndex.value = 0
  }

  function validateAnswers(questionId, correctAnswers) {
    const results = {}
    const julieAnswers = julieResponses.value[questionId] || {}

    Object.keys(julieAnswers).forEach((answerIndex) => {
      const julieUserId = julieAnswers[answerIndex]
      const correctUserId = correctAnswers[answerIndex]

      results[answerIndex] = {
        isCorrect: julieUserId === correctUserId,
        correctUserId: correctUserId,
      }
    })

    validationResults.value[questionId] = results
    localStorage.setItem('validationResults', JSON.stringify(validationResults.value))

    return results
  }

  function calculateScores(users) {
    const scores = {}

    users.forEach((user) => {
      scores[user.id] = {
        correct: 0,
        total: 0,
        percentage: 0,
      }
    })

    Object.values(validationResults.value).forEach((questionResults) => {
      Object.values(questionResults).forEach((result) => {
        if (result.correctUserId) {
          scores[result.correctUserId].total++
          if (result.isCorrect) {
            scores[result.correctUserId].correct++
          }
        }
      })
    })

    Object.keys(scores).forEach((userId) => {
      const score = scores[userId]
      score.percentage = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0
    })

    return scores
  }

  function completeGame() {
    isGameComplete.value = true
    localStorage.setItem('isGameComplete', 'true')
  }

  function resetGame() {
    currentQuestionId.value = 1
    currentAnswerIndex.value = 0
    julieResponses.value = {}
    shuffledAnswersOrder.value = {}
    validationResults.value = {}
    isGameComplete.value = false

    localStorage.removeItem('julieResponses')
    localStorage.removeItem('shuffledAnswersOrder')
    localStorage.removeItem('validationResults')
    localStorage.removeItem('isGameComplete')
  }

  function loadGameState() {
    const savedResponses = localStorage.getItem('julieResponses')
    const savedShuffled = localStorage.getItem('shuffledAnswersOrder')
    const savedValidations = localStorage.getItem('validationResults')
    const savedComplete = localStorage.getItem('isGameComplete')

    if (savedResponses) {
      julieResponses.value = JSON.parse(savedResponses)
    }
    if (savedShuffled) {
      shuffledAnswersOrder.value = JSON.parse(savedShuffled)
    }
    if (savedValidations) {
      validationResults.value = JSON.parse(savedValidations)
    }
    if (savedComplete) {
      isGameComplete.value = savedComplete === 'true'
    }
  }

  return {
    // State
    currentQuestionId,
    currentAnswerIndex,
    julieResponses,
    shuffledAnswersOrder,
    validationResults,
    isGameComplete,
    // Getters
    getCurrentQuestion,
    getCurrentAnswerIndex,
    getJulieResponseForAnswer,
    // Actions
    saveShuffledAnswers,
    getShuffledAnswers,
    saveJulieResponse,
    goToNextAnswer,
    goToNextQuestion,
    goToQuestion,
    validateAnswers,
    calculateScores,
    completeGame,
    resetGame,
    loadGameState,
  }
})
