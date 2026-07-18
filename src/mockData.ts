import { Car, ValuationQuery, ValuationResult } from './types';

export const CHILEAN_REGIONS = [
  { name: "Región de Arica y Parinacota", communes: ["Arica", "Putre", "Camarones", "General Lagos"] },
  { name: "Región de Tarapacá", communes: ["Iquique", "Alto Hospicio", "Pozo Almonte", "Pica"] },
  { name: "Región de Antofagasta", communes: ["Antofagasta", "Calama", "Mejillones", "Tocopilla", "San Pedro de Atacama"] },
  { name: "Región de Atacama", communes: ["Copiapó", "Vallenar", "Caldera", "Chañaral", "Huasco"] },
  { name: "Región de Coquimbo", communes: ["La Serena", "Coquimbo", "Ovalle", "Illapel", "Vicuña"] },
  { name: "Región de Valparaíso", communes: ["Viña del Mar", "Valparaíso", "Concón", "Quilpué", "Villa Alemana", "San Antonio", "Quillota", "Los Andes"] },
  { name: "Región Metropolitana", communes: ["Santiago", "Las Condes", "Providencia", "Ñuñoa", "Vitacura", "La Florida", "Maipú", "Puente Alto", "Colina", "Lo Barnechea", "San Bernardo", "Peñalolén", "Pudahuel"] },
  { name: "Región de O'Higgins", communes: ["Rancagua", "San Fernando", "Pichilemu", "Machalí", "Rengo", "Santa Cruz"] },
  { name: "Región del Maule", communes: ["Talca", "Curicó", "Linares", "Constitución", "Cauquenes", "San Javier"] },
  { name: "Región de Ñuble", communes: ["Chillán", "San Carlos", "Coihueco", "Pinto", "Bulnes", "Yungay"] },
  { name: "Región del Biobío", communes: ["Concepción", "Talcahuano", "San Pedro de la Paz", "Chiguayante", "Los Ángeles", "Coronel", "Hualpén", "Lota"] },
  { name: "Región de La Araucanía", communes: ["Temuco", "Pucón", "Villarrica", "Padre Las Casas", "Angol", "Lautaro"] },
  { name: "Región de Los Ríos", communes: ["Valdivia", "La Unión", "Panguipulli", "Río Bueno", "Mariquina"] },
  { name: "Región de Los Lagos", communes: ["Puerto Montt", "Puerto Varas", "Osorno", "Castro", "Ancud", "Chonchi"] },
  { name: "Región de Aysén", communes: ["Coyhaique", "Puerto Aysén", "Chile Chico", "Cochrane"] },
  { name: "Región de Magallanes", communes: ["Punta Arenas", "Puerto Natales", "Porvenir", "Cabo de Hornos"] }
];

export const POPULAR_BRANDS = [
  { name: "Suzuki", models: ["Swift", "Baleno", "Vitara", "Jimny", "S-Cross", "Ignis"] },
  { name: "Toyota", models: ["Hilux", "Yaris", "RAV4", "Corolla", "Corolla Cross", "Prius"] },
  { name: "Mazda", models: ["Mazda 3", "Mazda 6", "CX-5", "CX-30", "CX-9", "CX-3"] },
  { name: "Chevrolet", models: ["Sail", "Onix", "Tracker", "Colorado", "Spark", "Captiva"] },
  { name: "Hyundai", models: ["Accent", "Grand i10", "Tucson", "Santa Fe", "Creta", "Kona"] },
  { name: "Kia", models: ["Rio", "Soluto", "Sportage", "Sorento", "Morning", "Cerato"] },
  { name: "Peugeot", models: ["208", "2008", "3008", "308", "5008", "Partner"] },
  { name: "Subaru", models: ["Forester", "XV / Crosstrek", "Outback", "Impreza", "WRX"] },
  { name: "Ford", models: ["Ranger", "F-150", "Territory", "EcoSport", "Explorer", "Focus"] },
  { name: "BMW", models: ["Serie 3", "Serie 1", "X1", "X3", "X5", "Serie 5"] },
  { name: "Nissan", models: ["Kicks", "Versa", "Qashqai", "X-Trail", "Navara", "Sentra"] },
  { name: "Volkswagen", models: ["Gol", "Polo", "T-Cross", "Tiguan", "Vento", "Amarok"] }
];

