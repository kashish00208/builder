"use client";

import React, { useState } from "react";
import { Montserrat } from "next/font/google";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { FaGithub } from "react-icons/fa";

const montserrat = Montserrat({ subsets: ["latin"], weight: "800" });

const NavBar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="absolute top-0 left-0 w-full bg-[#111] border-b border-gray-800">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-3">
        {/* Logo */}
        <Link
          href="/"
          className={`text-2xl font-extrabold text-white ${montserrat.className}`}
        >
          Builder
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-4">
          <Link
            href="https://github.com/kashish00208/boult"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-gray-400 transition-colors duration-200"
            aria-label="GitHub"
          >
            <FaGithub size={22} />
          </Link>
        </nav>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle mobile menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#111] border-t border-gray-800 px-6 py-2 flex flex-col gap-2">
          <Link
            href="https://github.com/kashish00208/boult"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-gray-400 text-center"
          >
            GitHub
          </Link>
        </div>
      )}
    </header>
  );
};

export default NavBar;
