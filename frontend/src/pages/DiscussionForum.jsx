import React, { useEffect, useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getForumPosts, createForumPost } from '../services/erpService';
import { MessagesSquare, PlusCircle, User, MessageCircle } from 'lucide-react';

export default function DiscussionForum() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', content: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await getForumPosts();
      setPosts(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createForumPost(form);
      setForm({ title: '', content: '' });
      fetchPosts();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <PageContainer><LoadingSpinner message="Fetching forum posts..." /></PageContainer>;

  return (
    <PageContainer>
      {/* Create New Post Card */}
      <Card title="Start a New Discussion" icon={PlusCircle}>
        <form onSubmit={handleCreatePost} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Post Title</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="What question or topic would you like to discuss?"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Post Description</label>
            <textarea
              required
              rows={3}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Provide background context or detailed code snippet..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50"
          >
            {creating ? 'Publishing...' : 'Publish Discussion Post'}
          </button>
        </form>
      </Card>

      {/* Community Posts */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900">Community Discussion Feed</h3>
        {posts.map((p) => (
          <Card key={p.id}>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">
                    {p.author_name[0].toUpperCase()}
                  </div>
                  <span className="font-bold text-slate-900">{p.author_name}</span>
                </div>
                <span className="text-slate-400 font-mono text-[11px]">{new Date(p.created_at).toLocaleDateString()}</span>
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm">{p.title}</h4>
              <p className="text-slate-700 leading-relaxed">{p.content}</p>

              {/* Comments */}
              <div className="pt-2 space-y-2 border-t border-slate-100">
                <div className="flex items-center space-x-1.5 text-slate-500 font-semibold text-[11px]">
                  <MessageCircle className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Replies ({p.comments.length})</span>
                </div>
                {p.comments.map((c) => (
                  <div key={c.id} className="p-2.5 bg-slate-50 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-bold text-slate-800">{c.author_name}</span>
                      <span className="text-slate-400">{new Date(c.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-600">{c.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
