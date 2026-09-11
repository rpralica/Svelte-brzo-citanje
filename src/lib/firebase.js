//Iz NPM

import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth'; // <-- 1. Uvezeš getAuth

const firebaseConfig = {
	apiKey: 'AIzaSyDskYYXxUGK-tLyqnSBJoVSn6KPtZshlsI',
	authDomain: 'svitanjebrzo.firebaseapp.com',
	projectId: 'svitanjebrzo',
	storageBucket: 'svitanjebrzo.firebasestorage.app',
	messagingSenderId: '206281377812',
	appId: '1:206281377812:web:772659d4b93f0b13f53f01'
};

// Inicijalizacija aplikacije
const app = initializeApp(firebaseConfig);

// Inicijalizacija Firestore baze
export const db = initializeFirestore(app, {
	experimentalForceLongPolling: true
});

// <-- 2. Inicijalizujes i eksportuješ auth da bi mogao raditi login u komponentama
export const auth = getAuth(app);