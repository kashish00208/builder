"use client";

import React, { useState } from "react";
import { Montserrat } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const montserrat = Montserrat({ subsets: ["latin"], weight: "800" });

const NavBar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0f0f0f]/95 backdrop-blur-md border-b border-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        <Link href="/" className={`text-3xl font-extrabold tracking-wide text-white ${montserrat.className}`}>
          Builder<span className="text-purple-500">.ai</span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="https://github.com/kashish00208/boult"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 px-5 py-2 bg-purple-700 text-white font-medium rounded-full transition duration-300 hover:bg-purple-600 hover:shadow-lg"
          >
            <span>Star on GitHub</span>
            <Image
              src="/github.webp"
              width={22}
              height={22}
              className="rounded-full"
              alt="GitHub icon"
            />
          </Link>
        </nav>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle mobile menu"
        >
          {mobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden px-6 pb-4 pt-2 bg-[#111]/95 border-t border-gray-800">
          <Link
            href="https://github.com/kashish00208/boult"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center w-full py-3 bg-purple-700 text-white rounded-full font-semibold hover:bg-purple-600 transition-all"
          >
            Star on GitHub
          </Link>
        </div>
      )}
    </header>
  );
};

export default NavBar;
