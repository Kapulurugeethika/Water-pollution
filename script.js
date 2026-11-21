/* ==========================================
   AQUACARE - WATER POLLUTION AWARENESS
   Firebase Authentication + EmailJS Feedback
========================================== */

// FIREBASE IMPORTS
import { initializeApp } from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    sendPasswordResetEmail
} from
"https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import emailjs from
"https://cdn.jsdelivr.net/npm/@emailjs/browser@4/+esm";


// ==========================================
// FIREBASE CONFIGURATION
// ==========================================

const firebaseConfig = {
    apiKey: "AIzaSyC1MObspbNouwu8iT50HMppqemkyUW64Gw",
    authDomain: "water-pollution-a35ca.firebaseapp.com",
    projectId: "water-pollution-a35ca",
    storageBucket: "water-pollution-a35ca.firebasestorage.app",
    messagingSenderId: "295204696306",
    appId: "1:295204696306:web:c0a3846e2f85014b74606b",
    measurementId: "G-8SZJD6K2EN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


// ==========================================
// HTML ELEMENTS
// ==========================================

const authContainer = document.getElementById("authContainer");
const mainWebsite = document.getElementById("mainWebsite");

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

const showLogin = document.getElementById("showLogin");
const showSignup = document.getElementById("showSignup");

const authMessage = document.getElementById("authMessage");
const userName = document.getElementById("userName");

const logoutBtn = document.getElementById("logoutBtn");


// ==========================================
// LOGIN / SIGNUP TAB SWITCHING
// ==========================================

showLogin.addEventListener("click", () => {

    loginForm.classList.remove("hidden");
    signupForm.classList.add("hidden");

    showLogin.classList.add("active");
    showSignup.classList.remove("active");

    authMessage.textContent = "";
});

showSignup.addEventListener("click", () => {

    signupForm.classList.remove("hidden");
    loginForm.classList.add("hidden");

    showSignup.classList.add("active");
    showLogin.classList.remove("active");

    authMessage.textContent = "";
});

// Default tab
showLogin.classList.add("active");


// ==========================================
// USER SIGNUP
// ==========================================

signupForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;

    try {

        authMessage.textContent = "Creating your account...";

        const result = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

        await updateProfile(result.user, {
            displayName: name
        });

        authMessage.textContent = "Account created successfully!";

        signupForm.reset();

    } catch (error) {

        authMessage.textContent = error.message;

    }

});


// ==========================================
// USER LOGIN
// ==========================================

loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    try {

        authMessage.textContent = "Logging in...";

        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        authMessage.textContent = "Login successful!";

        loginForm.reset();

    } catch (error) {

        authMessage.textContent = error.message;

    }

});


// ==========================================
// FORGOT PASSWORD
// ==========================================

document.getElementById("forgotPassword")
.addEventListener("click", async (e) => {

    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();

    if (!email) {

        authMessage.textContent =
            "Please enter your email address first.";

        return;

    }

    try {

        await sendPasswordResetEmail(auth, email);

        authMessage.textContent =
            "Password reset link sent to your email.";

    } catch (error) {

        authMessage.textContent = error.message;

    }

});


// ==========================================
// AUTHENTICATION STATE
// ==========================================

onAuthStateChanged(auth, (user) => {

    if (user) {

        authContainer.classList.add("hidden");
        mainWebsite.classList.remove("hidden");

        userName.textContent =
            "Welcome, " + (user.displayName || user.email);

        const feedbackName =
            document.getElementById("feedbackName");

        const feedbackEmail =
            document.getElementById("feedbackEmail");

        if (feedbackName && user.displayName) {
            feedbackName.value = user.displayName;
        }

        if (feedbackEmail) {
            feedbackEmail.value = user.email || "";
        }

    } else {

        authContainer.classList.remove("hidden");
        mainWebsite.classList.add("hidden");

        userName.textContent = "";

    }

});


// ==========================================
// LOGOUT
// ==========================================

logoutBtn.addEventListener("click", async () => {

    try {

        await signOut(auth);

        authMessage.textContent = "Logged out successfully!";

    } catch (error) {

        console.error(error);

    }

});


// ==========================================
// EMAILJS CONFIGURATION
// Add your IDs after creating EmailJS service
// ==========================================

const EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY";
const EMAILJS_SERVICE_ID = "YOUR_SERVICE_ID";
const EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID";


// ==========================================
// FEEDBACK FORM
// ==========================================

const feedbackForm =
    document.getElementById("feedbackForm");

feedbackForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const feedbackStatus =
        document.getElementById("feedbackStatus");

    if (
        EMAILJS_PUBLIC_KEY === "YOUR_PUBLIC_KEY" ||
        EMAILJS_SERVICE_ID === "YOUR_SERVICE_ID" ||
        EMAILJS_TEMPLATE_ID === "YOUR_TEMPLATE_ID"
    ) {

        feedbackStatus.textContent =
            "EmailJS setup is pending. Please configure it first.";

        return;

    }

    const templateParams = {

        from_name:
            document.getElementById("feedbackName").value,

        from_email:
            document.getElementById("feedbackEmail").value,

        rating:
            document.getElementById("feedbackRating").value,

        message:
            document.getElementById("feedbackMessage").value

    };

    try {

        feedbackStatus.textContent = "Sending feedback...";

        await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            templateParams,
            {
                publicKey: EMAILJS_PUBLIC_KEY
            }
        );

        feedbackStatus.textContent =
            "Thank you! Your feedback was submitted successfully.";

        feedbackForm.reset();

    } catch (error) {

        console.error("EmailJS Error:", error);

        feedbackStatus.textContent =
            "Unable to send feedback. Please try again.";

    }

});

console.log("AquaCare website JavaScript loaded successfully!");
