function SearchForm({ username, setUsername, handleSubmit }) {
  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
      <input
        type="text"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        placeholder='Enter username (for example: "hikaru")'
        className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-green-400 focus:ring-2 focus:ring-green-400/20"
      />
      <button
        type="submit"
        className="rounded-xl bg-green-500 px-6 py-3 font-semibold text-white transition hover:bg-green-400 active:scale-[0.98]"
      >
        Search
      </button>
    </form>
)
}

export default SearchForm