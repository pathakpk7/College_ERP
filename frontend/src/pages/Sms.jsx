import React, { useEffect, useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getMessages, sendMessage, getMessageRecipients } from '../services/erpService';
import { MessageSquare, Send, CheckCircle2 } from 'lucide-react';

export default function Sms() {
  const [messages, setMessages] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    receiver_username: '',
    subject: '',
    content: '',
    is_grievance: false,
  });
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [msgsRes, recRes] = await Promise.all([
        getMessages(),
        getMessageRecipients(),
      ]);
      setMessages(msgsRes);
      setRecipients(recRes);
      if (recRes.length > 0) {
        setForm(prev => ({ ...prev, receiver_username: recRes[0].username }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    setSuccess(null);
    try {
      await sendMessage(form);
      setSuccess(form.is_grievance ? 'Grievance ticket filed successfully!' : 'Message sent successfully!');
      setForm(prev => ({ ...prev, subject: '', content: '', is_grievance: false }));
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  if (loading) return <PageContainer><LoadingSpinner message="Fetching messages & recipients..." /></PageContainer>;

  return (
    <PageContainer>
      {/* Send Message / Grievance Form */}
      <Card title="Send Message or File Grievance Ticket" icon={MessageSquare}>
        {success && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{success}</span>
          </div>
        )}
        <form onSubmit={handleSend} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Select Recipient</label>
              <select
                value={form.receiver_username}
                onChange={(e) => setForm({ ...form, receiver_username: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                {recipients.map((r) => (
                  <option key={r.username} value={r.username}>
                    {r.username} ({r.role})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Subject</label>
              <input
                type="text"
                required
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Message or grievance subject"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Content / Explanation</label>
            <textarea
              required
              rows={3}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Type your message or details regarding grievance..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_grievance"
              checked={form.is_grievance}
              onChange={(e) => setForm({ ...form, is_grievance: e.target.checked })}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="is_grievance" className="font-semibold text-slate-700 cursor-pointer">
              Mark as Official Grievance Ticket (Requires Admin/Faculty Review)
            </label>
          </div>

          <button
            type="submit"
            disabled={sending}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50 inline-flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>{sending ? 'Sending...' : 'Send Message / Submit Ticket'}</span>
          </button>
        </form>
      </Card>

      {/* Messages Inbox */}
      <Card title="Messages & Ticket Inbox">
        <div className="space-y-3">
          {messages.map((m) => (
            <div key={m.id} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900 text-xs">{m.subject}</span>
                  {m.is_grievance && (
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-bold text-[10px]">
                      GRIEVANCE ({m.grievance_status})
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-400 font-mono">{new Date(m.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{m.content}</p>
              <div className="text-[11px] text-slate-500 font-medium">
                From: <span className="font-semibold text-slate-800">{m.sender_name}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </PageContainer>
  );
}
