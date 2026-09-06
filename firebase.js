/* =====================================================
   EZMOIRE
   FIREBASE CONFIGURATION
   FINAL
===================================================== */

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    getFirestore,
    collection,
    getDocs,
    doc,
    setDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-storage.js";


/* =====================================================
   FIREBASE CONFIG
===================================================== */

const firebaseConfig = {
    apiKey: "AIzaSyBIDirFgyFwAtI8uMSOsFrxzTtV98hQ5r8",
    authDomain: "ezmoire.firebaseapp.com",
    projectId: "ezmoire",
    storageBucket: "ezmoire.firebasestorage.app",
    messagingSenderId: "101033230324",
    appId: "1:101033230324:web:648af3db45d65c5de3c3a1"
};


/* =====================================================
   INITIALIZE
===================================================== */

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);


/* =====================================================
   EXPOSE FIREBASE TO script.js
===================================================== */

window.firebaseApp = app;

window.firebaseAuth = auth;
window.firebaseDB = db;
window.firebaseStorage = storage;


/* =====================================================
   AUTH
===================================================== */

window.firebaseSignIn = signInWithEmailAndPassword;
window.firebaseSignOut = signOut;
window.firebaseOnAuthStateChanged = onAuthStateChanged;


/* =====================================================
   FIRESTORE
===================================================== */

window.firebaseCollection = collection;
window.firebaseGetDocs = getDocs;
window.firebaseDoc = doc;
window.firebaseSetDoc = setDoc;
window.firebaseDeleteDoc = deleteDoc;


/* =====================================================
   STORAGE
===================================================== */

window.firebaseStorageRef = ref;
window.firebaseUploadBytes = uploadBytes;
window.firebaseGetDownloadURL = getDownloadURL;
window.firebaseDeleteObject = deleteObject;


/* =====================================================
   READY
===================================================== */

window.firebaseReady = true;

console.log("Ezmoire Firebase berhasil terhubung.");
