import React, { useState, useEffect } from 'react';
import { UserCar, ValuationResult } from '../types';
import { POPULAR_BRANDS, CHILEAN_REGIONS, estimateCarValue } from '../mockData';
import { 
  Car as CarIcon, 
  CarFront, 
  Sparkles, 
  ShieldCheck, 
  MapPin, 
  DollarSign, 
  ArrowRight, 
  TrendingUp, 
  Compass, 
  Heart,
  Volume2,
  Zap,
  Key,
  Upload,
  Video,
  Trash2,
  Image,
  Smartphone,
  CheckCircle2,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'motion/react';
import { playEngineSound, EngineType } from '../lib/audio';
// @ts-ignore
import appLogo from '../assets/images/app_logo_1784102975399.jpg';

interface OnboardingProps {
  onComplete: (userCar: UserCar, userName: string) => void;
  onOpenPrivacy?: (tab: 'privacy' | 'disclosure' | 'terms') => void;
  currentUser: any;
  onGoogleSignIn: () => Promise<void>;
  onGuestSignIn: () => Promise<void>;
  authLoading: boolean;
  authError?: string | null;
  onSelectLocalMode?: () => void;
  onClearAuthError?: () => void;
}

// Preset photos for user's car to look beautiful, each mapped to a full rich gallery of details
const PHOTO_PRESETS = [
  { 
    id: 'hatchback', 
    name: 'Hatchback (Rojo)', 
    url: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=800', // Front
      'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80&w=800', // Interior
      'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=800', // Engine
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800'  // Detail
    ]
  },
  { 
    id: 'sedan', 
    name: 'Sedán (Plateado)', 
    url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800', // Front
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800', // Interior
      'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=800', // Engine
      'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80&w=800'  // Detail
    ]
  },
  { 
    id: 'suv', 
    name: 'SUV (Blanco)', 
    url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=800', // Front
      'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&q=80&w=800', // Interior
      'https://images.unsplash.com/photo-1562426509-5044a121aa49?auto=format&fit=crop&q=80&w=800', // Engine
      'https://images.unsplash.com/photo-1539799139360-4043ac0dc273?auto=format&fit=crop&q=80&w=800'  // Detail
    ]
  },
  { 
    id: 'pickup', 
    name: 'Camioneta (Gris)', 
    url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800', // Front
      'https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&q=80&w=800', // Interior
      'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?auto=format&fit=crop&q=80&w=800', // Engine
      'https://images.unsplash.com/photo-1532581291347-9c39cf10a73c?auto=format&fit=crop&q=80&w=800'  // Detail
    ]
  },
  { 
    id: 'coupe', 
    name: 'Deportivo (Azul)', 
    url: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=800', // Front
      'https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80&w=800', // Interior
      'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=800', // Engine
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800'  // Detail
    ]
  }
];

