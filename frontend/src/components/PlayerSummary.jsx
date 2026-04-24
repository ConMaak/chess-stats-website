function PlayerSummary({ playerData, formatDateTime }) {
  return (
    <div className="mt-6 rounded-lg bg-slate-50 p-4">
      <h3 className="text-xl font-semibold">Player Summary</h3>

      {playerData.profile_image && (
        <img
            src={playerData.profile_image}
            alt={`${playerData.username_display || playerData.username_normalized} profile`}
            className="mt-4 max-h-40 max-w-xs rounded-lg object-contain"
        />
        )}

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
  )
}

export default PlayerSummary