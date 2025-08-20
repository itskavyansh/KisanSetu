const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const authService = require('../services/authService');
const router = express.Router();

// GET /login-signup - Render a simple login/signup page (for demonstration)

// Serve all static files under /login-signup from public
router.use('/', express.static(path.join(__dirname, '../../public')));

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));


router.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Login / Signup</title>
      <link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet">
  <link rel="stylesheet" href="/login-signup/login-signup.css">
    </head>
    <body>
      <!-- Provided HTML for login/signup page -->
      <div id="container" class="container">
        <!-- FORM SECTION -->
        <div class="row">
          <!-- SIGN UP -->
          <div class="col align-items-center flex-col sign-up">
            <div class="form-wrapper align-items-center">
              <div class="form sign-up">
                <div class="input-group">
                  <i class='bx bxs-user'></i>
                    <input type="text" placeholder="Username" name="username">
                </div>
                <div class="input-group">
                  <i class='bx bx-mail-send'></i>
                    <input type="email" placeholder="Email" name="email">
                </div>
                <div class="input-group">
                  <i class='bx bxs-lock-alt'></i>
                    <input type="password" placeholder="Password" name="password">
                </div>
                <div class="input-group">
                  <i class='bx bxs-lock-alt'></i>
                    <input type="password" placeholder="Confirm password" name="confirmPassword">
                </div>
                  <button onclick="submitSignup(event)">
                    Sign up
                  </button>
                <p>
                  <span>
                    Already have an account?
                  </span>
                  <b onclick="toggle()" class="pointer">
                    Sign in here
                  </b>
                </p>
              </div>
            </div>
          </div>
          <!-- END SIGN UP -->
          <!-- SIGN IN -->
          <div class="col align-items-center flex-col sign-in">
            <div class="form-wrapper align-items-center">
              <div class="form sign-in">
                <div class="input-group">
                  <i class='bx bxs-user'></i>
                    <input type="text" placeholder="Username" name="loginUsername">
                </div>
                <div class="input-group">
                  <i class='bx bxs-lock-alt'></i>
                    <input type="password" placeholder="Password" name="loginPassword">
                </div>
                  <button onclick="submitLogin(event)">
                    Sign in
                  </button>
                <p>
                  <b>
                    Forgot password?
                  </b>
                </p>
                <p>
                  <span>
                    Don't have an account?
                  </span>
                  <b onclick="toggle()" class="pointer">
                    Sign up here
                  </b>
                </p>
              </div>
            </div>
            <div class="form-wrapper"></div>
          </div>
          <!-- END SIGN IN -->
        </div>
        <!-- END FORM SECTION -->
        <!-- CONTENT SECTION -->
        <div class="row content-row">
          <!-- SIGN IN CONTENT -->
          <div class="col align-items-center flex-col">
            <div class="text sign-in">
              <h2>
                Welcome
              </h2>
            </div>
            <div class="img sign-in"></div>
          </div>
          <!-- END SIGN IN CONTENT -->
          <!-- SIGN UP CONTENT -->
          <div class="col align-items-center flex-col">
            <div class="img sign-up"></div>
            <div class="text sign-up">
              <h2>
                Join with us
              </h2>
            </div>
          </div>
          <!-- END SIGN UP CONTENT -->
        </div>
        <!-- END CONTENT SECTION -->
      </div>
      <!-- Move script to end of body to ensure DOM is loaded -->
        <script>
          async function submitSignup(e) {
            e.preventDefault();
            const username = document.querySelector('input[name="username"]').value;
            const email = document.querySelector('input[name="email"]').value;
            const password = document.querySelector('input[name="password"]').value;
            const confirmPassword = document.querySelector('input[name="confirmPassword"]').value;
            if (password !== confirmPassword) {
              alert('Passwords do not match');
              return;
            }
            const res = await fetch('/signup', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username, email, password })
            });
            const data = await res.json();
            if (data.success) {
                window.location.href = '/dashboard';
              } else {
                alert('Signup failed: ' + data.error);
              }
          }
          async function submitLogin(e) {
            e.preventDefault();
            const email = document.querySelector('input[name="loginUsername"]').value;
            const password = document.querySelector('input[name="loginPassword"]').value;
            const res = await fetch('/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (data.success) {
                window.location.href = '/dashboard';
            } else {
              alert('Login failed: ' + data.error);
            }
        // Add error handling for non-JSON responses
        async function safeJson(res) {
          try {
            return await res.json();
          } catch (e) {
            return { success: false, error: 'Server error or invalid response.' };
          }
        }
        // Update submitSignup and submitLogin to use safeJson
        async function submitSignup(e) {
          e.preventDefault();
          const username = document.querySelector('input[name="username"]').value;
          const email = document.querySelector('input[name="email"]').value;
          const password = document.querySelector('input[name="password"]').value;
          const confirmPassword = document.querySelector('input[name="confirmPassword"]').value;
          if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
          }
          const res = await fetch('/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
          });
          const data = await safeJson(res);
          if (data.success) {
            window.location.href = '/dashboard';
          } else {
            alert('Signup failed: ' + data.error);
          }
        }
        async function submitLogin(e) {
          e.preventDefault();
          const email = document.querySelector('input[name="loginUsername"]').value;
          const password = document.querySelector('input[name="loginPassword"]').value;
          const res = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });
          const data = await safeJson(res);
          if (data.success) {
            window.location.href = '/dashboard';
          } else {
            alert('Login failed: ' + data.error);
          }
        }
          }
        </script>
        <script src="/login-signup/login-signup.js"></script>
    </body>
    </html>
  `);
});

module.exports = router;
// GET /dashboard - Simple dashboard page
router.get('/dashboard', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Dashboard</title>
      <style>
        body { font-family: Arial, sans-serif; background: #f7f7f7; margin: 0; }
        .dashboard { max-width: 600px; margin: 60px auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px #ccc; padding: 32px; text-align: center; }
        h1 { color: #2e7d32; }
        p { color: #555; }
      </style>
    </head>
    <body>
      <div class="dashboard">
        <h1>Welcome to KisanSetu Dashboard!</h1>
        <p>Your login/signup was successful.</p>
        <p>Start exploring crop health, market prices, government schemes, and more.</p>
      </div>
    </body>
    </html>
  `);
});

// POST /signup
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  const result = await authService.signup(email, password, username);
  res.json(result);
});

// POST /login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.json(result);
});
