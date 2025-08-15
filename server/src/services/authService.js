const admin = require('../firebaseAdmin');

async function signup(email, password, username) {
  // Firebase Admin SDK does not support password-based signup directly
  // This should be done on client side using Firebase JS SDK
  // Here, we can create a user record for reference
  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: username,
    });
    return { success: true, user: userRecord };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function login(email, password) {
  // Firebase Admin SDK cannot verify password directly
  // This should be done on client side using Firebase JS SDK
  // Here, we can fetch user by email for demonstration
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    return { success: true, user: userRecord };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = { signup, login };
