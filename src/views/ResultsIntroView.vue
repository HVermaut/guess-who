<template>
  <div class="results-intro-view">
    <FireworksAnimation :show="showFireworks" />

    <div class="container">
      <div class="intro-content" :class="{ 'fade-in': !showFireworks }">
        <div class="photo-container">
          <img src="/pictures/julie_profile.jpg" alt="Julie" class="julie-photo" />
        </div>

        <h1 class="intro-title">C'est l'heure des résultats !</h1>
        <p class="intro-text">Découvrons ensemble qui Julie connaît le mieux...</p>

        <AppButton label="Voir les résultats 🏆" @click="goToResults" class="results-button" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import FireworksAnimation from '@/components/FireworksAnimation.vue'
import AppButton from '@/components/AppButton.vue'

const router = useRouter()
const showFireworks = ref(true)

onMounted(() => {
  setTimeout(() => {
    showFireworks.value = false
  }, 3000)
})

function goToResults() {
  router.push('/results')
}
</script>

<style scoped>
.results-intro-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.container {
  max-width: 600px;
  width: 100%;
  text-align: center;
}

.intro-content {
  opacity: 0;
  transition: opacity 0.8s ease-in-out;
}

.intro-content.fade-in {
  opacity: 1;
}

.photo-container {
  margin-bottom: 2rem;
  animation: slideIn 0.6s ease-out 0.2s backwards;
}

.julie-photo {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  object-fit: cover;
  border: 6px solid white;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.intro-title {
  font-size: 3rem;
  color: white;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.6s ease-out 0.4s backwards;
}

.intro-text {
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 3rem;
  line-height: 1.6;
  animation: slideIn 0.6s ease-out 0.6s backwards;
}

.results-button {
  animation: slideIn 0.6s ease-out 0.8s backwards;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .intro-title {
    font-size: 2rem;
  }

  .intro-text {
    font-size: 1.2rem;
  }

  .julie-photo {
    width: 150px;
    height: 150px;
  }
}
</style>
