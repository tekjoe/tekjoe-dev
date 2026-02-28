"use client";

import Link from "next/link";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";

const navLinks = [
  { href: "#work", label: "Work" },
  { href: "/about", label: "About" },
  { href: "#contact", label: "Contact" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-vhs-bg/95 backdrop-blur-md border-b border-border"
            : ""
        }`}
      >
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* VHS Logo Badge */}
          <Link href="/" className="group relative">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2"
            >
              <div className="relative px-3 py-1 border-2 border-vhs-yellow bg-vhs-yellow/10">
                <span className="font-display text-xl font-bold tracking-tight text-vhs-yellow">
                  tekjoe
                </span>
              </div>
              <span className="hidden sm:block font-mono text-[10px] uppercase tracking-[0.2em] text-vhs-gray">
                Web Dev
              </span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <ul className="flex items-center gap-8">
              {navLinks.map((link, index) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <Link
                    href={link.href}
                    className="relative font-mono text-xs uppercase tracking-[0.2em] text-vhs-gray hover:text-vhs-yellow transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2"
            aria-label="Toggle menu"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <motion.span
                animate={
                  isMenuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }
                }
                className="block h-0.5 w-full bg-vhs-yellow origin-left"
              />
              <motion.span
                animate={isMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                className="block h-0.5 w-full bg-vhs-yellow"
              />
              <motion.span
                animate={
                  isMenuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }
                }
                className="block h-0.5 w-full bg-vhs-yellow origin-left"
              />
            </div>
          </button>
        </nav>
      </motion.header>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={isMenuOpen ? { x: 0 } : { x: "100%" }}
        transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
        className="fixed inset-0 z-40 bg-vhs-bg md:hidden"
      >
        <div className="flex flex-col items-center justify-center h-full gap-8">
          {navLinks.map((link, index) => (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, x: 50 }}
              animate={
                isMenuOpen ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }
              }
              transition={{ delay: 0.1 + index * 0.1 }}
            >
              <Link
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="text-4xl font-display font-bold uppercase tracking-tight text-vhs-white hover:text-vhs-yellow transition-colors"
              >
                {link.label}
              </Link>
            </motion.div>
          ))}
        </div>
        {/* Color band at bottom of mobile menu */}
        <div className="absolute bottom-0 left-0 right-0 vhs-color-band" />
      </motion.div>
    </>
  );
}
