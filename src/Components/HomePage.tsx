"use client";
import { FaArrowRight } from "react-icons/fa";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function HomePage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError("Prompt cannot be empty.");
      return;
    }
    router.push(`/chat?prompt=${encodeURIComponent(prompt)}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#181A20] px-4">
      <main className="w-full max-w-xl bg-[#20232A] bg-opacity-80 backdrop-blur-lg border border-[#23272F] rounded-2xl shadow-2xl py-12 px-8 flex flex-col items-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 select-none">
          What do you want to build?
        </h1>
        <p className="text-gray-400 text-base mb-8 text-center max-w-md select-none">
          Create powerful, beautiful websites by describing your vision below.
        </p>
        <form className="w-full" onSubmit={handleSubmit} autoComplete="off">
          <div className="relative">
            <textarea
              rows={5}
              placeholder="Describe your idea…"
              value={prompt}
              onChange={handleInputChange}
              className={`w-full px-6 py-4 pr-16 rounded-lg bg-[#23272F] text-white text-base border outline-none transition
                ${error
                  ? "border-red-500 focus:border-red-400"
                  : "border-[#30343B] focus:border-cyan-500"}
                placeholder:text-gray-500 shadow 
                focus:ring-2 focus:ring-cyan-600/30`}
              aria-invalid={!!error}
              aria-describedby={error ? "prompt-error" : undefined}
              maxLength={300}
            />
            <button
              type="submit"
              aria-label="Submit Prompt"
              className="absolute top-1/2 -translate-y-1/2 right-4 bg-gradient-to-br from-cyan-500 to-blue-700 rounded-full p-3 shadow-md text-white
                hover:from-indigo-500 hover:to-cyan-400 focus:ring-2 focus:ring-cyan-400/40 transition-all duration-200 active:scale-95"
            >
              <FaArrowRight size={18} />
            </button>
          </div>
          <div
            id="prompt-error"
            className={`mt-3 text-sm font-medium text-red-400 transition-opacity duration-300 ${error ? "opacity-100" : "opacity-0"}`}
            aria-live="polite"
          >
            {error}
          </div>
        </form>
      </main>
      <footer className="absolute bottom-4 left-0 right-0 text-center text-gray-500 text-xs select-none">
        &copy; {new Date().getFullYear()} Your Brand. All rights reserved.
      </footer>
    </div>
  );
}
