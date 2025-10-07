import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useQuestionsStore = defineStore('questions', () => {
  // État
  const questions = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const allQuestions = computed(() => questions.value)
  const getQuestionById = computed(() => (id) => {
    return questions.value.find((q) => q.id === String(id))
  })
  const questionCount = computed(() => questions.value.length)
  const photoQuestions = computed(() => questions.value.filter((q) => q.type === 'photo'))
  const regularQuestions = computed(() => questions.value.filter((q) => q.type !== 'photo'))

  // Actions
  async function loadQuestions() {
    loading.value = true
    error.value = null

    try {
      const response = await fetch('/data.json')
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des questions')
      }

      const data = await response.json()
      questions.value = data.questions.map((q) => ({
        id: q.id,
        text: q.text,
        type: q.type || 'text',
      }))

      return questions.value
    } catch (e) {
      error.value = e.message
      console.error('Erreur chargement questions:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  function getAnswersForQuestion(questionId, participants) {
    const answers = []

    participants.forEach((participant) => {
      const answer = participant.answers?.[questionId]
      if (answer) {
        // Support pour les différents formats de réponses
        if (Array.isArray(answer)) {
          // Vérifier si c'est un tableau d'objets ou de strings
          if (answer.length > 0 && typeof answer[0] === 'object' && answer[0].label) {
            // Questions 2 et 3 (films/séries) - regrouper en une seule réponse avec plusieurs médias
            const combinedText = answer.map((item, idx) => `${idx + 1}. ${item.label}`).join('\n')
            const medias = answer.filter((item) => item.media).map((item) => item.media)

            answers.push({
              userId: participant.id,
              userName: participant.name,
              text: combinedText,
              media: null, // Pas de média unique
              medias: medias, // Tableau de tous les médias
              isMultiple: true,
            })
          } else {
            // Question 13 (siblings) - tableau de noms de fichiers
            // Regrouper toutes les photos en une seule réponse avec plusieurs médias
            answers.push({
              userId: participant.id,
              userName: participant.name,
              text: participant.name, // Nom du participant comme texte
              media: null, // Pas de média unique
              medias: answer, // Tableau de toutes les photos siblings
              isMultiple: true,
            })
          }
        } else if (typeof answer === 'object' && answer.label) {
          // Questions 7, 8, 11, 12 - objet {label, media}
          // Pour la question 8 (doudou), si media est vide, utiliser photos.doudou
          let mediaPath = answer.media
          if (questionId === '8' && (!mediaPath || mediaPath === '')) {
            const doudouPath = participant.photos?.doudou || null
            // Vérifier que photos.doudou n'est pas une string vide
            mediaPath = doudouPath && doudouPath.trim() !== '' ? doudouPath : null
          }

          answers.push({
            userId: participant.id,
            userName: participant.name,
            text: answer.label,
            media: mediaPath,
          })
        } else if (
          typeof answer === 'string' &&
          (answer.endsWith('.jpg') || answer.endsWith('.jpeg') || answer.endsWith('.png'))
        ) {
          // Question 14 (childhood) - nom de fichier direct
          answers.push({
            userId: participant.id,
            userName: participant.name,
            text: participant.name, // Nom du participant comme texte
            media: answer,
          })
        } else {
          // Questions texte simple
          answers.push({
            userId: participant.id,
            userName: participant.name,
            text: answer,
          })
        }
      }
    })

    return answers
  }

  function shuffleAnswers(answers) {
    const shuffled = [...answers]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  return {
    // State
    questions,
    loading,
    error,
    // Getters
    allQuestions,
    getQuestionById,
    questionCount,
    photoQuestions,
    regularQuestions,
    // Actions
    loadQuestions,
    getAnswersForQuestion,
    shuffleAnswers,
  }
})
