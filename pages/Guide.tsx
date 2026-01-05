import React, { useState } from 'react';
import { LucideTerminal, LucideCloud, LucideDatabase, LucideCheckCircle, LucideCopy, LucideArrowRight, LucideShieldCheck, LucideAlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Guide: React.FC = () => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const CodeBlock = ({ code, id }: { code: string, id: string }) => (
    <div className="bg-gray-900 rounded-xl p-4 my-3 relative group overflow-x-auto border-2 border-chocolate/20">
      <code className="text-green-400 font-mono text-sm block whitespace-pre">{code}</code>
      <button 
        onClick={() => copyToClipboard(code, id)}
        className="absolute top-3 right-3 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white"
      >
        {copied === id ? <LucideCheckCircle size={16} className="text-green-400" /> : <LucideCopy size={16} />}
      </button>
    </div>
  );

  const firestoreRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow anyone to read settings for the Home page
    match /adminSettings/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    // Allow anyone to submit bookings/orders
    match /preBookings/{docId} {
      allow write: if true;
      allow read: if request.auth != null;
    }
    match /eventOrders/{docId} {
      allow write: if true;
      allow read: if request.auth != null;
    }
  }
}`;

  return (
    <div className="min-h-screen bg-bun pb-20 font-sans text-chocolate">
      <div className="bg-chocolate text-white pt-16 pb-12 px-6 rounded-b-[3rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10">
          <LucideCloud size={300} />
        </div>
        <div className="max-w-md mx-auto relative z-10">
          <button onClick={() => navigate('/')} className="text-butter text-sm font-bold mb-4 flex items-center gap-1">
            <LucideArrowRight size={16} className="rotate-180" /> Back to App
          </button>
          <h1 className="text-4xl font-black mb-2 tracking-tight">Deployment Hub</h1>
          <p className="text-butter/80 font-medium">BUNTEE Production Checklist 🚀</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 -mt-8 space-y-6">
        {/* Step 1: Firestore Rules */}
        <section className="bg-white rounded-3xl p-6 shadow-xl border-b-4 border-orange-400">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-orange-50 rounded-2xl text-orange-500">
              <LucideDatabase size={24} />
            </div>
            <h2 className="text-xl font-bold">1. Fix Permission Error</h2>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            If you see <b>"Missing or insufficient permissions"</b>, you MUST copy these rules into your <b>Firebase Console {' > '} Firestore {' > '} Rules</b> tab:
          </p>
          <CodeBlock id="fb-rules" code={firestoreRules} />
          <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 mt-4 flex gap-3">
            <LucideShieldCheck size={20} className="text-orange-700 shrink-0" />
            <div>
              <p className="text-xs font-bold text-orange-700">Crucial Step</p>
              <p className="text-[11px] text-orange-600 mt-1">Make sure to hit the <b>"Publish"</b> button in the Firebase Console after pasting these rules!</p>
            </div>
          </div>
        </section>

        {/* Step 2: Troubleshooting */}
        <section className="bg-white rounded-3xl p-6 shadow-xl border-b-4 border-red-400">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-50 rounded-2xl text-red-500">
              <LucideAlertCircle size={24} />
            </div>
            <h2 className="text-xl font-bold">Troubleshooting</h2>
          </div>
          <div className="space-y-3">
             <div className="text-sm">
                <p className="font-bold text-red-700">STILL getting the error?</p>
                <ul className="list-disc ml-5 text-gray-600 text-xs mt-1 space-y-1">
                  <li>Ensure the collection names in Firestore exactly match: <code className="bg-gray-100 px-1">adminSettings</code>, <code className="bg-gray-100 px-1">preBookings</code>, <code className="bg-gray-100 px-1">eventOrders</code>.</li>
                  <li>Check if the document <code className="bg-gray-100 px-1">general</code> exists inside <code className="bg-gray-100 px-1">adminSettings</code>.</li>
                  <li>Ensure you are in the <b>Native Firestore</b> mode, not Datastore mode.</li>
                </ul>
             </div>
          </div>
        </section>

        {/* Step 3: Netlify Settings */}
        <section className="bg-white rounded-3xl p-6 shadow-xl border-b-4 border-teal-400">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-teal-50 rounded-2xl text-teal-500">
              <LucideTerminal size={24} />
            </div>
            <h2 className="text-xl font-bold">2. Build Configuration</h2>
          </div>
          <div className="space-y-4 text-sm text-gray-600">
             <p>Netlify settings (Site Configuration {' > '} Build {' & '} Deploy):</p>
             <div className="bg-teal-50 p-4 rounded-2xl border border-teal-200">
                <ul className="text-xs text-teal-600 space-y-2">
                  <li className="flex justify-between"><span>Build Command:</span> <b>npm run build</b></li>
                  <li className="flex justify-between"><span>Publish Directory:</span> <b>dist</b></li>
                </ul>
             </div>
          </div>
        </section>

        <div className="text-center pt-6 opacity-40 italic text-xs">
          Baking your web presence... 🍞
        </div>
      </div>
    </div>
  );
};

export default Guide;