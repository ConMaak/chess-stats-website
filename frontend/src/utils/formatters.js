export function formatDateTime(isoString) {
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

export function formatDuration(seconds) {
  if (seconds == null) return 'N/A'

  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60

  return `${mins}m ${secs}s`
}