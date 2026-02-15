// clientscre: 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
// clientid: 619721643105-lrh7n9l1rk52feknk2qhivosm8nqlc2m.apps.googleusercontent.com
        function switchToLogin() {
            const tabSlider = document.getElementById('tabSlider');
            const signupTab = document.getElementById('signupTab');
            const loginTab = document.getElementById('loginTab');
            const signupForm = document.getElementById('signupForm');
            const loginForm = document.getElementById('loginForm');
            const formTitle = document.getElementById('formTitle');
            const formSubtitle = document.getElementById('formSubtitle');
            
            tabSlider.classList.add('slide-right-tab');
            signupTab.classList.remove('active');
            loginTab.classList.add('active');
            signupForm.classList.remove('active');
            loginForm.classList.add('active');
            formTitle.textContent = 'Welcome Back';
            formSubtitle.textContent = 'Log in to continue to PropertyHub';
        }

        function switchToSignup() {
            const tabSlider = document.getElementById('tabSlider');
            const signupTab = document.getElementById('signupTab');
            const loginTab = document.getElementById('loginTab');
            const signupForm = document.getElementById('signupForm');
            const loginForm = document.getElementById('loginForm');
            const formTitle = document.getElementById('formTitle');
            const formSubtitle = document.getElementById('formSubtitle');
            
            tabSlider.classList.remove('slide-right-tab');
            loginTab.classList.remove('active');
            signupTab.classList.add('active');
            loginForm.classList.remove('active');
            signupForm.classList.add('active');
            formTitle.textContent = 'Create Account';
            formSubtitle.textContent = 'Get started with PropertyHub today';
        }

   async function handleSignup(event) {
    event.preventDefault();
    const name = document.getElementById('signup-fullname').value;
    const email = document.getElementById('signup-username').value;
    const password = document.getElementById('signup-password').value;

    try {
        const res = await fetch('api/signup.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();
        if (data.success) {
            alert(data.message);
            switchToLogin();
        } else {
            alert(data.error);
        }
    } catch (err) {
        alert('Signup failed: ' + err.message);
    }
}

      async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const res = await fetch('api/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.success) {
            alert('Welcome, ' + data.user.name);
            // Redirect after login
            window.location.href = 'index.html';
        } else {
            alert(data.error);
        }
    } catch (err) {
        alert('Login failed: ' + err.message);
    }
}

        // Social Functions
        function signUpWithGoogle() {
    google.accounts.id.prompt(); // opens Google login popup
}
// Decode Google JWT
function parseJwt(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
}

// Handle Google credential response
function handleCredentialResponse(response) {
    const data = parseJwt(response.credential); // decode the token

    // Send decoded data to PHP
    fetch("api/google-login.php", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data) // send decoded JWT fields
    })
    .then(res => res.json())
    .then(result => {
        if(result.success){
            // Navigate directly to index.html after Google login/signup
            window.location.href = "index.html";
        } else {
            alert(result.error);
        }
    })
    .catch(err => alert("Google login failed: " + err.message));
}

// Initialize Google Sign-In
window.onload = function() {
    google.accounts.id.initialize({
        client_id: "619721643105-lrh7n9l1rk52feknk2qhivosm8nqlc2m.apps.googleusercontent.com",
        callback: handleCredentialResponse
    });
};

function signUpWithGoogle() { google.accounts.id.prompt(); }
function loginWithGoogle() { google.accounts.id.prompt(); }
function togglePassword(fieldId, iconElement) {
    const input = document.getElementById(fieldId);
    const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
    input.setAttribute('type', type);

    // Replace icon for open/closed eye
    if(type === 'text'){
        // Open eye
        iconElement.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M1 1l22 22M12 5c-7 0-11 7-11 7s2.59 4.52 7.05 6.62M12 19c7 0 11-7 11-7s-2.59-4.52-7.05-6.62"/>
            <circle cx="12" cy="12" r="2.5"/>
        </svg>
       `;
    } else {
        // Closed eye (eye with slash)
        iconElement.innerHTML = ` <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 5c-7 0-11 7-11 7s4 7 11 7 11-7 11-7-4-7-11-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"/>
            <circle cx="12" cy="12" r="2.5"/>
        </svg>
        `;
    }
}

