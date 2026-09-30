import React, { useState, useEffect } from 'react';
import {
  Users,
  MessageCircle,
  Heart,
  Send,
  PlusCircle,
  Sparkles,
  MapPin,
  Calendar,
  Search,
  Filter,
  Image as ImageIcon,
  Share2,
  CheckCircle2,
  AlertCircle,
  X,
  MessageSquare,
  ThumbsUp,
  Tag
} from 'lucide-react';
import { ForumPost, ForumComment } from '../types';

export const AgriculturalForum: React.FC = () => {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
  
  // New Post Form State
  const [showNewPostModal, setShowNewPostModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newContent, setNewContent] = useState<string>('');
  const [newAuthor, setNewAuthor] = useState<string>('');
  const [newLocation, setNewLocation] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('نصائح وتجارب زراعية');
  const [newImage, setNewImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Commenting State (keyed by post ID)
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<string>('');
  const [commentAuthor, setCommentAuthor] = useState<string>('');
  const [isCommenting, setIsCommenting] = useState<boolean>(false);

  // Liked posts tracking in session
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

  const categories = [
    'الكل',
    'نصائح وتجارب زراعية',
    'استفسارات الري والآبار',
    'مكافحة الآفات والأمراض',
    'محاصيل وفواكه موسمية',
    'بذور وأسمدة',
    'معدات وآلات فلاحية',
  ];

  // Fetch posts from server
  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/forum/posts');
      const data = await res.json();
      if (data.success && Array.isArray(data.posts)) {
        setPosts(data.posts);
      }
    } catch (err) {
      console.error('Error fetching forum posts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Handle Photo selection for new post
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit New Post
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      setFormError('يرجى ملء عنوان وتفاصيل المشاركة.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch('/api/forum/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          content: newContent.trim(),
          author: newAuthor.trim() || 'مزارع مبدع',
          location: newLocation.trim() || 'العالم العربي',
          category: newCategory,
          imageBase64: newImage,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'فشل نشر المشاركة.');
      }

      // Add to local state immediately
      setPosts((prev) => [data.post, ...prev]);

      // Reset form
      setNewTitle('');
      setNewContent('');
      setNewAuthor('');
      setNewLocation('');
      setNewImage(null);
      setShowNewPostModal(false);
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || 'حدث خطأ أثناء النشر.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Like a post
  const handleLike = async (postId: string) => {
    if (likedPosts[postId]) return; // prevent spamming like

    // Optimistic UI update
    setLikedPosts((prev) => ({ ...prev, [postId]: true }));
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likes: (p.likes || 0) + 1 } : p))
    );

    try {
      await fetch(`/api/forum/posts/${postId}/like`, { method: 'POST' });
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  // Add Comment to Post
  const handleAddComment = async (postId: string) => {
    if (!commentText.trim() || isCommenting) return;

    setIsCommenting(true);
    try {
      const res = await fetch(`/api/forum/posts/${postId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: commentAuthor.trim() || 'فلاح مشارك',
          content: commentText.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && data.comment) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, comments: [...(p.comments || []), data.comment] }
              : p
          )
        );
        setCommentText('');
      }
    } catch (err) {
      console.error('Error commenting:', err);
    } finally {
      setIsCommenting(false);
    }
  };

  // Filter posts by search query and category
  const filteredPosts = posts.filter((post) => {
    const matchesCategory =
      selectedCategory === 'الكل' || post.category === selectedCategory;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      post.title.toLowerCase().includes(query) ||
      post.content.toLowerCase().includes(query) ||
      post.author.toLowerCase().includes(query) ||
      post.location.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fadeIn text-slate-800">
      
      {/* Forum Header Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-8 border border-emerald-500/25">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full">
              <Users className="w-3.5 h-3.5 text-emerald-700" />
              <span>منتدى مجتمع المزارعين والخبراء (مفتوح للجميع)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              ملتقى الفلاحين وتبادل التجارب الزراعية
            </h1>
            <p className="text-slate-600 text-sm max-w-2xl leading-relaxed">
              شارك تجاربك في الحقل، اسأل عن حلول الآفات ونظم الري، وتبادل النصائح مع مزارعين ومهندسين من مختلف الدول. <span className="font-bold text-emerald-800">المنتدى متاح للجميع بدون تسجيل وجميع المشاركات محفوظة دائماً في قاعدة البيانات.</span>
            </p>
          </div>

          <button
            onClick={() => setShowNewPostModal(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-[0_4px_20px_rgba(5,150,105,0.25)] transition-all cursor-pointer self-start md:self-center shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>أضف مشاركة / تجربة جديدة</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-3xl p-5 border border-emerald-500/20 space-y-4">
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
            <input
              type="text"
              placeholder="ابحث عن تجربة، محصول، نوع سماد، أو مشكلة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full glass-input text-slate-900 text-xs sm:text-sm pr-10 pl-4 py-2.5 rounded-2xl focus:outline-none border-slate-300"
            />
          </div>

          {/* Quick Refresh */}
          <button
            onClick={fetchPosts}
            className="px-4 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-all cursor-pointer shrink-0 flex items-center justify-center gap-1.5"
          >
            <span>تحديث المشاركات</span>
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-800'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

      </div>

      {/* Posts Feed */}
      {isLoading ? (
        <div className="p-12 text-center rounded-3xl glass-panel border border-emerald-500/20 space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-bold">جاري تحميل مشاركات وتجارب المزارعين...</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="p-12 text-center rounded-3xl glass-panel border border-emerald-500/20 space-y-3">
          <MessageSquare className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">لا توجد مشاركات في هذا التصنيف حالياً</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            كن أول من يشارك تجربة أو يطرح سؤالاً يستفيد منه جميع المزارعين!
          </p>
          <button
            onClick={() => setShowNewPostModal(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-all cursor-pointer"
          >
            أضف أول مشاركة الآن
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredPosts.map((post) => {
            const isLiked = likedPosts[post.id];
            const isCommentBoxOpen = activeCommentPostId === post.id;

            return (
              <article
                key={post.id}
                className="rounded-3xl glass-panel p-5 sm:p-7 border border-emerald-500/25 space-y-4 hover:border-emerald-500/40 transition-all shadow-xs"
              >
                {/* Post Author & Meta Header */}
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 border border-emerald-300 text-emerald-800 flex items-center justify-center font-bold text-sm shadow-2xs">
                      {post.author ? post.author.slice(0, 2) : 'فل'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{post.author}</span>
                        {post.location && (
                          <span className="flex items-center gap-1 text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                            <MapPin className="w-3 h-3 text-emerald-600" />
                            <span>{post.location}</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{post.createdAt}</span>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl">
                    {post.category}
                  </span>
                </div>

                {/* Post Title & Content */}
                <div className="space-y-2">
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {post.content}
                  </p>
                </div>

                {/* Attached Image if present */}
                {post.imageBase64 && (
                  <div className="rounded-2xl overflow-hidden border border-slate-200 max-h-80 bg-slate-50 flex items-center justify-center">
                    <img
                      src={post.imageBase64}
                      alt={post.title}
                      className="max-h-80 w-auto object-contain rounded-2xl"
                    />
                  </div>
                )}

                {/* Actions Bar: Likes, Comments Toggle */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-3">
                    {/* Like Button */}
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-bold ${
                        isLiked
                          ? 'bg-rose-50 border-rose-300 text-rose-600'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-rose-200 hover:text-rose-600'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                      <span>{post.likes || 0}</span>
                      <span className="hidden xs:inline">إعجاب</span>
                    </button>

                    {/* Comments Toggle Button */}
                    <button
                      onClick={() =>
                        setActiveCommentPostId(isCommentBoxOpen ? null : post.id)
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-800 transition-all cursor-pointer font-bold"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{post.comments ? post.comments.length : 0}</span>
                      <span>تعليقات</span>
                    </button>
                  </div>

                  <span className="text-[11px] text-slate-400 font-medium">
                    مشاركة مفتوحة لجميع الفلاحين
                  </span>
                </div>

                {/* Comments Section */}
                {isCommentBoxOpen && (
                  <div className="pt-3 border-t border-slate-100 space-y-3 animate-fadeIn">
                    
                    {/* Existing Comments List */}
                    {post.comments && post.comments.length > 0 ? (
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {post.comments.map((comment) => (
                          <div
                            key={comment.id}
                            className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800">{comment.author}</span>
                              <span className="text-[10px] text-slate-400">{comment.createdAt}</span>
                            </div>
                            <p className="text-slate-600 leading-relaxed">{comment.content}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 py-1">لا توجد تعليقات بعد، كن أول من يعلّق!</p>
                    )}

                    {/* Add Comment Input */}
                    <div className="flex flex-col sm:flex-row gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="اسمك (اختياري)..."
                        value={commentAuthor}
                        onChange={(e) => setCommentAuthor(e.target.value)}
                        className="w-full sm:w-36 glass-input text-slate-900 text-xs px-3 py-2 rounded-xl focus:outline-none border-slate-300"
                      />
                      <input
                        type="text"
                        placeholder="اكتب تعليقك أو نصيحتك هنا..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddComment(post.id);
                          }
                        }}
                        className="flex-1 glass-input text-slate-900 text-xs px-3 py-2 rounded-xl focus:outline-none border-slate-300"
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        disabled={!commentText.trim() || isCommenting}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs disabled:opacity-50 transition-all cursor-pointer shrink-0 flex items-center justify-center gap-1"
                      >
                        <Send className="w-3.5 h-3.5 rotate-180" />
                        <span>إرسال</span>
                      </button>
                    </div>

                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* New Post Modal */}
      {showNewPostModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="relative w-full max-w-xl rounded-3xl bg-white border border-emerald-500/30 p-6 sm:p-8 shadow-2xl space-y-5 my-8">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  إضافة مشاركة أو تجربة فلاحية جديدة
                </h3>
              </div>
              <button
                onClick={() => setShowNewPostModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreatePost} className="space-y-4 text-xs sm:text-sm">
              
              {formError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  عنوان المشاركة / السؤال: <span className="text-emerald-700">*</span>
                </label>
                <input
                  type="text"
                  placeholder="مثلاً: تجربتي في زراعة البطاطس بنظام الري بالتنقيط في الصيف..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full glass-input text-slate-900 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl focus:outline-none border-slate-300"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  التصنيف:
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full glass-input text-slate-900 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl focus:outline-none border-slate-300 bg-white"
                >
                  {categories.filter((c) => c !== 'الكل').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Author & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    اسمك أو لقبك (بدون تسجيل):
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: فلاح من القصيم / أبو أحمد"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    className="w-full glass-input text-slate-900 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    المدينة / الدولة:
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: وادي سوف، الجزائر / الجيزة، مصر"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full glass-input text-slate-900 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none border-slate-300"
                  />
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  تفاصيل التجربة أو السؤال: <span className="text-emerald-700">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="اكتب تجربتك بالتفصيل، النتائج التي لاحظتها، المواد المستخدمة، أو نصائحك لزملائك الفلاحين..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full glass-input text-slate-900 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl focus:outline-none border-slate-300 resize-none"
                  required
                />
              </div>

              {/* Optional Photo Attachment */}
              <div>
                <label className="block font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-emerald-600" />
                  <span>إرفاق صورة من الحقل أو المحصول (اختياري):</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-xs text-slate-600 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-800 hover:file:bg-emerald-100 cursor-pointer"
                />
                {newImage && (
                  <div className="mt-2 relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200">
                    <img src={newImage} alt="المعاينة" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setNewImage(null)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-0.5 text-[10px]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNewPostModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-all cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>جاري النشر...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>نشر في المنتدى فوراً</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
