<template>
  <div class="home-view">
    <FireworksAnimation :show="showFireworks" :duration="3000" @complete="onFireworksComplete" />

    <div class="content" :class="{ 'fade-out': showFireworks }">
      <div class="photo-container">
        <img src="/pictures/julie_profile.jpg" alt="Photo principale" class="main-photo" />
      </div>

      <div class="button-container">
        <AppButton label="Guess Who 🦄" size="large" :rainbow="true" @click="startGame" />

        <!-- Bouton de réinitialisation si une partie est en cours -->
        <button v-if="hasGameInProgress" @click="resetGame" class="reset-button">
          🔄 Recommencer une nouvelle partie
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AppButton from '../components/AppButton.vue'
import FireworksAnimation from '../components/FireworksAnimation.vue'
import { useGameStateStore } from '../stores/gameState'

const router = useRouter()
const gameStateStore = useGameStateStore()
const showFireworks = ref(false)

// Vérifier s'il y a une partie en cours
const hasGameInProgress = ref(false)

// Au montage, vérifier si des données existent
if (Object.keys(gameStateStore.julieResponses).length > 0) {
  hasGameInProgress.value = true
}

const startGame = () => {
  showFireworks.value = true
}

const resetGame = () => {
  if (
    confirm(
      'Êtes-vous sûr(e) de vouloir recommencer une nouvelle partie ? Toutes les réponses seront effacées.',
    )
  ) {
    gameStateStore.resetGame()
    hasGameInProgress.value = false
    alert('Le jeu a été réinitialisé ! Vous pouvez commencer une nouvelle partie.')
  }
}

const onFireworksComplete = () => {
  // Navigation vers la première question après les feux d'artifice
  router.push('/question/1')
}
</script>

<style scoped>
.home-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;
  animation: fadeIn 0.8s ease-in;
  transition: all 0.3s ease-out;
}

.content.fade-out {
  opacity: 0;
  transform: scale(0.9);
}

.photo-container {
  position: relative;
  animation: float 3s ease-in-out infinite;
}

.main-photo {
  width: 300px;
  height: 300px;
  border-radius: 50%;
  object-fit: cover;
  border: 8px solid var(--color-white);
  box-shadow:
    0 10px 40px rgba(0, 0, 0, 0.2),
    0 0 0 15px rgba(255, 255, 255, 0.1);
  transition: transform 0.3s ease;
}

.main-photo:hover {
  transform: scale(1.05) rotate(2deg);
}

.button-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  animation: pulse 2s ease-in-out infinite;
}

.reset-button {
  padding: 0.75rem 1.5rem;
  background: rgba(234, 32, 39, 0.9);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(234, 32, 39, 0.3);
}

.reset-button:hover {
  background: rgba(234, 32, 39, 1);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(234, 32, 39, 0.4);
}

.reset-button:active {
  transform: translateY(0);
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .home-view {
    padding: 1rem;
  }

  .content {
    gap: 2rem;
  }

  .main-photo {
    width: 200px;
    height: 200px;
    border-width: 6px;
  }
}

@media (max-width: 480px) {
  .main-photo {
    width: 150px;
    height: 150px;
    border-width: 4px;
  }
}
</style>
