function RecentGamesTable({ recentGames, formatDateTime, formatDuration }) {
  return (
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
                <th className="px-3 py-2">Duration</th>
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
  )
}

export default RecentGamesTable