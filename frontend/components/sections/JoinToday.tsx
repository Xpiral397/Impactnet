'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';

export default function JoinToday() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<'donor' | 'volunteer' | 'partner' | null>(null);

  const roles = [
    {
      id: 'donor' as const,
      title: 'Become a Donor',
      description: 'Make recurring or one-time donations and track your impact in real-time',
      icon: '💝',
      benefits: ['Tax receipts', 'Impact reports', 'Priority updates']
    },
    {
      id: 'volunteer' as const,
      title: 'Join as Volunteer',
      description: 'Contribute your time and skills to help communities in need',
      icon: '🤝',
      benefits: ['Flexible schedule', 'Training provided', 'Community impact']
    },
    {
      id: 'partner' as const,
      title: 'Partner With Us',
      description: 'Corporate partnerships and organizational collaborations',
      icon: '🏢',
      benefits: ['Brand visibility', 'CSR reporting', 'Custom programs']
    }
  ];

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
            Join <span className="text-blue-600">Today</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Be part of a global movement creating lasting change. Choose how you want to make a difference.
          </p>
        </motion.div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {roles.map((role, index) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              onClick={() => setSelectedRole(role.id)}
              className={`cursor-pointer rounded-3xl p-8 border-2 transition-all duration-300 ${
                selectedRole === role.id
                  ? 'border-blue-600 bg-blue-50 shadow-xl scale-105'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg'
              }`}
            >
              {/* Icon */}
              <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center text-4xl mb-6 mx-auto">
                {role.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-black mb-3 text-center">
                {role.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 text-center text-sm mb-6">
                {role.description}
              </p>

              {/* Benefits */}
              <ul className="space-y-2">
                {role.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-blue-600">✓</span>
                    {benefit}
                  </li>
                ))}
              </ul>

              {/* Selection Indicator */}
              {selectedRole === role.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="mt-4 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mx-auto"
                >
                  <span className="text-white text-lg">✓</span>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Signup Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-3xl p-8 sm:p-12 shadow-lg">
            <h3 className="text-2xl font-bold text-black mb-2 text-center">
              Get Started Today
            </h3>
            <p className="text-gray-600 text-center mb-8">
              {selectedRole
                ? `Great choice! Enter your email to ${selectedRole === 'donor' ? 'start donating' : selectedRole === 'volunteer' ? 'volunteer' : 'partner with us'}.`
                : 'Select a role above to get started'}
            </p>

            <div className="space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-full focus:border-blue-600 focus:outline-none transition-colors duration-200"
                />
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: selectedRole ? 1.02 : 1 }}
                whileTap={{ scale: selectedRole ? 0.98 : 1 }}
                disabled={!selectedRole || !email}
                className={`w-full px-8 py-4 rounded-full font-semibold text-lg transition-all duration-200 ${
                  selectedRole && email
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl cursor-pointer'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {!selectedRole
                  ? 'Select a Role to Continue'
                  : !email
                  ? 'Enter Your Email'
                  : 'Join ImpactNet'}
              </motion.button>
            </div>

            {/* Privacy Note */}
            <p className="text-xs text-gray-500 text-center mt-6">
              By joining, you agree to our Terms of Service and Privacy Policy. We respect your privacy and will never share your information.
            </p>
          </div>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">2,847</p>
            <p className="text-sm text-gray-600">Active Donors</p>
          </div>
          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">347</p>
            <p className="text-sm text-gray-600">Volunteers</p>
          </div>
          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">28</p>
            <p className="text-sm text-gray-600">Partner Organizations</p>
          </div>
          <div className="text-center">
            <p className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">5,842</p>
            <p className="text-sm text-gray-600">Lives Impacted</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
