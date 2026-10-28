// firebase.js
// firebase.js

import firebase from "firebase/compat/app";

import "firebase/compat/auth";

const firebaseConfig = {

  apiKey:
    "AIzaSyAlY-EYvJXY9b5Jw5XLmfVBoFlwlA2K6hs",

  authDomain:
    "ecommerce-1c530.firebaseapp.com",

  projectId:
    "ecommerce-1c530",

  storageBucket:
    "ecommerce-1c530.firebasestorage.app",

  messagingSenderId:
    "198032039713",

  appId:
    "1:198032039713:web:37c42001e16c37d14c2860",

  measurementId:
    "G-X566WPS4B7",

};


if (!firebase.apps.length) {

  firebase.initializeApp(firebaseConfig);

}

const auth = firebase.auth();

export { auth, firebase };







// const firebaseConfig = {
//   apiKey: "AIzaSyDT5W0baY0COmqBVE2q1vkqnwFHUNZuvIA",
//   authDomain: "ecommerce-b46d6.firebaseapp.com",
//   projectId: "ecommerce-b46d6",
//   storageBucket: "ecommerce-b46d6.appspot.com",
//   messagingSenderId: "14090505629",
//   appId: "1:14090505629:web:a14a837b4f881039a63374",
//   measurementId: "G-GF4RTV3LQJ",
// };