'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Menu, X, Zap } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '#' },
    { name: 'Our Impact', href: '#impact' },
    { name: 'Projects', href: '#projects' },
    { name: 'Transparency', href: '#transparency' },
    { name: 'About', href: '#about' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      {/* Glassmorphism Navbar */}
      <div className="relative bg-black/40 backdrop-blur-2xl border-b border-white/10">
        {/* Neon Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-emerald-500/5 to-teal-500/5" />

        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-20">

            {/* Logo with Neon Effect */}
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="relative">
                {/* Glowing Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
              </div>
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
                ImpactNet
              </span>
              {/* Powered Badge */}
              <div className="hidden lg:flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 border border-green-500/30">
                <Zap className="w-3 h-3 text-green-400" />
                <span className="text-[10px] text-green-400 font-semibold">LIVE</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="relative text-gray-300 hover:text-white font-medium transition-colors duration-200 group"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-green-400 to-emerald-400 group-hover:w-full transition-all duration-300" />
                </a>
              ))}
            </div>

            {/* Desktop CTA Buttons with Futuristic Design */}
            <div className="hidden md:flex items-center gap-4">
              <a href="/login" className="px-6 py-3 bg-white/5 backdrop-blur-xl text-gray-300 font-semibold rounded-full border border-white/20 hover:border-green-400/50 hover:text-white transition-all duration-300 inline-block text-center">
                Sign In
              </a>
              <a href="/register" className="group relative px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(139,92,246,0.4)]">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative">Sign Up</span>
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-white transition-colors rounded-lg hover:bg-white/10"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu with Glassmorphism */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black/60 backdrop-blur-2xl border-b border-white/10"
          >
            <div className="px-6 py-6 space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="block text-gray-300 hover:text-white font-medium py-2 px-4 rounded-lg hover:bg-white/5 transition-all"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </a>
              ))}

              <div className="pt-4 space-y-3">
                <a href="/login" className="block w-full px-6 py-3 bg-white/5 backdrop-blur-xl text-gray-300 font-semibold rounded-full border border-white/20 hover:border-green-400/50 hover:text-white transition-all duration-300 text-center">
                  Sign In
                </a>
                <a href="/register" className="block w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-full hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all duration-300 text-center">
                  Sign Up
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
