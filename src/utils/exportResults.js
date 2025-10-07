/**
 * Utilitaire pour exporter les résultats du jeu
 */

/**
 * Formate les résultats pour l'export
 * @param {Array} participants - Liste des participants
 * @param {Object} scores - Scores calculés
 * @param {Object} validationResults - Résultats de validation
 * @returns {Object} - Résultats formatés
 */
export function formatResults(participants, scores, validationResults) {
  const sortedParticipants = participants
    .map((participant) => ({
      name: participant.name,
      score: scores[participant.id] || { correct: 0, total: 0, percentage: 0 },
    }))
    .sort((a, b) => {
      if (b.score.percentage !== a.score.percentage) {
        return b.score.percentage - a.score.percentage
      }
      return b.score.correct - a.score.correct
    })

  return {
    date: new Date().toISOString(),
    summary: {
      totalQuestions: Object.keys(validationResults).length,
      totalParticipants: participants.length,
    },
    ranking: sortedParticipants.map((p, index) => ({
      rank: index + 1,
      name: p.name,
      correct: p.score.correct,
      total: p.score.total,
      percentage: p.score.percentage,
    })),
    detailedResults: validationResults,
  }
}

/**
 * Exporte les résultats en JSON
 * @param {Array} participants - Liste des participants
 * @param {Object} scores - Scores calculés
 * @param {Object} validationResults - Résultats de validation
 */
export function exportToJSON(participants, scores, validationResults) {
  const results = formatResults(participants, scores, validationResults)
  const dataStr = JSON.stringify(results, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(dataBlob)

  const link = document.createElement('a')
  link.href = url
  link.download = `guess-who-results-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Exporte les résultats en CSV
 * @param {Array} participants - Liste des participants
 * @param {Object} scores - Scores calculés
 * @param {Object} validationResults - Résultats de validation
 */
export function exportToCSV(participants, scores, validationResults) {
  const results = formatResults(participants, scores, validationResults)

  // Header
  const header = 'Rang,Nom,Bonnes Réponses,Total,Pourcentage\n'

  // Lignes de données
  const rows = results.ranking
    .map((p) => `${p.rank},${p.name},${p.correct},${p.total},${p.percentage}%`)
    .join('\n')

  const csv = header + rows
  const csvBlob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(csvBlob)

  const link = document.createElement('a')
  link.href = url
  link.download = `guess-who-results-${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Copie les résultats dans le presse-papiers
 * @param {Array} participants - Liste des participants
 * @param {Object} scores - Scores calculés
 * @param {Object} validationResults - Résultats de validation
 */
export async function copyToClipboard(participants, scores, validationResults) {
  const results = formatResults(participants, scores, validationResults)

  let text = '🏆 Résultats Guess Who 🏆\n\n'
  text += `Date: ${new Date().toLocaleDateString('fr-FR')}\n`
  text += `Questions: ${results.summary.totalQuestions}\n`
  text += `Participants: ${results.summary.totalParticipants}\n\n`
  text += '=== CLASSEMENT ===\n\n'

  results.ranking.forEach((p) => {
    const medal = p.rank === 1 ? '🥇' : p.rank === 2 ? '🥈' : p.rank === 3 ? '🥉' : '  '
    text += `${medal} ${p.rank}. ${p.name}: ${p.correct}/${p.total} (${p.percentage}%)\n`
  })

  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Erreur lors de la copie:', err)
    return false
  }
}

/**
 * Partage les résultats (Web Share API)
 * @param {Array} participants - Liste des participants
 * @param {Object} scores - Scores calculés
 * @param {Object} validationResults - Résultats de validation
 */
export async function shareResults(participants, scores, validationResults) {
  if (!navigator.share) {
    console.log('Web Share API non supportée')
    return false
  }

  const results = formatResults(participants, scores, validationResults)

  let text = '🏆 Résultats Guess Who 🏆\n\n'
  text += 'Top 3:\n'

  results.ranking.slice(0, 3).forEach((p) => {
    const medal = p.rank === 1 ? '🥇' : p.rank === 2 ? '🥈' : '🥉'
    text += `${medal} ${p.name}: ${p.percentage}%\n`
  })

  try {
    await navigator.share({
      title: 'Résultats Guess Who',
      text: text,
    })
    return true
  } catch (err) {
    console.error('Erreur lors du partage:', err)
    return false
  }
}
