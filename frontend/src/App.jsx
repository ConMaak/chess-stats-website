import { useState } from 'react'
import SearchForm from './components/SearchForm'
import PlayerSummary from './components/PlayerSummary'
import RecentGamesTable from './components/RecentGamesTable'
import { fetchPlayerDashboard } from './api/chessApi'
import { formatDateTime, formatDuration } from './utils/formatters'

function App() {
  const [username, setUsername] = useState('')
  const [playerData, setPlayerData] = useState(null)
  const [recentGames, setRecentGames] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    const normalizedUsername = username.trim().toLowerCase()

    if (!normalizedUsername) {
      return
    }

    setLoading(true)
    setError('')
    setPlayerData(null)
    setRecentGames([])

    try {
      const data = await fetchPlayerDashboard(normalizedUsername)

      setPlayerData(data.player)
      setRecentGames(data.recentGames)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="mb-8">
          <h1 className="text-4xl font-bold">Chess Tracker</h1>
          <p className="mt-2 text-lg text-slate-600">
          </p>
        </header>

        <main className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">Player Search</h2>
          <p className="mt-2 text-slate-600">
            Enter a Chess.com username to load dashboard data.
          </p>

          <SearchForm
            username={username}
            setUsername={setUsername}
            handleSubmit={handleSubmit}
          />

          {loading && (
            <p className="mt-6 text-slate-600">Loading player data...</p>
          )}

          {error && (
            <p className="mt-6 text-red-600">{error}</p>
          )}

          {playerData && (
            <PlayerSummary
              playerData={playerData}
              formatDateTime={formatDateTime}
            />
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