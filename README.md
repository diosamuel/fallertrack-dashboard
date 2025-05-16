# FallerTrack Dashboard

A comprehensive dashboard for elderly fall detection and navigation monitoring system.

## 🌐 Deployment URLs

- Production: [https://fallertrack.vercel.app/](https://fallertrack.vercel.app/)
- Development: [https://fallertrack.my.id/](https://fallertrack.my.id/)

## ✨ Core Features

- Real-time fall detection monitoring
- GPS tracking and geofencing visualization
- Navigation route management
- Emergency services mapping
- Activity logging and analytics

## 🔧 Tech Stack

- React + Vite
- Material UI
- TailwindCSS + DaisyUI
- Google Maps Platform APIs
- Firebase Integration

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/your-username/falltrack-dashboard.git

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 🚀 Environment Variables

Create a `.env.local` file:

```bash
VITE_BACKEND_API=https://fallertrack-be.my.id
```

## 🔌 API Integration

The dashboard connects to the FallerTrack Backend API for:
- Home location management
- Real-time location tracking
- Fall detection monitoring
- Emergency alerts
- Navigation instructions
- Analytics and logging

## 📚 Documentation

For complete API documentation, visit:
- [Backend API Documentation](https://github.com/reannn22/falltrack-backend)

## 🛠️ Docker Deployment

```bash
# Build the image
docker build -t falltrack-dashboard .

# Run the container
docker run -p 80:80 falltrack-dashboard
```

## 📝 License

MIT
