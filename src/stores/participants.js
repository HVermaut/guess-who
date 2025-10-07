import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useParticipantsStore = defineStore('participants', () => {
  // État
  const participants = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const allParticipants = computed(() => participants.value)
  const getParticipantById = computed(() => (id) => {
    return participants.value.find((p) => p.id === id)
  })
  const participantCount = computed(() => participants.value.length)

  // Actions
  async function loadParticipants() {
    loading.value = true
    error.value = null

    try {
      const response = await fetch('/data.json')
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des données')
      }

      const data = await response.json()

      // Transformer les données pour avoir un format cohérent
      participants.value = data.users.map((user) => ({
        id: user.id,
        name: user.name,
        photos: user.photos, // Garder l'objet photos complet
        answers: user.answers,
      }))

      return participants.value
    } catch (e) {
      error.value = e.message
      console.error('Erreur chargement participants:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  function getAnswerForQuestion(userId, questionId) {
    const participant = participants.value.find((p) => p.id === userId)
    return participant?.answers?.[questionId] || null
  }

  return {
    // State
    participants,
    loading,
    error,
    // Getters
    allParticipants,
    getParticipantById,
    participantCount,
    // Actions
    loadParticipants,
    getAnswerForQuestion,
  }
})
