const express = require('express');
const db = require('./db/config')
const route = require('./controllers/route');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT

//Setup Express App
const app = express();
app.use((req, res, next) => {
    console.log(req)
    // Allow requests from any origin (replace "*" with your specific origin)
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Allow specific HTTP methods
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    // Allow specific HTTP headers
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    // Set to true if you need to include cookies in the requests
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Continue to the next middleware
    next();
});
// Middleware
app.use(bodyParser.json());
// Set up CORS  
// app.use(cors())
const corsOptions = {
    origin: 'https://*.videoloader.s3.ap-south-1.amazonaws.com',
    optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
//API Routes
app.use('/api', route);

app.get('/', async (req, res) => {

    const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to Safety Products</title>
            <style>
                body {
                    font-family: 'Arial', sans-serif;
                    background-color: #f4f4f4;
                    text-align: center;
                    margin: 50px;
                }

                h1 {
                    color: #333;
                    font-size: 60px;
                }

                p {
                    color: #666;
                    font-size: 40px;
                }

                footer {
                    margin-top: 50px;
                    color: #999;
                    font-size: 20px;
                }
            </style>
        </head>
        <body>
            <h1>Welcome to Safety Products</h1>
            <p>Stay safe and secure!</p>

            <footer>
                @neurindustries
            </footer>
        </body>
        </html>
    `;


    res.send(htmlContent);

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

// "https://videoloader.s3.ap-south-1.amazonaws.com"
