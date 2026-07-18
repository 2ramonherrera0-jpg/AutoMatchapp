import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  ZoomIn, 
  ZoomOut, 
  Layers, 
  Eye, 
  Car as CarIcon, 
  Bus, 
  Footprints, 
  Compass, 
  Info, 
  Sparkles,
  Map as MapIcon,
  X,
  Gauge
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VehicleMapProps {
  location: string;
  brand: string;
  model: string;
}

// Map coordinate lookups and distance details for Chilean regions
interface LocationMeta {
  commune: string;
  region: string;
  lat: number;
  lng: number;
  distanceKm: number; // Simulated from Santiago Centro
  driveTime: string;
  transitTime: string;
  walkTime: string;
  tollCost: string;
  streetViewUrl: string;
  description: string;
}

const REGION_METADATA: Record<string, LocationMeta> = {
  'default': {
    commune: 'Santiago Centro',
    region: 'RM',
    lat: -33.4489,
    lng: -70.6693,
    distanceKm: 5.2,
    driveTime: '12 min',
    transitTime: '24 min',
    walkTime: '1 h 10 min',
    tollCost: 'Sin peajes (Autopista Central TAG)',
    streetViewUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600',
    description: 'Sector residencial céntrico, excelente conectividad vial y estaciones de Metro cercanas.',
  },
  'santiago': {
    commune: 'Las Condes',
    region: 'RM',
    lat: -33.4121,
    lng: -70.5666,
    distanceKm: 12.8,
    driveTime: '22 min',
    transitTime: '45 min',
    walkTime: '2 h 40 min',
    tollCost: 'TAG Urbano Costanera Norte',
    streetViewUrl: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=600',
    description: 'Zona de alta seguridad y conectividad cerca de autopista Costanera Norte.',
  },
  'las condes': {
    commune: 'Las Condes',
    region: 'RM',
    lat: -33.4121,
    lng: -70.5666,
    distanceKm: 12.8,
    driveTime: '22 min',
    transitTime: '45 min',
    walkTime: '2 h 40 min',
    tollCost: 'TAG Urbano Costanera Norte',
    streetViewUrl: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=600',
    description: 'Zona de alta seguridad y conectividad cerca de autopista Costanera Norte.',
  },
  'providencia': {
    commune: 'Providencia',
    region: 'RM',
    lat: -33.4312,
    lng: -70.6122,
    distanceKm: 6.4,
    driveTime: '15 min',
    transitTime: '28 min',
    walkTime: '1 h 25 min',
    tollCost: 'Sin peajes urbanos obligatorios',
    streetViewUrl: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=600',
    description: 'Barrio residencial/comercial consolidado, plazas y cafés ideales para revisar el vehículo.',
  },
  'maipú': {
    commune: 'Maipú',
    region: 'RM',
    lat: -33.5110,
    lng: -70.7523,
    distanceKm: 18.2,
    driveTime: '30 min',
    transitTime: '55 min',
    walkTime: '3 h 50 min',
    tollCost: 'Vespucio Sur Express TAG',
    streetViewUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600',
    description: 'Sector residencial del poniente de Santiago, amplio espacio para prueba de conducción.',
  },
  'la florida': {
    commune: 'La Florida',
    region: 'RM',
    lat: -33.5224,
    lng: -70.5982,
    distanceKm: 16.5,
    driveTime: '28 min',
    transitTime: '50 min',
    walkTime: '3 h 30 min',
    tollCost: 'Acceso Sur / Vespucio Sur',
    streetViewUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=600',
    description: 'Cercano a centros comerciales, avenidas principales expeditas para chequear amortiguadores.',
  },
  'viña del mar': {
    commune: 'Viña del Mar',
    region: 'Valparaíso',
    lat: -33.0245,
    lng: -71.5518,
    distanceKm: 121.4,
    driveTime: '1 h 20 min',
    transitTime: '2 h 10 min (Bus)',
    walkTime: '24 h',
    tollCost: '$2.500 CLP (Ruta 68 - Lo Prado y Zapata)',
    streetViewUrl: 'https://images.unsplash.com/photo-14921435146c1-e58153a9f4a1?auto=format&fit=crop&q=80&w=600',
    description: 'Sector costero de la V Región. Vehículo acostumbrado a brisa marina, con mantenciones al día.',
  },
  'valparaíso': {
    commune: 'Valparaíso',
    region: 'Valparaíso',
    lat: -33.0472,
    lng: -71.6127,
    distanceKm: 119.8,
    driveTime: '1 h 25 min',
    transitTime: '2 h 15 min (Bus)',
    walkTime: '23 h',
    tollCost: '$2.500 CLP (Ruta 68)',
    streetViewUrl: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&q=80&w=600',
    description: 'Cerros pintorescos y planos portuarios. Test de embrague superado con creces en pendientes.',
  },
  'concepción': {
    commune: 'Concepción',
    region: 'Biobío',
    lat: -36.8201,
    lng: -73.0444,
    distanceKm: 504.1,
    driveTime: '5 h 10 min',
    transitTime: '6 h 30 min (Bus/Tren)',
    walkTime: '99 h',
    tollCost: '$14.200 CLP (Ruta 5 Sur - Peajes Troncales)',
    streetViewUrl: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&q=80&w=600',
    description: 'Octava Región del Biobío. Clima lluvioso, carrocería tratada anticorrosión de fábrica.',
  },
  'coquimbo': {
    commune: 'Coquimbo',
    region: 'Coquimbo',
    lat: -29.9533,
    lng: -71.3436,
    distanceKm: 461.5,
    driveTime: '4 h 45 min',
    transitTime: '6 h 00 min (Bus)',
    walkTime: '90 h',
    tollCost: '$11.800 CLP (Ruta 5 Norte - Peajes del Elqui)',
    streetViewUrl: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=600',
    description: 'Norte Chico. Sin humedad extrema, libre de óxido y expuesto a clima templado y seco.',
  },
  'la serena': {
    commune: 'La Serena',
    region: 'Coquimbo',
    lat: -29.9027,
    lng: -71.2520,
    distanceKm: 472.0,
    driveTime: '4 h 50 min',
    transitTime: '6 h 10 min (Bus)',
    walkTime: '92 h',
    tollCost: '$11.800 CLP (Ruta 5 Norte)',
    streetViewUrl: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=600',
    description: 'Ciudad costera de avenidas amplias y autopistas expeditas con excelente mantención vial.',
  },
  'puerto montt': {
    commune: 'Puerto Montt',
    region: 'Los Lagos',
    lat: -41.4689,
    lng: -72.9411,
    distanceKm: 1016.2,
    driveTime: '10 h 15 min',
    transitTime: '12 h 30 min (Bus/Vuelo)',
    walkTime: '200 h',
    tollCost: '$21.500 CLP (Ruta 5 Sur - Peajes Multipunto)',
    streetViewUrl: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&q=80&w=600',
    description: 'Sur de Chile, Región de Los Lagos. Tracción y neumáticos óptimos para climas fríos y asfalto mojado.',
  }
};

