'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Shield, Lock, Award, CheckCircle } from 'lucide-react';

const indicators = [
  { number: '100%', label: 'Transparent', icon: Shield, color: 'text-green-600', bg: 'bg-green-50' },
  { number: '256-bit', label: 'Encrypted', icon: Lock, color: 'text-green-600', bg: 'bg-green-50' },
  { number: 'Verified', label: 'Blockchain', icon: Award, color: 'text-green-600', bg: 'bg-green-50' },
  { number: '5,842', label: 'Lives Changed', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' }
];

export default function TrustIndicators() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-black mb-4">
            Trust Through <span className="text-green-600">Transparency</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Every donation is tracked, verified, and visible. See the impact in real-time.
          </p>
        </motion.div>

        {/* Indicators Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {indicators.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white border border-gray-200 rounded-2xl p-8 hover:border-green-600 hover:shadow-lg transition-all duration-300"
              >
                <div className={`inline-flex p-4 rounded-xl ${item.bg} mb-4`}>
                  <Icon className={`w-8 h-8 ${item.color}`} />
                </div>
                <p className="text-3xl font-bold text-black mb-2">{item.number}</p>
                <p className="text-sm text-gray-600 font-medium">{item.label}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
