import { useState } from 'react'

function formatDateTime(isoString) {
  if (!isoString) return 'N/A'

  const date = new Date(isoString)

  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatDuration(seconds){
  if (seconds == null) return 'N/A'

  const mins = Math.floor(seconds/60)
  const secs = seconds % 60

  return `${mins}m ${secs}s`
}

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
  const playerResponse = await fetch(`http://127.0.0.1:8000/api/player/${normalizedUsername}/`)

  if (!playerResponse.ok) {
    throw new Error('Player not found')
  }

  const playerJson = await playerResponse.json()
  setPlayerData(playerJson)

  const gamesResponse = await fetch(`http://127.0.0.1:8000/api/player/${normalizedUsername}/recent-games/`)

  if (!gamesResponse.ok) {
    throw new Error('Could not load recent games')
  }

  const gamesJson = await gamesResponse.json()
  setRecentGames(gamesJson.recent_games)
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
            Frontend for your Chess.com analytics dashboard
          </p>
        </header>

        <main className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">Player Search</h2>
          <p className="mt-2 text-slate-600">
            Enter a Chess.com username to load dashboard data.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 flex gap-3">
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Enter username"
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-slate-500"
            />
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
            >
              Search
            </button>
          </form>

          {loading && (
            <p className="mt-6 text-slate-600">Loading player data...</p>
          )}

          {error && (
            <p className="mt-6 text-red-600">{error}</p>
          )}

          {playerData && (
            <div className="mt-6 rounded-lg bg-slate-50 p-4">
              <h3 className="text-xl font-semibold">Player Summary</h3>

              <div className="mt-4 space-y-2">
                <p><strong>Username:</strong> {playerData.username_display || playerData.username_normalized}</p>
                <p><strong>Display Name:</strong> {playerData.display_name || 'N/A'}</p>
                <p><strong>Blitz:</strong> {playerData.current_rating_blitz ?? 'N/A'}</p>
                <p><strong>Rapid:</strong> {playerData.current_rating_rapid ?? 'N/A'}</p>
                <p><strong>Bullet:</strong> {playerData.current_rating_bullet ?? 'N/A'}</p>
                <p><strong>Total Games:</strong> {playerData.total_games}</p>
                <p><strong>Last Game Time:</strong> {formatDateTime(playerData.last_game_time)}</p>
              </div>
            </div>
          )}

          {playerData && (
            <div className="mt-6 rounded-lg bg-slate-50 p-4">
              <h3 className="text-xl font-semibold">Recent Games</h3>

              {recentGames.length > 0 ? (
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-300">
                        <th className="px-3 py-2">End Time</th>
                        <th className="px-3 py-2">Time Class</th>
                        <th className="px-3 py-2">Color</th>
                        <th className="px-3 py-2">Opponent</th>
                        <th className="px-3 py-2">Opponent Rating</th>
                        <th className="px-3 py-2">Result</th>
                        <th className="px-3 py-2">Rating After</th>
                        <th className="px-3 py-2">Duration (sec)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentGames.map((game) => (
                        <tr key={game.game_id} className="border-b border-slate-200">
                          <td className="px-3 py-2">{formatDateTime(game.end_time)}</td>
                          <td className="px-3 py-2">{game.time_class || 'N/A'}</td>
                          <td className="px-3 py-2">{game.played_as_color || 'N/A'}</td>
                          <td className="px-3 py-2">{game.opponent_username || 'N/A'}</td>
                          <td className="px-3 py-2">{game.opponent_rating ?? 'N/A'}</td>
                          <td className="px-3 py-2">{game.result || 'N/A'}</td>
                          <td className="px-3 py-2">{game.rating_after_game ?? 'N/A'}</td>
                          <td className="px-3 py-2">{formatDuration(game.duration_seconds)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="mt-4 text-slate-600">No recent games found.</p>
              )}
            </div>
          )}
          
        </main>
      </div>
    </div>
  )
}

export default App