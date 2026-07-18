import React, { useState, useEffect } from 'react';
import { UserCar, ValuationResult, Car as CarType } from '../types';
import { POPULAR_BRANDS, estimateCarValue, CHILEAN_REGIONS, MOCK_CARS } from '../mockData';
import { 
  TrendingUp, 
  Eye, 
  Heart, 
  Sparkles, 
  Sliders, 
  MapPin, 
  ShieldAlert, 
  ShieldCheck,
  FileCheck, 
  BadgePercent, 
  ChevronRight, 
  CheckCircle,
  HelpCircle,
  Car,
  Settings,
  Share2,
  Copy,
  Send,
  Globe,
  QrCode,
  Check,
  Bell,
  BellRing,
  Trash2,
  X,
  Volume2,
  Zap,
  Key,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { playEngineSound, EngineType } from '../lib/audio';

interface DashboardProps {
  userCar: UserCar | null;
  onUpdateCar: (updatedCar: UserCar) => void;
  onBoost: () => void;
  isBoosted: boolean;
  onOpenPrivacy?: (tab: 'privacy' | 'disclosure' | 'terms') => void;
  leftSwipedCarIds?: string[];
  onRecoverCar?: (carId: string) => void;
  onLikeCarDirectly?: (car: CarType) => void;
  onOpenCarDetails?: (car: CarType) => void;
  searchPreferences?: { maxKm: string; region: string };
  onUpdateSearchPreferences?: (prefs: { maxKm: string; region: string }) => void;
}

const ChileanMarketInsights = [
  { brand: 'Toyota Hilux', category: 'Camioneta Pick-up', demand: '94%', trend: '+3.2%', liquidity: 'Alta' },
  { brand: 'Suzuki Swift', category: 'Hatchback Urbano', demand: '91%', trend: '+1.5%', liquidity: 'Alta' },
  { brand: 'Mazda CX-5', category: 'SUV Familiar', demand: '89%', trend: '+2.1%', liquidity: 'Alta' },
  { brand: 'Peugeot 208', category: 'Hatchback Diésel', demand: '86%', trend: '+4.0%', liquidity: 'Media-Alta' },
  { brand: 'Hyundai Accent', category: 'Sedán Económico', demand: '84%', trend: '-0.5%', liquidity: 'Alta' }
];

const SellingTips = [
  { id: 1, text: "Ten listo el Certificado de Anotaciones Vigentes (CAV) del Registro Civil para generar confianza instantánea." },
  { id: 2, text: "Sube fotos claras del motor e interior. Los autos con información transparente reciben un 280% más likes y matches en AutoMatch Chile." },
  { id: 3, text: "Describe claramente tus preferencias de permuta. Ejemplo: 'Busco menor valor más dinero a mi favor' o 'Doy diferencia'." },
  { id: 4, text: "Saca fotos limpias en exteriores (parques, zonas residenciales) a plena luz del día para que tu auto destaque en el mazo." }
];

export default function Dashboard({ 
  userCar, 
  onUpdateCar, 
  onBoost, 
  isBoosted, 
  onOpenPrivacy,
  leftSwipedCarIds = [],
  onRecoverCar,
  onLikeCarDirectly,
  onOpenCarDetails,
  searchPreferences = { maxKm: 'Todos', region: 'Todos' },
  onUpdateSearchPreferences
}: DashboardProps) {
  const [showEdit, setShowEdit] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showSecurityGuide, setShowSecurityGuide] = useState(false);
  
  // Stats counter simulation
  const [simulatedViews, setSimulatedViews] = useState(userCar?.views || 140);
  const [simulatedLikes, setSimulatedLikes] = useState(userCar?.likes || 12);

  // Engine Sound Settings
  const [dashboardEngineSound, setDashboardEngineSound] = useState<EngineType>(() => {
    const saved = localStorage.getItem('automatch_engine_sound');
    return (saved as EngineType) || 'v8';
  });

  // Tasador searcher tool in dashboard
  const [searchBrand, setSearchBrand] = useState('Toyota');
  const [searchModel, setSearchModel] = useState('Hilux');
  const [searchYear, setSearchYear] = useState(2021);
  const [searchKm, setSearchKm] = useState(50000);
  const [searchValuation, setSearchValuation] = useState<ValuationResult | null>(null);

  // Edit form state
  const [brand, setBrand] = useState(userCar?.brand || 'Suzuki');
  const [model, setModel] = useState(userCar?.model || 'Swift');
  const [year, setYear] = useState(userCar?.year || 2019);
  const [km, setKm] = useState(userCar?.km || 60000);
  const [price, setPrice] = useState(userCar?.price || 9500000);
  const [location, setLocation] = useState(userCar?.location || 'Santiago, RM');
  const [description, setDescription] = useState(userCar?.description || '');
  const [permuta, setPermuta] = useState(userCar?.permuta ?? true);
  const [permutaPreferences, setPermutaPreferences] = useState(userCar?.permutaPreferences || '');

  // Run dynamic valuation calculation for dashboard widget
  const handleCalculateSearch = () => {
    const res = estimateCarValue({
      brand: searchBrand,
      model: searchModel,
      year: searchYear,
      km: searchKm,
      condition: 'good'
    });
    setSearchValuation(res);
  };

  useEffect(() => {
    handleCalculateSearch();
  }, [searchBrand, searchYear, searchKm]);

  // Simulate active viewers looking at user's car
  useEffect(() => {
    const interval = setInterval(() => {
      if (userCar) {
        const incrementViews = Math.floor(Math.random() * 2) + 1; // +1 or +2 views
        const isLike = Math.random() < (isBoosted ? 0.35 : 0.08); // higher chance of like when boosted!
        
        setSimulatedViews(v => v + incrementViews);
        if (isLike) {
          setSimulatedLikes(l => l + 1);
        }
      }
    }, isBoosted ? 6000 : 15000); // speed up stats updates when boosted!

    return () => clearInterval(interval);
  }, [isBoosted, userCar]);

  // Subscription Alert state
  const [isSubscribed, setIsSubscribed] = useState(() => {
    const saved = localStorage.getItem('automatch_sub_active');
    return saved ? JSON.parse(saved) : false;
  });
  const [subBrand, setSubBrand] = useState(() => localStorage.getItem('automatch_sub_brand') || 'Todos');
  const [subModel, setSubModel] = useState(() => localStorage.getItem('automatch_sub_model') || '');
  const [subMaxPrice, setSubMaxPrice] = useState(() => {
    const saved = localStorage.getItem('automatch_sub_maxprice');
    return saved ? Number(saved) : 18000000;
  });
  const [receivedAlerts, setReceivedAlerts] = useState<{
    id: string;
    brand: string;
    model: string;
    year: number;
    price: number;
    km: number;
    location: string;
    image: string;
    ownerName: string;
    timestamp: string;
  }[]>(() => {
    const saved = localStorage.getItem('automatch_sub_alerts');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeAlertToast, setActiveAlertToast] = useState<{
    id: string;
    brand: string;
    model: string;
    year: number;
    price: number;
    image: string;
  } | null>(null);

  const [selectedAlertCar, setSelectedAlertCar] = useState<any | null>(null);
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDashboardLoading(false);
    }, 900);
    return () => clearTimeout(timer);
  }, []);

  // When filters or subscription preferences change, trigger a micro "scan/fetch" simulation
  useEffect(() => {
    setIsDashboardLoading(true);
    const timer = setTimeout(() => {
      setIsDashboardLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [subBrand, subModel, subMaxPrice, isSubscribed]);

  useEffect(() => {
    localStorage.setItem('automatch_sub_active', JSON.stringify(isSubscribed));
    localStorage.setItem('automatch_sub_brand', subBrand);
    localStorage.setItem('automatch_sub_model', subModel);
    localStorage.setItem('automatch_sub_maxprice', subMaxPrice.toString());
  }, [isSubscribed, subBrand, subModel, subMaxPrice]);

  useEffect(() => {
    localStorage.setItem('automatch_sub_alerts', JSON.stringify(receivedAlerts));
  }, [receivedAlerts]);

  // Simulate incoming publications matching preferences
  useEffect(() => {
    if (!isSubscribed) return;

    const generateAlert = () => {
      // Find a brand
      let brandChoice = subBrand;
      if (brandChoice === 'Todos') {
        const randomIndex = Math.floor(Math.random() * POPULAR_BRANDS.length);
        brandChoice = POPULAR_BRANDS[randomIndex].name;
      }

      // Find models for that brand
      const brandObj = POPULAR_BRANDS.find(b => b.name === brandChoice);
      const modelsList = brandObj ? brandObj.models : ['Urban'];
      
      let modelChoice = subModel.trim();
      if (!modelChoice) {
        const randomModelIndex = Math.floor(Math.random() * modelsList.length);
        modelChoice = modelsList[randomModelIndex];
      }

      const yearChoice = Math.floor(Math.random() * 11) + 2014; // 2014 - 2025
      const kmChoice = Math.floor(Math.random() * 120000) + 15000;
      
      const minPrice = 4500000;
      const finalMaxPrice = Math.max(minPrice + 1000000, subMaxPrice);
      const priceChoice = Math.floor(Math.random() * (finalMaxPrice - minPrice)) + minPrice;

      // Select randomized location
      const randomRegion = CHILEAN_REGIONS[Math.floor(Math.random() * CHILEAN_REGIONS.length)];
      const randomCommune = randomRegion.communes[Math.floor(Math.random() * randomRegion.communes.length)];
      const locationChoice = `${randomCommune}, ${randomRegion.name.split(' ')[0]}`;

      // Select randomized owner
      const names = ["Andrés", "Sebastián", "Mauricio", "Camila", "Francisca", "Diego", "Patricia", "Valentina", "Gonzalo", "Ignacio", "Matías", "Constanza"];
      const ownerChoice = names[Math.floor(Math.random() * names.length)];

      // Select a matching aesthetic photo or generic
      const carImages = [
        "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=400",
        "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=400",
        "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=400",
        "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=400",
        "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=400",
        "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&q=80&w=400",
        "https://images.unsplash.com/photo-14921435146c1-e58153a9f4a1?auto=format&fit=crop&q=80&w=400",
        "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=400"
      ];
      const imageChoice = carImages[Math.floor(Math.random() * carImages.length)];

      const newAlert = {
        id: `alert_${Date.now()}`,
        brand: brandChoice,
        model: modelChoice,
        year: yearChoice,
        price: priceChoice,
        km: kmChoice,
        location: locationChoice,
        image: imageChoice,
        ownerName: ownerChoice,
        timestamp: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
      };

      setReceivedAlerts(prev => [newAlert, ...prev].slice(0, 10)); // Keep last 10 alerts
      setActiveAlertToast(newAlert);

      // Play the chosen car engine notification sound!
      const savedSound = (localStorage.getItem('automatch_engine_sound') as EngineType) || 'v8';
      playEngineSound(savedSound);

      // Auto dismiss toast in 5 seconds
      setTimeout(() => {
        setActiveAlertToast(current => current?.id === newAlert.id ? null : current);
      }, 5500);
    };

    // First simulated match arrives in 4.5 seconds to feel responsive, then every 24 seconds
    const initialTimeout = setTimeout(generateAlert, 4500);
    const interval = setInterval(generateAlert, 24000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [isSubscribed, subBrand, subModel, subMaxPrice]);

  if (!userCar) return null;

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserCar = {
      ...userCar,
      brand,
      model,
      year,
      km,
      price,
      location,
      description,
      permuta,
      permutaPreferences: permuta ? permutaPreferences : 'No busco permutas, solo venta.'
    };
    onUpdateCar(updated);
    setShowEdit(false);
  };

  const shareUrl = userCar 
    ? `https://automatch.cl/post/${userCar.brand.toLowerCase().replace(/\s+/g, '-')}-${userCar.model.toLowerCase().replace(/\s+/g, '-')}-${userCar.year}-am${Math.abs((userCar.price || 0) % 12345)}` 
    : '';
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const matchingCarsCount = MOCK_CARS.filter(car => {
    const prefs = searchPreferences || { maxKm: 'Todos', region: 'Todos' };
    if (prefs.maxKm !== 'Todos') {
      const maxKmNum = parseInt(prefs.maxKm, 10);
      if (car.km > maxKmNum) return false;
    }
    if (prefs.region !== 'Todos') {
      const locLower = car.location.toLowerCase();
      const filterLower = prefs.region.toLowerCase();
      let regionMatch = false;
      if (prefs.region === 'RM' || filterLower.includes('metropolitana')) {
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
  }).length;

  return (
    <div className="max-w-5xl w-full mx-auto px-4 py-6 space-y-8 text-left relative" id="dashboard_workspace">
      
      {/* Toast Alert Simulation */}
      <AnimatePresence>
        {activeAlertToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-4 right-4 z-50 bg-[#121212] border border-red-500/30 shadow-2xl shadow-red-950/50 rounded-2xl p-4 w-80 text-white flex gap-3 cursor-pointer select-none"
            onClick={() => {
              setSelectedAlertCar(activeAlertToast);
              setActiveAlertToast(null);
            }}
            id="subscription_toast_alert"
          >
            <div className="bg-red-600/10 text-red-500 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-red-500/20">
              <BellRing className="w-5 h-5 animate-bounce" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-red-400 font-mono tracking-widest">
                  ¡Alerta de AutoMatch!
                </span>
                <span className="text-[9px] font-mono text-white/40">Ahora</span>
              </div>
              <h4 className="text-xs font-black truncate text-white mt-1">
                {activeAlertToast.brand} {activeAlertToast.model}
              </h4>
              <p className="text-[10px] text-white/60 truncate mt-0.5">
                Cumple con tus preferencias de suscripción.
              </p>
              <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/5 text-[9px]">
                <span className="text-emerald-400 font-mono font-bold">
                  ${activeAlertToast.price.toLocaleString('es-CL')} CLP
                </span>
                <span className="text-red-400 font-bold hover:underline flex items-center gap-0.5">
                  Ver Ficha <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🛡️ SECURITY GUIDE: EVITA ESTAFAS MODAL */}
      <AnimatePresence>
        {showSecurityGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md" id="security_guide_overlay">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#0f0f0f] border border-white/10 rounded-3xl overflow-hidden max-w-2xl w-full text-white shadow-2xl relative flex flex-col max-h-[85vh]"
              id="security_guide_modal"
            >
              {/* Header */}
              <div className="p-6 pb-4 border-b border-white/15 flex items-center justify-between bg-gradient-to-r from-amber-950/20 via-zinc-950 to-[#0f0f0f]">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-500/10 text-amber-500 p-2 rounded-xl border border-amber-500/20">
                    <ShieldAlert className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-amber-400 block">
                      Guía de Seguridad AutoMatch Chile
                    </span>
                    <h3 className="text-lg font-sans font-black uppercase italic tracking-tight text-white mt-0.5">
                      Evita Estafas: Compra y Permuta Seguro
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setShowSecurityGuide(false)}
                  className="bg-white/5 hover:bg-white/10 hover:text-white text-white/70 p-2 rounded-full cursor-pointer transition-all border border-white/5"
                  id="close_security_guide_modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable content */}
              <div className="p-6 overflow-y-auto space-y-6 text-left scrollbar-thin scrollbar-thumb-zinc-850 scrollbar-track-transparent">
                <p className="text-xs text-white/70 leading-relaxed">
                  Realizar transacciones de vehículos usados en Chile es una excelente opción económica, pero requiere precaución legal. Antes de entregar dinero, transferir tu auto o aceptar un intercambio (permuta), debes entender los siguientes tres riesgos críticos:
                </p>

                {/* Risk Grid */}
                <div className="space-y-4">
                  {/* Risk 1 */}
                  <div className="p-4 bg-white/[0.02] border border-white/5 hover:border-amber-500/10 rounded-2xl transition-all space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-500/15 text-amber-400 font-mono font-bold text-xs px-2.5 py-0.5 rounded-md">
                        1. Prohibición de Enajenar
                      </span>
                    </div>
                    <p className="text-xs text-white/85 leading-relaxed">
                      Es un <strong>impedimento legal de carácter absoluto</strong> decretado por un tribunal, un contrato financiero o por orden administrativa que prohíbe transferir o traspasar el dominio del vehículo a otra persona.
                    </p>
                    <div className="bg-red-500/5 border border-red-500/10 p-2.5 rounded-xl text-[11px] text-red-400 flex gap-2">
                      <span className="font-bold shrink-0">⚠️ Efecto crítico:</span>
                      <span>Si compras un vehículo con prohibición de enajenar, el Servicio de Registro Civil rechazará la transferencia de dominio y no figurarás como dueño legal, perdiendo tu inversión.</span>
                    </div>
                  </div>

                  {/* Risk 2 */}
                  <div className="p-4 bg-white/[0.02] border border-white/5 hover:border-amber-500/10 rounded-2xl transition-all space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-500/15 text-amber-400 font-mono font-bold text-xs px-2.5 py-0.5 rounded-md">
                        2. Prendas Vigentes (Financiamientos)
                      </span>
                    </div>
                    <p className="text-xs text-white/85 leading-relaxed">
                      Significa que el auto está <strong>gravado a favor de una entidad de crédito</strong> (como Forum, Santander Consumer, Tanner, etc.) para garantizar el pago de una deuda vigente de su dueño actual.
                    </p>
                    <div className="bg-red-500/5 border border-red-500/10 p-2.5 rounded-xl text-[11px] text-red-400 flex gap-2">
                      <span className="font-bold shrink-0">⚠️ Efecto crítico:</span>
                      <span>El vehículo no se puede transferir libremente en Notarías ni en el Registro Civil a menos que la entidad financiera emita una escritura pública de <strong>Alzamiento de Prenda</strong> tras pagar la totalidad de la deuda.</span>
                    </div>
                  </div>

                  {/* Risk 3 */}
                  <div className="p-4 bg-white/[0.02] border border-white/5 hover:border-amber-500/10 rounded-2xl transition-all space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-500/15 text-amber-400 font-mono font-bold text-xs px-2.5 py-0.5 rounded-md">
                        3. Embargos Judiciales
                      </span>
                    </div>
                    <p className="text-xs text-white/85 leading-relaxed">
                      Un embargo es una <strong>medida preventiva dictada por un juez</strong> debido a demandas por deudas impagas del propietario del auto (por ejemplo, deudas de multas, pagarés bancarios o créditos de consumo).
                    </p>
                    <div className="bg-red-500/5 border border-red-500/10 p-2.5 rounded-xl text-[11px] text-red-400 flex gap-2">
                      <span className="font-bold shrink-0">⚠️ Efecto crítico:</span>
                      <span>Si el auto es embargado, un receptor judicial junto a Carabineros de Chile puede retirar el vehículo físicamente en cualquier momento para rematarlo, dejando al nuevo comprador sin auto y sin dinero.</span>
                    </div>
                  </div>
                </div>

                {/* Actionable recommendations */}
                <div className="border-t border-white/5 pt-4 space-y-3">
                  <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest">
                    🛡️ Protocolo obligatorio para transar seguro
                  </h4>
                  <ul className="text-xs text-white/70 space-y-2.5 pl-4 list-disc leading-relaxed">
                    <li>
                      <strong className="text-white">Certificado CAV al día:</strong> Solicita siempre el Certificado de Anotaciones Vigentes (CAV) en la web oficial del Registro Civil de Chile <strong>el mismo día de la transacción</strong>. No confíes en CAVs impresos antiguos provistos por el vendedor.
                    </li>
                    <li>
                      <strong className="text-white">Multas de tránsito:</strong> Pide el Certificado de Multas de Tránsito No Pagadas para constatar que no heredes infracciones en juzgados de policía local de diferentes comunas.
                    </li>
                    <li>
                      <strong className="text-white">Verificación de Identidad:</strong> Valida físicamente que la cédula de identidad del vendedor coincida exactamente con el dueño listado en el CAV. Si es un tercero, exige un Poder Especial Notarial visado para venta de vehículos.
                    </li>
                    <li>
                      <strong className="text-white">Vías Oficiales de Traspaso:</strong> Realiza el trámite de compraventa exclusivamente en Notarías autorizadas o de forma presencial en las oficinas del Registro Civil. Nunca aceptes contratos privados informales firmados "de palabra" o fuera del circuito formal.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-white/10 bg-zinc-950 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowSecurityGuide(false)}
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-sans font-black uppercase text-xs py-3 rounded-xl transition-all cursor-pointer text-center"
                  id="understand_security_guide_btn"
                >
                  Entendido, deseo transar seguro
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🏎️ ALERT CAR DETAILS OVERLAY MODAL */}
      <AnimatePresence>
        {selectedAlertCar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0f0f0f] border border-white/10 rounded-3xl overflow-hidden max-w-md w-full text-white shadow-2xl relative"
              id="alert_car_details_modal"
            >
              {/* Header image area */}
              <div className="h-48 bg-zinc-800 relative">
                <img 
                  src={selectedAlertCar.image} 
                  alt="Car detail" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-red-600 text-white font-mono font-black text-[10px] px-2.5 py-1 rounded-md uppercase tracking-wider shadow-md">
                  ALERTA ACTIVADA 🔔
                </div>
                <button 
                  onClick={() => setSelectedAlertCar(null)}
                  className="absolute top-3 right-3 bg-black/60 hover:bg-black/90 text-white/80 hover:text-white p-2 rounded-full cursor-pointer transition-all border border-white/5"
                  id="close_alert_car_modal"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-3 right-3 bg-black/80 border border-white/10 px-3 py-1 rounded-lg text-sm font-black font-mono text-emerald-400 shadow-md">
                  ${selectedAlertCar.price.toLocaleString('es-CL')} CLP
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4 text-left">
                <div>
                  <span className="text-[9px] font-black uppercase text-red-500 font-mono tracking-widest">
                    Publicado hace poco • AutoMatch Radar
                  </span>
                  <h3 className="text-xl font-sans font-black uppercase italic tracking-tight text-white mt-1">
                    {selectedAlertCar.brand} {selectedAlertCar.model}
                  </h3>
                  <div className="flex gap-2.5 mt-1.5 text-xs text-white/50 font-mono">
                    <span>Año {selectedAlertCar.year}</span>
                    <span>•</span>
                    <span>{selectedAlertCar.km.toLocaleString('es-CL')} km</span>
                    <span>•</span>
                    <span>{selectedAlertCar.location}</span>
                  </div>
                </div>

                {/* Safety features */}
                <div className="border-t border-b border-white/5 py-3 space-y-2">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">
                    Seguridad Certificada AutoMatch
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="bg-[#052e16] text-emerald-400 border border-emerald-500/20 text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 font-mono">
                      <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" /> ABS
                    </span>
                    <span className="bg-[#052e16] text-emerald-400 border border-emerald-500/20 text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 font-mono">
                      <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" /> Airbags Frontales
                    </span>
                    <span className="bg-[#052e16] text-emerald-400 border border-emerald-500/20 text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 font-mono">
                      <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" /> ESP (Control Estabilidad)
                    </span>
                  </div>
                </div>

                {/* Seller details */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">
                    Información del Vendedor
                  </span>
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 text-xs">
                    <div>
                      <p className="font-bold text-white">{selectedAlertCar.ownerName}</p>
                      <p className="text-[10px] text-white/50">Usuario Verificado en AutoMatch</p>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-500/15 border border-green-500/20 text-[9px] font-bold text-green-400 animate-pulse font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      En línea
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      alert(`Simulando contacto directo con ${selectedAlertCar.ownerName} para permuta de su ${selectedAlertCar.brand} ${selectedAlertCar.model}. ¡Éxito en la negociación!`);
                      setSelectedAlertCar(null);
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-500 text-white font-sans font-black uppercase text-xs py-3 px-4 rounded-xl transition-all cursor-pointer text-center shadow-lg shadow-red-950/50"
                    id="modal_chat_with_alert_seller"
                  >
                    Proponer Permuta / Chat
                  </button>
                  <button
                    onClick={() => setSelectedAlertCar(null)}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs py-3 px-4 rounded-xl transition-all cursor-pointer"
                    id="modal_close_alert_btn"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TOP SELLER SUMMARY */}
      <div className="bg-gradient-to-r from-red-950/40 via-zinc-900 to-[#0f0f0f] border border-white/10 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-2xl" id="dashboard_hero">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/10 rounded-full filter blur-3xl -z-10 animate-pulse"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-red-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" /> PANEL DE CONTROL DE VENDEDOR
            </span>
            <h1 className="text-3xl font-sans font-black uppercase italic tracking-tight text-white">
              ¡Hola! Tu publicación está <span className="text-emerald-400">Activa</span>
            </h1>
            <p className="text-sm text-white/70 max-w-lg leading-relaxed">
              Tu auto está siendo mostrado en el mazo de deslizamiento a clientes interesados en Santiago y regiones. ¡Recibe matches para vender o permutar!
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={onBoost}
              disabled={isBoosted}
              className={`py-3 px-5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isBoosted 
                  ? 'bg-green-600/10 text-green-400 border border-green-500/20 animate-pulse'
                  : 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/35'
              }`}
              id="dashboard_boost_btn"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              {isBoosted ? '¡Auto Destacado Activo!' : 'Destacar Auto en Chile'}
            </button>

            <button
              onClick={() => {
                setShowEdit(!showEdit);
                if (showShare) setShowShare(false);
              }}
              className={`py-3 px-5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                showEdit 
                  ? 'bg-white/15 text-white border border-white/25' 
                  : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
              }`}
              id="dashboard_edit_btn"
            >
              <Settings className="w-4 h-4" />
              Editar Publicación
            </button>

            <button
              onClick={() => {
                setShowShare(!showShare);
                if (showEdit) setShowEdit(false);
              }}
              className={`py-3 px-5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                showShare 
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/35 border border-red-500/20' 
                  : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
              }`}
              id="dashboard_share_btn"
            >
              <Share2 className="w-4 h-4" />
              Compartir Publicación
            </button>
          </div>
        </div>

        {/* Dashboard Live Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="flex items-center gap-1.5 text-white/40 text-xs font-bold uppercase">
              <Eye className="w-4 h-4 text-red-500" /> Vistas Totales
            </div>
            <p className="text-2xl font-mono font-bold mt-1.5 text-white">{simulatedViews}</p>
            <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">+{isBoosted ? '48' : '12'} de hoy</span>
          </div>

          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="flex items-center gap-1.5 text-white/40 text-xs font-bold uppercase">
              <Heart className="w-4 h-4 text-red-500 fill-current" /> Likes Recibidos
            </div>
            <p className="text-2xl font-mono font-bold mt-1.5 text-white">{simulatedLikes}</p>
            <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">+{isBoosted ? '9' : '2'} de hoy</span>
          </div>

          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="flex items-center gap-1.5 text-white/40 text-xs font-bold uppercase">
              <TrendingUp className="w-4 h-4 text-red-400" /> Índice de Match
            </div>
            <p className="text-2xl font-mono font-bold mt-1.5 text-white">
              {Math.min(25, Math.max(5, Math.round((simulatedLikes / simulatedViews) * 100)))}%
            </p>
            <span className="text-[10px] text-red-400 block mt-0.5">Promedio Mercado: 8%</span>
          </div>

          <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
            <div className="flex items-center gap-1.5 text-white/40 text-xs font-bold uppercase">
              <Car className="w-4 h-4 text-red-500" /> Posicionamiento
            </div>
            <p className="text-2xl font-sans font-bold mt-1.5 text-emerald-400">
              {isBoosted ? 'Tope Mazo' : 'Excelente'}
            </p>
            <span className="text-[10px] text-white/40 block mt-0.5">Visible en todas las regiones</span>
          </div>
        </div>
      </div>

      {/* ⚙️ PREFERENCIAS DE BÚSQUEDA PARA SWIPE */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-2xl space-y-6" id="dashboard_search_preferences">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-red-500 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-red-500" />
              Algoritmo de Deslizamiento (Swipe)
            </span>
            <h2 className="text-xl font-sans font-black uppercase italic tracking-tight text-white mt-1">
              Preferencias de Búsqueda de Autos
            </h2>
            <p className="text-xs text-white/50 mt-1">
              Personaliza el mazo de deslizamiento según kilometraje máximo y ubicación geográfica para encontrar tu permuta perfecta.
            </p>
          </div>
          
          <div className="bg-red-600/10 border border-red-500/20 text-red-400 font-mono text-xs px-4 py-2 rounded-2xl flex items-center gap-2 self-start sm:self-center">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span>
              <strong>{matchingCarsCount}</strong> autos coinciden
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Kilometraje Máximo */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-white/70 uppercase tracking-wider">
              Kilometraje Máximo
            </label>
            <div className="relative">
              <select
                value={searchPreferences.maxKm}
                onChange={(e) => {
                  onUpdateSearchPreferences?.({
                    ...searchPreferences,
                    maxKm: e.target.value
                  });
                }}
                className="w-full bg-zinc-950 border border-zinc-800 text-xs font-bold text-white/80 rounded-xl p-3 focus:outline-hidden focus:border-red-500 appearance-none cursor-pointer"
                id="pref_max_km"
              >
                <option value="Todos">Cualquiera (Todos los kilometrajes)</option>
                <option value="15000">Hasta 15.000 km</option>
                <option value="30000">Hasta 30.000 km</option>
                <option value="50000">Hasta 50.000 km</option>
                <option value="80000">Hasta 80.000 km</option>
                <option value="100000">Hasta 100.000 km</option>
                <option value="150000">Hasta 150.000 km</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-white/40">
                <ChevronRight className="w-4 h-4 rotate-90" />
              </div>
            </div>
            <p className="text-[11px] text-white/40 leading-relaxed">
              Oculta del mazo de swipe cualquier auto que exceda este límite para evitar vehículos con demasiado desgaste.
            </p>
          </div>

          {/* Ubicación Geográfica */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-white/70 uppercase tracking-wider">
              Ubicación Geográfica (Región)
            </label>
            <div className="relative">
              <select
                value={searchPreferences.region}
                onChange={(e) => {
                  onUpdateSearchPreferences?.({
                    ...searchPreferences,
                    region: e.target.value
                  });
                }}
                className="w-full bg-zinc-950 border border-zinc-800 text-xs font-bold text-white/80 rounded-xl p-3 focus:outline-hidden focus:border-red-500 appearance-none cursor-pointer"
                id="pref_region"
              >
                <option value="Todos">Cualquiera (Todo Chile)</option>
                <option value="RM">Región Metropolitana (RM)</option>
                {CHILEAN_REGIONS.filter(r => r.name !== "Región Metropolitana").map(r => (
                  <option key={r.name} value={r.name}>{r.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-white/40">
                <ChevronRight className="w-4 h-4 rotate-90" />
              </div>
            </div>
            <p className="text-[11px] text-white/40 leading-relaxed">
              Filtra tu ubicación para conectar únicamente con usuarios que estén en tu misma región o zona geográfica de Chile.
            </p>
          </div>
        </div>

        {/* Sincronización info bar */}
        <div className="bg-white/[0.02] border border-zinc-800/80 rounded-2xl p-4 flex gap-3 items-center">
          <div className="bg-red-600/10 text-red-500 p-2 rounded-xl border border-red-500/20 shrink-0">
            <CheckCircle className="w-5 h-5 text-red-500" />
          </div>
          <div className="text-xs leading-relaxed text-white/60">
            <span className="font-bold text-white block">Ajustes sincronizados en tiempo real</span>
            Las preferencias se guardan de inmediato y modifican el algoritmo de deslizamiento. Ve a la pestaña <strong className="text-red-400">Deslizar Autos</strong> para ver los nuevos resultados que cumplen con tus condiciones de búsqueda.
          </div>
        </div>
      </div>

      {/* 🛡️ SECURITY GUIDE QUICK ACTION BANNER */}
      <div className="bg-gradient-to-r from-amber-950/20 via-zinc-900 to-[#0f0f0f] border border-amber-500/20 rounded-3xl p-5 md:p-6 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl" id="security_guide_quick_banner">
        <div className="flex items-start gap-4">
          <div className="bg-amber-500/10 text-amber-500 p-3 rounded-2xl shrink-0 border border-amber-500/20 shadow-inner">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-500 flex items-center gap-1">
              • RECOMENDACIÓN LEGAL Y DE SEGURIDAD
            </span>
            <h3 className="text-lg font-sans font-black uppercase italic tracking-tight text-white leading-tight">
              ¿Vas a comprar, vender o permutar? Evita Estafas
            </h3>
            <p className="text-xs text-white/60 max-w-2xl leading-relaxed">
              En Chile, es vital revisar que los autos no tengan <strong>prohibición de enajenar</strong>, <strong>prendas vigentes</strong> o <strong>embargos</strong> activos. Conoce cómo proteger tu dinero antes de firmar cualquier transferencia.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowSecurityGuide(true)}
          className="w-full md:w-auto bg-amber-500 hover:bg-amber-600 active:scale-95 text-zinc-950 font-sans font-black uppercase text-xs px-5 py-3.5 rounded-xl transition-all shrink-0 shadow-lg shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-2 border border-amber-400/30 font-bold"
          id="trigger_security_guide_btn"
        >
          <HelpCircle className="w-4 h-4 text-zinc-950" />
          Leer Guía de Seguridad
        </button>
      </div>

      {/* EDIT CAR FORM (Collapsible drawer) */}
      {showEdit && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-[#141414] border border-white/10 rounded-3xl p-6 shadow-2xl text-white"
          id="edit_car_panel"
        >
          <h2 className="text-xl font-sans font-black uppercase italic text-white mb-4 flex items-center gap-1.5">
            <Sliders className="w-5 h-5 text-red-500" /> Modificar mi Auto Publicado
          </h2>
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-white/60 uppercase mb-1">Marca</label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-hidden focus:border-red-500"
                  id="edit_brand"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/60 uppercase mb-1">Modelo</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-hidden focus:border-red-500"
                  id="edit_model"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/60 uppercase mb-1">Año</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-hidden focus:border-red-500"
                  id="edit_year"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/60 uppercase mb-1">Kilometraje (km)</label>
                <input
                  type="number"
                  value={km}
                  onChange={(e) => setKm(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-hidden focus:border-red-500"
                  id="edit_km"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/60 uppercase mb-1">Precio Publicado (CLP)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-hidden focus:border-red-500 font-bold"
                  id="edit_price"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-white/60 uppercase mb-1">Ubicación</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-hidden focus:border-red-500"
                  id="edit_location"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2 py-2">
              <input
                type="checkbox"
                checked={permuta}
                onChange={(e) => setPermuta(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded-sm accent-red-600"
                id="edit_permuta"
              />
              <label htmlFor="edit_permuta" className="text-xs font-bold text-white/70 uppercase select-none cursor-pointer">
                Acepto propuestas de permuta (Intercambio)
              </label>
            </div>

            {permuta && (
              <div>
                <label className="block text-xs font-bold text-white/60 uppercase mb-1">Preferencia de Permuta</label>
                <input
                  type="text"
                  value={permutaPreferences}
                  onChange={(e) => setPermutaPreferences(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-hidden focus:border-red-500"
                  id="edit_permuta_preferences"
                  required={permuta}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-white/60 uppercase mb-1">Descripción de venta</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-zinc-900 border border-white/10 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-hidden focus:border-red-500 resize-none"
                id="edit_description"
                required
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2.5 px-5 rounded-xl cursor-pointer"
                id="save_edit_car_btn"
              >
                Guardar Cambios
              </button>
              <button
                type="button"
                onClick={() => setShowEdit(false)}
                className="bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 text-xs font-bold py-2.5 px-5 rounded-xl cursor-pointer"
                id="cancel_edit_car_btn"
              >
                Cancelar
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* SOCIAL SHARING PANEL */}
      {showShare && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-[#141414] border border-white/10 rounded-3xl p-6 shadow-2xl text-white space-y-6"
          id="share_car_panel"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-red-500 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" /> DIFUSIÓN SOCIAL ACTIVA
              </span>
              <h2 className="text-xl font-sans font-black uppercase italic tracking-tight text-white mt-1">
                Generador de Enlaces Públicos y QR
              </h2>
              <p className="text-xs text-white/50 mt-1">
                Comparte este enlace para que compradores vean tu auto, tasaciones e historial sin necesidad de registrarse.
              </p>
            </div>
            
            <button
              onClick={() => setShowShare(false)}
              className="text-xs text-white/40 hover:text-white bg-white/5 hover:bg-white/10 border border-white/15 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
            >
              Cerrar Centro de Difusión
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LINK AND ACTIONS (Column Left) */}
            <div className="lg:col-span-8 space-y-5">
              {/* Unique deep link container */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-white/60 uppercase tracking-wider">Tu Enlace Único de Publicación</label>
                <div className="flex gap-2">
                  <div className="relative flex-1 bg-zinc-950/80 border border-white/15 rounded-xl px-4 py-3 text-xs font-mono text-white/80 select-all overflow-x-auto whitespace-nowrap flex items-center min-h-[44px]">
                    {shareUrl}
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className={`px-5 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                      copied 
                        ? 'bg-green-600 text-white' 
                        : 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20'
                    }`}
                    id="copy_share_link_btn"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" /> Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" /> Copiar Link
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Instant Social Channels Grid */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-white/60 uppercase tracking-wider">Compartir en Redes Sociales</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* WhatsApp */}
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`¡Hola! Revisa mi publicación de venta/permuta en AutoMatch Chile: ${userCar.brand} ${userCar.model} ${userCar.year} por $${userCar.price.toLocaleString('es-CL')} CLP. Revisa el equipamiento, tasación e historial técnico ingresando aquí: ${shareUrl}`)}`}
                    target="_blank"
                    referrerPolicy="no-referrer"
                    className="flex flex-col items-center justify-center p-4 bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-500/20 hover:border-emerald-500/40 rounded-2xl gap-2 text-center group transition-all"
                    id="share_whatsapp_btn"
                  >
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 group-hover:bg-emerald-500/20 flex items-center justify-center text-emerald-400 transition-colors">
                      <Send className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-white/90">WhatsApp</span>
                    <span className="text-[9px] text-emerald-400 font-bold block leading-none">Ideal para Grupos</span>
                  </a>

                  {/* Facebook */}
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    referrerPolicy="no-referrer"
                    className="flex flex-col items-center justify-center p-4 bg-blue-950/20 hover:bg-blue-950/40 border border-blue-500/20 hover:border-blue-500/40 rounded-2xl gap-2 text-center group transition-all"
                    id="share_facebook_btn"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 group-hover:bg-blue-500/20 flex items-center justify-center text-blue-400 transition-colors">
                      <Share2 className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-white/90">Facebook</span>
                    <span className="text-[9px] text-blue-400 font-bold block leading-none">Marketplace</span>
                  </a>

                  {/* Twitter / X */}
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Vendo o permuto mi ${userCar.brand} ${userCar.model} (${userCar.year}) en AutoMatch Chile. Revisa la tasación de mercado y contáctame directo en `)}&url=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    referrerPolicy="no-referrer"
                    className="flex flex-col items-center justify-center p-4 bg-zinc-950 hover:bg-zinc-900 border border-white/5 hover:border-white/15 rounded-2xl gap-2 text-center group transition-all"
                    id="share_twitter_btn"
                  >
                    <div className="w-10 h-10 rounded-full bg-white/5 group-hover:bg-white/10 flex items-center justify-center text-white/80 transition-colors">
                      <Globe className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-white/90">X / Twitter</span>
                    <span className="text-[9px] text-white/40 font-bold block leading-none">Venta Rápida</span>
                  </a>

                  {/* Email */}
                  <a
                    href={`mailto:?subject=${encodeURIComponent(`Venta / Permuta de mi ${userCar.brand} ${userCar.model}`)}&body=${encodeURIComponent(`Hola,\n\nTe comparto el link público de mi vehículo publicado en AutoMatch Chile para que revises el equipamiento, tasación referencial e historial técnico:\n\n${shareUrl}\n\n¡Quedo atento a tus propuestas!`)}`}
                    className="flex flex-col items-center justify-center p-4 bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 hover:border-red-500/40 rounded-2xl gap-2 text-center group transition-all"
                    id="share_email_btn"
                  >
                    <div className="w-10 h-10 rounded-full bg-red-500/10 group-hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-colors">
                      <Send className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-white/90">Correo</span>
                    <span className="text-[9px] text-red-400 font-bold block leading-none">Ficha Completa</span>
                  </a>
                </div>
              </div>

              {/* Chilean Groups Tip */}
              <div className="p-4 bg-white/5 border border-white/5 rounded-2xl text-xs space-y-1.5">
                <p className="font-bold text-white flex items-center gap-1">
                  <span className="text-red-500">💡</span> Recomendación de venta para Chile
                </p>
                <p className="text-white/60 leading-relaxed">
                  Copia el link y pégalo en grupos populares de Facebook como <strong className="text-white/80">"Autos Usados Santiago"</strong>, <strong className="text-white/80">"Solo Permutas V Región"</strong> o descripciones de <strong className="text-white/80">Yapo</strong>. Los compradores podrán chatear en tiempo real contigo ingresando directamente a este enlace desde su celular.
                </p>
              </div>
            </div>

            {/* PREVIEW CARD & QR CODE (Column Right) */}
            <div className="lg:col-span-4 bg-zinc-950/60 border border-white/5 rounded-2xl p-4 space-y-4">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block">Visualización de Ficha</span>
              
              {/* Mini visual mockup of shared card */}
              <div className="border border-white/10 rounded-xl overflow-hidden bg-zinc-900/40">
                <div className="h-28 bg-zinc-800 relative overflow-hidden flex items-center justify-center">
                  {userCar.image ? (
                    <img 
                      src={userCar.image} 
                      alt="Car Preview" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <Car className="w-10 h-10 text-white/20 animate-pulse" />
                  )}
                  <div className="absolute top-2 left-2 bg-red-600 text-white font-mono font-black text-[9px] px-2 py-0.5 rounded uppercase tracking-wider">
                    AutoMatch 🇨🇱
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/75 border border-white/15 px-2 py-0.5 rounded text-[10px] font-bold font-mono text-red-400">
                    ${userCar.price.toLocaleString('es-CL')}
                  </div>
                </div>
                
                <div className="p-3 text-left space-y-1">
                  <p className="text-xs font-bold text-white truncate leading-tight">
                    {userCar.brand} {userCar.model}
                  </p>
                  <div className="flex gap-1.5 text-[9px] text-white/50 font-mono">
                    <span>{userCar.year}</span>
                    <span>•</span>
                    <span>{userCar.km.toLocaleString('es-CL')} km</span>
                    <span>•</span>
                    <span>{userCar.location}</span>
                  </div>
                  <p className="text-[10px] text-emerald-400 font-bold font-mono pt-1 leading-tight">
                    {userCar.permuta ? '✓ Acepta Permutas' : '• Solo venta directa'}
                  </p>
                </div>
              </div>

              {/* QR Code graphic mockup */}
              <div className="bg-zinc-900 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center space-y-2">
                <QrCode className="w-16 h-16 text-white/80 animate-pulse" />
                <div>
                  <span className="text-[10px] font-black text-white uppercase block leading-none">Código QR de Post</span>
                  <span className="text-[9px] text-white/40 block mt-1">Escanea para abrir en el móvil</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 🔔 LIVE ALERTS SUBSCRIPTION HUB */}
      <div className="bg-[#0c0c0c] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl text-white relative overflow-hidden" id="dashboard_subscription_hub">
        {/* Glow effect */}
        {isSubscribed && (
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full filter blur-3xl -z-10 animate-pulse"></div>
        )}
        
        <div className="border-b border-white/10 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-red-500 flex items-center gap-1.5">
              <Bell className={`w-4 h-4 ${isSubscribed ? 'text-red-500 animate-bounce' : 'text-white/40'}`} /> 
              Suscripción de Alertas en Tiempo Real
            </span>
            <h2 className="text-2xl font-sans font-black uppercase italic tracking-tight text-white mt-1">
              Radar de Publicaciones AutoMatch 🇨🇱
            </h2>
            <p className="text-xs text-white/50 mt-1">
              Configura tus preferencias y recibe alertas simuladas en vivo cuando se publiquen vehículos que se ajusten a tu presupuesto y gusto.
            </p>
          </div>

          <button
            onClick={() => setIsSubscribed(!isSubscribed)}
            className={`py-2.5 px-6 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 font-mono ${
              isSubscribed 
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/40 border border-emerald-500/20' 
                : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950/40 border border-red-500/20'
            }`}
            id="subscription_toggle_btn"
          >
            {isSubscribed ? (
              <>
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                Suscrito Activo
              </>
            ) : (
              <>
                <BellRing className="w-4 h-4" />
                Activar Radar
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* LEFT: PREFERENCES FORM */}
          <div className="lg:col-span-2 space-y-4 bg-zinc-950/40 border border-white/5 rounded-2xl p-5">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block border-b border-white/5 pb-2">
              Filtros de Alerta
            </span>

            {/* Brand Preference Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-white/70 uppercase">Marca preferida</label>
              <select
                value={subBrand}
                onChange={(e) => setSubBrand(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 text-xs font-bold text-white/80 rounded-xl p-2.5 focus:outline-hidden focus:border-red-500"
                id="sub_brand_pref"
              >
                <option value="Todos" className="bg-zinc-950">Todas las marcas (Cualquiera)</option>
                {POPULAR_BRANDS.map(b => (
                  <option key={b.name} value={b.name} className="bg-zinc-950">{b.name}</option>
                ))}
              </select>
            </div>

            {/* Model Preference Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-white/70 uppercase">Modelo específico</label>
              <input
                type="text"
                placeholder="Ej. Hilux, Swift, CX-5 (O dejas en blanco)"
                value={subModel}
                onChange={(e) => setSubModel(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 text-xs font-bold text-white/80 rounded-xl p-2.5 focus:outline-hidden focus:border-red-500 placeholder-white/20"
                id="sub_model_pref"
              />
            </div>

            {/* Max Budget Preference */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-white/70 uppercase">Presupuesto Máximo</label>
                <span className="text-red-400 font-mono font-bold">
                  ${subMaxPrice.toLocaleString('es-CL')} CLP
                </span>
              </div>
              <input
                type="range"
                min={5000000}
                max={45000000}
                step={500000}
                value={subMaxPrice}
                onChange={(e) => setSubMaxPrice(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-600"
                id="sub_maxprice_slider"
              />
              <div className="flex justify-between text-[10px] text-white/40 font-mono">
                <span>$5M CLP</span>
                <span>$25M CLP</span>
                <span>$45M CLP</span>
              </div>
            </div>

            {/* Simulated Info Box */}
            <div className="p-3.5 bg-red-600/5 border border-red-500/10 rounded-xl text-[11px] text-white/60 leading-relaxed space-y-1">
              <span className="font-bold text-red-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 shrink-0" /> Radar AutoMatch Chile
              </span>
              <p>
                Al tener tu suscripción activa, nuestro sistema buscará vehículos listados por otros usuarios en Chile. Te notificaremos con banners emergentes y guardaremos las ofertas en el feed lateral.
              </p>
            </div>
          </div>

          {/* RIGHT: ALERTS FEED LIST */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                <BellRing className="w-3.5 h-3.5 text-red-500" />
                Historial de Alertas Recibidas ({receivedAlerts.length})
              </span>
              
              {receivedAlerts.length > 0 && (
                <button
                  onClick={() => {
                    setReceivedAlerts([]);
                    localStorage.removeItem('automatch_sub_alerts');
                  }}
                  className="text-[10px] font-bold text-red-400/80 hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer"
                  id="clear_alerts_btn"
                >
                  <Trash2 className="w-3 h-3" /> Limpiar historial
                </button>
              )}
            </div>

            {/* Alerts Container */}
            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-850 scrollbar-track-transparent">
              {isDashboardLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-3 bg-zinc-900/20 border border-white/5 rounded-xl flex gap-3 items-center animate-pulse select-none">
                    <div className="w-16 h-12 rounded-lg bg-white/10 shrink-0 border border-white/5" />
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex justify-between">
                        <div className="h-3.5 bg-white/15 rounded-md w-1/2" />
                        <div className="h-2.5 bg-white/10 rounded-sm w-8" />
                      </div>
                      <div className="flex gap-2">
                        <div className="h-2.5 bg-white/10 rounded-sm w-12" />
                        <div className="h-2.5 bg-white/5 rounded-sm w-12" />
                        <div className="h-2.5 bg-white/5 rounded-sm w-10" />
                      </div>
                      <div className="h-2.5 bg-white/5 rounded-sm w-1/3" />
                    </div>
                    <div className="text-right shrink-0 space-y-1.5">
                      <div className="h-3 bg-emerald-500/20 rounded-sm w-14 ml-auto" />
                      <div className="h-2 bg-red-500/20 rounded-sm w-10 ml-auto" />
                    </div>
                  </div>
                ))
              ) : receivedAlerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-12 space-y-3 bg-zinc-950/20 border border-white/5 border-dashed rounded-2xl">
                  <div className={`p-4 rounded-full bg-white/5 border border-white/5 text-white/30 ${isSubscribed ? 'animate-pulse' : ''}`}>
                    <Bell className="w-8 h-8" />
                  </div>
                  <div className="space-y-1 px-4">
                    <h4 className="text-xs font-bold text-white/80">
                      {isSubscribed ? 'Buscando publicaciones...' : 'Suscripción inactiva'}
                    </h4>
                    <p className="text-[11px] text-white/40 max-w-xs mx-auto leading-relaxed">
                      {isSubscribed 
                        ? 'El radar está barriendo el mercado automotor chileno. En unos segundos verás aparecer las primeras ofertas que coincidan.' 
                        : 'Activa la suscripción para empezar a recibir notificaciones automáticas en tiempo real de autos publicados.'
                      }
                    </p>
                  </div>
                </div>
              ) : (
                receivedAlerts.map((alert) => (
                  <div 
                    key={alert.id}
                    className="p-3 bg-zinc-900/40 hover:bg-zinc-900/80 border border-white/5 hover:border-white/10 rounded-xl flex gap-3 items-center transition-all group cursor-pointer"
                    onClick={() => setSelectedAlertCar(alert)}
                    id={`received_alert_${alert.id}`}
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-12 rounded-lg overflow-hidden bg-zinc-800 shrink-0 border border-white/10 relative">
                      <img 
                        src={alert.image} 
                        alt={alert.brand} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Meta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black truncate text-white leading-none">
                          {alert.brand} {alert.model}
                        </h4>
                        <span className="text-[9px] text-white/40 font-mono shrink-0">
                          {alert.timestamp}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] text-white/50 mt-1 font-mono">
                        <span>Año {alert.year}</span>
                        <span>•</span>
                        <span>{alert.km.toLocaleString('es-CL')} km</span>
                        <span>•</span>
                        <span>{alert.location.split(',')[0]}</span>
                      </div>
                      <div className="text-[10px] text-white/40 mt-1 flex items-center gap-1">
                        <span>Dueño: <strong className="text-white/70 font-semibold">{alert.ownerName}</strong></span>
                      </div>
                    </div>

                    {/* Call-to-action */}
                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-black text-emerald-400 block">
                        ${alert.price.toLocaleString('es-CL')}
                      </span>
                      <span className="text-[9px] text-red-400 group-hover:underline font-bold mt-1 inline-flex items-center gap-0.5">
                        Ver Ficha <ChevronRight className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 🔄 SECCIÓN: VISTOS RECIENTEMENTE (AUTOS DESLIZADOS A LA IZQUIERDA POR ERROR) */}
      {(() => {
        const leftSwipedCars = (leftSwipedCarIds || [])
          .map(id => MOCK_CARS.find(c => c.id === id))
          .filter((car): car is CarType => !!car);

        return (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl text-white space-y-4" id="dashboard_recently_viewed">
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
              <div className="flex items-center gap-3">
                <div className="bg-red-600/10 text-red-500 p-2.5 rounded-2xl border border-red-500/20">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-red-400">HISTORIAL DE DESCARTES</span>
                  <h3 className="font-sans font-black uppercase italic tracking-tight text-white text-lg">
                    Vistos recientemente (Deslizados por error)
                  </h3>
                  <p className="text-xs text-white/50 mt-1">
                    ¿Deslizaste a la izquierda por error? Aquí puedes volver a verlos, recuperarlos al mazo o darles like directo para no perder la oportunidad.
                  </p>
                </div>
              </div>
              {leftSwipedCars.length > 0 && (
                <span className="bg-red-600 text-white font-mono text-[10px] font-black px-2.5 py-1 rounded-full shrink-0">
                  {leftSwipedCars.length} {leftSwipedCars.length === 1 ? 'auto' : 'autos'}
                </span>
              )}
            </div>

            {leftSwipedCars.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-10 space-y-3 bg-zinc-950/20 border border-white/5 border-dashed rounded-2xl">
                <div className="p-4 rounded-full bg-white/5 border border-white/5 text-white/30">
                  <RotateCcw className="w-8 h-8" />
                </div>
                <div className="space-y-1 px-4">
                  <h4 className="text-xs font-bold text-white/80">No hay autos descartados recientemente</h4>
                  <p className="text-[11px] text-white/40 max-w-xs mx-auto leading-relaxed">
                    Los vehículos que descartes (deslices hacia la izquierda) aparecerán en esta sección para que puedas recuperarlos si te equivocas.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {leftSwipedCars.map((car) => (
                  <div 
                    key={car.id} 
                    className="bg-zinc-900/40 hover:bg-zinc-900/80 border border-white/5 hover:border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between transition-all group"
                    id={`recently_viewed_car_${car.id}`}
                  >
                    {/* Image and Basic Info */}
                    <div className="p-3.5 flex gap-3.5 items-start">
                      <div className="w-20 h-16 rounded-xl overflow-hidden bg-zinc-800 border border-white/5 shrink-0 relative">
                        <img 
                          src={car.image} 
                          alt={`${car.brand} ${car.model}`} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] font-mono font-bold text-red-400 block uppercase tracking-wider">
                          {car.lifestyle}
                        </span>
                        <h4 className="text-sm font-black text-white truncate mt-0.5 leading-tight">
                          {car.brand} {car.model}
                        </h4>
                        <p className="text-[10px] text-white/50 font-mono mt-0.5">
                          Año {car.year} • {car.km.toLocaleString('es-CL')} km
                        </p>
                        <span className="text-xs font-mono font-black text-emerald-400 block mt-1.5">
                          ${car.price.toLocaleString('es-CL')} CLP
                        </span>
                      </div>
                    </div>

                    {/* Actions row */}
                    <div className="bg-white/[0.02] border-t border-white/5 px-3 py-2 flex items-center justify-between gap-2">
                      <button
                        onClick={() => onOpenCarDetails?.(car)}
                        className="flex-1 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 text-[10px] font-bold py-2 rounded-lg text-white/80 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-1"
                        title="Ver ficha técnica completa"
                        type="button"
                      >
                        <Eye className="w-3.5 h-3.5 text-white/60" /> Ver Ficha
                      </button>

                      <button
                        onClick={() => onRecoverCar?.(car.id)}
                        className="flex-1 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 text-[10px] font-bold py-2 rounded-lg text-red-400 transition-all cursor-pointer flex items-center justify-center gap-1"
                        title="Devolver al mazo para deslizar de nuevo"
                        type="button"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Recuperar
                      </button>

                      <button
                        onClick={() => onLikeCarDirectly?.(car)}
                        className="bg-red-600 hover:bg-red-500 text-white p-2 rounded-lg transition-all cursor-pointer flex items-center justify-center"
                        title="Dar Like directo y buscar AutoMatch"
                        type="button"
                      >
                        <Heart className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* COLUMN LAYOUTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* INTERACTIVE TASADOR CALCULATOR (2 Columns on large) */}
        <div className="lg:col-span-2 bg-[#0f0f0f] border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col justify-between text-white" id="dashboard_val_tool">
          <div>
            <span className="text-xs font-bold text-red-500 uppercase tracking-wider flex items-center gap-1 font-sans">
              <TrendingUp className="w-4 h-4" /> TASADOR CHILE EN VIVO
            </span>
            <h2 className="text-xl font-sans font-black uppercase italic tracking-tight text-white mt-1">
              Calculadora Inteligente de Valor de Mercado
            </h2>
            <p className="text-xs text-white/50 mt-1">
              ¿Estás pensando en comprar, vender o permutar otro auto? Consulta al instante los precios promedios vigentes en Chile.
            </p>

            {/* Tasador input row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
              <div>
                <label className="block text-[10px] font-bold text-white/40 uppercase mb-1">Marca</label>
                <select
                  value={searchBrand}
                  onChange={(e) => setSearchBrand(e.target.value)}
                  className="w-full bg-[#141414] border border-white/10 text-xs font-bold text-white/80 rounded-xl p-2.5 focus:outline-hidden focus:border-red-500"
                  id="search_brand"
                >
                  {POPULAR_BRANDS.map(b => (
                    <option key={b.name} value={b.name} className="bg-zinc-950">{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-white/40 uppercase mb-1">Modelo</label>
                <input
                  type="text"
                  value={searchModel}
                  onChange={(e) => setSearchModel(e.target.value)}
                  className="w-full bg-[#141414] border border-white/10 text-xs font-bold text-white/80 rounded-xl p-2.5 focus:outline-hidden focus:border-red-500"
                  id="search_model"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-white/40 uppercase mb-1">Año</label>
                <select
                  value={searchYear}
                  onChange={(e) => setSearchYear(Number(e.target.value))}
                  className="w-full bg-[#141414] border border-white/10 text-xs font-bold text-white/80 rounded-xl p-2.5 focus:outline-hidden focus:border-red-500"
                  id="search_year"
                >
                  {Array.from({ length: 15 }, (_, i) => 2026 - i).map(y => (
                    <option key={y} value={y} className="bg-zinc-950">{y}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-white/40 uppercase mb-1">Kilometraje (km)</label>
                <input
                  type="number"
                  value={searchKm}
                  onChange={(e) => setSearchKm(Number(e.target.value))}
                  className="w-full bg-[#141414] border border-white/10 text-xs font-bold text-white/80 rounded-xl p-2.5 focus:outline-hidden focus:border-red-500"
                  id="search_km"
                />
              </div>
            </div>
          </div>

          {/* Tasador results presentation */}
          {searchValuation && (
            <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <div className="sm:col-span-2">
                <span className="text-[10px] uppercase font-bold text-white/40 block">TASACIÓN REFERENCIAL ESTIMADA</span>
                <p className="text-2xl font-mono font-black text-white mt-0.5">
                  ${searchValuation.avgPrice.toLocaleString('es-CL')} CLP
                </p>
                <p className="text-[11px] text-white/50 mt-0.5 leading-relaxed">
                  Rango sano de venta/permuta: <strong className="text-red-400">${searchValuation.lowPrice.toLocaleString('es-CL')}</strong> - <strong className="text-red-400">${searchValuation.highPrice.toLocaleString('es-CL')}</strong> CLP
                </p>
              </div>

              <div className="border-t sm:border-t-0 sm:border-l border-white/10 sm:pl-4 pt-3 sm:pt-0 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-white/40">Rendimiento:</span>
                  <span className="font-bold text-white/90">{searchValuation.liquidityScore === 'Alta' ? 'Alta Demanda' : 'Demanda Estable'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">Venta Prom:</span>
                  <span className="font-bold text-white/90">{searchValuation.estimatedDaysToSell} días</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40">¿Recomienda Permuta?:</span>
                  <span className="font-bold text-red-400">{searchValuation.permutaRecommended ? '¡Sí, ideal!' : 'Venta directa'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MOST WANTED MODELS FOR SWAP IN CHILE */}
        <div className="bg-[#0f0f0f] border border-white/10 rounded-3xl p-6 shadow-xl flex flex-col justify-between text-white" id="dashboard_trends">
          <div>
            <span className="text-xs font-bold text-red-500 uppercase tracking-wider flex items-center gap-1 font-sans">
              <BadgePercent className="w-4 h-4" /> TENDENCIAS CHILE 2026
            </span>
            <h2 className="text-xl font-sans font-black uppercase italic tracking-tight text-white mt-1">
              Autos Más Pedidos para Permuta
            </h2>
            <p className="text-xs text-white/50 mt-1 mb-4">
              Estos son los modelos con mayor ratio de deslizamiento y likes activos en el país.
            </p>

            <div className="space-y-3">
              {ChileanMarketInsights.map((insight, idx) => (
                <div key={idx} className="flex justify-between items-center p-2.5 rounded-xl hover:bg-white/5 transition-all text-xs border border-transparent hover:border-white/5" id={`trend_item_${idx}`}>
                  <div>
                    <h5 className="font-bold text-white">{insight.brand}</h5>
                    <p className="text-[10px] text-white/40">{insight.category}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-white/90">{insight.demand} de Interés</span>
                    <span className="text-[10px] text-green-400 font-bold block">{insight.trend} esta sem.</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 🔊 ENGINE SOUND CUSTOMIZER PANEL */}
      <div className="bg-[#0f0f0f] border border-white/10 rounded-3xl p-6 shadow-xl text-white space-y-4" id="dashboard_engine_sound_settings">
        <div className="flex items-center gap-3">
          <div className="bg-red-600/10 text-red-500 p-2.5 rounded-2xl border border-red-500/20">
            <Volume2 className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-red-400">PERSONALIZACIÓN DE AUDIO</span>
            <h3 className="font-sans font-black uppercase italic tracking-tight text-white text-lg">
              Sonido de Motor (Notificaciones & Arranque)
            </h3>
            <p className="text-xs text-white/50">
              Personaliza el tipo de motor que ruge en tus AutoMatches, alertas de radar e inicios de sesión.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: 'v8', name: 'V8 Clásico 🇺🇸', desc: 'Rumble de gran cilindrada', spec: 'Profundo y ronco' },
            { id: 'sport', name: 'Sport Turbo 🇯🇵', desc: 'Respuesta ágil de turbocompresor', spec: 'Silbido y soplido' },
            { id: 'rally', name: 'Rally Pro 🇪🇺', desc: 'Corte de inyección secuencial', spec: 'Explosivo y rápido' },
            { id: 'f1', name: 'F1 V10 🏎️', desc: 'Altas revoluciones de circuito', spec: 'Grito agudo' },
          ].map((motor) => (
            <button
              key={motor.id}
              onClick={() => {
                setDashboardEngineSound(motor.id as EngineType);
                localStorage.setItem('automatch_engine_sound', motor.id);
                playEngineSound(motor.id as EngineType);
              }}
              className={`p-4 rounded-2xl border text-left transition-all duration-300 group cursor-pointer ${
                dashboardEngineSound === motor.id
                  ? 'bg-red-600/10 border-red-500 shadow-lg shadow-red-950/40'
                  : 'bg-white/[0.02] border-white/5 hover:border-white/15'
              }`}
              type="button"
              id={`db_select_sound_${motor.id}`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-black block uppercase ${
                  dashboardEngineSound === motor.id ? 'text-red-400' : 'text-white/80'
                }`}>
                  {motor.name}
                </span>
                <Zap className={`w-3.5 h-3.5 transition-transform ${
                  dashboardEngineSound === motor.id ? 'text-red-400 scale-110' : 'text-white/25 group-hover:scale-110'
                }`} />
              </div>
              <p className="text-[10px] text-white/50 mt-1 leading-snug">
                {motor.desc}
              </p>
              <span className="text-[8px] bg-white/5 text-white/40 px-1.5 py-0.5 rounded-md mt-2 inline-block font-mono">
                {motor.spec}
              </span>
            </button>
          ))}
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={() => playEngineSound(dashboardEngineSound)}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25 transition-all py-3.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 text-white cursor-pointer"
            type="button"
            id="dashboard_test_engine_sound_btn"
          >
            <Key className="w-4 h-4 text-red-500 animate-[spin_4s_linear_infinite]" />
            Encender Motor de Prueba (Ignición 🔑🔊)
          </button>
        </div>
      </div>

      {/* SELLING TIPS & SECURITY INFO BANNER */}
      <div className="bg-[#0f0f0f] border border-white/10 rounded-3xl p-6 shadow-xl text-white" id="dashboard_tips">
        <h3 className="font-sans font-black uppercase italic tracking-tight text-white text-lg mb-4 flex items-center gap-1.5">
          <FileCheck className="w-5 h-5 text-red-500" />
          Guía AutoMatch para vender o permutar con éxito en Chile
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SellingTips.map((tip) => (
            <div key={tip.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex gap-3 items-start" id={`tip_box_${tip.id}`}>
              <div className="bg-red-600/15 text-red-400 w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                {tip.id}
              </div>
              <p className="text-xs text-white/70 leading-relaxed">
                {tip.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* COMPLIANCE & PRIVACY COMPONENT FOOTER */}
      <div className="bg-[#0c0c0c] border border-white/5 rounded-3xl p-6 shadow-md text-center text-white/40 space-y-3" id="dashboard_compliance_section">
        <div className="flex flex-col items-center gap-1.5">
          <ShieldCheck className="w-5 h-5 text-green-500 animate-pulse" />
          <h4 className="text-xs font-bold uppercase text-white/80">Tu Privacidad está Garantizada</h4>
          <p className="text-[11px] text-white/50 max-w-lg leading-relaxed">
            AutoMatch Chile cumple con la Ley 19.628 de Protección de Datos Personales. Tus datos de contacto nunca se divulgan a menos que ocurra un AutoMatch recíproco.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-1">
          <button
            onClick={() => onOpenPrivacy?.('terms')}
            className="text-[11px] text-red-500 hover:text-red-400 font-bold hover:underline cursor-pointer transition-all"
            type="button"
            id="db_terms_link_btn"
          >
            Términos y Condiciones
          </button>
          <span className="text-white/20">•</span>
          <button
            onClick={() => onOpenPrivacy?.('privacy')}
            className="text-[11px] text-red-500 hover:text-red-400 font-bold hover:underline cursor-pointer transition-all"
            type="button"
            id="db_privacy_link_btn"
          >
            Política de Privacidad
          </button>
          <span className="text-white/20">•</span>
          <button
            onClick={() => onOpenPrivacy?.('disclosure')}
            className="text-[11px] text-red-500 hover:text-red-400 font-bold hover:underline cursor-pointer transition-all"
            type="button"
            id="db_disclosure_link_btn"
          >
            Declaración de Transparencia de Datos
          </button>
        </div>
      </div>

    </div>
  );
}
