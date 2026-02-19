export default function SearchForm() {
  return (
    <form>
      <input
        placeholder="GitHub username"
        className="border px-3 py-2 rounded"
      />
      <button className="border px-3 py-2 rounded">Generate</button>
    </form>
  );
}
