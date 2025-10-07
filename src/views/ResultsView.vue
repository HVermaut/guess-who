<template>
  <div class="results-view">
    <div class="container">
      <h1 class="title">🏆 Résultats Finaux 🏆</h1>

      <div class="podium">
        <!-- 2ème place -->
        <div v-if="sortedParticipants[1]" class="podium-item second">
          <div class="rank-badge">2</div>
          <div class="participant-photo-wrapper">
            <img
              :src="`/pictures/${sortedParticipants[1].photos.profile}`"
              :alt="sortedParticipants[1].name"
              class="participant-photo"
            />
          </div>
          <h3 class="participant-name">{{ sortedParticipants[1].name }}</h3>
          <div class="score-info">
            <div class="percentage">{{ sortedParticipants[1].score.percentage }}%</div>
            <div class="score-detail">
              {{ sortedParticipants[1].score.correct }}/{{ sortedParticipants[1].score.total }}
              bonnes réponses
            </div>
          </div>
        </div>

        <!-- 1ère place -->
        <div v-if="sortedParticipants[0]" class="podium-item first">
          <div class="rank-badge gold">1</div>
          <div class="participant-photo-wrapper">
            <img
              :src="`/pictures/${sortedParticipants[0].photos.profile}`"
              :alt="sortedParticipants[0].name"
              class="participant-photo"
            />
          </div>
          <h3 class="participant-name">{{ sortedParticipants[0].name }}</h3>
          <div class="score-info">
            <div class="percentage">{{ sortedParticipants[0].score.percentage }}%</div>
            <div class="score-detail">
              {{ sortedParticipants[0].score.correct }}/{{ sortedParticipants[0].score.total }}
              bonnes réponses
            </div>
          </div>
        </div>

        <!-- 3ème place -->
        <div v-if="sortedParticipants[2]" class="podium-item third">
          <div class="rank-badge">3</div>
          <div class="participant-photo-wrapper">
            <img
              :src="`/pictures/${sortedParticipants[2].photos.profile}`"
              :alt="sortedParticipants[2].name"
              class="participant-photo"
            />
          </div>
          <h3 class="participant-name">{{ sortedParticipants[2].name }}</h3>
          <div class="score-info">
            <div class="percentage">{{ sortedParticipants[2].score.percentage }}%</div>
            <div class="score-detail">
              {{ sortedParticipants[2].score.correct }}/{{ sortedParticipants[2].score.total }}
              bonnes réponses
            </div>
          </div>
        </div>
      </div>

      <!-- Classement complet -->
      <div class="full-ranking">
        <h2 class="ranking-title">Classement complet</h2>
        <div class="ranking-list">
          <div
            v-for="(participant, index) in sortedParticipants"
            :key="participant.id"
            class="ranking-item"
            :class="{ 'top-three': index < 3 }"
          >
            <div class="rank">{{ index + 1 }}</div>
            <img
              :src="`/pictures/${participant.photos.profile}`"
              :alt="participant.name"
              class="ranking-photo"
            />
            <div class="ranking-info">
              <div class="ranking-name">{{ participant.name }}</div>
              <div class="ranking-score">
                {{ participant.score.correct }}/{{ participant.score.total }} ({{
                  participant.score.percentage
                }}%)
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions d'export -->
      <div class="export-section">
        <h2 class="export-title">📤 Partager les résultats</h2>
        <div class="export-buttons">
          <button @click="handleCopyToClipboard" class="export-btn copy-btn" :disabled="copying">
            <span v-if="!copied">📋 Copier</span>
            <span v-else>✅ Copié !</span>
          </button>
          <button @click="handleExportJSON" class="export-btn json-btn">📄 JSON</button>
          <button @click="handleExportCSV" class="export-btn csv-btn">📊 CSV</button>
          <button v-if="canShare" @click="handleShare" class="export-btn share-btn">
            🔗 Partager
          </button>
        </div>
      </div>

      <!-- Bouton recommencer -->
      <div class="actions">
        <AppButton label="🔄 Recommencer le jeu" @click="restartGame" class="restart-button" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStateStore } from '@/stores/gameState'
import { useParticipantsStore } from '@/stores/participants'
import AppButton from '@/components/AppButton.vue'
import { exportToJSON, exportToCSV, copyToClipboard, shareResults } from '@/utils/exportResults'

const router = useRouter()
const gameState = useGameStateStore()
const participantsStore = useParticipantsStore()

// États pour l'export
const copied = ref(false)
const copying = ref(false)
const canShare = ref(false)

const sortedParticipants = computed(() => {
  const participants = participantsStore.allParticipants
  const scores = gameState.calculateScores(participants)

  return participants
    .map((participant) => ({
      ...participant,
      score: scores[participant.id] || { correct: 0, total: 0, percentage: 0 },
    }))
    .sort((a, b) => {
      // Tri par pourcentage décroissant
      if (b.score.percentage !== a.score.percentage) {
        return b.score.percentage - a.score.percentage
      }
      // En cas d'égalité, tri par nombre de bonnes réponses
      return b.score.correct - a.score.correct
    })
})

onMounted(async () => {
  // S'assurer que les participants sont chargés
  if (participantsStore.participantCount === 0) {
    await participantsStore.loadParticipants()
  }

  // Vérifier si le partage est supporté
  canShare.value = navigator.share !== undefined
})

function restartGame() {
  gameState.resetGame()
  router.push('/')
}

// Fonctions d'export
async function handleCopyToClipboard() {
  copying.value = true
  const success = await copyToClipboard(
    participantsStore.allParticipants,
    gameState.calculateScores(participantsStore.allParticipants),
    gameState.validationResults,
  )

  if (success) {
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }
  copying.value = false
}

