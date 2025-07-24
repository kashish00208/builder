import React from "react";
import { Montserrat } from "next/font/google";
import Image from "next/image";

const montserrat = Montserrat({ subsets: ["latin"], weight: "800" });

const NavBar = () => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm shadow-md border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
        <div
          className={`text-2xl font-extrabold tracking-wide text-white ${montserrat.className}`}
        >
          Builder<span className="text-purple-400">.ai</span>
        </div>
        <a
          href="https://github.com/kashish00208/boult"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-5 py-2 bg-purple-700 text-white font-semibold rounded-full hover:bg-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          <p>Star on GitHub</p>
          <Image
            src="/github.webp"
            width={28}
            height={28}
            className="rounded-full"
            alt="GitHub icon"
          />
        </a>
      </div>
    </div>
  );
};

export default NavBar;
