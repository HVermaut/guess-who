<script setup>
import { onMounted } from 'vue'
import { useParticipantsStore } from './stores/participants'
import { useQuestionsStore } from './stores/questions'
import { useGameStateStore } from './stores/gameState'

const participantsStore = useParticipantsStore()
const questionsStore = useQuestionsStore()
const gameStateStore = useGameStateStore()

onMounted(async () => {
  // Charger les données au démarrage
  await Promise.all([participantsStore.loadParticipants(), questionsStore.loadQuestions()])

  // Restaurer l'état du jeu depuis localStorage
  gameStateStore.loadGameState()
})
</script>

<template>
  <div id="app">
    <RouterView />
  </div>
</template>

<style>
/* Styles globaux déjà importés via main.css */
</style>
