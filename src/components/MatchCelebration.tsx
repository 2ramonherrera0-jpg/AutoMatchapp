import React from 'react';
import { Car, UserCar } from '../types';
import { MessageSquare, RefreshCw, X, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MatchCelebrationProps {
  isOpen: boolean;
  userCar: UserCar | null;
  matchedCar: Car | null;
  onClose: () => void;
  onGoToChat: () => void;
}

const COLORS = [
  '#ef4444', // Red-500
  '#f43f5e', // Rose-500
  '#f59e0b', // Amber-500
  '#10b981', // Emerald-500
  '#3b82f6', // Blue-500
  '#8b5cf6', // Violet-500
  '#ec4899', // Pink-500
  '#facc15', // Yellow-400
  '#22d3ee', // Cyan-400
];

const SHAPES: ('circle' | 'square' | 'triangle')[] = ['circle', 'square', 'triangle'];

interface ConfettiParticle {
  id: number;
  startX: string;
  startY: string;
  endX: string;
  endY: string;
  size: number;
  color: string;
  shape: 'circle' | 'square' | 'triangle';
  rotateStart: number;
  rotateEnd: number;
  duration: number;
  delay: number;
  repeat: boolean;
}

export default function MatchCelebration({ isOpen, userCar, matchedCar, onClose, onGoToChat }: MatchCelebrationProps) {
  const particles = React.useMemo(() => {
    if (!isOpen) return [];
    const arr: ConfettiParticle[] = [];
    let idCounter = 0;

    // 1. Rainfall (55 particles)
    for (let i = 0; i < 55; i++) {
      const size = Math.random() * 8 + 6; // 6px to 14px
      const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const startX = Math.random() * 100; // 0 to 100 vw
      const drift = Math.random() * 160 - 80; // px drift
      
      arr.push({
        id: idCounter++,
        startX: `${startX}vw`,
        startY: '-20px',
        endX: `calc(${startX}vw + ${drift}px)`,
        endY: '105vh',
        size,
        color,
        shape,
        rotateStart: Math.random() * 360,
        rotateEnd: Math.random() * 720 + 360,
        duration: Math.random() * 3 + 3, // 3s to 6s
        delay: Math.random() * 3.5, // staggered delayed fall
        repeat: true,
      });
    }

    // 2. Left Burst (25 particles launching up-right)
    for (let i = 0; i < 25; i++) {
      const size = Math.random() * 10 + 6;
      const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const angle = (Math.random() * 45 + 15) * (Math.PI / 180); // 15 to 60 degrees in radians
      const distance = Math.random() * 45 + 35; // 35 to 80 vw/vh distance
      const finalX = Math.cos(angle) * distance;
      const finalY = 100 - Math.sin(angle) * distance;

      arr.push({
        id: idCounter++,
        startX: '0vw',
        startY: '100vh',
        endX: `${finalX}vw`,
        endY: `${finalY}vh`,
        size,
        color,
        shape,
        rotateStart: Math.random() * 360,
        rotateEnd: Math.random() * 1080 - 540,
        duration: Math.random() * 1.5 + 1.2, // 1.2s to 2.7s
        delay: Math.random() * 0.3, // burst is immediate
        repeat: false,
      });
    }

    // 3. Right Burst (25 particles launching up-left)
    for (let i = 0; i < 25; i++) {
      const size = Math.random() * 10 + 6;
      const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const angle = (Math.random() * 45 + 15) * (Math.PI / 180); // 15 to 60 degrees in radians
      const distance = Math.random() * 45 + 35;
      const finalX = 100 - Math.cos(angle) * distance;
      const finalY = 100 - Math.sin(angle) * distance;

      arr.push({
        id: idCounter++,
        startX: '100vw',
        startY: '100vh',
        endX: `${finalX}vw`,
        endY: `${finalY}vh`,
        size,
        color,
        shape,
        rotateStart: Math.random() * 360,
        rotateEnd: Math.random() * 1080 - 540,
        duration: Math.random() * 1.5 + 1.2, // 1.2s to 2.7s
        delay: Math.random() * 0.3,
        repeat: false,
      });
    }

    return arr;
  }, [isOpen]);

  if (!isOpen || !matchedCar || !userCar) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-hidden" id="match_celebration_backdrop">
        {/* Particle Canvas */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10" id="celebration_particles">
          {particles.map((p) => {
            let borderRadius = '0%';
            let clipPath = 'none';

            if (p.shape === 'circle') {
              borderRadius = '50%';
            } else if (p.shape === 'triangle') {
              clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)';
            }

            return (
              <motion.div
                key={p.id}
                initial={{
                  x: p.startX,
                  y: p.startY,
                  rotate: p.rotateStart,
                  opacity: 1,
                  scale: 0.8,
                }}
                animate={{
                  x: p.endX,
                  y: p.endY,
                  rotate: p.rotateEnd,
                  opacity: [1, 1, 1, 0], // Fade out at the end
                  scale: [0.8, 1, 1, 0.4],
                }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  ease: p.repeat ? 'linear' : 'easeOut',
                  repeat: p.repeat ? Infinity : 0,
                }}
                style={{
                  position: 'absolute',
                  width: p.size,
                  height: p.size,
                  backgroundColor: p.color,
                  borderRadius,
                  clipPath,
                }}
              />
            );
          })}
        </div>
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative max-w-lg w-full bg-[#141414] border border-white/10 rounded-3xl p-6 text-center text-white shadow-2xl overflow-hidden"
          id="match_celebration_card"
        >
          {/* Animated Glow in the background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-red-600/20 rounded-full filter blur-3xl -z-10 animate-pulse"></div>
          <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-red-500/10 rounded-full filter blur-3xl -z-10 animate-pulse delay-75"></div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-all cursor-pointer"
            id="close_celebration_btn"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Celebratory header */}
          <div className="inline-flex bg-red-600 text-white p-3.5 rounded-full mb-4 shadow-lg shadow-red-600/40 animate-bounce">
            <Sparkles className="w-8 h-8 fill-current text-white" />
          </div>

          <h2 className="text-3xl md:text-4xl font-sans font-black uppercase italic tracking-tight bg-gradient-to-r from-red-500 via-red-400 to-rose-300 bg-clip-text text-transparent mb-1">
            ¡Es un AutoMatch!
          </h2>
          <p className="text-red-400 font-bold text-xs tracking-widest uppercase mb-6">
            Hay interés de {matchedCar.permuta ? 'Permuta o Venta' : 'Compra'}
          </p>

          {/* Cars layout side-by-side */}
          <div className="flex items-center justify-center gap-4 md:gap-6 mb-8 relative">
            {/* User car */}
            <div className="flex-1 flex flex-col items-center">
              <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden border-2 border-red-600 shadow-xl shadow-red-600/10 transform -rotate-6 hover:rotate-0 transition-all duration-300">
                <img 
                  src={userCar.image} 
                  alt="Tu auto" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <p className="text-white/95 font-bold text-xs mt-3 truncate w-28 text-center">{userCar.brand} {userCar.model}</p>
              <span className="text-[10px] bg-red-600/20 text-red-400 font-mono px-2 py-0.5 rounded-full mt-1">Tu auto</span>
            </div>

            {/* Match symbol */}
            <div className="z-10 bg-[#0a0a0a] text-white p-3 rounded-full shadow-lg border-4 border-[#141414] flex items-center justify-center shrink-0">
              <RefreshCw className="w-6 h-6 text-red-500 animate-spin" style={{ animationDuration: '8s' }} />
            </div>

            {/* Matched car */}
            <div className="flex-1 flex flex-col items-center">
              <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden border-2 border-white/10 shadow-xl shadow-white/5 transform rotate-6 hover:rotate-0 transition-all duration-300">
                <img 
                  src={matchedCar.image} 
                  alt="Auto match" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <p className="text-white/95 font-bold text-xs mt-3 truncate w-28 text-center">{matchedCar.brand} {matchedCar.model}</p>
              <span className="text-[10px] bg-white/10 text-white/85 font-mono px-2 py-0.5 rounded-full mt-1">De {matchedCar.ownerName}</span>
            </div>
          </div>

          {/* Call to action message */}
          <div className="bg-[#0a0a0a] border border-white/5 p-4 rounded-2xl mb-8 text-left max-w-sm mx-auto">
            <p className="text-xs text-white/70 leading-relaxed">
              A <strong className="text-white">{matchedCar.ownerName}</strong> ({matchedCar.location}) también le gustó tu vehículo. {matchedCar.permuta ? 'Está muy interesado en tu propuesta de permuta.' : 'Le llama mucho la atención tu publicación.'}
            </p>
            {matchedCar.permuta && matchedCar.permutaPreferences && (
              <div className="mt-2.5 pt-2.5 border-t border-white/10">
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Busca permutar por:
                </span>
                <p className="text-[11px] text-white/90 italic mt-0.5">
                  "{matchedCar.permutaPreferences}"
                </p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 max-w-xs mx-auto">
            <button
              onClick={onGoToChat}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 text-sm transition-all cursor-pointer shadow-lg shadow-red-600/35"
              id="goto_chat_celebration_btn"
            >
              <MessageSquare className="w-4 h-4 fill-current" />
              Negociar por Chat Ahora
            </button>
            <button
              onClick={onClose}
              className="w-full bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 font-semibold py-3 px-6 rounded-2xl text-sm transition-all cursor-pointer"
              id="continue_swiping_celebration_btn"
            >
              Seguir Deslizando Autos
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
