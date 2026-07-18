import React, { useState } from 'react';
import { ShieldCheck, Lock, Database, Eye, X, FileText, Check, Landmark, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PrivacyDisclosureModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'privacy' | 'disclosure' | 'terms';
}

export default function PrivacyDisclosureModal({
  isOpen,
  onClose,
  defaultTab = 'privacy'
}: PrivacyDisclosureModalProps) {
  const [activeTab, setActiveTab] = useState<'privacy' | 'disclosure' | 'terms'>(defaultTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md" id="privacy_disclosure_overlay">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-[#0f0f0f] border border-white/10 rounded-3xl overflow-hidden max-w-2xl w-full text-white shadow-2xl relative flex flex-col max-h-[85vh]"
        id="privacy_disclosure_modal"
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-white/15 flex items-center justify-between bg-gradient-to-r from-red-950/20 via-zinc-950 to-[#0f0f0f]">
          <div className="flex items-center gap-3">
            <div className="bg-red-500/10 text-red-500 p-2 rounded-xl border border-red-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-red-400 block">
                Cumplimiento Legal AutoMatch Chile
              </span>
              <h3 className="text-lg font-sans font-black uppercase italic tracking-tight text-white mt-0.5">
                Acuerdos Legales y Privacidad
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-white/5 hover:bg-white/10 hover:text-white text-white/70 p-2 rounded-full cursor-pointer transition-all border border-white/5"
            id="close_privacy_modal_btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-white/5 bg-zinc-950/50 p-1 gap-1">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 py-3 px-1 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'privacy'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/15 font-black'
                : 'text-white/40 hover:text-white/70 hover:bg-white/5'
            }`}
            id="tab_select_privacy"
          >
            <Lock className="w-3.5 h-3.5" />
            Privacidad
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`flex-1 py-3 px-1 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'terms'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/15 font-black'
                : 'text-white/40 hover:text-white/70 hover:bg-white/5'
            }`}
            id="tab_select_terms"
          >
            <FileText className="w-3.5 h-3.5" />
            Términos
          </button>
          <button
            onClick={() => setActiveTab('disclosure')}
            className={`flex-1 py-3 px-1 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'disclosure'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/15 font-black'
                : 'text-white/40 hover:text-white/70 hover:bg-white/5'
            }`}
            id="tab_select_disclosure"
          >
            <Database className="w-3.5 h-3.5" />
            Transparencia
          </button>
        </div>

        {/* Scrollable Document Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-left scrollbar-thin scrollbar-thumb-zinc-850 scrollbar-track-transparent">          {activeTab === 'privacy' && (
            <div className="space-y-4" id="privacy_policy_content">
              <div>
                <h4 className="text-sm font-sans font-black uppercase italic tracking-tight text-red-500 flex items-center gap-2">
                  <span className="bg-red-500/10 px-2 py-0.5 rounded text-[10px] not-italic">1</span>
                  Tratamiento de Datos Personales
                </h4>
                <p className="text-xs text-white/70 leading-relaxed mt-1.5">
                  De conformidad con la <strong>Ley N° 19.628 sobre Protección de la Vida Privada</strong> en Chile, AutoMatch Chile se compromete a resguardar estrictamente el acceso, almacenamiento y tratamiento de los datos provistos por los propietarios de vehículos.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-sans font-black uppercase italic tracking-tight text-red-500 flex items-center gap-2">
                  <span className="bg-red-500/10 px-2 py-0.5 rounded text-[10px] not-italic">2</span>
                  Declaración Completa de Datos Recopilados
                </h4>
                <p className="text-xs text-white/70 leading-relaxed mt-1">
                  La plataforma recopila de forma transparente los siguientes datos del usuario y de su vehículo:
                </p>
                <ul className="text-xs text-white/70 space-y-2 pl-4 list-disc leading-relaxed mt-1.5">
                  <li><strong className="text-white">Identidad y Perfil:</strong> Nombre de pila, seudónimo o inicial del vendedor para su presentación visual.</li>
                  <li><strong className="text-white">Contacto Directo:</strong> Número de teléfono de red móvil chilena (+569), utilizado únicamente tras concretar un AutoMatch mutuo.</li>
                  <li><strong className="text-white">Datos del Vehículo:</strong> Patente (para validación de antecedentes chilenos), marca, modelo, año, kilometraje, tipo de combustible, transmisión, tasación o precio estimado de venta, fotografías reales y descripción de permuta.</li>
                  <li><strong className="text-white">Ubicación Geográfica:</strong> Región y Comuna de publicación del automóvil para calcular distancias de permuta.</li>
                  <li><strong className="text-white">Datos de Interacción:</strong> Registro de deslizamientos (Swipes "Me gusta" o "Pasar") y mensajes textuales intercambiados en salas de chat activas de Firebase.</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-sans font-black uppercase italic tracking-tight text-red-500 flex items-center gap-2">
                  <span className="bg-red-500/10 px-2 py-0.5 rounded text-[10px] not-italic">3</span>
                  ¿Por qué Recopilamos estos Datos? (Propósito)
                </h4>
                <p className="text-xs text-white/70 leading-relaxed mt-1">
                  Recopilamos su información únicamente bajo propósitos legítimos y funcionales para el servicio:
                </p>
                <ul className="text-xs text-white/70 space-y-1.5 pl-4 list-disc leading-relaxed mt-1.5">
                  <li><strong className="text-white">Prevención de Fraudes:</strong> La patente y las especificaciones nos permiten pre-validar que el vehículo existe físicamente en los registros chilenos y no es una publicación fantasma.</li>
                  <li><strong className="text-white">Funcionamiento del Algoritmo:</strong> Procesar las preferencias de permuta para mostrarle ofertas automotrices compatibles en su zona geográfica.</li>
                  <li><strong className="text-white">Facilitar la Negociación:</strong> Permitir el intercambio de chats seguros y revelar el número de contacto solo a contrapartes legitimadas por un match recíproco.</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-sans font-black uppercase italic tracking-tight text-red-500 flex items-center gap-2">
                  <span className="bg-red-500/10 px-2 py-0.5 rounded text-[10px] not-italic">4</span>
                  Tiempo de Retención (¿Por cuánto tiempo se conservan?)
                </h4>
                <p className="text-xs text-white/70 leading-relaxed mt-1.5">
                  Aplicamos políticas estrictas de minimización de datos y retención temporal:
                </p>
                <ul className="text-xs text-white/70 space-y-1.5 pl-4 list-disc leading-relaxed mt-1">
                  <li><strong className="text-white">Fichas Activas:</strong> Toda la información de tu perfil y vehículo se mantiene activa mientras uses la plataforma o hasta que decidas borrarla manualmente.</li>
                  <li><strong className="text-white">Inactividad Prolongada (12 Meses):</strong> Las cuentas y publicaciones que no presenten inicios de sesión ni swipes en un plazo continuo de <strong>12 meses</strong> serán depuradas automáticamente de Firebase Firestore para evitar listados desactualizados.</li>
                  <li><strong className="text-white">Mensajería de Chats (6 Meses):</strong> Los historiales de chat se retienen por un plazo máximo de <strong>6 meses</strong> desde el último mensaje para resguardo y resolución de disputas comerciales, tras lo cual se eliminan de forma permanente.</li>
                  <li><strong className="text-white">Eliminación Inmediata a Solicitud:</strong> Puedes gatillar la eliminación total e instantánea de todos tus datos (perfil, auto, chats y fotos) en tiempo real presionando la opción <strong>"Hard Reset"</strong> o "Eliminar cuenta" en los ajustes.</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-sans font-black uppercase italic tracking-tight text-red-500 flex items-center gap-2">
                  <span className="bg-red-500/10 px-2 py-0.5 rounded text-[10px] not-italic">5</span>
                  Derechos ARCO del Usuario
                </h4>
                <p className="text-xs text-white/70 leading-relaxed mt-1.5">
                  Usted tiene garantizado en todo momento el ejercicio de sus derechos de <strong>Acceso, Rectificación, Cancelación y Oposición (ARCO)</strong> consagrados en la Ley N° 19.628. Si desea ejercerlos de forma asistida o tiene dudas de cumplimiento, puede escribir directamente a su panel de administración.
                </p>
              </div>

              <div className="bg-red-500/5 border border-red-500/15 p-3 rounded-2xl flex gap-3 items-start">
                <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5 animate-pulse" />
                <div className="space-y-1">
                  <h5 className="text-[11px] font-black uppercase tracking-wider text-red-400">Garantía de Soberanía sobre Datos</h5>
                  <p className="text-[10px] text-white/60 leading-normal">
                    AutoMatch Chile nunca comercializará ni transferirá tus datos personales o vehiculares a marcas comerciales, automotoras, bancos ni terceros para fines publicitarios sin tu consentimiento expreso por escrito.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-4" id="terms_conditions_content">
              <div>
                <h4 className="text-sm font-sans font-black uppercase italic tracking-tight text-red-500 flex items-center gap-2">
                  <span className="bg-red-500/10 px-2 py-0.5 rounded text-[10px] not-italic">1</span>
                  Edad Mínima Obligatoria (18+)
                </h4>
                <p className="text-xs text-white/70 leading-relaxed mt-1.5">
                  El registro, la publicación y el uso de la plataforma AutoMatch Chile están restringidos <strong>única y estrictamente a personas mayores de 18 años de edad</strong>. Al hacer uso de la plataforma, declaras bajo juramento ser mayor de edad, poseer cédula de identidad chilena vigente y estar legalmente capacitado para celebrar contratos de compraventa y permuta de vehículos.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-sans font-black uppercase italic tracking-tight text-red-500 flex items-center gap-2">
                  <span className="bg-red-500/10 px-2 py-0.5 rounded text-[10px] not-italic">2</span>
                  Exclusividad Automotriz (Solo Autos)
                </h4>
                <p className="text-xs text-white/70 leading-relaxed mt-1.5">
                  AutoMatch Chile es una red vertical especializada de entusiastas y comerciantes automotrices. <strong>La plataforma acepta de manera exclusiva la publicación de automóviles, camionetas, SUVs y motocicletas aptos para el tránsito terrestre</strong>. Queda terminantemente prohibida la publicación o solicitud de permuta de cualquier otro bien ajeno al rubro (electrónica, propiedades, vestuario, animales, armas u otros servicios no automotrices).
                </p>
              </div>

              <div>
                <h4 className="text-sm font-sans font-black uppercase italic tracking-tight text-red-500 flex items-center gap-2">
                  <span className="bg-red-500/10 px-2 py-0.5 rounded text-[10px] not-italic">3</span>
                  Prohibición Absoluta de Contenido Ilegal y Sexual
                </h4>
                <p className="text-xs text-white/70 leading-relaxed mt-1.5">
                  Mantenemos una política de <strong>Tolerancia Cero</strong> frente al uso malicioso de la applet. Queda completamente prohibida la carga de imágenes, videos, descripciones o mensajes de chat que contengan:
                </p>
                <ul className="text-xs text-white/70 space-y-1.5 pl-4 list-disc leading-relaxed mt-1">
                  <li><strong>Contenido sexualmente explícito</strong>, pornográfico, desnudos, insinuaciones obscenas o de acompañamiento de cualquier tipo.</li>
                  <li><strong>Material ilegal o delictivo</strong>, como fotografías de armas de fuego, estupefacientes, clonación de patentes, autos encargados por robo o estafas conocidas.</li>
                  <li><strong>Contenido de odio</strong>, lenguaje racista, acoso, amenazas u hostigamiento a través de las ventanas de chat.</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-sans font-black uppercase italic tracking-tight text-red-500 flex items-center gap-2">
                  <span className="bg-red-500/10 px-2 py-0.5 rounded text-[10px] not-italic">4</span>
                  Sanciones y Denuncias Judiciales
                </h4>
                <p className="text-xs text-white/70 leading-relaxed mt-1.5">
                  Cualquier usuario que publique o transmita contenido prohibido será <strong>baneado de forma permanente e inmediata</strong> mediante la revocación de su UID de Firebase y el bloqueo de su patente comercial. Además, en cumplimiento de las leyes chilenas, AutoMatch se reserva el derecho de reportar y entregar la información correspondiente a las autoridades competentes (Carabineros de Chile, Policía de Investigaciones o Ministerio Público) ante sospechas de actividades ilícitas.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-sans font-black uppercase italic tracking-tight text-red-500 flex items-center gap-2">
                  <span className="bg-red-500/10 px-2 py-0.5 rounded text-[10px] not-italic">5</span>
                  Cláusula de Arbitraje y Resolución de Conflictos
                </h4>
                <p className="text-xs text-white/70 leading-relaxed mt-1.5">
                  Cualquier dificultad, controversia, disputa o reclamación que surja entre los usuarios, o bien entre un usuario y la plataforma AutoMatch Chile, con motivo del uso del servicio, su interpretación, validez, cumplimiento, incumplimiento o terminación, será resuelta de manera exclusiva y definitiva mediante <strong>Arbitraje de la Cámara de Comercio de Santiago (CAM Santiago)</strong> en la comuna de Santiago, Chile.
                </p>
                <p className="text-xs text-white/70 leading-relaxed mt-1">
                  Las partes acuerdan someterse en primera instancia a una mediación amistosa. De no alcanzarse un acuerdo en un plazo máximo de treinta (30) días corridos, el conflicto será sometido a un árbitro arbitrador o amigable componedor nombrado de común acuerdo por las partes, o en su defecto, por el CAM Santiago. El laudo arbitral tendrá carácter inapelable, definitivo y obligatorio para ambas partes.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'disclosure' && (
            <div className="space-y-4" id="data_disclosure_content">
              <div>
                <h4 className="text-sm font-sans font-black uppercase italic tracking-tight text-red-500 flex items-center gap-2">
                  <span className="bg-red-500/10 px-2 py-0.5 rounded text-[10px] not-italic">A</span>
                  Arquitectura de Datos y Firebase
                </h4>
                <p className="text-xs text-white/70 leading-relaxed mt-1.5">
                  Para otorgar una plataforma resiliente y rápida de escala ilimitada, AutoMatch Chile almacena su información en dos almacenes seguros:
                </p>
                <ul className="text-xs text-white/70 space-y-2 pl-4 list-disc leading-relaxed mt-1.5">
                  <li><strong className="text-white">Almacenamiento Local (Local Storage):</strong> Se guardan localmente en su dispositivo sus intenciones de deslizamientos (swipes) y preferencias estéticas para optimizar el rendimiento y permitir la reanudación offline inmediata de la sesión.</li>
                  <li><strong className="text-white">Firebase Firestore (RLS Activo):</strong> Sus datos de perfil, chat e imágenes cargadas se sincronizan de forma segura con la nube de Google Cloud en un clúster con <strong>Seguridad por Nivel de Fila (Row-Level Security)</strong> activa, asegurando que un tercero nunca pueda hackear o husmear sus conversaciones de chat privadas.</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-sans font-black uppercase italic tracking-tight text-red-500 flex items-center gap-2">
                  <span className="bg-red-500/10 px-2 py-0.5 rounded text-[10px] not-italic">B</span>
                  Divulgación de Contacto Autorizado
                </h4>
                <div className="bg-zinc-950 border border-white/5 p-4 rounded-2xl space-y-2.5">
                  <p className="text-xs text-white/80 leading-relaxed">
                    Usted comprende y acepta explícitamente que AutoMatch Chile revelará la siguiente información únicamente a la persona con la que usted genere un <strong>"AutoMatch"</strong> mutuo:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-white/60">
                    <div className="flex items-center gap-1.5 bg-white/[0.02] p-2 rounded-xl">
                      <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      <span>Su nombre de pila</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/[0.02] p-2 rounded-xl">
                      <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      <span>Ficha técnica del vehículo</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/[0.02] p-2 rounded-xl">
                      <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      <span>Comuna de publicación</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/[0.02] p-2 rounded-xl text-red-400 font-bold bg-red-500/5 border border-red-500/10">
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      <span>Teléfono de contacto</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-white/50 leading-normal">
                    * El teléfono celular no se expone al público en el Swipe Deck ni en motores de búsqueda, asegurando completa discreción contra acosos o llamadas indeseadas de estafadores.
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-sans font-black uppercase italic tracking-tight text-red-500 flex items-center gap-2">
                  <span className="bg-red-500/10 px-2 py-0.5 rounded text-[10px] not-italic">C</span>
                  Uso de Archivos Multimedia
                </h4>
                <p className="text-xs text-white/70 leading-relaxed mt-1.5">
                  Las fotos y videos provistos por el usuario son utilizados exclusivamente para ilustrar la oferta comercial del vehículo en la plataforma. Al subir fotos de su auto, el usuario garantiza poseer los derechos sobre las mismas y se compromete a no subir imágenes ofensivas, pornográficas o de terceros no autorizados.
                </p>
              </div>

              <div>
                <h4 className="text-sm font-sans font-black uppercase italic tracking-tight text-red-500 flex items-center gap-2">
                  <span className="bg-red-500/10 px-2 py-0.5 rounded text-[10px] not-italic">D</span>
                  Consentimiento de Cookies y Rastreadores
                </h4>
                <p className="text-xs text-white/70 leading-relaxed mt-1.5">
                  Esta plataforma no utiliza cookies invasivas de rastreo de marketing multinivel. Solo se emplean cookies técnicas de sesión nativas de Firebase Authentication que duran exclusivamente el tiempo que mantenga su sesión activa en la aplicación.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-zinc-950 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-red-600 hover:bg-red-500 text-white font-sans font-black uppercase text-xs py-3 rounded-xl transition-all cursor-pointer text-center"
            id="accept_privacy_btn"
          >
            Entendido, acepto los términos de datos
          </button>
        </div>
      </motion.div>
    </div>
  );
}
