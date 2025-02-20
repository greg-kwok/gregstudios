const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Enable CORS with specific origin for your GitHub Pages (and localhost for local testing)
const allowedOrigins = ['https://greg-kwok.github.io', 'http://localhost:5500'];  // Add more URLs if needed

// CORS configuration to allow the above origins
app.use(cors({
    origin: function (origin, callback) {
        // If there's no origin (like in Postman or curl), allow it
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'), false);
    }
}));

// Middleware to parse JSON requests and allow large image uploads
app.use(express.json({ limit: '10mb' }));

// Configure nodemailer transport using Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,  // Your Gmail email
        pass: process.env.EMAIL_PASS   // App password (NOT your Gmail password)
    }
});

// POST route to send email with image attachment
app.post('/send-email', async (req, res) => {
    const { email, image } = req.body;

    // Validate the input (email and image data must be provided)
    if (!email || !image) {
        return res.status(400).json({ message: 'Missing email or image data' });
    }

    try {
        // Send email using nodemailer
        await transporter.sendMail({
            from: process.env.EMAIL_USER,  // From your email
            to: email,                    // To recipient email
            subject: 'Your Photo Strip',  // Email subject
            text: 'Here is your photo strip!', // Email body text
            attachments: [
                {
                    filename: 'photo-strip.png',
                    content: image.split(';base64,').pop(), // Strip out the base64 header
                    encoding: 'base64' // Ensure the image is sent as base64
                }
            ]
        });

        // Respond with a success message
        res.json({ message: 'Email sent successfully!' });
    } catch (error) {
        // Handle errors (e.g., Gmail authentication issues, network issues)
        console.error(error);
        res.status(500).json({ message: 'Failed to send email' });
    }
});

// Handle preflight requests (CORS check)
app.options('/send-email', cors());

// Start the server on a dynamic port (use port 5000 by default)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
