# Onboarding Builder

A comprehensive onboarding template builder and management system built with React and deployed on Cloudflare Workers. Create, manage, and share onboarding templates with version control, JTBD (Jobs-to-be-Done) framework integration, and collaborative features.

## 🚀 Features

### Core Functionality
- **Template Management**: Create, edit, and organize onboarding templates
- **Version Control**: Multiple versions per template with seamless switching
- **JTBD Integration**: Jobs-to-be-Done framework with categories and resources
- **Template Sharing**: Share templates with others via secure links
- **Clone System**: Clone shared templates with duplicate detection and overwrite options
- **Auto-save**: Automatic saving of changes with visual feedback

### Authentication
- **Google OAuth**: Seamless Google account integration
- **Email Authentication**: Traditional email/password login
- **Profile Management**: User profiles with image support and fallback system

### User Experience
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Immediate UI synchronization after edits
- **Professional UI**: Elegant gray color scheme with brand-consistent accents
- **Success Notifications**: In-app notifications replacing browser alerts
- **Unified Dialogs**: Streamlined confirmation dialogs for all scenarios

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Cloudflare Workers, D1 Database
- **Authentication**: Google OAuth 2.0, JWT tokens
- **Deployment**: Cloudflare Workers with edge computing
- **Development**: Local development with Wrangler CLI

## 📋 Prerequisites

- Node.js 16+ and npm
- Cloudflare account for deployment
- Google Cloud Console project for OAuth (optional)

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/czhengjuarez/onboarding-builder.git
cd onboarding-builder
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create `.dev.vars` file in root directory:
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=your_jwt_secret_key
```

### 4. Database Setup
```bash
# Create local D1 database
npx wrangler d1 create onboarding-builder-dev

# Run migrations
npx wrangler d1 migrations apply onboarding-builder-dev --local
```

### 5. Development
```bash
# Start frontend (localhost:3000)
npm run dev

# Start backend in new terminal (localhost:8787)
npm run dev:worker
```

## 📦 Available Scripts

### Development
- `npm run dev` - Start frontend development server
- `npm run dev:worker` - Start backend worker locally
- `npm run build` - Build frontend for production
- `npm run deploy` - Build and deploy to Cloudflare Workers

### Database
- `npx wrangler d1 migrations apply [DB_NAME] --local` - Apply migrations locally
- `npx wrangler d1 migrations apply [DB_NAME] --remote` - Apply migrations to production

## 🏗️ Project Structure

```
├── src/                    # Frontend React application
│   ├── App.tsx            # Main application component
│   └── index.tsx          # Application entry point
├── index.ts               # Cloudflare Worker backend
├── migrations/            # Database migration files
├── public/               # Static assets
├── wrangler.toml         # Cloudflare Workers configuration
├── package.json          # Dependencies and scripts
├── tailwind.config.js    # Tailwind CSS configuration
└── vite.config.js        # Vite build configuration
```

## 🔧 Configuration

### Google OAuth Setup
1. Create project in Google Cloud Console
2. Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add authorized redirect URIs:
   - `http://localhost:8787/api/auth/google/callback` (development)
   - `https://your-worker.workers.dev/api/auth/google/callback` (production)

### Cloudflare Workers Setup
1. Update `wrangler.toml` with your worker name
2. Create D1 database: `npx wrangler d1 create your-db-name`
3. Update database binding in `wrangler.toml`
4. Set environment variables in Cloudflare dashboard

## 🚀 Deployment

### Production Deployment
```bash
# Deploy to Cloudflare Workers
npm run deploy

# Apply database migrations to production
npx wrangler d1 migrations apply your-db-name --remote
```

### Environment Variables (Production)
Set in Cloudflare Workers dashboard:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET` 
- `JWT_SECRET`

## 🎯 Key Features Explained

### Version Management
- Create multiple versions of templates
- Switch between versions seamlessly
- Edit version names and descriptions
- Real-time UI synchronization after edits

### Template Sharing
- Generate secure sharing links
- Copy links with elegant "Copied!" indicators
- View and manage shared templates
- Delete shared templates when needed

### Clone System
- Clone shared templates to your account
- Intelligent duplicate detection
- Unified confirmation dialog for all scenarios
- Automatic version switching after cloning
- Overwrite existing versions with confirmation

### JTBD Framework
- Organize resources by job categories
- Auto-save functionality with visual feedback
- Default categories: Design Tools, Process & Workflow, Research & Strategy

## 🐛 Troubleshooting

### Common Issues

**Authentication not working:**
- Verify environment variables are set correctly
- Check Google OAuth redirect URIs match your domains
- Ensure database tables exist (run migrations)

**Database errors:**
- Run `npx wrangler d1 migrations apply [DB_NAME] --local` for local development
- Check database binding in `wrangler.toml` matches actual database name

**Build failures:**
- Clear `dist/` and `.wrangler/` directories
- Run `npm install` to ensure dependencies are current
- Check Node.js version (16+ required)

## 📝 Recent Updates

### Version Edit Synchronization Fix
- Fixed issue where editing version details wouldn't update main display immediately
- Added real-time UI synchronization between edit and display modes
- Eliminated need to toggle versions to see changes

### UI Polish
- Replaced browser alerts with elegant in-app notifications
- Unified clone confirmation dialogs for streamlined UX
- Consistent gray color scheme with brand red accents
- Enhanced copy functionality with temporary "Copied!" indicators

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- **Production**: https://onboarding-builder2.coscient.workers.dev
- **Repository**: https://github.com/czhengjuarez/onboarding-builder
- **Issues**: https://github.com/czhengjuarez/onboarding-builder/issues
