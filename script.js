import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ------------------------------------------------------------------
   STEP 1: Paste your Firebase web app config here.
   Firebase console > Project settings > Your apps > Web app > Config
------------------------------------------------------------------- */
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const configMissing = firebaseConfig.apiKey.startsWith("YOUR_");

let auth = null;
let db = null;
if (!configMissing) {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

// Elements
const authView = document.getElementById("auth-view");
const appView = document.getElementById("app-view");
const tabLogin = document.getElementById("tab-login");
const tabSignup = document.getElementById("tab-signup");
const form = document.getElementById("auth-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const submitBtn = document.getElementById("submit-btn");
const message = document.getElementById("message");
const userEmail = document.getElementById("user-email");
const logoutBtn = document.getElementById("logout-btn");

let mode = "login";

function showMessage(text, ok = false) {
  message.textContent = text;
  message.classList.toggle("ok", ok);
  message.hidden = false;
}

function clearMessage() {
  message.hidden = true;
  message.textContent = "";
}

function setMode(next) {
  mode = next;
  const isLogin = next === "login";
  tabLogin.classList.toggle("active", isLogin);
  tabSignup.classList.toggle("active", !isLogin);
  tabLogin.setAttribute("aria-selected", isLogin);
  tabSignup.setAttribute("aria-selected", !isLogin);
  submitBtn.textContent = isLogin ? "Log in" : "Create account";
  passwordInput.autocomplete = isLogin ? "current-password" : "new-password";
  clearMessage();
  if (configMissing) showSetupMessage();
}

function showSetupMessage() {
  showMessage("Setup needed: add your Firebase config in script.js (see the setup guide).");
}

function friendlyError(code) {
  switch (code) {
    case "auth/invalid-email": return "That email address doesn't look right.";
    case "auth/missing-password": return "Enter a password.";
    case "auth/weak-password": return "Use a password with at least 6 characters.";
    case "auth/email-already-in-use": return "An account with this email already exists. Try logging in.";
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password": return "Email or password is incorrect.";
    case "auth/too-many-requests": return "Too many attempts. Wait a few minutes and try again.";
    case "auth/network-request-failed": return "No connection. Check your internet and try again.";
    default: return "Something went wrong. Please try again.";
  }
}

tabLogin.addEventListener("click", () => setMode("login"));
tabSignup.addEventListener("click", () => setMode("signup"));

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (configMissing) return showSetupMessage();

  clearMessage();
  submitBtn.disabled = true;
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  try {
    if (mode === "login") {
      await signInWithEmailAndPassword(auth, email, password);
    } else {
      await createUserWithEmailAndPassword(auth, email, password);
    }
    form.reset();
  } catch (err) {
    showMessage(friendlyError(err.code));
  } finally {
    submitBtn.disabled = false;
  }
});

logoutBtn.addEventListener("click", () => auth && signOut(auth));

if (configMissing) {
  showSetupMessage();
} else {
  onAuthStateChanged(auth, (user) => {
    const loggedIn = Boolean(user);
    authView.hidden = loggedIn;
    appView.hidden = !loggedIn;
    userEmail.textContent = loggedIn ? user.email : "";
    window.scrollTo(0, 0);
  });
}

/* ---------------- Feedback (saved in Firestore) ---------------- */
const fbForm = document.getElementById("feedback-form");
const fbRating = document.getElementById("fb-rating");
const fbText = document.getElementById("fb-text");
const fbSubmit = document.getElementById("fb-submit");
const fbMessage = document.getElementById("fb-message");

function showFb(text, ok) {
  fbMessage.textContent = text;
  fbMessage.classList.toggle("ok", ok);
  fbMessage.hidden = false;
}

fbForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = fbText.value.trim();
  if (!auth || !auth.currentUser) return showFb("Log in to send feedback.", false);
  if (text.length < 3) return showFb("Write a short message before sending.", false);

  fbSubmit.disabled = true;
  try {
    await addDoc(collection(db, "feedback"), {
      uid: auth.currentUser.uid,
      email: auth.currentUser.email,
      rating: Number(fbRating.value),
      message: text,
      createdAt: serverTimestamp(),
    });
    fbForm.reset();
    showFb("Thank you! Your feedback was sent.", true);
  } catch (err) {
    showFb("Could not send feedback. Check your connection and try again.", false);
  } finally {
    fbSubmit.disabled = false;
  }
});
