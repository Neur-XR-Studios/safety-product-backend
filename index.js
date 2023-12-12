const express = require('express');
const db = require('./db/config')
const route = require('./controllers/route');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT

const app = express();
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.use(bodyParser.json());

const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use('/api', route);

app.get('/', (req, res) => {
    res.redirect('https://www.xrtraining.in');
});


// Get port from environment and store in Express.
const server = app.listen(port, () => {
    const protocol = (process.env.HTTPS === 'true' || process.env.NODE_ENV === 'production') ? 'https' : 'http';
    const { address, port } = server.address();
    const host = address === '::' ? '127.0.0.1' : address;
    console.log(`Server listening at ${protocol}://${host}:${port}`);
});

// Connect to MongoDB
const DATABASE_URL = process.env.DB_URL || 'mongodb://127.0.0.1:27017'
const DATABASE = process.env.DB || 'safety-products'

db(DATABASE_URL, DATABASE);

