function RecentGamesTable({ recentGames, formatDateTime, formatDuration }) {
  return (
    <section className="mt-8 rounded-2xl border border-slate-700 bg-slate-950/70 p-6">
      <div className="mb-4">
        <p className="text-sm font-semibold uppercase tracking-widest text-green-400">
          Recent Activity
        </p>
        <h3 className="mt-1 text-2xl font-bold">Recent Games</h3>
      </div>

      {recentGames.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-slate-700">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="bg-slate-900 text-slate-300">
              <tr>
                <th className="px-4 py-3">End Time</th>
                <th className="px-4 py-3">Time Class</th>
                <th className="px-4 py-3">Color</th>
                <th className="px-4 py-3">Opponent</th>
                <th className="px-4 py-3">Opponent Rating</th>
                <th className="px-4 py-3">Result</th>
                <th className="px-4 py-3">Rating After</th>
                <th className="px-4 py-3">Duration</th>
              </tr>
            </thead>
            <tbody>
              {recentGames.map((game) => (
                <tr
                  key={game.game_id}
                  className="border-t border-slate-800 transition hover:bg-slate-900/70"
                >
                  <td className="px-4 py-3 text-slate-300">{formatDateTime(game.end_time)}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-300">
                      {game.time_class || 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{game.played_as_color || 'N/A'}</td>
                  <td className="px-4 py-3 font-medium text-slate-100">{game.opponent_username || 'N/A'}</td>
                  <td className="px-4 py-3 text-slate-300">{game.opponent_rating ?? 'N/A'}</td>
                  <td className="px-4 py-3"><ResultBadge result={game.result} /></td>
                  <td className="px-4 py-3 text-slate-300">{game.rating_after_game ?? 'N/A'}</td>
                  <td className="px-4 py-3 text-slate-300">{formatDuration(game.duration_seconds)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-4 text-slate-400">No recent games found.</p>
      )}
    </section>
  )
}

function ResultBadge({ result }) {
  const displayResult = getResultLabel(result)
  const resultType = getResultType(result)

  const classes = {
    win: 'bg-green-500/10 text-green-300 border-green-500/30',
    loss: 'bg-red-500/10 text-red-300 border-red-500/30',
    draw: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30',
    unknown: 'bg-slate-500/10 text-slate-300 border-slate-500/30',
  }

  return (
    <span
      className={`rounded-full border px-2 py-1 text-xs font-medium ${classes[resultType]}`}
    >
      {displayResult}
    </span>
  )
}

function getResultType(result) {
  if (!result) return 'unknown'

  if (result === 'win') return 'win'

  const drawResults = [
    'agreed',
    'repetition',
    'stalemate',
    'insufficient',
    '50move',
    'timevsinsufficient',
  ]

  if (drawResults.includes(result)) return 'draw'

  return 'loss'
}

function getResultLabel(result) {
  const labels = {
    win: 'Win',
    checkmated: 'Checkmated',
    resigned: 'Resigned',
    timeout: 'Timeout',
    abandoned: 'Abandoned',
    agreed: 'Draw',
    repetition: 'Draw',
    stalemate: 'Stalemate',
    insufficient: 'Draw',
    '50move': '50-move draw',
    timevsinsufficient: 'Draw',
  }

  return labels[result] || result || 'N/A'
}

export default RecentGamesTable