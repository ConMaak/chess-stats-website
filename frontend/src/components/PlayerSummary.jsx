function PlayerSummary({ playerData, formatDateTime, onRefreshData, isRefreshing, }) {
  const username = playerData.username_display || playerData.username_normalized

  return (
    <section className="mt-8 rounded-2xl border border-slate-700 bg-slate-950/70 p-6">
      <div className="flex flex-col gap-6 md:flex-row md:items-center">
        {playerData.profile_image && (
          <img
            src={playerData.profile_image}
            alt={`${username} profile`}
            className="max-h-40 max-w-xs rounded-2xl border border-slate-700 object-contain"
          />
        )}

        <div className="flex-1">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-green-400">
                Player Summary
              </p>
              <h3 className="mt-1 text-3xl font-bold">{username}</h3>
              <p className="mt-1 text-slate-400">
                {playerData.display_name || 'No display name'}
              </p>
            </div>

            <button
              onClick={onRefreshData}
              disabled={isRefreshing}
              className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Blitz" value={playerData.current_rating_blitz ?? 'N/A'} />
            <StatCard label="Rapid" value={playerData.current_rating_rapid ?? 'N/A'} />
            <StatCard label="Bullet" value={playerData.current_rating_bullet ?? 'N/A'} />
            <StatCard label="Total Games" value={playerData.total_games} />
          </div>

          <p className="mt-5 text-sm text-slate-400">
            <span className="font-medium text-slate-300">Last Updated:</span>{' '}
            {formatDateTime(playerData.last_games_sync_time)}
          </p>
        </div>
      </div>
    </section>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-4 text-center">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-100">{value}</p>
    </div>
  )
}

export default PlayerSummary