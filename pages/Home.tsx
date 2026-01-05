
import React, { useState, useEffect, useRef } from 'react';
import { db, createAi } from '../services/firebase';
import { doc, addDoc, collection, onSnapshot, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { LucideInstagram, LucideCheckCircle, LucideHeart, LucidePartyPopper, LucideShare2, LucideMessageCircle, LucideArrowRight, LucideGift, LucideSend, LucidePlus, LucideMinus, LucideShoppingBag, LucideStar, LucideUser, LucideChefHat } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LOGO_URL = "https://raw.githubusercontent.com/Hunnyspace/buntee-tracker/main/Bunteelogo.png";
const INSTAGRAM_URL = "https://www.instagram.com/buntee.in/";
const IG_DM_URL = "https://ig.me/m/buntee.in";
const FOUNDER_ANUP = "https://www.instagram.com/imthathunnyguy/";
const FOUNDER_MOHAN = "https://www.instagram.com/mr.majnu_mohan/";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [bunWisdom, setBunWisdom] = useState<string>("The perfect bun is a warm hug for the soul...");
  const [rating, setRating] = useState(5);
  const [showSuccess, setShowSuccess] = useState<string | null>(null);
  const [cart, setCart] = useState<{ [key: string]: number }>({});

  // Scratch Card States
  const [igHandle, setIgHandle] = useState("");
  const [isGated, setIsGated] = useState(true);
  const [isFollowed, setIsFollowed] = useState(false);
  const [scratchRevealed, setScratchRevealed] = useState(false);
  const [prize, setPrize] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const q = query(collection(db, "menuItems"), orderBy("name", "asc"));
    const unsubMenu = onSnapshot(q, (snap) => {
      setMenuItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubMenu();
  }, []);

  useEffect(() => {
    const fetchWisdom = async () => {
      try {
        // Create a new GoogleGenAI instance right before making an API call
        const ai = createAi();
        // Use ai.models.generateContent to query GenAI with both the model name and prompt
        const res = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: "Give a short, elegant, 1-sentence 'bun wisdom' about bun maska. Use words like 'velvety', 'soulful', 'warmth'. Stay under 12 words.",
          config: { 
            systemInstruction: "You are a luxury food critic mascot for Buntee." 
          },
        });
        // Accessing the .text property directly (not a method) as per guidelines
        setBunWisdom(res.text?.trim() || "The perfect bun is a warm hug for the soul.");
      } catch (e) { console.error("Gemini Error:", e); }
    };
    fetchWisdom();
  }, []);

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

    const offers = ["Free Classic Bun", "Extra Maska", "Premium Drizzle", "25% Off", "BOGO Offer", "Surprise Cookie"];
    const win = offers[Math.floor(Math.random() * offers.length)];
    setPrize(win);

    const rect = canvas.parentElement?.getBoundingClientRect();
    const size = rect?.width || 320;
    canvas.width = size;
    canvas.height = size;

    ctx.fillStyle = '#FFD700';
    ctx.fillRect(0, 0, size, size);
    
    ctx.strokeStyle = '#E6C200';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < size; i += 15) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, size); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(size, i); ctx.stroke();
    }

    ctx.fillStyle = '#4A2410';
    ctx.font = `bold ${Math.floor(size/14)}px Quicksand`;
    ctx.textAlign = 'center';
    ctx.fillText('SCRATCH WITH LOVE', size/2, size/2 + 7);

    let isDrawing = false;
    const scratch = (x: number, y: number) => {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, size/8, 0, Math.PI * 2);
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
      if (percent > 45) setScratchRevealed(true);
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
    canvas.addEventListener('touchstart', handleStart, { passive: false });
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchend', handleEnd);
    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('touchmove', handleMove, { passive: false });
  };

  const handleShare = async () => {
    const shareText = `OMG! I just won a "${prize}" at @buntee.in! 🍞✨ Claim yours by following them! #Buntee #BunMaska`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'I WON AT BUNTEE!',
          text: shareText,
          url: window.location.origin,
        });
      } catch (e) { console.error(e); }
    } else {
      navigator.clipboard.writeText(shareText);
      alert("Caption copied! Tag @buntee.in on your IG story to claim!");
    }
  };

  const updateCart = (name: string, delta: number) => {
    setCart(prev => {
      const current = prev[name] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const { [name]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [name]: next };
    });
  };

  const submitPreBook = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (Object.keys(cart).length === 0) {
      alert("Please select at least one item from the menu!");
      return;
    }
    const formData = new FormData(e.currentTarget);
    const data = {
      ...Object.fromEntries(formData),
      items: cart,
      timestamp: serverTimestamp(),
    };
    try {
      await addDoc(collection(db, "preBookings"), data);
      setShowSuccess("Your pre-booking is confirmed. See you soon!");
      setCart({});
      (e.target as HTMLFormElement).reset();
    } catch (err) { alert("Error pre-booking."); }
  };

  const submitFeedback = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      rating,
      comment: formData.get('comment'),
      name: formData.get('name') || "Anonymous",
      timestamp: serverTimestamp(),
    };
    try {
      await addDoc(collection(db, "feedbacks"), data);
      setShowSuccess("Thank you for your buttery feedback!");
      (e.target as HTMLFormElement).reset();
      setRating(5);
    } catch (err) { alert("Error sending feedback."); }
  };

  const submitEventOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      ...Object.fromEntries(formData),
      timestamp: serverTimestamp(),
    };
    try {
      await addDoc(collection(db, "eventOrders"), data);
      setShowSuccess("Event inquiry received. Our founders will contact you!");
      (e.target as HTMLFormElement).reset();
    } catch (err) { alert("Error submitting event order."); }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF8] pb-32">
      <a 
        href={IG_DM_URL} 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-[60] bg-[#4A2410] text-white p-5 rounded-full shadow-[0_20px_40px_rgba(74,36,16,0.3)] pulse flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
      >
        <LucideMessageCircle size={28} />
      </a>

      <header className="pt-20 px-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-butter-gold/10 blur-[150px] -z-10 rounded-full"></div>
        <img src={LOGO_URL} alt="Buntee" className="w-32 mx-auto mb-10 floating drop-shadow-2xl" />
        <h1 className="text-5xl md:text-7xl font-premium font-black text-[#4A2410] mb-6 leading-[1.1]">
          Artisanal <br /><span className="italic text-orange-400">Bun Maska.</span>
        </h1>
        <p className="max-w-xs mx-auto text-[#4A2410]/40 font-semibold uppercase tracking-[0.2em] text-[10px] mb-12">
          Hand-crafted warmth since 2024
        </p>
        <div className="bg-white/50 backdrop-blur-xl border border-white/80 p-6 rounded-[2.5rem] mb-16 italic text-[#4A2410]/80 shadow-sm max-w-sm mx-auto font-medium">
           "{bunWisdom}"
        </div>
      </header>

      <section id="menu" className="px-6 mt-12">
        <div className="flex items-center gap-6 mb-12">
          <h2 className="text-3xl font-premium font-bold shrink-0">Our Menu</h2>
          <div className="h-[1px] w-full bg-[#4A2410]/10"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {menuItems.length === 0 ? (
            <div className="col-span-full p-12 text-center text-gray-300 font-medium bg-gray-50 rounded-[3rem] border-2 border-dashed">Menu is baking...</div>
          ) : menuItems.map((item) => (
            <div key={item.id} className="glass-panel p-6 rounded-[3rem] flex items-center justify-between group hover:shadow-2xl transition-all duration-500">
               <div className="flex items-center gap-6">
                 <div className="w-20 h-20 bg-[#4A2410]/5 rounded-[2rem] flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">{item.emoji || "🍞"}</div>
                 <div>
                    <h3 className="text-xl font-bold text-[#4A2410]">{item.name}</h3>
                    <p className="text-xs text-gray-400 mt-1">₹{item.price}</p>
                 </div>
               </div>
               <div className="flex items-center bg-[#4A2410]/5 rounded-2xl p-1">
                  <button onClick={() => updateCart(item.name, -1)} className="p-2 hover:bg-white rounded-xl transition-colors"><LucideMinus size={16} /></button>
                  <span className="w-10 text-center font-black text-[#4A2410]">{cart[item.name] || 0}</span>
                  <button onClick={() => updateCart(item.name, 1)} className="p-2 hover:bg-white rounded-xl transition-colors"><LucidePlus size={16} /></button>
               </div>
            </div>
          ))}
        </div>
      </section>

      <section id="rewards" className="mt-32 px-6">
        <div className="bg-[#4A2410] rounded-[4rem] p-12 text-center shadow-[0_40px_100px_rgba(74,36,16,0.3)] relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl font-premium text-white mb-3">Daily Scratch</h2>
            <p className="text-white/40 text-[10px] mb-12 uppercase tracking-[0.4em] font-bold">Follow @buntee.in to play</p>
            {isGated ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-sm mx-auto">
                 <input value={igHandle} onChange={(e) => setIgHandle(e.target.value)} placeholder="@instagram_handle" className="w-full bg-white/5 border border-white/10 rounded-3xl py-6 px-8 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-butter-gold transition-all" />
                 <button onClick={() => { if(!igHandle) return alert("Enter handle!"); window.open(INSTAGRAM_URL, '_blank'); setIsFollowed(true); setIsGated(false); }} className="w-full bg-butter-gold text-[#4A2410] py-6 rounded-3xl font-black shadow-xl btn-premium text-lg">Follow & Unlock Card</button>
              </div>
            ) : (
              <div className="scratch-card-wrapper rounded-[3rem] overflow-hidden bg-white shadow-2xl flex items-center justify-center animate-in zoom-in duration-500">
                 <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-[#4A2410] bg-[#FFFDF8]">
                    <div className="w-16 h-16 bg-butter-gold/20 rounded-full flex items-center justify-center mb-4"><LucidePartyPopper className="text-butter-gold" size={32} /></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 mb-2">Winner</p>
                    <p className="text-4xl font-premium font-black mb-8 leading-tight">{prize}</p>
                    <button onClick={handleShare} className={`bg-[#4A2410] text-white px-8 py-4 rounded-full text-xs font-bold flex items-center gap-3 transition-all duration-1000 ${scratchRevealed ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'}`}><LucideInstagram size={16} /> Share to Story</button>
                 </div>
                 {!scratchRevealed && <canvas id="scratch-canvas" ref={canvasRef} />}
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="prebook" className="mt-32 px-8 max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-premium font-bold mb-4">Express Pre-Book</h2>
          <p className="text-gray-400 font-medium">Toasted to perfection, ready when you are.</p>
        </div>
        {Object.keys(cart).length > 0 && (
          <div className="bg-butter-gold/10 p-6 rounded-[2rem] mb-8 border border-butter-gold/20">
            <h4 className="text-[10px] uppercase tracking-widest font-black text-[#4A2410]/50 mb-4">Current Order</h4>
            {Object.entries(cart).map(([name, qty]) => (
              <div key={name} className="flex justify-between items-center mb-2 font-bold text-sm"><span>{name}</span><span>x{qty}</span></div>
            ))}
          </div>
        )}
        <form onSubmit={submitPreBook} className="space-y-6">
           <input name="name" placeholder="Name" className="w-full bg-white border-2 border-[#4A2410]/5 rounded-3xl p-6 outline-none font-medium" required />
           <input name="contact" placeholder="Contact Number" className="w-full bg-white border-2 border-[#4A2410]/5 rounded-3xl p-6 outline-none font-medium" required />
           <button className="w-full bg-[#4A2410] text-white py-6 rounded-3xl font-black shadow-xl btn-premium flex items-center justify-center gap-3">Confirm Order <LucideShoppingBag size={20} /></button>
        </form>
      </section>

      <section id="events" className="mt-32 px-8 max-w-2xl mx-auto">
        <div className="bg-[#4A2410] text-white rounded-[3rem] p-10 md:p-16 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-premium font-bold mb-6">Catering & Events</h2>
            <p className="text-white/60 mb-10 text-sm leading-relaxed">Let Buntee add artisanal warmth to your celebrations. From weddings to corporate meets, we bring the cart!</p>
            <form onSubmit={submitEventOrder} className="space-y-4">
              <input name="event_name" placeholder="Your Name" className="w-full bg-white/10 rounded-2xl p-5 border border-white/20 outline-none text-white placeholder:text-white/30" required />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="event_date" type="date" className="bg-white/10 rounded-2xl p-5 border border-white/20 outline-none text-white" required />
                <input name="event_type" placeholder="Event (e.g. Wedding)" className="bg-white/10 rounded-2xl p-5 border border-white/20 outline-none text-white placeholder:text-white/30" required />
              </div>
              <input name="event_contact" placeholder="Contact Number" className="w-full bg-white/10 rounded-2xl p-5 border border-white/20 outline-none text-white placeholder:text-white/30" required />
              <button className="w-full bg-white text-[#4A2410] py-5 rounded-2xl font-black shadow-lg">Inquire Now</button>
            </form>
          </div>
        </div>
      </section>

      <section id="feedback" className="mt-32 px-8 max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-premium font-bold mb-4">The Buttery Feedback</h2>
          <p className="text-gray-400 text-sm">How was your Buntee experience?</p>
        </div>
        <div className="glass-panel p-8 rounded-[3rem] text-center">
          <div className="flex justify-center gap-2 mb-8">
            {[1, 2, 3, 4, 5].map(i => (
              <button key={i} onClick={() => setRating(i)} className="transition-transform active:scale-90"><LucideStar size={32} className={i <= rating ? "fill-butter-gold text-butter-gold" : "text-gray-200"} /></button>
            ))}
          </div>
          <form onSubmit={submitFeedback} className="space-y-4">
            <input name="name" placeholder="Your Name (Optional)" className="w-full bg-gray-50 rounded-2xl p-4 outline-none border border-transparent focus:border-butter-gold transition-all" />
            <textarea name="comment" placeholder="Your buttery thoughts..." className="w-full bg-gray-50 rounded-2xl p-4 outline-none border border-transparent focus:border-butter-gold transition-all min-h-[100px]" required />
            <button className="w-full bg-[#4A2410] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2">Send Love <LucideHeart size={18} /></button>
          </form>
        </div>
      </section>

      <footer className="mt-40 pt-24 pb-16 px-8 bg-[#4A2410] text-center text-white relative">
        <img src={LOGO_URL} alt="Buntee" className="w-20 mx-auto opacity-30 mb-10 grayscale brightness-200" />
        <div className="flex justify-center gap-8 mb-16 opacity-50"><a href={INSTAGRAM_URL} className="hover:text-butter-gold transition-colors"><LucideInstagram size={28} /></a></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-sm mx-auto mb-16">
          <a href={FOUNDER_ANUP} target="_blank" className="flex items-center justify-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
            <LucideUser size={20} className="text-butter-gold" />
            <div className="text-left"><p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Founder</p><p className="font-bold">Anup</p></div>
          </a>
          <a href={FOUNDER_MOHAN} target="_blank" className="flex items-center justify-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
            <LucideChefHat size={20} className="text-butter-gold" />
            <div className="text-left"><p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Founder</p><p className="font-bold">Mohan</p></div>
          </a>
        </div>
        <p className="text-white/20 text-[10px] uppercase tracking-[0.5em] font-medium mb-4">Buntee Bun Maska © 2026</p>
        <button onClick={() => navigate('/admin')} className="text-white/5 text-[9px] uppercase tracking-widest hover:text-white/20 transition-colors">Staff Portal</button>
      </footer>

      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#4A2410]/95 backdrop-blur-2xl animate-in fade-in">
          <div className="bg-white rounded-[4rem] p-12 max-w-sm w-full text-center shadow-2xl">
            <LucideCheckCircle size={50} className="text-green-500 mx-auto mb-6" />
            <h3 className="text-3xl font-premium font-bold mb-4">Success!</h3>
            <p className="text-gray-400 font-medium mb-10">{showSuccess}</p>
            <button onClick={() => setShowSuccess(null)} className="w-full bg-[#4A2410] text-white py-5 rounded-3xl font-black">EXCELLENT</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
