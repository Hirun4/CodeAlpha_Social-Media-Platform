import { loginApi, registerApi } from './api.js';

export function showLogin() {
    document.getElementById('loginForm').style.display = '';
    document.getElementById('registerForm').style.display = 'none';
}

export function showRegister() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = '';
}

export async function login(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    try {
        const res = await loginApi(email, password);
        localStorage.setItem('token', res.token);
        window.location.reload();
    } catch (err) {
        alert(err.message || 'Login failed');
    }
}

export async function register(event) {
    event.preventDefault();
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const fullName = document.getElementById('regFullName').value;
    try {
        const res = await registerApi(username, email, password, fullName);
        localStorage.setItem('token', res.token);
        window.location.reload();
    } catch (err) {
        alert(err.message || 'Registration failed');
    }
}

export function logout() {
    localStorage.removeItem('token');
    window.location.reload();
}

// Attach to window so HTML can call them
window.login = login;
window.register = register;
window.showLogin = showLogin;
window.showRegister = showRegister;
window.logout = logout;