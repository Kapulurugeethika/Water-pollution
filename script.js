/* =====================================================================
   Water Pollution Awareness - script.js
   Firebase Authentication (email/password) + EmailJS feedback
   ===================================================================== */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged, updateProfile, sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/* ---------- 1. YOUR CONFIGURATION (replace the placeholders) ----------
   Firebase web config and the EmailJS public key are designed to be public.
   Security comes from Firebase "Authorized domains" and EmailJS domain
   restrictions (see README steps). NEVER put EmailJS private keys,
   Firebase service-account files or passwords in this file. */
const firebaseConfig = {
  apiKey: "AIzaSyC1MObspbNouwu8iT50HMppqemkyUW64Gw",
  authDomain: "water-pollution-a35ca.firebaseapp.com",
  projectId: "water-pollution-a35ca",
  storageBucket: "water-pollution-a35ca.firebasestorage.app",
  messagingSenderId: "295204696306",
  appId: "1:295204696306:web:329e5056154aceb074606b",
   measurementld:"G-G51QM7THKT"
};
const EMAILJS_PUBLIC_KEY = "QGwfGkJi-LGsBR9IS";
const EMAILJS_SERVICE_ID = "service_y08nyqz";
const EMAILJS_TEMPLATE_ID = "template_eldi74k";

/* ---------- 2. Setup ---------- */
const $ = (id) => document.getElementById(id);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const configReady = !firebaseConfig.apiKey.startsWith("YOUR_");
let auth = null;
if (configReady) {
  auth = getAuth(initializeApp(firebaseConfig));
}
if (window.emailjs && !EMAILJS_PUBLIC_KEY.startsWith("YOUR_")) {
  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
}

/* ---------- 3. Helpers ---------- */
function showMsg(el, text, type) {
  el.textContent = text;
  el.className = "msg " + type;
}
function clearMsg(el) { el.textContent = ""; el.className = "msg"; }
function setBusy(btn, busy, label) {
  btn.disabled = busy;
  if (label) btn.textContent = label;
}
function friendlyAuthError(code) {
  const map = {
    "auth/email-already-in-use": "This email is already registered. Please log in instead.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/weak-password": "Password is too weak. Use at least 6 characters.",
    "auth/user-not-found": "No account found with this email. Please sign up first.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/invalid-credential": "Incorrect email or password. Please try again.",
    "auth/too-many-requests": "Too many attempts. Please wait a few minutes and try again.",
    "auth/network-request-failed": "Network error. Check your internet connection.",
    "auth/operation-not-allowed": "Email/password sign-in is not enabled in Firebase yet."
  };
  return map[code] || "Something went wrong. Please try again.";
}

/* ---------- 4. Login / Signup tabs ---------- */
const authMsg = $("authMsg");
function switchTab(which) {
  const login = which === "login";
  $("loginForm").classList.toggle("hidden", !login);
  $("signupForm").classList.toggle("hidden", login);
  $("tabLogin").classList.toggle("active", login);
  $("tabSignup").classList.toggle("active", !login);
  $("tabLogin").setAttribute("aria-selected", login);
  $("tabSignup").setAttribute("aria-selected", !login);
  clearMsg(authMsg);
}
$("tabLogin").addEventListener("click", () => switchTab("login"));
$("tabSignup").addEventListener("click", () => switchTab("signup"));

if (!configReady) {
  showMsg(authMsg, "Setup needed: add your Firebase config in script.js.", "error");
}

/* ---------- 5. Signup ---------- */
$("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  clearMsg(authMsg);
  const name = $("signName").value.trim();
  const email = $("signEmail").value.trim();
  const pass = $("signPassword").value;
  const confirm = $("signConfirm").value;

  if (name.length < 2) return showMsg(authMsg, "Please enter your full name.", "error");
  if (!EMAIL_RE.test(email)) return showMsg(authMsg, "Please enter a valid email address.", "error");
  if (pass.length < 6) return showMsg(authMsg, "Password must be at least 6 characters.", "error");
  if (pass !== confirm) return showMsg(authMsg, "Passwords do not match.", "error");
  if (!auth) return showMsg(authMsg, "Firebase is not configured yet.", "error");

  const btn = $("signupBtn");
  setBusy(btn, true, "Creating account...");
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(cred.user, { displayName: name });
    $("welcomeUser").textContent = "Welcome, " + name + "!";
    $("fbName").value = name;
    $("signupForm").reset();
  } catch (err) {
    showMsg(authMsg, friendlyAuthError(err.code), "error");
  } finally {
    setBusy(btn, false, "Create account");
  }
});

