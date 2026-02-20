"use client";
import SearchForm from "@/components/SearchForm";

async function handleGenerate(username: string) {
  const res = await fetch(`https://api.github.com/users/${username}`);

  if (!res.ok) {
    console.log("User not found");
    return;
  }

  const data = await res.json();

  console.log(data);
}

export default function Home() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center gap-6">
      <h1 className="text-3xl font-semibold"> GitHub Resume Generator</h1>
      <SearchForm onSubmit={handleGenerate} />
    </main>
  );
}
