"use client"
import { FaArrowRight } from "react-icons/fa";
import { useState } from "react";
import { useRouter } from "next/navigation";
                                                 
export function HomePage() {

  const router = useRouter();

  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) {
      setError("Prompt cannot be empty.");
      return;
    }
    router.push(`/chat?prompt=${encodeURIComponent(prompt)}`);

  };

  return (
    <div className="flex flex-col items-center justify-center px-4 mt-28 text-white">
      <div className="text-center max-w-xl mb-10">
        <h1 className="text-4xl font-semibold mb-4">What do you want to build?</h1>
        <p className="text-white text-sm">
          Create stunning and functional websites in minutes just by some prompts.
        </p>
      </div>

      <form className="w-full max-w-xl relative" onSubmit={handleSubmit}>
        <div className="relative">
          <textarea
            rows={5}
            placeholder="Describe your idea..."
            value={prompt}
            onChange={handleInputChange}
            className="w-full px-6 py-4 pr-14 rounded-xl border border-gray-700 shadow-sm focus:ring-2"
          />
          <button
            type="submit"
            className="absolute top-3 right-4 hover:text-blue-600 transition-colors"
          >
            <FaArrowRight size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}
