// Firebase config and auth logic
const firebaseConfig = {
  apiKey: "AIzaSyBucPtSiBjIKiJNENfNYbRrIAfNNMG9AJQ",
  authDomain: "dog-api-28c13.firebaseapp.com",
  projectId: "dog-api-28c13",
  appId: "1:1095462021524:web:d5d5982bd25bcc0b908781"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const googleProvider = new firebase.auth.GoogleAuthProvider();

const authPage = document.getElementById('auth-container');
const dashboardPage = document.getElementById('dashboard-container');
const form = document.querySelector('.auth-form');
const googleSignInBtn = document.getElementById('google-signin-btn');
const createAccountLink = document.getElementById('create-account-link');
const backToSignInLink = document.getElementById('back-to-signin-link');
const authToggleText = document.getElementById('auth-toggle-text');
const backToSignIn = document.getElementById('back-to-signin');
const signInSubmitBtn = document.getElementById('sign-in-submit-btn');
const signOutBtn = document.getElementById('sign-out-btn');

createAccountLink.addEventListener('click', switchToSignUp);
backToSignInLink.addEventListener('click', switchToSignIn);

function switchToSignUp(event) {
  event?.preventDefault();
  authToggleText.style.display = 'none';
  backToSignIn.style.display = 'block';
  signInSubmitBtn.textContent = 'Create Account';
}

function switchToSignIn(event) {
  event?.preventDefault();
  authToggleText.style.display = 'block';
  backToSignIn.style.display = 'none';
  signInSubmitBtn.textContent = 'Sign In';
}

switchToSignIn();

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = form.email.value;
  const password = form.password.value;

  if (signInSubmitBtn.textContent === 'Create Account') {
    auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        showDashboard(userCredential.user);
      })
      .catch((error) => {
        alert(error.message);
      });
  } else {
    auth.signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        showDashboard(userCredential.user);
      })
      .catch((error) => {
        alert(error.message);
      });
  }
});

googleSignInBtn.addEventListener('click', () => {
  auth.signInWithPopup(googleProvider)
    .then((result) => {
      showDashboard(result.user);
    })
    .catch((error) => {
      alert(error.message);
    });
});

signOutBtn.addEventListener('click', () => {
  auth.signOut();
});

auth.onAuthStateChanged((user) => {
  if (user) {
    showDashboard(user);
  } else {
    showAuth();
  }
});

function showDashboard(user) {
  authPage.style.display = 'none';
  dashboardPage.style.display = 'block';
  document.getElementById('user-name').textContent = user.displayName || user.email || 'User';
}

function showAuth() {
  authPage.style.display = 'block';
  dashboardPage.style.display = 'none';
  switchToSignIn();
}
