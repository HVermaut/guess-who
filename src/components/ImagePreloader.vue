<template>
  <div class="preloader" v-if="loading">
    <div class="preloader-content">
      <div class="spinner-large"></div>
      <p class="preloader-text">Chargement des images...</p>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
      </div>
      <p class="progress-text">{{ loadedCount }} / {{ totalCount }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  images: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['loaded'])

const loading = ref(true)
const loadedCount = ref(0)
const totalCount = ref(0)
const progress = ref(0)

onMounted(() => {
  preloadImages()
})

async function preloadImages() {
  if (!props.images || props.images.length === 0) {
    finishLoading()
    return
  }

  totalCount.value = props.images.length
  let loaded = 0

  const promises = props.images.map((src) => {
    return new Promise((resolve) => {
      const img = new Image()

      img.onload = () => {
        loaded++
        loadedCount.value = loaded
        progress.value = (loaded / totalCount.value) * 100
        resolve()
      }

      img.onerror = () => {
        console.warn(`Échec du chargement de l'image: ${src}`)
        loaded++
        loadedCount.value = loaded
        progress.value = (loaded / totalCount.value) * 100
        resolve()
      }

      img.src = src
    })
  })

  await Promise.all(promises)

  // Petit délai pour une transition fluide
  setTimeout(() => {
    finishLoading()
  }, 300)
}

function finishLoading() {
  loading.value = false
  emit('loaded')
}
</script>

<style scoped>
.preloader {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease-in-out;
}

.preloader-content {
  text-align: center;
  color: white;
  max-width: 400px;
  padding: 2rem;
}

.spinner-large {
  width: 60px;
  height: 60px;
  border: 6px solid rgba(255, 255, 255, 0.2);
  border-left-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 2rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.preloader-text {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.progress-fill {
  height: 100%;
  background: white;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 1rem;
  opacity: 0.9;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
