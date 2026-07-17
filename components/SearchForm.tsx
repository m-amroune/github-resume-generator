"use client";
import { useState } from "react";

type SearchFormProps = {
  onSubmit: (username: string) => void;
  disabled: boolean;
};

const SearchForm: React.FC<SearchFormProps> = ({ onSubmit, disabled }) => {
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);

  // advanced GitHub username validation
  const isValidUsername = (value: string) => {
    const v = value.trim();

    if (!v) return false; // empty
    if (/\s/.test(v)) return false; // spaces
    if (!/^[a-zA-Z0-9-]+$/.test(v)) return false; // invalid chars

    if (v.startsWith("-")) return false; // cannot start with -
    if (v.endsWith("-")) return false; // cannot end with -
    if (v.includes("--")) return false; // no consecutive --

    if (v.length > 39) return false; // GitHub max length

    return true;
  };

  return (
    <form
      className="mx-auto flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:flex-wrap"
      onSubmit={(e) => {
        e.preventDefault();

        // validate before submitting
        if (!isValidUsername(username)) {
          setError("Invalid username");
          return;
        }

        setError(null);
        onSubmit(username);
      }}
    >
      <input
        placeholder="Enter a GitHub username..."
        className="w-full rounded-lg border border-white/20 bg-white px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-[#e07a5f] sm:flex-1"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <button
        disabled={disabled}
        className="rounded-lg bg-[#f4c95d] px-5 py-3 font-medium text-[#24324a] cursor-pointer transition hover:bg-[#e5b84c] disabled:cursor-not-allowed disabled:opacity-50"
      >
        Generate resume
      </button>

      {error && <p className="w-full text-sm text-red-200">{error}</p>}
    </form>
  );
};

export default SearchForm;
