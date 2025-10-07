<template>
  <div :class="['participant-photo', statusClass, { clickable: clickable }]" @click="handleClick">
    <img :src="src" :alt="name" />
    <p class="participant-name">{{ name }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  src: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'selected', 'correct', 'incorrect'].includes(value),
  },
  clickable: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['select'])

const statusClass = computed(() => `status-${props.status}`)

const handleClick = () => {
  if (props.clickable) {
    emit('select')
  }
}
</script>

<style scoped>
.participant-photo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.participant-photo.clickable {
  cursor: pointer;
}

.participant-photo img {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 50%;
  border: 4px solid var(--border-default);
  transition: all 0.3s ease;
}

.participant-photo:hover.clickable img {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.participant-name {
  font-size: 0.9rem;
  font-weight: 600;
  text-align: center;
  color: var(--color-dark);
}

/* États */
.status-default img {
  border-color: var(--border-default);
}

.status-selected img {
  border-color: var(--border-selected);
  border-width: 6px;
  box-shadow: 0 0 15px var(--border-selected);
}

.status-correct img {
  border-color: var(--border-correct);
  border-width: 6px;
  box-shadow: 0 0 15px var(--border-correct);
}

.status-incorrect img {
  border-color: var(--border-incorrect);
  border-width: 6px;
  box-shadow: 0 0 15px var(--border-incorrect);
}

/* Responsive */
@media (max-width: 768px) {
  .participant-photo img {
    width: 80px;
    height: 80px;
  }

  .participant-name {
    font-size: 0.8rem;
  }
}
</style>
