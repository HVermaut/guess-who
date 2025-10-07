<template>
  <button
    :class="['app-button', { rainbow: rainbow }, sizeClass]"
    :disabled="disabled"
    @click="handleClick"
  >
    {{ label }}
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value),
  },
  rainbow: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['click'])

const sizeClass = computed(() => `size-${props.size}`)

const handleClick = () => {
  if (!props.disabled) {
    emit('click')
  }
}
</script>

<style scoped>
.app-button {
  font-family: var(--font-heading);
  font-weight: 700;
  text-transform: uppercase;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: var(--color-primary);
  color: var(--color-white);
  padding: 1rem 2rem;
  font-size: 1.2rem;
}

.app-button:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.app-button:active {
  transform: scale(0.98);
}

/* Tailles */
.size-small {
  padding: 0.5rem 1rem;
  font-size: 1rem;
}

.size-medium {
  padding: 1rem 2rem;
  font-size: 1.2rem;
}

.size-large {
  padding: 1.5rem 3rem;
  font-size: 2rem;
  min-width: 600px;
  min-height: 200px;
}

/* Style arc-en-ciel */
.app-button.rainbow {
  background: linear-gradient(
    135deg,
    var(--rainbow-1) 0%,
    var(--rainbow-2) 16.66%,
    var(--rainbow-3) 33.33%,
    var(--rainbow-4) 50%,
    var(--rainbow-5) 66.66%,
    var(--rainbow-6) 83.33%,
    var(--rainbow-1) 100%
  );
  background-size: 200% 200%;
  animation: rainbowShift 3s ease infinite;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.app-button.rainbow:hover {
  animation: rainbowShift 1s ease infinite;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
}

@keyframes rainbowShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* Disabled state */
.app-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.app-button:disabled:hover {
  transform: none;
  box-shadow: none;
}

/* Responsive */
@media (max-width: 768px) {
  .size-large {
    min-width: 90%;
    min-height: 150px;
    font-size: 1.5rem;
    padding: 1rem 2rem;
  }
}
</style>
