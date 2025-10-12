"use client";
import { FaArrowRight } from "react-icons/fa";
import { useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "./NavBar";

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
    <>
      <NavBar />
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#181A20] px-4">
        <main className="w-full max-w-xl bg-[#20232A] border border-[#23272F] rounded-2xl shadow-md py-12 px-8 flex flex-col items-center">
          <h1 className="text-3xl font-bold text-white mb-3 select-none text-center">
            What do you want to build?
          </h1>
          <p className="text-gray-400 text-base mb-8 text-center max-w-md select-none">
            Describe your idea below and create a website.
          </p>

          <form className="w-full" onSubmit={handleSubmit} autoComplete="off">
            <div className="relative">
              <textarea
                rows={5}
                placeholder="Describe your idea…"
                value={prompt}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 pr-14 rounded-lg bg-[#23272F] text-white text-base border outline-none transition
                  ${
                    error
                      ? "border-red-500 focus:border-red-400"
                      : "border-[#30343B] focus:border-cyan-500"
                  }
                  placeholder:text-gray-500 shadow-sm focus:ring-1 focus:ring-cyan-500/30`}
                aria-invalid={!!error}
                aria-describedby={error ? "prompt-error" : undefined}
                maxLength={300}
              />
              <button
                type="submit"
                aria-label="Submit Prompt"
                className="absolute top-1/2 -translate-y-1/2 right-3 bg-blue-600 rounded-full p-3 text-white hover:bg-blue-700 transition-colors duration-200 active:scale-95"
              >
                <FaArrowRight size={16} />
              </button>
            </div>
            <div
              id="prompt-error"
              className={`mt-2 text-sm text-red-400 transition-opacity duration-200 ${
                error ? "opacity-100" : "opacity-0"
              }`}
              aria-live="polite"
            >
              {error}
            </div>
          </form>
        </main>

        <footer className="mt-6 text-center text-gray-500 text-xs select-none">
          &copy; {new Date().getFullYear()} Your Brand. All rights reserved.
        </footer>
      </div>
    </>
  );
}
