'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  Send,
  Image as ImageIcon,
  Video,
  Smile,
  X,
  Hash,
  AtSign,
  MapPin,
  Calendar,
  Sparkles,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link2,
  Youtube,
  Film,
} from 'lucide-react';

interface CreatePostProps {
  onPostCreated?: (post: any) => void;
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const [postText, setPostText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Feed');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [showHashtagSuggestions, setShowHashtagSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [showAIAssist, setShowAIAssist] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [showVideoInput, setShowVideoInput] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Sample mention suggestions
  const mentionSuggestions = [
    { id: 1, name: 'Sarah Johnson', role: 'Member' },
    { id: 2, name: 'Michael Chen', role: 'Volunteer' },
    { id: 3, name: 'David Okafor', role: 'Program Leader' },
    { id: 4, name: 'Grace Adebayo', role: 'Member' },
  ];

  // Popular hashtags
  const hashtagSuggestions = [
    'community',
    'impact',
    'help',
    'testimony',
    'gratitude',
    'prayer',
    'support',
    'education',
    'healthcare',
    'empowerment',
  ];

  const categories = [
    { name: 'Feed', color: 'blue', description: 'General update' },
    { name: 'Request', color: 'orange', description: 'Ask for help' },
    { name: 'Testimony', color: 'green', description: 'Share success' },
    { name: 'Encourage', color: 'purple', description: 'Inspire others' },
  ];

  // Detect @mentions and #hashtags
  useEffect(() => {
    const text = postText;
    const cursorPos = textareaRef.current?.selectionStart || 0;

    // Get word at cursor
    const beforeCursor = text.substring(0, cursorPos);
    const lastAtSign = beforeCursor.lastIndexOf('@');
    const lastHashSign = beforeCursor.lastIndexOf('#');
    const lastSpace = Math.max(beforeCursor.lastIndexOf(' '), beforeCursor.lastIndexOf('\n'));

    // Check if typing @mention
    if (lastAtSign > lastSpace && lastAtSign !== -1) {
      setShowMentionSuggestions(true);
      setShowHashtagSuggestions(false);
    }
    // Check if typing #hashtag
    else if (lastHashSign > lastSpace && lastHashSign !== -1) {
      setShowHashtagSuggestions(true);
      setShowMentionSuggestions(false);
    }
    else {
      setShowMentionSuggestions(false);
      setShowHashtagSuggestions(false);
    }
  }, [postText, cursorPosition]);

  const insertMention = (name: string) => {
    const cursorPos = textareaRef.current?.selectionStart || 0;
    const beforeCursor = postText.substring(0, cursorPos);
    const afterCursor = postText.substring(cursorPos);
    const lastAtSign = beforeCursor.lastIndexOf('@');

    const newText = beforeCursor.substring(0, lastAtSign) + `@${name} ` + afterCursor;
    setPostText(newText);
    setShowMentionSuggestions(false);

    // Focus back on textarea
    setTimeout(() => {
      textareaRef.current?.focus();
      const newCursorPos = lastAtSign + name.length + 2;
      textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertHashtag = (tag: string) => {
    const cursorPos = textareaRef.current?.selectionStart || 0;
    const beforeCursor = postText.substring(0, cursorPos);
    const afterCursor = postText.substring(cursorPos);
    const lastHashSign = beforeCursor.lastIndexOf('#');

    const newText = beforeCursor.substring(0, lastHashSign) + `#${tag} ` + afterCursor;
    setPostText(newText);
    setShowHashtagSuggestions(false);

    // Focus back on textarea
    setTimeout(() => {
      textareaRef.current?.focus();
      const newCursorPos = lastHashSign + tag.length + 2;
      textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertEmoji = (emoji: string) => {
    const cursorPos = textareaRef.current?.selectionStart || 0;
    const newText = postText.substring(0, cursorPos) + emoji + postText.substring(cursorPos);
    setPostText(newText);
    setShowEmojiPicker(false);

    setTimeout(() => {
      textareaRef.current?.focus();
      const newCursorPos = cursorPos + emoji.length;
      textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setSelectedImages([...selectedImages, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const videoURL = URL.createObjectURL(file);
      setSelectedVideo(videoURL);
      setShowVideoInput(false);
    }
  };

  const addVideoFromURL = () => {
    if (videoUrl.trim()) {
      setSelectedVideo(videoUrl);
      setVideoUrl('');
      setShowVideoInput(false);
    }
  };

  const removeVideo = () => {
    setSelectedVideo(null);
    setVideoUrl('');
  };

  const applyFormatting = (format: 'bold' | 'italic' | 'underline' | 'list' | 'orderedList') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = postText.substring(start, end);
    let formattedText = '';

    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'underline':
        formattedText = `__${selectedText}__`;
        break;
      case 'list':
        formattedText = `\n- ${selectedText}`;
        break;
      case 'orderedList':
        formattedText = `\n1. ${selectedText}`;
        break;
    }

    const newText = postText.substring(0, start) + formattedText + postText.substring(end);
    setPostText(newText);

    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + formattedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const generateAISuggestion = () => {
    setIsGeneratingAI(true);
    setShowAIAssist(true);

    // Simulate AI generation (replace with actual AI API call)
    setTimeout(() => {
      const suggestions = [
        "I'm grateful for this amazing community that has supported me through thick and thin. Your kindness has made a real difference in my life. #community #gratitude",
        "Today I want to share my testimony of how ImpactNet helped me start my small business. The training and funding changed everything for me and my family. Thank you! #testimony #empowerment",
        "Requesting support for my education. I'm currently pursuing a degree in Computer Science and need help with tuition fees. Any assistance would be greatly appreciated. #education #help #support",
        "Let's come together to support our community members in need. Every small act of kindness creates a ripple effect of positive change. #encouragement #impact"
      ];

      const categoryIndex = categories.findIndex(c => c.name === selectedCategory);
      setAiSuggestion(suggestions[categoryIndex] || suggestions[0]);
      setIsGeneratingAI(false);
    }, 1500);
  };

  const useAISuggestion = () => {
    setPostText(aiSuggestion);
    setShowAIAssist(false);
    setAiSuggestion('');
  };

  const handlePost = () => {
    if (!postText.trim() && selectedImages.length === 0) return;

    const newPost = {
      id: Date.now(),
      content: postText,
      category: selectedCategory,
      images: selectedImages,
      timestamp: 'Just now',
      likes: 0,
      comments: 0,
      isLiked: false,
      author: {
        name: 'You',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
        role: 'Member',
      },
    };

    if (onPostCreated) {
      onPostCreated(newPost);
    }

    // Reset form
    setPostText('');
    setSelectedImages([]);
    setSelectedCategory('Feed');
  };

  const emojis = ['😊', '❤️', '🙏', '💪', '✨', '🎉', '👏', '🔥', '💯', '🙌', '😢', '😅'];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></span>
        Create a Post
      </h2>

      <div className="flex gap-4">
        {/* Profile Picture */}
        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-blue-100">
          <Image
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&fit=crop&q=80"
            alt="Profile"
            width={48}
            height={48}
            className="object-cover"
          />
        </div>

        <div className="flex-1">
          {/* Category Selection */}
          <div className="flex gap-2 mb-3">
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedCategory === cat.name
                    ? `bg-${cat.color}-600 text-white shadow-md scale-105`
                    : `bg-${cat.color}-50 text-${cat.color}-700 hover:bg-${cat.color}-100`
                }`}
                style={{
                  backgroundColor: selectedCategory === cat.name
                    ? cat.color === 'blue' ? '#2563eb'
                    : cat.color === 'orange' ? '#ea580c'
                    : cat.color === 'green' ? '#16a34a'
                    : '#9333ea'
                    : cat.color === 'blue' ? '#eff6ff'
                    : cat.color === 'orange' ? '#fff7ed'
                    : cat.color === 'green' ? '#f0fdf4'
                    : '#faf5ff',
                  color: selectedCategory === cat.name
                    ? '#ffffff'
                    : cat.color === 'blue' ? '#1d4ed8'
                    : cat.color === 'orange' ? '#c2410c'
                    : cat.color === 'green' ? '#15803d'
                    : '#7e22ce'
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Text Area with smart features */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              placeholder="Share your story, ask for help, or encourage others... Use @ to mention people and # for hashtags"
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-800 placeholder-gray-400"
              value={postText}
              onChange={(e) => {
                setPostText(e.target.value);
                setCursorPosition(e.target.selectionStart);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  handlePost();
                }
              }}
            />

            {/* Mention Suggestions */}
            {showMentionSuggestions && (
              <div className="absolute left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-48 overflow-y-auto z-10">
                <div className="p-2 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                  <AtSign className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-semibold text-gray-700">Mention someone</span>
                </div>
                {mentionSuggestions.map((person) => (
                  <button
                    key={person.id}
                    onClick={() => insertMention(person.name)}
                    className="w-full px-3 py-2 hover:bg-blue-50 text-left flex items-center gap-2 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                      {person.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{person.name}</p>
                      <p className="text-xs text-gray-500">{person.role}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Hashtag Suggestions */}
            {showHashtagSuggestions && (
              <div className="absolute left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-48 overflow-y-auto z-10">
                <div className="p-2 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                  <Hash className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-semibold text-gray-700">Popular hashtags</span>
                </div>
                <div className="p-2 grid grid-cols-2 gap-2">
                  {hashtagSuggestions.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => insertHashtag(tag)}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition-colors text-left"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Rich Text Formatting Toolbar */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => applyFormatting('bold')}
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                  title="Bold"
                >
                  <Bold className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => applyFormatting('italic')}
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                  title="Italic"
                >
                  <Italic className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => applyFormatting('underline')}
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                  title="Underline"
                >
                  <Underline className="w-4 h-4 text-gray-600" />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-1"></div>
                <button
                  onClick={() => applyFormatting('list')}
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                  title="Bullet List"
                >
                  <List className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => applyFormatting('orderedList')}
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                  title="Numbered List"
                >
                  <ListOrdered className="w-4 h-4 text-gray-600" />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-1"></div>
                <button
                  onClick={generateAISuggestion}
                  disabled={isGeneratingAI}
                  className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  title="AI Writing Assistant"
                >
                  <Sparkles className={`w-4 h-4 ${isGeneratingAI ? 'animate-spin' : ''}`} />
                  <span className="text-xs font-medium">AI Assist</span>
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <AtSign className="w-3 h-3" />
                    @mention
                  </span>
                  <span className="flex items-center gap-1">
                    <Hash className="w-3 h-3" />
                    #hashtag
                  </span>
                </div>
                <span className={`text-xs ${postText.length > 500 ? 'text-red-600 font-semibold' : 'text-gray-400'}`}>
                  {postText.length}/1000
                </span>
              </div>
            </div>

            {/* AI Suggestion Box */}
            {showAIAssist && (
              <div className="mt-3 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      AI Writing Suggestion
                      {isGeneratingAI && <span className="text-xs text-purple-600 animate-pulse">Generating...</span>}
                    </h4>
                    {isGeneratingAI ? (
                      <div className="space-y-2">
                        <div className="h-4 bg-purple-200 rounded animate-pulse"></div>
                        <div className="h-4 bg-purple-200 rounded animate-pulse w-5/6"></div>
                        <div className="h-4 bg-purple-200 rounded animate-pulse w-4/6"></div>
                      </div>
                    ) : (
                      <>
                        <p className="text-gray-700 mb-3">{aiSuggestion}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={useAISuggestion}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
                          >
                            Use This
                          </button>
                          <button
                            onClick={generateAISuggestion}
                            className="px-4 py-2 bg-white border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 text-sm font-medium"
                          >
                            Generate Another
                          </button>
                          <button
                            onClick={() => setShowAIAssist(false)}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
                          >
                            Dismiss
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Selected Images Preview */}
          {selectedImages.length > 0 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {selectedImages.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group">
                  <Image
                    src={img}
                    alt={`Upload ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                  <button
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Selected Video Preview */}
          {selectedVideo && (
            <div className="mt-3 relative aspect-video rounded-lg overflow-hidden bg-gray-900 group">
              <video
                src={selectedVideo}
                controls
                className="w-full h-full"
              />
              <button
                onClick={removeVideo}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Video URL Input */}
          {showVideoInput && (
            <div className="mt-3 p-4 bg-purple-50 border-2 border-purple-200 rounded-xl">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Youtube className="w-5 h-5 text-red-600" />
                Add Video
              </h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Paste YouTube URL or video link"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="flex-1 px-4 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={addVideoFromURL}
                  disabled={!videoUrl.trim()}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-sm text-gray-600">Or upload from device:</span>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleVideoUpload}
                />
                <button
                  onClick={() => videoInputRef.current?.click()}
                  className="px-3 py-1.5 bg-white border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 text-sm"
                >
                  Browse Files
                </button>
                <button
                  onClick={() => setShowVideoInput(false)}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm ml-auto"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="flex gap-2">
              {/* Image Upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                title="Add images"
              >
                <ImageIcon className="w-5 h-5" />
              </button>

              {/* Video */}
              <button
                onClick={() => setShowVideoInput(!showVideoInput)}
                className="p-2 hover:bg-purple-50 text-purple-600 rounded-lg transition-colors"
                title="Add video"
              >
                <Film className="w-5 h-5" />
              </button>

              {/* Emoji Picker */}
              <div className="relative">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 hover:bg-yellow-50 text-yellow-600 rounded-lg transition-colors"
                  title="Add emoji"
                >
                  <Smile className="w-5 h-5" />
                </button>

                {showEmojiPicker && (
                  <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-10">
                    <div className="grid grid-cols-6 gap-2">
                      {emojis.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => insertEmoji(emoji)}
                          className="text-2xl hover:scale-125 transition-transform"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Location (placeholder) */}
              <button
                className="p-2 hover:bg-green-50 text-green-600 rounded-lg transition-colors"
                title="Add location (coming soon)"
              >
                <MapPin className="w-5 h-5" />
              </button>
            </div>

            {/* Post Button */}
            <button
              onClick={handlePost}
              disabled={!postText.trim() && selectedImages.length === 0}
              className={`px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${
                postText.trim() || selectedImages.length > 0
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:scale-105'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
              Post
            </button>
          </div>

          {/* Keyboard Shortcut Hint */}
          <p className="text-xs text-gray-400 mt-2 text-right">
            Press <kbd className="px-2 py-0.5 bg-gray-100 rounded border border-gray-300">Ctrl</kbd> + <kbd className="px-2 py-0.5 bg-gray-100 rounded border border-gray-300">Enter</kbd> to post
          </p>
        </div>
      </div>
    </div>
  );
}
