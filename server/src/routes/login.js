const express = require('express');
const path = require('path');
const router = express.Router();

// GET /login-signup - Render a simple login/signup page (for demonstration)

// Serve all static files under /login-signup from public
router.use('/', express.static(path.join(__dirname, '../../public')));


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
                  <input type="text" placeholder="Username">
                </div>
                <div class="input-group">
                  <i class='bx bx-mail-send'></i>
                  <input type="email" placeholder="Email">
                </div>
                <div class="input-group">
                  <i class='bx bxs-lock-alt'></i>
                  <input type="password" placeholder="Password">
                </div>
                <div class="input-group">
                  <i class='bx bxs-lock-alt'></i>
                  <input type="password" placeholder="Confirm password">
                </div>
                <button>
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
                  <input type="text" placeholder="Username">
                </div>
                <div class="input-group">
                  <i class='bx bxs-lock-alt'></i>
                  <input type="password" placeholder="Password">
                </div>
                <button>
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
      <script src="/login-signup/login-signup.js"></script>
    </body>
    </html>
  `);
});

module.exports = router;
