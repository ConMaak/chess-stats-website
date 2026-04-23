function SearchForm({ username, setUsername, handleSubmit }) {
  return (
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
  )
}

export default SearchForm