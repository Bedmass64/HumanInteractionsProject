require('dotenv').config();  // Load environment variables from .env file

console.log("Twilio Account SID:", process.env.TWILIO_ACCOUNT_SID);
console.log("Twilio Auth Token:", process.env.TWILIO_AUTH_TOKEN);
console.log("Twilio Phone Number:", process.env.TWILIO_PHONE_NUMBER);


const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const cors = require('cors');
app.use(cors());  // Enable CORS for all routes
const app = express();
app.use(bodyParser.json());

// Access environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;


app.post('/send-alert', (req, res) => {
    const { userPhone, message } = req.body;

    if (!userPhone || !message) {
        return res.status(400).send('Phone number and message are required.');
    }

    client.messages
        .create({
            body: message,
            from: twilioPhoneNumber,
            to: `+1${userPhone}`
        })
        .then(message => {
            console.log(`Message sent: ${message.sid}`);
            res.status(200).send('Message sent successfully!');
        })
        .catch(error => {
            console.error('Failed to send message:', error);
            res.status(500).send('Failed to send message.');
        });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