export default function VehicleMap({ location, brand, model }: VehicleMapProps) {
  // Find match or default to RM Centro
  const normalizedKey = location.toLowerCase();
  let matchedMeta = REGION_METADATA['default'];

  for (const [key, meta] of Object.entries(REGION_METADATA)) {
    if (normalizedKey.includes(key)) {
      matchedMeta = meta;
      break;
    }
  }

  // Interactive Map States
  const [mapType, setMapType] = useState<'map' | 'satellite' | 'terrain'>('map');
  const [zoomLevel, setZoomLevel] = useState<number>(14); // 12 (wide) to 17 (close)
  const [showTraffic, setShowTraffic] = useState<boolean>(true);
  const [showStreetView, setShowStreetView] = useState<boolean>(false);
  const [activeCommuteMode, setActiveCommuteMode] = useState<'drive' | 'transit' | 'walk'>('drive');
  const [isMeasuring, setIsMeasuring] = useState<boolean>(false);
  const [userCenterLocation, setUserCenterLocation] = useState<string>('Santiago Centro (RM)');
  
  // Simulated drag pan offset
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (showStreetView) return; // Disable pan in street view
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(17, prev + 1));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(11, prev - 1));
  };

  const resetMap = () => {
    setPanOffset({ x: 0, y: 0 });
    setZoomLevel(14);
  };

  // Get current state times and descriptions based on commuter choice
  const getCommuteTime = () => {
    if (activeCommuteMode === 'drive') return matchedMeta.driveTime;
    if (activeCommuteMode === 'transit') return matchedMeta.transitTime;
    return matchedMeta.walkTime;
  };

  // Compute scale/radius of pulsing circle based on zoom level
  // Zoom 14 -> base size. Higher zoom -> larger px size to represent constant meters
  const zoomScale = Math.pow(1.5, zoomLevel - 14);

  return (
    <div className="bg-[#121212] border border-white/10 rounded-2xl overflow-hidden text-white flex flex-col shadow-xl select-none" id="simulated_google_maps_view">
      
      {/* 📍 GOOGLE MAPS BARRA DE BÚSQUEDA SUPERIOR */}
      <div className="p-3 bg-zinc-900/90 border-b border-white/5 flex items-center justify-between gap-3.5 relative z-10">
        <div className="flex items-center gap-2.5 bg-[#1a1a1a] border border-white/10 rounded-xl px-3 py-2 flex-1 shadow-inner">
          <div className="w-5 h-5 flex items-center justify-center shrink-0">
            <span className="text-red-500 font-bold text-base font-sans italic tracking-tighter">G</span>
            <span className="text-yellow-500 font-bold text-xs font-sans tracking-tight -ml-0.5">M</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase font-bold text-white/35 leading-none">Ubicación de Consulta</p>
            <input 
              type="text" 
              readOnly 
              value={`${matchedMeta.commune}, ${matchedMeta.region} • Chile`}
              className="bg-transparent text-xs text-white/90 font-semibold focus:outline-hidden w-full truncate cursor-default mt-0.5"
            />
          </div>
          <Compass className="w-4 h-4 text-white/50 animate-pulse shrink-0" />
        </div>

        <button 
          onClick={() => setIsMeasuring(!isMeasuring)}
          className={`px-3 py-2 rounded-xl text-[10px] font-mono font-bold uppercase tracking-wider transition-all border flex items-center gap-1.5 cursor-pointer ${
            isMeasuring 
              ? 'bg-red-500/20 border-red-500 text-red-400' 
              : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10'
          }`}
          title="Calcular ruta y distancias exactas"
          id="btn_measure_route"
        >
          <Navigation className={`w-3.5 h-3.5 ${isMeasuring ? 'animate-bounce' : ''}`} />
          Ruta
        </button>
      </div>

      {/* 🗺️ MAP CANVAS AREA */}
      <div 
        className={`relative h-64 bg-[#141822] cursor-grab active:cursor-grabbing overflow-hidden transition-all ${
          showStreetView ? 'cursor-default' : ''
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        id="map_viewport_canvas"
      >
        
        {/* STREET VIEW OVERLAY PREVIEW */}
        <AnimatePresence>
          {showStreetView && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 bg-black flex flex-col"
              id="street_view_container"
            >
              <img 
                src={matchedMeta.streetViewUrl} 
                alt="Vista de la Calle" 
                className="w-full h-full object-cover brightness-90 contrast-[1.05]"
                referrerPolicy="no-referrer"
              />
              
              {/* Compass orientation visual overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 p-4 flex flex-col justify-between pointer-events-none">
                <div className="flex items-center justify-between">
                  <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-left">
                    <p className="text-[9px] text-white/50 uppercase tracking-widest font-mono">Simulador Street View</p>
                    <p className="text-xs font-black text-white">{matchedMeta.commune}, {matchedMeta.region}</p>
                  </div>
                  <button 
                    onClick={() => setShowStreetView(false)}
                    className="bg-red-600 hover:bg-red-500 text-white p-2 rounded-full shadow-lg border border-red-400/20 cursor-pointer pointer-events-auto"
                    id="close_streetview_btn"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2 text-left pointer-events-auto">
                  <span className="bg-emerald-500 text-black text-[9px] font-black uppercase px-2 py-0.5 rounded-sm tracking-wider">
                    VISTA 360° SIMULADA
                  </span>
                  <p className="text-xs text-white/95 leading-relaxed bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/5">
                    Entorno típico del sector de entrega del <strong>{brand} {model}</strong>. Zona residencial tranquila para probar el arranque en frío y maniobras de estacionamiento.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 🛣️ ROADMAP GRAPHICS (Vector Grid lines simulating Google Maps roads) */}
        <div 
          className="absolute inset-0 transition-transform duration-75"
          style={{ 
            transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
            backgroundImage: mapType === 'satellite' 
              ? 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)'
              : 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: `${32 * zoomScale}px ${32 * zoomScale}px`
          }}
        >
          {/* Map background based on view selection */}
          {mapType === 'map' && (
            <div className="absolute inset-0 bg-[#0f1524]">
              {/* Grid block patterns to simulate blocks */}
              <div className="absolute inset-0 opacity-[0.15]" 
                   style={{
                     backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                     backgroundSize: `${60 * zoomScale}px ${60 * zoomScale}px`
                   }} 
              />
              
              {/* Simulated Rivers or Parks */}
              <div 
                className="absolute bg-emerald-950/20 border border-emerald-500/10 rounded-full blur-xs transition-all duration-300"
                style={{
                  top: '10%',
                  left: '20%',
                  width: `${120 * zoomScale}px`,
                  height: `${70 * zoomScale}px`,
                  transform: 'rotate(-15deg)'
                }}
              />
              <div 
                className="absolute bg-blue-950/40 border border-blue-500/10 transition-all duration-300"
                style={{
                  top: '60%',
                  left: '-10%',
                  width: '120%',
                  height: `${24 * zoomScale}px`,
                  transform: 'rotate(-5deg)'
                }}
              />
            </div>
          )}

          {mapType === 'satellite' && (
            <div className="absolute inset-0 bg-[#080d1a] overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-overlay"
                   style={{ backgroundImage: `url(${matchedMeta.streetViewUrl})` }} />
              {/* Satellite styled structures */}
              <div className="absolute border border-white/5 bg-white/[0.02]" 
                   style={{ top: '20%', left: '15%', width: `${80 * zoomScale}px`, height: `${45 * zoomScale}px` }} />
              <div className="absolute border border-white/5 bg-white/[0.02]" 
                   style={{ top: '40%', left: '55%', width: `${90 * zoomScale}px`, height: `${60 * zoomScale}px` }} />
              <div className="absolute border border-white/5 bg-white/[0.02]" 
                   style={{ top: '70%', left: '30%', width: `${60 * zoomScale}px`, height: `${40 * zoomScale}px` }} />
            </div>
          )}

          {mapType === 'terrain' && (
            <div className="absolute inset-0 bg-[#16120e]">
              {/* Topography contours simulation */}
              <div className="absolute border border-amber-900/15 rounded-full" 
                   style={{ top: '10%', left: '10%', width: `${200 * zoomScale}px`, height: `${200 * zoomScale}px` }} />
              <div className="absolute border border-amber-900/15 rounded-full" 
                   style={{ top: '15%', left: '15%', width: `${160 * zoomScale}px`, height: `${160 * zoomScale}px` }} />
              <div className="absolute border border-amber-900/15 rounded-full" 
                   style={{ top: '20%', left: '20%', width: `${120 * zoomScale}px`, height: `${120 * zoomScale}px` }} />
            </div>
          )}

          {/* 🛣️ Simulated Roads and Highways */}
          <svg className="absolute inset-0 w-[200%] h-[200%] -left-1/2 -top-1/2 pointer-events-none opacity-80" xmlns="http://www.w3.org/2000/svg">
            {/* Primary Highway */}
            <path 
              d={`M -100 ${150 + panOffset.y} Q 300 ${220 + panOffset.y} 900 ${180 + panOffset.y}`} 
              fill="none" 
              stroke="#2e374d" 
              strokeWidth={8 * zoomScale} 
            />
            <path 
              d={`M -100 ${150 + panOffset.y} Q 300 ${220 + panOffset.y} 900 ${180 + panOffset.y}`} 
              fill="none" 
              stroke="#5a6885" 
              strokeWidth={2 * zoomScale} 
            />

            {/* Diagonal secondary road */}
            <path 
              d={`M 100 -50 Q 250 250 450 550`} 
              fill="none" 
              stroke="#22293a" 
              strokeWidth={5 * zoomScale} 
            />
            <path 
              d={`M 100 -50 Q 250 250 450 550`} 
              fill="none" 
              stroke="#ffd166" 
              strokeWidth={1.5 * zoomScale} 
              strokeDasharray="4,4"
            />

            {/* 🚦 LIVE TRAFFIC OVERLAYS */}
            {showTraffic && (
              <>
                {/* Moderate Traffic Orange line overlay */}
                <path 
                  d={`M -100 ${150 + panOffset.y} Q 300 ${220 + panOffset.y} 310 ${210 + panOffset.y}`} 
                  fill="none" 
                  stroke="#f97316" 
                  strokeWidth={4 * zoomScale} 
                  opacity={0.8}
                />
                {/* Heavy Traffic Red line overlay */}
                <path 
                  d={`M 310 ${210 + panOffset.y} Q 350 ${212 + panOffset.y} 480 ${198 + panOffset.y}`} 
                  fill="none" 
                  stroke="#ef4444" 
                  strokeWidth={5 * zoomScale} 
                  opacity={0.95}
                />
                <circle cx={350} cy={212 + panOffset.y} r={3 * zoomScale} fill="#ef4444" />
                
                {/* Flowing green traffic path */}
                <path 
                  d={`M 480 ${198 + panOffset.y} Q 600 ${190 + panOffset.y} 900 ${180 + panOffset.y}`} 
                  fill="none" 
                  stroke="#10b981" 
                  strokeWidth={4 * zoomScale} 
                  opacity={0.8}
                />
              </>
            )}

            {/* ROUTE FINDER PATH (Active Blue Dash Line when measuring route) */}
            {isMeasuring && (
              <path 
                d={`M ${120 + panOffset.x} ${120 + panOffset.y} L ${250 + panOffset.x} ${250 + panOffset.y}`}
                fill="none"
                stroke="#3b82f6"
                strokeWidth={5}
                strokeLinecap="round"
                strokeDasharray="8,6"
                className="animate-[dash_2s_linear_infinite]"
              />
            )}
          </svg>

          {/* 📍 VEHICLE APPROXIMATE LOCATION PIN (Centered dynamically) */}
          <div 
            className="absolute transition-all duration-300 flex flex-col items-center justify-center pointer-events-none"
            style={{
              left: `calc(50% + ${panOffset.x}px)`,
              top: `calc(50% + ${panOffset.y}px)`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            {/* Accuracy Radius Circle overlay */}
            <div 
              className="rounded-full bg-red-500/10 border border-red-500/25 absolute animate-pulse"
              style={{
                width: `${120 * zoomScale}px`,
                height: `${120 * zoomScale}px`
              }}
            />

            {/* Custom Google Styled Map Pin */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="bg-red-600 border border-red-500 text-white rounded-full p-2 shadow-xl flex items-center justify-center relative animate-bounce" style={{ animationDuration: '2.5s' }}>
                <CarIcon className="w-4 h-4 text-white" />
                {/* Pointer tip */}
                <div className="absolute top-[90%] left-1/2 -translate-x-1/2 w-0 h-0 border-4 border-transparent border-t-red-600" />
              </div>
              
              {/* Floating location name tag */}
              <div className="mt-2.5 bg-black/95 border border-white/15 px-2.5 py-1 rounded-lg text-[9px] font-mono font-black uppercase text-red-400 tracking-wider shadow-2xl whitespace-nowrap">
                {matchedMeta.commune} (~{matchedMeta.distanceKm} km)
              </div>
            </div>
          </div>

          {/* User simulated starting point pin (RM Centro default) */}
          {isMeasuring && (
            <div 
              className="absolute flex flex-col items-center"
              style={{
                left: `calc(50% + ${panOffset.x - 120}px)`,
                top: `calc(50% + ${panOffset.y - 100}px)`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="bg-blue-600 border border-blue-500 text-white rounded-full p-2.5 shadow-xl flex items-center justify-center relative">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping absolute" />
                <MapPin className="w-4.5 h-4.5 text-white" />
                <div className="absolute top-[90%] left-1/2 -translate-x-1/2 w-0 h-0 border-4 border-transparent border-t-blue-600" />
              </div>
              <div className="mt-1.5 bg-black/90 border border-white/10 px-2 py-0.5 rounded text-[8px] font-bold text-white shadow">
                Tu ubicación
              </div>
            </div>
          )}

        </div>

        {/* ⚙️ OVERLAY CONTROL BUTTONS (Google Maps style) */}
        <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
          {/* Layers Toggle (Map, Satellite, Terrain) */}
          <div className="relative group/layer">
            <button 
              onClick={() => {
                if (mapType === 'map') setMapType('satellite');
                else if (mapType === 'satellite') setMapType('terrain');
                else setMapType('map');
              }}
              className="bg-zinc-900/95 hover:bg-zinc-800 border border-white/15 p-2 rounded-xl text-white/80 hover:text-white transition-all cursor-pointer shadow-lg"
              title="Cambiar Tipo de Mapa"
            >
              <Layers className="w-4 h-4" />
            </button>
            <div className="absolute right-full mr-2 top-0 bg-black/90 border border-white/10 p-1.5 rounded-lg text-[8px] font-bold uppercase tracking-wider hidden group-hover/layer:block whitespace-nowrap">
              {mapType === 'map' ? 'Satélite 🛰️' : mapType === 'satellite' ? 'Relieve 🏔️' : 'Mapa Clásico 🗺️'}
            </div>
          </div>

          {/* Live Traffic Toggle */}
          <button 
            onClick={() => setShowTraffic(!showTraffic)}
            className={`p-2 rounded-xl border transition-all cursor-pointer shadow-lg ${
              showTraffic 
                ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' 
                : 'bg-zinc-900/95 border-white/15 text-white/40 hover:text-white/80'
            }`}
            title="Tráfico en tiempo real"
          >
            <Gauge className="w-4 h-4" />
          </button>

          {/* Reset View */}
          <button 
            onClick={resetMap}
            className="bg-zinc-900/95 hover:bg-zinc-800 border border-white/15 p-2 rounded-xl text-white/80 hover:text-white transition-all cursor-pointer shadow-lg"
            title="Centrar Mapa"
          >
            <Compass className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom Controls Overlay */}
        <div className="absolute right-3 bottom-3 z-10 flex flex-col bg-zinc-900/95 border border-white/10 rounded-xl overflow-hidden shadow-lg">
          <button 
            onClick={handleZoomIn}
            disabled={zoomLevel >= 17}
            className="p-2 hover:bg-zinc-800 text-white/80 hover:text-white transition-all cursor-pointer border-b border-white/5 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button 
            onClick={handleZoomOut}
            disabled={zoomLevel <= 11}
            className="p-2 hover:bg-zinc-800 text-white/80 hover:text-white transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        {/* Street View Pegman Trigger */}
        <div className="absolute left-3 bottom-3 z-10">
          <button 
            onClick={() => setShowStreetView(!showStreetView)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase transition-all shadow-lg cursor-pointer ${
              showStreetView 
                ? 'bg-yellow-500 text-black border-yellow-400 font-extrabold' 
                : 'bg-zinc-900/95 border-white/15 text-yellow-500 hover:bg-zinc-800'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-pulse shrink-0" />
            Street View
          </button>
        </div>

        {/* Privacy Note / Watermark */}
        <div className="absolute left-3 top-3 z-10 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-mono text-white/40 uppercase tracking-widest">
          📍 Ubicación aproximada por privacidad
        </div>

      </div>

      {/* 🧭 DISTANCE MEASURING & COMMUTE INFORMATION HUB */}
      <div className="p-4 bg-zinc-950/90 border-t border-white/5 space-y-4">
        
        {/* Navigation Mode Selectors */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setActiveCommuteMode('drive')}
              className={`p-2 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                activeCommuteMode === 'drive' 
                  ? 'bg-red-600 text-white font-black shadow-lg shadow-red-950/50' 
                  : 'text-white/50 hover:text-white/90 hover:bg-white/5'
              }`}
            >
              <CarIcon className="w-3.5 h-3.5" />
              <span>En auto</span>
            </button>
            <button 
              onClick={() => setActiveCommuteMode('transit')}
              className={`p-2 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                activeCommuteMode === 'transit' 
                  ? 'bg-red-600 text-white font-black shadow-lg shadow-red-950/50' 
                  : 'text-white/50 hover:text-white/90 hover:bg-white/5'
              }`}
            >
              <Bus className="w-3.5 h-3.5" />
              <span>Transito</span>
            </button>
            <button 
              onClick={() => setActiveCommuteMode('walk')}
              className={`p-2 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                activeCommuteMode === 'walk' 
                  ? 'bg-red-600 text-white font-black shadow-lg shadow-red-950/50' 
                  : 'text-white/50 hover:text-white/90 hover:bg-white/5'
              }`}
            >
              <Footprints className="w-3.5 h-3.5" />
              <span>A pie</span>
            </button>
          </div>

          <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
            Live Traffic
          </span>
        </div>

        {/* Dynamic Details Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl text-left">
            <span className="text-[9px] text-white/35 uppercase font-bold tracking-wider block">Tiempo estimado</span>
            <span className="text-sm font-sans font-black text-white block mt-0.5">{getCommuteTime()}</span>
            <span className="text-[9px] text-white/40 font-mono">vía ruta más corta</span>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl text-left">
            <span className="text-[9px] text-white/35 uppercase font-bold tracking-wider block">Distancia total</span>
            <span className="text-sm font-sans font-black text-white block mt-0.5">{matchedMeta.distanceKm.toLocaleString('es-CL')} km</span>
            <span className="text-[9px] text-white/40 font-mono">desde el centro</span>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl text-left">
            <span className="text-[9px] text-white/35 uppercase font-bold tracking-wider block">Peajes estimados</span>
            <span className="text-sm font-sans font-black text-emerald-400 block mt-0.5 truncate" title={matchedMeta.tollCost}>
              {matchedMeta.tollCost.split(' ')[0] === 'Sin' ? 'Gratis' : matchedMeta.tollCost.split(' ')[0]}
            </span>
            <span className="text-[9px] text-white/40 font-mono truncate block" title={matchedMeta.tollCost}>
              {matchedMeta.tollCost}
            </span>
          </div>

        </div>

        {/* Neighborhood info box */}
        <div className="p-3 bg-red-600/[0.03] border border-red-500/10 rounded-xl text-left text-[11px] text-white/70 leading-relaxed flex items-start gap-2">
          <Info className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-red-400 block mb-0.5">Nota de Entrega / Transferencia</span>
            <p>{matchedMeta.description}</p>
          </div>
        </div>

      </div>

    </div>
  );
}
