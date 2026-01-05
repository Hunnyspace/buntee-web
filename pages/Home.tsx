import React, { useState, useEffect } from 'react';
import { db, createAi } from '../services/firebase';
import { doc, addDoc, collection, onSnapshot } from 'firebase/firestore';
import { LucideInstagram, LucideCheckCircle, LucideHeart, LucidePartyPopper, LucideRocket, LucideShare2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LOGO_URL = "https://raw.githubusercontent.com/Hunnyspace/buntee-tracker/main/Bunteelogo.png";
const INSTAGRAM_URL = "https://www.instagram.com/buntee.in/";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [adminSettings, setAdminSettings] = useState<any>(null);
  const [spinUnlocked, setSpinUnlocked] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);
  const [spinResult, setSpinResult] = useState<string | null>(null);
  const [rating, setRating] = useState(3);
  const [showSuccess, setShowSuccess] = useState<string | null>(null);
  const [bunWisdom, setBunWisdom] = useState<string>("Baking happiness... 🍞");

  // Load Admin Settings
  useEffect(() => {
    // Added error callback to onSnapshot to handle permission-denied gracefully
    const unsub = onSnapshot(
      doc(db, "adminSettings", "general"), 
      (snapshot) => {
        if (snapshot.exists()) setAdminSettings(snapshot.data());
      },
      (error) => {
        console.warn("Firestore permissions: You might need to update your rules. Check the /guide page.", error);
      }
    );
    return () => unsub();
  }, []);

  // Use Gemini to generate a fun bun-related pun or wisdom
  useEffect(() => {
    const fetchBunWisdom = async () => {
      try {
        const ai = createAi();
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: "Give a short, cozy, 1-sentence pun or 'bun wisdom' about bun maska and butter. Keep it cheerful.",
          config: {
            systemInstruction: "You are the Buntee Bun Assistant, a friendly bakery mascot. Your tone is warm and buttery.",
          },
        });
        
        const wisdomText = response.text;
        if (wisdomText) {
          setBunWisdom(wisdomText.trim());
        }
      } catch (error) {
        console.error("Gemini failed to generate wisdom:", error);
      }
    };
    fetchBunWisdom();
  }, []);

  // Check state from session/local storage
  useEffect(() => {
    const unlocked = sessionStorage.getItem('buntee_spin_unlocked');
    if (unlocked) setSpinUnlocked(true);
    const result = localStorage.getItem('buntee_spin_result');
    if (result) {
      setHasSpun(true);
      setSpinResult(result);
    }
  }, []);

  const handlePreBook = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await addDoc(collection(db, "preBookings"), {
        name: formData.get('name'),
        contact: formData.get('contact'),
        message: formData.get('message'),
        timestamp: new Date()
      });
      setShowSuccess("Thanks! We’ll reach out to you shortly ❤️");
      e.currentTarget.reset();
    } catch (err) {
      alert("Submission failed. Please check your internet or Firebase permissions.");
    }
  };

  const handleEventOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const orderData: any = {
      name: formData.get('name'),
      contact: formData.get('contact'),
      address: formData.get('address'),
      date: formData.get('date'),
      time: formData.get('time'),
      type: formData.get('type'),
      callSchedule: formData.get('callSchedule'),
      timestamp: new Date(),
      items: {}
    };
    
    const itemNames = ['Butter', 'Chocolate', 'Hazelnut', 'Caramel', 'Strawberry', 'Blueberry', 'Butterscotch', 'GreenApple', 'Orange', 'Water', 'Coconut'];
    itemNames.forEach(item => {
      const val = formData.get(`item_${item}`);
      if (val && Number(val) > 0) orderData.items[item] = val;
    });

    try {
      await addDoc(collection(db, "eventOrders"), orderData);
      setShowSuccess("Our sales team will reach you out shortly 📞");
      e.currentTarget.reset();
    } catch (err) {
      alert("Submission failed. Please check your internet or Firebase permissions.");
    }
  };

  const unlockSpin = () => {
    const message = encodeURIComponent("Hey Buntee 🍞 I’m at the stall, please unlock my spin!");
    window.open(`${INSTAGRAM_URL}direct/t/buntee.in/?text=${message}`, '_blank');
    setSpinUnlocked(true);
    sessionStorage.setItem('buntee_spin_unlocked', 'true');
  };

  const handleSpin = () => {
    if (hasSpun) return;
    
    const offers = [
      { text: "₹1 Off", weight: 30 },
      { text: "₹2 Off", weight: 25 },
      { text: "₹5 Off", weight: 15 },
      { text: "₹7 Off", weight: 10 },
      { text: "Double Butter", weight: 10 },
      { text: "Buy 3 Get 1", weight: 7 },
      { text: "Free Bun", weight: 2 },
      { text: "50% Off", weight: 1 }
    ];

    const pool: string[] = [];
    offers.forEach(o => {
      for (let i = 0; i < o.weight; i++) pool.push(o.text);
    });

    const result = pool[Math.floor(Math.random() * pool.length)];
    setSpinResult(result);
    setHasSpun(true);
    localStorage.setItem('buntee_spin_result', result);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'I won a prize at Buntee! 🍞',
          text: `I just won "${spinResult}" on the Buntee Bun Wheel! You should check them out.`,
          url: window.location.origin,
        });
      } catch (err) {
        console.log("Share failed:", err);
      }
    } else {
      alert("Copy this link to share Buntee: " + window.location.origin);
    }
  };

  const getBearEmoji = () => {
    if (rating <= 1) return "🐻‍❄️";
    if (rating === 2) return "🐻";
    if (rating === 3) return "🧸";
    if (rating === 4) return "🐨";
    return "🐼";
  };

  const getBearReaction = () => {
    if (rating <= 1) return "Meh... need more butter!";
    if (rating === 2) return "Getting better!";
    if (rating === 3) return "Yum! That's Buntee!";
    if (rating === 4) return "So soft! So delicious!";
    return "BEST BUN EVER! ❤️";
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-bun pb-20 overflow-x-hidden">
      {/* Hero Section */}
      <section className="pt-10 px-6 text-center">
        <img src={LOGO_URL} alt="Buntee Logo" className="w-48 mx-auto mb-6 float-animation" />
        <h1 className="text-3xl font-extrabold text-chocolate mb-2">Authentic Bun Maska</h1>
        <p className="text-gray-600 mb-6 italic">Soft Buns. Melted Butter. Pure Love. ❤️</p>
        
        {/* Gemini-Powered Bun Wisdom */}
        <div className="bg-white/40 backdrop-blur-md p-4 rounded-2xl mb-8 border border-white/60 text-chocolate italic text-sm">
          "{bunWisdom}"
        </div>
        
        <div className="flex flex-col gap-4">
          <button onClick={() => document.getElementById('wheel')?.scrollIntoView({behavior: 'smooth'})} className="bg-butter text-chocolate font-bold py-4 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform">
            Spin the Bun Wheel 🍞
          </button>
          <button onClick={() => document.getElementById('prebook')?.scrollIntoView({behavior: 'smooth'})} className="bg-chocolate text-white font-bold py-4 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform">
            Pre-Book Special Buns ❤️
          </button>
          <button onClick={() => document.getElementById('events')?.scrollIntoView({behavior: 'smooth'})} className="bg-white border-2 border-chocolate text-chocolate font-bold py-4 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform">
            Events & Parties 🎉
          </button>
        </div>
      </section>

      {/* Today's Flavours */}
      <section className="mt-16 px-6">
        <h2 className="text-2xl font-bold text-chocolate mb-6 text-center">Today's Flavours</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-3xl shadow-md border-b-4 border-butter">
            <div className="text-4xl mb-2 text-center">🧈</div>
            <h3 className="font-bold text-chocolate text-center">Authentic Butter</h3>
          </div>
          <div className="bg-white p-4 rounded-3xl shadow-md border-b-4 border-chocolate">
            <div className="text-4xl mb-2 text-center">🍫</div>
            <h3 className="font-bold text-chocolate text-center">Chocolate</h3>
          </div>
        </div>
      </section>

      {/* Mystery Section */}
      <section className="mt-16 px-6">
        <div className="relative bg-white rounded-3xl p-8 text-center overflow-hidden border-2 border-dashed border-chocolate">
           <div className="absolute inset-0 bg-white/60 backdrop-blur-md flex flex-col items-center justify-center z-10">
              <div className="text-4xl mb-2">🧁</div>
              <p className="text-chocolate font-bold">{adminSettings?.teaserText || "Something special is baking… ❤️ Valentine Edition"}</p>
           </div>
           <div className="opacity-20 flex gap-4 justify-center">
              <div className="w-16 h-16 bg-pink-200 rounded-full"></div>
              <div className="w-16 h-16 bg-red-200 rounded-full"></div>
              <div className="w-16 h-16 bg-pink-300 rounded-full"></div>
           </div>
        </div>
      </section>

      {/* Spin Wheel */}
      <section id="wheel" className="mt-16 px-6">
        <div className="bg-white rounded-3xl p-8 shadow-xl border-4 border-butter relative overflow-hidden">
          <h2 className="text-2xl font-bold text-chocolate mb-4 text-center">Spin the Bun Wheel!</h2>
          {!spinUnlocked ? (
            <div className="text-center py-6">
              <p className="text-gray-600 mb-6">Unlock your lucky offer by sending us a DM on Instagram! 🎁</p>
              <button onClick={unlockSpin} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 px-6 rounded-full flex items-center justify-center gap-2 mx-auto">
                <LucideInstagram size={20} /> Unlock Spin Wheel
              </button>
            </div>
          ) : (
            <div className="text-center">
              {hasSpun ? (
                <div className="py-8 animate-in fade-in zoom-in duration-500">
                  <div className="text-chocolate text-xl font-bold mb-4">CONGRATULATIONS! 🎉</div>
                  <div className="bg-butter/20 p-6 rounded-2xl border-2 border-butter inline-block mb-4">
                    <div className="text-3xl font-extrabold text-chocolate">{spinResult}</div>
                  </div>
                  <p className="text-gray-600 text-sm">Show this screen at the Buntee counter to claim your reward!</p>
                  
                  <div className="mt-6 flex flex-col gap-3">
                    <button 
                      onClick={handleShare}
                      className="bg-butter text-chocolate font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-md w-full"
                    >
                      <LucideShare2 size={18} /> Share My Prize
                    </button>
                    <div className="text-[10px] text-gray-400">Coupon: BNT-{Math.floor(Math.random()*90000)+10000}</div>
                  </div>
                </div>
              ) : (
                <div className="py-8">
                   <div className="relative w-48 h-48 mx-auto mb-8 flex items-center justify-center">
                      <div className="absolute w-full h-full rounded-full border-8 border-butter flex items-center justify-center">
                        <div className="text-6xl animate-spin-slow">🍞</div>
                      </div>
                      <button onClick={handleSpin} className="relative z-20 bg-chocolate text-white w-20 h-20 rounded-full flex items-center justify-center font-black shadow-xl border-4 border-white active:scale-90 transition-transform">SPIN!</button>
                   </div>
                   <p className="text-chocolate font-medium italic">What will you win today?</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Pre-book Form */}
      <section id="prebook" className="mt-16 px-6">
        <div className="bg-chocolate text-white rounded-3xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <LucideHeart fill="white" /> Pre-Book Special Buns
          </h2>
          <form onSubmit={handlePreBook} className="flex flex-col gap-4">
            <input name="name" type="text" placeholder="Your Name" required className="bg-white/10 border border-white/20 rounded-xl p-4 placeholder-white/50 text-white focus:outline-none focus:ring-2 focus:ring-butter" />
            <input name="contact" type="tel" placeholder="Contact Number" required className="bg-white/10 border border-white/20 rounded-xl p-4 placeholder-white/50 text-white focus:outline-none focus:ring-2 focus:ring-butter" />
            <textarea name="message" placeholder="Which buns do you want? (Thoughts / Message)" rows={3} className="bg-white/10 border border-white/20 rounded-xl p-4 placeholder-white/50 text-white focus:outline-none focus:ring-2 focus:ring-butter"></textarea>
            <button type="submit" className="bg-butter text-chocolate font-bold py-4 rounded-xl shadow-lg mt-2 active:scale-95 transition-transform">
              Send Love 🍞
            </button>
          </form>
        </div>
      </section>

      {/* Events Form */}
      <section id="events" className="mt-16 px-6">
        <div className="bg-white rounded-3xl p-8 shadow-xl border-4 border-chocolate">
          <h2 className="text-2xl font-bold text-chocolate mb-6 flex items-center gap-2">
            <LucidePartyPopper /> Events & Parties
          </h2>
          <form onSubmit={handleEventOrder} className="flex flex-col gap-5 text-chocolate">
             <div className="grid grid-cols-1 gap-4">
               <input name="name" type="text" placeholder="Full Name" required className="border-2 border-chocolate/10 bg-bun/30 rounded-xl p-4 focus:border-chocolate focus:outline-none" />
               <input name="contact" type="tel" placeholder="Contact Number" required className="border-2 border-chocolate/10 bg-bun/30 rounded-xl p-4 focus:border-chocolate focus:outline-none" />
               <input name="address" type="text" placeholder="Event Address" required className="border-2 border-chocolate/10 bg-bun/30 rounded-xl p-4 focus:border-chocolate focus:outline-none" />
               <div className="grid grid-cols-2 gap-2">
                  <input name="date" type="date" required className="border-2 border-chocolate/10 bg-bun/30 rounded-xl p-4 focus:border-chocolate focus:outline-none" />
                  <input name="time" type="time" required className="border-2 border-chocolate/10 bg-bun/30 rounded-xl p-4 focus:border-chocolate focus:outline-none" />
               </div>
               <select name="type" required className="border-2 border-chocolate/10 bg-bun/30 rounded-xl p-4 focus:border-chocolate focus:outline-none">
                 <option value="">Select Event Type</option>
                 <option value="Birthday">Birthday</option>
                 <option value="Office Party">Office Party</option>
                 <option value="College Event">College Event</option>
                 <option value="Wedding">Wedding</option>
                 <option value="House Party">House Party</option>
                 <option value="Other">Other</option>
               </select>
             </div>

             <div className="space-y-4">
                <p className="font-bold underline">Items (Quantity):</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                   {['Butter', 'Chocolate', 'Hazelnut', 'Caramel', 'Strawberry', 'Blueberry', 'Butterscotch', 'GreenApple', 'Orange'].map(item => (
                     <div key={item} className="flex items-center justify-between">
                        <span>{item} Bun</span>
                        <input name={`item_${item}`} type="number" placeholder="0" className="w-16 border-b border-chocolate/30 p-1 text-center bg-transparent focus:outline-none" />
                     </div>
                   ))}
                </div>
                <div className="mt-4 p-3 bg-butter/20 rounded-xl text-xs italic">
                  * Special flavours are prepared only on order basis.
                </div>
             </div>

             <div className="flex flex-col gap-2">
               <label className="text-xs font-bold">Preferred Call Schedule</label>
               <input name="callSchedule" type="datetime-local" className="border-2 border-chocolate/10 bg-bun/30 rounded-xl p-4 focus:border-chocolate focus:outline-none" />
             </div>

             <button type="submit" className="bg-chocolate text-white font-bold py-4 rounded-xl shadow-lg mt-4 flex items-center justify-center gap-2 active:scale-95 transition-transform">
               Request Quote 🎉
             </button>
          </form>
        </div>
      </section>

      {/* Rating Bar */}
      <section className="mt-16 px-6">
        <div className="bg-butter rounded-3xl p-8 shadow-xl text-center">
          <h2 className="text-2xl font-bold text-chocolate mb-6">How was your Bun?</h2>
          <div className="text-6xl mb-4 transition-all duration-500 scale-125">
            {getBearEmoji()}
          </div>
          <p className="text-chocolate font-bold h-6 mb-8">{getBearReaction()}</p>
          <input 
            type="range" min="1" max="5" step="1" 
            value={rating} 
            onChange={(e) => setRating(parseInt(e.target.value))}
            className="w-full h-4 bg-chocolate/20 rounded-lg appearance-none cursor-pointer accent-chocolate"
          />
          <div className="flex justify-between mt-2 text-chocolate font-black text-xs">
            <span>OKAY</span>
            <span>GOOD</span>
            <span>AMAZING</span>
          </div>
        </div>
      </section>

      {/* Deployment Hub Shortcut */}
      <section className="mt-12 px-6">
        <button 
          onClick={() => navigate('/guide')}
          className="w-full bg-white/50 border-2 border-dashed border-chocolate/20 p-6 rounded-3xl flex flex-col items-center gap-2 hover:bg-butter/10 transition-colors"
        >
          <LucideRocket className="text-chocolate opacity-40" />
          <span className="text-xs font-bold text-chocolate opacity-40 uppercase tracking-widest">Open Deployment Hub</span>
        </button>
      </section>

      {/* Footer */}
      <footer className="mt-10 px-6 py-10 bg-chocolate text-white/50 text-center">
         <img src={LOGO_URL} alt="Logo" className="w-16 mx-auto opacity-50 grayscale mb-4" />
         <p className="text-xs">© 2024 BUNTEE Web. All rights reserved.</p>
         <p className="text-[10px] mt-2">Baking happiness, one bun at a time.</p>
      </footer>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl scale-110">
            <div className="text-green-500 mb-4 flex justify-center"><LucideCheckCircle size={48} /></div>
            <p className="text-chocolate font-bold text-lg mb-6">{showSuccess}</p>
            <button onClick={() => setShowSuccess(null)} className="bg-chocolate text-white font-bold py-3 px-8 rounded-full w-full">Great!</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;