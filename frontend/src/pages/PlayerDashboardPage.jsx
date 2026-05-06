import { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import SearchForm from '../components/SearchForm'
import PlayerSummary from '../components/PlayerSummary'
import RecentGamesTable from '../components/RecentGamesTable'
import { fetchPlayerDashboard, syncPlayerData, syncPlayerProfile } from '../api/chessApi'
import { formatDateTime, formatDuration } from '../utils/formatters'

function PlayerDashboardPage() {
  const navigate = useNavigate()
  const { username: usernameFromUrl } = useParams()

  const [username, setUsername] = useState(usernameFromUrl || '')
  const [playerData, setPlayerData] = useState(null)
  const [recentGames, setRecentGames] = useState([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshMessage, setRefreshMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [syncStatus, setSyncStatus] = useState('idle')

  const activeRequestRef = useRef(null)

  function normalizeUsername(username) {
    return username.trim().toLowerCase()
  }

  async function loadDashboard(normalizedUsername, signal) {
    const data = await fetchPlayerDashboard(normalizedUsername, signal)
    setPlayerData(data.player)
    setRecentGames(data.recentGames)
  }

  async function loadAndSyncPlayer(normalizedUsername, signal) {
    if (!normalizedUsername) return

    setError('')
    setRefreshMessage('')
    setLoading(true)
    setIsRefreshing(false)
    setSyncStatus['loading-profile']

    try {
      try {
        await loadDashboard(normalizedUsername, signal)
        setLoading(false)
        setSyncStatus('updating-existing')
      } catch {const profile = await syncPlayerProfile(normalizedUsername, signal)

      setPlayerData(profile)
      setRecentGames([])
      setLoading(false)
      setSyncStatus('syncing-games')
      }

      setIsRefreshing(true)

      const result = await syncPlayerData(normalizedUsername, signal)

      await loadDashboard(normalizedUsername, signal)

      const minutesRemaining = Math.ceil(result.cooldown_seconds_remaining / 60)

      setRefreshMessage(
        result.skipped
          ? `Data was synced recently. Try again in ${minutesRemaining} minute${minutesRemaining === 1 ? '' : 's'}.`
          : result.stats.games_inserted > 0
            ? `Data updated. Inserted ${result.stats.games_inserted} new games.`
            : 'No new games to import.'
      )
    } catch (err) {
      setError(err.message)
    } finally {
      if (!signal.aborted) {
      setLoading(false)
      setIsRefreshing(false)
      setSyncStatus('idle')
      }
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const normalizedUsername = normalizeUsername(username)

    if (!normalizedUsername) return

    navigate(`/player/${normalizedUsername}`)
  }

  async function handleSyncData() {
    const normalizedUsername = normalizeUsername(username)

    if (!normalizedUsername) return

    setIsRefreshing(true)
    setRefreshMessage('')
    setError('')
    setSyncStatus('updating-existing')

    try {
      const result = await syncPlayerData(normalizedUsername)

      await loadDashboard(normalizedUsername)

      const minutesRemaining = Math.ceil(result.cooldown_seconds_remaining / 60)

      setRefreshMessage(
        result.skipped
          ? `Data was synced recently. Try again in ${minutesRemaining} minute${minutesRemaining === 1 ? '' : 's'}.`
          : result.stats.games_inserted > 0
            ? `Data updated. Inserted ${result.stats.games_inserted} new games.`
            : 'No new games to import.'
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setIsRefreshing(false)
      setSyncStatus('idle')
    }
  }

  useEffect(() => {
  if (!usernameFromUrl) return

  if (activeRequestRef.current){
    activeRequestRef.current.abort()
  }

  const controller = new AbortController()
  activeRequestRef.current = controller

  const normalizedUsername = normalizeUsername(usernameFromUrl)

  setUsername(normalizedUsername)
  loadAndSyncPlayer(normalizedUsername, controller.signal)

  return () => {
    controller.abort()
  }

}, [usernameFromUrl])

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

          {syncStatus !== 'idle' && (
            <p className="mt-6 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-green-300">
              {syncStatus === 'loading-profile' && 'Loading player profile from Chess.com...'}
              {syncStatus === 'syncing-games' && 'Importing games for this player...'}
              {syncStatus === 'updating-existing' && 'Checking for new games...'}
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