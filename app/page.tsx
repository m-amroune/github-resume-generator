import SearchForm from "@/components/SearchForm";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6">
      <h1 className="text-3xl font-semibold"> GitHub Resume Generator</h1>
      <SearchForm />
    </main>
  );
}
