// Firebase config and auth logic
const firebaseConfig = {
  apiKey: "AIzaSyBucPtSiBjIKiJNENfNYbRrIAfNNMG9AJQ",
  authDomain: "dog-api-28c13.firebaseapp.com",
  projectId: "dog-api-28c13",
  appId: "1:1095462021524:web:d5d5982bd25bcc0b908781"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();
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
  loadUserAlbum(user.uid);
}

function showAuth() {
  authPage.style.display = 'block';
  dashboardPage.style.display = 'none';
  switchToSignIn();
}

// Dog CEO API logic
const breedDropdown = document.querySelector('.breed-dropdown');
const generateBtn = document.querySelector('.generate-btn');
const saveBtn = document.querySelector('.save-btn');
const generatedImage = document.getElementById('generated-image');
const albumImage = document.querySelector('.album-image');

const defaultBreeds = [
  'bulldog', 'poodle', 'retriever', 'beagle', 'boxer', 'chihuahua',
  'dalmatian', 'husky', 'labrador', 'rottweiler', 'shiba', 'pug',
  'spaniel', 'terrier', 'akita'
];

function formatBreedName(breed) {
  return breed
    .split(/[-\s]+/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function populateBreedDropdown() {
  fetch('https://dog.ceo/api/breeds/list/all')
    .then((response) => response.json())
    .then((data) => {
      if (data.status !== 'success') {
        throw new Error('Failed to load breed list');
      }
      const breeds = Object.keys(data.message).sort();
      breedDropdown.innerHTML = '<option value="" disabled selected>Select a breed</option>';
      breeds.forEach((breed) => {
        const option = document.createElement('option');
        option.value = breed;
        option.textContent = formatBreedName(breed);
        breedDropdown.appendChild(option);
      });
    })
    .catch((error) => {
      console.error('Error loading breeds:', error);
      breedDropdown.innerHTML = '<option value="" disabled selected>Select a breed</option>';
      defaultBreeds.forEach((breed) => {
        const option = document.createElement('option');
        option.value = breed;
        option.textContent = formatBreedName(breed);
        breedDropdown.appendChild(option);
      });
    });
}

populateBreedDropdown();

generateBtn.addEventListener('click', async () => {
  const breed = breedDropdown.value;
  if (!breed) {
    alert('Please select a breed');
    return;
  }

  try {
    const response = await fetch(`https://dog.ceo/api/breed/${breed}/images/random`);
    const data = await response.json();
    if (data.status === 'success') {
      generatedImage.src = data.message;
      generatedImage.style.display = 'block';
    } else {
      alert('Failed to fetch image');
    }
  } catch (error) {
    console.error('Error fetching dog image:', error);
    alert('Error fetching image');
  }
});

saveBtn.addEventListener('click', () => {
  if (generatedImage.src && generatedImage.src !== window.location.href && auth.currentUser) {
    const userId = auth.currentUser.uid;
    database.ref('users/' + userId + '/images').push({
      url: generatedImage.src,
      timestamp: Date.now()
    }).then((result) => {
      addImageToAlbum(generatedImage.src, result.key);
    }).catch(error => {
      console.error('Error saving image:', error);
      alert('Failed to save image: ' + error.message);
    });
  } else {
    alert('No image to save or not logged in');
  }
});

function clearAlbumPlaceholder() {
  const placeholder = albumImage.querySelector('p');
  if (placeholder) {
    albumImage.innerHTML = '';
  }
}

function addImageToAlbum(url, imageKey = null) {
  const wrapper = document.createElement('div');
  wrapper.className = 'album-image-wrapper';
  wrapper.setAttribute('data-key', imageKey);

  const img = document.createElement('img');
  img.src = url;
  img.alt = 'Dog image';

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-image-btn';
  deleteBtn.innerHTML = '✕';
  deleteBtn.title = 'Delete image';
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (auth.currentUser && imageKey) {
      const userId = auth.currentUser.uid;
      database.ref(`users/${userId}/images/${imageKey}`).remove()
        .then(() => {
          wrapper.remove();
          if (albumImage.children.length === 0) {
            albumImage.innerHTML = '<p>No images yet</p>';
          }
        })
        .catch(error => {
          console.error('Error deleting image:', error);
          alert('Failed to delete image: ' + error.message);
        });
    }
  });

  wrapper.appendChild(img);
  wrapper.appendChild(deleteBtn);

  if (albumImage.querySelector('p')) {
    albumImage.innerHTML = '';
  }
  albumImage.appendChild(wrapper);
}

function loadUserAlbum(userId) {
  albumImage.innerHTML = '<p>Loading...</p>';
  database.ref('users/' + userId + '/images').once('value').then(snapshot => {
    albumImage.innerHTML = '';
    const data = snapshot.val();
    if (!data) {
      albumImage.innerHTML = '<p>No images yet</p>';
    } else {
      const entries = Object.entries(data).sort(([, a], [, b]) => b.timestamp - a.timestamp);
      entries.forEach(([key, value]) => {
        addImageToAlbum(value.url, key);
      });
    }
  }).catch(error => {
    console.error('Error loading album:', error);
    albumImage.innerHTML = '<p>Error loading album</p>';
  });
}
