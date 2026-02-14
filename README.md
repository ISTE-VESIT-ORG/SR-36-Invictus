# AstroView

A space data platform that transforms complex astronomical data into accessible, engaging experiences.

## 🏗️ Project Structure

The project is now separated into **Frontend** (Next.js) and **Backend** (Express.js) for better scalability and maintainability.

```
/SR-36-Invictus
├── app/                    # Next.js frontend app directory
├── components/             # React components
│   ├── hero/              # Hero animation
│   ├── events/            # Event components
│   └── layout/            # Layout components
├── backend/               # Express.js backend API
│   ├── routes/            # API routes
│   ├── server.js          # Backend server
│   └── package.json       # Backend dependencies
├── types/                 # TypeScript types
├── data/                  # Sample data
├── lib/                   # Utilities & API clients
└── public/                # Static assets
```

## 🚀 Installation & Setup

### 1. Frontend Setup

```bash
# Install frontend dependencies
npm install

# Create environment file
# Copy .env.local and configure if needed
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install backend dependencies
npm install
```

## 🎯 Running the Application

You need to run **both** frontend and backend servers:

### Terminal 1: Backend Server (Port 5000)
```bash
cd backend
npm run dev
```
Backend will run on: `http://localhost:5000`

### Terminal 2: Frontend Server (Port 3000)
```bash
npm run dev
```
Frontend will run on: `http://localhost:3000`

## 🌐 API Endpoints

### Backend API (`http://localhost:5000/api`)

- **GET** `/api/health` - Health check
- **GET** `/api/events` - Get all upcoming celestial events
- **GET** `/api/events/:id` - Get specific event by ID

## 🎨 Features

- ✅ Real-time celestial events from Space Devs API
- ✅ Animated hero section with smooth transitions
- ✅ Event cards showing start dates and visibility info
- ✅ Responsive design with Tailwind CSS
- ✅ Separated backend and frontend architecture

## 🔧 Tech Stack

**Frontend:**
- Next.js 14.2.0
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion

**Backend:**
- Node.js
- Express.js
- CORS enabled
- Space Devs API integration

## 📝 Environment Variables

### Frontend (`.env.local`)
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000/api
```

### Backend (`backend/.env`)
```
PORT=5000
SPACE_DEVS_API=https://ll.thespacedevs.com/2.2.0
NODE_ENV=development
```

