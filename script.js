/* =================================
   FIREBASE CONFIGURATION
================================= */

// Replace these values with your Firebase project details.

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC1MObspbNouwu8iT50HMppqemkyUW64Gw",
  authDomain: "water-pollution-a35ca.firebaseapp.com",
  projectId: "water-pollution-a35ca",
  storageBucket: "water-pollution-a35ca.firebasestorage.app",
  messagingSenderId: "295204696306",
  appId: "1:295204696306:web:329e5056154aceb074606b",
  measurementId: "G-G51QM7THKT"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();


/* =================================
   EMAILJS CONFIGURATION
================================= */

const EMAILJS_PUBLIC_KEY = "YOUR_EMAILJS_PUBLIC_KEY";
const EMAILJS_SERVICE_ID = "YOUR_EMAILJS_SERVICE_ID";
const EMAILJS_TEMPLATE_ID = "YOUR_EMAILJS_TEMPLATE_ID";

emailjs.init({
    publicKey: EMAILJS_PUBLIC_KEY
});


/* =================================
   PAGE ELEMENTS
================================= */

const authPage = document.getElementById("authPage");
const mainWebsite = document.getElementById("mainWebsite");

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

const authMessage = document.getElementById("authMessage");


/* =================================
   LOGIN / SIGNUP SWITCH
================================= */

function showLogin() {

    loginForm.classList.remove("hidden");
    signupForm.classList.add("hidden");

    authMessage.textContent = "";
}

function showSignup() {

    signupForm.classList.remove("hidden");
    loginForm.classList.add("hidden");

    authMessage.textContent = "";
}


/* =================================
   LOGIN
================================= */

loginForm.addEventListener("submit", async function(e) {

    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    authMessage.textContent = "Logging in...";

    try {

        await auth.signInWithEmailAndPassword(email, password);

        authMessage.textContent = "Login successful!";

    } catch(error) {

        authMessage.textContent = getAuthError(error.code);

    }

});


/* =================================
   SIGNUP
================================= */

signupForm.addEventListener("submit", async function(e) {

    e.preventDefault();

    const name = document.getElementById("fullName").value.trim();

    const email = document.getElementById("signupEmail").value.trim();

    const password = document.getElementById("signupPassword").value;

    const confirm = document.getElementById("confirmPassword").value;

    if(name.length < 2) {

        authMessage.textContent = "Please enter your full name.";

        return;
    }

    if(password !== confirm) {

        authMessage.textContent = "Passwords do not match.";

        return;
    }

    if(password.length < 6) {

        authMessage.textContent = "Password must contain at least 6 characters.";

        return;
    }

    authMessage.textContent = "Creating account...";

    try {

        const result = await auth.createUserWithEmailAndPassword(
            email,
            password
        );

        await result.user.updateProfile({
            displayName: name
        });

        await result.user.reload();

        authMessage.textContent = "Account created successfully!";

    } catch(error) {

        authMessage.textContent = getAuthError(error.code);

    }

});


/* =================================
   AUTHENTICATION STATE
================================= */

auth.onAuthStateChanged(function(user) {

    if(user) {

        authPage.classList.add("hidden");

        mainWebsite.classList.remove("hidden");

    } else {

        mainWebsite.classList.add("hidden");

        authPage.classList.remove("hidden");

    }

});


/* =================================
   ERROR HANDLING
================================= */

function getAuthError(code) {

    const errors = {

        "auth/email-already-in-use":
        "This email is already registered.",

        "auth/invalid-email":
        "Please enter a valid email address.",

        "auth/weak-password":
        "Please choose a stronger password.",

        "auth/user-not-found":
        "No account found with this email.",

        "auth/wrong-password":
        "Incorrect email or password.",

        "auth/invalid-credential":
        "Incorrect email or password.",

        "auth/too-many-requests":
        "Too many attempts. Please try again later.",

        "auth/network-request-failed":
        "Network error. Check your internet connection."

    };

    return errors[code] || "Something went wrong. Please try again.";
}


/* =================================
   LOGOUT
================================= */

async function logout() {

    try {

        await auth.signOut();

        loginForm.reset();
        signupForm.reset();

        authMessage.textContent = "";

    } catch(error) {

        alert("Unable to logout. Please try again.");

    }

}


/* =================================
   EMAILJS FEEDBACK
================================= */

const feedbackForm = document.getElementById("feedbackForm");

feedbackForm.addEventListener("submit", async function(e) {

    e.preventDefault();

    const user = auth.currentUser;

    if(!user) {

        alert("Please login first.");

        return;
    }

    const name = document.getElementById("feedbackName").value.trim();

    const email = document.getElementById("feedbackEmail").value.trim();

    const rating = document.getElementById("rating").value;

    const message = document.getElementById("feedbackMessage").value.trim();

    const status = document.getElementById("feedbackStatus");

    if(!name || !email || !rating || !message) {

        status.textContent = "Please fill all fields.";

        return;
    }

    const button = feedbackForm.querySelector("button");

    button.disabled = true;
    status.textContent = "Sending feedback...";

    try {

    await db.collection("feedback").add({
        name: name,
        email: email,
        message: message,
        rating: Number(rating)
    });

    await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            {
                user_name: name,
                user_email: email,
                rating: rating,
                feedback_message: message
            }
        );

        status.textContent = "Thank you! Your feedback was sent successfully.";

        feedbackForm.reset();

    } catch(error) {

        console.error("EmailJS error:", error);

        status.textContent = "Unable to send feedback. Please try again.";

    } finally {

        button.disabled = false;

    }

});
