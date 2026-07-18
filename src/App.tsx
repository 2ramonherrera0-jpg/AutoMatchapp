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

// Firebase imports
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInAnonymously, 
  signOut 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  onSnapshot, 
  updateDoc, 
  serverTimestamp, 
  orderBy, 
  limit,
  deleteDoc
} from 'firebase/firestore';
import { auth, db } from './lib/firebase';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

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

  // Cars State from Firestore
  const [dbCars, setDbCars] = useState<Car[]>([]);

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

  // Firebase Auth State Listener & User Profile Fetcher
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Prevent auth observer from clearing local user if in local mode
      if (currentUser?.isLocal) {
        setAuthLoading(false);
        setIsLoaded(true);
        return;
      }

      setAuthLoading(true);
      if (user) {
        setCurrentUser(user);
        setAuthError(null);
        try {
          const userDocSnap = await getDoc(doc(db, 'users', user.uid));
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setUserName(userData.name || 'Usuario');
            
            // Query user's car
            const carsQuery = query(collection(db, 'cars'), where('ownerUid', '==', user.uid));
            const carsSnap = await getDocs(carsQuery);
            if (!carsSnap.empty) {
              const carData = { id: carsSnap.docs[0].id, ...carsSnap.docs[0].data() } as unknown as UserCar;
              setUserCar(carData);
            } else {
              setUserCar(null);
            }
          } else {
            setUserName('');
            setUserCar(null);
          }
        } catch (err) {
          console.error('Error al obtener el perfil de usuario:', err);
        }
      } else {
        setCurrentUser(null);
        setUserName('');
        setUserCar(null);
      }
      setAuthLoading(false);
      setIsLoaded(true);
    });

    return () => unsubscribe();
  }, [currentUser?.isLocal]);

  // Play startup sound on first gesture
  useEffect(() => {
    let triggered = false;
    const handleFirstGesture = () => {
      if (triggered) return;
      triggered = true;
      const savedSound = (localStorage.getItem('automatch_engine_sound') as EngineType) || 'v8';
      playEngineSound(savedSound);
      
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

  // Seeding and listening to All Cars
  useEffect(() => {
    if (!currentUser) return;

    if (currentUser.isLocal) {
      setDbCars(MOCK_CARS);
      return;
    }

    const carsCol = collection(db, 'cars');
    const unsubscribe = onSnapshot(carsCol, async (snap) => {
      let carsList: Car[] = [];
      snap.forEach((doc) => {
        carsList.push({ id: doc.id, ...doc.data() } as Car);
      });

      // If db is empty (or contains only user's car), seed mock cars
      if (carsList.length <= 1) {
        console.log('Sembrando MOCK_CARS iniciales en Firestore...');
        const seededCars: Car[] = [];
        for (const mockCar of MOCK_CARS) {
          const carId = `seeded_${mockCar.id}`;
          const carDocRef = doc(db, 'cars', carId);
          const carPayload = {
            ...mockCar,
            id: carId,
            ownerUid: `mock_owner_${mockCar.id}`,
            createdAt: new Date().toISOString(),
            isSeeded: true
          };
          await setDoc(carDocRef, carPayload);
          seededCars.push(carPayload as any);
        }
        setDbCars(seededCars);
      } else {
        setDbCars(carsList);
      }
    });

    return () => unsubscribe();
  }, [currentUser, userCar]);

  // Listen to current user swipes
  useEffect(() => {
    if (!currentUser) {
      setSwipedCarIds([]);
      setLeftSwipedCarIds([]);
      return;
    }

    if (currentUser.isLocal) {
      const storedSwiped = localStorage.getItem('automatch_swiped_ids');
      const storedLeftSwiped = localStorage.getItem('automatch_left_swiped_ids');
      setSwipedCarIds(storedSwiped ? JSON.parse(storedSwiped) : []);
      setLeftSwipedCarIds(storedLeftSwiped ? JSON.parse(storedLeftSwiped) : []);
      return;
    }

    const q = query(collection(db, 'swipes'), where('senderUid', '==', currentUser.uid));
    const unsubscribe = onSnapshot(q, (snap) => {
      const swipedAll: string[] = [];
      const swipedLeft: string[] = [];
      snap.forEach((doc) => {
        const data = doc.data();
        swipedAll.push(data.targetCarId);
        if (data.type === 'dislike') {
          swipedLeft.push(data.targetCarId);
        }
      });
      setSwipedCarIds(swipedAll);
      setLeftSwipedCarIds(swipedLeft);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Listen to matches
  useEffect(() => {
    if (!currentUser || !userCar) {
      setMatches([]);
      return;
    }

    if (currentUser.isLocal) {
      const storedMatches = localStorage.getItem('automatch_matches');
      if (storedMatches) {
        setMatches(JSON.parse(storedMatches));
      } else {
        // Seed default welcoming match
        const defaultCar = dbCars[0] || MOCK_CARS[0];
        const initialMatch: Match = {
          id: `local_match_${defaultCar.id}`,
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
      return;
    }

    const q = query(
      collection(db, 'matches'),
      where('participants', 'array-contains', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const loadedMatches: Match[] = [];
      snap.forEach((matchDoc) => {
        const matchData = matchDoc.data();
        const targetCarId = matchData.carId1 === (userCar as any).id ? matchData.carId2 : matchData.carId1;
        const targetCar = dbCars.find(c => c.id === targetCarId);
        
        if (targetCar) {
          loadedMatches.push({
            id: matchDoc.id,
            car: targetCar,
            timestamp: matchData.createdAt ? new Date(matchData.createdAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
            messages: [], // messages will be loaded by dynamic messages loaders
            unread: matchData.unreadUids?.includes(currentUser.uid) || false
          });
        }
      });

      setMatches(loadedMatches);
    });

    return () => unsubscribe();
  }, [currentUser, dbCars, userCar]);

  // Real-time messages listener for the active match
  useEffect(() => {
    if (!currentUser || !activeMatchId || currentUser.isLocal) return;

    const msgsColRef = collection(db, 'matches', activeMatchId, 'messages');
    const q = query(msgsColRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesList: Message[] = [];
      snapshot.forEach((msgDoc) => {
        const msgData = msgDoc.data();
        messagesList.push({
          id: msgDoc.id,
          sender: msgData.senderUid === currentUser.uid ? 'user' : 'other',
          text: msgData.text,
          timestamp: msgData.timestamp || new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
          mediaType: msgData.mediaType || undefined,
          mediaUrl: msgData.mediaUrl || undefined,
          callDuration: msgData.callDuration || undefined,
          isCallMessage: msgData.isCallMessage || false
        });
      });

      setMatches(prevMatches => prevMatches.map(m => {
        if (m.id === activeMatchId) {
          return {
            ...m,
            messages: messagesList
          };
        }
        return m;
      }));
    }, (err) => {
      console.error('Error al escuchar los mensajes:', err);
    });

    return () => unsubscribe();
  }, [activeMatchId, currentUser]);

  // Dynamic single-time messages loader for matches list overview
  useEffect(() => {
    if (!currentUser || matches.length === 0 || currentUser.isLocal) return;
    
    matches.forEach(async (match) => {
      if (match.messages.length > 0) return; // Already loaded or synced
      
      try {
        const msgsSnap = await getDocs(collection(db, 'matches', match.id, 'messages'));
        const messagesList: Message[] = [];
        msgsSnap.forEach((msgDoc) => {
          const msgData = msgDoc.data();
          messagesList.push({
            id: msgDoc.id,
            sender: msgData.senderUid === currentUser.uid ? 'user' : 'other',
            text: msgData.text,
            timestamp: msgData.timestamp || new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
            mediaType: msgData.mediaType || undefined,
            mediaUrl: msgData.mediaUrl || undefined,
            callDuration: msgData.callDuration || undefined,
            isCallMessage: msgData.isCallMessage || false
          });
        });
        
        messagesList.sort((a, b) => a.id.localeCompare(b.id));
        
        setMatches(prevMatches => prevMatches.map(m => {
          if (m.id === match.id) {
            return { ...m, messages: messagesList };
          }
          return m;
        }));
      } catch (err) {
        console.error('Error al cargar mensajes para la vista general de coincidencias:', err);
      }
    });
  }, [currentUser, matches.length]);

  // Función para traducir errores de Firebase Auth al español
  const getFriendlySpanishAuthError = (error: any): string => {
    const code = error?.code || '';
    const errMsg = error?.message || String(error);

    if (code === 'auth/unauthorized-domain' || errMsg.includes('unauthorized-domain')) {
      return `Error de Dominio: El host actual no está en la lista de "Dominios autorizados" de tu consola Firebase. Para solucionarlo, ve a tu Firebase Console -> Authentication -> Configuración -> Dominios autorizados y agrega: ${window.location.hostname}. Mientras tanto, te recomendamos usar el Modo Local Offline.`;
    }
    if (code === 'auth/popup-closed-by-user' || errMsg.includes('popup-closed-by-user')) {
      return 'La ventana de inicio de sesión de Google fue cerrada antes de completarse. Esto ocurre habitualmente al cerrarla manualmente o si estás usando la app dentro de la vista previa de AI Studio (un iFrame). Para solucionarlo, te sugerimos abrir la app en una pestaña nueva o usar el "Modo Local Offline" instantáneo.';
    }
    if (code === 'auth/popup-blocked' || errMsg.includes('popup-blocked')) {
      return 'El navegador bloqueó la ventana emergente de Google. Por favor, habilita las ventanas emergentes en tu navegador o abre la aplicación en una pestaña nueva para iniciar sesión con normalidad. También puedes usar el "Modo Local Offline".';
    }
    if (code === 'auth/operation-not-allowed' || errMsg.includes('operation-not-allowed')) {
      return 'El método de inicio de sesión seleccionado no está habilitado en tu consola de Firebase. Asegúrate de activar Google o Anónimo (Invitados) en la sección de Proveedores de Inicio de Sesión de Firebase Auth.';
    }
    if (code === 'auth/admin-restricted-operation' || errMsg.includes('admin-restricted-operation') || errMsg.includes('restricted-operation')) {
      return 'El inicio de sesión como invitado (Anónimo) está desactivado en tu consola de Firebase. Para habilitarlo, ve a Firebase Console -> Authentication -> Sign-in method y activa el proveedor "Anónimo". Mientras tanto, puedes usar el Modo Local.';
    }
    if (code === 'auth/network-request-failed' || errMsg.includes('network-request-failed')) {
      return 'Error de red. Por favor, verifica tu conexión a internet e inténtalo de nuevo.';
    }
    if (code === 'auth/internal-error' || errMsg.includes('internal-error')) {
      return 'Ocurrió un error interno en Firebase. Por favor, inténtalo más tarde.';
    }
    if (code === 'auth/user-disabled' || errMsg.includes('user-disabled')) {
      return 'Esta cuenta de usuario ha sido desactivada por un administrador.';
    }
    
    let cleanMsg = errMsg;
    if (cleanMsg.startsWith('Firebase:')) {
      cleanMsg = cleanMsg.replace(/^Firebase:\s*/, '');
    }
    return `Error de autenticación: ${cleanMsg}`;
  };

  // Iniciar Sesión con Google (Google Sign-In)
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      setAuthLoading(true);
      setAuthError(null);
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Error al iniciar sesión con Google:', error);
      setAuthError(getFriendlySpanishAuthError(error));
    } finally {
      setAuthLoading(false);
    }
  };

  // Iniciar como Invitado (Anonymous Sign-In)
  const handleGuestSignIn = async () => {
    try {
      setAuthLoading(true);
      setAuthError(null);
      await signInAnonymously(auth);
    } catch (error: any) {
      console.error('Error al iniciar sesión como invitado:', error);
      setAuthError(getFriendlySpanishAuthError(error));
      
      // Auto fallback to local session mode if guest operation is restricted
      console.log('Cambiando automáticamente al modo de sesión local...');
      handleSelectLocalMode();
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSelectLocalMode = () => {
    setAuthLoading(true);
    const localUser = {
      uid: 'local_user_guest',
      displayName: 'Invitado Local',
      email: 'invitado@automatch.cl',
      isAnonymous: true,
      isLocal: true
    };
    
    const storedUserName = localStorage.getItem('automatch_user_name');
    const storedUserCar = localStorage.getItem('automatch_user_car');
    
    if (storedUserName) {
      setUserName(storedUserName);
    } else {
      setUserName('Invitado Local');
    }
    
    if (storedUserCar) {
      setUserCar(JSON.parse(storedUserCar));
    } else {
      setUserCar(null);
    }
    
    setCurrentUser(localUser);
    setAuthError(null);
    setAuthLoading(false);
  };

  // Guardar datos tras completar Onboarding
  const handleOnboardingComplete = async (car: UserCar, name: string) => {
    if (!currentUser) return;

    if (currentUser.isLocal) {
      const carId = `local_car_${Date.now()}`;
      const carPayload = {
        ...car,
        id: carId,
        ownerUid: currentUser.uid,
        ownerName: name,
        createdAt: new Date().toISOString()
      };
      setUserName(name);
      setUserCar(carPayload as any);
      localStorage.setItem('automatch_user_name', name);
      localStorage.setItem('automatch_user_car', JSON.stringify(carPayload));
      return;
    }

    try {
      // Save User Profile details to Firestore
      const userDocRef = doc(db, 'users', currentUser.uid);
      await setDoc(userDocRef, {
        id: currentUser.uid,
        name: name,
        contactPhone: car.contactPhone || '',
        createdAt: new Date().toISOString()
      });

      // Save user car details to Firestore
      const carId = `car_${currentUser.uid}_${Date.now()}`;
      const carPayload = {
        ...car,
        id: carId,
        ownerUid: currentUser.uid,
        ownerName: name,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'cars', carId), carPayload);

      setUserName(name);
      setUserCar(carPayload as any);
    } catch (err) {
      console.error('Error al guardar datos de onboarding en Firestore:', err);
    }
  };

  // Swipe Action processing
  const handleSwipeAction = async (car: Car, type: 'like' | 'superlike') => {
    if (!currentUser || !userCar) return;

    if (currentUser.isLocal) {
      const updatedSwiped = [...swipedCarIds, car.id];
      setSwipedCarIds(updatedSwiped);
      localStorage.setItem('automatch_swiped_ids', JSON.stringify(updatedSwiped));

      // 40% chance of Match or 100% chance if superlike
      const isMatch = car.likesUser || type === 'superlike';
      if (isMatch) {
        setTimeout(() => {
          const matchId = `local_match_${car.id}_${Date.now()}`;
          const newMatch: Match = {
            id: matchId,
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

          setMatches(prevMatches => {
            const updatedMatches = [newMatch, ...prevMatches.filter(m => m.car.id !== car.id)];
            localStorage.setItem('automatch_matches', JSON.stringify(updatedMatches));
            return updatedMatches;
          });

          setCelebratedCar(car);
          setCelebrationOpen(true);
          playConfiguredEngineSound();
        }, 600);
      }
      return;
    }

    const swipeId = `swipe_${currentUser.uid}_${car.id}`;
    const swipePayload = {
      id: swipeId,
      senderUid: currentUser.uid,
      targetCarId: car.id,
      type: 'like',
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'swipes', swipeId), swipePayload);
      
      const isMockCar = car.id.startsWith('seeded_') || car.isSeeded;
      let isMatch = false;

      if (isMockCar) {
        isMatch = car.likesUser || type === 'superlike';
      } else {
        // Find if they mutually liked our car
        const userCarId = (userCar as any).id;
        const mutualSwipeQuery = query(
          collection(db, 'swipes'),
          where('senderUid', '==', car.ownerUid),
          where('targetCarId', '==', userCarId),
          where('type', '==', 'like')
        );
        const mutualSnap = await getDocs(mutualSwipeQuery);
        isMatch = !mutualSnap.empty || type === 'superlike';
      }

      if (isMatch) {
        // Create live mutual Match
        const matchId = `match_${currentUser.uid}_${car.ownerUid}_${Date.now()}`;
        const matchPayload = {
          id: matchId,
          participants: [currentUser.uid, car.ownerUid],
          carId1: (userCar as any).id,
          carId2: car.id,
          createdAt: new Date().toISOString(),
          unreadUids: [car.ownerUid],
        };

        await setDoc(doc(db, 'matches', matchId), matchPayload);

        // Add System Match Info message
        const systemMsgRef = doc(collection(db, 'matches', matchId, 'messages'), `sys_msg_${Date.now()}`);
        await setDoc(systemMsgRef, {
          senderUid: 'system',
          text: `[Sistema] ¡Felicidades, es un AutoMatch! Has conectado con ${car.ownerName} para negociar. ${car.ownerName} busca: "${car.permutaPreferences || 'Abierto a ofertas'}"`,
          createdAt: new Date().toISOString()
        });

        // Add initial bot/seller greeting message
        const greetMsgRef = doc(collection(db, 'matches', matchId, 'messages'), `greet_msg_${Date.now()}`);
        await setDoc(greetMsgRef, {
          senderUid: car.ownerUid,
          text: car.chatPersona?.greeting || `¡Hola! Me encantó tu auto. ¿De dónde eres para coordinar?`,
          createdAt: new Date().toISOString()
        });

        // Display celebration interface
        setCelebratedCar(car);
        setCelebrationOpen(true);
        playConfiguredEngineSound();
      }
    } catch (err) {
      console.error('Error al procesar deslizamiento a la derecha:', err);
    }
  };

  const handleSwipeLeft = async (car: Car) => {
    if (!currentUser) return;
    if (currentUser.isLocal) {
      const updatedSwiped = [...swipedCarIds, car.id];
      setSwipedCarIds(updatedSwiped);
      localStorage.setItem('automatch_swiped_ids', JSON.stringify(updatedSwiped));

      const updatedLeftSwiped = [car.id, ...leftSwipedCarIds.filter(id => id !== car.id)];
      setLeftSwipedCarIds(updatedLeftSwiped);
      localStorage.setItem('automatch_left_swiped_ids', JSON.stringify(updatedLeftSwiped));
      return;
    }
    const swipeId = `swipe_${currentUser.uid}_${car.id}`;
    try {
      await setDoc(doc(db, 'swipes', swipeId), {
        id: swipeId,
        senderUid: currentUser.uid,
        targetCarId: car.id,
        type: 'dislike',
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error al procesar deslizamiento a la izquierda:', err);
    }
  };

  const handleSwipeRight = (car: Car) => {
    handleSwipeAction(car, 'like');
  };

  const handleSwipeUp = (car: Car) => {
    handleSwipeAction(car, 'superlike');
  };

  // Enviar mensaje en chat
  const handleSendMessage = async (
    matchId: string, 
    text: string, 
    sender: 'user' | 'other',
    mediaType?: 'photo' | 'video',
    mediaUrl?: string,
    callDuration?: string,
    isCallMessage?: boolean
  ) => {
    if (!currentUser) return;

    if (currentUser.isLocal) {
      const messageId = `msg_${sender}_${Date.now()}`;
      const activeMatch = matches.find(m => m.id === matchId);
      if (!activeMatch) return;

      const newMsg: Message = {
        id: messageId,
        sender,
        text,
        timestamp: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
        mediaType,
        mediaUrl,
        callDuration,
        isCallMessage
      };

      setMatches(prevMatches => {
        const updatedMatches = prevMatches.map(match => {
          if (match.id === matchId) {
            return {
              ...match,
              timestamp: newMsg.timestamp,
              unread: sender === 'other' && matchId !== activeMatchId,
              messages: [...match.messages, newMsg]
            };
          }
          return match;
        });
        localStorage.setItem('automatch_matches', JSON.stringify(updatedMatches));
        return updatedMatches;
      });

      // Gemini bot response for seeded owners in Local mode
      const isMockCar = activeMatch.car.id.startsWith('seeded_') || activeMatch.car.isSeeded;
      if (sender === 'user' && isMockCar) {
        setTimeout(async () => {
          try {
            const response = await fetch('/api/gemini-chat', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                senderName: activeMatch.car.ownerName,
                carSpecs: `${activeMatch.car.brand} ${activeMatch.car.model} ${activeMatch.car.year}, ${activeMatch.car.km} km, ${activeMatch.car.fuel}, transmisión ${activeMatch.car.transmission}`,
                permutaPreferences: activeMatch.car.permutaPreferences,
                chatPersona: activeMatch.car.chatPersona,
                userMessage: text,
                history: activeMatch.messages
              })
            });

            const data = await response.json();
            const replyText = data.text || '¡Buenísima compadre! Estoy manejando ahora pero coordinemos la permuta altiro por Whatsapp.';
            
            const replyMsg: Message = {
              id: `msg_bot_${Date.now()}`,
              sender: 'other',
              text: replyText,
              timestamp: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
            };

            setMatches(prevMatches => {
              const updatedMatches = prevMatches.map(match => {
                if (match.id === matchId) {
                  return {
                    ...match,
                    timestamp: replyMsg.timestamp,
                    unread: matchId !== activeMatchId,
                    messages: [...match.messages, replyMsg]
                  };
                }
                return match;
              });
              localStorage.setItem('automatch_matches', JSON.stringify(updatedMatches));
              return updatedMatches;
            });
          } catch (geminiErr) {
            console.error('Error en la respuesta del bot Gemini:', geminiErr);
          }
        }, 1500);
      }
      return;
    }

    const messageId = `msg_${sender}_${Date.now()}`;
    const activeMatch = matches.find(m => m.id === matchId);
    if (!activeMatch) return;

    const msgPayload = {
      senderUid: sender === 'user' ? currentUser.uid : activeMatch.car.ownerUid,
      text,
      createdAt: new Date().toISOString(),
      mediaType: mediaType || null,
      mediaUrl: mediaUrl || null,
      callDuration: callDuration || null,
      isCallMessage: isCallMessage || false
    };

    try {
      // Add message to match messages subcollection
      await setDoc(doc(collection(db, 'matches', matchId, 'messages'), messageId), msgPayload);

      // Set match as unread for the receiver and update match lastMessage state
      await updateDoc(doc(db, 'matches', matchId), {
        unreadUids: [activeMatch.car.ownerUid]
      });

      // If the target car is a mock seeded AI owner, trigger server side Gemini conversation response!
      const isMockCar = activeMatch.car.id.startsWith('seeded_') || activeMatch.car.isSeeded;
      if (sender === 'user' && isMockCar) {
        setTimeout(async () => {
          try {
            const response = await fetch('/api/gemini-chat', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                senderName: activeMatch.car.ownerName,
                carSpecs: `${activeMatch.car.brand} ${activeMatch.car.model} ${activeMatch.car.year}, ${activeMatch.car.km} km, ${activeMatch.car.fuel}, transmisión ${activeMatch.car.transmission}`,
                permutaPreferences: activeMatch.car.permutaPreferences,
                chatPersona: activeMatch.car.chatPersona,
                userMessage: text,
                history: activeMatch.messages
              })
            });

            const data = await response.json();
            const replyText = data.text || '¡Buenísima compadre! Estoy manejando ahora pero coordinemos la permuta altiro por Whatsapp.';
            
            const replyId = `msg_bot_${Date.now()}`;
            await setDoc(doc(collection(db, 'matches', matchId, 'messages'), replyId), {
              senderUid: activeMatch.car.ownerUid,
              text: replyText,
              createdAt: new Date().toISOString()
            });

            // Mark match as unread for user
            await updateDoc(doc(db, 'matches', matchId), {
              unreadUids: [currentUser.uid]
            });
          } catch (geminiErr) {
            console.error('Error en la respuesta del bot Gemini:', geminiErr);
          }
        }, 1500);
      }
    } catch (err) {
      console.error('Error al enviar el mensaje:', err);
    }
  };

  const handleMarkRead = async (matchId: string) => {
    if (!currentUser) return;
    if (currentUser.isLocal) {
      setMatches(prevMatches => {
        const updatedMatches = prevMatches.map(match => {
          if (match.id === matchId) {
            return { ...match, unread: false };
          }
          return match;
        });
        localStorage.setItem('automatch_matches', JSON.stringify(updatedMatches));
        return updatedMatches;
      });
      return;
    }
    try {
      const matchDocRef = doc(db, 'matches', matchId);
      const matchDocSnap = await getDoc(matchDocRef);
      if (matchDocSnap.exists()) {
        const unreadUids = matchDocSnap.data().unreadUids || [];
        const filteredUnread = unreadUids.filter((uid: string) => uid !== currentUser.uid);
        await updateDoc(matchDocRef, {
          unreadUids: filteredUnread
        });
      }
    } catch (err) {
      console.error('Error al marcar la coincidencia como leída:', err);
    }
  };

  const handleUpdateCar = async (updatedCar: UserCar) => {
    if (!currentUser) return;
    if (currentUser.isLocal) {
      setUserCar(updatedCar);
      localStorage.setItem('automatch_user_car', JSON.stringify(updatedCar));
      return;
    }
    try {
      const carsQuery = query(collection(db, 'cars'), where('ownerUid', '==', currentUser.uid));
      const carsSnap = await getDocs(carsQuery);
      if (!carsSnap.empty) {
        const carDocId = carsSnap.docs[0].id;
        await setDoc(doc(db, 'cars', carDocId), {
          ...updatedCar,
          ownerUid: currentUser.uid,
          ownerName: userName,
          id: carDocId
        }, { merge: true });
      }
      setUserCar(updatedCar);
    } catch (err) {
      console.error('Error al actualizar el perfil del vehículo:', err);
    }
  };

  // Reset swiped list to test again in Firestore
  const handleResetDeck = async () => {
    if (!currentUser) return;
    if (currentUser.isLocal) {
      setSwipedCarIds([]);
      setLeftSwipedCarIds([]);
      localStorage.setItem('automatch_swiped_ids', JSON.stringify([]));
      localStorage.setItem('automatch_left_swiped_ids', JSON.stringify([]));
      return;
    }
    try {
      const swipesQuery = query(collection(db, 'swipes'), where('senderUid', '==', currentUser.uid));
      const swipesSnap = await getDocs(swipesQuery);
      for (const swDoc of swipesSnap.docs) {
        await deleteDoc(doc(db, 'swipes', swDoc.id));
      }
    } catch (err) {
      console.error('Error al restablecer el mazo de deslizamientos:', err);
    }
  };

  const handleRecoverCar = async (carId: string) => {
    if (!currentUser) return;
    if (currentUser.isLocal) {
      const updatedSwiped = swipedCarIds.filter(id => id !== carId);
      setSwipedCarIds(updatedSwiped);
      localStorage.setItem('automatch_swiped_ids', JSON.stringify(updatedSwiped));

      const updatedLeftSwiped = leftSwipedCarIds.filter(id => id !== carId);
      setLeftSwipedCarIds(updatedLeftSwiped);
      localStorage.setItem('automatch_left_swiped_ids', JSON.stringify(updatedLeftSwiped));
      return;
    }
    try {
      const swipeId = `swipe_${currentUser.uid}_${carId}`;
      await deleteDoc(doc(db, 'swipes', swipeId));
    } catch (err) {
      console.error('Error al recuperar el auto deslizado:', err);
    }
  };

  const handleLikeCarDirectly = (car: Car) => {
    handleSwipeAction(car, 'like');
  };

  // Boost simulated premium feature
  const handleBoost = () => {
    setIsBoosted(true);
    setTimeout(() => {
      // Find a car that isn't already matched
      const unmatched = dbCars.filter(c => c.ownerUid !== currentUser?.uid && !matches.some(m => m.car.id === c.id));
      const randomCar = unmatched.length > 0 ? unmatched[Math.floor(Math.random() * unmatched.length)] : dbCars[0];

      if (randomCar) {
        handleSwipeAction(randomCar, 'superlike');
      }
    }, 3000);
  };

  // Clear all saved data (Sign Out)
  const handleHardReset = async () => {
    if (confirm('¿Estás seguro de cerrar sesión de AutoMatch Chile?')) {
      if (currentUser?.isLocal) {
        setUserCar(null);
        setUserName('');
        setSwipedCarIds([]);
        setLeftSwipedCarIds([]);
        setMatches([]);
        setIsBoosted(false);
        setActiveTab('swipe');
        setActiveMatchId(null);
        setDetailCar(null);
        setCurrentUser(null);
        localStorage.removeItem('automatch_user_name');
        localStorage.removeItem('automatch_user_car');
        localStorage.removeItem('automatch_swiped_ids');
        localStorage.removeItem('automatch_left_swiped_ids');
        localStorage.removeItem('automatch_matches');
        return;
      }
      try {
        await signOut(auth);
        setUserCar(null);
        setUserName('');
        setSwipedCarIds([]);
        setLeftSwipedCarIds([]);
        setMatches([]);
        setIsBoosted(false);
        setActiveTab('swipe');
        setActiveMatchId(null);
        setDetailCar(null);
      } catch (err) {
        console.error('Error al cerrar sesión:', err);
      }
    }
  };

  const playConfiguredEngineSound = () => {
    const savedSound = (localStorage.getItem('automatch_engine_sound') as EngineType) || 'v8';
    playEngineSound(savedSound);
  };

  const handleUpdateSearchPreferences = (prefs: { maxKm: string; region: string }) => {
    setSearchPreferences(prefs);
  };

  // Filter cars to show in SwipeDeck
  const remainingCars = dbCars.filter(car => {
    // 0. Exclude own car
    if (userCar && car.ownerUid === currentUser?.uid) return false;

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
          currentUser={currentUser}
          onGoogleSignIn={handleGoogleSignIn}
          onGuestSignIn={handleGuestSignIn}
          authLoading={authLoading}
          authError={authError}
          onSelectLocalMode={handleSelectLocalMode}
          onClearAuthError={() => setAuthError(null)}
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
