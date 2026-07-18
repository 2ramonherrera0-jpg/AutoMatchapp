import React, { useState, useEffect, useCallback } from 'react';
import { Car, Match, Message, UserCar } from './types';
import { MOCK_CARS } from './mockData';
import Onboarding from './components/Onboarding';
import SwipeDeck from './components/SwipeDeck';
import ChatSection from './components/ChatSection';
import Dashboard from './components/Dashboard';
import MatchCelebration from './components/MatchCelebration';
import CarCard from './components/CarCard'; // For single detail card popups
import PrivacyDisclosureModal from './components/PrivacyDisclosureModal';
import { 
  Car as CarIcon, 
  CarFront,
  Heart, 
  MessageCircle, 
  User, 
  Sparkles, 
  TrendingUp, 
  RotateCcw, 
  X, 
  ShieldCheck, 
  Trash2,
  Info,
  Volume2,
  Key
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { playEngineSound, EngineType } from './lib/audio';
// @ts-ignore
import appLogo from './assets/images/app_logo_1784102975399.jpg';

export default function App() {
  // Onboarding & Profile State
  const [userCar, setUserCar] = useState<UserCar | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);

  // Privacy & Data Disclosure Modal States
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [privacyModalTab, setPrivacyModalTab] = useState<'privacy' | 'disclosure' | 'terms'>('privacy');

  // Tab State: 'swipe', 'chats', 'dashboard'
  const [activeTab, setActiveTab] = useState<'swipe' | 'chats' | 'dashboard'>('swipe');

  // Swiped & Match States
  const [swipedCarIds, setSwipedCarIds] = useState<string[]>([]);
  const [leftSwipedCarIds, setLeftSwipedCarIds] = useState<string[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isBoosted, setIsBoosted] = useState<boolean>(false);

  // Global Search Preferences State
  const [searchPreferences, setSearchPreferences] = useState<{
    maxKm: string;
    region: string;
  }>({
    maxKm: 'Todos',
    region: 'Todos'
  });

  // Celebration state
  const [celebrationOpen, setCelebrationOpen] = useState(false);
  const [celebratedCar, setCelebratedCar] = useState<Car | null>(null);
  
  // Navigation Helper inside chat
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);

  // Ficha/Detail dialog for popup view from chat or stats
  const [detailCar, setDetailCar] = useState<Car | null>(null);

  // Load from LocalStorage
  useEffect(() => {
    const storedUserCar = localStorage.getItem('automatch_user_car');
    const storedUserName = localStorage.getItem('automatch_user_name');
    const storedSwiped = localStorage.getItem('automatch_swiped_ids');
    const storedMatches = localStorage.getItem('automatch_matches');
    const storedBoosted = localStorage.getItem('automatch_boosted');

    if (storedUserCar && storedUserName) {
      setUserCar(JSON.parse(storedUserCar));
      setUserName(storedUserName);
    }
    if (storedSwiped) {
      setSwipedCarIds(JSON.parse(storedSwiped));
    }
    const storedLeftSwiped = localStorage.getItem('automatch_left_swiped_ids');
    if (storedLeftSwiped) {
      setLeftSwipedCarIds(JSON.parse(storedLeftSwiped));
    }
    if (storedMatches) {
      setMatches(JSON.parse(storedMatches));
    } else {
      // Seed a default welcoming match to show clients how it works!
      // We will match them with Andrés and his Suzuki Swift Sport as a starter match!
      const defaultCar = MOCK_CARS[0];
      const initialMatch: Match = {
        id: defaultCar.id,
        car: defaultCar,
        timestamp: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
        unread: true,
        messages: [
          {
            id: 'system_init',
            sender: 'other',
            text: `[Sistema] ¡Es un AutoMatch! Ambos están interesados. Andrés busca: "${defaultCar.permutaPreferences}"`,
            timestamp: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
          },
          {
            id: 'init_msg_1',
            sender: 'other',
            text: defaultCar.chatPersona?.greeting || '¡Hola! Vi tu auto y me interesó harto para permuta. ¿Buscas permutar o vender?',
            timestamp: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
          }
        ]
      };
      setMatches([initialMatch]);
      localStorage.setItem('automatch_matches', JSON.stringify([initialMatch]));
    }
    if (storedBoosted) {
      setIsBoosted(JSON.parse(storedBoosted));
    }

    const storedSearchPrefs = localStorage.getItem('automatch_search_preferences');
    if (storedSearchPrefs) {
      setSearchPreferences(JSON.parse(storedSearchPrefs));
    }

    setIsLoaded(true);
  }, []);

  // Play startup engine sound on the very first user interaction with the page
  useEffect(() => {
    let triggered = false;
    const handleFirstGesture = () => {
      if (triggered) return;
      triggered = true;
      
      const savedSound = (localStorage.getItem('automatch_engine_sound') as EngineType) || 'v8';
      playEngineSound(savedSound);
      
      // Remove listeners so it only triggers once per app lifecycle load
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
    };

    window.addEventListener('click', handleFirstGesture);
    window.addEventListener('keydown', handleFirstGesture);
    window.addEventListener('touchstart', handleFirstGesture);

    return () => {
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
    };
  }, []);

  // Save to LocalStorage
  const saveToStorage = (key: string, value: any) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  const handleOnboardingComplete = (car: UserCar, name: string) => {
    setUserCar(car);
    setUserName(name);
    localStorage.setItem('automatch_user_car', JSON.stringify(car));
    localStorage.setItem('automatch_user_name', name);
  };

  // Triggered when user swipes Right (Like) or Up (Super Like)
  const handleSwipeAction = (car: Car, type: 'like' | 'superlike') => {
    // Save as swiped
    const updatedSwiped = [...swipedCarIds, car.id];
    setSwipedCarIds(updatedSwiped);
    saveToStorage('automatch_swiped_ids', updatedSwiped);

    // 40% chance of Match if car likes user, OR 100% chance if Super Like or car is preset to like
    const isMatch = car.likesUser || type === 'superlike';

    if (isMatch) {
      // Add a small delay to simulate real human feedback
      setTimeout(() => {
        const newMatch: Match = {
          id: car.id,
          car,
          timestamp: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
          unread: true,
          messages: [
            {
              id: `sys_${Date.now()}`,
              sender: 'other',
              text: `[Sistema] ¡Felicidades, es un AutoMatch! Has conectado con ${car.ownerName} para negociar.`,
              timestamp: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
            },
            {
              id: `msg_${Date.now()}`,
              sender: 'other',
              text: car.chatPersona?.greeting || `¡Hola! Me encantó tu publicación. ¿Hablemos de negocios?`,
              timestamp: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
            }
          ]
        };

        // Update matches state via functional updater to prevent stale references & loss of sent messages
        setMatches(prevMatches => {
          const updatedMatches = [newMatch, ...prevMatches.filter(m => m.id !== car.id)];
          saveToStorage('automatch_matches', updatedMatches);
          return updatedMatches;
        });

        // Trigger Celebration & play notification engine sound!
        setCelebratedCar(car);
        setCelebrationOpen(true);
        playConfiguredEngineSound();
      }, 600);
    }
  };

  const handleSwipeLeft = (car: Car) => {
    const updatedSwiped = [...swipedCarIds, car.id];
    setSwipedCarIds(updatedSwiped);
    saveToStorage('automatch_swiped_ids', updatedSwiped);

    const updatedLeftSwiped = [car.id, ...leftSwipedCarIds.filter(id => id !== car.id)];
    setLeftSwipedCarIds(updatedLeftSwiped);
    saveToStorage('automatch_left_swiped_ids', updatedLeftSwiped);
  };

  const handleSwipeRight = (car: Car) => {
    handleSwipeAction(car, 'like');
  };

  const handleSwipeUp = (car: Car) => {
    handleSwipeAction(car, 'superlike');
  };

  // Chat actions
  const handleSendMessage = (
    matchId: string, 
    text: string, 
    sender: 'user' | 'other',
    mediaType?: 'photo' | 'video',
    mediaUrl?: string,
    callDuration?: string,
    isCallMessage?: boolean
  ) => {
    setMatches(prevMatches => {
      const updatedMatches = prevMatches.map(match => {
        if (match.id === matchId) {
          const newMsg: Message = {
            id: `${sender}_${Date.now()}`,
            sender,
            text,
            timestamp: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
            mediaType,
            mediaUrl,
            callDuration,
            isCallMessage
          };
          return {
            ...match,
            timestamp: newMsg.timestamp,
            unread: sender === 'other' && matchId !== activeMatchId, // mark unread only if other is sender and user is not looking
            messages: [...match.messages, newMsg]
          };
        }
        return match;
      });

      saveToStorage('automatch_matches', updatedMatches);
      return updatedMatches;
    });
  };

  const handleMarkRead = (matchId: string) => {
    setMatches(prevMatches => {
      const updatedMatches = prevMatches.map(match => {
        if (match.id === matchId) {
          return { ...match, unread: false };
        }
        return match;
      });
      saveToStorage('automatch_matches', updatedMatches);
      return updatedMatches;
    });
  };

  const handleUpdateCar = (updatedCar: UserCar) => {
    setUserCar(updatedCar);
    saveToStorage('automatch_user_car', updatedCar);
  };

  // Reset swiped list to test again
  const handleResetDeck = () => {
    setSwipedCarIds([]);
    saveToStorage('automatch_swiped_ids', []);
    setLeftSwipedCarIds([]);
    saveToStorage('automatch_left_swiped_ids', []);
  };

  const handleRecoverCar = (carId: string) => {
    const updatedSwiped = swipedCarIds.filter(id => id !== carId);
    setSwipedCarIds(updatedSwiped);
    saveToStorage('automatch_swiped_ids', updatedSwiped);

    const updatedLeftSwiped = leftSwipedCarIds.filter(id => id !== carId);
    setLeftSwipedCarIds(updatedLeftSwiped);
    saveToStorage('automatch_left_swiped_ids', updatedLeftSwiped);
  };

  const handleLikeCarDirectly = (car: Car) => {
    // Remove from left swipes
    const updatedLeftSwiped = leftSwipedCarIds.filter(id => id !== car.id);
    setLeftSwipedCarIds(updatedLeftSwiped);
    saveToStorage('automatch_left_swiped_ids', updatedLeftSwiped);

    // Call swipe right
    handleSwipeAction(car, 'like');
  };

  // Boost simulated premium feature
  const handleBoost = () => {
    setIsBoosted(true);
    saveToStorage('automatch_boosted', true);

    // Simulate getting an instant Match when boosted!
    setTimeout(() => {
      setMatches(prevMatches => {
        // Find a car that isn't already matched
        const unmatched = MOCK_CARS.filter(c => !prevMatches.some(m => m.id === c.id));
        const randomCar = unmatched.length > 0 ? unmatched[Math.floor(Math.random() * unmatched.length)] : MOCK_CARS[1];

        const newMatch: Match = {
          id: randomCar.id,
          car: randomCar,
          timestamp: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
          unread: true,
          messages: [
            {
              id: `sys_boost_${Date.now()}`,
              sender: 'other',
              text: `[Sistema Boost] ¡Un cliente Premium ha hecho Match contigo!`,
              timestamp: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
            },
            {
              id: `msg_boost_${Date.now()}`,
              sender: 'other',
              text: `¡Hola! Me apareció tu auto destacado. Me interesa caleta permutar mi ${randomCar.brand} ${randomCar.model} por el tuyo. ¿Te tinca conversar?`,
              timestamp: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
            }
          ]
        };

        const updatedMatches = [newMatch, ...prevMatches.filter(m => m.id !== randomCar.id)];
        saveToStorage('automatch_matches', updatedMatches);

        // Run side-effects safely after state update scheduling
        setTimeout(() => {
          setCelebratedCar(randomCar);
          setCelebrationOpen(true);
          playConfiguredEngineSound();
        }, 0);

        return updatedMatches;
      });
    }, 4000);
  };

  // Clear all saved data to start over completely
  const handleHardReset = () => {
    if (confirm('¿Estás seguro de reiniciar todo? Se borrarán tus datos de auto publicado y tus chats.')) {
      localStorage.clear();
      setUserCar(null);
      setUserName('');
      setSwipedCarIds([]);
      setLeftSwipedCarIds([]);
      setMatches([]);
      setIsBoosted(false);
      setActiveTab('swipe');
      setActiveMatchId(null);
      setDetailCar(null);
    }
  };

  const playConfiguredEngineSound = () => {
    const savedSound = (localStorage.getItem('automatch_engine_sound') as EngineType) || 'v8';
    playEngineSound(savedSound);
  };

  const handleUpdateSearchPreferences = (prefs: { maxKm: string; region: string }) => {
    setSearchPreferences(prefs);
    saveToStorage('automatch_search_preferences', prefs);
  };

  // Filter cars to show in SwipeDeck (exclude swiped cars and apply search preferences)
  const remainingCars = MOCK_CARS.filter(car => {
    // 1. Exclude already swiped cars
    if (swipedCarIds.includes(car.id)) return false;

    // 2. Filter by max km
    if (searchPreferences.maxKm !== 'Todos') {
      const maxKmNum = parseInt(searchPreferences.maxKm, 10);
      if (car.km > maxKmNum) return false;
    }

    // 3. Filter by region
    if (searchPreferences.region !== 'Todos') {
      const locLower = car.location.toLowerCase();
      const filterLower = searchPreferences.region.toLowerCase();
      
      let regionMatch = false;
      if (searchPreferences.region === 'RM' || filterLower.includes('metropolitana')) {
        regionMatch = locLower.includes('rm') || locLower.includes('metropolitana');
      } else {
        const coreName = filterLower
          .replace('región de ', '')
          .replace('región del ', '')
          .replace('región ', '');
        regionMatch = locLower.includes(filterLower) || locLower.includes(coreName);
      }
      if (!regionMatch) return false;
    }

    return true;
  });

  // Count total unread chats
  const unreadCount = matches.filter(m => m.unread).length;

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center font-sans text-white/70">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="font-bold text-sm tracking-widest uppercase">Cargando AutoMatch Chile...</p>
        </div>
      </div>
    );
  }

  // If no user car is set up, show beautiful Onboarding / Valuation first
  if (!userCar) {
    return (
      <>
        <Onboarding 
          onComplete={handleOnboardingComplete} 
          onOpenPrivacy={(tab) => {
            setPrivacyModalTab(tab);
            setPrivacyModalOpen(true);
          }} 
        />
        <AnimatePresence>
          {privacyModalOpen && (
            <PrivacyDisclosureModal 
              isOpen={privacyModalOpen} 
              onClose={() => setPrivacyModalOpen(false)} 
              defaultTab={privacyModalTab}
            />
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <div className="h-screen h-[100dvh] overflow-hidden bg-zinc-950 text-white flex flex-col justify-between" id="app_root_layout">
      
      {/* HEADER BAR (Responsive & Elegant) */}
      <header className={`bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800 py-4 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 shrink-0 ${activeTab === 'chats' && activeMatchId ? 'hidden md:flex' : 'flex'}`} id="main_header">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl overflow-hidden rotate-3 shadow-[0_0_15px_rgba(239,68,68,0.5)] hover:shadow-[0_0_25px_rgba(239,68,68,0.85)] hover:rotate-6 active:scale-95 transition-all duration-300 shrink-0 border border-red-500/40" id="main_header_logo_container">
            <img 
              src={appLogo} 
              alt="AutoMatch Chile Logo" 
              className="w-full h-full object-cover filter drop-shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse" 
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="text-left ml-1">
            <h1 className="font-sans font-black text-xl tracking-tighter leading-none italic uppercase text-white">
              AutoMatch
            </h1>
            <span className="text-[9px] bg-white/10 text-white/60 font-semibold tracking-widest uppercase px-1.5 py-0.5 rounded-full mt-0.5 inline-block">CHILE EDITION</span>
          </div>
        </div>

        {/* Navigation Tabs (Desktop mode) */}
        <nav className="hidden md:flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800" id="desktop_tabs">
          <button
            onClick={() => setActiveTab('swipe')}
            className={`py-2 px-4 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'swipe' 
                ? 'bg-red-600 text-white shadow-md shadow-red-600/20' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
            id="tab_swipe_desktop"
          >
            <CarIcon className="w-4 h-4" />
            Deslizar Autos
            {remainingCars.length > 0 && (
              <span className="bg-white text-red-600 text-[9px] font-black px-1.5 py-0.5 rounded-full">
                {remainingCars.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('chats')}
            className={`py-2 px-4 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer relative ${
              activeTab === 'chats' 
                ? 'bg-red-600 text-white shadow-md shadow-red-600/20' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
            id="tab_chats_desktop"
          >
            <MessageCircle className="w-4 h-4" />
            Chats de Negociación
            {unreadCount > 0 && (
              <span className="bg-white text-red-600 text-[9px] font-black px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-2 px-4 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'dashboard' 
                ? 'bg-red-600 text-white shadow-md shadow-red-600/20' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
            id="tab_dashboard_desktop"
          >
            <TrendingUp className="w-4 h-4" />
            Mi Publicación
          </button>
        </nav>

        {/* User profile capsule info */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-bold text-white/90">{userName}</span>
            <span className="text-[10px] text-white/50 truncate w-32 font-mono">
              {userCar.brand} {userCar.model} ({userCar.year})
            </span>
          </div>
          
          {/* 🔊 ENGINE START SOUND ACTION (REV/STARTUP TRIGGER) */}
          <button
            onClick={playConfiguredEngineSound}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-500 hover:text-red-400 border border-red-500/20 hover:border-red-500/40 rounded-xl text-xs font-black uppercase transition-all duration-300 cursor-pointer shadow-lg shadow-red-950/30 shrink-0"
            title="Arrancar motor y escuchar sonido de notificación de la app 🔊"
            id="header_engine_start_btn"
          >
            <Key className="w-3.5 h-3.5 animate-bounce" style={{ animationDuration: '3s' }} />
            <span className="hidden sm:inline text-[9px] tracking-wider">Arrancar 🔊</span>
          </button>

          <button 
            onClick={() => setActiveTab('dashboard')} 
            className="w-9 h-9 rounded-xl overflow-hidden border border-white/10 cursor-pointer shadow-md hover:scale-105 hover:border-red-500 transition-all shrink-0"
            title="Ver tu publicación"
            id="user_avatar_btn"
          >
            <img 
              src={userCar.image} 
              alt="Tu auto" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </button>

          {/* Hard reset button for developers/testers */}
          <button
            onClick={handleHardReset}
            className="text-white/40 hover:text-red-500 p-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
            title="Borrar datos y empezar de nuevo"
            id="hard_reset_btn"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER CONTENT */}
      <main className="flex-1 w-full bg-[#0a0a0a] flex flex-col min-h-0" id="main_content_area">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className={`flex-1 flex flex-col min-h-0 ${activeTab === 'swipe' ? 'justify-center' : 'justify-start'} ${activeTab !== 'chats' ? 'overflow-y-auto' : 'overflow-hidden'}`}
            style={activeTab === 'chats' ? { flexGrow: 1, overflowY: 'auto', paddingBottom: '5.5rem' } : undefined}
            id={`tab_pane_${activeTab}`}
          >
            {activeTab === 'swipe' && (
              <SwipeDeck
                cars={remainingCars}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
                onSwipeUp={handleSwipeUp}
                onReset={handleResetDeck}
                onBoost={handleBoost}
                isBoosted={isBoosted}
              />
            )}

            {activeTab === 'chats' && (
              <ChatSection
                matches={matches}
                userCar={userCar}
                onSendMessage={handleSendMessage}
                onMarkRead={handleMarkRead}
                activeMatchId={activeMatchId}
                setActiveMatchId={setActiveMatchId}
                onOpenCarDetails={(car) => setDetailCar(car)}
              />
            )}

            {activeTab === 'dashboard' && (
              <Dashboard
                userCar={userCar}
                onUpdateCar={handleUpdateCar}
                onBoost={handleBoost}
                isBoosted={isBoosted}
                onOpenPrivacy={(tab) => {
                  setPrivacyModalTab(tab);
                  setPrivacyModalOpen(true);
                }}
                leftSwipedCarIds={leftSwipedCarIds}
                onRecoverCar={handleRecoverCar}
                onLikeCarDirectly={handleLikeCarDirectly}
                onOpenCarDetails={(car) => setDetailCar(car)}
                searchPreferences={searchPreferences}
                onUpdateSearchPreferences={handleUpdateSearchPreferences}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* FOOTER NAVIGATION TABS (Mobile mode sticky bottom) */}
      <footer className={`bg-[#0f0f0f] border-t border-white/10 py-2 px-3 md:hidden sticky bottom-0 z-30 shrink-0 shadow-xl ${activeTab === 'chats' && activeMatchId ? 'hidden' : 'block'}`} id="mobile_navbar">
        <div className="grid grid-cols-3 gap-1">
          
          <button
            onClick={() => setActiveTab('swipe')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'swipe' ? 'text-red-500 bg-red-600/10' : 'text-white/50 hover:text-white/80'
            }`}
            id="tab_swipe_mobile"
          >
            <div className="relative">
              <CarIcon className="w-5 h-5" />
              {remainingCars.length > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[8px] font-bold px-1.5 py-0.2 rounded-full min-w-[14px] text-center">
                  {remainingCars.length}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold mt-1">Deslizar</span>
          </button>

          <button
            onClick={() => setActiveTab('chats')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'chats' ? 'text-red-500 bg-red-600/10' : 'text-white/50 hover:text-white/80'
            }`}
            id="tab_chats_mobile"
          >
            <div className="relative">
              <MessageCircle className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 bg-red-600 text-white text-[8px] font-bold px-1.5 py-0.2 rounded-full min-w-[14px] text-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold mt-1">Chats</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'dashboard' ? 'text-red-500 bg-red-600/10' : 'text-white/50 hover:text-white/80'
            }`}
            id="tab_dashboard_mobile"
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-[10px] font-bold mt-1">Mi Publicación</span>
          </button>

        </div>
      </footer>

      {/* CELEBRATION FULLSCREEN DIALOG MATCH */}
      <MatchCelebration
        isOpen={celebrationOpen}
        userCar={userCar}
        matchedCar={celebratedCar}
        onClose={() => setCelebrationOpen(false)}
        onGoToChat={() => {
          setCelebrationOpen(false);
          setActiveTab('chats');
          if (celebratedCar) {
            setActiveMatchId(celebratedCar.id);
          }
        }}
      />

      {/* LIGHTBOX FOR SINGLE CAR DETAILS POPUPS (From Ficha click in Chat) */}
      <AnimatePresence>
        {detailCar && (
          <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-md" id="detail_lightbox_backdrop">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-md w-full bg-zinc-950 border border-zinc-800 rounded-3xl h-[600px] overflow-hidden"
              id="detail_lightbox_card"
            >
              <CarCard
                car={detailCar}
                index={0}
                active={true}
                onSwipeLeft={() => setDetailCar(null)}
                onSwipeRight={() => setDetailCar(null)}
                onSwipeUp={() => setDetailCar(null)}
              />
              {/* Back to chat overlay action */}
              <button
                onClick={() => setDetailCar(null)}
                className="absolute top-4 right-4 z-50 bg-black/60 hover:bg-red-600 text-white p-2 rounded-full cursor-pointer transition-all"
                id="close_lightbox_btn"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DESKTOP GLOBAL COMPLIANCE FOOTER */}
      <footer className="hidden md:block bg-zinc-950 border-t border-zinc-900 py-3.5 text-center text-xs text-white/30 shrink-0" id="desktop_compliance_footer">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>AutoMatch Chile © 2026. Todos los derechos reservados.</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                setPrivacyModalTab('terms');
                setPrivacyModalOpen(true);
              }}
              className="hover:text-red-500 hover:underline cursor-pointer transition-all bg-transparent border-0 font-bold text-red-500/80"
              id="desktop_footer_terms_link"
            >
              Términos y Condiciones
            </button>
            <span className="text-white/10">•</span>
            <button 
              onClick={() => {
                setPrivacyModalTab('privacy');
                setPrivacyModalOpen(true);
              }}
              className="hover:text-red-500 hover:underline cursor-pointer transition-all bg-transparent border-0"
              id="desktop_footer_privacy_link"
            >
              Política de Privacidad
            </button>
            <span className="text-white/10">•</span>
            <button 
              onClick={() => {
                setPrivacyModalTab('disclosure');
                setPrivacyModalOpen(true);
              }}
              className="hover:text-red-500 hover:underline cursor-pointer transition-all bg-transparent border-0"
              id="desktop_footer_disclosure_link"
            >
              Declaración de Transparencia de Datos
            </button>
          </div>
        </div>
      </footer>

      {/* RENDER PRIVACY MODAL */}
      <AnimatePresence>
        {privacyModalOpen && (
          <PrivacyDisclosureModal 
            isOpen={privacyModalOpen} 
            onClose={() => setPrivacyModalOpen(false)} 
            defaultTab={privacyModalTab}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
