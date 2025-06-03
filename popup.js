function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

const firebaseConfig = {
  apiKey: "AIzaSyDyW2gA73LrCgGc4K6i-jHw27q_conq3Ug",
  authDomain: "extensao-login-unico.firebaseapp.com",
  databaseURL: "https://extensao-login-unico-default-rtdb.firebaseio.com",
  projectId: "extensao-login-unico",
  storageBucket: "extensao-login-unico.appspot.com",
  messagingSenderId: "621088890882",
  appId: "1:621088890882:web:a7625e69637c125f9ec71b",
  measurementId: "G-HR0QCKLBX9"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const loginForm = document.getElementById('loginForm');
const msg = document.getElementById('message');
const logoutBtn = document.getElementById('logoutBtn');

function setMessage(text, isError = false) {
  msg.textContent = text;
  msg.className = isError ? 'error' : 'success';
}

let sessionId = localStorage.getItem('sessionId');
if (!sessionId) {
  sessionId = uuidv4();
  localStorage.setItem('sessionId', sessionId);
}

function checkLoggedIn() {
  chrome.storage.local.get('loggedInUser', data => {
    if (data.loggedInUser) {
      db.ref(`usuarioAtivo/${data.loggedInUser}`).once('value').then(snapshot => {
        if (snapshot.val() === sessionId) {
          loginForm.style.display = 'none';
          logoutBtn.style.display = 'block';
          setMessage(`Logado como: ${data.loggedInUser}`);
        } else {
          chrome.storage.local.clear();
          localStorage.removeItem('sessionId');
          location.reload();
        }
      });
    }
  });
}

async function tentarLogin(usuario, senha) {
  const refUsuario = db.ref('usuarios/' + usuario);
  const snapshot = await refUsuario.once('value');
  const dadosUsuario = snapshot.val();

  if (!dadosUsuario || dadosUsuario.senha !== senha) {
    throw new Error('Usuário ou senha inválidos');
  }

  const refUsuarioAtivo = db.ref('usuarioAtivo/' + usuario);
  const ativoSnapshot = await refUsuarioAtivo.once('value');
  const ativo = ativoSnapshot.val();

  if (ativo && ativo !== sessionId) {
    throw new Error('Este usuário já está logado em outro navegador.');
  }

  await refUsuarioAtivo.set(sessionId);
  chrome.storage.local.set({ loggedInUser: usuario });

  return true;
}

async function logout() {
  const data = await chrome.storage.local.get('loggedInUser');
  const usuario = data.loggedInUser;

  if (usuario) {
    const refUsuarioAtivo = db.ref('usuarioAtivo/' + usuario);
    const ativoSnapshot = await refUsuarioAtivo.once('value');
    if (ativoSnapshot.val() === sessionId) {
      await refUsuarioAtivo.set(null);
    }
  }

  chrome.storage.local.clear();
  localStorage.removeItem('sessionId');
}

loginForm.addEventListener('submit', async e => {
  e.preventDefault();
  const usuario = document.getElementById('usuario').value.trim();
  const senha = document.getElementById('senha').value;

  try {
    await tentarLogin(usuario, senha);
    setMessage('Login realizado com sucesso!');
    loginForm.style.display = 'none';
    logoutBtn.style.display = 'block';

    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (tabs[0]) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          files: ['content.js']
        });
      }
    });
  } catch (err) {
    setMessage(err.message, true);
  }
});

logoutBtn.addEventListener('click', async () => {
  await logout();
  setMessage('Logout realizado.');
  loginForm.style.display = 'block';
  logoutBtn.style.display = 'none';
});

checkLoggedIn();
