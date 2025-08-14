const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const loginRoutes = require('./routes/login');

const app = express();
app.use(cors());
app.use(express.json());


app.use('/auth', authRoutes);
app.use('/login-signup', loginRoutes);

app.listen(5000, () => console.log('Server running on port 5000'));
