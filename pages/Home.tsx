import React, { useState, useEffect, useRef } from 'react';
import { db, createAi } from '../services/firebase';
import { doc, addDoc, collection, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { LucideInstagram, LucideCheckCircle, LucideHeart, LucidePartyPopper, LucideShare2, LucideMessageCircle, LucideArrowRight, LucideGift, LucideSend } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LOGO_URL = "https://raw.githubusercontent.com/Hunnyspace/buntee-tracker/main/Bunteelogo.png";
const INSTAGRAM_URL = "https://www.instagram.com/buntee.in/";
const IG_DM_URL = "https://www.instagram.com/direct/t/buntee.in/";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [adminSettings, setAdminSettings] = useState<any>(null);
  const [bunWisdom, setBunWisdom] = useState<string>("The perfect bun is a warm hug for the soul...");
  const [rating, setRating] = useState(3);
  const [showSuccess, setShowSuccess] = useState<string | null>(null);

  // Scratch Card States
  const [igHandle, setIgHandle] = useState("");
  const [isGated, setIsGated] = useState(true);
  const [isFollowed, setIsFollowed] = useState(false);
  const [scratchRevealed, setScratchRevealed] = useState(false);
  const [prize, setPrize] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "adminSettings", "general"), (snap) => {
      if (snap.exists()) setAdminSettings(snap.data());
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const fetchWisdom = async () => {
      try {
        const ai = createAi();
        const res = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: "Give a short, elegant, 1-sentence 'bun wisdom' about bun maska. Use words like 'velvety', 'soulful', 'warmth'. Stay under 15 words.",
          config: { systemInstruction: "You are a luxury food critic mascot for Buntee, a premium bun maska brand." },
        });
        setBunWisdom(res.text?.trim() || "The perfect bun is a warm hug for the soul.");
      } catch (e) { console.error("Gemini Error:", e); }
    };
    fetchWisdom();
  }, []);

  // Initialize Scratch Card logic when un-gated
  useEffect(() => {
    if (!isGated && isFollowed && canvasRef.current && !scratchRevealed) {
      initScratchCard();
    }
  }, [isGated, isFollowed, scratchRevealed]);

  const initScratchCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set Prize from a pool of premium offers
    const offers = ["Free Classic Bun", "Extra Maska", "Premium Drizzle", "20% Off Order", "BOGO Offer", "Surprise Cookie"];
    const win = offers[Math.floor(Math.random() * offers.length)];
    setPrize(win);

    // Canvas sizing for retina displays
    const size = 280;
    canvas.width = size;
    canvas.height = size;

    // Draw the "Scratch" layer (Golden Butter)
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(0, 0, size, size);
    
    // Add pattern or texture to scratch layer
    ctx.strokeStyle = '#E6C200';
    ctx.lineWidth = 2;
    for (let i = 0; i < size; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, size);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(size, i);
      ctx.stroke();
    }

    // Scratch Prompt Text
    ctx.fillStyle = '#4A2410';
    ctx.font = 'bold 20px Quicksand';
    ctx.textAlign = 'center';
    ctx.fillText('SCRATCH TO REVEAL', size/2, size/2 + 7);

    let isDrawing = false;

    const scratch = (x: number, y: number) => {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 25, 0, Math.PI * 2);
      ctx.fill();
      checkReveal();
    };

    const checkReveal = () => {
      const imageData = ctx.getImageData(0, 0, size, size);
      let clearPixels = 0;
      for (let i = 3; i < imageData.data.length; i += 4) {
        if (imageData.data[i] === 0) clearPixels++;
      }
      const percent = (clearPixels / (size * size)) * 100;
      if (percent > 45) {
        setScratchRevealed(true);
      }
    };

    const handleStart = (e: any) => { isDrawing = true; handleMove(e); };
    const handleEnd = () => { isDrawing = false; };
    const handleMove = (e: any) => {
      if (!isDrawing) return;
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
      scratch(x, y);
    };

    canvas.addEventListener('mousedown', handleStart);
    canvas.addEventListener('touchstart', handleStart);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchend', handleEnd);
    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('touchmove', handleMove);
  };

  const handleShare = async () => {
    const shareText = `OMG! I just won a "${prize}" at BUNTEE! 🍞✨ Check out @buntee.in to get your daily maska fix!`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'I WON AT BUNTEE! 🍞',
          text: shareText,
          url: window.location.origin,
        });
      } catch (e) { console.error(e); }
    } else {
      // Fallback: Copy to clipboard and alert
      navigator.clipboard.writeText(shareText);
      alert("Caption copied! Take a screenshot of your prize and tag @buntee.in in your Instagram Story!");
    }
  };

  const unlockScratch = () => {
    if (!igHandle || igHandle.trim().length < 3) {
      alert("Please enter your Instagram handle to participate!");
      return;
    }
    // Simulate/Prompt follow
    window.open(INSTAGRAM_URL, '_blank');
    setIsFollowed(true);
    setIsGated(false);
  };

  const submitEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      ...Object.fromEntries(formData),
      timestamp: serverTimestamp(),
    };
    try {
      await addDoc(collection(db, "eventOrders"), data);
      setShowSuccess("Your bespoke event request has been received. Our concierge will contact you shortly.");
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      alert("Error submitting request. Please try again.");
    }
  };

  const submitPreBook = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      ...Object.fromEntries(formData),
      timestamp: serverTimestamp(),
    };
    try {
      await addDoc(collection(db, "preBookings"), data);
      setShowSuccess("Pre-booked! We'll have your buns ready.");
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      alert("Error pre-booking.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF8] pb-24 selection:bg-butter-gold selection:text-chocolate-deep">
      {/* Immersive Floating Instagram Chat FAB */}
      <a 
        href={IG_DM_URL} 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-[60] bg-[#4A2410] text-white p-5 rounded-full shadow-2xl pulse flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
        title="Chat with us on Instagram"
      >
        <LucideMessageCircle size={28} />
      </a>

      {/* Hero Header */}
      <header className="pt-16 px-8 text-center relative overflow-hidden">
        {/* Soft background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-butter-gold/10 blur-[120px] -z-10 rounded-full"></div>
        
        <div className="relative z-10">
          <img src={LOGO_URL} alt="Buntee" className="w-36 mx-auto mb-10 floating drop-shadow-[0_20px_50px_rgba(74,36,16,0.15)]" />
          <h1 className="text-5xl md:text-6xl font-premium font-black text-[#4A2410] mb-4 leading-tight">
            Elevating <br /><span className="italic text-orange-400">The Maska.</span>
          </h1>
          <p className="max-w-xs mx-auto text-gray-400 font-medium leading-relaxed mb-10 text-sm tracking-wide">
            A boutique Bun Maska experience, blending tradition with modern luxury.
          </p>
          
          <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-6 rounded-[2rem] mb-12 italic text-[#4A2410]/80 shadow-sm max-w-sm mx-auto font-medium">
             "{bunWisdom}"
          </div>

          <div className="flex flex-col gap-4 max-w-sm mx-auto">
            <button 
              onClick={() => document.getElementById('rewards')?.scrollIntoView({behavior: 'smooth'})}
              className="bg-[#4A2410] text-white py-5 px-8 rounded-3xl font-bold shadow-2xl btn-premium flex items-center justify-center gap-3 group"
            >
              <LucideGift size={20} className="text-butter-gold group-hover:rotate-12 transition-transform" /> 
              Claim Reward
            </button>
            <div className="flex gap-4">
               <button onClick={() => document.getElementById('events')?.scrollIntoView({behavior: 'smooth'})} className="flex-1 bg-white border-2 border-[#4A2410] text-[#4A2410] py-4 rounded-3xl font-bold btn-premium">Events</button>
               <button onClick={() => document.getElementById('prebook')?.scrollIntoView({behavior: 'smooth'})} className="flex-1 bg-butter-gold text-[#4A2410] py-4 rounded-3xl font-bold btn-premium shadow-lg">Pre-Book</button>
            </div>
          </div>
        </div>
      </header>

      {/* Boutique Menu Peek */}
      <section className="mt-32 px-8">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-premium font-bold">The Collection</h2>
          <div className="h-[1px] flex-1 bg-[#4A2410]/10 ml-8"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-card p-8 rounded-[3rem] flex items-center gap-8 shadow-sm group hover:shadow-2xl transition-all border-none">
             <div className="w-24 h-24 bg-orange-100/50 rounded-[2rem] flex items-center justify-center text-5xl group-hover:scale-110 transition-transform">🧈</div>
             <div>
                <h3 className="text-2xl font-bold mb-1">Classic Gold</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Artisan bun, whipped salted butter, and a hint of nostalgia.</p>
             </div>
          </div>
          <div className="glass-card p-8 rounded-[3rem] flex items-center gap-8 shadow-sm group hover:shadow-2xl transition-all border-none">
             <div className="w-24 h-24 bg-brown-100/50 rounded-[2rem] flex items-center justify-center text-5xl group-hover:scale-110 transition-transform">☕</div>
             <div>
                <h3 className="text-2xl font-bold mb-1">Kadak Irani</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Strong, milky, and brewed to perfection for your dip.</p>
             </div>
          </div>
        </div>
      </section>

      {/* Gated Scratch Card Section */}
      <section id="rewards" className="mt-32 px-6">
        <div className="bg-[#4A2410] rounded-[4rem] p-12 text-center shadow-[0_40px_100px_rgba(74,36,16,0.3)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-20 translate-x-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-butter-gold/10 rounded-full translate-y-16 -translate-x-16"></div>
          
          <div className="relative z-10">
            <h2 className="text-4xl font-premium text-white mb-3">The Golden Scratch</h2>
            <p className="text-white/50 text-sm mb-12 tracking-wider uppercase font-bold">Exclusive Digital Reward</p>

            {isGated ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-sm mx-auto">
                 <div className="relative group">
                    <input 
                      value={igHandle}
                      onChange={(e) => setIgHandle(e.target.value)}
                      placeholder="@your_instagram"
                      className="w-full bg-white/5 border border-white/10 rounded-3xl py-6 px-8 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-butter-gold transition-all text-lg font-medium"
                    />
                    <LucideInstagram className="absolute right-8 top-6 text-white/20 group-focus-within:text-butter-gold transition-colors" size={24} />
                 </div>
                 <div className="space-y-4">
                  <button 
                    onClick={unlockScratch}
                    className="w-full bg-butter-gold text-[#4A2410] py-6 rounded-3xl font-black shadow-xl flex items-center justify-center gap-3 btn-premium text-lg"
                  >
                    Follow @buntee.in to Scratch
                  </button>
                  <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-bold">Follow required to validate reward</p>
                 </div>
              </div>
            ) : (
              <div className="relative mx-auto w-full max-w-[300px] aspect-square rounded-[3rem] overflow-hidden bg-white shadow-2xl flex items-center justify-center animate-in zoom-in duration-500">
                 {/* Under Layer (The Prize) */}
                 <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-[#4A2410] bg-[#FFFDF8]">
                    <div className="w-16 h-16 bg-butter-gold/20 rounded-full flex items-center justify-center mb-4">
                      <LucidePartyPopper className="text-butter-gold" size={32} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-2">Congratulations</p>
                    <p className="text-4xl font-premium font-black mb-8 leading-tight">{prize}</p>
                    <button 
                      onClick={handleShare}
                      className={`bg-[#4A2410] text-white px-8 py-4 rounded-full text-sm font-bold flex items-center gap-3 transition-all duration-1000 transform ${scratchRevealed ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-90 pointer-events-none'}`}
                    >
                      <LucideInstagram size={18} /> Share to Story
                    </button>
                 </div>

                 {/* Scratch Layer Canvas */}
                 {!scratchRevealed && (
                   <canvas 
                     ref={canvasRef} 
                     className="absolute inset-0 cursor-crosshair z-10 touch-none shadow-inner"
                   />
                 )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Pre-Booking - Subtle Premium Form */}
      <section id="prebook" className="mt-32 px-8 max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-premium font-bold mb-4">Reserve Your Bun</h2>
          <p className="text-gray-400 font-medium">Baking fresh, just for you. Skip the wait.</p>
        </div>
        <form onSubmit={submitPreBook} className="space-y-5">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
             <input name="name" placeholder="Name" className="bg-white border-2 border-[#4A2410]/5 rounded-3xl p-6 outline-none focus:border-butter-gold transition-colors font-medium" required />
             <input name="contact" placeholder="Contact Number" className="bg-white border-2 border-[#4A2410]/5 rounded-3xl p-6 outline-none focus:border-butter-gold transition-colors font-medium" required />
           </div>
           <textarea name="message" placeholder="What can we bake for you today? (Items & Qty)" className="w-full bg-white border-2 border-[#4A2410]/5 rounded-[2rem] p-6 min-h-[120px] outline-none focus:border-butter-gold transition-colors font-medium" required></textarea>
           <button className="w-full bg-[#4A2410] text-white py-6 rounded-3xl font-bold shadow-xl flex items-center justify-center gap-3 hover:bg-black transition-colors">
              Confirm Reservation <LucideCheckCircle size={20} className="text-butter-gold" />
           </button>
        </form>
      </section>

      {/* Events - Elevated Request Form */}
      <section id="events" className="mt-32 px-8">
        <div className="bg-[#FFF4E0] rounded-[4rem] p-12 md:p-20 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-10 opacity-10">
              <LucideHeart size={200} className="text-[#4A2410]" />
           </div>
           <div className="max-w-xl relative z-10">
              <h2 className="text-4xl md:text-5xl font-premium font-bold mb-6 text-[#4A2410]">The Buntee Cart <br />At Your Event.</h2>
              <p className="text-[#4A2410]/60 mb-12 font-medium leading-relaxed">
                Add a touch of artisanal warmth to your weddings, corporate meets, or private soirees. Our cart brings the charm.
              </p>
              
              <form onSubmit={submitEvent} className="space-y-4">
                 <input name="name" placeholder="Event Host Name" className="w-full bg-white/50 backdrop-blur-md rounded-2xl p-5 border border-white focus:bg-white outline-none transition-all" required />
                 <input name="contact" placeholder="Preferred Contact" className="w-full bg-white/50 backdrop-blur-md rounded-2xl p-5 border border-white focus:bg-white outline-none transition-all" required />
                 <div className="grid grid-cols-2 gap-4">
                    <input name="date" type="date" className="bg-white/50 backdrop-blur-md rounded-2xl p-5 border border-white outline-none" required />
                    <select name="type" className="bg-white/50 backdrop-blur-md rounded-2xl p-5 border border-white outline-none" required>
                       <option>Wedding</option>
                       <option>Corporate</option>
                       <option>Private Party</option>
                       <option>Other</option>
                    </select>
                 </div>
                 <button className="w-full bg-[#4A2410] text-white py-6 rounded-3xl font-black shadow-2xl flex items-center justify-center gap-3 btn-premium">
                    Inquire Now <LucideSend size={20} />
                 </button>
              </form>
           </div>
        </div>
      </section>

      {/* Premium Ratings Experience */}
      <section className="mt-32 px-8 text-center">
        <div className="max-w-sm mx-auto glass-card p-12 rounded-[4rem] border-none shadow-xl">
          <h2 className="text-2xl font-premium font-bold mb-10">How's the Maska?</h2>
          <div className="text-8xl mb-10 transition-all duration-700 transform hover:scale-125">
            {rating <= 1 ? "🐻‍❄️" : rating === 2 ? "🐻" : rating === 3 ? "🧸" : rating === 4 ? "🐨" : "🐼"}
          </div>
          <input 
            type="range" min="1" max="5" 
            value={rating} 
            onChange={(e) => setRating(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-[#4A2410] mb-8"
          />
          <p className="font-black text-[#4A2410] tracking-widest text-xs uppercase">
             {rating === 5 ? "ABSOLUTE PERFECTION! ✨" : rating >= 4 ? "So Soft & Creamy!" : "Baking it better!"}
          </p>
        </div>
      </section>

      {/* Boutique Footer */}
      <footer className="mt-40 pt-24 pb-16 px-8 bg-[#4A2410] text-center text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-butter-gold/30 to-transparent"></div>
        <img src={LOGO_URL} alt="Buntee" className="w-24 mx-auto opacity-40 mb-10 grayscale brightness-200" />
        
        <div className="flex justify-center gap-12 mb-16">
           <a href={INSTAGRAM_URL} className="text-white/40 hover:text-butter-gold transition-colors flex flex-col items-center gap-2">
             <LucideInstagram size={28} />
             <span className="text-[10px] font-bold tracking-widest">FOLLOW</span>
           </a>
           <a href={IG_DM_URL} className="text-white/40 hover:text-butter-gold transition-colors flex flex-col items-center gap-2">
             <LucideMessageCircle size={28} />
             <span className="text-[10px] font-bold tracking-widest">DM US</span>
           </a>
        </div>

        <p className="text-white/20 text-[10px] uppercase tracking-[0.5em] font-medium mb-4">Buntee Bun Maska • Boutique Bakehouse</p>
        <p className="text-white/10 text-[9px] uppercase tracking-[0.3em]">© 2024 All Rights Reserved</p>
        
        <button 
          onClick={() => navigate('/admin')}
          className="mt-12 text-white/5 hover:text-white/20 text-[10px] tracking-widest uppercase transition-colors"
        >
          Staff Portal
        </button>
      </footer>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#4A2410]/95 backdrop-blur-2xl animate-in fade-in duration-500">
          <div className="bg-white rounded-[4rem] p-12 max-w-sm w-full text-center shadow-[0_50px_100px_rgba(0,0,0,0.4)] animate-in zoom-in slide-in-from-bottom-10 duration-700">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <LucideCheckCircle size={50} className="text-green-500" />
            </div>
            <h3 className="text-3xl font-premium font-bold mb-4">Done & Dusted.</h3>
            <p className="text-gray-400 font-medium leading-relaxed mb-10">{showSuccess}</p>
            <button 
              onClick={() => setShowSuccess(null)} 
              className="w-full bg-[#4A2410] text-white py-5 rounded-3xl font-black tracking-widest text-sm shadow-xl"
            >
              EXCELLENT
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;