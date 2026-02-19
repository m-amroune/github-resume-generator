"use client";
import SearchForm from "@/components/SearchForm";

function handleGenerate(username: string) {
  console.log("PAGE RECEIVED:", username);
}

export default function Home() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center gap-6">
      <h1 className="text-3xl font-semibold"> GitHub Resume Generator</h1>
      <SearchForm onSubmit={handleGenerate} />
    </main>
  );
}
