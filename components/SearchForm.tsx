"use client";
import { useState } from "react";

type Props = {
  onSubmit: (username: string) => void;
  disabled?: boolean;
};

export default function SearchForm({ onSubmit, disabled }: Props) {
  const [username, setUsername] = useState("");

  return (
    <form
      className="flex items-center justify-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
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
    </form>
  );
}
