/**
 * Firebase Configuration
 * IMPORTANT: Replace this placeholder config with your actual Firebase project credentials
 * 
 * To get your config:
 * 1. Go to https://console.firebase.google.com/
 * 2. Select your project
 * 3. Go to Project Settings (gear icon)
 * 4. Scroll down to "Your apps" section
 * 5. Click on the web app (</>) or create one
 * 6. Copy the firebaseConfig object
 */

// TODO: Replace with your actual Firebase configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Check if Firebase config is set up
if (firebaseConfig.apiKey === "YOUR_API_KEY") {
    console.warn('⚠️ Firebase not configured! Please update js/firebase-config.js with your Firebase credentials.');
    console.warn('📖 See firebase-setup-guide.md in the artifacts folder for instructions.');

    // Show user-friendly error
    window.addEventListener('DOMContentLoaded', () => {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                alert('Firebase is not configured yet!\n\nPlease update js/firebase-config.js with your Firebase project credentials.\n\nSee the Firebase Setup Guide for instructions.');
            });
        });
    });
} else {
    // Initialize Firebase only if configured
    try {
        firebase.initializeApp(firebaseConfig);

        // Initialize Firebase services
        const auth = firebase.auth();
        const db = firebase.firestore();
        const storage = firebase.storage();

        // Export for use in other files
        window.firebaseAuth = auth;
        window.firebaseDb = db;
        window.firebaseStorage = storage;

        console.log('✅ Firebase initialized successfully');
    } catch (error) {
        console.error('❌ Firebase initialization error:', error);
        alert('Firebase initialization failed. Please check your configuration.');
    }
}
