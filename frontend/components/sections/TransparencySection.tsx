'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Shield, Lock, FileText, CheckCircle } from 'lucide-react';

interface Donation {
  id: string;
  amount: number;
  donor: string;
  project: string;
  timestamp: string;
  verified: boolean;
}

const initialDonations: Donation[] = [
  { id: '#TXN-8472', amount: 250, donor: 'Anonymous', project: 'Water Wells', timestamp: '2 min ago', verified: true },
  { id: '#TXN-8471', amount: 500, donor: 'John D.', project: 'Education', timestamp: '5 min ago', verified: true },
  { id: '#TXN-8470', amount: 100, donor: 'Sarah M.', project: 'Food Program', timestamp: '8 min ago', verified: true },
  { id: '#TXN-8469', amount: 750, donor: 'Anonymous', project: 'Medical Care', timestamp: '12 min ago', verified: true },
  { id: '#TXN-8468', amount: 300, donor: 'David K.', project: 'Water Wells', timestamp: '15 min ago', verified: true }
];

export default function TransparencySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [donations, setDonations] = useState<Donation[]>(initialDonations);

  useEffect(() => {
    // Simulate live donations every 10 seconds
    const interval = setInterval(() => {
      const newDonation: Donation = {
        id: `#TXN-${Math.floor(Math.random() * 10000)}`,
        amount: Math.floor(Math.random() * 900) + 100,
        donor: ['Anonymous', 'John D.', 'Sarah M.', 'Michael B.', 'Emily R.'][Math.floor(Math.random() * 5)],
        project: ['Water Wells', 'Education', 'Food Program', 'Medical Care'][Math.floor(Math.random() * 4)],
        timestamp: 'Just now',
        verified: true
      };

      setDonations(prev => [newDonation, ...prev.slice(0, 4)]);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section ref={ref} className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-black mb-4">
            Complete <span className="text-green-600">Transparency</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Every donation is tracked, verified, and publicly recorded. See exactly where your money goes.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Blockchain Verification Visual */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="bg-gradient-to-br from-green-50 to-white border border-green-100 rounded-3xl p-8 shadow-md">
              <h3 className="text-2xl font-bold text-black mb-6">How We Ensure Trust</h3>

              <div className="space-y-6">
                {/* Blockchain Visual */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-black mb-2">Blockchain-Inspired Ledger</h4>
                    <p className="text-gray-600">Every transaction is cryptographically hashed and linked to create an immutable record.</p>
                  </div>
                </div>

                {/* Real-Time Verification */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-black mb-2">Real-Time Verification</h4>
                    <p className="text-gray-600">Donations are verified instantly and appear in the public ledger within seconds.</p>
                  </div>
                </div>

                {/* End-to-End Encryption */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-black mb-2">AES-256 Encryption</h4>
                    <p className="text-gray-600">Your personal and payment information is protected with military-grade encryption.</p>
                  </div>
                </div>

                {/* Audit Trail */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-black mb-2">Complete Audit Trail</h4>
                    <p className="text-gray-600">Every transaction has a full audit history from donation to disbursement.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button className="w-full px-8 py-4 bg-black text-white font-semibold rounded-full hover:bg-gray-800 transition-colors duration-200">
                View Full Transparency Report
              </button>
            </div>
          </motion.div>

          {/* Live Donation Feed */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-3xl p-8 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-black">Live Donations</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-gray-600">Live</span>
                </div>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-hidden">
                {donations.map((donation, index) => (
                  <motion.div
                    key={donation.id}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-mono text-gray-500">{donation.id}</span>
                          {donation.verified && (
                            <span className="text-green-600 text-sm">✓</span>
                          )}
                        </div>
                        <p className="text-lg font-bold text-black">${donation.amount.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{donation.timestamp}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">From: <span className="font-semibold text-black">{donation.donor}</span></span>
                      <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-semibold">
                        {donation.project}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <button className="w-full px-6 py-3 border-2 border-black text-black font-semibold rounded-full hover:bg-black hover:text-white transition-all duration-200">
                  View Complete Ledger
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid sm:grid-cols-3 gap-8 mt-16"
        >
          <div className="text-center">
            <p className="text-4xl font-bold text-green-600 mb-2">100%</p>
            <p className="text-gray-600">Donations Tracked</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-green-600 mb-2">8,472</p>
            <p className="text-gray-600">Verified Transactions</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-green-600 mb-2">0</p>
            <p className="text-gray-600">Security Breaches</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
