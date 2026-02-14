# AstroView

A production-ready space data platform that transforms complex astronomical data into accessible, engaging experiences.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📁 Project Structure

```
/astroview
├── app/                    # Next.js app directory
├── components/             # React components
│   ├── hero/              # Hero animation
│   └── events/            # Event components
├── types/                 # TypeScript types
├── data/                  # Sample data
├── lib/                   # Utilities
└── public/
    └── frames/            # Animation frames (120 frames)
```

## 🎨 Frame Generation

**IMPORTANT:** You need to generate 120 animation frames and place them in `public/frames/`

See `FRAME_GENERATION_PROMPTS.md` in the artifacts folder for detailed instructions.

Quick steps:
1. Generate 3 keyframes using AI (Midjourney, DALL-E 3, Stable Diffusion)
2. Interpolate to 120 frames using Runway ML or FFmpeg
3. Place frames as `frame_0.webp` to `frame_119.webp` in `public/frames/`

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **3D:** Three.js
- **Maps:** Mapbox GL

## 📦 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🎯 Features

- ✨ 3D scroll animation hero section
- 🌠 Celestial events tracking
- 🛰️ Satellite tracking
- 📊 Data visualizations
- 🎓 Educational content
- 📱 Fully responsive

## 📄 License

MIT