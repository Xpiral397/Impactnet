'use client';

import { motion } from 'framer-motion';
import { Heart, ArrowRight } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen bg-gradient-to-b from-gray-900 to-black pt-20">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Hero Content */}
        <div className="text-center py-20">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-tight text-white"
          >
            Creating a better world,
            <br />
            <span className="text-green-400">one cause at a time</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-400 max-w-3xl mx-auto mb-8"
          >
            Join the global movement connecting passionate donors with communities through blockchain-verified transparency
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button className="px-8 py-4 bg-green-600 text-white text-lg font-semibold rounded-full hover:bg-green-700 transition-colors inline-flex items-center justify-center gap-2">
              <Heart className="w-5 h-5" />
              Donate Now
            </button>
            <button className="px-8 py-4 bg-white text-black text-lg font-semibold rounded-full hover:bg-gray-100 transition-colors inline-flex items-center justify-center gap-2">
              Learn More
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>

        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="relative h-[500px] rounded-3xl overflow-hidden mb-16"
        >
          <img
            src="/images/hero/main.jpg"
            alt="Community transformation"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2070';
            }}
          />
        </motion.div>

        {/* Stats Cards - Simple White Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pb-16">
          {[
            { value: '5,000+', label: 'Global Supporters' },
            { value: '$2.4M+', label: 'Funds Distributed' },
            { value: '47', label: 'Active Projects' },
            { value: '100%', label: 'Transparent' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
              className="bg-white p-6 rounded-2xl text-center shadow-sm"
            >
              <p className="text-3xl font-bold text-black mb-1">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
