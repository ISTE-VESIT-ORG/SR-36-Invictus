# Quick Start Guide for AstroView

## ✅ Setup Complete!

Your application has been successfully separated into **Frontend** and **Backend**.

## 🚀 How to Run

### Option 1: Automatic Start (Recommended)
Run the PowerShell script to start both servers:
```powershell
.\start-astroview.ps1
```

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
node server.js
```
Backend runs on: http://localhost:5000

**Terminal 2 - Frontend:**
```bash
npm run dev
```
Frontend runs on: http://localhost:3000

## 📱 Access the Application

- **Main Site**: http://localhost:3000
- **Events Page**: http://localhost:3000/events
- **Backend API**: http://localhost:5000/api/events

## 🔍 Testing the Events Feature

1. Click on "Events" in the top navigation bar
2. You should see celestial event cards with:
   - Event name and icon (meteor, eclipse, etc.)
   - Start date ("in X days" format)
   - Visibility score
   - Location and direction
   - Description
   - "Remind Me" and "Details" buttons

## 🛠️ Troubleshooting

### Events not showing?
1. Make sure BOTH servers are running
2. Check backend is accessible: http://localhost:5000/api/health
3. Check browser console for errors (F12)

### Backend not starting?
```bash
cd backend
npm install
node server.js
```

### Frontend not connecting to backend?
Check `.env.local` file contains:
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000/api
```

## 📂 Project Structure

```
SR-36-Invictus/
├── app/                    # Frontend Next.js pages
│   ├── events/page.tsx    # Events page (uses API)
│   └── page.tsx           # Homepage (uses sample data)
├── backend/               # Backend Express API
│   ├── routes/events.js   # Events API endpoints
│   └── server.js          # Main server file
├── components/            # React components
├── lib/                   # API client utilities
└── .env.local            # Frontend environment config
```

## 🎯 What Changed?

### Before:
- Frontend directly called Space Devs API
- Mixed concerns in frontend code

### After:
- ✅ Separate backend server handling all API calls
- ✅ Frontend makes requests to local backend
- ✅ Better error handling
- ✅ Easier to scale and maintain
- ✅ Can add authentication, caching, etc. in backend

## 🌐 API Endpoints

- `GET /api/health` - Check server status
- `GET /api/events` - Get all celestial events
- `GET /api/events/:id` - Get specific event

All events include:
- Name, type, date
- Visibility information
- Location and coordinates
- Observation tips
- Images (when available)
