const express = require('express');
const db = require('./db/config')
const route = require('./controllers/route');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT

//Setup Express App
const app = express();
// Middleware
app.use(bodyParser.json());
// Set up CORS  
// app.use(cors())
const corsOptions = {
    origin: 'https://videoloader.s3.ap-south-1.amazonaws.com',
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));
//API Routes
app.use('/api', route);

app.get('/', async (req, res) => {

    res.send('Welcome to safety-products')

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

"https://videoloader.s3.ap-south-1.amazonaws.com"