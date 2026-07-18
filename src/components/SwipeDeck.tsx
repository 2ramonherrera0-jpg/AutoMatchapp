import React, { useState, useEffect } from 'react';
import { Car } from '../types';
import CarCard from './CarCard';
import { CHILEAN_REGIONS, POPULAR_BRANDS } from '../mockData';
import { 
  RefreshCw, 
  Sparkles, 
  MapPin, 
  Search, 
  SlidersHorizontal, 
  CheckCheck,
  Flame,
  Users,
  Coins,
  Compass,
  Briefcase,
  Ban,
  Gauge,
  Key
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SwipeDeckProps {
  cars: Car[];
  onSwipeLeft: (car: Car) => void;
  onSwipeRight: (car: Car) => void;
  onSwipeUp: (car: Car) => void;
  onReset: () => void;
  onBoost: () => void;
  isBoosted: boolean;
}

export default function SwipeDeck({ cars, onSwipeLeft, onSwipeRight, onSwipeUp, onReset, onBoost, isBoosted }: SwipeDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filterRegion, setFilterRegion] = useState<string>('Todos');
  const [filterType, setFilterType] = useState<string>('Todos'); // Todos, Permuta, Solo Venta
  const [filterPrice, setFilterPrice] = useState<string>('Todos'); // Todos, Bajo10M, 10M-18M, Sobre18M, Personalizado
  const [filterLifestyle, setFilterLifestyle] = useState<string>('Todos'); // Todos, Deportivo, Familiar, Económico, Aventura 4x4, Trabajo
  const [customMinPrice, setCustomMinPrice] = useState<string>('');
  const [customMaxPrice, setCustomMaxPrice] = useState<string>('');

  // Brand, Model and Year Filters
  const [filterBrand, setFilterBrand] = useState<string>('Todos');
  const [filterModel, setFilterModel] = useState<string>('Todos');
  const [filterMinYear, setFilterMinYear] = useState<string>('Todos');
  const [filterMaxYear, setFilterMaxYear] = useState<string>('Todos');

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterBrand(e.target.value);
    setFilterModel('Todos');
  };

  const uniqueBrands = Array.from(new Set([
    ...cars.map(c => c.brand),
    ...POPULAR_BRANDS.map(b => b.name)
  ])).sort();

  const availableModels = (() => {
    if (filterBrand === 'Todos') {
      return Array.from(new Set([
        ...cars.map(c => c.model),
        ...POPULAR_BRANDS.flatMap(b => b.models)
      ])).sort();
    } else {
      const brandObj = POPULAR_BRANDS.find(b => b.name.toLowerCase() === filterBrand.toLowerCase());
      const mockModels = brandObj ? brandObj.models : [];
      const activeModels = cars
        .filter(c => c.brand.toLowerCase() === filterBrand.toLowerCase())
        .map(c => c.model);
      return Array.from(new Set([...activeModels, ...mockModels])).sort();
    }
  })();

  const uniqueYears = Array.from(new Set([
    ...cars.map(c => c.year),
    ...Array.from({ length: 15 }, (_, i) => 2012 + i)
  ])).sort((a, b) => b - a);

  const formatCLP = (val: string) => {
    const clean = val.replace(/\D/g, '');
    if (!clean) return '';
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(parseInt(clean, 10));
  };

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setCustomMinPrice(value);
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setCustomMaxPrice(value);
  };

  // Sync index when cars change or filters are reset
  useEffect(() => {
    setCurrentIndex(0);
  }, [
    filterRegion, 
    filterType, 
    filterPrice, 
    filterLifestyle, 
    customMinPrice, 
    customMaxPrice,
    filterBrand,
    filterModel,
    filterMinYear,
    filterMaxYear
  ]);

  // Filtered cars
  const filteredCars = cars.filter(car => {
    const regionMatch = filterRegion === 'Todos' || (() => {
      const locLower = car.location.toLowerCase();
      const filterLower = filterRegion.toLowerCase();
      if (filterRegion === 'RM') {
        return locLower.includes('rm') || locLower.includes('metropolitana');
      }
      const coreName = filterLower
        .replace('región de ', '')
        .replace('región del ', '')
        .replace('región ', '');
      return locLower.includes(filterLower) || locLower.includes(coreName);
    })();
    const typeMatch = filterType === 'Todos' || 
                      (filterType === 'Permuta' && car.permuta) ||
                      (filterType === 'Venta' && !car.permuta);
    const lifestyleMatch = filterLifestyle === 'Todos' || car.lifestyle === filterLifestyle;
    
    // Brand & Model matching
    const brandMatch = filterBrand === 'Todos' || car.brand.toLowerCase() === filterBrand.toLowerCase();
    const modelMatch = filterModel === 'Todos' || 
                       car.model.toLowerCase() === filterModel.toLowerCase() ||
                       car.model.toLowerCase().includes(filterModel.toLowerCase()) ||
                       filterModel.toLowerCase().includes(car.model.toLowerCase());

    // Year matching
    const minYearMatch = filterMinYear === 'Todos' || car.year >= parseInt(filterMinYear, 10);
    const maxYearMatch = filterMaxYear === 'Todos' || car.year <= parseInt(filterMaxYear, 10);

    let priceMatch = true;
    if (filterPrice === 'Bajo10M') {
      priceMatch = car.price < 10000000;
    } else if (filterPrice === '10M-18M') {
      priceMatch = car.price >= 10000000 && car.price <= 18000000;
    } else if (filterPrice === 'Sobre18M') {
      priceMatch = car.price > 18000000;
    } else if (filterPrice === 'Personalizado') {
      const minNum = customMinPrice ? parseInt(customMinPrice, 10) : 0;
      const maxNum = customMaxPrice ? parseInt(customMaxPrice, 10) : Infinity;
      priceMatch = car.price >= minNum && car.price <= maxNum;
    }

    return regionMatch && typeMatch && priceMatch && lifestyleMatch && brandMatch && modelMatch && minYearMatch && maxYearMatch;
  });

  const activeCar = filteredCars[currentIndex];

  const playEngineFailedStartSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();

      const now = ctx.currentTime;

      // Starter motor high-pitched whine
      const starterOsc = ctx.createOscillator();
      const starterGain = ctx.createGain();
      starterOsc.type = 'sine';
      starterOsc.frequency.setValueAtTime(220, now);
      // Starter motor pitch whines down as battery or torque drops
      starterOsc.frequency.exponentialRampToValueAtTime(130, now + 0.85);
      
      starterGain.gain.setValueAtTime(0.05, now);
      starterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);

      // Low-pitched engine compression strokes (chug-chug-chug)
      const engineOsc = ctx.createOscillator();
      const engineFilter = ctx.createBiquadFilter();
      const engineGain = ctx.createGain();

      engineOsc.type = 'sawtooth';
      engineOsc.frequency.setValueAtTime(65, now);
      
      engineFilter.type = 'lowpass';
      engineFilter.frequency.setValueAtTime(220, now);
      engineFilter.Q.setValueAtTime(4, now);

      // Cranking pulses
      engineGain.gain.setValueAtTime(0, now);
      
      const pulseTimes = [0.0, 0.18, 0.36, 0.54, 0.72];
      pulseTimes.forEach((time) => {
        const t = now + time;
        engineGain.gain.linearRampToValueAtTime(0.28, t + 0.05);
        engineGain.gain.exponentialRampToValueAtTime(0.02, t + 0.14);
        
        // Pitch variation per stroke
        engineOsc.frequency.setValueAtTime(60, t);
        engineOsc.frequency.linearRampToValueAtTime(80, t + 0.05);
        engineOsc.frequency.linearRampToValueAtTime(45, t + 0.14);
      });

      // Final failure and spin down (sigh / dying spin)
      const endT = now + 0.85;
      engineGain.gain.setValueAtTime(0.02, endT);
      engineGain.gain.exponentialRampToValueAtTime(0.0001, endT + 0.25);
      engineOsc.frequency.exponentialRampToValueAtTime(15, endT + 0.25);

      // Connect modules
      starterOsc.connect(starterGain);
      starterGain.connect(ctx.destination);

      engineOsc.connect(engineFilter);
      engineFilter.connect(engineGain);
      engineGain.connect(ctx.destination);

      starterOsc.start(now);
      engineOsc.start(now);

      starterOsc.stop(now + 1.2);
      engineOsc.stop(now + 1.2);
    } catch (e) {
      console.warn("Failed to synthesize engine start failure sound:", e);
    }
  };

  const handleSwipe = (direction: 'left' | 'right' | 'up') => {
    if (!activeCar) return;

    if (direction === 'left') {
      playEngineFailedStartSound();
      onSwipeLeft(activeCar);
    } else if (direction === 'right') {
      onSwipeRight(activeCar);
    } else if (direction === 'up') {
      onSwipeUp(activeCar);
    }

    setCurrentIndex(prev => prev + 1);
  };

  // Keyboard navigation for power users
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeCar) return;
      if (e.key === 'ArrowLeft') {
        handleSwipe('left');
      } else if (e.key === 'ArrowRight') {
        handleSwipe('right');
      } else if (e.key === 'ArrowUp') {
        handleSwipe('up');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, filteredCars]);

  return (
    <div className="flex flex-col h-full max-w-md w-full mx-auto p-3" id="swipe_deck_container">
      {/* Filtering Header Toolbar */}
      <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-3.5 mb-4 shadow-xl" id="filter_toolbar">
        <div className="flex items-center gap-1.5 text-white font-sans font-black uppercase italic tracking-wider mb-2.5">
          <SlidersHorizontal className="w-4 h-4 text-red-500" />
          Filtros de Búsqueda (Chile)
        </div>
        <div className="grid grid-cols-2 gap-2">
          {/* Region filter */}
          <div>
            <select
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
              className="w-full bg-[#141414] border border-white/10 text-xs font-bold text-white/80 rounded-xl py-2.5 px-3 focus:outline-hidden focus:border-red-500 transition-all cursor-pointer"
              id="filter_region_select"
            >
              <option value="Todos" className="bg-zinc-950">Todas las Regiones 🇨🇱</option>
              {CHILEAN_REGIONS.map((r) => {
                const value = r.name === "Región Metropolitana" ? "RM" : r.name;
                return (
                  <option key={r.name} value={value} className="bg-zinc-950">
                    {r.name === "Región Metropolitana" ? "Metropolitana (RM)" : r.name}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Business type filter */}
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full bg-[#141414] border border-white/10 text-xs font-bold text-white/80 rounded-xl py-2.5 px-3 focus:outline-hidden focus:border-red-500 transition-all cursor-pointer"
              id="filter_type_select"
            >
              <option value="Todos" className="bg-zinc-950">Cualquier Oferta</option>
              <option value="Permuta" className="bg-zinc-950">Acepta Permutas 🔄</option>
              <option value="Venta" className="bg-zinc-950">Solo Venta 💵</option>
            </select>
          </div>
        </div>

        {/* 🚗 Marca, Modelo y Año Filters */}
        <div className="grid grid-cols-2 gap-2 mt-2">
          {/* Brand select */}
          <div>
            <select
              value={filterBrand}
              onChange={handleBrandChange}
              className="w-full bg-[#141414] border border-white/10 text-xs font-bold text-white/80 rounded-xl py-2.5 px-3 focus:outline-hidden focus:border-red-500 transition-all cursor-pointer"
              id="filter_brand_select"
            >
              <option value="Todos" className="bg-zinc-950">Todas las Marcas 🌎</option>
              {uniqueBrands.map((brand) => (
                <option key={brand} value={brand} className="bg-zinc-950">
                  {brand}
                </option>
              ))}
            </select>
          </div>

          {/* Model select */}
          <div>
            <select
              value={filterModel}
              onChange={(e) => setFilterModel(e.target.value)}
              className="w-full bg-[#141414] border border-white/10 text-xs font-bold text-white/80 rounded-xl py-2.5 px-3 focus:outline-hidden focus:border-red-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              id="filter_model_select"
              disabled={filterBrand === 'Todos'}
            >
              <option value="Todos" className="bg-zinc-950">
                {filterBrand === 'Todos' ? 'Cualquier Modelo 🚗' : 'Todos los Modelos 🚗'}
              </option>
              {availableModels.map((model) => (
                <option key={model} value={model} className="bg-zinc-950">
                  {model}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-2">
          {/* Min Year select */}
          <div>
            <select
              value={filterMinYear}
              onChange={(e) => setFilterMinYear(e.target.value)}
              className="w-full bg-[#141414] border border-white/10 text-xs font-bold text-white/80 rounded-xl py-2.5 px-3 focus:outline-hidden focus:border-red-500 transition-all cursor-pointer"
              id="filter_min_year_select"
            >
              <option value="Todos" className="bg-zinc-950">Año Desde (Mín) 📅</option>
              {uniqueYears.map((year) => (
                <option key={`min_${year}`} value={year} className="bg-zinc-950">
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Max Year select */}
          <div>
            <select
              value={filterMaxYear}
              onChange={(e) => setFilterMaxYear(e.target.value)}
              className="w-full bg-[#141414] border border-white/10 text-xs font-bold text-white/80 rounded-xl py-2.5 px-3 focus:outline-hidden focus:border-red-500 transition-all cursor-pointer"
              id="filter_max_year_select"
            >
              <option value="Todos" className="bg-zinc-950">Año Hasta (Máx) 📅</option>
              {uniqueYears.map((year) => (
                <option key={`max_${year}`} value={year} className="bg-zinc-950">
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Price range filter toggle group */}
        <div className="border-t border-white/5 pt-3 mt-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider">
              Rango de Presupuesto
            </span>
            <span className="text-[10px] font-mono text-red-400 font-bold">
              {filterPrice === 'Todos' 
                ? 'Cualquier precio' 
                : filterPrice === 'Bajo10M' 
                  ? 'Bajo $10M' 
                  : filterPrice === '10M-18M' 
                    ? '$10M - $18M' 
                    : filterPrice === 'Sobre18M' 
                      ? 'Sobre $18M' 
                      : (customMinPrice || customMaxPrice) 
                        ? `${customMinPrice ? formatCLP(customMinPrice) : '$0'} - ${customMaxPrice ? formatCLP(customMaxPrice) : 'Máx'}`
                        : 'Escribe tu rango'}
            </span>
          </div>
          <div className="grid grid-cols-5 gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
            {[
              { id: 'Todos', label: 'Todos' },
              { id: 'Bajo10M', label: '< 10M' },
              { id: '10M-18M', label: '10M-18M' },
              { id: 'Sobre18M', label: '> 18M' },
              { id: 'Personalizado', label: 'Escribir ✍️' }
            ].map(tier => (
              <button
                key={tier.id}
                onClick={() => setFilterPrice(tier.id)}
                className={`py-1.5 text-[9px] font-bold rounded-lg transition-all cursor-pointer text-center ${
                  filterPrice === tier.id
                    ? 'bg-red-600 text-white shadow-md font-extrabold'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
                id={`price_filter_${tier.id}`}
              >
                {tier.label}
              </button>
            ))}
          </div>

          {/* Custom Price inputs when Personalizado is selected */}
          <AnimatePresence>
            {filterPrice === 'Personalizado' && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="bg-black/60 p-3 rounded-xl border border-white/5 space-y-2 overflow-hidden"
                id="custom_price_range_inputs"
              >
                <div className="text-[10px] text-white/40 uppercase font-bold tracking-wider mb-0.5">
                  Escribe tu rango personalizado (CLP):
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="text-[9px] text-white/50 block mb-0.5">Mínimo ($)</label>
                    <input
                      type="text"
                      value={customMinPrice ? formatCLP(customMinPrice) : ''}
                      onChange={handleMinPriceChange}
                      placeholder="Ej: 5.000.000"
                      className="w-full bg-[#141414] border border-white/10 text-xs font-bold text-white rounded-lg py-1.5 px-2 focus:outline-hidden focus:border-red-500 transition-all font-mono"
                      id="custom_min_price"
                    />
                  </div>
                  <div className="text-white/30 text-xs self-end mb-2">a</div>
                  <div className="flex-1">
                    <label className="text-[9px] text-white/50 block mb-0.5">Máximo ($)</label>
                    <input
                      type="text"
                      value={customMaxPrice ? formatCLP(customMaxPrice) : ''}
                      onChange={handleMaxPriceChange}
                      placeholder="Ej: 15.000.000"
                      className="w-full bg-[#141414] border border-white/10 text-xs font-bold text-white rounded-lg py-1.5 px-2 focus:outline-hidden focus:border-red-500 transition-all font-mono"
                      id="custom_max_price"
                    />
                  </div>
                </div>
                {(customMinPrice || customMaxPrice) && (
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setCustomMinPrice('');
                        setCustomMaxPrice('');
                      }}
                      className="text-[9px] text-red-400 hover:text-red-300 font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Limpiar rango ×
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 🚗 ESTILOS DE VIDA TABS CAROUSEL */}
        <div className="border-t border-white/5 pt-3 mt-3">
          <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider block mb-2 text-left">
            Estilo de Vida (Categoría de Auto)
          </span>
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {[
              { id: 'Todos', label: 'Todos', icon: Sparkles },
              { id: 'Deportivo', label: 'Deportivo', icon: Flame, color: 'text-orange-500' },
              { id: 'Familiar', label: 'Familiar', icon: Users, color: 'text-blue-400' },
              { id: 'Económico', label: 'Económico', icon: Coins, color: 'text-emerald-400' },
              { id: 'Aventura 4x4', label: 'Aventura 4x4', icon: Compass, color: 'text-red-400' },
              { id: 'Trabajo', label: 'Trabajo', icon: Briefcase, color: 'text-amber-500' }
            ].map(lifestyle => {
              const Icon = lifestyle.icon;
              const isActive = filterLifestyle === lifestyle.id;
              return (
                <button
                  key={lifestyle.id}
                  onClick={() => setFilterLifestyle(lifestyle.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold border transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-red-600 border-red-500 text-white shadow-md shadow-red-950/45 scale-105 animate-[pulse_2.5s_infinite]'
                      : 'bg-white/[0.02] border-white/5 text-white/70 hover:text-white hover:border-white/10 hover:bg-white/5'
                  }`}
                  id={`lifestyle_filter_${lifestyle.id}`}
                  type="button"
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : lifestyle.color || 'text-white/40'}`} />
                  {lifestyle.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Swipe Deck Stage Area */}
      <div className="flex-1 relative aspect-[3/4] max-h-[500px] mb-4" id="deck_stage">
        {currentIndex < filteredCars.length ? (
          <div className="absolute inset-0">
            {filteredCars
              .slice(currentIndex, currentIndex + 3)
              .reverse()
              .map((car, idx, arr) => {
                const isTop = idx === arr.length - 1;
                return (
                  <CarCard
                    key={car.id}
                    car={car}
                    index={arr.length - 1 - idx}
                    active={isTop}
                    onSwipeLeft={() => handleSwipe('left')}
                    onSwipeRight={() => handleSwipe('right')}
                    onSwipeUp={() => handleSwipe('up')}
                  />
                );
              })}
          </div>
        ) : (
          /* EMPTY STATE */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 bg-[#141414] border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-2xl"
            id="empty_deck_card"
          >
            <div className="w-16 h-16 bg-red-600/10 text-red-500 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-sans font-black uppercase italic tracking-tight text-white">
              ¡Se agotaron los autos!
            </h3>
            <p className="text-xs text-white/60 mt-2 max-w-xs leading-relaxed">
              No quedan más ofertas de autos en <strong className="text-red-400 font-semibold">{filterRegion === 'Todos' ? 'Chile' : filterRegion}</strong> con filtro <strong className="text-red-400 font-semibold">{filterType === 'Todos' ? 'Cualquiera' : filterType}</strong>{filterPrice !== 'Todos' && <> y presupuesto <strong className="text-red-400 font-semibold">{filterPrice === 'Bajo10M' ? 'Bajo $10M' : filterPrice === '10M-18M' ? '$10M-$18M' : 'Sobre $18M'}</strong></>}.
            </p>

            <div className="mt-6 flex flex-col gap-2.5 w-full max-w-xs">
              <button
                onClick={() => {
                  setFilterRegion('Todos');
                  setFilterType('Todos');
                  setFilterPrice('Todos');
                  setFilterLifestyle('Todos');
                  setFilterBrand('Todos');
                  setFilterModel('Todos');
                  setFilterMinYear('Todos');
                  setFilterMaxYear('Todos');
                  setCustomMinPrice('');
                  setCustomMaxPrice('');
                  onReset();
                  setCurrentIndex(0);
                }}
                className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold py-3 px-4 rounded-xl transition-all cursor-pointer"
                id="reset_deck_btn"
              >
                Limpiar Filtros y Reiniciar Mazo
              </button>

              <button
                onClick={onBoost}
                disabled={isBoosted}
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isBoosted
                    ? 'bg-green-600/10 text-green-400 border border-green-500/20'
                    : 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20'
                }`}
                id="boost_deck_btn"
              >
                {isBoosted ? (
                  <>
                    <CheckCheck className="w-4 h-4" />
                    ¡Auto Destacado Activo!
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Destacar mi Auto en Chile (Boost)
                  </>
                )}
              </button>
            </div>

            {/* Simulated match booster tip */}
            <div className="mt-6 bg-black/40 border border-white/5 p-3 rounded-xl text-left">
              <span className="text-[9px] font-mono uppercase text-red-400 font-bold block mb-1">💡 TIP AUTOMATCH</span>
              <p className="text-[10px] text-white/50 leading-relaxed">
                Los clientes que usan "Destacar Auto" reciben hasta un <strong className="text-white font-bold">300% más visitas</strong> y matches garantizados en Santiago, Viña y Concepción.
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Deslizar Control Buttons (Active card) */}
      {currentIndex < filteredCars.length && (
        <div className="flex items-center justify-center gap-4.5 mt-2" id="action_buttons_container">
          {/* Skip button */}
          <button
            onClick={() => handleSwipe('left')}
            className="w-14 h-14 bg-zinc-900 border border-white/10 rounded-full flex items-center justify-center text-red-500 hover:bg-zinc-800 hover:border-white/20 active:scale-90 transition-all cursor-pointer shadow-xl"
            title="Frenar (Dislike)"
            id="swipe_left_control_btn"
          >
            <Ban className="w-6 h-6 stroke-[2.5]" />
          </button>

          {/* Super Permuta / Match button */}
          <button
            onClick={() => handleSwipe('up')}
            className="w-12 h-12 bg-zinc-900 border border-white/10 rounded-full flex items-center justify-center text-blue-400 hover:bg-zinc-800 hover:border-white/20 active:scale-90 transition-all cursor-pointer shadow-md"
            title="Super Permuta / Intercambio!"
            id="swipe_up_control_btn"
          >
            <RefreshCw className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Like button */}
          <button
            onClick={() => handleSwipe('right')}
            className="w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center active:scale-90 transition-all cursor-pointer shadow-lg shadow-red-600/35"
            title="Acelerar (Like)"
            id="swipe_right_control_btn"
          >
            <Gauge className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>
      )}

      {/* Keyboard hotkey instructions banner */}
      {currentIndex < filteredCars.length && (
        <p className="text-center text-[9px] uppercase tracking-wider text-white/40 mt-4.5 bg-white/5 border border-white/10 py-1.5 px-3 rounded-full font-mono max-w-xs mx-auto">
          ⌨️ <strong className="text-red-400 font-semibold">Flechas:</strong> Izq = Frenar 🚫 • Der = Acelerar 🏎️ • Arriba = Súper Permuta 🔄
        </p>
      )}
    </div>
  );
}