export default function Onboarding({ 
  onComplete, 
  onOpenPrivacy, 
  currentUser, 
  onGoogleSignIn, 
  onGuestSignIn, 
  authLoading,
  authError,
  onSelectLocalMode,
  onClearAuthError
}: OnboardingProps) {
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0); // 0: Welcome, 1: Valuation & Car Info, 2: Swap/Sell Prefs, 3: Contact & Presets

  // Form State
  const [brand, setBrand] = useState('Suzuki');
  const [model, setModel] = useState('Swift');
  const [year, setYear] = useState(2019);
  const [km, setKm] = useState(60000);
  const [fuel, setFuel] = useState<'Bencina' | 'Diésel' | 'Híbrido' | 'Eléctrico'>('Bencina');
  const [transmission, setTransmission] = useState<'Manual' | 'Automática'>('Manual');
  const [price, setPrice] = useState(9500000);
  
  // Business State
  const [permuta, setPermuta] = useState(true);
  const [permutaPreferences, setPermutaPreferences] = useState('Busco SUV o camioneta, pago diferencia.');
  const [description, setDescription] = useState('Excelente estado, único dueño, mantenciones al día, papeles listos para transferir.');
  
  // Contact & Image State
  const [selectedPhoto, setSelectedPhoto] = useState(PHOTO_PRESETS[0].url);
  const [uploadedMedia, setUploadedMedia] = useState<{ url: string; type: 'photo' | 'video'; name: string }[]>([]);
  const [userName, setUserName] = useState('');
  const [contactPhone, setContactPhone] = useState('+56 9 ');
  const [region, setRegion] = useState('Región Metropolitana');
  const [commune, setCommune] = useState('Santiago');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    
    files.forEach((file: File) => {
      const type = file.type.startsWith('video/') ? 'video' : 'photo';
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedMedia(prev => [
            ...prev,
            {
              url: event.target!.result as string,
              type,
              name: file.name
            }
          ]);
        }
      };
      
      if (file.size > 2 * 1024 * 1024) {
        const objectUrl = URL.createObjectURL(file);
        setUploadedMedia(prev => [
          ...prev,
          {
            url: objectUrl,
            type,
            name: file.name
          }
        ]);
      } else {
        reader.readAsDataURL(file);
      }
    });
  };

  const handleRemoveUploadedMedia = (index: number) => {
    setUploadedMedia(prev => prev.filter((_, i) => i !== index));
  };

  // Valuation results
  const [valuation, setValuation] = useState<ValuationResult | null>(null);

  // Engine Sound Settings State
  const [selectedEngineSound, setSelectedEngineSound] = useState<EngineType>(() => {
    const saved = localStorage.getItem('automatch_engine_sound');
    return (saved as EngineType) || 'v8';
  });

  // OTP Verification States
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [sentOtp, setSentOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [otpError, setOtpError] = useState('');
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [simulatedSMS, setSimulatedSMS] = useState<{ message: string; code: string } | null>(null);

  useEffect(() => {
    if (otpTimer > 0) {
      const interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [otpTimer]);

  const triggerSendOTP = (phoneToUse?: string) => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setSentOtp(code);
    setOtpTimer(60);
    setOtpError('');
    setOtpCode('');
    
    // Simulate SMS notification block
    const smsText = `AutoMatch OTP: ${code} es tu código para registrar tu auto y validar tu número.`;
    setSimulatedSMS({ message: smsText, code });
    
    // Auto-clear notification after 15 seconds
    setTimeout(() => {
      setSimulatedSMS(prev => {
        if (prev?.code === code) return null;
        return prev;
      });
    }, 15000);
  };

  // Auto-fill presets to quickly test
  const handleQuickFill = (brandName: string, modelName: string, yearVal: number, kmVal: number, priceVal: number, photoId: string) => {
    setBrand(brandName);
    setModel(modelName);
    setYear(yearVal);
    setKm(kmVal);
    setPrice(priceVal);
    setStep(1);
    
    const photo = PHOTO_PRESETS.find(p => p.id === photoId);
    if (photo) {
      setSelectedPhoto(photo.url);
    }
  };

  // Trigger Valuation whenever Brand, Year, KM changes
  useEffect(() => {
    const res = estimateCarValue({
      brand,
      model,
      year,
      km,
      condition: 'good'
    });
    setValuation(res);
    setPrice(res.avgPrice);
  }, [brand, model, year, km]);

  // Update communes list when region changes
  const activeRegionObj = CHILEAN_REGIONS.find(r => r.name === region);
  const communesList = activeRegionObj ? activeRegionObj.communes : [];

  useEffect(() => {
    if (communesList.length > 0) {
      setCommune(communesList[0]);
    }
  }, [region]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;

    // Persist selected notification / startup engine sound
    localStorage.setItem('automatch_engine_sound', selectedEngineSound);
    
    // Play the satisfying car engine start sound on entry!
    playEngineSound(selectedEngineSound);

    // Open OTP modal and trigger send
    setShowOTPModal(true);
    triggerSendOTP(contactPhone);
  };

  const handleVerifyOTP = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (otpCode.trim() !== sentOtp) {
      setOtpError('Código incorrecto. Por favor, revisa el SMS e intenta de nuevo.');
      return;
    }

    setOtpVerifying(true);
    setOtpError('');
    
    // Simulate verification delay
    setTimeout(() => {
      setOtpVerifying(false);
      setOtpSuccess(true);
      
      // Complete onboarding after a short beautiful celebration
      setTimeout(() => {
        // Find the base gallery from presets
        const selectedPreset = PHOTO_PRESETS.find(p => p.url === selectedPhoto);
        const baseGallery = selectedPreset ? selectedPreset.gallery : [selectedPhoto];

        // Filter uploaded custom media
        const customImages = uploadedMedia.filter(m => m.type === 'photo').map(m => m.url);
        const customVideos = uploadedMedia.filter(m => m.type === 'video').map(m => m.url);

        const finalImages = [...baseGallery, ...customImages];
        const finalVideos = [...customVideos];

        const userCar: UserCar = {
          brand,
          model,
          year,
          km,
          location: `${commune}, ${region === "Región Metropolitana" ? "RM" : region}`,
          fuel,
          transmission,
          price,
          permuta,
          permutaPreferences: permuta ? permutaPreferences : 'No busco permutas, solo venta.',
          description,
          image: selectedPhoto,
          images: finalImages,
          videos: finalVideos,
          views: Math.floor(Math.random() * 25) + 5,
          likes: Math.floor(Math.random() * 8) + 1,
          superLikes: 0,
          contactPhone: (contactPhone || '+56912345678').replace(/\s+/g, '')
        };

        onComplete(userCar, userName);
      }, 1200);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col justify-between relative" id="onboarding_container">
      {/* SMS Simulation Alert Toast */}
      {simulatedSMS && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 pointer-events-auto"
          id="sms_simulation_toast"
        >
          <div className="bg-zinc-950/95 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl flex gap-3 items-start text-left ring-1 ring-black/50">
            <div className="bg-blue-500 text-white p-2 rounded-xl shrink-0">
              <MessageSquare className="w-5 h-5 fill-current" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <span className="text-xs font-extrabold text-blue-400 uppercase tracking-wider">SMS Recibido</span>
                <span className="text-[10px] text-white/40">ahora</span>
              </div>
              <p className="text-xs text-white/90 font-medium mt-1 leading-relaxed">
                {simulatedSMS.message}
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setOtpCode(simulatedSMS.code);
                    setSimulatedSMS(null);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg transition-all active:scale-95 cursor-pointer"
                >
                  Copiar Código
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* OTP Verification Modal */}
      {showOTPModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md" id="otp_modal_overlay">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md bg-[#141414] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden text-center"
            id="otp_modal_card"
          >
            {/* Glowing background details */}
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

            {otpSuccess ? (
              <div className="py-8 flex flex-col items-center justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                  className="w-16 h-16 bg-green-500/10 border border-green-500/30 text-green-500 rounded-full flex items-center justify-center mb-4"
                >
                  <CheckCircle2 className="w-8 h-8" />
                </motion.div>
                <h3 className="text-xl font-bold text-white uppercase italic tracking-tight">¡Celular Verificado!</h3>
                <p className="text-sm text-white/60 mt-2 max-w-xs mx-auto">
                  Tu número de teléfono ha sido verificado con éxito. Iniciando tu perfil en AutoMatch Chile...
                </p>
                <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-red-500 font-bold animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  Cargando catálogo...
                </div>
              </div>
            ) : (
              <form onSubmit={handleVerifyOTP}>
                <div className="bg-red-500/10 text-red-500 p-3 rounded-2xl inline-flex mb-4">
                  <Smartphone className="w-8 h-8" />
                </div>

                <h3 className="text-xl font-black uppercase italic tracking-tight text-white mb-2">Verifica tu Número</h3>
                <p className="text-xs text-white/60 mb-6 leading-relaxed max-w-sm mx-auto">
                  Ingresa el código de 4 dígitos enviado por SMS a <strong className="text-white">{contactPhone}</strong> para proteger la comunidad contra bots y perfiles falsos.
                </p>

                {/* OTP code input */}
                <div className="mb-6">
                  <input
                    type="text"
                    maxLength={4}
                    value={otpCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setOtpCode(val);
                      setOtpError('');
                    }}
                    placeholder="0000"
                    className="w-40 mx-auto text-center font-sans font-black text-3xl tracking-[0.5em] bg-zinc-900 border border-white/10 text-white rounded-2xl py-3 px-4 focus:outline-hidden focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all uppercase placeholder-white/10"
                    id="otp_input_field"
                    required
                    autoFocus
                  />
                  {otpError && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-400 mt-3 font-semibold flex items-center justify-center gap-1"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {otpError}
                    </motion.p>
                  )}
                </div>

                {/* Submit & actions */}
                <div className="flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={otpVerifying || otpCode.length < 4}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:hover:bg-red-600 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-600/30"
                    id="otp_confirm_btn"
                  >
                    {otpVerifying ? 'Verificando...' : 'Confirmar y Entrar'}
                  </button>

                  <div className="flex items-center justify-between text-xs text-white/40 mt-2 px-2">
                    <span>¿No recibiste el código?</span>
                    {otpTimer > 0 ? (
                      <span className="font-mono text-white/60">Reenviar en {otpTimer}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => triggerSendOTP(contactPhone)}
                        className="text-red-400 hover:text-red-300 font-bold hover:underline transition-all cursor-pointer"
                        id="otp_resend_btn"
                      >
                        Reenviar SMS
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowOTPModal(false);
                      setOtpError('');
                      setOtpCode('');
                    }}
                    className="mt-2 text-xs text-white/40 hover:text-white/60 transition-all cursor-pointer hover:underline"
                    id="otp_cancel_btn"
                  >
                    Cancelar registro
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}

      {/* Header */}
      <header className="bg-[#0f0f0f] border-b border-white/10 py-4 px-6 flex items-center justify-between sticky top-0 z-30" id="onboarding_header">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl overflow-hidden rotate-3 shadow-lg shadow-red-600/40 hover:rotate-6 active:scale-95 transition-all duration-300 shrink-0 border border-red-500/30">
            <img 
              src={appLogo} 
              alt="AutoMatch Chile Logo" 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <span className="font-sans font-black text-xl tracking-tighter uppercase italic ml-1 text-white">AutoMatch</span>
            <span className="text-[9px] bg-white/10 text-white/60 font-semibold tracking-widest uppercase px-1.5 py-0.5 rounded-full ml-1">CHILE</span>
          </div>
        </div>
        <div className="text-xs font-mono text-white/50 bg-[#141414] border border-white/10 px-2.5 py-1 rounded-full">
          Est. Tasación CLP
        </div>
      </header>

      {/* Steps Content */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-4 md:p-8 flex items-center justify-center">
        {step === 0 ? (
          /* SPLASH SCREEN */
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-[#141414] rounded-3xl p-6 md:p-10 border border-white/10 shadow-2xl text-center"
            id="welcome_card"
          >
            <div className="inline-flex bg-red-600/10 text-red-500 p-4 rounded-full mb-6">
              <Sparkles className="w-10 h-10" />
            </div>

            <h1 className="text-3xl md:text-4xl font-sans font-black tracking-tighter text-white uppercase italic mb-3">
              ¿Vendes o Permutas tu auto en Chile?
            </h1>
            <p className="text-white/70 mb-8 max-w-md mx-auto text-base">
              ¡Te damos la bienvenida a <strong className="text-red-500 font-semibold">AutoMatch</strong>! La nueva modalidad de compra y venta de autos del mercado automotriz donde deslizas para encontrar ofertas perfectas de compra o intercambio en segundos.
            </p>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 text-left">
              <div className="p-4 bg-[#0f0f0f] rounded-2xl border border-white/5 flex gap-3 items-start">
                <div className="bg-red-600/10 text-red-500 p-2 rounded-lg shrink-0 mt-0.5">
                  <Heart className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Fácil de Deslizar</h3>
                  <p className="text-xs text-white/50 mt-0.5">Likes para me interesa, dislikes para pasar. ¡Simple!</p>
                </div>
              </div>
              
              <div className="p-4 bg-[#0f0f0f] rounded-2xl border border-white/5 flex gap-3 items-start">
                <div className="bg-red-600/10 text-red-500 p-2 rounded-lg shrink-0 mt-0.5">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Tasador Inteligente</h3>
                  <p className="text-xs text-white/50 mt-0.5">Calculamos el valor real de tu auto en Chile al instante.</p>
                </div>
              </div>

              <div className="p-4 bg-[#0f0f0f] rounded-2xl border border-white/5 flex gap-3 items-start">
                <div className="bg-red-600/10 text-red-500 p-2 rounded-lg shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Matches de Permuta</h3>
                  <p className="text-xs text-white/50 mt-0.5">Intercambia tu auto mano a mano o con diferencia de dinero.</p>
                </div>
              </div>
            </div>

            {/* 🔊 MOTOR SOUND SELECTOR (WIDGET COMPONENT) */}
            <div className="mb-8 p-5 bg-[#0f0f0f] rounded-2xl border border-white/5 text-left space-y-4" id="engine_sound_selector_widget">
              <div className="flex items-center gap-2.5">
                <div className="bg-red-500/10 text-red-500 p-2 rounded-xl">
                  <Volume2 className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                    Sonido de Notificación & Arranque
                    <span className="bg-red-500/15 text-red-400 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full">NUEVO</span>
                  </h4>
                  <p className="text-xs text-white/50">Escucha y elige el rugido de motor que sonará al entrar a la app y recibir AutoMatches.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'v8', name: 'V8 Clásico 🇺🇸', desc: 'Rumble profundo' },
                  { id: 'sport', name: 'Sport Turbo 🇯🇵', desc: 'Soplido ágil' },
                  { id: 'rally', name: 'Rally Pro 🇪🇺', desc: 'Corte agresivo' },
                  { id: 'f1', name: 'F1 V10 🏎️', desc: 'Grito agudo' },
                ].map((motor) => (
                  <button
                    key={motor.id}
                    onClick={() => {
                      setSelectedEngineSound(motor.id as EngineType);
                      playEngineSound(motor.id as EngineType);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all duration-300 group cursor-pointer ${
                      selectedEngineSound === motor.id
                        ? 'bg-red-600/15 border-red-500 shadow-md shadow-red-950/40'
                        : 'bg-white/[0.02] border-white/5 hover:border-white/15'
                    }`}
                    type="button"
                    id={`select_sound_${motor.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[11px] font-bold block ${
                        selectedEngineSound === motor.id ? 'text-red-400' : 'text-white/80'
                      }`}>
                        {motor.name}
                      </span>
                      <Zap className={`w-3 h-3 transition-transform ${
                        selectedEngineSound === motor.id ? 'text-red-400 scale-110' : 'text-white/25 group-hover:scale-110'
                      }`} />
                    </div>
                    <span className="text-[9px] text-white/40 block mt-0.5 leading-none">
                      {motor.desc}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => playEngineSound(selectedEngineSound)}
                  className="w-full bg-white/5 hover:bg-white/10 active:scale-[0.98] border border-white/10 hover:border-white/20 transition-all py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 text-white cursor-pointer"
                  type="button"
                  id="test_engine_sound_btn"
                >
                  <Key className="w-4 h-4 text-red-500 animate-[spin_3s_linear_infinite]" />
                  Dar Contacto y Probar Arranque 🔊
                </button>
              </div>
            </div>

            {/* Quick Presets Options & Authentication */}
            {!currentUser ? (
              <div className="mb-8 p-6 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl text-center">
                <ShieldCheck className="w-8 h-8 text-red-500 mx-auto mb-3 animate-pulse" />
                <h3 className="text-md font-sans font-black uppercase tracking-tight text-white mb-2">
                  Inicia Sesión en la Comunidad Real
                </h3>
                <p className="text-xs text-white/60 mb-5 leading-relaxed max-w-sm mx-auto">
                  Para poder contactar personas reales, verificar patentes en Chile y guardar tu auto en la nube real de Firestore, por favor inicia tu sesión segura.
                </p>

                {authError && (
                  <div className="mb-5 p-3.5 bg-red-950/40 border border-red-500/20 rounded-xl text-left text-xs text-red-200 relative">
                    {onClearAuthError && (
                      <button
                        type="button"
                        onClick={onClearAuthError}
                        className="absolute top-2.5 right-2.5 text-red-400 hover:text-red-200 text-sm font-bold bg-transparent border-0 cursor-pointer p-1"
                        title="Descartar aviso"
                      >
                        ✕
                      </button>
                    )}
                    <p className="font-bold flex items-center gap-1.5 mb-1 text-red-400 pr-6">
                      <AlertTriangle className="w-4 h-4 shrink-0 animate-bounce" />
                      Aviso de Configuración de Firebase Auth:
                    </p>
                    <p className="leading-relaxed font-mono text-[10px] bg-black/45 p-2 rounded border border-white/5 overflow-x-auto mb-2 text-red-300">
                      {authError}
                    </p>
                    <p className="leading-relaxed mb-3 text-[11px] text-white/70">
                      {authError.includes('ventana de inicio de sesión de Google') || authError.includes('popup-closed-by-user') || authError.includes('popup-blocked') || authError.includes('bloqueó')
                        ? 'Las políticas de seguridad del navegador a menudo bloquean las ventanas emergentes (popups) o las cookies de terceros cuando se ejecuta la aplicación dentro de un iFrame (el panel de vista previa de AI Studio). Para solucionarlo y usar Google Sign-In, abre la aplicación en una pestaña nueva con el botón en la barra superior, o simplemente inicia usando el Modo Local.'
                        : authError.includes('Anónimo') || authError.includes('restricted-operation')
                        ? 'El proveedor "Anónimo" está inactivo. Para activarlo, ve a Firebase Console -> Authentication -> Sign-in method y activa el proveedor "Anónimo". O puedes usar el Modo Local Offline.'
                        : 'Debido a que el entorno de desarrollo se ejecuta en un subdominio dinámico, Google requiere agregar este host a los "Dominios autorizados" en tu consola Firebase o habilitar el login anónimo de invitados en los proveedores de Auth.'
                      }
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      {onSelectLocalMode && (
                        <button
                          onClick={onSelectLocalMode}
                          className="flex-1 bg-red-600 hover:bg-red-700 transition-all text-white font-bold py-2.5 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                          type="button"
                          id="fallback_local_error_btn"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          Omitir y Usar Modo Local Offline (Recomendado)
                        </button>
                      )}
                      {onClearAuthError && (
                        <button
                          onClick={onClearAuthError}
                          className="px-3 py-2.5 bg-white/10 hover:bg-white/15 transition-all text-white font-bold rounded-lg text-xs flex items-center justify-center cursor-pointer border border-white/10"
                          type="button"
                        >
                          Limpiar / Reintentar
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {authLoading ? (
                  <div className="flex flex-col items-center py-4">
                    <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <span className="text-xs font-mono text-white/50">Validando sesión...</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {/* Google Login button */}
                    <button
                      onClick={onGoogleSignIn}
                      className="w-full bg-white hover:bg-zinc-100 text-zinc-950 font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 text-sm transition-all cursor-pointer shadow-md"
                      id="google_signin_btn"
                      type="button"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.9h6.6c-.28 1.5-1.11 2.76-2.39 3.62v3h3.86c2.26-2.08 3.56-5.14 3.56-8.7c0-.25-.01-.5-.03-.75z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.86-3c-1.08.72-2.45 1.16-4.1 1.16-3.15 0-5.82-2.13-6.78-5H1.36v3.1A11.993 11.993 0 0 0 12 24z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.22 14.25A7.16 7.16 0 0 1 4.8 12c0-.79.13-1.57.38-2.31V6.58H1.36A11.947 11.947 0 0 0 0 12c0 2.02.5 3.93 1.36 5.61l3.86-3.36z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.96 1.19 15.24 0 12 0 7.36 0 3.37 2.67 1.36 6.58l3.86 3.31c.96-2.87 3.63-5.14 6.78-5.14z"
                        />
                      </svg>
                      Ingresar Seguro con Google
                    </button>

                    {/* Guest Login button */}
                    <button
                      onClick={onGuestSignIn}
                      className="w-full bg-zinc-800 hover:bg-zinc-700 active:scale-[0.98] border border-zinc-700 hover:border-zinc-600 transition-all py-3.5 px-6 rounded-xl text-sm font-bold flex items-center justify-center gap-2 text-white cursor-pointer"
                      id="guest_signin_btn"
                      type="button"
                    >
                      <Sparkles className="w-4 h-4 text-yellow-400 animate-bounce" />
                      Entrar en Modo Invitado (Prueba Rápida)
                    </button>

                    {/* ALWAYS show a clean local mode option below if they just want a smooth, instant demo */}
                    <button
                      onClick={onSelectLocalMode}
                      className="w-full bg-red-600/10 hover:bg-red-600/20 active:scale-[0.98] border border-red-500/20 hover:border-red-500/35 transition-all py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 text-red-400 cursor-pointer"
                      id="fallback_local_signin_btn"
                      type="button"
                    >
                      <Zap className="w-3.5 h-3.5 text-red-500" />
                      Omitir y Usar Modo Local/Demo
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="mb-8 p-5 bg-emerald-950/40 border border-emerald-500/20 rounded-2xl flex items-center gap-3.5 text-left">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-mono">Sesión Iniciada Exitosamente</p>
                    <p className="text-sm font-bold text-white mt-0.5">¡Hola, {currentUser.displayName || currentUser.email || 'Usuario de AutoMatch'}!</p>
                    <p className="text-xs text-white/50 mt-0.5">Ya puedes publicar tu vehículo para guardarlo en la nube real de Firestore.</p>
                  </div>
                </div>

                {/* Quick Presets Options */}
                <div className="mb-8 p-5 bg-gradient-to-r from-red-950/40 to-[#0a0a0a] rounded-2xl border border-red-600/15 text-white text-left">
                  <span className="text-xs uppercase font-mono tracking-widest text-red-400 font-bold block mb-2">Comienza al Instante (Piloto de Prueba)</span>
                  <h4 className="font-bold text-sm mb-3 text-white/90">Elige un perfil rápido de auto chileno para probar la app:</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      onClick={() => handleQuickFill('Suzuki', 'Swift', 2019, 58000, 9200000, 'hatchback')}
                      className="flex items-center justify-between text-left bg-white/5 hover:bg-white/10 hover:border-red-500 transition-all p-3 rounded-xl border border-white/10 text-xs font-medium cursor-pointer"
                      id="fill_swift_btn"
                    >
                      <div>
                        <p className="font-bold text-white">Suzuki Swift 2019</p>
                        <p className="text-red-400 font-mono">58k km • $9.200.000 CLP</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-white/50" />
                    </button>

                    <button
                      onClick={() => handleQuickFill('Mazda', 'CX-5', 2020, 48000, 16800000, 'suv')}
                      className="flex items-center justify-between text-left bg-white/5 hover:bg-white/10 hover:border-red-500 transition-all p-3 rounded-xl border border-white/10 text-xs font-medium cursor-pointer"
                      id="fill_cx5_btn"
                    >
                      <div>
                        <p className="font-bold text-white">Mazda CX-5 2020</p>
                        <p className="text-red-400 font-mono">48k km • $16.800.000 CLP</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-white/50" />
                    </button>
                  </div>
                </div>

                {/* Manual button */}
                <button
                  onClick={() => setStep(1)}
                  className="w-full bg-red-600 hover:bg-red-700 transition-all text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 text-base cursor-pointer shadow-lg shadow-red-600/35"
                  id="start_manual_btn"
                >
                  Publicar mi Auto Manualmente
                  <ArrowRight className="w-5 h-5" />
                </button>
              </>
            )}
          </motion.div>
        ) : step === 1 ? (
          /* PASO 1: CAR INFO & VALUATION */
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full bg-[#141414] rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl"
            id="step1_card"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Paso 1 de 3</span>
                <h2 className="text-2xl font-sans font-black uppercase italic tracking-tight text-white mt-1">Datos de tu Auto</h2>
              </div>
              <span className="text-xs bg-red-600/15 text-red-400 font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-red-500/10">
                <TrendingUp className="w-3.5 h-3.5" /> Tasador Activo
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Brand Selection */}
              <div>
                <label className="block text-xs font-bold text-white/60 uppercase mb-1.5">Marca</label>
                <select
                  value={brand}
                  onChange={(e) => {
                    setBrand(e.target.value);
                    const b = POPULAR_BRANDS.find(brandObj => brandObj.name === e.target.value);
                    if (b && b.models.length > 0) {
                      setModel(b.models[0]);
                    }
                  }}
                  className="w-full bg-zinc-900 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:border-red-500 focus:bg-zinc-800 transition-all"
                  id="brand_select"
                >
                  {POPULAR_BRANDS.map(b => (
                    <option key={b.name} value={b.name} className="bg-zinc-950">{b.name}</option>
                  ))}
                </select>
              </div>

              {/* Model Input */}
              <div>
                <label className="block text-xs font-bold text-white/60 uppercase mb-1.5">Modelo</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="Ej: Swift, Hilux, Accent"
                  className="w-full bg-zinc-900 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:border-red-500 focus:bg-zinc-800 transition-all"
                  id="model_input"
                  required
                />
              </div>

              {/* Year Select */}
              <div>
                <label className="block text-xs font-bold text-white/60 uppercase mb-1.5">Año</label>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:border-red-500 focus:bg-zinc-800 transition-all"
                  id="year_select"
                >
                  {Array.from({ length: 17 }, (_, i) => 2026 - i).map(y => (
                    <option key={y} value={y} className="bg-zinc-950">{y}</option>
                  ))}
                </select>
              </div>

              {/* Kilometers Input */}
              <div>
                <label className="block text-xs font-bold text-white/60 uppercase mb-1.5">Kilometraje</label>
                <input
                  type="number"
                  value={km}
                  onChange={(e) => setKm(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-zinc-900 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:border-red-500 focus:bg-zinc-800 transition-all"
                  id="km_input"
                  required
                />
              </div>

              {/* Fuel Type */}
              <div>
                <label className="block text-xs font-bold text-white/60 uppercase mb-1.5">Combustible</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Bencina', 'Diésel', 'Híbrido', 'Eléctrico'] as const).map(f => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFuel(f)}
                      className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        fuel === f 
                          ? 'border-red-600 bg-red-600/10 text-red-400' 
                          : 'border-white/10 bg-zinc-900 text-white/60 hover:bg-zinc-800'
                      }`}
                      id={`fuel_${f.toLowerCase()}_btn`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transmission Type */}
              <div>
                <label className="block text-xs font-bold text-white/60 uppercase mb-1.5">Transmisión</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Manual', 'Automática'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTransmission(t)}
                      className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        transmission === t 
                          ? 'border-red-600 bg-red-600/10 text-red-400' 
                          : 'border-white/10 bg-zinc-900 text-white/60 hover:bg-zinc-800'
                      }`}
                      id={`trans_${t.toLowerCase()}_btn`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tasación Live Widget */}
            {valuation && (
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-1.5 text-white/80 font-bold text-xs uppercase tracking-wider">
                    <DollarSign className="w-4 h-4 shrink-0 text-red-500" />
                    Valor de Mercado AutoMatch
                  </div>
                  <p className="text-2xl font-black font-sans text-white mt-1">
                    ${valuation.avgPrice.toLocaleString('es-CL')} CLP
                  </p>
                  <p className="text-xs text-white/50 mt-0.5">
                    Rango sugerido: ${valuation.lowPrice.toLocaleString('es-CL')} - ${valuation.highPrice.toLocaleString('es-CL')} CLP
                  </p>
                </div>
                
                <div className="border-t sm:border-t-0 sm:border-l border-white/10 sm:pl-4 pt-3 sm:pt-0 shrink-0 text-left">
                  <div className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Demanda en Chile</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`w-2 h-2 rounded-full ${valuation.liquidityScore === 'Alta' ? 'bg-green-500 animate-ping' : valuation.liquidityScore === 'Media' ? 'bg-amber-500' : 'bg-red-500'}`}></span>
                    <span className="font-bold text-white/90 text-sm">Alta Demanda ({valuation.demandPercentage}%)</span>
                  </div>
                  <span className="text-xs text-white/40 block mt-0.5">Venta prom: {valuation.estimatedDaysToSell} días</span>
                </div>
              </div>
            )}

            {/* Set Selling Price */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-white/60 uppercase mb-1.5">Tu Precio de Publicación (CLP)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold">$</span>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  placeholder="Ej: 9500000"
                  className="w-full bg-zinc-900 border border-white/10 text-white rounded-xl pl-8 pr-4 py-3 text-sm font-bold focus:outline-hidden focus:border-red-500 focus:bg-zinc-800 transition-all"
                  id="price_input"
                  required
                />
              </div>
              <p className="text-[11px] text-white/40 mt-1">
                *Puedes ajustarlo libremente. Un precio realista te dará más matches en Chile.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(0)}
                className="flex-1 border border-white/10 hover:bg-white/5 text-white/75 font-semibold py-3 px-4 rounded-xl text-sm transition-all cursor-pointer"
                id="back_to_0_btn"
              >
                Atrás
              </button>
              <button
                onClick={() => setStep(2)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-red-600/10"
                id="to_step2_btn"
              >
                Siguiente
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ) : step === 2 ? (
          /* PASO 2: SWAP/SELL PREFS */
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full bg-[#141414] rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl"
            id="step2_card"
          >
            <div>
              <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Paso 2 de 3</span>
              <h2 className="text-2xl font-sans font-black uppercase italic tracking-tight text-white mt-1 mb-6">¿Qué buscas con tu auto?</h2>
            </div>

            {/* Offer Type */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-white/60 uppercase mb-2">Modalidad de negocio</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPermuta(false)}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-28 ${
                    !permuta 
                      ? 'border-red-600 bg-red-600/10 text-red-400 shadow-md' 
                      : 'border-white/10 bg-zinc-900 text-white/60 hover:bg-zinc-800'
                  }`}
                  id="mode_only_sale_btn"
                >
                  <DollarSign className="w-6 h-6 text-red-500" />
                  <div>
                    <h4 className="font-bold text-sm text-white">Solo Vender</h4>
                    <p className="text-xs text-white/50 mt-0.5">Busco ofertas de dinero directo por mi auto.</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPermuta(true)}
                  className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-28 ${
                    permuta 
                      ? 'border-red-600 bg-red-600/10 text-red-400 shadow-md' 
                      : 'border-white/10 bg-zinc-900 text-white/60 hover:bg-zinc-800'
                  }`}
                  id="mode_permuta_btn"
                >
                  <Compass className="w-6 h-6 text-red-500" />
                  <div>
                    <h4 className="font-bold text-sm text-white">Permutar o Vender</h4>
                    <p className="text-xs text-white/50 mt-0.5">Acepto intercambios por otros vehículos.</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Permuta Preferences */}
            {permuta && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mb-6 overflow-hidden"
                id="permuta_pref_wrapper"
              >
                <label className="block text-xs font-bold text-white/60 uppercase mb-1.5">¿Qué tipo de auto buscas permutar?</label>
                <input
                  type="text"
                  value={permutaPreferences}
                  onChange={(e) => setPermutaPreferences(e.target.value)}
                  placeholder="Ej: Busco camioneta diésel de mayor año, pago diferencia"
                  className="w-full bg-zinc-900 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:border-red-500 focus:bg-zinc-800 transition-all"
                  id="permuta_prefs_input"
                  required={permuta}
                />
                <p className="text-[10px] text-white/40 mt-1">
                  *Sé específico en lo que aceptas (Ej: "Recibo menor valor + dinero" o "Doy diferencia").
                </p>
              </motion.div>
            )}

            {/* Description */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-white/60 uppercase mb-1.5">Breve descripción de tu auto</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej: Único dueño, neumáticos nuevos, excelente andar, aire acondicionado..."
                rows={3}
                className="w-full bg-zinc-900 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:border-red-500 focus:bg-zinc-800 transition-all resize-none"
                id="description_textarea"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border border-white/10 hover:bg-white/5 text-white/75 font-semibold py-3 px-4 rounded-xl text-sm transition-all cursor-pointer"
                id="back_to_1_btn"
              >
                Atrás
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-red-600/10"
                id="to_step3_btn"
              >
                Siguiente
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ) : (
          /* PASO 3: CONTACT & PRESETS */
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full bg-[#141414] rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl"
            id="step3_card"
          >
            <form onSubmit={handleSubmit}>
              <div>
                <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Paso 3 de 3</span>
                <h2 className="text-2xl font-sans font-black uppercase italic tracking-tight text-white mt-1 mb-6">Tus datos y foto del auto</h2>
              </div>

              {/* User Name */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-white/60 uppercase mb-1.5">Tu Nombre de Vendedor / Permutador</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Ej: Alexis Ganer"
                  className="w-full bg-zinc-900 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:border-red-500 focus:bg-zinc-800 transition-all"
                  id="user_name_input"
                  required
                />
              </div>

              {/* Contact Phone */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-white/60 uppercase mb-1.5">Tu Celular o WhatsApp de contacto</label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="Ej: +56 9 1234 5678"
                  className="w-full bg-zinc-900 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:border-red-500 focus:bg-zinc-800 transition-all"
                  id="user_phone_input"
                  required
                />
              </div>

              {/* Region and Commune selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-bold text-white/60 uppercase mb-1.5">Región</label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:border-red-500"
                    id="region_select"
                  >
                    {CHILEAN_REGIONS.map(r => (
                      <option key={r.name} value={r.name} className="bg-zinc-950">{r.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/60 uppercase mb-1.5">Comuna</label>
                  <select
                    value={commune}
                    onChange={(e) => setCommune(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 text-white rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:border-red-500"
                    id="commune_select"
                  >
                    {communesList.map(c => (
                      <option key={c} value={c} className="bg-zinc-950">{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Photo Presets */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-white/60 uppercase mb-3">Elige la foto que mejor represente tu auto (Incluye galería de detalles por defecto)</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {PHOTO_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPhoto(p.url)}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        selectedPhoto === p.url 
                          ? 'border-red-600 scale-95 ring-3 ring-red-500/20 shadow-md' 
                          : 'border-transparent opacity-50 hover:opacity-100 hover:scale-[1.02]'
                      }`}
                      id={`photo_preset_${p.id}`}
                    >
                      <img 
                        src={p.url} 
                        alt={p.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-black/80 py-1 text-[8px] font-bold text-white text-center truncate px-1">
                        {p.name.split(' ')[0]}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Photo/Video Gallery Upload */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-white/60 uppercase mb-3">
                  Sube fotos o videos desde tu galería (Opcional - Motor, interior, kilometraje)
                </label>
                <div className="border-2 border-dashed border-white/10 hover:border-red-500/50 rounded-2xl p-6 text-center transition-all bg-zinc-950/40 relative cursor-pointer group">
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="onboarding_file_input"
                  />
                  <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                    <div className="w-12 h-12 bg-white/5 group-hover:bg-red-500/10 rounded-full flex items-center justify-center transition-all">
                      <Upload className="w-6 h-6 text-white/50 group-hover:text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white/80">Seleccionar o arrastrar archivos</p>
                      <p className="text-xs text-white/40 mt-0.5">Sube imágenes o videos (Motor, interior, tablero, etc.)</p>
                    </div>
                  </div>
                </div>

                {/* Uploaded media previews */}
                {uploadedMedia.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-xs font-bold text-white/50 uppercase mb-2">Galería de Archivos Subidos ({uploadedMedia.length})</h4>
                    <div className="grid grid-cols-4 gap-2">
                      {uploadedMedia.map((m, idx) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border border-white/10 bg-zinc-900">
                          {m.type === 'video' ? (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950">
                              <Video className="w-6 h-6 text-red-500 mb-1 animate-pulse" />
                              <span className="text-[8px] text-white/60 text-center truncate px-1 max-w-full">{m.name || 'Video'}</span>
                            </div>
                          ) : (
                            <img src={m.url} alt="Upload thumb" className="w-full h-full object-cover" />
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveUploadedMedia(idx)}
                            className="absolute top-1 right-1 p-1 bg-black/80 hover:bg-red-600 rounded-md transition-all shadow-md z-10 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Compliance & Terms and Conditions Checkbox */}
              <div className="mb-6 bg-zinc-950/60 p-4 border border-white/5 rounded-2xl">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms_consent_checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-0.5 accent-red-600 rounded cursor-pointer w-4 h-4 shrink-0"
                    required
                  />
                  <label htmlFor="terms_consent_checkbox" className="text-xs text-white/70 leading-relaxed cursor-pointer select-none">
                    Declaro ser <strong>mayor de 18 años</strong> y acepto expresamente los <button type="button" onClick={() => onOpenPrivacy?.('terms')} className="text-red-500 font-bold hover:underline bg-transparent border-0 cursor-pointer p-0 inline-block">Términos y Condiciones</button> y la <button type="button" onClick={() => onOpenPrivacy?.('privacy')} className="text-red-500 font-bold hover:underline bg-transparent border-0 cursor-pointer p-0 inline-block">Política de Privacidad</button>. Entiendo que está <strong>absolutamente prohibido publicar contenido ilegal, sexual o que no sea un automóvil</strong>.
                  </label>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 border border-white/10 hover:bg-white/5 text-white/75 font-semibold py-3 px-4 rounded-xl text-sm transition-all cursor-pointer"
                  id="back_to_2_btn"
                >
                  Atrás
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-red-600/30"
                  id="complete_onboarding_btn"
                >
                  ¡Ingresar y Deslizar!
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </main>

      {/* Footer info to assure clients */}
      <footer className="py-4 text-center text-white/40 text-xs border-t border-white/10 bg-[#0f0f0f]" id="onboarding_footer">
        <div className="flex flex-col gap-2 items-center justify-center px-4">
          <div className="flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-green-500" />
            <span>Información de autos y valorizaciones referenciales para el mercado chileno.</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-white/30">
            <button 
              type="button" 
              onClick={() => onOpenPrivacy?.('terms')}
              className="hover:text-red-500 hover:underline transition-all cursor-pointer font-bold text-red-500/80"
              id="onboarding_footer_terms_link"
            >
              Términos y Condiciones
            </button>
            <span>•</span>
            <button 
              type="button" 
              onClick={() => onOpenPrivacy?.('privacy')}
              className="hover:text-red-500 hover:underline transition-all cursor-pointer"
              id="onboarding_footer_privacy_link"
            >
              Política de Privacidad
            </button>
            <span>•</span>
            <button 
              type="button" 
              onClick={() => onOpenPrivacy?.('disclosure')}
              className="hover:text-red-500 hover:underline transition-all cursor-pointer"
              id="onboarding_footer_disclosure_link"
            >
              Divulgación de Datos
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
