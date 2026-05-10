"use client";
import { useState } from "react";

type SearchFormProps = {
  onSubmit: (username: string) => void;
  disabled: boolean;
};

const SearchForm: React.FC<SearchFormProps> = ({ onSubmit, disabled }) => {
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);

  //  username validation
  const isValidUsername = (value: string) => {
    if (!value.trim()) return false; // empty
    if (/\s/.test(value)) return false; // spaces
    if (!/^[a-zA-Z0-9-]+$/.test(value)) return false; // invalid chars
    return true;
  };

  return (
    <form
      className="flex items-center justify-center gap-2"
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
        placeholder="GitHub username"
        className="border px-3 py-2 rounded"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <button disabled={disabled} className="border px-3 py-2 rounded">
        Generate
      </button>

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </form>
  );
};

export default SearchForm;
