'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  ThumbsUp,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Heart,
  Send,
  X,
  Edit2,
  Trash2,
  Flag,
  Bookmark,
  Link as LinkIcon,
  Repeat2,
  Smile,
  ChevronDown,
  ChevronUp,
  Target,
  DollarSign,
  Users as UsersIcon,
  Clock,
  CheckCircle,
  TrendingUp,
} from 'lucide-react';
import { Post } from '../mockData';

interface Comment {
  id: number;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  replies?: Comment[];
}

interface EnhancedPostProps {
  post: Post;
  getCategoryColor: (category: string) => string;
}

// Recursive Comment Component for infinite threading
const CommentThread = ({
  comment,
  depth = 0,
  onLike,
  onReply
}: {
  comment: Comment;
  depth?: number;
  onLike: (id: number) => void;
  onReply: (id: number, name: string) => void;
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const hasReplies = comment.replies && comment.replies.length > 0;

  // Progressive indentation: Less space as depth increases
  // Level 0: no indent, Level 1: 48px, Level 2: 32px, Level 3+: 24px
  const getIndentation = () => {
    if (depth === 0) return '';
    if (depth === 1) return 'ml-12'; // 48px
    if (depth === 2) return 'ml-8';  // 32px
    return 'ml-6'; // 24px for level 3+
  };

  return (
    <div className={`${getIndentation()} ${depth > 0 ? 'mt-3' : ''}`}>
      <div className="flex gap-3">
        <div className={`${depth === 0 ? 'w-10 h-10' : 'w-8 h-8'} rounded-full overflow-hidden flex-shrink-0`}>
          <Image src={comment.author.avatar} alt={comment.author.name} width={depth === 0 ? 40 : 32} height={depth === 0 ? 40 : 32} className="object-cover" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`font-semibold ${depth === 0 ? 'text-base' : 'text-sm'} text-gray-900`}>{comment.author.name}</h4>
            <span className="text-xs text-gray-500">{comment.author.role}</span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500">{comment.timestamp}</span>
            {hasReplies && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="ml-2 text-gray-500 hover:text-gray-700 transition-colors"
                title={isCollapsed ? 'Expand thread' : 'Collapse thread'}
              >
                {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
            )}
          </div>
          <p className={`${depth === 0 ? 'text-base' : 'text-sm'} text-gray-800 leading-relaxed mb-2`}>{comment.content}</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => onLike(comment.id)}
              className={`text-xs font-medium transition-colors ${
                comment.isLiked ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <ThumbsUp className={`w-3.5 h-3.5 inline mr-1 ${comment.isLiked ? 'fill-blue-600' : ''}`} />
              {comment.likes > 0 && <span>{comment.likes}</span>}
              {comment.likes === 0 && <span>Like</span>}
            </button>
            <button
              onClick={() => onReply(comment.id, comment.author.name)}
              className="text-xs font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              Reply
            </button>
            {hasReplies && isCollapsed && (
              <span className="text-xs text-gray-500">
                {comment.replies!.length} {comment.replies!.length === 1 ? 'reply' : 'replies'} hidden
              </span>
            )}
          </div>

          {/* Recursive rendering of nested replies */}
          {hasReplies && !isCollapsed && (
            <div className="space-y-2">
              {comment.replies!.map((reply) => (
                <CommentThread
                  key={reply.id}
                  comment={reply}
                  depth={depth + 1}
                  onLike={onLike}
                  onReply={onReply}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function EnhancedPost({ post, getCategoryColor }: EnhancedPostProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likes, setLikes] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      author: {
        name: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
        role: 'Member',
      },
      content: 'This is amazing! So proud to be part of this community 🙏',
      timestamp: '2h ago',
      likes: 12,
      isLiked: false,
      replies: [
        {
          id: 11,
          author: {
            name: 'Michael Chen',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
            role: 'Member',
          },
          content: '@Sarah Johnson Absolutely! The impact is real',
          timestamp: '1h ago',
          likes: 5,
          isLiked: false,
          replies: [
            {
              id: 111,
              author: {
                name: 'Grace Adebayo',
                avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&q=80',
                role: 'Member',
              },
              content: '@Michael Chen I agree! This is transformative',
              timestamp: '45m ago',
              likes: 3,
              isLiked: false,
              replies: [
                {
                  id: 1111,
                  author: {
                    name: 'Emeka Nwosu',
                    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&q=80',
                    role: 'Volunteer',
                  },
                  content: '@Grace Adebayo Yes! Level 4 reply working perfectly! 🎉',
                  timestamp: '30m ago',
                  likes: 2,
                  isLiked: false,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 2,
      author: {
        name: 'David Okafor',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
        role: 'Volunteer',
      },
      content: 'Keep up the great work! This is what community is all about 💪',
      timestamp: '3h ago',
      likes: 8,
      isLiked: true,
    },
  ]);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSupporters, setShowSupporters] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
  };

  const handleCommentLike = (commentId: number) => {
    const updateCommentLikes = (comments: Comment[]): Comment[] => {
      return comments.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            isLiked: !comment.isLiked,
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
          };
        }
        if (comment.replies) {
          return {
            ...comment,
            replies: updateCommentLikes(comment.replies),
          };
        }
        return comment;
      });
    };
    setComments(updateCommentLikes(comments));
  };

  const handleComment = () => {
    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: Date.now(),
      author: {
        name: 'You',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80',
        role: 'Member',
      },
      content: commentText,
      timestamp: 'Just now',
      likes: 0,
      isLiked: false,
    };

    if (replyingTo) {
      const addReplyToComment = (comments: Comment[]): Comment[] => {
        return comments.map((comment) => {
          if (comment.id === replyingTo) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newComment],
            };
          }
          if (comment.replies) {
            return {
              ...comment,
              replies: addReplyToComment(comment.replies),
            };
          }
          return comment;
        });
      };
      setComments(addReplyToComment(comments));
      setReplyingTo(null);
    } else {
      setComments([newComment, ...comments]);
    }

    setCommentText('');
  };

  const handleMention = (name: string) => {
    setCommentText((prev) => prev + `@${name} `);
    commentInputRef.current?.focus();
  };

  const handleContribute = () => {
    setShowContributeModal(true);
    console.log('Opening contribute modal for goal:', post.goal);
  };

  const handleHelp = () => {
    console.log('Opening help modal for goal:', post.goal);
    alert(`Help with: ${post.goal?.target}\n\nThis feature will allow you to offer assistance or support for this goal.`);
  };

  const toggleSupporters = () => {
    setShowSupporters(!showSupporters);
  };

  const emojis = ['👍', '❤️', '😊', '🎉', '🙏', '💪', '🔥', '✨'];

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Post Header */}
        {post.author.isOrganization && post.helpDetails ? (
          <>
            {/* ImpactNet Organization Post */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{post.author.name}</h3>
                  <p className="text-sm text-blue-600">Impact Update</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(post.category)}`}>
                  {post.category}
                </span>
                <button
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
                >
                  <MoreHorizontal className="w-5 h-5 text-gray-600" />
                  {showMoreMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10">
                      <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2">
                        <Bookmark className="w-4 h-4" />
                        Save post
                      </button>
                      <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2">
                        <LinkIcon className="w-4 h-4" />
                        Copy link
                      </button>
                      <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-red-600">
                        <Flag className="w-4 h-4" />
                        Report post
                      </button>
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Beneficiary Card - Clean Design */}
            <div className="mb-4 p-6 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-2xl flex-shrink-0">
                  {post.helpDetails.beneficiary.charAt(0)}
                </div>
                <div className="flex-1">
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">{post.helpDetails.beneficiary}</h4>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-4 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-bold">
                      {post.helpDetails.amountSpent} Provided
                    </span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{post.helpDetails.story}</p>
                  {post.helpDetails.transactionId && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="font-semibold">Transaction ID:</span>
                        <span className="font-mono bg-gray-50 px-3 py-1.5 rounded border border-gray-200">{post.helpDetails.transactionId}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Images */}
            {post.images && post.images.length > 0 && (
              <div
                className={`grid gap-2 mb-4 ${
                  post.images.length === 1 ? 'grid-cols-1' : post.images.length === 2 ? 'grid-cols-2' : 'grid-cols-2'
                }`}
              >
                {post.images.map((img, idx) => (
                  <div
                    key={idx}
                    className={`relative rounded-xl overflow-hidden ${
                      post.images!.length === 1 ? 'h-96' : post.images!.length === 2 ? 'h-64' : idx === 0 ? 'h-64 col-span-2' : 'h-48'
                    }`}
                  >
                    <Image src={img} alt={`Impact photo ${idx + 1}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Regular User Post */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <Image src={post.author.avatar} alt={post.author.name} width={48} height={48} className="object-cover" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{post.author.name}</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-600">{post.author.role}</p>
                    <span className="text-gray-400">•</span>
                    <p className="text-sm text-gray-600">{post.timestamp}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(post.category)}`}>
                  {post.category}
                </span>
                <button
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
                >
                  <MoreHorizontal className="w-5 h-5 text-gray-600" />
                  {showMoreMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10">
                      <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2">
                        <Edit2 className="w-4 h-4" />
                        Edit post
                      </button>
                      <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2">
                        <Bookmark className="w-4 h-4" />
                        Save post
                      </button>
                      <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-red-600">
                        <Trash2 className="w-4 h-4" />
                        Delete post
                      </button>
                    </div>
                  )}
                </button>
              </div>
            </div>

            <p className="text-gray-800 mb-4 leading-relaxed whitespace-pre-wrap">{post.content}</p>

            {/* Images */}
            {post.images && post.images.length > 0 ? (
              <div
                className={`grid gap-2 mb-4 ${
                  post.images.length === 1 ? 'grid-cols-1' : post.images.length === 2 ? 'grid-cols-2' : 'grid-cols-2'
                }`}
              >
                {post.images.map((img, idx) => (
                  <div
                    key={idx}
                    className={`relative rounded-xl overflow-hidden ${
                      post.images!.length === 1 ? 'h-96' : post.images!.length === 2 ? 'h-64' : idx === 0 ? 'h-64 col-span-2' : 'h-48'
                    }`}
                  >
                    <Image src={img} alt={`Post image ${idx + 1}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            ) : post.image ? (
              <div className="relative h-96 rounded-xl overflow-hidden mb-4">
                <Image src={post.image} alt="Post image" fill className="object-cover" />
              </div>
            ) : null}

            {/* Goal Progress - Professional Clean Design */}
            {post.goal && (
              <div className="my-6 bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-2xl p-6">
                {post.goal.type === 'money' ? (
                  <div className="space-y-5">
                    {/* Amount Raised */}
                    <div>
                      <h3 className="text-3xl font-bold text-gray-900 mb-1">
                        ${typeof post.goal.raised === 'number' ? post.goal.raised.toLocaleString() : post.goal.raised}
                      </h3>
                      <p className="text-sm text-gray-600">
                        raised of ${typeof post.goal.target === 'number' ? post.goal.target.toLocaleString() : post.goal.target} goal
                      </p>
                    </div>

                    {/* Clean Progress Bar */}
                    <div className="relative">
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${
                              typeof post.goal.target === 'number' && typeof post.goal.raised === 'number'
                                ? Math.min((post.goal.raised / post.goal.target) * 100, 100)
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-6">
                        <div>
                          <p className="font-semibold text-blue-600">
                            {typeof post.goal.target === 'number' && typeof post.goal.raised === 'number'
                              ? Math.round((post.goal.raised / post.goal.target) * 100)
                              : 0}%
                          </p>
                          <p className="text-xs text-gray-500">funded</p>
                        </div>
                        {post.goal.supporters && post.goal.supporters.length > 0 && (
                          <div>
                            <p className="font-semibold text-gray-900">{post.goal.supporters.length}</p>
                            <p className="text-xs text-gray-500">supporters</p>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={handleContribute}
                        className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                      >
                        Support
                      </button>
                    </div>

                    {/* Top Supporters Preview */}
                    {post.goal.supporters && post.goal.supporters.length > 0 && (
                      <div className="pt-4 border-t border-blue-100">
                        <button
                          onClick={toggleSupporters}
                          className="flex items-center gap-3 w-full hover:opacity-80 transition-opacity group"
                        >
                          <div className="flex -space-x-3">
                            {post.goal.supporters
                              .sort((a, b) => b.amount - a.amount)
                              .slice(0, 4)
                              .map((supporter, index) => (
                                <div
                                  key={index}
                                  className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm"
                                  title={supporter.name}
                                >
                                  <Image src={supporter.avatar} alt={supporter.name} width={40} height={40} className="object-cover" />
                                </div>
                              ))}
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                              View all supporters
                            </p>
                            <p className="text-xs text-gray-500">
                              {post.goal.supporters[0].name} and {post.goal.supporters.length - 1} others
                            </p>
                          </div>
                          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showSupporters ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Non-money goals */
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Goal</p>
                      <p className="text-lg font-semibold text-gray-900">{post.goal.target}</p>
                    </div>
                    <button
                      onClick={handleHelp}
                      className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
                    >
                      Help
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Supporters List - Thread Style with Better Spacing */}
            {showSupporters && post.goal && post.goal.supporters && post.goal.supporters.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-6">
                  Supporters ({post.goal.supporters.length})
                </h4>
                <div className="space-y-4">
                  {post.goal.supporters
                    .sort((a, b) => b.amount - a.amount)
                    .map((supporter, index) => (
                      <div key={index} className="bg-gray-50 rounded-xl p-5 hover:bg-gray-100 transition-colors">
                        {/* Supporter Header - Like Comment Thread */}
                        <div className="flex items-start gap-4">
                          {/* Large Profile Image */}
                          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                            <Image src={supporter.avatar} alt={supporter.name} width={56} height={56} className="object-cover" />
                          </div>

                          <div className="flex-1 min-w-0">
                            {/* Name and Amount */}
                            <div className="flex items-baseline justify-between mb-2">
                              <div>
                                <h5 className="text-base font-semibold text-gray-900">{supporter.name}</h5>
                                <p className="text-sm text-gray-500">{supporter.timestamp}</p>
                              </div>
                              <div className="text-right ml-4">
                                <p className="text-xl font-bold text-blue-500">${supporter.amount}</p>
                              </div>
                            </div>

                            {/* Thank You Message Area */}
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <p className="text-sm text-gray-600 italic mb-3">
                                Thank you for your generous support! 🙏
                              </p>

                              {/* Comment Actions - Like Thread */}
                              <div className="flex items-center gap-4 text-xs">
                                <button className="text-gray-500 hover:text-blue-500 font-medium transition-colors">
                                  Reply
                                </button>
                                <button className="text-gray-500 hover:text-red-500 font-medium transition-colors">
                                  ❤️ Thank
                                </button>
                                <span className="text-gray-400">•</span>
                                <span className="text-gray-500">0 replies</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Interaction Stats */}
        <div className="flex items-center justify-between py-3 border-y border-gray-200 my-4">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <ThumbsUp className="w-4 h-4 fill-blue-500 text-blue-500" />
              {likes.toLocaleString()}
            </span>
            <span>{comments.length} comments</span>
            <span>{post.shares || 0} shares</span>
          </div>
        </div>

        {/* Interaction Buttons */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={handleLike}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-all font-medium ${
              isLiked ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ThumbsUp className={`w-5 h-5 ${isLiked ? 'fill-blue-600' : ''}`} />
            <span>Like</span>
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Comment</span>
          </button>
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium relative"
          >
            <Share2 className="w-5 h-5" />
            <span>Share</span>
            {showShareMenu && (
              <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10">
                <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2">
                  <Repeat2 className="w-4 h-4" />
                  Repost
                </button>
                <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Copy link
                </button>
                <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Send via message
                </button>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-200 bg-gray-50">
          {/* Comment Input */}
          <div className="p-4 bg-white border-b border-gray-200">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80"
                  alt="You"
                  width={40}
                  height={40}
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                {replyingTo && (
                  <div className="mb-2 flex items-center justify-between bg-blue-50 px-3 py-2 rounded-lg">
                    <span className="text-sm text-blue-700">
                      Replying to{' '}
                      <strong>
                        {comments.find((c) => c.id === replyingTo)?.author.name ||
                          comments.find((c) => c.replies?.some((r) => r.id === replyingTo))?.replies?.find((r) => r.id === replyingTo)?.author.name}
                      </strong>
                    </span>
                    <button onClick={() => setReplyingTo(null)} className="text-blue-700 hover:text-blue-900">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <div className="relative">
                  <textarea
                    ref={commentInputRef}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={replyingTo ? 'Write a reply...' : 'Write a comment...'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={2}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                        handleComment();
                      }
                    }}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
                      >
                        <Smile className="w-5 h-5 text-gray-600" />
                        {showEmojiPicker && (
                          <div className="absolute bottom-full left-0 mb-2 bg-white rounded-xl shadow-lg border border-gray-200 p-3 flex gap-2 z-10">
                            {emojis.map((emoji) => (
                              <button
                                key={emoji}
                                onClick={() => {
                                  setCommentText((prev) => prev + emoji);
                                  setShowEmojiPicker(false);
                                }}
                                className="text-2xl hover:scale-125 transition-transform"
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}
                      </button>
                    </div>
                    <button
                      onClick={handleComment}
                      disabled={!commentText.trim()}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      <Send className="w-4 h-4" />
                      {replyingTo ? 'Reply' : 'Comment'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Comments List - Recursive Tree Structure */}
          <div className="max-h-[500px] overflow-y-auto">
            {comments.map((comment) => (
              <div key={comment.id} className="p-4 hover:bg-gray-50 transition-colors">
                <CommentThread
                  comment={comment}
                  depth={0}
                  onLike={handleCommentLike}
                  onReply={(id, name) => {
                    setReplyingTo(id);
                    handleMention(name);
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
