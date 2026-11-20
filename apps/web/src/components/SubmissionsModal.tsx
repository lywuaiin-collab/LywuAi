import React, { useEffect, useState } from 'react';
import type { Site, Submission } from '@lywuai/shared';
import { fetchSiteSubmissions } from '../api';
import { X, Mail, Phone, Calendar } from 'lucide-react';

interface SubmissionsModalProps {
  site: Site | null;
  onClose: () => void;
}

export const SubmissionsModal: React.FC<SubmissionsModalProps> = ({ site, onClose }) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!site) return;
    setLoading(true);
    fetchSiteSubmissions(site.id).then((subs) => {
      setSubmissions(subs);
      setLoading(false);
    });
  }, [site]);

  if (!site) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl max-w-2xl w-full p-6 sm:p-8 relative max-h-[85vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
        >
          <X size={18} />
        </button>

        <div className="mb-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
            Client Inquiries
          </span>
          <h2 className="text-xl font-black text-slate-900 mt-1">
            Form Submissions: {site.name}
          </h2>
          <p className="text-xs text-slate-500">
            Messages received from the contact form on <span className="font-mono">/s/{site.slug}</span>
          </p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {loading ? (
            <div className="text-center py-12 text-xs text-slate-400">Loading inquiries...</div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100 p-6">
              <Mail size={32} className="mx-auto text-slate-300 mb-2" />
              <h4 className="text-sm font-bold text-slate-700">No submissions yet</h4>
              <p className="text-xs text-slate-400 mt-1">
                When visitors submit the contact form on your published site, their messages will appear here.
              </p>
            </div>
          ) : (
            submissions.map((sub) => (
              <div
                key={sub.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-2 hover:border-slate-300 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-sm text-slate-900">{sub.name}</div>
                  <div className="flex items-center space-x-1 text-[11px] text-slate-400">
                    <Calendar size={12} />
                    <span>{new Date(sub.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 text-xs text-slate-600">
                  <a href={`mailto:${sub.email}`} className="flex items-center space-x-1 text-blue-600 hover:underline">
                    <Mail size={12} />
                    <span>{sub.email}</span>
                  </a>
                  {sub.phone && (
                    <a href={`tel:${sub.phone}`} className="flex items-center space-x-1 text-slate-600 hover:underline">
                      <Phone size={12} />
                      <span>{sub.phone}</span>
                    </a>
                  )}
                </div>

                <div className="bg-slate-50 p-3 rounded-xl text-xs text-slate-700 leading-relaxed border border-slate-100">
                  {sub.message}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
