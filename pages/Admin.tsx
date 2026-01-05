
import React, { useState, useEffect } from 'react';
import { auth, db } from '../services/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, orderBy, onSnapshot, updateDoc } from 'firebase/firestore';
import { LucideLogOut, LucideSettings, LucideClipboardList, LucideSave, LucideTruck } from 'lucide-react';

interface AdminProps {
  user: any;
}

const Admin: React.FC<AdminProps> = ({ user }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  const [activeTab, setActiveTab] = useState<'settings' | 'prebookings' | 'events'>('settings');
  const [settings, setSettings] = useState<any>({ teaserText: "" });
  const [preBookings, setPreBookings] = useState<any[]>([]);
  const [eventOrders, setEventOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    // Load settings
    const loadSettings = async () => {
      const docRef = doc(db, "adminSettings", "general");
      const d = await getDoc(docRef);
      if (d.exists()) setSettings(d.data());
    };
    loadSettings();

    // Listen to data
    const qPre = query(collection(db, "preBookings"), orderBy("timestamp", "desc"));
    const unsubPre = onSnapshot(qPre, (snap) => setPreBookings(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    const qEvent = query(collection(db, "eventOrders"), orderBy("timestamp", "desc"));
    const unsubEvent = onSnapshot(qEvent, (snap) => setEventOrders(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    return () => {
      unsubPre();
      unsubEvent();
    };
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSaveSettings = async () => {
    await setDoc(doc(db, "adminSettings", "general"), settings);
    alert("Settings saved!");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-bun flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm border-2 border-chocolate">
          <h1 className="text-2xl font-bold text-chocolate mb-6 text-center">Admin Login</h1>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="flex flex-col gap-4">
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-chocolate" required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-chocolate" required />
            <button type="submit" className="bg-chocolate text-white font-bold py-4 rounded-xl shadow-lg mt-2">Login</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b p-6 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
           <div className="w-10 h-10 bg-butter rounded-full flex items-center justify-center text-xl">🐻</div>
           <h1 className="font-bold text-chocolate text-lg">Buntee Admin</h1>
        </div>
        <button onClick={() => signOut(auth)} className="text-gray-400 hover:text-red-500 transition-colors">
          <LucideLogOut size={24} />
        </button>
      </header>

      {/* Tabs */}
      <nav className="flex border-b bg-white">
        <button onClick={() => setActiveTab('settings')} className={`flex-1 p-4 font-bold text-sm flex items-center justify-center gap-2 ${activeTab === 'settings' ? 'text-chocolate border-b-2 border-chocolate' : 'text-gray-400'}`}>
          <LucideSettings size={18} /> Settings
        </button>
        <button onClick={() => setActiveTab('prebookings')} className={`flex-1 p-4 font-bold text-sm flex items-center justify-center gap-2 ${activeTab === 'prebookings' ? 'text-chocolate border-b-2 border-chocolate' : 'text-gray-400'}`}>
          <LucideClipboardList size={18} /> Pre-Books ({preBookings.length})
        </button>
        <button onClick={() => setActiveTab('events')} className={`flex-1 p-4 font-bold text-sm flex items-center justify-center gap-2 ${activeTab === 'events' ? 'text-chocolate border-b-2 border-chocolate' : 'text-gray-400'}`}>
          <LucideTruck size={18} /> Events ({eventOrders.length})
        </button>
      </nav>

      {/* Content */}
      <main className="flex-1 p-6 overflow-y-auto max-w-4xl mx-auto w-full">
        {activeTab === 'settings' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <section className="bg-white p-6 rounded-2xl shadow-sm border">
               <h2 className="font-bold text-chocolate mb-4">Teaser Message</h2>
               <textarea 
                  value={settings.teaserText} 
                  onChange={(e) => setSettings({...settings, teaserText: e.target.value})}
                  className="w-full border p-4 rounded-xl min-h-[100px] focus:outline-none focus:ring-2 focus:ring-chocolate"
                  placeholder="Enter what's baking..."
               ></textarea>
            </section>

            <button onClick={handleSaveSettings} className="w-full bg-chocolate text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg">
               <LucideSave size={20} /> Save Changes
            </button>
          </div>
        )}

        {activeTab === 'prebookings' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {preBookings.length === 0 && <p className="text-center py-10 text-gray-400">No pre-bookings yet.</p>}
            {preBookings.map((pb) => (
              <div key={pb.id} className="bg-white p-6 rounded-2xl shadow-sm border border-chocolate/5">
                <div className="flex justify-between items-start mb-2">
                   <h3 className="font-bold text-chocolate">{pb.name}</h3>
                   <span className="text-[10px] text-gray-400">{pb.timestamp?.toDate().toLocaleString()}</span>
                </div>
                <p className="text-sm font-semibold mb-1">{pb.contact}</p>
                <p className="text-sm text-gray-600 italic bg-gray-50 p-3 rounded-lg border">"{pb.message}"</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {eventOrders.length === 0 && <p className="text-center py-10 text-gray-400">No event orders yet.</p>}
            {eventOrders.map((ev) => (
              <div key={ev.id} className="bg-white p-6 rounded-2xl shadow-sm border border-chocolate/5">
                <div className="flex justify-between items-start mb-4">
                   <div>
                      <h3 className="font-bold text-chocolate text-lg">{ev.name}</h3>
                      <p className="text-xs text-butter bg-chocolate px-2 py-0.5 rounded-full inline-block font-bold">{ev.type}</p>
                   </div>
                   <span className="text-[10px] text-gray-400">{ev.timestamp?.toDate().toLocaleString()}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                   <div>
                      <p className="font-bold text-gray-400 uppercase tracking-widest">Contact</p>
                      <p className="text-chocolate">{ev.contact}</p>
                   </div>
                   <div>
                      <p className="font-bold text-gray-400 uppercase tracking-widest">When</p>
                      <p className="text-chocolate">{ev.date} @ {ev.time}</p>
                   </div>
                   <div className="col-span-2">
                      <p className="font-bold text-gray-400 uppercase tracking-widest">Address</p>
                      <p className="text-chocolate">{ev.address}</p>
                   </div>
                   <div className="col-span-2">
                      <p className="font-bold text-gray-400 uppercase tracking-widest">Call Preference</p>
                      <p className="text-chocolate">{new Date(ev.callSchedule).toLocaleString()}</p>
                   </div>
                </div>

                <div className="border-t pt-4">
                  <p className="font-bold text-gray-400 uppercase tracking-widest text-[10px] mb-2">Items Ordered</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(ev.items || {}).map(([name, qty]: any) => (
                      <span key={name} className="bg-bun px-3 py-1 rounded-full text-xs text-chocolate font-bold border border-butter/30">
                        {name}: {qty}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
