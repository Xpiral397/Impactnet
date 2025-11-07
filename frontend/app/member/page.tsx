'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  LayoutDashboard,
  Compass,
  Users,
  MessageSquare,
  Bell,
  User,
  LogOut,
  Menu,
  Heart,
  Camera,
  Send,
  Sparkles,
  Upload,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  BarChart3,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Edit,
  Copy,
  GraduationCap,
  ChevronRight,
  PlayCircle,
  X,
  Video,
  Award,
  Globe,
  Briefcase,
  Link as LinkIcon,
  UserCog,
  ArrowDownCircle,
  ArrowUpCircle,
  CreditCard,
  Building,
  PlusCircle,
  Smile,
  Megaphone,
  HandHeart,
  Bold,
  Italic,
  Code,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Link2,
  Target,
  Plane,
  Plus,
  Trash2,
} from 'lucide-react';
import { posts, programs, messages, userProfile, Post, Program, Message } from './mockData';
import EnhancedPost from './components/EnhancedPost';
import CreatePost from './components/CreatePost';

export default function MemberDashboard() {
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<number | null>(null);
  const [messageText, setMessageText] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(messages[0]);
  const [accountTab, setAccountTab] = useState('overview');
  const [profileTab, setProfileTab] = useState('timeline');
  const [timelineCategory, setTimelineCategory] = useState('All');
  const [isCreatePostExpanded, setIsCreatePostExpanded] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [postCategory, setPostCategory] = useState('Feed');
  const [showGoalSection, setShowGoalSection] = useState(false);
  const [goalType, setGoalType] = useState('money');
  const [goalAmount, setGoalAmount] = useState('');
  const [goalDeadline, setGoalDeadline] = useState('');
  const [goalMilestones, setGoalMilestones] = useState<{title: string; amount: string}[]>([]);

  const menuItems = [
    { id: 'dashboard', label: 'Timeline', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'community', label: 'Community', icon: <Users className="w-5 h-5" /> },
    { id: 'explore', label: 'Explore Programs', icon: <Compass className="w-5 h-5" /> },
    { id: 'account', label: 'Programs Account', icon: <Briefcase className="w-5 h-5" /> },
    { id: 'messages', label: 'Messages', icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
  ];

  // Formatting function for markdown insertion
  const insertFormatting = (format: string) => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = postContent.substring(start, end);
    let newText = postContent;
    let cursorPos = start;

    switch (format) {
      case 'bold':
        newText = postContent.substring(0, start) + `**${selectedText || 'bold text'}**` + postContent.substring(end);
        cursorPos = selectedText ? end + 4 : start + 2;
        break;
      case 'italic':
        newText = postContent.substring(0, start) + `*${selectedText || 'italic text'}*` + postContent.substring(end);
        cursorPos = selectedText ? end + 2 : start + 1;
        break;
      case 'code':
        newText = postContent.substring(0, start) + `\`${selectedText || 'code'}\`` + postContent.substring(end);
        cursorPos = selectedText ? end + 2 : start + 1;
        break;
      case 'heading1':
        newText = postContent.substring(0, start) + `# ${selectedText || 'Heading 1'}` + postContent.substring(end);
        cursorPos = selectedText ? end + 2 : start + 2;
        break;
      case 'heading2':
        newText = postContent.substring(0, start) + `## ${selectedText || 'Heading 2'}` + postContent.substring(end);
        cursorPos = selectedText ? end + 3 : start + 3;
        break;
      case 'list':
        newText = postContent.substring(0, start) + `- ${selectedText || 'List item'}` + postContent.substring(end);
        cursorPos = selectedText ? end + 2 : start + 2;
        break;
      case 'orderedList':
        newText = postContent.substring(0, start) + `1. ${selectedText || 'List item'}` + postContent.substring(end);
        cursorPos = selectedText ? end + 3 : start + 3;
        break;
      case 'quote':
        newText = postContent.substring(0, start) + `> ${selectedText || 'Quote'}` + postContent.substring(end);
        cursorPos = selectedText ? end + 2 : start + 2;
        break;
      case 'link':
        newText = postContent.substring(0, start) + `[${selectedText || 'link text'}](url)` + postContent.substring(end);
        cursorPos = selectedText ? end + 2 : start + 1;
        break;
    }

    setPostContent(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorPos, cursorPos);
    }, 0);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      Feed: 'bg-blue-100 text-blue-700',
      Request: 'bg-orange-100 text-orange-700',
      Testimony: 'bg-green-100 text-green-700',
      Encouragement: 'bg-purple-100 text-purple-700',
      Healthcare: 'bg-blue-100 text-blue-700',
      Skills: 'bg-purple-100 text-purple-700',
      Housing: 'bg-emerald-100 text-emerald-700',
      Education: 'bg-orange-100 text-orange-700',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="hidden lg:block w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">ImpactNet</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeView === item.id
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Profile Section */}
          <div className="px-3 py-4 border-t border-gray-200">
            <div
              onClick={() => setActiveView('profile')}
              className="flex items-center gap-3 px-4 py-3 mb-2 hover:bg-gray-50 rounded-lg cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-blue-500">
                <Image
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&fit=crop&q=80"
                  alt="Profile"
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{userProfile.name}</p>
                <p className="text-xs text-gray-500 truncate">View Profile</p>
              </div>
            </div>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-6 py-4 flex items-center justify-between">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              {menuItems.find(m => m.id === activeView)?.label || 'ImpactNet'}
            </h1>
            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-gray-100 rounded-lg">
                <Bell className="w-6 h-6 text-gray-700" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Dashboard/Home View */}
          {activeView === 'dashboard' && (
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Create Post - Expandable */}
                <motion.div
                  className="bg-white rounded-2xl p-6 shadow-sm"
                  animate={{ height: isCreatePostExpanded ? 'auto' : 'auto' }}
                  transition={{ duration: 0.3 }}
                >
                  {!isCreatePostExpanded ? (
                    // Collapsed State
                    <>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden">
                          <Image
                            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&fit=crop&q=80"
                            alt="Profile"
                            width={48}
                            height={48}
                            className="object-cover"
                          />
                        </div>
                        <input
                          type="text"
                          placeholder="Share your story, ask for help, or encourage others..."
                          className="flex-1 px-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                          onClick={() => setIsCreatePostExpanded(true)}
                          readOnly
                        />
                      </div>
                      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => setIsCreatePostExpanded(true)}
                          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          <Camera className="w-5 h-5" />
                          <span className="text-sm font-medium">Photo</span>
                        </button>
                        <button
                          onClick={() => setIsCreatePostExpanded(true)}
                          className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors"
                        >
                          <Video className="w-5 h-5" />
                          <span className="text-sm font-medium">Video</span>
                        </button>
                        <button
                          onClick={() => setIsCreatePostExpanded(true)}
                          className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors"
                        >
                          <MessageSquare className="w-5 h-5" />
                          <span className="text-sm font-medium">Request Help</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    // Expanded State with GitHub-style editor
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Create Post</h3>
                        <button
                          onClick={() => {
                            setIsCreatePostExpanded(false);
                            setPostContent('');
                            setShowPreview(false);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5 text-gray-600" />
                        </button>
                      </div>

                      {/* Write/Preview Tabs */}
                      <div className="flex border-b border-gray-200 mb-4">
                        <button
                          onClick={() => setShowPreview(false)}
                          className={`px-4 py-2 font-medium transition-colors ${
                            !showPreview
                              ? 'text-blue-600 border-b-2 border-blue-600'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Write
                        </button>
                        <button
                          onClick={() => setShowPreview(true)}
                          className={`px-4 py-2 font-medium transition-colors ${
                            showPreview
                              ? 'text-blue-600 border-b-2 border-blue-600'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Preview
                        </button>
                      </div>

                      {!showPreview ? (
                        // Write Mode with Formatting Toolbar
                        <div>
                          {/* GitHub-style Formatting Toolbar */}
                          <div className="border border-gray-300 rounded-t-lg bg-gray-50 px-2 py-1 flex items-center gap-1 border-b-0">
                            <button
                              onClick={() => insertFormatting('heading1')}
                              className="p-2 hover:bg-gray-200 rounded transition-colors"
                              title="Heading 1 (# )"
                            >
                              <Heading1 className="w-4 h-4 text-gray-700" />
                            </button>
                            <button
                              onClick={() => insertFormatting('heading2')}
                              className="p-2 hover:bg-gray-200 rounded transition-colors"
                              title="Heading 2 (## )"
                            >
                              <Heading2 className="w-4 h-4 text-gray-700" />
                            </button>
                            <div className="w-px h-6 bg-gray-300 mx-1"></div>
                            <button
                              onClick={() => insertFormatting('bold')}
                              className="p-2 hover:bg-gray-200 rounded transition-colors"
                              title="Bold (**text**)"
                            >
                              <Bold className="w-4 h-4 text-gray-700" />
                            </button>
                            <button
                              onClick={() => insertFormatting('italic')}
                              className="p-2 hover:bg-gray-200 rounded transition-colors"
                              title="Italic (*text*)"
                            >
                              <Italic className="w-4 h-4 text-gray-700" />
                            </button>
                            <div className="w-px h-6 bg-gray-300 mx-1"></div>
                            <button
                              onClick={() => insertFormatting('code')}
                              className="p-2 hover:bg-gray-200 rounded transition-colors"
                              title="Code (`code`)"
                            >
                              <Code className="w-4 h-4 text-gray-700" />
                            </button>
                            <button
                              onClick={() => insertFormatting('link')}
                              className="p-2 hover:bg-gray-200 rounded transition-colors"
                              title="Link ([text](url))"
                            >
                              <Link2 className="w-4 h-4 text-gray-700" />
                            </button>
                            <div className="w-px h-6 bg-gray-300 mx-1"></div>
                            <button
                              onClick={() => insertFormatting('list')}
                              className="p-2 hover:bg-gray-200 rounded transition-colors"
                              title="Bullet list (- item)"
                            >
                              <List className="w-4 h-4 text-gray-700" />
                            </button>
                            <button
                              onClick={() => insertFormatting('orderedList')}
                              className="p-2 hover:bg-gray-200 rounded transition-colors"
                              title="Numbered list (1. item)"
                            >
                              <ListOrdered className="w-4 h-4 text-gray-700" />
                            </button>
                            <button
                              onClick={() => insertFormatting('quote')}
                              className="p-2 hover:bg-gray-200 rounded transition-colors"
                              title="Quote (> text)"
                            >
                              <Quote className="w-4 h-4 text-gray-700" />
                            </button>
                          </div>

                          {/* Textarea */}
                          <textarea
                            value={postContent}
                            onChange={(e) => setPostContent(e.target.value)}
                            placeholder="Write your post... Use the toolbar above for formatting"
                            className="w-full px-4 py-3 border border-gray-300 rounded-b-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[200px] resize-y font-mono text-sm"
                          />

                          {/* Formatting Tips */}
                          <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <p className="font-semibold mb-2">Markdown shortcuts:</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              <span><code className="bg-white px-1 rounded">**bold**</code> → <strong>bold</strong></span>
                              <span><code className="bg-white px-1 rounded">*italic*</code> → <em>italic</em></span>
                              <span><code className="bg-white px-1 rounded">`code`</code> → <code>code</code></span>
                              <span><code className="bg-white px-1 rounded"># Heading</code> → Heading 1</span>
                              <span><code className="bg-white px-1 rounded">- item</code> → • item</span>
                              <span><code className="bg-white px-1 rounded">&gt; quote</code> → Quote</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Preview Mode
                        <div className="border border-gray-300 rounded-lg p-4 min-h-[200px] bg-gray-50">
                          <div className="prose prose-sm max-w-none">
                            {postContent ? (
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: postContent
                                    // Headings
                                    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-gray-900 mt-3 mb-2">$1</h3>')
                                    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-gray-900 mt-4 mb-2">$1</h2>')
                                    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-gray-900 mt-4 mb-3">$1</h1>')
                                    // Code blocks (inline)
                                    .replace(/`([^`]+)`/g, '<code class="bg-gray-200 px-2 py-1 rounded text-sm font-mono text-red-600">$1</code>')
                                    // Bold and Italic
                                    .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-bold">$1</strong>')
                                    .replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>')
                                    // Links
                                    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline" target="_blank">$1</a>')
                                    // Quotes
                                    .replace(/^&gt; (.*$)/gim, '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-700 my-2">$1</blockquote>')
                                    .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-700 my-2">$1</blockquote>')
                                    // Lists
                                    .replace(/^- (.*$)/gim, '<div class="flex items-start gap-2 my-1"><span>•</span><span>$1</span></div>')
                                    .replace(/^\* (.*$)/gim, '<div class="flex items-start gap-2 my-1"><span>•</span><span>$1</span></div>')
                                    .replace(/^\d+\. (.*$)/gim, '<div class="flex items-start gap-2 my-1"><span class="font-semibold">$&</span></div>')
                                    // Line breaks
                                    .replace(/\n/g, '<br />'),
                                }}
                              />
                            ) : (
                              <p className="text-gray-400">Nothing to preview yet...</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Post Category Selector */}
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Post Category</label>
                        <select
                          value={postCategory}
                          onChange={(e) => {
                            setPostCategory(e.target.value);
                            setShowGoalSection(e.target.value === 'Request');
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Feed">Feed</option>
                          <option value="Request">Request</option>
                          <option value="Testimony">Testimony</option>
                          <option value="Encouragement">Encouragement</option>
                        </select>
                      </div>

                      {/* Goal Section for Request Posts */}
                      {showGoalSection && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg"
                        >
                          <div className="flex items-center gap-2 mb-4">
                            <Target className="w-5 h-5 text-blue-600" />
                            <h4 className="font-bold text-gray-900">Set Your Goal</h4>
                          </div>

                          {/* Goal Type */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Goal Type</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {[
                                { id: 'money', label: 'Money', icon: <DollarSign className="w-4 h-4" /> },
                                { id: 'job', label: 'Job Opportunity', icon: <Briefcase className="w-4 h-4" /> },
                                { id: 'travel', label: 'Travel Support', icon: <Plane className="w-4 h-4" /> },
                                { id: 'other', label: 'Other', icon: <Target className="w-4 h-4" /> },
                              ].map((type) => (
                                <button
                                  key={type.id}
                                  onClick={() => setGoalType(type.id)}
                                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                                    goalType === type.id
                                      ? 'bg-blue-600 text-white border-blue-600'
                                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                                  }`}
                                >
                                  {type.icon}
                                  <span className="text-sm font-medium">{type.label}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Goal Amount/Target */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {goalType === 'money' ? 'Target Amount ($)' : 'Target/Description'}
                            </label>
                            <input
                              type={goalType === 'money' ? 'number' : 'text'}
                              value={goalAmount}
                              onChange={(e) => setGoalAmount(e.target.value)}
                              placeholder={goalType === 'money' ? '5000' : 'Describe your goal...'}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          {/* Deadline */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Deadline (Optional)</label>
                            <input
                              type="date"
                              value={goalDeadline}
                              onChange={(e) => setGoalDeadline(e.target.value)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          {/* Milestones (for money goals) */}
                          {goalType === 'money' && (
                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700">Milestones (Optional)</label>
                                <button
                                  onClick={() => setGoalMilestones([...goalMilestones, { title: '', amount: '' }])}
                                  className="flex items-center gap-1 px-2 py-1 text-sm text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                >
                                  <Plus className="w-4 h-4" />
                                  Add Milestone
                                </button>
                              </div>
                              {goalMilestones.map((milestone, index) => (
                                <div key={index} className="flex items-center gap-2 mb-2">
                                  <input
                                    type="text"
                                    placeholder="Milestone title"
                                    value={milestone.title}
                                    onChange={(e) => {
                                      const newMilestones = [...goalMilestones];
                                      newMilestones[index].title = e.target.value;
                                      setGoalMilestones(newMilestones);
                                    }}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                  />
                                  <input
                                    type="number"
                                    placeholder="Amount"
                                    value={milestone.amount}
                                    onChange={(e) => {
                                      const newMilestones = [...goalMilestones];
                                      newMilestones[index].amount = e.target.value;
                                      setGoalMilestones(newMilestones);
                                    }}
                                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                  />
                                  <button
                                    onClick={() => {
                                      const newMilestones = goalMilestones.filter((_, i) => i !== index);
                                      setGoalMilestones(newMilestones);
                                    }}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Goal Preview */}
                          {goalAmount && (
                            <div className="p-3 bg-white border border-gray-200 rounded-lg">
                              <p className="text-xs text-gray-500 mb-2">Goal Preview:</p>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">
                                  {goalType === 'money' ? `$0 raised of $${goalAmount}` : goalAmount}
                                </span>
                                {goalDeadline && (
                                  <span className="text-xs text-gray-500">
                                    Due: {new Date(goalDeadline).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                              {goalType === 'money' && (
                                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div className="h-full bg-blue-600 rounded-full" style={{ width: '0%' }}></div>
                                </div>
                              )}
                              {goalMilestones.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <p className="text-xs font-medium text-gray-700 mb-2">Milestones:</p>
                                  {goalMilestones.map((milestone, index) => (
                                    <div key={index} className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                      <span>{milestone.title}</span>
                                      <span className="font-medium">${milestone.amount}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </motion.div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2">
                          <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <Camera className="w-5 h-5" />
                            <span className="text-sm font-medium">Photo</span>
                          </button>
                          <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <Video className="w-5 h-5" />
                            <span className="text-sm font-medium">Video</span>
                          </button>
                          <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                            <Smile className="w-5 h-5" />
                            <span className="text-sm font-medium">Emoji</span>
                          </button>
                        </div>
                        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                          Post
                        </button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>

                {/* Stories Section */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-100">
                  <div className="flex items-center gap-4 overflow-x-auto pb-2">
                    {/* ImpactNet Story - Always First */}
                    <div className="flex-shrink-0">
                      <div className="flex flex-col items-center gap-2 cursor-pointer group">
                        <div className="relative">
                          {/* Green Progress Circle - 100% */}
                          <svg className="w-24 h-24 -rotate-90">
                            <circle
                              cx="48"
                              cy="48"
                              r="44"
                              stroke="#e5e7eb"
                              strokeWidth="3"
                              fill="none"
                            />
                            <circle
                              cx="48"
                              cy="48"
                              r="44"
                              stroke="#10b981"
                              strokeWidth="3"
                              fill="none"
                              strokeDasharray="276.46"
                              strokeDashoffset="0"
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ring-2 ring-white">
                              <Heart className="w-10 h-10 text-white" fill="white" />
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-blue-600">ImpactNet</span>
                      </div>
                    </div>

                    {/* Your Story */}
                    <div className="flex-shrink-0">
                      <div className="flex flex-col items-center gap-2 cursor-pointer group">
                        <div className="relative">
                          {/* No progress circle for add story */}
                          <div className="w-24 h-24 flex items-center justify-center">
                            <div className="w-20 h-20 rounded-full border-2 border-dashed border-blue-400 flex items-center justify-center bg-blue-50 hover:bg-blue-100 transition-colors">
                              <PlusCircle className="w-10 h-10 text-blue-600" />
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-medium text-gray-700 group-hover:text-blue-600">Your Story</span>
                      </div>
                    </div>

                    {/* Stories from others with progress indicators */}
                    {[
                      { name: 'Sarah J.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&fit=crop&q=80', progress: 75 },
                      { name: 'Michael C.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&fit=crop&q=80', progress: 100 },
                      { name: 'Grace A.', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&fit=crop&q=80', progress: 0 },
                      { name: 'David O.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&fit=crop&q=80', progress: 40 },
                      { name: 'Amina H.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&fit=crop&q=80', progress: 100 },
                      { name: 'James W.', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&fit=crop&q=80', progress: 20 },
                      { name: 'Emma T.', avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&fit=crop&q=80', progress: 0 },
                    ].map((story, index) => {
                      const circumference = 2 * Math.PI * 44; // radius = 44
                      const offset = circumference - (story.progress / 100) * circumference;

                      return (
                        <div key={index} className="flex-shrink-0">
                          <div className="flex flex-col items-center gap-2 cursor-pointer group">
                            <div className="relative">
                              {/* Progress Circle */}
                              <svg className="w-24 h-24 -rotate-90">
                                {/* Background circle (gray) */}
                                <circle
                                  cx="48"
                                  cy="48"
                                  r="44"
                                  stroke="#e5e7eb"
                                  strokeWidth="3"
                                  fill="none"
                                />
                                {/* Progress circle (green) */}
                                {story.progress > 0 && (
                                  <circle
                                    cx="48"
                                    cy="48"
                                    r="44"
                                    stroke="#10b981"
                                    strokeWidth="3"
                                    fill="none"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={offset}
                                    strokeLinecap="round"
                                  />
                                )}
                              </svg>
                              {/* Avatar */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-white">
                                  <Image src={story.avatar} alt={story.name} width={80} height={80} className="object-cover" />
                                </div>
                              </div>
                            </div>
                            <span className="text-xs font-medium text-gray-700 group-hover:text-blue-600">{story.name}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Category Filter Tabs */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="flex border-b border-gray-200 overflow-x-auto">
                    {[
                      { id: 'All', label: 'All Posts', icon: <LayoutDashboard className="w-4 h-4" /> },
                      { id: 'Feed', label: 'Feed', icon: <Heart className="w-4 h-4" /> },
                      { id: 'Request', label: 'Requests', icon: <MessageSquare className="w-4 h-4" /> },
                      { id: 'Testimony', label: 'Testimonies', icon: <Smile className="w-4 h-4" /> },
                      { id: 'Encouragement', label: 'Encouragement', icon: <HandHeart className="w-4 h-4" /> },
                    ].map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setTimelineCategory(category.id)}
                        className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap transition-colors ${
                          timelineCategory === category.id
                            ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        {category.icon}
                        <span>{category.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Posts Feed - Enhanced with full interaction and filtering */}
                {posts
                  .filter((post) => timelineCategory === 'All' || post.category === timelineCategory)
                  .slice(0, 10)
                  .map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <EnhancedPost post={post} getCategoryColor={getCategoryColor} />
                  </motion.div>
                ))}

                {/* Programs Preview */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Programs For You</h3>
                    <button
                      onClick={() => setActiveView('explore')}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      View All ({programs.length})
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {programs.slice(0, 2).map((program) => (
                      <div key={program.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => {
                        setSelectedProgram(program.id);
                        setActiveView('explore');
                      }}>
                        <div className="relative h-32">
                          <Image
                            src={program.image}
                            alt={program.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold text-gray-900 mb-1">{program.title}</h4>
                          <p className="text-xs text-gray-600 mb-2">
                            {program.spotsAvailable}/{program.totalSpots} spots left
                          </p>
                          <button className="w-full py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                            Apply Now
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
            </div>
          )}

          {/* Community Feed View - Show all 500 posts */}
          {activeView === 'community' && (
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Create Post - Enhanced with hashtags and mentions */}
              <CreatePost />

              {/* All Posts - Enhanced with full interaction */}
              {posts.slice(0, 20).map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <EnhancedPost post={post} getCategoryColor={getCategoryColor} />
                </motion.div>
              ))}

              {/* Load More Button */}
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Showing 20 of {posts.length} posts</p>
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                  Load More Posts
                </button>
              </div>
            </div>
          )}

          {/* Profile View - CENTERED LIKE FACEBOOK (NO SIDEBAR) */}
          {activeView === 'profile' && (
            <div className="max-w-5xl mx-auto">
              {/* Cover Photo & Profile Picture */}
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm mb-6">
                <div className="relative h-64 bg-gradient-to-r from-blue-500 to-purple-600">
                  <Image
                    src="https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&fit=crop&q=80"
                    alt="Cover"
                    fill
                    className="object-cover"
                  />
                  <button className="absolute top-4 right-4 px-4 py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Edit Cover
                  </button>
                </div>

                <div className="px-8 pb-6">
                  <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-20">
                    <div className="flex flex-col md:flex-row md:items-end gap-6">
                      <div className="relative">
                        <div className="w-40 h-40 rounded-full overflow-hidden ring-8 ring-white bg-white">
                          <Image
                            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&fit=crop&q=80"
                            alt="Profile"
                            width={160}
                            height={160}
                            className="object-cover"
                          />
                        </div>
                        <button className="absolute bottom-2 right-2 p-3 bg-blue-600 rounded-full shadow-lg hover:bg-blue-700">
                          <Camera className="w-5 h-5 text-white" />
                        </button>
                      </div>
                      <div className="mb-4">
                        <h1 className="text-3xl font-bold text-gray-900">{userProfile.name}</h1>
                        <p className="text-lg text-gray-600 mt-1">{userProfile.headline}</p>
                        <div className="flex items-center gap-6 mt-3 text-gray-600">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {userProfile.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {userProfile.stats.connections} connections
                          </span>
                        </div>
                      </div>
                    </div>
                    <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 mb-4">
                      <Edit className="w-5 h-5 inline mr-2" />
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>

              {/* Impact Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Heart className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-600">People Helped</h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">247</p>
                  <p className="text-xs text-gray-500 mt-1">Total beneficiaries</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-600">Helped By</h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">32</p>
                  <p className="text-xs text-gray-500 mt-1">Sponsors & donors</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-600">Followers</h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">1,284</p>
                  <p className="text-xs text-gray-500 mt-1">Following your journey</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-orange-600" />
                    </div>
                    <h3 className="text-sm font-medium text-gray-600">Following</h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">856</p>
                  <p className="text-xs text-gray-500 mt-1">Connections you follow</p>
                </div>
              </div>

              {/* Profile Navigation Tabs */}
              <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
                <div className="flex border-b border-gray-200 overflow-x-auto">
                  {[
                    { id: 'timeline', label: 'Timeline', icon: <LayoutDashboard className="w-4 h-4" /> },
                    { id: 'about', label: 'About', icon: <User className="w-4 h-4" /> },
                    { id: 'work', label: 'Work Experience', icon: <Briefcase className="w-4 h-4" /> },
                    { id: 'connections', label: 'Connections', icon: <Users className="w-4 h-4" /> },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setProfileTab(tab.id)}
                      className={`flex items-center gap-2 px-6 py-4 font-medium whitespace-nowrap transition-colors ${
                        profileTab === tab.id
                          ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Timeline Tab - Posts User Interacted With */}
              {profileTab === 'timeline' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Posts You've Interacted With</h2>
                    <p className="text-gray-600 mb-6">See all the posts you've liked, commented on, or shared</p>
                  </div>
                  {posts.slice(0, 3).map((post) => (
                    <EnhancedPost key={post.id} post={post} getCategoryColor={getCategoryColor} />
                  ))}
                  <div className="text-center py-8">
                    <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                      Load More Posts
                    </button>
                  </div>
                </div>
              )}

              {/* About Tab */}
              {profileTab === 'about' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Contact Info */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                      <h2 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h2>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-xs text-gray-500">Email</p>
                            <p className="text-sm text-gray-900">{userProfile.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-xs text-gray-500">Phone</p>
                            <p className="text-sm text-gray-900">{userProfile.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-xs text-gray-500">Location</p>
                            <p className="text-sm text-gray-900">{userProfile.location}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-gray-500" />
                          <div>
                            <p className="text-xs text-gray-500">Joined</p>
                            <p className="text-sm text-gray-900">{userProfile.joinDate}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Referral Card */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                      <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Award className="w-5 h-5 text-yellow-500" />
                        Referral Program
                      </h3>
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          value={userProfile.referralCode}
                          readOnly
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 font-mono font-semibold"
                        />
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-green-800">
                          <strong>{userProfile.referralStats.referrals} referrals</strong> • <strong>{userProfile.referralStats.points} points</strong> earned
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Columns */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* About */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">About</h2>
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                          <Edit className="w-5 h-5 text-gray-600" />
                        </button>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{userProfile.bio}</p>
                    </div>

                    {/* Education */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Education</h2>
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                          <Edit className="w-5 h-5 text-gray-600" />
                        </button>
                      </div>
                      <div className="space-y-4">
                        <div className="flex gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <GraduationCap className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">Secondary School Certificate</h3>
                            <p className="text-sm text-gray-600">Lagos State Secondary School</p>
                            <p className="text-xs text-gray-500 mt-1">2010 - 2016</p>
                          </div>
                        </div>
                        <button className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 text-sm font-medium">
                          + Add Education
                        </button>
                      </div>
                    </div>

                    {/* Current Programs */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                      <h2 className="text-xl font-bold text-gray-900 mb-4">Current Programs</h2>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-xl cursor-pointer hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-14 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                              HC
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">Healthcare Support Initiative</h3>
                              <p className="text-xs text-gray-600 mb-2">Stage 3 of 8 • Document Verification</p>
                              <div className="w-48 h-2 bg-blue-200 rounded-full">
                                <div className="h-full bg-blue-600 rounded-full" style={{width: '37.5%'}}></div>
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-14 bg-gray-400 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                              SK
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">Skills Training Program</h3>
                              <p className="text-xs text-gray-600">Application Under Review</p>
                            </div>
                          </div>
                          <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-semibold">Pending</span>
                        </div>
                      </div>
                    </div>

                    {/* Introduction Video */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                      <h2 className="text-xl font-bold text-gray-900 mb-4">Introduction Video</h2>
                      <p className="text-sm text-gray-600 mb-4">Share your story through a video to connect with sponsors and admins.</p>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
                        <PlayCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-6">No video uploaded yet</p>
                        <div className="flex gap-3 justify-center flex-wrap">
                          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2">
                            <Camera className="w-5 h-5" />
                            Record Video
                          </button>
                          <button className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 flex items-center gap-2">
                            <Upload className="w-5 h-5" />
                            Upload Video
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-4">Max 2 minutes • MP4, MOV, WebM</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Work Experience Tab */}
              {profileTab === 'work' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Work Experience</h2>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        Add Experience
                      </button>
                    </div>

                    <div className="space-y-6">
                      {/* Work Experience Item 1 */}
                      <div className="flex gap-4 pb-6 border-b border-gray-200">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Briefcase className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900 text-lg">Community Organizer</h3>
                              <p className="text-gray-600">Lagos Community Development Foundation</p>
                              <p className="text-sm text-gray-500 mt-1">Jan 2022 - Present • 2 years</p>
                              <p className="text-sm text-gray-500">Lagos, Nigeria</p>
                            </div>
                            <button className="p-2 hover:bg-gray-100 rounded-lg">
                              <Edit className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>
                          <p className="text-gray-700 mt-3 leading-relaxed">
                            Led community outreach programs reaching over 500 families in underserved areas. Coordinated educational workshops, healthcare initiatives, and skills training sessions. Successfully managed a team of 15 volunteers.
                          </p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">Community Development</span>
                            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">Project Management</span>
                            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">Team Leadership</span>
                          </div>
                        </div>
                      </div>

                      {/* Work Experience Item 2 */}
                      <div className="flex gap-4 pb-6 border-b border-gray-200">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Briefcase className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900 text-lg">Volunteer Coordinator</h3>
                              <p className="text-gray-600">Hope for Tomorrow NGO</p>
                              <p className="text-sm text-gray-500 mt-1">Mar 2020 - Dec 2021 • 1 year 10 months</p>
                              <p className="text-sm text-gray-500">Lagos, Nigeria</p>
                            </div>
                            <button className="p-2 hover:bg-gray-100 rounded-lg">
                              <Edit className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>
                          <p className="text-gray-700 mt-3 leading-relaxed">
                            Recruited and trained over 100 volunteers for various community programs. Organized fundraising events that raised $50,000 for educational scholarships. Developed volunteer engagement strategies.
                          </p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">Volunteer Management</span>
                            <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">Fundraising</span>
                            <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">Event Planning</span>
                          </div>
                        </div>
                      </div>

                      {/* Work Experience Item 3 */}
                      <div className="flex gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Briefcase className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-gray-900 text-lg">Teaching Assistant</h3>
                              <p className="text-gray-600">St. Mary's Secondary School</p>
                              <p className="text-sm text-gray-500 mt-1">Sep 2018 - Feb 2020 • 1 year 6 months</p>
                              <p className="text-sm text-gray-500">Lagos, Nigeria</p>
                            </div>
                            <button className="p-2 hover:bg-gray-100 rounded-lg">
                              <Edit className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>
                          <p className="text-gray-700 mt-3 leading-relaxed">
                            Assisted teachers in creating engaging lesson plans for Mathematics and English. Provided one-on-one tutoring to students who needed extra support. Improved student test scores by an average of 25%.
                          </p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">Education</span>
                            <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">Tutoring</span>
                            <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">Curriculum Development</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Connections Tab */}
              {profileTab === 'connections' && (
                <div className="space-y-6">
                  {/* Followers Section */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Followers (1,284)</h2>
                      <input
                        type="text"
                        placeholder="Search followers..."
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { name: 'Sarah Johnson', role: 'Sponsor', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&fit=crop&q=80', mutual: 12 },
                        { name: 'Michael Chen', role: 'Community Member', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&fit=crop&q=80', mutual: 8 },
                        { name: 'Grace Adebayo', role: 'Sponsor', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&fit=crop&q=80', mutual: 15 },
                        { name: 'David Okafor', role: 'Volunteer', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&fit=crop&q=80', mutual: 5 },
                        { name: 'Amina Hassan', role: 'Beneficiary', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&fit=crop&q=80', mutual: 20 },
                        { name: 'James Williams', role: 'Admin', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&fit=crop&q=80', mutual: 3 },
                      ].map((follower, index) => (
                        <div key={index} className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                          <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0">
                            <Image src={follower.avatar} alt={follower.name} width={56} height={56} className="object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">{follower.name}</h3>
                            <p className="text-xs text-gray-600">{follower.role}</p>
                            <p className="text-xs text-gray-500">{follower.mutual} mutual connections</p>
                          </div>
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex-shrink-0">
                            Follow
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="text-center mt-6">
                      <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">
                        View All Followers
                      </button>
                    </div>
                  </div>

                  {/* Following Section */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Following (856)</h2>
                      <input
                        type="text"
                        placeholder="Search following..."
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        { name: 'Emma Thompson', role: 'Foundation Director', avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&fit=crop&q=80', following: true },
                        { name: 'Robert Kim', role: 'Program Manager', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&fit=crop&q=80', following: true },
                        { name: 'Fatima Ali', role: 'Social Worker', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&fit=crop&q=80', following: true },
                        { name: 'Carlos Martinez', role: 'Healthcare Coordinator', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&fit=crop&q=80', following: true },
                        { name: 'Linda Nguyen', role: 'Education Specialist', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&fit=crop&q=80', following: true },
                        { name: 'Ahmed Ibrahim', role: 'Skills Trainer', avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=100&fit=crop&q=80', following: true },
                      ].map((person, index) => (
                        <div key={index} className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                          <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0">
                            <Image src={person.avatar} alt={person.name} width={56} height={56} className="object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">{person.name}</h3>
                            <p className="text-xs text-gray-600">{person.role}</p>
                          </div>
                          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 flex-shrink-0">
                            Unfollow
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="text-center mt-6">
                      <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">
                        View All Following
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Programs/Explore View - Show all 200 programs */}
          {activeView === 'explore' && !selectedProgram && (
            <div className="max-w-7xl mx-auto">
              <div className="mb-6">
                <p className="text-gray-600">Showing {programs.length} available programs</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {programs.slice(0, 12).map((program) => (
                  <motion.div
                    key={program.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setSelectedProgram(program.id)}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer"
                  >
                    <div className="relative h-48">
                      <Image
                        src={program.image}
                        alt={program.title}
                        fill
                        className="object-cover"
                      />
                      {program.status === 'closing_soon' && (
                        <div className="absolute top-3 right-3 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                          Closing Soon
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${getCategoryColor(program.category)}`}>
                        {program.category}
                      </span>
                      <h3 className="font-bold text-lg text-gray-900 mb-2">{program.title}</h3>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{program.description}</p>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-xs text-gray-500">Spots Available</p>
                          <p className="font-bold text-gray-900">{program.spotsAvailable}/{program.totalSpots}</p>
                        </div>
                        {program.impact && (
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Beneficiaries</p>
                            <p className="font-bold text-blue-600">{program.impact.beneficiaries.toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                      <button className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                        View Details
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Load More */}
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Showing 12 of {programs.length} programs</p>
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                  Load More Programs
                </button>
              </div>
            </div>
          )}

          {/* Detailed Program View */}
          {activeView === 'explore' && selectedProgram && (
            <div className="max-w-5xl mx-auto">
              {(() => {
                const program = programs.find(p => p.id === selectedProgram);
                if (!program) return null;

                return (
                  <>
                    {/* Back Button */}
                    <button
                      onClick={() => setSelectedProgram(null)}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
                    >
                      <ChevronRight className="w-5 h-5 rotate-180" />
                      <span className="font-medium">Back to Programs</span>
                    </button>

                    {/* Cover Image */}
                    <div className="relative h-96 rounded-2xl overflow-hidden mb-6">
                      <Image
                        src={program.coverImage || program.image}
                        alt={program.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-6 left-6 text-white">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${getCategoryColor(program.category)}`}>
                          {program.category}
                        </span>
                        <h1 className="text-4xl font-bold mb-2">{program.title}</h1>
                        <p className="text-lg text-white/90">{program.description}</p>
                      </div>
                      {program.status === 'closing_soon' && (
                        <div className="absolute top-6 right-6 px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-full">
                          Closing Soon
                        </div>
                      )}
                    </div>

                    {/* Program Stats */}
                    <div className="grid grid-cols-3 gap-6 mb-8">
                      <div className="bg-white p-6 rounded-xl shadow-sm">
                        <p className="text-gray-500 text-sm mb-1">Spots Available</p>
                        <p className="text-3xl font-bold text-gray-900">{program.spotsAvailable}</p>
                        <p className="text-sm text-gray-600">of {program.totalSpots} total</p>
                      </div>
                      {program.closeDate && (
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                          <p className="text-gray-500 text-sm mb-1">Application Closes</p>
                          <p className="text-3xl font-bold text-gray-900">{new Date(program.closeDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                          <p className="text-sm text-gray-600">{new Date(program.closeDate).getFullYear()}</p>
                        </div>
                      )}
                      {program.impact && (
                        <div className="bg-white p-6 rounded-xl shadow-sm">
                          <p className="text-gray-500 text-sm mb-1">People Helped</p>
                          <p className="text-3xl font-bold text-blue-600">{program.impact.beneficiaries.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">{program.impact.successRate} success rate</p>
                        </div>
                      )}
                    </div>

                    {/* Introduction Video */}
                    {program.introVideo && (
                      <div className="bg-white rounded-2xl p-8 shadow-sm mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <PlayCircle className="w-7 h-7 text-blue-600" />
                          Why This Program Exists
                        </h2>
                        <div className="relative h-96 rounded-xl overflow-hidden bg-gray-900 mb-4">
                          <iframe
                            width="100%"
                            height="100%"
                            src={program.introVideo.url}
                            title={program.introVideo.title}
                            className="border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        </div>
                        <p className="text-gray-600 flex items-center gap-2">
                          <span className="font-semibold">{program.introVideo.duration}</span>
                          <span>•</span>
                          <span>{program.introVideo.title}</span>
                        </p>
                      </div>
                    )}

                    {/* Our Story / Reason */}
                    {program.reason && (
                      <div className="bg-white rounded-2xl p-8 shadow-sm mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h2>
                        <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                          {program.reason}
                        </div>
                      </div>
                    )}

                    {/* Qualifications */}
                    {program.qualifications && program.qualifications.length > 0 && (
                      <div className="bg-white rounded-2xl p-8 shadow-sm mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Qualifications Required</h2>
                        <ul className="space-y-3">
                          {program.qualifications.map((qual, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-green-600 text-xs font-bold">✓</span>
                              </div>
                              <span className="text-gray-700">{qual}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Requirements */}
                    {program.requirements && program.requirements.length > 0 && (
                      <div className="bg-white rounded-2xl p-8 shadow-sm mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Required Documents</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {program.requirements.map((req, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                              <Copy className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-gray-700">{req}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Evaluation Criteria */}
                    {program.criteria && program.criteria.length > 0 && (
                      <div className="bg-white rounded-2xl p-8 shadow-sm mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Evaluate Applications</h2>
                        <div className="space-y-4">
                          {program.criteria.map((criterion, idx) => (
                            <div key={idx} className="p-4 border-l-4 border-blue-600 bg-blue-50">
                              <p className="text-gray-800">{criterion}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* How to Apply */}
                    {program.howToApply && (
                      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 shadow-sm mb-8 border-2 border-blue-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Apply</h2>
                        <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                          {program.howToApply}
                        </div>
                      </div>
                    )}

                    {/* Benefits */}
                    {program.benefits && program.benefits.length > 0 && (
                      <div className="bg-white rounded-2xl p-8 shadow-sm mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">What You'll Receive</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {program.benefits.map((benefit, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                              <Award className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700">{benefit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Timeline */}
                    {program.timeline && program.timeline.length > 0 && (
                      <div className="bg-white rounded-2xl p-8 shadow-sm mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Application Timeline</h2>
                        <div className="relative">
                          {program.timeline.map((phase, idx) => (
                            <div key={idx} className="flex gap-4 pb-8 last:pb-0">
                              <div className="flex flex-col items-center">
                                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                                  {idx + 1}
                                </div>
                                {idx < program.timeline!.length - 1 && (
                                  <div className="w-0.5 h-full bg-blue-200 mt-2"></div>
                                )}
                              </div>
                              <div className="flex-1 pb-4">
                                <h3 className="font-bold text-lg text-gray-900 mb-1">{phase.phase}</h3>
                                <p className="text-sm text-blue-600 font-semibold mb-2">{phase.duration}</p>
                                <p className="text-gray-600">{phase.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Program Executives */}
                    {program.executives && program.executives.length > 0 && (
                      <div className="bg-white rounded-2xl p-8 shadow-sm mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Review Board</h2>
                        <p className="text-gray-600 mb-6">Your application will be reviewed by our dedicated team of professionals:</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {program.executives.map((exec) => (
                            <div key={exec.id} className="text-center">
                              <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-3 ring-4 ring-blue-100">
                                <Image
                                  src={exec.avatar}
                                  alt={exec.name}
                                  width={96}
                                  height={96}
                                  className="object-cover"
                                />
                              </div>
                              <h3 className="font-bold text-gray-900">{exec.name}</h3>
                              <p className="text-sm text-blue-600 font-semibold">{exec.role}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Apply Button - Fixed at bottom */}
                    <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 -mx-6 shadow-lg">
                      <div className="max-w-5xl mx-auto flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Ready to change your life?</p>
                          <p className="text-lg font-bold text-gray-900">{program.spotsAvailable} spots remaining</p>
                        </div>
                        <button className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg flex items-center gap-2">
                          <Video className="w-6 h-6" />
                          Start Application
                        </button>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* Programs Account - Comprehensive Fund Management */}
          {activeView === 'account' && (
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Header */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold mb-2 text-gray-900">Programs Account</h1>
                    <p className="text-gray-600">Comprehensive fund management and transaction tracking</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total Funds Managed</p>
                    <p className="text-4xl font-bold text-blue-600">₦2.5M</p>
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="flex border-b border-gray-200 overflow-x-auto">
                  {[
                    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
                    { id: 'income', label: 'Income', icon: <TrendingUp className="w-4 h-4" /> },
                    { id: 'outgoing', label: 'Outgoing', icon: <DollarSign className="w-4 h-4" /> },
                    { id: 'projects', label: 'Projects', icon: <Briefcase className="w-4 h-4" /> },
                    { id: 'executive', label: 'Executive Spending', icon: <UserCog className="w-4 h-4" /> },
                    { id: 'funding', label: 'Fund In/Out', icon: <CreditCard className="w-4 h-4" /> },
                    { id: 'history', label: 'Account History', icon: <Clock className="w-4 h-4" /> },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setAccountTab(tab.id)}
                      className={`flex items-center gap-2 px-6 py-4 font-medium transition-all border-b-2 whitespace-nowrap ${
                        accountTab === tab.id
                          ? 'border-blue-600 text-blue-600 bg-blue-50'
                          : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Overview Tab */}
                {accountTab === 'overview' && (
                  <div className="p-6 space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-gray-300 transition-all duration-300 group">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                            <DollarSign className="w-6 h-6 text-gray-900" />
                          </div>
                          <TrendingUp className="w-5 h-5 text-gray-600" />
                        </div>
                        <p className="text-gray-600 text-sm">Available Funds</p>
                        <p className="text-3xl font-bold text-blue-600 mt-1">₦450,000</p>
                        <p className="text-sm text-gray-500 mt-2">+₦50K this month</p>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-gray-300 transition-all duration-300 group">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                            <Briefcase className="w-6 h-6 text-gray-900" />
                          </div>
                          <CheckCircle className="w-5 h-5 text-gray-600" />
                        </div>
                        <p className="text-gray-600 text-sm">Active Programs</p>
                        <p className="text-3xl font-bold text-blue-600 mt-1">3</p>
                        <p className="text-sm text-gray-500 mt-2">2 approved, 1 pending</p>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-gray-300 transition-all duration-300 group">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                            <Heart className="w-6 h-6 text-gray-900" />
                          </div>
                          <BarChart3 className="w-5 h-5 text-gray-600" />
                        </div>
                        <p className="text-gray-600 text-sm">Lives Impacted</p>
                        <p className="text-3xl font-bold text-blue-600 mt-1">127</p>
                        <p className="text-sm text-gray-500 mt-2">Across 3 programs</p>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md hover:border-gray-300 transition-all duration-300 group">
                        <div className="flex items-center justify-between mb-4">
                          <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                            <TrendingUp className="w-6 h-6 text-gray-900" />
                          </div>
                          <BarChart3 className="w-5 h-5 text-gray-600" />
                        </div>
                        <p className="text-gray-600 text-sm">Total Income</p>
                        <p className="text-3xl font-bold text-blue-600 mt-1">₦800,000</p>
                        <p className="text-sm text-gray-500 mt-2">All time</p>
                      </div>
                    </div>

                    {/* Account Credentials Section */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                      <h2 className="text-xl font-bold text-gray-900 mb-6">Account Information</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* NIN Section */}
                        <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-all duration-300">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              <User className="w-5 h-5 text-gray-900" />
                            </div>
                            <p className="text-sm font-medium text-gray-600">National Identification Number</p>
                          </div>
                          <p className="text-2xl font-bold text-blue-600 tracking-wide">1234-5678-9012</p>
                          <p className="text-xs text-gray-500 mt-2">Verified on Jan 10, 2024</p>
                        </div>

                        {/* Virtual Account Number */}
                        <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-all duration-300">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              <DollarSign className="w-5 h-5 text-gray-900" />
                            </div>
                            <p className="text-sm font-medium text-gray-600">Virtual Account Number</p>
                          </div>
                          <p className="text-2xl font-bold text-blue-600 tracking-wide">7890-1234-5678</p>
                          <p className="text-xs text-gray-500 mt-2">Zenith Bank - ImpactNet</p>
                        </div>

                        {/* Account Status */}
                        <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-all duration-300">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              <CheckCircle className="w-5 h-5 text-gray-900" />
                            </div>
                            <p className="text-sm font-medium text-gray-600">Account Status</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <p className="text-lg font-bold text-gray-900">Active & Verified</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">All credentials verified</p>
                        </div>

                        {/* Member Since */}
                        <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-all duration-300">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              <LayoutDashboard className="w-5 h-5 text-gray-900" />
                            </div>
                            <p className="text-sm font-medium text-gray-600">Member Since</p>
                          </div>
                          <p className="text-2xl font-bold text-blue-600">Jan 2024</p>
                          <p className="text-xs text-gray-500 mt-2">10 months active</p>
                        </div>
                      </div>
                    </div>

                    {/* My Program Applications */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">My Program Applications</h2>
                        <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium transition-all duration-200 hover:scale-105">
                          Apply to New Program
                        </button>
                      </div>

                      <div className="space-y-4">
                        {/* Application 1 - Approved */}
                        <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-gray-300 transition-all duration-300">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  Tech Skills Training Program
                                </h3>
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold flex items-center gap-1">
                                  <CheckCircle className="w-4 h-4" />
                                  Approved
                                </span>
                              </div>
                              <p className="text-gray-600 mb-4">
                                6-month web development bootcamp with job placement support
                              </p>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                  <p className="text-xs text-gray-500">Funding Received</p>
                                  <p className="text-lg font-bold text-blue-600">₦300,000</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Start Date</p>
                                  <p className="text-sm font-semibold text-gray-900">Jan 15, 2024</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Progress</p>
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                      <div className="bg-blue-600 h-2 rounded-full" style={{width: '65%'}}></div>
                                    </div>
                                    <span className="text-sm font-semibold">65%</span>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Impact</p>
                                  <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                                    <Eye className="w-4 h-4" />
                                    45 beneficiaries
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
                            <button className="px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 font-medium text-sm transition-all duration-200">
                              View Details
                            </button>
                            <button className="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 font-medium text-sm transition-all duration-200">
                              Submit Report
                            </button>
                          </div>
                        </div>

                        {/* Application 2 - Approved */}
                        <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-gray-300 transition-all duration-300">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  Healthcare Access Initiative
                                </h3>
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold flex items-center gap-1">
                                  <CheckCircle className="w-4 h-4" />
                                  Approved
                                </span>
                              </div>
                              <p className="text-gray-600 mb-4">
                                Free medical consultations and medications for underserved communities
                              </p>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                  <p className="text-xs text-gray-500">Funding Received</p>
                                  <p className="text-lg font-bold text-blue-600">₦500,000</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Start Date</p>
                                  <p className="text-sm font-semibold text-gray-900">Mar 1, 2024</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Progress</p>
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                      <div className="bg-blue-600 h-2 rounded-full" style={{width: '40%'}}></div>
                                    </div>
                                    <span className="text-sm font-semibold">40%</span>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Impact</p>
                                  <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                                    <Eye className="w-4 h-4" />
                                    62 beneficiaries
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
                            <button className="px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 font-medium text-sm transition-all duration-200">
                              View Details
                            </button>
                            <button className="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 font-medium text-sm transition-all duration-200">
                              Submit Report
                            </button>
                          </div>
                        </div>

                        {/* Application 3 - Pending */}
                        <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-gray-300 transition-all duration-300 bg-gray-50">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  Youth Entrepreneurship Fund
                                </h3>
                                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  Under Review
                                </span>
                              </div>
                              <p className="text-gray-600 mb-4">
                                Seed funding and mentorship for young entrepreneurs
                              </p>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                  <p className="text-xs text-gray-500">Requested Amount</p>
                                  <p className="text-lg font-bold text-blue-600">₦750,000</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Applied Date</p>
                                  <p className="text-sm font-semibold text-gray-900">Nov 1, 2024</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Review Status</p>
                                  <p className="text-sm font-semibold text-yellow-600">In Progress</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Expected Decision</p>
                                  <p className="text-sm font-semibold text-gray-900">7-14 days</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
                            <button className="px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 font-medium text-sm transition-all duration-200">
                              View Application
                            </button>
                            <button className="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 font-medium text-sm transition-all duration-200">
                              Edit Application
                            </button>
                          </div>
                        </div>
                </div>
              </div>

                    {/* Transaction History */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                      <h2 className="text-xl font-bold text-gray-900 mb-6">Transaction History</h2>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-300">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <TrendingUp className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">Funding Received</p>
                              <p className="text-sm text-gray-600">Healthcare Access Initiative</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-blue-600 text-lg">+₦500,000</p>
                            <p className="text-xs text-gray-500">Mar 1, 2024</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-300">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <TrendingUp className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">Funding Received</p>
                              <p className="text-sm text-gray-600">Tech Skills Training Program</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-blue-600 text-lg">+₦300,000</p>
                            <p className="text-xs text-gray-500">Jan 15, 2024</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-300">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-gray-100 rounded-lg">
                              <DollarSign className="w-5 h-5 text-gray-700" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">Program Disbursement</p>
                              <p className="text-sm text-gray-600">Medical supplies purchase</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-blue-600 text-lg">-₦150,000</p>
                            <p className="text-xs text-gray-500">Oct 15, 2024</p>
                          </div>
                        </div>
                      </div>

                      <button className="w-full mt-4 py-3 text-gray-900 hover:text-gray-700 font-medium text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200">
                        View All Transactions
                      </button>
                    </div>
                  </div>
                )}

                {/* Income Tab */}
                {accountTab === 'income' && (
                  <div className="p-6">
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Income Transactions</h2>
                      <p className="text-gray-600">All incoming funds to your account</p>
                    </div>

                    {/* Income Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Source</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Program</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          <tr className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Mar 1, 2024</td>
                            <td className="px-6 py-4 text-sm text-gray-900">ImpactNet Foundation</td>
                            <td className="px-6 py-4 text-sm text-gray-600">Healthcare Access Initiative</td>
                            <td className="px-6 py-4 text-sm text-gray-600">Program Funding</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-blue-600">+₦500,000</td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Completed</span>
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Jan 15, 2024</td>
                            <td className="px-6 py-4 text-sm text-gray-900">ImpactNet Foundation</td>
                            <td className="px-6 py-4 text-sm text-gray-600">Tech Skills Training Program</td>
                            <td className="px-6 py-4 text-sm text-gray-600">Program Funding</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-blue-600">+₦300,000</td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Completed</span>
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Oct 10, 2024</td>
                            <td className="px-6 py-4 text-sm text-gray-900">Personal Contribution</td>
                            <td className="px-6 py-4 text-sm text-gray-600">General Account</td>
                            <td className="px-6 py-4 text-sm text-gray-600">Deposit</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-blue-600">+₦50,000</td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Completed</span>
                            </td>
                          </tr>
                        </tbody>
                        <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                          <tr>
                            <td colSpan={4} className="px-6 py-4 text-sm font-semibold text-gray-900">Total Income</td>
                            <td className="px-6 py-4 text-right text-lg font-bold text-blue-600">+₦850,000</td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                {/* Outgoing Tab */}
                {accountTab === 'outgoing' && (
                  <div className="p-6">
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Outgoing Transactions</h2>
                      <p className="text-gray-600">All expenses and disbursements from your account</p>
                    </div>

                    {/* Outgoing Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Recipient</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Program</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Purpose</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          <tr className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Oct 15, 2024</td>
                            <td className="px-6 py-4 text-sm text-gray-900">MedSupply Ltd</td>
                            <td className="px-6 py-4 text-sm text-gray-600">Healthcare Access Initiative</td>
                            <td className="px-6 py-4 text-sm text-gray-600">Medical supplies purchase</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-blue-600">-₦150,000</td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Completed</span>
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Sep 20, 2024</td>
                            <td className="px-6 py-4 text-sm text-gray-900">TechHub Academy</td>
                            <td className="px-6 py-4 text-sm text-gray-600">Tech Skills Training Program</td>
                            <td className="px-6 py-4 text-sm text-gray-600">Training materials</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-blue-600">-₦80,000</td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Completed</span>
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Aug 5, 2024</td>
                            <td className="px-6 py-4 text-sm text-gray-900">Venue Rentals Inc</td>
                            <td className="px-6 py-4 text-sm text-gray-600">Tech Skills Training Program</td>
                            <td className="px-6 py-4 text-sm text-gray-600">Training venue rental</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-blue-600">-₦45,000</td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Completed</span>
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Jul 10, 2024</td>
                            <td className="px-6 py-4 text-sm text-gray-900">Healthcare Partners</td>
                            <td className="px-6 py-4 text-sm text-gray-600">Healthcare Access Initiative</td>
                            <td className="px-6 py-4 text-sm text-gray-600">Medical consultations</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-blue-600">-₦125,000</td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Completed</span>
                            </td>
                          </tr>
                        </tbody>
                        <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                          <tr>
                            <td colSpan={4} className="px-6 py-4 text-sm font-semibold text-gray-900">Total Outgoing</td>
                            <td className="px-6 py-4 text-right text-lg font-bold text-blue-600">-₦400,000</td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                {/* Projects Tab */}
                {accountTab === 'projects' && (
                  <div className="p-6">
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Project Fund Management</h2>
                      <p className="text-gray-600">Track income and expenses for each project</p>
                    </div>

                    <div className="space-y-6">
                      {/* Healthcare Project */}
                      <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-start justify-between mb-6">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">Healthcare Access Initiative</h3>
                            <p className="text-sm text-gray-600">Active since Mar 1, 2024</p>
                          </div>
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">Active</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-1">Total Funding</p>
                            <p className="text-2xl font-bold text-blue-600">₦500,000</p>
                          </div>
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-1">Total Expenses</p>
                            <p className="text-2xl font-bold text-blue-600">₦275,000</p>
                          </div>
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-1">Available Balance</p>
                            <p className="text-2xl font-bold text-blue-600">₦225,000</p>
                          </div>
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-1">Progress</p>
                            <p className="text-2xl font-bold text-blue-600">40%</p>
                          </div>
                        </div>

                        {/* Project Transactions */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Recent Transactions</h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                  <TrendingUp className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">Program Funding Received</p>
                                  <p className="text-xs text-gray-500">Mar 1, 2024</p>
                                </div>
                              </div>
                              <p className="font-bold text-blue-600">+₦500,000</p>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                  <DollarSign className="w-4 h-4 text-gray-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">Medical supplies purchase</p>
                                  <p className="text-xs text-gray-500">Oct 15, 2024</p>
                                </div>
                              </div>
                              <p className="font-bold text-blue-600">-₦150,000</p>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                  <DollarSign className="w-4 h-4 text-gray-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">Medical consultations</p>
                                  <p className="text-xs text-gray-500">Jul 10, 2024</p>
                                </div>
                              </div>
                              <p className="font-bold text-blue-600">-₦125,000</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Tech Training Project */}
                      <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-start justify-between mb-6">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">Tech Skills Training Program</h3>
                            <p className="text-sm text-gray-600">Active since Jan 15, 2024</p>
                          </div>
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">Active</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-1">Total Funding</p>
                            <p className="text-2xl font-bold text-blue-600">₦300,000</p>
                          </div>
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-1">Total Expenses</p>
                            <p className="text-2xl font-bold text-blue-600">₦125,000</p>
                          </div>
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-1">Available Balance</p>
                            <p className="text-2xl font-bold text-blue-600">₦175,000</p>
                          </div>
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-1">Progress</p>
                            <p className="text-2xl font-bold text-blue-600">65%</p>
                          </div>
                        </div>

                        {/* Project Transactions */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3">Recent Transactions</h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                  <TrendingUp className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">Program Funding Received</p>
                                  <p className="text-xs text-gray-500">Jan 15, 2024</p>
                                </div>
                              </div>
                              <p className="font-bold text-blue-600">+₦300,000</p>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                  <DollarSign className="w-4 h-4 text-gray-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">Training materials</p>
                                  <p className="text-xs text-gray-500">Sep 20, 2024</p>
                                </div>
                              </div>
                              <p className="font-bold text-blue-600">-₦80,000</p>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                  <DollarSign className="w-4 h-4 text-gray-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">Training venue rental</p>
                                  <p className="text-xs text-gray-500">Aug 5, 2024</p>
                                </div>
                              </div>
                              <p className="font-bold text-blue-600">-₦45,000</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Account History Tab */}
                {accountTab === 'history' && (
                  <div className="p-6">
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Account History</h2>
                      <p className="text-gray-600">All transactions across your personal account and projects</p>
                    </div>

                    {/* Filters */}
                    <div className="mb-6 flex gap-4">
                      <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>All Transactions</option>
                        <option>Income Only</option>
                        <option>Expenses Only</option>
                      </select>
                      <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>All Projects</option>
                        <option>Healthcare Access Initiative</option>
                        <option>Tech Skills Training Program</option>
                        <option>General Account</option>
                      </select>
                      <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Last 30 Days</option>
                        <option>Last 3 Months</option>
                        <option>Last 6 Months</option>
                        <option>All Time</option>
                      </select>
                    </div>

                    {/* Complete History Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date & Time</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Project</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Balance</th>
                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          <tr className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Oct 15, 2024 14:30</td>
                            <td className="px-6 py-4 text-sm text-gray-900">Medical supplies purchase - MedSupply Ltd</td>
                            <td className="px-6 py-4 text-sm text-gray-600">Healthcare Initiative</td>
                            <td className="px-6 py-4 text-sm"><span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">Expense</span></td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-blue-600">-₦150,000</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">₦450,000</td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Completed</span>
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Oct 10, 2024 09:15</td>
                            <td className="px-6 py-4 text-sm text-gray-900">Personal Contribution</td>
                            <td className="px-6 py-4 text-sm text-gray-600">General Account</td>
                            <td className="px-6 py-4 text-sm"><span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">Income</span></td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-blue-600">+₦50,000</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">₦600,000</td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Completed</span>
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Sep 20, 2024 11:20</td>
                            <td className="px-6 py-4 text-sm text-gray-900">Training materials - TechHub Academy</td>
                            <td className="px-6 py-4 text-sm text-gray-600">Tech Training Program</td>
                            <td className="px-6 py-4 text-sm"><span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">Expense</span></td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-blue-600">-₦80,000</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">₦550,000</td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Completed</span>
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Aug 5, 2024 16:45</td>
                            <td className="px-6 py-4 text-sm text-gray-900">Training venue rental - Venue Rentals Inc</td>
                            <td className="px-6 py-4 text-sm text-gray-600">Tech Training Program</td>
                            <td className="px-6 py-4 text-sm"><span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">Expense</span></td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-blue-600">-₦45,000</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">₦630,000</td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Completed</span>
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Jul 10, 2024 10:30</td>
                            <td className="px-6 py-4 text-sm text-gray-900">Medical consultations - Healthcare Partners</td>
                            <td className="px-6 py-4 text-sm text-gray-600">Healthcare Initiative</td>
                            <td className="px-6 py-4 text-sm"><span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">Expense</span></td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-blue-600">-₦125,000</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">₦675,000</td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Completed</span>
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Mar 1, 2024 08:00</td>
                            <td className="px-6 py-4 text-sm text-gray-900">Program Funding - ImpactNet Foundation</td>
                            <td className="px-6 py-4 text-sm text-gray-600">Healthcare Initiative</td>
                            <td className="px-6 py-4 text-sm"><span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">Income</span></td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-blue-600">+₦500,000</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">₦800,000</td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Completed</span>
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Jan 15, 2024 12:00</td>
                            <td className="px-6 py-4 text-sm text-gray-900">Program Funding - ImpactNet Foundation</td>
                            <td className="px-6 py-4 text-sm text-gray-600">Tech Training Program</td>
                            <td className="px-6 py-4 text-sm"><span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">Income</span></td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-blue-600">+₦300,000</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">₦300,000</td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Completed</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    <div className="mt-6 flex items-center justify-between">
                      <p className="text-sm text-gray-600">Showing 1-7 of 7 transactions</p>
                      <div className="flex gap-2">
                        <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors" disabled>
                          Previous
                        </button>
                        <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors" disabled>
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Executive Spending Tab */}
                {accountTab === 'executive' && (
                  <div className="p-6">
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Executive & Administrative Spending</h2>
                      <p className="text-gray-600">Track how executives and administrators use foundation funds</p>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1">Total Executive Spending</p>
                        <p className="text-2xl font-bold text-blue-600">₦1,200,000</p>
                        <p className="text-xs text-gray-500 mt-1">Last 12 months</p>
                      </div>
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1">Operational Costs</p>
                        <p className="text-2xl font-bold text-blue-600">₦850,000</p>
                        <p className="text-xs text-gray-500 mt-1">71% of executive budget</p>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1">Salaries & Benefits</p>
                        <p className="text-2xl font-bold text-blue-600">₦250,000</p>
                        <p className="text-xs text-gray-500 mt-1">21% of executive budget</p>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-1">Travel & Events</p>
                        <p className="text-2xl font-bold text-blue-600">₦100,000</p>
                        <p className="text-xs text-gray-500 mt-1">8% of executive budget</p>
                      </div>
                    </div>

                    {/* Executive Spending Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Executive</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Department</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          <tr className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Nov 1, 2024</td>
                            <td className="px-6 py-4 text-sm text-gray-900">Adeola Johnson</td>
                            <td className="px-6 py-4 text-sm text-gray-600">Operations</td>
                            <td className="px-6 py-4 text-sm"><span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">Office Supplies</span></td>
                            <td className="px-6 py-4 text-sm text-gray-600">Monthly office equipment & supplies</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-blue-600">-₦45,000</td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Approved</span>
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Oct 28, 2024</td>
                            <td className="px-6 py-4 text-sm text-gray-900">Chidi Okonkwo</td>
                            <td className="px-6 py-4 text-sm text-gray-600">Programs</td>
                            <td className="px-6 py-4 text-sm"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">Travel</span></td>
                            <td className="px-6 py-4 text-sm text-gray-600">Site visit to Lagos program location</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-blue-600">-₦35,000</td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Approved</span>
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Oct 25, 2024</td>
                            <td className="px-6 py-4 text-sm text-gray-900">Ngozi Adebayo</td>
                            <td className="px-6 py-4 text-sm text-gray-600">Communications</td>
                            <td className="px-6 py-4 text-sm"><span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">Marketing</span></td>
                            <td className="px-6 py-4 text-sm text-gray-600">Social media campaign for Q4</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-blue-600">-₦120,000</td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Approved</span>
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Oct 20, 2024</td>
                            <td className="px-6 py-4 text-sm text-gray-900">Olumide Balogun</td>
                            <td className="px-6 py-4 text-sm text-gray-600">Finance</td>
                            <td className="px-6 py-4 text-sm"><span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">Salary</span></td>
                            <td className="px-6 py-4 text-sm text-gray-600">Monthly salary - October 2024</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-blue-600">-₦85,000</td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Paid</span>
                            </td>
                          </tr>
                          <tr className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Oct 15, 2024</td>
                            <td className="px-6 py-4 text-sm text-gray-900">Amaka Nwosu</td>
                            <td className="px-6 py-4 text-sm text-gray-600">IT</td>
                            <td className="px-6 py-4 text-sm"><span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">Software</span></td>
                            <td className="px-6 py-4 text-sm text-gray-600">Annual software licenses renewal</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-blue-600">-₦200,000</td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Approved</span>
                            </td>
                          </tr>
                        </tbody>
                        <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                          <tr>
                            <td colSpan={5} className="px-6 py-4 text-sm font-semibold text-gray-900">Total Executive Spending (Last 30 Days)</td>
                            <td className="px-6 py-4 text-right text-lg font-bold text-blue-600">-₦485,000</td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                {/* Funding Operations Tab */}
                {accountTab === 'funding' && (
                  <div className="p-6">
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Fund In/Out Operations</h2>
                      <p className="text-gray-600">Deposit and withdraw funds using Stripe</p>
                    </div>

                    {/* Action Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      {/* Deposit Card */}
                      <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="p-3 bg-green-500 rounded-lg">
                            <ArrowDownCircle className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">Deposit Funds</h3>
                            <p className="text-sm text-gray-600">Add money to your account</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₦)</label>
                            <input
                              type="number"
                              placeholder="Enter amount"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                            <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                              <option>Stripe Card Payment</option>
                              <option>Bank Transfer</option>
                              <option>Mobile Money</option>
                            </select>
                          </div>
                          <button className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2">
                            <CreditCard className="w-5 h-5" />
                            Deposit via Stripe
                          </button>
                        </div>
                      </div>

                      {/* Withdrawal Card */}
                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="p-3 bg-orange-500 rounded-lg">
                            <ArrowUpCircle className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">Withdraw Funds</h3>
                            <p className="text-sm text-gray-600">Transfer money to your bank</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₦)</label>
                            <input
                              type="number"
                              placeholder="Enter amount"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">Available: ₦450,000</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Bank Account</label>
                            <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                              <option>Zenith Bank - 7890-1234-5678</option>
                              <option>GTBank - 1234-5678-9012</option>
                              <option>Add New Account</option>
                            </select>
                          </div>
                          <button className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2">
                            <Building className="w-5 h-5" />
                            Withdraw to Bank
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Recent Funding Operations */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Funding Operations</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date & Time</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Operation</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Method</th>
                              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Transaction ID</th>
                              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            <tr className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Oct 10, 2024 09:15</td>
                              <td className="px-6 py-4 text-sm">
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium flex items-center gap-1 w-fit">
                                  <ArrowDownCircle className="w-3 h-3" />
                                  Deposit
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">Stripe Card Payment</td>
                              <td className="px-6 py-4 text-sm text-gray-500 font-mono">pi_3Nxyz...ABC123</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-blue-600">+₦50,000</td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Completed</span>
                              </td>
                            </tr>
                            <tr className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Sep 28, 2024 14:22</td>
                              <td className="px-6 py-4 text-sm">
                                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium flex items-center gap-1 w-fit">
                                  <ArrowUpCircle className="w-3 h-3" />
                                  Withdrawal
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">Bank Transfer</td>
                              <td className="px-6 py-4 text-sm text-gray-500 font-mono">txn_3Mdef...XYZ789</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-blue-600">-₦100,000</td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Completed</span>
                              </td>
                            </tr>
                            <tr className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Sep 15, 2024 10:05</td>
                              <td className="px-6 py-4 text-sm">
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium flex items-center gap-1 w-fit">
                                  <ArrowDownCircle className="w-3 h-3" />
                                  Deposit
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">Bank Transfer</td>
                              <td className="px-6 py-4 text-sm text-gray-500 font-mono">txn_2Kghi...DEF456</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-blue-600">+₦250,000</td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Completed</span>
                              </td>
                            </tr>
                            <tr className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Aug 30, 2024 16:30</td>
                              <td className="px-6 py-4 text-sm">
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium flex items-center gap-1 w-fit">
                                  <ArrowDownCircle className="w-3 h-3" />
                                  Deposit
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">Stripe Card Payment</td>
                              <td className="px-6 py-4 text-sm text-gray-500 font-mono">pi_1Jklm...GHI999</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-blue-600">+₦150,000</td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Completed</span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Stripe Integration Notice */}
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-blue-500 rounded-lg">
                          <CreditCard className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 mb-2">Powered by Stripe</h4>
                          <p className="text-sm text-gray-600 mb-3">
                            All transactions are secured by Stripe's industry-leading payment infrastructure.
                            Your financial data is encrypted and never stored on our servers.
                          </p>
                          <p className="text-xs text-gray-500">
                            Processing fees: 2.9% + ₦100 per transaction • Withdrawals take 1-3 business days
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Messages View - Full Height with Sidebar */}
          {activeView === 'messages' && (
            <div className="h-screen bg-white -mt-6 -mb-6">
              <div className="grid grid-cols-3 h-full overflow-hidden">
                {/* Messages List */}
                <div className="col-span-1 border-r border-gray-200 overflow-y-auto">
                    <div className="p-4 border-b border-gray-200">
                      <input
                        type="text"
                        placeholder="Search messages..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="divide-y divide-gray-200">
                      {messages.slice(0, 50).map((message) => (
                        <div
                          key={message.id}
                          onClick={() => setSelectedMessage(message)}
                          className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                            selectedMessage?.id === message.id ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-12 h-12 rounded-full overflow-hidden">
                                <Image
                                  src={message.user.avatar}
                                  alt={message.user.name}
                                  width={48}
                                  height={48}
                                  className="object-cover"
                                />
                              </div>
                              {message.online && (
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white"></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="font-semibold text-gray-900 truncate text-sm">{message.user.name}</h3>
                                <span className="text-xs text-gray-500">{message.timestamp}</span>
                              </div>
                              <p className="text-xs text-gray-600 truncate">{message.lastMessage}</p>
                            </div>
                            {message.unread > 0 && (
                              <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-xs text-white font-bold">{message.unread}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Chat Area */}
                  <div className="col-span-2 flex flex-col">
                    {selectedMessage && (
                      <>
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden">
                              <Image
                                src={selectedMessage.user.avatar}
                                alt={selectedMessage.user.name}
                                width={40}
                                height={40}
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{selectedMessage.user.name}</h3>
                              <p className="text-xs text-green-600">{selectedMessage.online ? "Online" : "Offline"}</p>
                            </div>
                          </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
                          <div className="space-y-4">
                            <div className="flex gap-3">
                              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                                <Image
                                  src={selectedMessage.user.avatar}
                                  alt={selectedMessage.user.name}
                                  width={32}
                                  height={32}
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm max-w-md">
                                  <p className="text-gray-800 text-sm">{selectedMessage.lastMessage}</p>
                                </div>
                                <p className="text-xs text-gray-500 mt-1 ml-2">{selectedMessage.timestamp}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-gray-200 bg-white">
                          <div className="flex gap-3">
                            <input
                              type="text"
                              value={messageText}
                              onChange={(e) => setMessageText(e.target.value)}
                              placeholder="Type a message..."
                              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                              <Send className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
          
          )
          }

          {/* Placeholder for other views */}
          {!['dashboard', 'community', 'profile', 'explore', 'messages', 'account'].includes(activeView) && (
            <div className="max-w-4xl mx-auto bg-white rounded-2xl p-12 text-center shadow-sm">
              <p className="text-gray-500 text-lg">This section is under development.</p>
              <p className="text-gray-400 text-sm mt-2">Check back soon for updates!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
