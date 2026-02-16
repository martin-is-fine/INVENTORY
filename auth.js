// Shared Auth Logic
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    // --- Login Logic ---
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const errorMsg = document.getElementById('errorMsg');

            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                sessionStorage.setItem('isLoggedIn', 'true');
                sessionStorage.setItem('currentUser', JSON.stringify(user));
                redirectBasedOnRole(user.role);
            } else {
                showError(errorMsg, 'Invalid email or password');
            }
        });
    }

    // --- Signup Logic ---
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const fullName = document.getElementById('fullName').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const errorMsg = document.getElementById('errorMsg');

            if (!validateEmail(email)) {
                showError(errorMsg, 'Please enter a valid email');
                return;
            }

            const users = JSON.parse(localStorage.getItem('users') || '[]');
            if (users.find(u => u.email === email)) {
                showError(errorMsg, 'Email already registered');
                return;
            }

            // Simple role logic: emails containing 'admin' are admins
            const role = email.toLowerCase().includes('admin') ? 'admin' : 'user';
            const newUser = { fullName, email, password, role };
            
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('currentUser', JSON.stringify(newUser));
            redirectBasedOnRole(role);
        });
    }
});

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showError(element, message) {
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
        setTimeout(() => element.style.display = 'none', 3000);
    }
}

function redirectBasedOnRole(role) {
    const isSubdir = window.location.pathname.includes('/admin/') || window.location.pathname.includes('/user/');
    if (role === 'admin') {
        window.location.href = isSubdir ? '../admin/index.html' : 'admin/index.html';
    } else {
        window.location.href = isSubdir ? '../user/index.html' : 'user/index.html';
    }
}

/**
 * Auth Guard
 * @param {string} requiredRole - 'admin' or 'user'
 */
function checkAuth(requiredRole) {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const isSubdir = window.location.pathname.includes('/admin/') || window.location.pathname.includes('/user/');
    const loginPage = isSubdir ? '../signin.html' : 'signin.html';

    if (isLoggedIn !== 'true' || !currentUser) {
        window.location.href = loginPage;
        return;
    }

    if (requiredRole && currentUser.role !== requiredRole) {
        alert('Access Denied: Insufficient permissions');
        window.location.href = loginPage;
    }
}

function logout() {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('currentUser');
    const isSubdir = window.location.pathname.includes('/admin/') || window.location.pathname.includes('/user/');
    window.location.href = isSubdir ? '../signin.html' : 'signin.html';
}
