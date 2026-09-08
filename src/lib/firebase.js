//Iz NPM

import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';

//Iz Config

const firebaseConfig = {

 

};
//Iz NPM
const app = initializeApp(firebaseConfig);

// Eksplicitno mu prosleđujemo ime baze "default" i long polling da preskoči mrežne blokade

//Dodati i izmijeniti ime baze u ovom slučaju default
export const db = initializeFirestore(app, {
	experimentalForceLongPolling: true
});

