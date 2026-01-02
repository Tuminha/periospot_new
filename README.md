# Periospot - Advanced Periodontal Assessment Platform

A modern web application for comprehensive periodontal health assessment and management.

## Project Structure

```
periospot-new/
├── frontend/
│   └── periospot-vite/          # Vite + React frontend
│       ├── src/
│       │   ├── App.jsx
│       │   ├── App.css
│       │   ├── main.jsx
│       │   ├── index.css
│       │   └── ...
│       ├── index.html
│       ├── vite.config.js
│       ├── package.json
│       └── ...
├── legacy-wordpress/            # Legacy WordPress content
│       └── content/
├── periospot-assets/            # Media assets
├── package.json                 # Root package.json
├── vercel.json                  # Vercel deployment config
├── .env.local                   # Local environment variables
├── .env.vercel                  # Vercel environment variables
└── README.md                    # This file
```

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# Install frontend dependencies
cd frontend/periospot-vite
npm install
cd ../..
```

### Development

```bash
# Start development server
npm run dev

# The app will be available at http://localhost:3000
```

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

### Local Development (.env.local)

```
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_RESEND_API_KEY=your_resend_api_key
```

### Vercel Deployment (.env.vercel)

Environment variables are configured in Vercel project settings.

## Features

- Advanced periodontal assessment tools
- Real-time data synchronization with Supabase
- Email notifications via Resend
- Responsive design for all devices
- Modern React + Vite stack

## Technologies

- **Frontend**: React 18, Vite, TailwindCSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **Email**: Resend
- **Deployment**: Vercel
- **Build Tool**: Vite

## API Integration

### Supabase

- Project URL: `https://ajueupqlrodkhfgkegnx.supabase.co`
- Authentication enabled
- Real-time database support

### Resend

- Email service for notifications
- API Key configured in environment variables

## Deployment

The project is automatically deployed to Vercel on every push to the main branch.

### Build Settings

- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `frontend/periospot-vite/dist`
- **Install Command**: `npm install`

## License

MIT

## Support

For issues and feature requests, please open an issue on GitHub.
