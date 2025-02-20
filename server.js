const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Enable CORS with specific origin for your GitHub Pages (and localhost for local testing)
const allowedOrigins = ['https://greg-kwok.github.io'];  // Add more URLs if needed
app.use(cors({
    origin: function (origin, callback) {
        // If there's no origin (like in Postman or curl), allow it
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'), false);
    }
}));

app.use(express.json({ limit: '10mb' }));

// Configure email transport
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

app.post('/send-email', async (req, res) => {
    const { email, image } = req.body;
    if (!email || !image) return res.status(400).json({ message: 'Missing email or image data' });

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your Photo Strip',
            text: 'Here is your photo strip!',
            attachments: [{
                filename: 'photo-strip.png',
                content: image.split(';base64,').pop(),
                encoding: 'base64'
            }]
        });

        res.json({ message: 'Email sent successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to send email' });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
