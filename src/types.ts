export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  price: number; // In CLP (Pesos Chilenos)
  km: number;
  location: string; // e.g. "Santiago, RM", "Viña del Mar"
  fuel: 'Bencina' | 'Diésel' | 'Híbrido' | 'Eléctrico';
  transmission: 'Manual' | 'Automática';
  image: string; // URL
  images?: string[]; // Multiple photos
  videos?: string[]; // Multiple videos
  ownerName: string;
  ownerPhoto: string;
  permuta: boolean; // Interesado en permuta
  permutaPreferences?: string; // Lo que busca permutar
  description: string;
  features: string[];
  tags: string[];
  likesUser: boolean; // Si el usuario le da Like, produce un Match automático
  lifestyle?: 'Deportivo' | 'Familiar' | 'Económico' | 'Aventura 4x4' | 'Trabajo';
  chatPersona?: {
    greeting: string;
    aboutCar: string;
    permutaOpinion: string;
    closingNegotiation: string;
  };
}

export interface Message {
  id: string;
  sender: 'user' | 'other';
  text: string;
  timestamp: string; // e.g., "14:32"
  mediaType?: 'photo' | 'video';
  mediaUrl?: string;
  callDuration?: string;
  isCallMessage?: boolean;
}

export interface Match {
  id: string; // matches car.id
  car: Car;
  timestamp: string;
  messages: Message[];
  unread: boolean;
}

export interface UserCar {
  brand: string;
  model: string;
  year: number;
  price: number;
  km: number;
  location: string;
  fuel: 'Bencina' | 'Diésel' | 'Híbrido' | 'Eléctrico';
  transmission: 'Manual' | 'Automática';
  permuta: boolean;
  permutaPreferences: string;
  description: string;
  image: string;
  images?: string[]; // Multiple photos
  videos?: string[]; // Multiple videos
  views: number;
  likes: number;
  superLikes: number;
  contactPhone: string;
}

export interface ValuationQuery {
  brand: string;
  model: string;
  year: number;
  km: number;
  condition: 'excellent' | 'good' | 'fair';
}

export interface ValuationResult {
  avgPrice: number;
  lowPrice: number;
  highPrice: number;
  liquidityScore: 'Alta' | 'Media' | 'Baja';
  demandPercentage: number;
  estimatedDaysToSell: number;
  permutaRecommended: boolean;
}
