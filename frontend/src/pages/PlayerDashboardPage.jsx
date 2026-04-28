import { useState } from 'react'
import { useParams } from 'react-router-dom'
import SearchForm from '../components/SearchForm'
import PlayerSummary from '../components/PlayerSummary'
import RecentGamesTable from '../components/RecentGamesTable'
import { fetchPlayerDashboard, syncPlayerData } from '../api/chessApi'
import { formatDateTime, formatDuration } from '../utils/formatters'

function PlayerDashboardPage() {
  const { username: usernameFromUrl } = useParams()

  const [username, setUsername] = useState(usernameFromUrl || '')
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

  async function loadAndSyncPlayer(normalizedUsername) {
    if (!normalizedUsername) return

    setError('')
    setRefreshMessage('')
    setLoading(true)
    setIsRefreshing(false)

    try {
      try {
        await loadDashboard(normalizedUsername)
        setLoading(false)
      } catch {
        setPlayerData(null)
        setRecentGames([])
      }

      setIsRefreshing(true)

      const result = await syncPlayerData(normalizedUsername)

      await loadDashboard(normalizedUsername)

      setRefreshMessage(
        result.stats.games_inserted > 0
          ? `Data updated. Inserted ${result.stats.games_inserted} new games.`
          : 'Data is already up to date.'
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const normalizedUsername = normalizeUsername(username)

    if (!normalizedUsername) return

    await loadAndSyncPlayer(normalizedUsername)
  }

  async function handleSyncData() {
    const normalizedUsername = normalizeUsername(username)

    if (!normalizedUsername) return

    setIsRefreshing(true)
    setRefreshMessage('')
    setError('')

    try {
      const result = await syncPlayerData(normalizedUsername)

      await loadDashboard(normalizedUsername)

      setRefreshMessage(
        result.stats.games_inserted > 0
          ? `Data updated. Inserted ${result.stats.games_inserted} new games.`
          : 'Data is already up to date.'
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

          <SearchForm
            username={username}
            setUsername={setUsername}
            handleSubmit={handleSubmit}
          />

          {loading && !playerData && (
            <p className="mt-6 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-400">
              Importing player data from Chess.com...
            </p>
          )}

          {isRefreshing && playerData && (
            <p className="mt-6 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-green-300">
              Updating data from Chess.com...
            </p>
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
              onRefreshData={handleSyncData}
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

export default PlayerDashboardPage