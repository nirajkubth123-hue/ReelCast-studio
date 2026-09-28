import React, { useState, useEffect } from 'react';
import {
  Star,
  MessageSquareHeart,
  X,
  Send,
  CheckCircle2,
  Sparkles,
  ThumbsUp,
  User,
  Heart,
  MessageSquare
} from 'lucide-react';

export interface UserReview {
  id: string;
  name: string;
  role: string;
  rating: number;
  comment: string;
  category: 'feature' | 'speed' | 'ux' | 'general';
  createdAt: string;
  likes: number;
}

const INITIAL_REVIEWS: UserReview[] = [
  {
    id: 'rev-1',
    name: 'Sarah Jenkins',
    role: 'Content Creator (140k followers)',
    rating: 5,
    comment: 'Reelcast cut down my daily workflow from 45 minutes to 4 minutes! The aspect ratio detection and AI hashtags for Reels and Shorts are unmatched.',
    category: 'speed',
    createdAt: '2 days ago',
    likes: 18
  },
  {
    id: 'rev-2',
    name: 'Alex Rivera',
    role: 'Digital Agency Director',
    rating: 5,
    comment: 'The live phone preview simulator gives our clients exact visual assurance before anything goes live. Essential for multi-channel video campaigns.',
    category: 'ux',
    createdAt: '5 days ago',
    likes: 12
  },
  {
    id: 'rev-3',
    name: 'Priya Sharma',
    role: 'E-commerce Brand Owner',
    rating: 5,
    comment: 'Being able to auto-save and preserve caption drafts without losing text between tabs is a lifesaver. Fantastic app!',
    category: 'feature',
    createdAt: '1 week ago',
    likes: 9
  }
];

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessNotification?: (msg: string) => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  onSuccessNotification
}) => {
  const [reviews, setReviews] = useState<UserReview[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('reelcast_user_reviews');
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading reviews', e);
      }
    }
    return INITIAL_REVIEWS;
  });

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [category, setCategory] = useState<'feature' | 'speed' | 'ux' | 'general'>('general');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  useEffect(() => {
    try {
      localStorage.setItem('reelcast_user_reviews', JSON.stringify(reviews));
    } catch (e) {
      console.error('Error saving reviews', e);
    }
  }, [reviews]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const newReview: UserReview = {
      id: `rev-${Date.now()}`,
      name: name.trim() || 'Fellow Creator',
      role: role.trim() || 'Verified User',
      rating,
      comment: comment.trim(),
      category,
      createdAt: 'Just now',
      likes: 0
    };

    setReviews(prev => [newReview, ...prev]);
    setSubmitted(true);
    if (onSuccessNotification) {
      onSuccessNotification('Thank you! Your feedback helps improve Reelcast Social Studio.');
    }

    setTimeout(() => {
      setName('');
      setRole('');
      setComment('');
      setSubmitted(false);
    }, 2500);
  };

  const handleLike = (id: string) => {
    setReviews(prev =>
      prev.map(r => (r.id === id ? { ...r, likes: r.likes + 1 } : r))
    );
  };

  const filteredReviews = activeFilter === 'all'
    ? reviews
    : reviews.filter(r => r.category === activeFilter);

  const averageRating = (
    reviews.reduce((acc, curr) => acc + curr.rating, 0) / (reviews.length || 1)
  ).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-[#151922] border border-[#e4e1da] dark:border-[#262c3a] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-[#ece8df] dark:border-[#222836] bg-gradient-to-r from-amber-500/5 via-rose-500/5 to-purple-500/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-md">
              <MessageSquareHeart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#14181f] dark:text-[#f1f3f7] flex items-center gap-2">
                Community Reviews & Feedback
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                  ★ {averageRating} / 5.0
                </span>
              </h3>
              <p className="text-xs text-[#6b6f76] dark:text-[#9aa1b0]">
                Help us improve Reelcast! Share your ideas, experience, and suggestions.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#6b6f76] hover:text-[#14181f] dark:hover:text-white rounded-lg hover:bg-[#ece8df] dark:hover:bg-[#202735] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Submission Form */}
          <div className="bg-[#f7f6f3] dark:bg-[#1a202c] border border-[#e4e1da] dark:border-[#262c3a] rounded-xl p-4 sm:p-5">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-6 text-center animate-in fade-in">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-2 animate-bounce" />
                <h4 className="font-bold text-base text-[#14181f] dark:text-[#f1f3f7]">
                  Thank you for your valuable feedback!
                </h4>
                <p className="text-xs text-[#6b6f76] dark:text-[#9aa1b0] mt-1 max-w-sm">
                  Your review has been saved to the community board to help us continually build a better video publishing experience.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#6b6f76] dark:text-[#9aa1b0]">
                      Your Rating
                    </span>
                    <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 text-amber-400 hover:scale-110 transition-transform"
                        >
                          <Star
                            className="w-6 h-6"
                            fill={(hoverRating || rating) >= star ? 'currentColor' : 'none'}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400 ml-2">
                        {rating === 5 ? 'Exceptional!' : rating === 4 ? 'Very Good' : rating === 3 ? 'Average' : 'Needs Work'}
                      </span>
                    </div>
                  </div>

                  {/* Category Selector */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#6b6f76] dark:text-[#9aa1b0] mb-1">
                      Feedback Type
                    </label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value as any)}
                      className="text-xs font-medium bg-white dark:bg-[#151922] border border-[#e4e1da] dark:border-[#262c3a] rounded-lg px-2.5 py-1.5 text-[#14181f] dark:text-[#f1f3f7] focus:outline-hidden"
                    >
                      <option value="general">🌟 General Experience</option>
                      <option value="feature">💡 Feature Suggestion</option>
                      <option value="speed">⚡ Speed & Performance</option>
                      <option value="ux">🎨 Design & UI / Preview</option>
                    </select>
                  </div>
                </div>

                {/* Name & Role */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#6b6f76] dark:text-[#9aa1b0] mb-1">
                      Your Name / Handle (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Maya Lin"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full text-xs bg-white dark:bg-[#151922] border border-[#e4e1da] dark:border-[#262c3a] rounded-lg px-3 py-2 text-[#14181f] dark:text-[#f1f3f7] placeholder-[#9ca3af] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#6b6f76] dark:text-[#9aa1b0] mb-1">
                      Role / Channel (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. YouTube Shorts Creator"
                      value={role}
                      onChange={e => setRole(e.target.value)}
                      className="w-full text-xs bg-white dark:bg-[#151922] border border-[#e4e1da] dark:border-[#262c3a] rounded-lg px-3 py-2 text-[#14181f] dark:text-[#f1f3f7] placeholder-[#9ca3af] focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Review Text */}
                <div>
                  <label className="block text-xs font-medium text-[#6b6f76] dark:text-[#9aa1b0] mb-1">
                    What did you love or what should we improve? <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Tell us what features you would love next (e.g., auto-subtitles, TikTok direct API, analytics tracking)..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    className="w-full text-xs bg-white dark:bg-[#151922] border border-[#e4e1da] dark:border-[#262c3a] rounded-lg p-3 text-[#14181f] dark:text-[#f1f3f7] placeholder-[#9ca3af] focus:outline-hidden resize-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white rounded-lg text-xs font-semibold shadow-xs transition-all hover:shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Review</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Reviews List Header & Filter */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#6b6f76] dark:text-[#9aa1b0] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Recent User Reviews ({reviews.length})
              </h4>

              <div className="flex items-center gap-1">
                {['all', 'feature', 'speed', 'ux'].map(f => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`text-[11px] px-2 py-0.5 rounded-full capitalize transition-colors ${
                      activeFilter === f
                        ? 'bg-amber-500 text-white font-semibold'
                        : 'text-[#6b6f76] dark:text-[#9aa1b0] hover:bg-[#ece8df] dark:hover:bg-[#202735]'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="space-y-3">
              {filteredReviews.map(r => (
                <div
                  key={r.id}
                  className="p-3.5 bg-white dark:bg-[#151922] border border-[#e4e1da] dark:border-[#262c3a] rounded-xl hover:border-amber-400/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 to-amber-500 text-white text-[11px] font-bold flex items-center justify-center">
                        {r.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-[#14181f] dark:text-[#f1f3f7]">
                            {r.name}
                          </span>
                          <span className="text-[10px] text-[#6b6f76] dark:text-[#9aa1b0]">
                            • {r.role}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5 mt-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className="w-3 h-3 text-amber-400"
                              fill={i < r.rating ? 'currentColor' : 'none'}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] text-[#6b6f76] dark:text-[#9aa1b0]">
                      {r.createdAt}
                    </span>
                  </div>

                  <p className="text-xs text-[#374151] dark:text-[#d1d5db] mt-2.5 leading-relaxed">
                    {r.comment}
                  </p>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#f2eee6] dark:border-[#202735] text-[11px] text-[#6b6f76] dark:text-[#9aa1b0]">
                    <span className="capitalize px-2 py-0.5 rounded bg-[#f7f6f3] dark:bg-[#1a202c] text-[10px]">
                      🏷️ {r.category}
                    </span>
                    <button
                      onClick={() => handleLike(r.id)}
                      className="flex items-center gap-1 text-[#6b6f76] hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>Helpful ({r.likes})</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#fbfaf8] dark:bg-[#121620] border-t border-[#ece8df] dark:border-[#222836] flex items-center justify-between shrink-0">
          <span className="text-[11px] text-[#6b6f76] dark:text-[#9aa1b0]">
            ⭐ Reviews are saved locally and used for ongoing roadmap improvement
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-[#14181f] dark:text-white bg-white dark:bg-[#1c222e] hover:bg-[#f2efe9] dark:hover:bg-[#252c3c] border border-[#e4e1da] dark:border-[#262c3a] rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
