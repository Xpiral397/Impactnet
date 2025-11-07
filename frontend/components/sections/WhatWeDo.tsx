'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Heart, Shield, Users } from 'lucide-react';

const features = [
  {
    icon: Heart,
    title: 'Faith-Driven Impact',
    description: 'We connect donors with communities through transparent, faith-based giving that transforms lives across Nigeria.'
  },
  {
    icon: Shield,
    title: '100% Transparency',
    description: 'Every donation is tracked on blockchain. See exactly where your money goes and the lives it changes in real-time.'
  },
  {
    icon: Users,
    title: 'Community First',
    description: 'We work directly with local communities in Osun and Oyo states, ensuring sustainable, lasting transformation.'
  }
];

export default function WhatWeDo() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold text-black mb-4">
            What We Do
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Nigeria's first blockchain-verified NGO platform, connecting donors with communities that need support.
          </p>
        </motion.div>

        {/* Features Grid - Simple White Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-black mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
