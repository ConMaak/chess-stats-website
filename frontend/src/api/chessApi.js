const API_BASE_URL = 'http://127.0.0.1:8000/api'

export async function fetchPlayerDashboard(username) {
  const normalizedUsername = username.trim().toLowerCase()

  const [playerResponse, gamesResponse] = await Promise.all([
    fetch(`${API_BASE_URL}/player/${normalizedUsername}/`),
    fetch(`${API_BASE_URL}/player/${normalizedUsername}/recent-games/`),
  ])

  if (!playerResponse.ok) {
    throw new Error('Player not found')
  }

  if (!gamesResponse.ok) {
    throw new Error('Could not load recent games')
  }

  const [playerJson, gamesJson] = await Promise.all([
    playerResponse.json(),
    gamesResponse.json(),
  ])

  return {
    player: playerJson,
    recentGames: gamesJson.recent_games,
  }
}