export const MOCK_CARS: Car[] = [
  {
    id: "car_1",
    brand: "Suzuki",
    model: "Swift Sport",
    year: 2021,
    price: 11890000,
    km: 42000,
    location: "Las Condes, RM",
    fuel: "Bencina",
    transmission: "Manual",
    image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800"
    ],
    ownerName: "Andrés",
    ownerPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150",
    permuta: true,
    permutaPreferences: "Busco SUV o camioneta 4x4. Pago diferencia de hasta $4M a favor.",
    description: "Impecable Suzuki Swift Sport. Motor 1.4 Turbo Boosterjet. Caja manual de 6 velocidades, muy ágil y económico (da como 15 km/l en ciudad). Mantenciones al día en Derco. Sin partes ni multas. Neumáticos Michelin nuevos.",
    features: ["Motor Turbo", "Cámara de retroceso", "Apple CarPlay & Android Auto", "Focos LED", "Llantas aro 17", "Climatizador"],
    tags: ["Deportivo", "Económico", "Único Dueño"],
    likesUser: true,
    lifestyle: "Deportivo",
    chatPersona: {
      greeting: "¡Hola! Qué buena máquina tienes. Vi que te interesó mi Swift Sport. ¿Buscas permutar o comprar directo?",
      aboutCar: "El Swift está filete, lo cuido como hijo. Solo lo cambio porque me quedó chico para salir a la playa con la tabla de surf.",
      permutaOpinion: "Me tinca caleta tu auto para la permuta. ¿Te parece si coordinamos una junta para ver ambos autos con mecánicos de confianza?",
      closingNegotiation: "Perfecto. Dejemos cerrado un pre-acuerdo de permuta y coordinamos la transferencia en la notaría esta semana. Te mando mi WhatsApp."
    }
  },
  {
    id: "car_2",
    brand: "Toyota",
    model: "Hilux SRX 4x4",
    year: 2020,
    price: 24500000,
    km: 78000,
    location: "Concepción, Biobío",
    fuel: "Diésel",
    transmission: "Automática",
    image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1507136566006-cfc505b114fc?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1532581291347-9c39cf10a73c?auto=format&fit=crop&q=80&w=800"
    ],
    ownerName: "Rodrigo",
    ownerPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
    permuta: true,
    permutaPreferences: "Recibo auto menor valor (preferente Mazda 3 o similar) más diferencia de dinero a mi favor.",
    description: "Toyota Hilux versión SRX tope de línea. Motor 2.8 diésel con caja automática. Tracción 4x4 impecable. Tapiz de cuero, asientos eléctricos ventilados, audio JBL. Nunca cargada para faena, uso netamente familiar.",
    features: ["Tracción 4x4", "Asientos de cuero", "Audio Premium JBL", "Velocidad crucero adaptativa", "Pisaderas originales", "Cúpula rígida"],
    tags: ["4x4", "Familiar", "Diesel"],
    likesUser: true,
    lifestyle: "Trabajo",
    chatPersona: {
      greeting: "¡Wena wena! Qué tal tu auto. Estoy buscando bajarme de cilindrada y recibir un hatchback o sedán más dinero. ¿Cómo andas de presupuesto?",
      aboutCar: "La Hilux es una cuna y carne de perro, no falla jamás. Papeles al día, revisión técnica recién sacada sin detalles.",
      permutaOpinion: "Tu máquina se ve impecable. Si me das tu auto y una diferencia de dinero justa, cerramos trato de inmediato.",
      closingNegotiation: "Buena. Te hablo para coordinar la revisión y la junta. Prefiero hacer todo legal en notaría de Concepción o Chillán."
    }
  },
  {
    id: "car_3",
    brand: "Mazda",
    model: "CX-5 S-Grand Touring",
    year: 2019,
    price: 16200000,
    km: 65000,
    location: "Viña del Mar, Valparaíso",
    fuel: "Bencina",
    transmission: "Automática",
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1562426509-5044a121aa49?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1539799139360-4043ac0dc273?auto=format&fit=crop&q=80&w=800"
    ],
    ownerName: "Camila",
    ownerPhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
    permuta: false,
    permutaPreferences: "No permuto. Solo venta directa por viaje.",
    description: "Mazda CX-5 versión S-Grand Touring. Motor 2.5cc SkyActiv-G. Caja automática secuencial. Excelente estado, mantenciones realizadas rigurosamente cada 10.000 km. Sin choques, pintura original impecable. Vende su dueña.",
    features: ["Sunroof eléctrico", "Smart Keyless Entry", "Pantalla con control de mando", "Asientos eléctricos", "Audio Bose de fábrica", "Llantas de aleación"],
    tags: ["Familiar", "Excelente Estado", "Única Dueña"],
    likesUser: false,
    lifestyle: "Familiar",
    chatPersona: {
      greeting: "Hola! Gracias por el like. Ojo que puse en la descripción que solo vendo directo por apuro de viaje. ¿Te interesa comprarla al contado o con crédito?",
      aboutCar: "Está impecable, la vendo solo porque me voy a vivir a España a fin de mes. Tiene patente grabada en los vidrios y corta corriente.",
      permutaOpinion: "No me cierro del todo a permuta si es por un auto muy comercial que pueda vender en 3 días (como un Suzuki Baleno o Swift) más buenas lucas a mi favor.",
      closingNegotiation: "Excelente, si hacemos la transferencia mañana mismo te puedo rebajar 200 luquitas del precio para sellar el trato."
    }
  },
  {
    id: "car_4",
    brand: "BMW",
    model: "320i M Sport",
    year: 2018,
    price: 21900000,
    km: 82000,
    location: "Vitacura, RM",
    fuel: "Bencina",
    transmission: "Automática",
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80&w=800"
    ],
    ownerName: "Gonzalo",
    ownerPhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
    permuta: true,
    permutaPreferences: "Busco camioneta Jeep Wrangler o Ford Ranger 4x4. Doy diferencia.",
    description: "BMW Serie 3 320i con paquete M Sport original de fábrica. Volante M, llantas M aro 18, suspensión deportiva y kit aerodinámico. Motor 2.0 TwinPower Turbo. Muy rápido, suave y seguro. Siempre bajo techo.",
    features: ["Paquete estético M Sport", "Volante deportivo M", "Modos de conducción (Sport, Comfort, Eco)", "Faros LED adaptativos", "Audio HiFi", "Corta Corriente bluetooth"],
    tags: ["Premium", "Deportivo", "Exclusivo"],
    likesUser: true,
    lifestyle: "Deportivo",
    chatPersona: {
      greeting: "Hola, ¿cómo va? Veo que tienes buen gusto. El 320i está joya, lo uso los fines de semana. ¿Tienes alguna camioneta disponible para permuta?",
      aboutCar: "Tiene todas las campañas hechas en Williamson Balfour. Sin fugas, sin fallas. Neumáticos RunFlat con 85% de vida útil.",
      permutaOpinion: "Tu vehículo calza justo con lo que busco para irme los fines de semana a la cordillera. Cuéntame sobre su historial mecánico.",
      closingNegotiation: "Excelente. Consigamos el certificado de anotaciones vigentes y agendamos una revisión en el taller que quieras."
    }
  },
  {
    id: "car_5",
    brand: "Peugeot",
    model: "208 Allure Pack BlueHDi",
    year: 2022,
    price: 14700000,
    km: 31000,
    location: "La Serena, Coquimbo",
    fuel: "Diésel",
    transmission: "Manual",
    image: "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800"
    ],
    ownerName: "Francisca",
    ownerPhoto: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150",
    permuta: true,
    permutaPreferences: "Permuto por auto de menor valor o SUV, idealmente automático para mi mamá.",
    description: "Peugeot 208 versión Allure Pack con motor BlueHDi Turbo Diésel. El auto más económico de Chile, da hasta 26 km/l en carretera. Única dueña, mantenciones en concesionario Peugeot oficial. Cuenta con i-Cockpit 3D espectacular.",
    features: ["i-Cockpit 3D", "Rendimiento 26 km/litro", "Techo panorámico cielo", "Cámara 180°", "Frenado de emergencia activo", "Cargador inalámbrico celular"],
    tags: ["Económico", "Moderno", "Única Dueña"],
    likesUser: true,
    lifestyle: "Económico",
    chatPersona: {
      greeting: "¡Hola! Qué lindo tu auto. El mío rinde una maravilla, casi me olvido de cómo cargar combustible. ¿Permutas mano a mano o buscas dinero?",
      aboutCar: "Está impecable, tiene ese olor a nuevo todavía. Lo cambio porque mi mamá necesita manejar automático por un tema de salud.",
      permutaOpinion: "Me interesa tu auto si la transmisión es automática y tiene buen confort. ¿Cuándo podríamos juntarnos a probarlos?",
      closingNegotiation: "Dale, genial. Pidamos el certificado de anotaciones para verificar que todo esté legal y nos juntamos en el mall de La Serena."
    }
  },
  {
    id: "car_6",
    brand: "Chevrolet",
    model: "Sail 1.5 LT Smart",
    year: 2019,
    price: 6990000,
    km: 95000,
    location: "San Bernardo, RM",
    fuel: "Bencina",
    transmission: "Manual",
    image: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80&w=800"
    ],
    ownerName: "Matías",
    ownerPhoto: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=150",
    permuta: true,
    permutaPreferences: "Busco subir de año, doy mi auto más efectivo (hasta $4.000.000) por SUV o Sedán sobre 2021.",
    description: "Chevrolet Sail en su versión LT Smart. Muy bien cuidado, tapiz impecable, aire acondicionado enfriando perfecto, sunroof, radio touch original con bluetooth. Auto súper repuestero, confiable y rendidor para el día a día.",
    features: ["Sunroof", "Aire acondicionado", "Pantalla touch con bluetooth", "Doble Airbag", "Neblineros traseros", "Llantas originales"],
    tags: ["Económico", "Súper Comercial", "Urbano"],
    likesUser: true,
    lifestyle: "Económico",
    chatPersona: {
      greeting: "¡Hola cumpa! Busco renovar mi caballito de batalla por algo más nuevo. Mi auto es re fiel, barato de mantener a morir. ¿Te interesa permutar por el tuyo?",
      aboutCar: "Tiene las mantenciones hechas con aceite sintético cada 10.000 km religiosamente. Pastillas de freno recién cambiadas.",
      permutaOpinion: "Tu auto me gusta harto para subir de nivel. Te paso mi auto más las lucas que acordemos. ¿Qué dices?",
      closingNegotiation: "Hagámosla corta, si nos gusta el andar de los autos nos juntamos en la notaría de Gran Avenida y firmamos al tiro."
    }
  },
  {
    id: "car_7",
    brand: "Subaru",
    model: "Forester 2.0 Dynamic AWD",
    year: 2017,
    price: 13400000,
    km: 112000,
    location: "Puerto Montt, Los Lagos",
    fuel: "Bencina",
    transmission: "Automática",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1532581291347-9c39cf10a73c?auto=format&fit=crop&q=80&w=800"
    ],
    ownerName: "Javiera",
    ownerPhoto: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150",
    permuta: true,
    permutaPreferences: "Me interesa permuta por camioneta pickup (Hilux, L200, Ranger) para trabajo agrícola.",
    description: "Subaru Forester Dynamic. Tracción Symmetrical AWD permanente, espectacular para la lluvia y ripio del sur. Caja CVT muy cómoda. Neumáticos Yokohama Geolandar nuevos. Sistema EyeSight de seguridad activa.",
    features: ["Symmetrical AWD permanente", "EyeSight Driver Assist", "X-Mode para barro y nieve", "Calefactor de asientos", "Cámara lateral e interior", "Portalón eléctrico"],
    tags: ["Familiar", "4x4", "Seguridad"],
    likesUser: false,
    lifestyle: "Aventura 4x4",
    chatPersona: {
      greeting: "Hola! ¿Qué tal? Por acá el clima exige un buen 4x4, y la Forester es la reina del sur. ¿Tú auto tiene tracción integral o es simple?",
      aboutCar: "Está impecable para el invierno, tiene climatizador bizona y calienta asientos. Clave para los días fríos.",
      permutaOpinion: "Si tienes una camioneta diésel te la permuto al tiro, me sirve mucho para el campo de mi papá.",
      closingNegotiation: "Súper, te mando videos del auto andando en frío para que veas que el motor suena redondito. Coordinamos."
    }
  },
  {
    id: "car_8",
    brand: "Hyundai",
    model: "Accent 1.4 Value",
    year: 2020,
    price: 9200000,
    km: 58000,
    location: "La Florida, RM",
    fuel: "Bencina",
    transmission: "Manual",
    image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=800",
    images: [
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800"
    ],
    ownerName: "Alexis",
    ownerPhoto: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150",
    permuta: false,
    permutaPreferences: "No permuto, solo venta para pagar pie de un departamento.",
    description: "Hyundai Accent Value 1.4 mecánico. Un auto extremadamente suave de andar, espacioso y económico. Con frenos ABS, aire acondicionado, mandos al volante y sensor de retroceso. Papeles al día, llegar y transferir.",
    features: ["Aire acondicionado", "Frenos ABS con EBD", "Cámara y sensor de retroceso", "Espejos exteriores eléctricos", "Anclajes ISOFIX", "Radio touch integrada"],
    tags: ["Económico", "Excelente Estado", "Fiel"],
    likesUser: true,
    lifestyle: "Económico",
    chatPersona: {
      greeting: "Hola, qué tal. Vendo el consentido por temas de inversión (estoy juntando para el pie de mi depa). Está como nuevo. ¿Te tinca venir a verlo?",
      aboutCar: "Único dueño, homologado hasta el próximo año. No tiene absolutamente ningún detalle mecánico.",
      permutaOpinion: "Como te contaba, necesito la plata para el pie. Pero si tu auto es muy vendible y me das al menos $5M a mi favor, podríamos conversarlo.",
      closingNegotiation: "Dale. Si te gusta el auto, lo transferimos vía transferencia digital o CAV de inmediato en la notaría más cercana."
    }
  }
];