/* ---------- 6. Login ---------- */
$("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  clearMsg(authMsg);
  const email = $("loginEmail").value.trim();
  const pass = $("loginPassword").value;

  if (!EMAIL_RE.test(email)) return showMsg(authMsg, "Please enter a valid email address.", "error");
  if (!pass) return showMsg(authMsg, "Please enter your password.", "error");
  if (!auth) return showMsg(authMsg, "Firebase is not configured yet.", "error");

  const btn = $("loginBtn");
  setBusy(btn, true, "Logging in...");
  try {
    await signInWithEmailAndPassword(auth, email, pass);
    $("loginForm").reset();
  } catch (err) {
    showMsg(authMsg, friendlyAuthError(err.code), "error");
  } finally {
    setBusy(btn, false, "Log in");
  }
});

/* ---------- 7. Forgot password ---------- */
$("forgotBtn").addEventListener("click", async () => {
  clearMsg(authMsg);
  const email = $("loginEmail").value.trim();
  if (!EMAIL_RE.test(email)) return showMsg(authMsg, "Enter your email above, then click Forgot password.", "error");
  if (!auth) return showMsg(authMsg, "Firebase is not configured yet.", "error");
  try {
    await sendPasswordResetEmail(auth, email);
    showMsg(authMsg, "Password reset email sent. Check your inbox.", "success");
  } catch (err) {
    showMsg(authMsg, friendlyAuthError(err.code), "error");
  }
});

/* ---------- 8. Logout ---------- */
$("logoutBtn").addEventListener("click", async () => {
  try { await signOut(auth); }
  catch { alert("Could not log out. Please try again."); }
});

/* ---------- 9. Protect content: show only when signed in ---------- */
if (auth) {
  onAuthStateChanged(auth, (user) => {
    const loggedIn = !!user;
    $("authView").classList.toggle("hidden", loggedIn);
    $("appView").classList.toggle("hidden", !loggedIn);
    if (loggedIn) {
      const name = user.displayName || user.email;
      $("welcomeUser").textContent = "Welcome, " + name + "!";
      if (!$("fbName").value) $("fbName").value = user.displayName || "";
      $("fbEmail").value = user.email || "";
      window.scrollTo(0, 0);
    } else {
      switchTab("login");
    }
  });
}

/* ---------- 10. Mobile menu ---------- */
const menuToggle = $("menuToggle"), navLinks = $("navLinks");
menuToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", open);
});
navLinks.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  })
);

/* ---------- 11. Star rating ---------- */
let rating = 0;
const stars = [...document.querySelectorAll("#stars button")];
function paintStars(n) {
  stars.forEach((s) => {
    const v = Number(s.dataset.value);
    s.classList.toggle("on", v <= n);
    s.setAttribute("aria-checked", v === rating);
  });
}
stars.forEach((s) => {
  s.addEventListener("click", () => { rating = Number(s.dataset.value); paintStars(rating); });
  s.addEventListener("mouseenter", () => paintStars(Number(s.dataset.value)));
});
$("stars").addEventListener("mouseleave", () => paintStars(rating));

/* ---------- 12. Feedback via EmailJS ---------- */
const fbMsg = $("feedbackMsg");
$("feedbackForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  clearMsg(fbMsg);
  const name = $("fbName").value.trim();
  const email = $("fbEmail").value.trim();
  const message = $("suggestionsMessage").value.trim();

  if (name.length < 2) return showMsg(fbMsg, "Please enter your name.", "error");
  if (!EMAIL_RE.test(email)) return showMsg(fbMsg, "Please enter a valid email address.", "error");
  if (message.length < 5) return showMsg(fbMsg, "Please write your suggestion message.", "error");
  if (!window.emailjs || EMAILJS_PUBLIC_KEY.startsWith("YOUR_")) {
    return showMsg(fbMsg, "Setup needed: add your EmailJS keys in script.js.", "error");
  }

  const btn = $("fbBtn");
  setBusy(btn, true, "Sending...");
  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      user_name: name,
      user_email: email,
      message: message
    });
    showMsg(fbMsg, "Thank you! Your feedback was sent successfully.", "success");
    $("suggestionsMessage").value = "";
    rating = 0;
    paintStars(0);
  } catch (err) {
    showMsg(fbMsg, "Unable to send feedback. Please try again later.", "error");
  } finally {
    setBusy(btn, false, "Submit ");
  }
});
