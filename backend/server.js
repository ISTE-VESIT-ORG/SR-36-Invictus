
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const ics = require('ics');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Add Event + Send Email with ICS attachment
app.post('/add-event', async (req, res) => {
    const { title, startTime, endTime, userEmail } = req.body;

    if (!userEmail) {
        return res.status(400).json({ error: 'User email is required' });
    }

    try {
        // Parse dates
        const start = new Date(startTime);
        const end = new Date(endTime);

        // Create ICS event
        const event = {
            start: [start.getFullYear(), start.getMonth() + 1, start.getDate(), start.getHours(), start.getMinutes()],
            end: [end.getFullYear(), end.getMonth() + 1, end.getDate(), end.getHours(), end.getMinutes()],
            title: title,
            description: `AstroView Event: ${title}`,
            location: 'Check AstroView for details',
            status: 'CONFIRMED',
            busyStatus: 'BUSY',
            organizer: { name: 'AstroView', email: process.env.EMAIL_USER },
            alarms: [
                {
                    action: 'display',
                    description: `Reminder: ${title} starts in 30 minutes`,
                    trigger: { minutes: 30, before: true },
                },
                {
                    action: 'display',
                    description: `Reminder: ${title} starts in 10 minutes`,
                    trigger: { minutes: 10, before: true },
                }
            ]
        };

        // Generate ICS file
        const { error: icsError, value: icsContent } = ics.createEvent(event);

        if (icsError) {
            console.error('ICS generation error:', icsError);
            return res.status(500).json({ error: 'Failed to generate calendar file' });
        }

        // Send confirmation email with ICS attachment
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: `AstroView Event Reminder - ${title}`,
            text: `Hi there!

Your event "${title}" has been saved!

📅 Event Details:
- Event: ${title}
- Date: ${start.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
- Time: ${start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
- Duration: ${Math.round((end - start) / 60000)} minutes

📎 Calendar file attached (event.ics)

To add this event to your calendar:
1. Open the attached .ics file
2. It will automatically open in your default calendar app
3. Click "Add" or "Import" to save

The event includes:
✅ Email reminder (30 minutes before)
✅ Popup alert (10 minutes before)

Compatible with: Google Calendar, Apple Calendar, Outlook, Yahoo Calendar, and more!

Happy stargazing! 🌟

- AstroView Team`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px;">
                    <h2 style="color: white; text-align: center;">🚀 AstroView Event Reminder</h2>
                    <div style="background: white; padding: 20px; border-radius: 8px; margin-top: 20px;">
                        <p style="font-size: 16px; color: #333;">Hi there!</p>
                        <p style="font-size: 16px; color: #333;">Your event <strong>"${title}"</strong> has been saved!</p>
                        
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #667eea; margin-top: 0;">📅 Event Details</h3>
                            <p style="margin: 5px 0;"><strong>Event:</strong> ${title}</p>
                            <p style="margin: 5px 0;"><strong>Date:</strong> ${start.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            <p style="margin: 5px 0;"><strong>Time:</strong> ${start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                            <p style="margin: 5px 0;"><strong>Duration:</strong> ${Math.round((end - start) / 60000)} minutes</p>
                        </div>

                        <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #1976d2; margin-top: 0;">📎 Calendar File Attached</h3>
                            <p style="margin: 5px 0;">To add this event to your calendar:</p>
                            <ol style="margin: 10px 0; padding-left: 20px;">
                                <li>Open the attached <strong>event.ics</strong> file</li>
                                <li>It will automatically open in your default calendar app</li>
                                <li>Click "Add" or "Import" to save</li>
                            </ol>
                        </div>

                        <div style="background: #f1f8e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #558b2f; margin-top: 0;">✅ Reminders Included</h3>
                            <p style="margin: 5px 0;">• Email reminder (30 minutes before event)</p>
                            <p style="margin: 5px 0;">• Popup alert (10 minutes before event)</p>
                        </div>

                        <p style="font-size: 14px; color: #666; margin-top: 20px;">
                            <strong>Compatible with:</strong> Google Calendar, Apple Calendar, Outlook, Yahoo Calendar, and more!
                        </p>

                        <p style="font-size: 16px; color: #333; margin-top: 20px;">Happy stargazing! 🌟</p>
                        <p style="font-size: 14px; color: #999;">- AstroView Team</p>
                    </div>
                </div>
            `,
            attachments: [
                {
                    filename: 'event.ics',
                    content: icsContent,
                    contentType: 'text/calendar'
                }
            ]
        };

        await transporter.sendMail(mailOptions);

        res.json({ 
            message: 'Event created and confirmation email sent!',
            success: true 
        });

    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ 
            error: 'Failed to send calendar event',
            details: error.message 
        });
    }
});

// Routes
app.use('/api/events', require('./routes/events'));
app.use('/api/launches', require('./routes/launches'));
app.use('/api/iss-operations', require('./routes/iss-operations'));
app.use('/api/asteroids', require('./routes/asteroids'));
app.use('/api/cache', require('./routes/cache'));

// Health check
app.get('/api/health', (req, res) => {
        res.json({ 
                status: 'ok', 
                message: 'AstroView Backend is running!',
                timestamp: new Date().toISOString()
        });
});

// Start server
app.listen(PORT, () => {
        console.log(`🚀 AstroView Backend running on http://localhost:${PORT}`);
});
