'use client';

import { useState } from 'react';
import { BarChart3, Users, Briefcase, TrendingUp, Plus, Edit2, Trash2, Eye, Settings, UserPlus, Calendar, AlertCircle, CheckCircle, Clock, DollarSign } from 'lucide-react';

interface Program {
  id: number;
  title: string;
  type: 'education' | 'healthcare' | 'food' | 'skills';
  maxSlots: number;
  filledSlots: number;
  status: 'open' | 'closing_soon' | 'closed';
  budget: number;
  startDate: Date;
  endDate: Date;
}

interface Manager {
  id: number;
  name: string;
  email: string;
  executivesManaged: number;
  joinedDate: Date;
  status: 'active' | 'inactive';
}

interface AnalyticsStat {
  label: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: string;
}

export default function AdminPage() {
  const [activeView, setActiveView] = useState<'analytics' | 'programs' | 'managers' | 'settings'>('analytics');
  const [showAddProgramModal, setShowAddProgramModal] = useState(false);
  const [showAddManagerModal, setShowAddManagerModal] = useState(false);

  // Mock data - will be fetched from backend
  const [programs] = useState<Program[]>([
    {
      id: 1,
      title: 'University Scholarship Program',
      type: 'education',
      maxSlots: 45,
      filledSlots: 42,
      status: 'closing_soon',
      budget: 450000,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31')
    },
    {
      id: 2,
      title: 'Healthcare Support Initiative',
      type: 'healthcare',
      maxSlots: 30,
      filledSlots: 15,
      status: 'open',
      budget: 300000,
      startDate: new Date('2025-02-01'),
      endDate: new Date('2025-11-30')
    },
    {
      id: 3,
      title: 'Vocational Skills Training',
      type: 'skills',
      maxSlots: 50,
      filledSlots: 50,
      status: 'closed',
      budget: 200000,
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-10-31')
    }
  ]);

  const [managers] = useState<Manager[]>([
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.j@impactnet.org',
      executivesManaged: 8,
      joinedDate: new Date('2024-06-15'),
      status: 'active'
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'michael.c@impactnet.org',
      executivesManaged: 6,
      joinedDate: new Date('2024-08-20'),
      status: 'active'
    },
    {
      id: 3,
      name: 'Amara Okonkwo',
      email: 'amara.o@impactnet.org',
      executivesManaged: 5,
      joinedDate: new Date('2024-09-10'),
      status: 'active'
    }
  ]);

  const analyticsStats: AnalyticsStat[] = [
    {
      label: 'Total Members',
      value: '1,247',
      change: 12.5,
      icon: <Users className="w-6 h-6" />,
      color: 'blue'
    },
    {
      label: 'Active Programs',
      value: programs.filter(p => p.status === 'open' || p.status === 'closing_soon').length,
      change: 8.3,
      icon: <Briefcase className="w-6 h-6" />,
      color: 'green'
    },
    {
      label: 'Applications Pending',
      value: 89,
      change: -5.2,
      icon: <Clock className="w-6 h-6" />,
      color: 'yellow'
    },
    {
      label: 'Total Budget Allocated',
      value: '$950K',
      change: 15.7,
      icon: <DollarSign className="w-6 h-6" />,
      color: 'purple'
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: { bg: string; text: string; icon: string } } = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-800', icon: 'text-blue-600' },
      green: { bg: 'bg-green-100', text: 'text-green-800', icon: 'text-green-600' },
      yellow: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: 'text-yellow-600' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-800', icon: 'text-purple-600' }
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-black mb-2">Command Center</h1>
            <p className="text-gray-600">Manage programs, monitor analytics, and oversee operations</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddProgramModal(true)}
              className="px-4 py-2 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New Program
            </button>
            <button
              onClick={() => setShowAddManagerModal(true)}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Add Manager
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveView('analytics')}
            className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-colors ${
              activeView === 'analytics'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <BarChart3 className="w-5 h-5 inline-block mr-2" />
            Analytics
          </button>
          <button
            onClick={() => setActiveView('programs')}
            className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-colors ${
              activeView === 'programs'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Briefcase className="w-5 h-5 inline-block mr-2" />
            Programs
          </button>
          <button
            onClick={() => setActiveView('managers')}
            className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-colors ${
              activeView === 'managers'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Users className="w-5 h-5 inline-block mr-2" />
            Managers
          </button>
          <button
            onClick={() => setActiveView('settings')}
            className={`px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-colors ${
              activeView === 'settings'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Settings className="w-5 h-5 inline-block mr-2" />
            Settings
          </button>
        </div>

        {/* Analytics View */}
        {activeView === 'analytics' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {analyticsStats.map((stat, index) => {
                const colors = getColorClasses(stat.color);
                return (
                  <div key={index} className="bg-white rounded-2xl shadow-sm p-6 border-2 border-gray-100">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 ${colors.bg} rounded-xl ${colors.icon}`}>
                        {stat.icon}
                      </div>
                      <span
                        className={`text-sm font-semibold ${
                          stat.change >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {stat.change >= 0 ? '↑' : '↓'} {Math.abs(stat.change)}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-black">{stat.value}</p>
                  </div>
                );
              })}
            </div>

            {/* Charts and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Program Performance Chart */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-xl font-bold text-black mb-4">Program Performance</h3>
                <div className="space-y-4">
                  {programs.map((program) => {
                    const fillPercentage = (program.filledSlots / program.maxSlots) * 100;
                    return (
                      <div key={program.id}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-700">
                            {program.title}
                          </span>
                          <span className="text-sm text-gray-600">
                            {fillPercentage.toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-600 transition-all"
                            style={{ width: `${fillPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-xl font-bold text-black mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-black">
                        New application approved
                      </p>
                      <p className="text-xs text-gray-600">
                        Healthcare Support Initiative - 2 hours ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
                    <Users className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-black">
                        New member registered
                      </p>
                      <p className="text-xs text-gray-600">5 new members today</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-black">
                        Program closing soon
                      </p>
                      <p className="text-xs text-gray-600">
                        University Scholarship - 3 slots left
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Programs View */}
        {activeView === 'programs' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Program Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Slots
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Budget
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {programs.map((program) => (
                      <tr key={program.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-black">{program.title}</p>
                          <p className="text-xs text-gray-500">
                            {program.startDate.toLocaleDateString()} - {program.endDate.toLocaleDateString()}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-semibold rounded-full capitalize">
                            {program.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-black">
                            {program.filledSlots} / {program.maxSlots}
                          </p>
                          <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
                            <div
                              className="h-full bg-green-600"
                              style={{ width: `${(program.filledSlots / program.maxSlots) * 100}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-black">
                            ${program.budget.toLocaleString()}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 text-sm font-semibold rounded-full capitalize ${
                              program.status === 'open'
                                ? 'bg-green-100 text-green-800'
                                : program.status === 'closing_soon'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {program.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                              <Eye className="w-4 h-4 text-gray-600" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                              <Edit2 className="w-4 h-4 text-blue-600" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Managers View */}
        {activeView === 'managers' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {managers.map((manager) => (
                <div
                  key={manager.id}
                  className="bg-white rounded-2xl shadow-sm p-6 border-2 border-gray-100 hover:border-green-200 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {manager.name.charAt(0)}
                    </div>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        manager.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {manager.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-black mb-1">{manager.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{manager.email}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Executives Managed</span>
                      <span className="font-semibold text-black">{manager.executivesManaged}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Joined</span>
                      <span className="font-semibold text-black">
                        {manager.joinedDate.toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors">
                      View Details
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings View */}
        {activeView === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-xl font-bold text-black mb-6">Platform Settings</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    defaultValue="ImpactNet"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    defaultValue="admin@impactnet.org"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Claude AI API Key
                  </label>
                  <input
                    type="password"
                    placeholder="sk-ant-api..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Required for AI eligibility checking
                  </p>
                </div>
                <button className="px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors">
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
