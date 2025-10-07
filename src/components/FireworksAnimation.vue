<template>
  <transition name="fireworks">
    <div v-if="show" class="fireworks-container">
      <div class="firework" v-for="i in 6" :key="i" :style="getFireworkStyle(i)"></div>
    </div>
  </transition>
</template>

<script setup>
import { watch, onMounted } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  duration: {
    type: Number,
    default: 3000,
  },
})

const emit = defineEmits(['complete'])

const getFireworkStyle = (index) => {
  const angle = (360 / 6) * index
  return {
    '--angle': `${angle}deg`,
    '--delay': `${index * 0.1}s`,
  }
}

watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      setTimeout(() => {
        emit('complete')
      }, props.duration)
    }
  },
)
</script>

<style scoped>
.fireworks-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 9999;
  overflow: hidden;
}

.firework {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  animation: explode 1s ease-out var(--delay, 0s) infinite;
}

.firework:nth-child(1) {
  background: var(--rainbow-1);
}
.firework:nth-child(2) {
  background: var(--rainbow-2);
}
.firework:nth-child(3) {
  background: var(--rainbow-3);
}
.firework:nth-child(4) {
  background: var(--rainbow-4);
}
.firework:nth-child(5) {
  background: var(--rainbow-5);
}
.firework:nth-child(6) {
  background: var(--rainbow-6);
}

@keyframes explode {
  0% {
    transform: translate(-50%, -50%) rotate(var(--angle)) translateX(0) scale(1);
    opacity: 1;
  }
  50% {
    transform: translate(-50%, -50%) rotate(var(--angle)) translateX(200px) scale(1.5);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) rotate(var(--angle)) translateX(400px) scale(0);
    opacity: 0;
  }
}

.fireworks-enter-active {
  animation: fadeIn 0.3s ease-in;
}

.fireworks-leave-active {
  animation: fadeOut 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
</style>