export function estimateCarValue(query: ValuationQuery): ValuationResult {
  const brand = query.brand.toLowerCase();
  const year = query.year;
  const km = query.km;
  const condition = query.condition;

  // Encontrar precio base referencial aproximado para el año 2020
  let basePrice = 12500000;
  let matches = POPULAR_BRANDS.find(b => b.name.toLowerCase() === brand);
  
  if (brand.includes("suzuki")) {
    basePrice = 9800000;
  } else if (brand.includes("toyota")) {
    basePrice = 18500000;
  } else if (brand.includes("mazda")) {
    basePrice = 15500000;
  } else if (brand.includes("chevrolet")) {
    basePrice = 7800000;
  } else if (brand.includes("hyundai")) {
    basePrice = 9200000;
  } else if (brand.includes("kia")) {
    basePrice = 9600000;
  } else if (brand.includes("peugeot")) {
    basePrice = 12500000;
  } else if (brand.includes("subaru")) {
    basePrice = 14200000;
  } else if (brand.includes("ford")) {
    basePrice = 19500000;
  } else if (brand.includes("bmw")) {
    basePrice = 22000000;
  }

  // Ajuste por año (asumiendo 2026 actual, depreciación de ~7% anual promedio respecto a 2020)
  const yearsDiff = year - 2020;
  let yearFactor = 1 + (yearsDiff * 0.08); // +8% por año más nuevo, -8% por año más viejo
  
  // Limitar factor de año extremo
  if (yearFactor < 0.4) yearFactor = 0.4;
  if (yearFactor > 1.8) yearFactor = 1.8;

  let calculatedBase = basePrice * yearFactor;

  // Ajuste por kilometraje (promedio normal es 15.000 km por año)
  const expectedKm = (2026 - year) * 15000;
  const kmDiff = km - expectedKm;
  // Penalización por km de $25 pesos por km sobre lo esperado, o premio de $15 pesos por km bajo lo esperado
  let kmAdjustment = 0;
  if (kmDiff > 0) {
    kmAdjustment = -kmDiff * 25;
  } else {
    kmAdjustment = Math.abs(kmDiff) * 15;
  }

  // Tope de ajuste de km del 15% del auto
  const maxKmAdj = calculatedBase * 0.15;
  if (Math.abs(kmAdjustment) > maxKmAdj) {
    kmAdjustment = kmAdjustment > 0 ? maxKmAdj : -maxKmAdj;
  }

  let priceWithKm = calculatedBase + kmAdjustment;

  // Ajuste por condición
  let conditionFactor = 1.0;
  if (condition === 'excellent') conditionFactor = 1.08;
  if (condition === 'fair') conditionFactor = 0.85;

  let finalPrice = priceWithKm * conditionFactor;

  // Redondear a las 50 mil más cercanas para que parezca precio chileno real
  finalPrice = Math.round(finalPrice / 50000) * 50000;

  // Asegurar mínimos razonables
  if (finalPrice < 2500000) finalPrice = 2500000;

  const lowPrice = Math.round((finalPrice * 0.92) / 50000) * 50000;
  const highPrice = Math.round((finalPrice * 1.06) / 50000) * 50000;

  // Calcular métricas de liquidez
  let liquidityScore: 'Alta' | 'Media' | 'Baja' = 'Media';
  let demandPercentage = 65;
  let estimatedDaysToSell = 22;

  if (["suzuki", "toyota", "chevrolet", "hyundai", "kia"].includes(brand)) {
    liquidityScore = 'Alta';
    demandPercentage = 88;
    estimatedDaysToSell = 12;
  } else if (["bmw", "mercedes", "audi"].includes(brand)) {
    liquidityScore = 'Baja';
    demandPercentage = 42;
    estimatedDaysToSell = 38;
  }

  // Recomendación de permuta
  const permutaRecommended = finalPrice > 12000000 || liquidityScore === 'Baja';

  return {
    avgPrice: finalPrice,
    lowPrice,
    highPrice,
    liquidityScore,
    demandPercentage,
    estimatedDaysToSell,
    permutaRecommended
  };
}
