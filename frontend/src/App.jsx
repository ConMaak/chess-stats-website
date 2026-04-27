import { useState } from 'react'
import SearchForm from './components/SearchForm'
import PlayerSummary from './components/PlayerSummary'
import RecentGamesTable from './components/RecentGamesTable'
import { fetchPlayerDashboard, refreshPlayerData } from './api/chessApi'
import { formatDateTime, formatDuration } from './utils/formatters'

function App() {
  const [username, setUsername] = useState('')
  const [playerData, setPlayerData] = useState(null)
  const [recentGames, setRecentGames] = useState([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshMessage, setRefreshMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function normalizeUsername(username) {
  return username.trim().toLowerCase()
  }

  async function loadDashboard(normalizedUsername) {
    const data = await fetchPlayerDashboard(normalizedUsername)
    setPlayerData(data.player)
    setRecentGames(data.recentGames)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const normalizedUsername = normalizeUsername(username)

    if (!normalizedUsername) {
      return
    }

    setLoading(true)
    setError('')
    setPlayerData(null)
    setRecentGames([])

    try {
      await loadDashboard(normalizedUsername)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleRefreshData() {
    const normalizedUsername = normalizeUsername(username)

    if (!username.trim()) return

    setIsRefreshing(true)
    setRefreshMessage('')
    setError('')

    try {
      const result = await refreshPlayerData(normalizedUsername)
      await loadDashboard(normalizedUsername)

      setRefreshMessage(
        `Refresh complete. Inserted ${result.stats.games_inserted} new games.`
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setIsRefreshing(false)
    }
}

return (
  <div className="min-h-screen bg-[#0f1720] text-slate-100">
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-10">
        <p className="text-sm font-semibold uppercase tracking-widest text-green-400">
          Chess.com Analytics
        </p>
        <h1 className="mt-2 text-5xl font-bold tracking-tight">
          Chess Tracker
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-slate-400">
          Search a Chess.com player and explore their ratings, recent games, and activity.
        </p>
      </header>

      <main className="rounded-3xl border border-slate-700 bg-slate-900/80 p-6 shadow-2xl">
        <h2 className="text-2xl font-semibold">Player Search</h2>
        <p className="mt-2 text-slate-400">
          Enter a Chess.com username to load dashboard data.
        </p>

        <SearchForm
          username={username}
          setUsername={setUsername}
          handleSubmit={handleSubmit}
        />

        {loading && (
          <p className="mt-6 text-slate-400">Loading player data...</p>
        )}

        {error && (
          <p className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300">
            {error}
          </p>
        )}

        {playerData && (
          <PlayerSummary
            playerData={playerData}
            formatDateTime={formatDateTime}
            onRefreshData={handleRefreshData}
            isRefreshing={isRefreshing}
          />
        )}

{refreshMessage && (
  <p className="mt-3 text-sm text-green-300">{refreshMessage}</p>
)}

        {playerData && (
          <RecentGamesTable
            recentGames={recentGames}
            formatDateTime={formatDateTime}
            formatDuration={formatDuration}
          />
        )}
      </main>
    </div>
  </div>
)
}

export default App