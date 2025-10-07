<template>
  <div class="media-player">
    <div v-if="type === 'video'" class="video-container">
      <video
        ref="videoRef"
        :src="src"
        :autoplay="autoplay"
        @error="handleError"
        @loadstart="handleLoadStart"
        @loadeddata="handleLoaded"
        @play="handlePlay"
        @pause="handlePause"
        @ended="handleEnded"
        @timeupdate="handleTimeUpdate"
      >
        Votre navigateur ne supporte pas la lecture vidéo.
      </video>

      <!-- Contrôles personnalisés -->
      <div class="custom-controls" v-if="!error && loaded">
        <button
          class="control-btn play-pause"
          @click="togglePlayPause"
          :aria-label="isPlaying ? 'Pause' : 'Lecture'"
        >
          <span v-if="isPlaying">⏸️</span>
          <span v-else>▶️</span>
        </button>

        <div class="progress-container" @click="seek">
          <div class="progress-bar">
            <div class="progress-filled" :style="{ width: `${progress}%` }"></div>
          </div>
        </div>

        <div class="time-display">{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</div>

        <button
          class="control-btn volume-btn"
          @click="toggleMute"
          :aria-label="isMuted ? 'Réactiver le son' : 'Couper le son'"
        >
          <span v-if="isMuted">🔇</span>
          <span v-else>🔊</span>
        </button>
      </div>

      <p v-if="title" class="media-title">{{ title }}</p>
    </div>

    <div v-else-if="type === 'image'" class="image-container">
      <div class="image-wrapper" :class="{ loading: imageLoading }">
        <img :src="src" :alt="title" @error="handleError" @load="handleImageLoad" />
        <div v-if="imageLoading" class="image-loader">
          <div class="spinner"></div>
        </div>
      </div>
      <p v-if="title" class="media-title">{{ title }}</p>
    </div>

    <div v-if="error" class="error-message">
      ⚠️ Impossible de charger le média
      <button class="retry-btn" @click="retry">Réessayer</button>
    </div>

    <div v-if="loading && !error" class="loading-message">
      <div class="spinner"></div>
      <p>Chargement...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (value) => ['video', 'image'].includes(value),
  },
  src: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: '',
  },
  autoplay: {
    type: Boolean,
    default: false,
  },
})

const videoRef = ref(null)
const error = ref(false)
const loading = ref(true)
const loaded = ref(false)
const imageLoading = ref(true)

// États du lecteur vidéo
const isPlaying = ref(false)
const isMuted = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const progress = ref(0)

const handleError = () => {
  error.value = true
  loading.value = false
  console.error('Erreur de chargement du média:', props.src)
}

const handleLoadStart = () => {
  loading.value = true
  loaded.value = false
}

const handleLoaded = () => {
  loading.value = false
  loaded.value = true
  if (videoRef.value) {
    duration.value = videoRef.value.duration
  }
}

const handlePlay = () => {
  isPlaying.value = true
}

const handlePause = () => {
  isPlaying.value = false
}

const handleEnded = () => {
  isPlaying.value = false
  currentTime.value = 0
  progress.value = 0
}

const handleTimeUpdate = () => {
  if (videoRef.value) {
    currentTime.value = videoRef.value.currentTime
    duration.value = videoRef.value.duration
    progress.value = (currentTime.value / duration.value) * 100
  }
}

const handleImageLoad = () => {
  imageLoading.value = false
  loading.value = false
}

const togglePlayPause = () => {
  if (videoRef.value) {
    if (isPlaying.value) {
      videoRef.value.pause()
    } else {
      videoRef.value.play()
    }
  }
}

const toggleMute = () => {
  if (videoRef.value) {
    videoRef.value.muted = !videoRef.value.muted
    isMuted.value = videoRef.value.muted
  }
}

const seek = (event) => {
  if (videoRef.value) {
    const rect = event.currentTarget.getBoundingClientRect()
    const pos = (event.clientX - rect.left) / rect.width
    videoRef.value.currentTime = pos * duration.value
  }
}

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const retry = () => {
  error.value = false
  loading.value = true
  imageLoading.value = true

  if (videoRef.value) {
    videoRef.value.load()
  }
}

watch(
  () => props.src,
  () => {
    error.value = false
    loading.value = true
    loaded.value = false
    imageLoading.value = true
    currentTime.value = 0
    progress.value = 0

    if (videoRef.value) {
      videoRef.value.load()
    }
  },
)

onMounted(() => {
  if (props.type === 'video' && videoRef.value && props.autoplay) {
    videoRef.value.play().catch(() => {
      console.log('Autoplay bloqué par le navigateur')
    })
  }
})

onBeforeUnmount(() => {
  if (videoRef.value) {
    videoRef.value.pause()
  }
})
</script>

<style scoped>
.media-player {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.video-container,
.image-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

video {
  width: 100%;
  max-width: 100%;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

img {
  width: 100%;
  max-width: 100%;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  object-fit: cover;
}

.media-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-dark);
  text-align: center;
  margin: 0;
}

/* Image wrapper avec loader */
.image-wrapper {
  position: relative;
  width: 100%;
}

.image-wrapper.loading img {
  opacity: 0;
}

.image-loader {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* Contrôles personnalisés vidéo */
.custom-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(48, 57, 82, 0.95) 0%, rgba(48, 57, 82, 0.98) 100%);
  border-radius: 8px;
  width: 100%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.control-btn {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  transition: transform 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn:hover {
  transform: scale(1.1);
}

.control-btn:active {
  transform: scale(0.95);
}

.progress-container {
  flex: 1;
  cursor: pointer;
  padding: 0.5rem 0;
}

.progress-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  overflow: hidden;
  position: relative;
}

.progress-filled {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  border-radius: 3px;
  transition: width 0.1s linear;
}

.time-display {
  font-size: 0.9rem;
  color: white;
  font-weight: 500;
  min-width: 80px;
  text-align: center;
}

/* Messages d'erreur et chargement */
.error-message {
  color: var(--color-error);
  text-align: center;
  padding: 1.5rem;
  background-color: rgba(234, 32, 39, 0.1);
  border-radius: 8px;
  font-weight: 500;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.retry-btn {
  padding: 0.5rem 1rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background: var(--color-secondary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.loading-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  color: var(--color-dark);
}

.loading-message p {
  margin: 0;
  font-weight: 500;
}

/* Spinner */
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .media-player {
    max-width: 100%;
  }

  .media-title {
    font-size: 1rem;
  }

  .custom-controls {
    gap: 0.5rem;
    padding: 0.75rem;
  }

  .control-btn {
    font-size: 1.2rem;
    padding: 0.25rem;
  }

  .time-display {
    font-size: 0.8rem;
    min-width: 70px;
  }

  .progress-bar {
    height: 4px;
  }
}
</style>