function handleExportJSON() {
  exportToJSON(
    participantsStore.allParticipants,
    gameState.calculateScores(participantsStore.allParticipants),
    gameState.validationResults,
  )
}

function handleExportCSV() {
  exportToCSV(
    participantsStore.allParticipants,
    gameState.calculateScores(participantsStore.allParticipants),
    gameState.validationResults,
  )
}

async function handleShare() {
  await shareResults(
    participantsStore.allParticipants,
    gameState.calculateScores(participantsStore.allParticipants),
    gameState.validationResults,
  )
}
</script>

<style scoped>
.results-view {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  padding: 3rem 2rem;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.title {
  font-size: 3rem;
  color: white;
  text-align: center;
  margin-bottom: 3rem;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
  animation: fadeIn 0.6s ease-out;
}

/* Podium */
.podium {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 2rem;
  margin-bottom: 4rem;
  animation: slideIn 0.8s ease-out 0.2s backwards;
}

.podium-item {
  background: white;
  border-radius: 20px;
  padding: 2rem 1.5rem;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
  position: relative;
}

.podium-item:hover {
  transform: translateY(-10px);
}

.podium-item.first {
  order: 2;
  width: 280px;
  padding-top: 3rem;
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  animation: pulse 2s ease-in-out infinite;
}

.podium-item.second {
  order: 1;
  width: 240px;
  background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
}

.podium-item.third {
  order: 3;
  width: 240px;
  background: linear-gradient(135deg, #cd7f32 0%, #e9a66e 100%);
}

.rank-badge {
  position: absolute;
  top: -15px;
  right: 50%;
  transform: translateX(50%);
  width: 50px;
  height: 50px;
  background: var(--color-accent);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.rank-badge.gold {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #333;
  width: 60px;
  height: 60px;
  font-size: 2rem;
  border: 3px solid white;
}

.participant-photo-wrapper {
  margin-bottom: 1rem;
}

.participant-photo {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid white;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.first .participant-photo {
  width: 150px;
  height: 150px;
  border-width: 5px;
}

.participant-name {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.first .participant-name {
  font-size: 2rem;
  font-weight: bold;
}

.score-info {
  margin-top: 1rem;
}

.percentage {
  font-size: 2rem;
  font-weight: bold;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.first .percentage {
  font-size: 2.5rem;
}

.score-detail {
  font-size: 1rem;
  color: #666;
}

/* Classement complet */
.full-ranking {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  animation: slideIn 0.8s ease-out 0.4s backwards;
}

.ranking-title {
  font-size: 2rem;
  color: var(--color-primary);
  margin-bottom: 1.5rem;
  text-align: center;
}

.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ranking-item {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.ranking-item:hover {
  background: #e9ecef;
  transform: translateX(10px);
}

.ranking-item.top-three {
  background: linear-gradient(90deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%);
  border-left: 4px solid var(--color-accent);
}

.rank {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--color-primary);
  min-width: 40px;
  text-align: center;
}

.ranking-photo {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.ranking-info {
  flex: 1;
}

.ranking-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.25rem;
}

.ranking-score {
  font-size: 1rem;
  color: #666;
}

/* Export Section */
.export-section {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  animation: slideIn 0.8s ease-out 0.5s backwards;
}

.export-title {
  font-size: 1.5rem;
  color: var(--color-primary);
  margin-bottom: 1.5rem;
  text-align: center;
}

.export-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.export-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.export-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.export-btn:active:not(:disabled) {
  transform: translateY(-1px);
}

.export-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.copy-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.json-btn {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.csv-btn {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.share-btn {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
}

/* Actions */
.actions {
  text-align: center;
  animation: fadeIn 0.8s ease-out 0.6s backwards;
}

.restart-button {
  font-size: 1.2rem;
  padding: 1rem 2rem;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .title {
    font-size: 2rem;
  }

  .podium {
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }

  .podium-item {
    width: 100% !important;
    max-width: 300px;
  }

  .podium-item.first,
  .podium-item.second,
  .podium-item.third {
    order: 0;
  }

  .ranking-item {
    gap: 1rem;
  }

  .rank {
    min-width: 30px;
    font-size: 1.2rem;
  }

  .ranking-photo {
    width: 50px;
    height: 50px;
  }

  .ranking-name {
    font-size: 1rem;
  }

  .ranking-score {
    font-size: 0.9rem;
  }

  .export-section {
    padding: 1.5rem;
  }

  .export-title {
    font-size: 1.2rem;
  }

  .export-buttons {
    gap: 0.75rem;
  }

  .export-btn {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
    flex: 1;
    min-width: 120px;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .results-view {
    padding: 1.5rem 1rem;
  }

  .title {
    font-size: 1.5rem;
  }

  .podium-item {
    max-width: 250px;
    padding: 1.5rem 1rem;
  }

  .participant-photo {
    width: 100px !important;
    height: 100px !important;
  }

  .first .participant-photo {
    width: 120px !important;
    height: 120px !important;
  }

  .participant-name {
    font-size: 1.2rem !important;
  }

  .first .participant-name {
    font-size: 1.5rem !important;
  }

  .percentage {
    font-size: 1.5rem !important;
  }

  .first .percentage {
    font-size: 2rem !important;
  }

  .export-buttons {
    flex-direction: column;
  }

  .export-btn {
    width: 100%;
    min-width: auto;
  }

  .full-ranking {
    padding: 1.5rem;
  }

  .ranking-title {
    font-size: 1.5rem;
  }
}
</style>
