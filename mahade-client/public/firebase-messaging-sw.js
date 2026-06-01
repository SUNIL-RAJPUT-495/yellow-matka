// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyAow4Y0molHw6rXyDs4dDgDVxsEtpUBQGY",
    authDomain: "mahadev-matka-c86dc.firebaseapp.com",
    projectId: "mahadev-matka-c86dc",
    storageBucket: "mahadev-matka-c86dc.firebasestorage.app",
    messagingSenderId: "866200336235",
    appId: "1:866200336235:web:bb98035195d439a7f3fe2e"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/logo192.png' 
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
