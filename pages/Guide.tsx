import React, { useState } from 'react';
import { LucideTerminal, LucideCloud, LucideDatabase, LucideGithub, LucideLaptop, LucideCheckCircle, LucideCopy, LucideArrowRight, LucideExternalLink, LucideFileCode, LucideShieldCheck } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-bun pb-20 font-sans text-chocolate">
      {/* Immersive Header */}
      <div className="bg-chocolate text-white pt-16 pb-12 px-6 rounded-b-[3rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10">
          <LucideCloud size={300} />
        </div>
        <div className="max-w-md mx-auto relative z-10">
          <button onClick={() => navigate('/')} className="text-butter text-sm font-bold mb-4 flex items-center gap-1">
            <LucideArrowRight size={16} className="rotate-180" /> Back to App
          </button>
          <h1 className="text-4xl font-black mb-2 tracking-tight">Deployment Hub</h1>
          <p className="text-butter/80 font-medium">Your step-by-step path to the world 🚀</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 -mt-8 space-y-6">
        
        {/* Step 1: Git */}
        <section className="bg-white rounded-3xl p-6 shadow-xl border-b-4 border-gray-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gray-100 rounded-2xl text-gray-700">
              <LucideGithub size={24} />
            </div>
            <h2 className="text-xl font-bold">1. GitHub Push</h2>
          </div>
          <p className="text-gray-600 text-sm mb-4">Open terminal in your project folder and run:</p>
          <CodeBlock id="git-commands" code="git init\ngit add .\ngit commit -m 'Launch Buntee'\ngit branch -M main\ngit remote add origin YOUR_REPO_URL\ngit push -u origin main" />
        </section>

        {/* Step 2: Firebase */}
        <section className="bg-white rounded-3xl p-6 shadow-xl border-b-4 border-orange-400">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-orange-50 rounded-2xl text-orange-500">
              <LucideDatabase size={24} />
            </div>
            <h2 className="text-xl font-bold">2. Firebase Prep</h2>
          </div>
          <p className="text-gray-600 text-sm mb-4">Go to Firebase Console and create a project. In "Build" > "Firestore", set these rules:</p>
          <CodeBlock id="fb-rules" code="rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /{document=**} { allow read, write: if true; }\n  }\n}" />
          <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 mt-4">
            <p className="text-xs font-bold text-orange-700 flex items-center gap-1">
              <LucideShieldCheck size={14} /> Enable Auth
            </p>
            <p className="text-[11px] text-orange-600 mt-1">Enable "Email/Password" in the Auth tab and add your admin email/password.</p>
          </div>
        </section>

        {/* Step 3: Netlify SPA Fix */}
        <section className="bg-white rounded-3xl p-6 shadow-xl border-b-4 border-red-400">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-red-50 rounded-2xl text-red-500">
              <LucideFileCode size={24} />
            </div>
            <h2 className="text-xl font-bold">3. SPA Routing Fix</h2>
          </div>
          <p className="text-gray-600 text-sm mb-4">Netlify needs this to prevent "404 on reload". Create a file named <span className="font-mono font-bold underline">_redirects</span> in your root:</p>
          <CodeBlock id="redirects-file" code="/*    /index.html   200" />
        </section>

        {/* Step 4: Netlify Live */}
        <section className="bg-white rounded-3xl p-6 shadow-xl border-b-4 border-teal-400">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-teal-50 rounded-2xl text-teal-500">
              <LucideCloud size={24} />
            </div>
            <h2 className="text-xl font-bold">4. Netlify Launch</h2>
          </div>
          <div className="space-y-4 text-sm text-gray-600">
            <p>1. Import repo in Netlify.</p>
            <div className="bg-teal-50 p-4 rounded-2xl border border-teal-200">
              <p className="font-bold text-teal-700 flex items-center gap-1">
                <LucideTerminal size={14} /> Critical Environment Variable
              </p>
              <p className="text-xs text-teal-600 mt-2">Go to Site Settings > Env Variables:</p>
              <div className="flex gap-2 mt-2">
                <span className="bg-white px-2 py-1 rounded border font-mono text-[10px]">Key: API_KEY</span>
                <span className="bg-white px-2 py-1 rounded border font-mono text-[10px]">Value: [YourFirebaseKey]</span>
              </div>
            </div>
            <button 
              onClick={() => window.open('https://app.netlify.com/start', '_blank')}
              className="w-full bg-teal-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
            >
              Go to Netlify <LucideExternalLink size={16} />
            </button>
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