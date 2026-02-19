"use client";
import { useState } from "react";

export default function SearchForm() {
  const [username, setUsername] = useState("");

  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        console.log(username);
      }}
    >
      <input
        placeholder="GitHub username"
        className="border px-3 py-2 rounded"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button className="border px-3 py-2 rounded">Generate</button>
    </form>
  );
}
