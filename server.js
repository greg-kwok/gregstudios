const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Allow large images

// Configure email transport
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Gmail email
        pass: process.env.EMAIL_PASS  // App password
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
