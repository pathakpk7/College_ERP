import React, { useEffect, useState } from 'react';
import { getCaptcha } from '../../services/authService';
import { RefreshCw, ShieldCheck } from 'lucide-react';

export default function CaptchaWidget({ onCaptchaChange, value, onChange }) {
  const [captchaData, setCaptchaData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCaptcha = async () => {
    setLoading(true);
    try {
      const data = await getCaptcha();
      setCaptchaData(data);
      if (onCaptchaChange) {
        onCaptchaChange(data.captcha_id);
      }
    } catch (err) {
      console.error('Failed to load captcha:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-slate-300">Security Verification (Captcha)</label>
      <div className="flex items-center space-x-3">
        {loading || !captchaData ? (
          <div className="w-40 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-xs text-slate-500 animate-pulse">
            Loading Captcha...
          </div>
        ) : (
          <div className="relative border border-slate-700 rounded-xl overflow-hidden shadow-inner">
            <img src={captchaData.captcha_image} alt="Captcha Challenge" className="h-12 w-40 object-cover" />
          </div>
        )}
        <button
          type="button"
          onClick={fetchCaptcha}
          disabled={loading}
          title="Refresh Captcha"
          className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 transition shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="relative mt-2">
        <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter the 5 characters shown above"
          className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 uppercase tracking-widest font-mono font-bold"
        />
      </div>
    </div>
  );
}
