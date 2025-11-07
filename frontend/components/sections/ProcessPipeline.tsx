'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { DollarSign, CheckCircle, Users, Heart, TrendingUp } from 'lucide-react';

const pipeline = [
  {
    step: '01',
    title: 'Donate',
    description: 'Choose a project and make your contribution securely',
    icon: DollarSign
  },
  {
    step: '02',
    title: 'Verify',
    description: 'Instant blockchain verification and ledger recording',
    icon: CheckCircle
  },
  {
    step: '03',
    title: 'Distribute',
    description: 'Funds reach verified recipients automatically',
    icon: Users
  },
  {
    step: '04',
    title: 'Transform',
    description: 'Communities receive resources and begin transformation',
    icon: Heart
  },
  {
    step: '05',
    title: 'Track',
    description: 'Real-time impact metrics and transparent reporting',
    icon: TrendingUp
  }
];

export default function ProcessPipeline() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold text-black mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From donation to transformation in five simple steps
          </p>
        </motion.div>

        {/* Process Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {pipeline.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-xs font-bold text-gray-400 mb-2">STEP {item.step}</div>
                <h3 className="text-lg font-bold text-black mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
