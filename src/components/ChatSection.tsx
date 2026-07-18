import React, { useState, useEffect, useRef } from 'react';
import { Match, Message, Car, UserCar } from '../types';
import { 
  Send, 
  MapPin, 
  ExternalLink, 
  MessageCircle, 
  ShieldCheck, 
  CheckCheck, 
  Sparkles, 
  User, 
  Car as CarIcon, 
  AlertCircle,
  Phone,
  Video,
  AlertTriangle,
  X,
  Camera,
  Image,
  Paperclip,
  Plus,
  PhoneOff,
  VideoOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Upload,
  Play,
  Check,
  Search,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatSectionProps {
  matches: Match[];
  userCar: UserCar | null;
  onSendMessage: (
    matchId: string, 
    text: string, 
    sender: 'user' | 'other',
    mediaType?: 'photo' | 'video',
    mediaUrl?: string,
    callDuration?: string,
    isCallMessage?: boolean
  ) => void;
  onMarkRead: (matchId: string) => void;
  activeMatchId: string | null;
  setActiveMatchId: (id: string | null) => void;
  onOpenCarDetails: (car: Car) => void;
}

const QUICK_REPLIES = [
  "¡Hola! ¿Permutas?",
  "¿Papeles al día?",
  "¿Dónde nos vemos?"
];

export interface OnlineStatus {
  isOnline: boolean;
  text: string;
}

export function getSellerOnlineStatus(ownerName: string): OnlineStatus {
  // Deterministic hash based on owner name so status is stable for each seller
  const hash = ownerName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const isOnline = hash % 3 === 0; // ~33% of sellers will be online
  
  if (isOnline) {
    return { isOnline: true, text: 'En línea' };
  } else {
    // Generate various last seen strings
    const minutesAgo = (hash % 45) + 3; // 3 to 47 minutes
    let text = `Conectado hace ${minutesAgo} min`;
    
    if (hash % 5 === 0) {
      const hoursAgo = (hash % 4) + 1; // 1 to 4 hours
      text = `Conectado hace ${hoursAgo} ${hoursAgo === 1 ? 'hora' : 'horas'}`;
    } else if (hash % 7 === 0) {
      text = 'Conectado ayer';
    }
    return { isOnline: false, text };
  }
}

export default function ChatSection({
  matches,
  userCar,
  onSendMessage,
  onMarkRead,
  activeMatchId,
  setActiveMatchId,
  onOpenCarDetails
}: ChatSectionProps) {
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 900);
    return () => clearTimeout(timer);
  }, []);

  // Micro-loading feedback when user filters matches to give a high-performance live search vibe
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reported / Fraud states
  const [reportedMatchIds, setReportedMatchIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('automatch_reported_matches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('spam');
  const [reportDetails, setReportDetails] = useState('');
  const [showReportSuccess, setShowReportSuccess] = useState(false);

  // Call System states
  const [activeCall, setActiveCall] = useState<{
    type: 'audio' | 'video';
    status: 'ringing' | 'connected';
    duration: number;
  } | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoCameraOff, setIsVideoCameraOff] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  // Attachment Menu states
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  const activeMatch = matches.find(m => m.id === activeMatchId);
  const isCurrentMatchReported = activeMatchId ? reportedMatchIds.includes(activeMatchId) : false;

  // Scroll messages to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    if (activeMatchId) {
      onMarkRead(activeMatchId);
    }
  }, [activeMatch?.messages.length, activeMatchId]);

  // Call timer effect
  useEffect(() => {
    let interval: any;
    if (activeCall && activeCall.status === 'connected') {
      interval = setInterval(() => {
        setActiveCall(prev => prev ? { ...prev, duration: prev.duration + 1 } : null);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeCall?.status]);

  // Simulated ringing state transition
  useEffect(() => {
    let timeout: any;
    if (activeCall && activeCall.status === 'ringing') {
      timeout = setTimeout(() => {
        setActiveCall(prev => prev ? { ...prev, status: 'connected', duration: 0 } : null);
        if (activeCall.type === 'video') {
          startCamera();
        }
      }, 3200);
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [activeCall?.status, activeCall?.type]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn("Camera permission denied or not available:", err);
    }
  };

  const stopCamera = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
  };

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const handleStartCall = (type: 'audio' | 'video') => {
    if (isCurrentMatchReported) return;
    setActiveCall({
      type,
      status: 'ringing',
      duration: 0
    });
  };

  const handleEndCall = () => {
    if (!activeCall || !activeMatchId) return;

    stopCamera();
    const durationStr = formatDuration(activeCall.duration);
    const wasConnected = activeCall.status === 'connected';
    
    let callText = '';
    if (wasConnected) {
      callText = activeCall.type === 'video' 
        ? `🎥 Videollamada finalizada • Duración: ${durationStr}`
        : `📞 Llamada de voz finalizada • Duración: ${durationStr}`;
    } else {
      callText = activeCall.type === 'video'
        ? `❌ Videollamada perdida`
        : `❌ Llamada de voz cancelada`;
    }

    onSendMessage(activeMatchId, callText, 'user', undefined, undefined, durationStr, true);

    if (wasConnected) {
      // Simulate follow up response
      setTimeout(() => {
        onSendMessage(
          activeMatchId, 
          `¡Qué buena la llamada! Me sirvió caleta para convencerme de la permuta. Quedamos en contacto para juntarnos a probarlos.`, 
          'other'
        );
      }, 1500);
    }

    setActiveCall(null);
  };

  // Submit Fraud/Spam report
  const handleReportSubmit = () => {
    if (!activeMatchId) return;
    
    const updatedReported = [...reportedMatchIds, activeMatchId];
    setReportedMatchIds(updatedReported);
    try {
      localStorage.setItem('automatch_reported_matches', JSON.stringify(updatedReported));
    } catch (e) {
      console.error(e);
    }

    setShowReportSuccess(true);
    setTimeout(() => {
      setShowReportSuccess(false);
      setShowReportModal(false);
      setReportDetails('');
    }, 2500);

    // Send a system-like automated message to block
    onSendMessage(
      activeMatchId, 
      `⚠️ ATENCIÓN: Esta cuenta ha sido reportada por el usuario como ${
        reportReason === 'spam' ? 'SPAM / Mensajes repetitivos' : 
        reportReason === 'fraud' ? 'POSIBLE FRAUDE o estafa financiera' : 
        reportReason === 'fake' ? 'CUENTA o auto falso' : 
        reportReason === 'abuse' ? 'COMPORTAMIENTO abusivo/inadecuado' : 'MOTIVO de seguridad'
      }. El canal de negociación ha sido congelado preventivamente para auditoría.`, 
      'other'
    );
  };

  // Upload actual media file and convert to Base64
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'video') => {
    const file = e.target.files?.[0];
    if (!file || !activeMatchId) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64Url = reader.result as string;
      onSendMessage(
        activeMatchId, 
        type === 'photo' ? '📷 He enviado una foto' : '📹 He enviado un video', 
        'user', 
        type, 
        base64Url
      );
      
      setIsTyping(true);
      setTimeout(() => {
        onSendMessage(
          activeMatchId, 
          type === 'photo' 
            ? '¡Oye, excelente foto! Se nota que la pintura y focos están flamantes. ¿Has tenido algún topón?' 
            : '¡Buenísimo el video! Suena súper parejito el motor. Se nota que las mantenciones están al día.', 
          'other'
        );
        setIsTyping(false);
      }, 2000);
    };
    reader.readAsDataURL(file);
    setShowAttachmentMenu(false);
  };

  // Attach beautiful simulated mock visual assets
  const handleSimulatedAttachment = (type: 'photo_motor' | 'photo_interior' | 'video_test') => {
    if (!activeMatchId) return;

    let text = '';
    let mediaType: 'photo' | 'video' = 'photo';
    let url = '';
    let reply = '';

    if (type === 'photo_motor') {
      text = '📷 Te adjunto una foto detallada de mi motor.';
      mediaType = 'photo';
      url = 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80';
      reply = 'Se ve súper seco el motor, impecable. Ninguna mancha de aceite. ¡Me gusta caleta!';
    } else if (type === 'photo_interior') {
      text = '💺 Mira cómo está el interior, la consola y tapizados.';
      mediaType = 'photo';
      url = 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80';
      reply = 'Está impecable la cabina, se nota que no fuman adentro. Súper bien cuidado.';
    } else if (type === 'video_test') {
      text = '📹 Te mando un test drive corto del andar y sonido de la aceleración.';
      mediaType = 'video';
      url = 'https://assets.mixkit.co/videos/preview/mixkit-modern-car-headlights-driving-at-night-34440-large.mp4';
      reply = '¡Wow! Responde altiro al acelerar y las marchas entran suaves. Qué pedazo de máquina.';
    }

    onSendMessage(activeMatchId, text, 'user', mediaType, url);
    setShowAttachmentMenu(false);

    setIsTyping(true);
    setTimeout(() => {
      onSendMessage(activeMatchId, reply, 'other');
      setIsTyping(false);
    }, 1800);
  };

  // Handle manual input submit
  const handleSend = (textToSend: string) => {
    if (!activeMatchId || !textToSend.trim() || isCurrentMatchReported) return;

    // Send user message
    onSendMessage(activeMatchId, textToSend.trim(), 'user');
    setInputText('');

    // Trigger simulated responder with a delay
    simulateResponse(activeMatchId, textToSend.trim());
  };

  // Smart keywords auto-responder
  const simulateResponse = (matchId: string, userText: string) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return;

    const car = match.car;
    const persona = car.chatPersona;
    const textLower = userText.toLowerCase();

    setIsTyping(true);

    setTimeout(() => {
      let replyText = "";

      if (textLower.includes("hola") || textLower.includes("wena") || textLower.includes("que tal") || textLower.includes("qué tal")) {
        replyText = persona?.greeting || `¡Hola! Qué tal, ¿cómo vas? Vi tu publicación y me interesó harto tu auto.`;
      } 
      else if (textLower.includes("permuta") || textLower.includes("cambiar") || textLower.includes("intercambio") || textLower.includes("permutar")) {
        replyText = persona?.permutaOpinion || `Me parece excelente idea permutar. Creo que ambos autos se complementan. ¿Qué diferencia de lucas estás pensando?`;
      } 
      else if (textLower.includes("papeles") || textLower.includes("dia") || textLower.includes("día") || textLower.includes("multa") || textLower.includes("tecnica") || textLower.includes("técnica") || textLower.includes("patente")) {
        replyText = `Sí, el auto tiene todo al día. Revisión técnica recién aprobada en mayo de este año, sin multas de autopista ni partes de ningún tipo. Llegar y transferir en notaría o mediante transferencia digital oficial.`;
      } 
      else if (textLower.includes("dueño") || textLower.includes("dueños") || textLower.includes("historia") || textLower.includes("kilometros") || textLower.includes("km")) {
        replyText = persona?.aboutCar || `Tiene ${car.km.toLocaleString('es-CL')} km reales, la mayoría en carretera. Muy bien cuidado, sin detalles de motor ni caja.`;
      } 
      else if (textLower.includes("junta") || textLower.includes("juntarnos") || textLower.includes("probar") || textLower.includes("mall") || textLower.includes("donde") || textLower.includes("dónde") || textLower.includes("verlo")) {
        replyText = `¡Súper! Podríamos coordinar una junta en un lugar intermedio y seguro, ideal un estacionamiento de mall grande que tenga cámaras y guardias (como el Costanera, Plaza Vespucio o el Trébol si estás en Concepción). ¿Qué día te acomoda?`;
      } 
      else if (textLower.includes("diferencia") || textLower.includes("lucas") || textLower.includes("plata") || textLower.includes("efectivo") || textLower.includes("cuanto") || textLower.includes("cuánto") || textLower.includes("precio")) {
        replyText = `Revisando los precios promedios de AutoMatch Chile, mi auto está tasado en $${car.price.toLocaleString('es-CL')} y el tuyo en $${userCar ? userCar.price.toLocaleString('es-CL') : 'el precio acordado'}. Creo que una diferencia razonable sería compensar ese margen. ¿Cómo lo ves tú?`;
      } 
      else if (textLower.includes("whatsapp") || textLower.includes("celular") || textLower.includes("fono") || textLower.includes("número") || textLower.includes("numero")) {
        replyText = persona?.closingNegotiation || `Dale, excelente. Háblame al WhatsApp para mandarte más fotos y coordinar la junta más rápido. Mi número es +56 9 ${Math.floor(10000000 + Math.random() * 90000000)}.`;
      } 
      else {
        // Default generic car responses
        const defaults = [
          `Buenísimo. El auto está tal como en las fotos. Si quieres podemos coordinar para que lo revises con tu mecánico de confianza.`,
          `Me interesa harto tu propuesta. Mi auto tiene todas las mantenciones hechas a tiempo y mecánicamente anda un 10.`,
          `Oye, cuéntame un poco más de tu auto, ¿es único dueño o tiene algún choque registrado?`,
          `¡Vale! ¿De qué comuna eres tú para ver dónde nos queda cómodo juntarnos?`
        ];
        replyText = defaults[Math.floor(Math.random() * defaults.length)];
      }

      onSendMessage(matchId, replyText, 'other');
      setIsTyping(false);
    }, 1800);
  };

  // Generate WhatsApp prefilled message
  const getWhatsAppLink = (car: Car) => {
    const defaultText = `Hola ${car.ownerName}, vi tu ${car.brand} ${car.model} en AutoMatch Chile y me interesó mucho. Hablemos sobre la venta o permuta.`;
    return `https://wa.me/56912345678?text=${encodeURIComponent(defaultText)}`;
  };

  // Filter matches based on search query
  const filteredMatches = matches.filter((match) => {
    const car = match.car;
    const ownerName = car.ownerName.toLowerCase();
    const brand = car.brand.toLowerCase();
    const model = car.model.toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    
    return ownerName.includes(query) || brand.includes(query) || model.includes(query);
  });

  return (
    <div className="flex flex-1 min-h-0 h-full max-w-5xl w-full mx-auto bg-[#0a0a0a] border-0 md:border border-white/10 rounded-none md:rounded-3xl overflow-hidden shadow-2xl" id="chat_workspace">
      {/* MATCHES SIDEBAR */}
      <div className={`w-full md:w-80 border-r border-white/10 flex flex-col shrink-0 bg-[#0f0f0f] ${activeMatchId ? 'hidden md:flex' : 'flex'}`} id="chat_sidebar">
        <div className="p-4 border-b border-white/10 bg-[#0f0f0f] space-y-3.5">
          <div>
            <h3 className="font-sans font-black text-white text-lg flex items-center gap-1.5 uppercase italic tracking-tighter">
              <MessageCircle className="w-5 h-5 text-red-500 shrink-0" />
              Mis Chats de AutoMatch
            </h3>
            <p className="text-xs text-white/50 mt-1">Sigue deslizando para generar más interesados.</p>
          </div>

          {/* Search box */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/30">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Buscar por dueño o modelo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#141414] border border-white/5 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all font-sans"
              id="chat_search_input"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-white/30 hover:text-white cursor-pointer transition-colors"
                id="chat_search_clear"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable list of matches */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/5 bg-[#0f0f0f]" id="matches_list_scroll">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-full p-4 flex gap-3.5 items-center bg-white/[0.01] border-b border-white/5 animate-pulse select-none">
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-white/10" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white/20 border-2 border-zinc-950" />
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex justify-between items-baseline">
                    <div className="h-4 bg-white/15 rounded-md w-2/3" />
                    <div className="h-2.5 bg-white/10 rounded-sm w-8" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 bg-white/10 rounded-sm w-1/2" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white/5" />
                    <div className="h-2.5 bg-white/5 rounded-sm w-10" />
                  </div>
                  <div className="h-3 bg-white/5 rounded-sm w-3/4" />
                </div>
              </div>
            ))
          ) : matches.length === 0 ? (
            <div className="p-8 text-center text-white/40">
              <div className="inline-flex bg-white/5 p-3 rounded-full mb-3">
                <CarIcon className="w-6 h-6 text-white/40" />
              </div>
              <p className="text-sm font-bold text-white/80">Sin matches activos</p>
              <p className="text-xs mt-1">¡Desliza a la derecha en la sección principal para encontrar interesados!</p>
            </div>
          ) : filteredMatches.length === 0 ? (
            <div className="p-8 text-center text-white/40">
              <div className="inline-flex bg-white/5 p-3 rounded-full mb-3">
                <Search className="w-6 h-6 text-red-500/60" />
              </div>
              <p className="text-sm font-bold text-white/80">Sin resultados</p>
              <p className="text-xs mt-1">No encontramos negociaciones con "{searchQuery}"</p>
            </div>
          ) : (
            filteredMatches.map((match) => {
              const car = match.car;
              const lastMsg = match.messages[match.messages.length - 1];
              const isSelected = match.id === activeMatchId;

              return (
                <button
                  key={match.id}
                  onClick={() => setActiveMatchId(match.id)}
                  className={`w-full text-left p-4 flex gap-3.5 hover:bg-white/5 transition-all cursor-pointer items-center ${
                    isSelected ? 'bg-red-600/10 hover:bg-red-600/10 border-l-4 border-red-600 pl-3' : ''
                  }`}
                  id={`match_item_${match.id}`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={car.image}
                      alt={car.brand}
                      className="w-12 h-12 rounded-xl object-cover border border-white/10 shadow-md"
                      referrerPolicy="no-referrer"
                    />
                    <img 
                      src={car.ownerPhoto} 
                      alt={car.ownerName} 
                      className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full object-cover border-2 border-zinc-950 shadow-md"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h4 className="font-bold text-white text-sm truncate font-sans tracking-tight">{car.brand} {car.model}</h4>
                      <span className="text-[10px] text-white/40 font-mono">
                        {lastMsg ? lastMsg.timestamp : ''}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-white/60 truncate mt-0.5 flex items-center gap-1.5">
                      <span className="truncate">Dueño: {car.ownerName} ({car.location.split(',')[0]})</span>
                      <span className="flex items-center gap-1 shrink-0">
                        <span className={`w-1.5 h-1.5 rounded-full ${getSellerOnlineStatus(car.ownerName).isOnline ? 'bg-green-500 animate-pulse' : 'bg-white/20'}`} />
                        <span className="text-[9px] text-white/40 font-mono font-normal">
                          {getSellerOnlineStatus(car.ownerName).isOnline ? 'en línea' : 'offline'}
                        </span>
                      </span>
                    </p>
                    <p className={`text-xs truncate mt-1 ${match.unread ? 'text-red-400 font-bold' : 'text-white/40'}`}>
                      {lastMsg ? lastMsg.text : 'Haz iniciado un match de permuta.'}
                    </p>
                  </div>

                  {match.unread && (
                    <span className="w-2.5 h-2.5 bg-red-600 rounded-full shrink-0 animate-pulse" id={`unread_dot_${match.id}`}></span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ACTIVE CHAT WORKSPACE */}
      <div className={`flex-1 flex flex-col bg-[#0a0a0a] h-full min-h-0 ${!activeMatchId ? 'hidden md:flex items-center justify-center text-center p-8 text-white/40 bg-[#0f0f0f] border border-white/5' : 'flex'}`} id="active_chat_pane">
        {activeMatch ? (
          <>
            {/* Active chat header */}
            <div className="bg-[#0f0f0f] border-b border-white/10 py-2 sm:py-3.5 px-3 sm:px-4.5 flex justify-between items-center z-10 sticky top-0 shrink-0 shadow-lg gap-2">
              <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
                <button
                  onClick={() => setActiveMatchId(null)}
                  className="md:hidden text-white/80 hover:text-white px-2 py-1 bg-white/10 rounded-lg cursor-pointer mr-0.5 text-xs"
                  id="chat_back_arrow"
                >
                  ←
                </button>

                <div className="relative shrink-0">
                  <img
                    src={activeMatch.car.image}
                    alt={activeMatch.car.brand}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl object-cover border border-white/10"
                    referrerPolicy="no-referrer"
                  />
                  <img 
                    src={activeMatch.car.ownerPhoto} 
                    alt={activeMatch.car.ownerName} 
                    className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full object-cover border-2 border-zinc-950"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="min-w-0 text-left">
                  <div className="flex items-center gap-1">
                    <h4 className="font-sans font-black text-white text-xs sm:text-sm truncate tracking-tight">
                      {activeMatch.car.brand} {activeMatch.car.model}
                    </h4>
                    <span className="bg-white/10 text-white font-mono text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded-sm shrink-0">
                      {activeMatch.car.year}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-x-1.5 gap-y-0.5 mt-0.5 text-[10px] sm:text-xs text-white/50">
                    <span className="flex items-center gap-0.5 truncate">
                      <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-500 shrink-0" /> {activeMatch.car.location}
                    </span>
                    <span className="hidden sm:inline text-white/20 font-mono">•</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="truncate">Dueño: <strong className="text-white/80 font-semibold">{activeMatch.car.ownerName}</strong></span>
                      <span className="inline-flex items-center gap-1 px-1 py-0.5 rounded bg-white/5 border border-white/5 text-[8px] sm:text-[9px] font-medium shrink-0">
                        <span className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${getSellerOnlineStatus(activeMatch.car.ownerName).isOnline ? 'bg-green-500 animate-pulse' : 'bg-amber-500/85'}`} />
                        <span className={getSellerOnlineStatus(activeMatch.car.ownerName).isOnline ? 'text-green-400 font-bold' : 'text-amber-400/90'}>
                          {getSellerOnlineStatus(activeMatch.car.ownerName).text}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action utilities for larger screens (hidden on mobile) */}
              <div className="hidden sm:flex items-center gap-1.5 sm:gap-2 shrink-0">
                <button
                  onClick={() => onOpenCarDetails(activeMatch.car)}
                  className="bg-white/5 hover:bg-white/10 text-white font-bold text-xs p-1.5 sm:py-2 sm:px-2.5 rounded-xl flex items-center justify-center cursor-pointer transition-all border border-white/5"
                  title="Ficha Técnica"
                >
                  <Info className="w-3.5 h-3.5 text-red-400" />
                  <span className="hidden sm:inline ml-1">Ficha</span>
                </button>

                <button
                  onClick={() => handleStartCall('audio')}
                  disabled={isCurrentMatchReported}
                  className="bg-white/5 hover:bg-white/10 text-emerald-400 font-bold text-xs p-2 rounded-xl items-center justify-center cursor-pointer transition-all border border-white/5 disabled:opacity-30"
                  title="Llamada de voz"
                >
                  <Phone className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleStartCall('video')}
                  disabled={isCurrentMatchReported}
                  className="bg-white/5 hover:bg-white/10 text-indigo-400 font-bold text-xs p-2 rounded-xl items-center justify-center cursor-pointer transition-all border border-white/5 disabled:opacity-30"
                  title="Videollamada"
                >
                  <Video className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setShowReportModal(true)}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs p-2 rounded-xl items-center justify-center cursor-pointer transition-all border border-red-500/15"
                  title="Reportar spam o fraude"
                >
                  <AlertTriangle className="w-4 h-4" />
                </button>

                <a
                  href={getWhatsAppLink(activeMatch.car)}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs p-1.5 sm:py-2 sm:px-2.5 rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all shadow-lg shadow-green-600/20"
                  id="chat_whatsapp_btn"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-current text-white" />
                  <span className="hidden sm:inline">WhatsApp</span>
                  <ExternalLink className="w-3 h-3 text-white/80 hidden sm:inline" />
                </a>
              </div>

              {/* Minimal Info Button for mobile inside header to save horizontal space */}
              <div className="flex sm:hidden items-center gap-1 shrink-0">
                <button
                  onClick={() => onOpenCarDetails(activeMatch.car)}
                  className="bg-white/5 hover:bg-white/10 text-white font-bold text-xs p-2 rounded-xl flex items-center justify-center cursor-pointer transition-all border border-white/5"
                  title="Ficha Técnica"
                >
                  <Info className="w-3.5 h-3.5 text-red-400" />
                </button>
              </div>
            </div>

            {/* Mobile-Optimized Communication Actions Row (visible only on mobile screen widths < 640px) */}
            <div className="flex sm:hidden items-center justify-between bg-zinc-950 border-b border-white/5 py-2 px-3 gap-1.5 shrink-0" id="chat_mobile_communication_actions">
              {/* WhatsApp button */}
              <a
                href={getWhatsAppLink(activeMatch.car)}
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 active:scale-95 text-white font-bold text-[10px] py-1.5 px-2 rounded-lg transition-all shadow-md shadow-green-600/10"
                id="chat_whatsapp_btn_mobile"
              >
                <MessageCircle className="w-3 h-3 fill-current text-white" />
                <span>WhatsApp</span>
                <ExternalLink className="w-2.5 h-2.5 text-white/80" />
              </a>

              {/* Call button */}
              <button
                onClick={() => handleStartCall('audio')}
                disabled={isCurrentMatchReported}
                className="flex items-center justify-center gap-1 bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-emerald-400 font-bold text-[10px] py-1.5 px-2.5 rounded-lg border border-zinc-800 disabled:opacity-30 transition-all"
                id="chat_voice_btn_mobile"
              >
                <Phone className="w-3 h-3" />
                <span className="text-white/95">Llamar</span>
              </button>

              {/* Video button */}
              <button
                onClick={() => handleStartCall('video')}
                disabled={isCurrentMatchReported}
                className="flex items-center justify-center gap-1 bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-indigo-400 font-bold text-[10px] py-1.5 px-2.5 rounded-lg border border-zinc-800 disabled:opacity-30 transition-all"
                id="chat_video_btn_mobile"
              >
                <Video className="w-3 h-3" />
                <span className="text-white/95">Video</span>
              </button>

              {/* Report button */}
              <button
                onClick={() => setShowReportModal(true)}
                className="bg-red-500/5 hover:bg-red-500/15 active:scale-95 text-red-400 font-bold text-xs p-1.5 rounded-lg border border-red-500/10 transition-all shrink-0"
                id="chat_report_btn_mobile"
                title="Reportar"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Chat message bubbles list */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-[#0a0a0a]" id="chat_bubbles_scroll">
              <div className="max-w-[300px] sm:max-w-md mx-auto relative w-full space-y-3 sm:space-y-4">
                {/* Trust disclaimer banner */}
                <div className="p-2 sm:p-3 bg-gradient-to-r from-red-950/40 to-[#0a0a0a] border border-red-600/15 rounded-2xl flex items-start gap-2 text-left shadow-lg">
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-white text-[10px] sm:text-xs font-sans tracking-tight">Negociación Segura de AutoMatch</h5>
                    <p className="text-[8px] sm:text-[10px] text-white/60 leading-normal sm:leading-relaxed mt-0.5">
                      Les aconsejamos juntarse siempre en lugares públicos concurridos, verificar la documentación completa del vehículo y realizar la transferencia mediante Notaría o Registro Civil oficial.
                    </p>
                  </div>
                </div>

                {activeMatch.messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                      id={`chat_bubble_container_${msg.id}`}
                    >
                      <div
                        className={`max-w-[90%] sm:max-w-[85%] rounded-2xl px-2.5 sm:px-4 py-1.5 sm:py-2.5 text-xs sm:text-sm shadow-md relative text-left break-words ${
                          isUser
                            ? 'bg-red-600 text-white rounded-br-none'
                            : 'bg-[#141414] text-white rounded-bl-none border border-white/10'
                        }`}
                        id={`chat_bubble_${msg.id}`}
                      >
                        {/* If message is call message */}
                        {msg.isCallMessage ? (
                          <div className="flex items-center gap-1 sm:gap-2 font-semibold font-mono text-[9px] sm:text-[11px] py-1 break-words">
                            {msg.text.includes("🎥") || msg.text.includes("Videollamada") ? (
                              <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-300 animate-pulse shrink-0" />
                            ) : (
                              <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-300 animate-pulse shrink-0" />
                            )}
                            <span className="leading-tight sm:leading-relaxed">{msg.text}</span>
                          </div>
                        ) : (
                          <>
                            {/* Renders photo attachment if any */}
                            {msg.mediaType === 'photo' && msg.mediaUrl && (
                              <div className="mb-2 rounded-xl overflow-hidden border border-white/10 max-w-full bg-zinc-950">
                                <img 
                                  src={msg.mediaUrl} 
                                  alt="Adjunto" 
                                  className="w-full h-auto max-h-48 sm:max-h-60 object-cover" 
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                            )}

                            {/* Renders video attachment if any */}
                            {msg.mediaType === 'video' && msg.mediaUrl && (
                              <div className="mb-2 rounded-xl overflow-hidden border border-white/10 bg-zinc-950 max-w-full relative aspect-video flex items-center justify-center">
                                <video 
                                  src={msg.mediaUrl} 
                                  controls 
                                  preload="metadata"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}

                            <p className="leading-tight sm:leading-relaxed break-words whitespace-pre-wrap">{msg.text}</p>
                          </>
                        )}

                        <div className="flex items-center justify-end gap-1 mt-1 shrink-0">
                          <span className={`text-[8px] sm:text-[9px] font-mono block text-right ${isUser ? 'text-white/70' : 'text-white/40'}`}>
                            {msg.timestamp}
                          </span>
                          {isUser && <CheckCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-200" />}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-[#141414] border border-white/10 rounded-2xl px-3 py-2 flex items-center gap-1.5 text-white/60 text-xs">
                      <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                      <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                      <span className="ml-1 font-mono text-[9px] sm:text-[10px] text-white/40">{activeMatch.car.ownerName} está escribiendo...</span>
                    </div>
                  </div>
                )}
              </div>

              <div ref={messagesEndRef} />
            </div>

            {/* QUICK REPLIES BAR */}
            {!isCurrentMatchReported && (
              <div className="bg-[#0f0f0f] border-t border-white/10 py-1.5 px-2 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5 shrink-0 no-scrollbar" id="quick_replies_scroller">
                {QUICK_REPLIES.map((reply, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(reply)}
                    className="bg-[#141414] border border-white/10 hover:border-red-500 hover:bg-[#141414] text-white/80 hover:text-white text-[10px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full transition-all cursor-pointer shrink-0"
                    id={`quick_reply_${idx}`}
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}

            {/* Blocked state or standard input */}
            {isCurrentMatchReported ? (
              <div className="bg-red-950/20 border-t border-red-500/20 p-4 text-center shrink-0">
                <div className="inline-flex bg-red-600/10 p-2.5 rounded-full mb-2 border border-red-500/20">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                </div>
                <p className="text-xs font-bold text-white uppercase tracking-wider">CONVERSACIÓN CONGELADA</p>
                <p className="text-[10px] text-white/50 max-w-md mx-auto mt-0.5 leading-relaxed">
                  Has reportado a este vendedor. No se pueden enviar más mensajes en este chat. El equipo de AutoMatch Chile revisará el historial para asegurar la comunidad.
                </p>
              </div>
            ) : (
              <div className="bg-[#0f0f0f] p-1.5 sm:p-2.5 border-t border-white/10 sticky bottom-0 shrink-0 z-10 relative">
                <div className="max-w-[300px] sm:max-w-md mx-auto relative w-full">
                  {/* Attachment Popover Panel */}
                  <AnimatePresence>
                    {showAttachmentMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 15 }}
                        className="absolute bottom-14 left-0 bg-[#141414] border border-white/10 rounded-2xl p-3 shadow-2xl z-50 w-72 text-left"
                        id="attachment_menu_panel"
                      >
                        <div className="text-xs font-bold uppercase tracking-wider text-white/40 mb-2 px-2">Compartir Multimedia</div>
                        
                        <div className="space-y-1">
                          {/* Real File Upload triggers */}
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-white hover:bg-white/5 rounded-xl transition-all cursor-pointer text-left"
                          >
                            <Image className="w-4 h-4 text-emerald-400 shrink-0" />
                            <div>
                              <p className="font-semibold text-white/90">Subir Foto Real</p>
                              <p className="text-[9px] text-white/40">Sube fotos de tu auto desde tu galería</p>
                            </div>
                          </button>

                          <button
                            onClick={() => videoFileInputRef.current?.click()}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-white hover:bg-white/5 rounded-xl transition-all cursor-pointer text-left"
                          >
                            <Camera className="w-4 h-4 text-indigo-400 shrink-0" />
                            <div>
                              <p className="font-semibold text-white/90">Subir Video Real</p>
                              <p className="text-[9px] text-white/40">Sube un video o graba con tu cámara</p>
                            </div>
                          </button>

                          <div className="border-t border-white/5 my-2"></div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1 px-2">Simulaciones de Prueba</div>

                          <button
                            onClick={() => handleSimulatedAttachment('photo_motor')}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-white/80 hover:bg-white/5 rounded-lg transition-all cursor-pointer text-left"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-red-400" />
                            <span>Adjuntar Foto de Motor</span>
                          </button>

                          <button
                            onClick={() => handleSimulatedAttachment('photo_interior')}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-white/80 hover:bg-white/5 rounded-lg transition-all cursor-pointer text-left"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-red-400" />
                            <span>Adjuntar Foto de Interior</span>
                          </button>

                          <button
                            onClick={() => handleSimulatedAttachment('video_test')}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-white/80 hover:bg-white/5 rounded-lg transition-all cursor-pointer text-left"
                          >
                            <Play className="w-3.5 h-3.5 text-red-400" />
                            <span>Adjuntar Video de Prueba</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Hidden inputs */}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    accept="image/*" 
                    onChange={(e) => handleFileSelect(e, 'photo')} 
                    className="hidden" 
                  />
                  <input 
                    type="file" 
                    ref={videoFileInputRef} 
                    accept="video/*" 
                    onChange={(e) => handleFileSelect(e, 'video')} 
                    className="hidden" 
                  />

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSend(inputText);
                    }}
                    className="flex gap-1 items-center"
                  >
                    {/* Media Attachment Plus trigger */}
                    <button
                      type="button"
                      onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                      className={`p-1.5 sm:p-2 rounded-xl transition-all cursor-pointer shrink-0 flex items-center justify-center border ${
                        showAttachmentMenu 
                          ? 'bg-red-600/20 border-red-500 text-red-400' 
                          : 'bg-zinc-900 border-white/10 text-white/60 hover:text-white hover:bg-zinc-800'
                      }`}
                      title="Adjuntar multimedia"
                    >
                      <Paperclip className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    </button>

                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Escribe un mensaje..."
                      className="flex-1 bg-zinc-900 border border-white/10 text-white rounded-xl px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm focus:outline-hidden focus:border-red-500 focus:bg-zinc-800 transition-all"
                      id="chat_input_text"
                    />
                    <button
                      type="submit"
                      disabled={!inputText.trim()}
                      className="bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white p-2 sm:p-2.5 rounded-xl transition-all cursor-pointer shrink-0 flex items-center justify-center shadow-lg shadow-red-600/35"
                      id="chat_send_btn"
                    >
                      <Send className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white" />
                    </button>
                  </form>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Empty / Unselected state */
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-white/40 bg-[#0f0f0f]">
            <div className="w-16 h-16 bg-white/5 text-white/40 rounded-full flex items-center justify-center mb-4 border border-white/10">
              <MessageCircle className="w-8 h-8 text-red-500/60" />
            </div>
            <h3 className="text-base font-sans font-black uppercase italic tracking-tight text-white">Tus Mensajes de Negocio</h3>
            <p className="text-xs text-white/50 mt-1.5 max-w-xs leading-relaxed">
              Elige una conversación del panel izquierdo para pactar la venta o permuta de tu auto con interesados de Chile.
            </p>
          </div>
        )}
      </div>

      {/* CALL SYSTEM OVERLAY */}
      <AnimatePresence>
        {activeCall && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col justify-between p-6 bg-zinc-950/95 backdrop-blur-lg text-white"
            id="call_system_overlay"
          >
            {/* Glow decorations */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 bg-red-600/20 rounded-full filter blur-3xl -z-10 animate-pulse"></div>

            {/* Call header */}
            <div className="text-center pt-12">
              <div className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase text-white/70 mb-4 border border-white/5">
                {activeCall.type === 'video' ? <Video className="w-3 h-3 text-red-400" /> : <Phone className="w-3 h-3 text-emerald-400" />}
                <span>AutoMatch Call System (Encriptado)</span>
              </div>

              <div className="relative w-32 h-32 mx-auto mb-6">
                {/* Pulsing ring visual */}
                {activeCall.status === 'ringing' && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" style={{ animationDuration: '2s' }}></div>
                    <div className="absolute -inset-4 rounded-full bg-red-600/10 animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}></div>
                  </>
                )}
                <img
                  src={activeMatch?.car.ownerPhoto}
                  alt={activeMatch?.car.ownerName}
                  className="w-full h-full rounded-full object-cover border-4 border-red-600 shadow-2xl relative z-10"
                  referrerPolicy="no-referrer"
                />
              </div>

              <h3 className="text-2xl font-black font-sans tracking-tight uppercase italic">{activeMatch?.car.ownerName}</h3>
              <p className="text-xs text-white/40 mt-1 font-mono">
                Vehículo: {activeMatch?.car.brand} {activeMatch?.car.model} ({activeMatch?.car.year})
              </p>

              <p className="text-sm font-semibold text-red-400 mt-6 tracking-wide uppercase animate-pulse">
                {activeCall.status === 'ringing' ? 'Marcando/Llamando...' : `Llamada en Curso • ${formatDuration(activeCall.duration)}`}
              </p>
            </div>

            {/* Call video streaming simulation area */}
            {activeCall.type === 'video' && activeCall.status === 'connected' && (
              <div className="w-full max-w-md mx-auto aspect-video bg-zinc-900 rounded-3xl overflow-hidden border border-white/10 relative shadow-2xl">
                {/* Remote camera mock */}
                <img 
                  src={activeMatch?.car.image} 
                  alt="Stream" 
                  className="w-full h-full object-cover filter brightness-90" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-black/60 px-2.5 py-1 rounded-lg text-[10px] font-mono text-white flex items-center gap-1 border border-white/5">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  En Vivo: Cámara de {activeMatch?.car.ownerName}
                </div>

                {/* PIP Local Camera feed (REAL WEBCAM IF GRANTED) */}
                <div className="absolute bottom-3 right-3 w-28 h-36 bg-[#141414] rounded-xl overflow-hidden border border-white/20 shadow-xl z-20">
                  <video 
                    ref={localVideoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover transform -scale-x-100 bg-[#0a0a0a]"
                  />
                  {!localStream && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center bg-zinc-950/90 text-[8px] text-white/50">
                      <VideoOff className="w-4 h-4 text-white/40 mb-1" />
                      <span>Cámara apagada o sin permiso</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Call controls */}
            <div className="max-w-xs w-full mx-auto pb-12 flex flex-col gap-6">
              <div className="flex justify-around items-center">
                {/* Mute toggle */}
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-4 rounded-full transition-all cursor-pointer ${
                    isMuted ? 'bg-red-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                  title="Silenciar micrófono"
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                {/* Video screen camera toggle */}
                {activeCall.type === 'video' && (
                  <button
                    onClick={() => {
                      setIsVideoCameraOff(!isVideoCameraOff);
                      if (!isVideoCameraOff) stopCamera();
                      else startCamera();
                    }}
                    className={`p-4 rounded-full transition-all cursor-pointer ${
                      isVideoCameraOff ? 'bg-red-600 text-white' : 'bg-[#141414] text-white hover:bg-white/20'
                    }`}
                    title="Apagar cámara"
                  >
                    {isVideoCameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                  </button>
                )}

                {/* Speaker toggle */}
                <button
                  onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                  className={`p-4 rounded-full transition-all cursor-pointer ${
                    !isSpeakerOn ? 'bg-red-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                  title="Altavoz"
                >
                  {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>
              </div>

              {/* Red End Call trigger */}
              <button
                onClick={handleEndCall}
                className="w-full bg-red-600 hover:bg-red-700 py-4 px-6 rounded-2xl flex items-center justify-center gap-2 font-bold text-white shadow-xl shadow-red-600/30 cursor-pointer transition-all"
              >
                <PhoneOff className="w-5 h-5 fill-current" />
                <span>Terminar Llamada</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* REPORT SPAM / FRAUD MODAL */}
      <AnimatePresence>
        {showReportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" id="report_modal_overlay">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-md w-full bg-[#141414] border border-red-500/20 rounded-3xl p-6 text-white shadow-2xl overflow-hidden text-left"
              id="report_modal_container"
            >
              {/* Report submit success banner overlay */}
              {showReportSuccess && (
                <div className="absolute inset-0 bg-[#141414] flex flex-col items-center justify-center p-6 text-center z-50">
                  <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20 animate-bounce">
                    <ShieldCheck className="w-8 h-8 text-red-500" />
                  </div>
                  <h4 className="text-lg font-black font-sans uppercase tracking-tight text-white mb-2">Reporte Enviado</h4>
                  <p className="text-xs text-white/60 max-w-xs leading-relaxed">
                    Hemos registrado tu denuncia. El equipo de AutoMatch Chile evaluará el historial del vendedor dentro de las próximas 24 horas. ¡Gracias por mantener la comunidad segura!
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
                  <h3 className="font-sans font-black uppercase text-base tracking-tight italic text-white">Reportar Cuenta o Fraude</h3>
                </div>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="p-1.5 bg-white/5 hover:bg-white/10 rounded-full cursor-pointer transition-all"
                >
                  <X className="w-4 h-4 text-white/50 hover:text-white" />
                </button>
              </div>

              <p className="text-xs text-white/60 mb-4 leading-relaxed">
                En AutoMatch Chile priorizamos tu seguridad. Si sospechas de este vendedor, infórmanos para auditar su cuenta y bloquearla si corresponde.
              </p>

              <div className="space-y-3.5">
                <div>
                  <label className="text-[10px] font-bold uppercase text-white/40 block mb-1.5 font-mono">Razón de la denuncia</label>
                  <div className="grid grid-cols-1 gap-1.5">
                    {[
                      { id: 'fraud', label: '💸 Posible fraude, estafa o precio falso' },
                      { id: 'spam', label: '📧 Spam, publicidad o mensajes repetitivos' },
                      { id: 'fake', label: '👤 Perfil falso o fotos falsas' },
                      { id: 'abuse', label: '💬 Comportamiento inadecuado o insultos' },
                      { id: 'other', label: '⚠️ Otro motivo de seguridad' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setReportReason(item.id)}
                        className={`w-full text-left p-3 rounded-xl text-xs transition-all flex items-center justify-between border cursor-pointer ${
                          reportReason === item.id 
                            ? 'bg-red-600/10 border-red-500 text-white font-bold' 
                            : 'bg-zinc-900 border-white/5 text-white/70 hover:bg-[#1f1f1f]'
                        }`}
                        type="button"
                      >
                        <span>{item.label}</span>
                        {reportReason === item.id && <Check className="w-4 h-4 text-red-500 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-white/40 block mb-1.5 font-mono">Detalles adicionales</label>
                  <textarea
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Describe la anomalía (ej. pide depósito previo, etc.)..."
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-hidden focus:border-red-500 focus:bg-zinc-800 transition-all h-20 resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 mt-6">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white/70 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border border-white/5"
                  type="button"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleReportSubmit}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-red-600/25 border border-red-500/20"
                  type="button"
                >
                  Enviar Reporte
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
