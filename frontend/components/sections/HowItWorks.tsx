'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Heart, CheckCircle, BarChart3 } from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Make Your Donation',
    description: 'Choose a project that resonates with your heart. Every contribution makes a difference.',
    icon: Heart,
    color: 'bg-blue-600'
  },
  {
    number: '02',
    title: 'Instant Verification',
    description: 'Your donation is verified, encrypted, and recorded in our transparent blockchain ledger.',
    icon: CheckCircle,
    color: 'bg-green-600'
  },
  {
    number: '03',
    title: 'See Real Impact',
    description: 'Track your contribution, see results, and receive real-time updates on lives transformed.',
    icon: BarChart3,
    color: 'bg-purple-600'
  }
];

export default function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-black mb-4">
            How It <span className="text-green-600">Works</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From donation to transformation in three simple steps
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-white border-2 border-gray-200 rounded-2xl p-8 hover:border-green-600 hover:shadow-lg transition-all duration-300"
              >
                {/* Step Number */}
                <div className="text-sm font-bold text-gray-400 mb-4">STEP {step.number}</div>

                {/* Icon */}
                <div className={`inline-flex p-4 rounded-xl ${step.color} mb-6`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-black mb-4">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* CTA Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 bg-green-600 rounded-2xl p-12 text-center"
        >
          <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Make an Impact?
          </h3>
          <p className="text-green-100 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands creating lasting change in Nigeria
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-green-600 font-semibold rounded-full hover:shadow-xl transition-shadow duration-200">
              Start Donating Now
            </button>
            <button className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-green-600 transition-colors duration-200">
              Learn More
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
