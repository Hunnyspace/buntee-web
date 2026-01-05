import React, { useState, useEffect } from 'react';
import { auth, db } from '../services/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, orderBy, onSnapshot, addDoc, deleteDoc } from 'firebase/firestore';
import { LucideLogOut, LucideSettings, LucideClipboardList, LucideSave, LucideTruck, LucidePlus, LucideTrash2, LucideUtensils, LucideMessageSquare, LucideStar } from 'lucide-react';

interface AdminProps {
  user: any;
}

const Admin: React.FC<AdminProps> = ({ user }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [permissionError, setPermissionError] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'settings' | 'menu' | 'prebookings' | 'events' | 'feedback'>('settings');
  const [settings, setSettings] = useState<any>({ teaserText: "" });
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [preBookings, setPreBookings] = useState<any[]>([]);
  const [eventOrders, setEventOrders] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);

  const [newItem, setNewItem] = useState({ name: "", price: "", emoji: "🍞" });

  useEffect(() => {
    if (!user) return;

    getDoc(doc(db, "adminSettings", "general")).then(d => d.exists() && setSettings(d.data()));

    const unsubMenu = onSnapshot(collection(db, "menuItems"), (snap) => {
      setMenuItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, () => setPermissionError(true));

    const unsubPre = onSnapshot(query(collection(db, "preBookings"), orderBy("timestamp", "desc")), 
      (snap) => setPreBookings(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      () => setPermissionError(true)
    );

    const unsubEvent = onSnapshot(query(collection(db, "eventOrders"), orderBy("timestamp", "desc")), 
      (snap) => setEventOrders(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      () => setPermissionError(true)
    );

    const unsubFeedback = onSnapshot(query(collection(db, "feedbacks"), orderBy("timestamp", "desc")), 
      (snap) => setFeedbacks(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      () => setPermissionError(true)
    );

    return () => { unsubMenu(); unsubPre(); unsubEvent(); unsubFeedback(); };
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await signInWithEmailAndPassword(auth, email, password); } catch (err: any) { setError(err.message); }
  };

  const handleAddMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price) return;
    await addDoc(collection(db, "menuItems"), { ...newItem, price: Number(newItem.price) });
    setNewItem({ name: "", price: "", emoji: "🍞" });
  };

  const handleDeleteDoc = async (coll: string, id: string) => {
    if (window.confirm("Are you sure?")) await deleteDoc(doc(db, coll, id));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-sm border-2 border-[#4A2410]">
          <h1 className="text-3xl font-premium font-bold text-[#4A2410] mb-8 text-center">Buntee Admin</h1>
          {error && <p className="text-red-500 text-xs mb-6 bg-red-50 p-3 rounded-xl">{error}</p>}
          <div className="flex flex-col gap-4">
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="p-5 border rounded-2xl outline-none focus:ring-2 focus:ring-butter-gold" required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="p-5 border rounded-2xl outline-none focus:ring-2 focus:ring-butter-gold" required />
            <button type="submit" className="bg-[#4A2410] text-white font-bold py-5 rounded-2xl shadow-lg mt-4">Login</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white border-b p-6 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3"><div className="w-10 h-10 bg-butter-gold rounded-full flex items-center justify-center text-xl">🐻</div><h1 className="font-black text-[#4A2410] tracking-tighter">BUNTEE HQ</h1></div>
        <button onClick={() => signOut(auth)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><LucideLogOut size={24} /></button>
      </header>

      <nav className="flex border-b bg-white overflow-x-auto whitespace-nowrap scrollbar-hide">
        {[
          { id: 'settings', label: 'General', icon: LucideSettings },
          { id: 'menu', label: 'Flavors', icon: LucideUtensils },
          { id: 'prebookings', label: 'Orders', icon: LucideClipboardList },
          { id: 'events', label: 'Events', icon: LucideTruck },
          { id: 'feedback', label: 'Feedback', icon: LucideMessageSquare }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)} 
            className={`flex-1 min-w-[100px] p-5 font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${activeTab === tab.id ? 'text-[#4A2410] border-b-4 border-[#4A2410]' : 'text-gray-400'}`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </nav>

      <main className="flex-1 p-6 overflow-y-auto max-w-4xl mx-auto w-full">
        {activeTab === 'menu' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <section className="bg-white p-8 rounded-[2rem] shadow-sm border">
               <h2 className="font-black text-[#4A2410] mb-6 flex items-center gap-2"><LucidePlus size={18} /> Add New Flavor</h2>
               <form onSubmit={handleAddMenuItem} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input placeholder="Emoji" value={newItem.emoji} onChange={e => setNewItem({...newItem, emoji: e.target.value})} className="border p-4 rounded-2xl" />
                  <input placeholder="Flavor Name" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="border p-4 rounded-2xl col-span-2" required />
                  <input placeholder="Price" type="number" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} className="border p-4 rounded-2xl" required />
                  <button type="submit" className="md:col-span-4 bg-[#4A2410] text-white p-4 rounded-2xl font-bold">Save Item</button>
               </form>
            </section>
            <div className="grid grid-cols-1 gap-4">
               {menuItems.map(item => (
                 <div key={item.id} className="bg-white p-6 rounded-2xl border flex items-center justify-between">
                    <div className="flex items-center gap-4"><span className="text-3xl">{item.emoji}</span><div><p className="font-bold text-[#4A2410]">{item.name}</p><p className="text-xs text-gray-400">₹{item.price}</p></div></div>
                    <button onClick={() => handleDeleteDoc('menuItems', item.id)} className="text-red-400 hover:text-red-600 p-2"><LucideTrash2 size={20} /></button>
                 </div>
               ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6 animate-in fade-in duration-300">
             <div className="bg-white p-8 rounded-[2rem] border shadow-sm">
                <h3 className="font-bold mb-4 uppercase tracking-widest text-[10px] text-gray-400">Site Config</h3>
                <textarea 
                  value={settings.teaserText} 
                  onChange={e => setSettings({...settings, teaserText: e.target.value})}
                  className="w-full border p-6 rounded-2xl min-h-[150px] outline-none"
                  placeholder="Daily Bun Wisdom..."
                />
             </div>
             <button onClick={() => setDoc(doc(db, "adminSettings", "general"), settings)} className="w-full bg-[#4A2410] text-white py-5 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2"><LucideSave size={18} /> Update Content</button>
          </div>
        )}

        {activeTab === 'prebookings' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {preBookings.map((pb) => (
              <div key={pb.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border relative">
                <button onClick={() => handleDeleteDoc('preBookings', pb.id)} className="absolute top-8 right-8 text-gray-300 hover:text-red-500"><LucideTrash2 size={18} /></button>
                <div className="flex justify-between items-start mb-6"><div><h3 className="font-black text-xl text-[#4A2410]">{pb.name}</h3><p className="font-bold text-butter-gold">{pb.contact}</p></div><span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{pb.timestamp?.toDate().toLocaleString()}</span></div>
                <div className="bg-gray-50 p-6 rounded-3xl border border-dashed">
                  {Object.entries(pb.items || {}).map(([name, qty]: any) => (
                    <div key={name} className="flex justify-between text-sm font-bold border-b border-gray-100 py-2 last:border-0"><span>{name}</span><span>x{qty}</span></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {eventOrders.map((ev) => (
              <div key={ev.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border relative">
                <button onClick={() => handleDeleteDoc('eventOrders', ev.id)} className="absolute top-8 right-8 text-gray-300 hover:text-red-500"><LucideTrash2 size={18} /></button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><h3 className="font-black text-xl text-[#4A2410]">{ev.event_name}</h3><p className="text-butter-gold font-bold">{ev.event_contact}</p></div>
                  <div className="text-right"><p className="text-sm font-bold">{ev.event_type}</p><p className="text-xs text-gray-400">{ev.event_date}</p></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'feedback' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {feedbacks.map((f) => (
              <div key={f.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border relative">
                <button onClick={() => handleDeleteDoc('feedbacks', f.id)} className="absolute top-8 right-8 text-gray-300 hover:text-red-500"><LucideTrash2 size={18} /></button>
                <div className="flex items-center gap-2 mb-4">
                  {[...Array(5)].map((_, i) => <LucideStar key={i} size={16} className={i < f.rating ? "fill-butter-gold text-butter-gold" : "text-gray-200"} />)}
                  <span className="text-xs font-bold text-gray-400 ml-2">{f.name}</span>
                </div>
                <p className="text-[#4A2410] font-medium leading-relaxed italic">"{f.comment}"</p>
                <p className="text-[9px] text-gray-300 uppercase tracking-widest mt-4">{f.timestamp?.toDate().toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;