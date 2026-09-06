
/* =====================================================
 import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-storage.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBIDirFgyFwAtI8uMSOsFrxzTtV98hQ5r8",
  authDomain: "ezmoire.firebaseapp.com",
  projectId: "ezmoire",
  storageBucket: "ezmoire.firebasestorage.app",
  messagingSenderId: "101033230324",
  appId: "1:101033230324:web:648af3db45d65c5de3c3a1",
 
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export {
    app,
    db,
    storage,
    auth
};

console.log("Firebase berhasil terhubung!");
console.log("Firestore:", db);
===================================================== 

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
    getFirestore,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-storage.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBIDirFgyFwAtI8uMSOsFrxzTtV98hQ5r8",
  authDomain: "ezmoire.firebaseapp.com",
  projectId: "ezmoire",
  storageBucket: "ezmoire.firebasestorage.app",
  messagingSenderId: "101033230324",
  appId: "1:101033230324:web:648af3db45d65c5de3c3a1"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

/*
    Firebase dibuat tersedia
    untuk script.js
*//*
window.firebaseDB = db;
window.firebaseCollection = collection;
window.firebaseGetDocs = getDocs;

console.log("Firebase berhasil terhubung!");
*/
/* =====================================================
   EZMOIRE
   FIREBASE CONFIGURATION
===================================================== */

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    getDocs,
    doc,
    setDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";


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
   INITIALIZE FIREBASE
===================================================== */

const app =
    initializeApp(firebaseConfig);


/* =====================================================
   SERVICES
===================================================== */

const auth =
    getAuth(app);

const db =
    getFirestore(app);

const storage =
    getStorage(app);


/* =====================================================
   EXPOSE TO script.js
===================================================== */

window.firebaseApp =
    app;

window.firebaseAuth =
    auth;

window.firebaseDB =
    db;

window.firebaseStorage =
    storage;


/* =====================================================
   AUTH
===================================================== */

window.firebaseSignIn =
    signInWithEmailAndPassword;

window.firebaseSignOut =
    signOut;

window.firebaseOnAuthStateChanged =
    onAuthStateChanged;


/* =====================================================
   FIRESTORE
===================================================== */

window.firebaseCollection =
    collection;

window.firebaseGetDocs =
    getDocs;

window.firebaseDoc =
    doc;

window.firebaseSetDoc =
    setDoc;

window.firebaseDeleteDoc =
    deleteDoc;


/* =====================================================
   STORAGE
===================================================== */

window.firebaseStorageRef =
    ref;

window.firebaseUploadBytes =
    uploadBytes;

window.firebaseGetDownloadURL =
    getDownloadURL;

window.firebaseDeleteObject =
    deleteObject;


/* =====================================================
   READY FLAG
===================================================== */

window.firebaseReady =
    true;

console.log(
    "Ezmoire Firebase berhasil terhubung."
);
