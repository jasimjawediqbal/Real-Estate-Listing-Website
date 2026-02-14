 
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
        function signUpWithGoogle() { alert('Sign up with Google clicked!'); }
        function signUpWithFacebook() { alert('Sign up with Facebook clicked!'); }
        function signUpWithTwitter() { alert('Sign up with Twitter clicked!'); }
        function loginWithGoogle() { alert('Login with Google clicked!'); }
        function loginWithFacebook() { alert('Login with Facebook clicked!'); }
        function loginWithTwitter() { alert('Login with Twitter clicked!'); }
        function forgotPassword(event) {
            event.preventDefault();
            alert('Forgot Password clicked! Password reset link would be sent to your email.');
        }
