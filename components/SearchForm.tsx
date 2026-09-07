"use client";
import { useState } from "react";
import { isValidUsername } from "@/utils/isValidUsername";
import { RefreshCw, Search } from "lucide-react";

type SearchFormProps = {
  onSubmit: (username: string) => void;
  disabled: boolean;
  variant?: "hero" | "compact";
  submitLabel?: string;
};

const SearchForm: React.FC<SearchFormProps> = ({
  onSubmit,
  disabled,
  variant = "hero",
  submitLabel = "Generate resume",
}) => {
  const isCompact = variant === "compact";
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className={
        isCompact
          ? "flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap"
          : "mx-auto flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:flex-wrap"
      }
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
      <div className="relative min-w-0 flex-1">
        {isCompact && (
          <Search
            size={17}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
        )}

        <input
          placeholder="Enter a GitHub username..."
          className={
            isCompact
              ? "w-full rounded-md border border-white/20 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-white/30"
              : "w-full rounded-md border border-white/20 bg-white px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-white/30"
          }
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <button
        disabled={disabled}
        className={
          isCompact
            ? "flex min-w-36 cursor-pointer items-center justify-center gap-2 rounded-md border border-white/50 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
            : "cursor-pointer rounded-md bg-[#1f3850] px-5 py-3 font-semibold text-white transition hover:bg-[#172d42] disabled:cursor-not-allowed disabled:opacity-50"
        }
      >
        {isCompact && <RefreshCw size={16} aria-hidden="true" />}
        {submitLabel}
      </button>

      {error && (
        <p
          className={`w-full text-sm ${
            isCompact ? "text-red-600" : "text-red-200"
          }`}
        >
          {error}
        </p>
      )}
    </form>
  );
};

export default SearchForm;
