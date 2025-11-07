'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { TrendingUp, Users, Target, DollarSign, ArrowUpRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const monthlyData = [
  { month: 'May', amount: 45000 },
  { month: 'Jun', amount: 62000 },
  { month: 'Jul', amount: 58000 },
  { month: 'Aug', amount: 75000 },
  { month: 'Sep', amount: 88000 },
  { month: 'Oct', amount: 104000 },
];

const allocationData = [
  { name: 'Programs', value: 75, color: '#16a34a' },
  { name: 'Operations', value: 15, color: '#4ade80' },
  { name: 'Reserve', value: 10, color: '#bbf7d0' },
];

export default function ImpactDashboard() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeProjects, setActiveProjects] = useState(0);
  const [volunteers, setVolunteers] = useState(0);

  useEffect(() => {
    if (isInView) {
      const projectInterval = setInterval(() => {
        setActiveProjects(prev => (prev < 12 ? prev + 1 : 12));
      }, 100);

      const volunteerInterval = setInterval(() => {
        setVolunteers(prev => (prev < 347 ? prev + 7 : 347));
      }, 20);

      return () => {
        clearInterval(projectInterval);
        clearInterval(volunteerInterval);
      };
    }
  }, [isInView]);

  return (
    <section ref={ref} className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl sm:text-6xl font-bold text-black mb-4">
            Real-Time <span className="text-green-600">Impact</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Every donation tracked, every life transformed, every moment transparent
          </p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {[
            { icon: Target, label: 'Active Projects', value: activeProjects, color: 'text-green-600', bg: 'bg-green-50' },
            { icon: Users, label: 'Volunteers', value: volunteers, color: 'text-green-600', bg: 'bg-green-50' },
            { icon: DollarSign, label: 'This Month', value: '$104K', color: 'text-green-600', bg: 'bg-green-50' },
            { icon: TrendingUp, label: 'Growth', value: '+42%', color: 'text-green-600', bg: 'bg-green-50' },
          ].map((metric, index) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow duration-200"
              >
                <div className={`inline-flex p-3 rounded-xl ${metric.bg} mb-4`}>
                  <Icon className={`w-6 h-6 ${metric.color}`} />
                </div>
                <p className="text-3xl font-bold text-black mb-1">{typeof metric.value === 'number' ? metric.value : metric.value}</p>
                <p className="text-sm text-gray-600 font-medium">{metric.label}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-gradient-to-br from-green-50 to-white border border-green-100 rounded-3xl p-8 shadow-md"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-black mb-1">Monthly Donations</h3>
                <p className="text-sm text-gray-600">Last 6 months trend</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                <ArrowUpRight className="w-4 h-4" />
                +42%
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Donations']}
                />
                <Area type="monotone" dataKey="amount" stroke="#16a34a" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-3xl p-8 shadow-md"
          >
            <h3 className="text-2xl font-bold text-black mb-1">Fund Allocation</h3>
            <p className="text-sm text-gray-600 mb-6">Where your money goes</p>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-3 gap-4 mt-4">
              {allocationData.map((item, index) => (
                <div key={index} className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-lg font-bold text-black">{item.value}%</span>
                  </div>
                  <p className="text-xs text-gray-600">{item.name}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mt-12"
        >
          <button className="px-10 py-4 bg-black text-white font-semibold rounded-full hover:bg-gray-800 transition-colors duration-200 inline-flex items-center gap-2">
            View Full Analytics Dashboard
            <ArrowUpRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
