# Onboarding Builder

A comprehensive onboarding template builder and management system built with React and deployed on Cloudflare Workers. Create, manage, and share onboarding templates with version control, resource management, and collaborative features.

## 🚀 Features

### Core Functionality
- **Template Management**: Create, edit, and organize onboarding templates across multiple time periods
- **Version Control**: Multiple named versions per user with seamless switching and management
- **Resource Management**: Organize resources by categories with inline editing and auto-save
- **Template Sharing**: Share templates with others via secure links with clone limits
- **Clone System**: Clone shared templates with intelligent duplicate detection and merge options
- **PDF Export**: Export templates and resources to PDF with hyperlink preservation
- **Guest Mode**: Try the app without registration with smart warning system

### Authentication
- **Google OAuth**: Seamless Google account integration with popup and redirect support
- **Email Authentication**: Traditional email/password registration and login
- **Account Management**: Profile management with secure account deletion
- **JWT Security**: Secure token-based authentication system

### User Experience
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Updates**: Immediate UI synchronization after all operations
- **Professional UI**: Clean design with brand colors (#8F1F57) and Tailwind CSS
- **Success Notifications**: Elegant in-app notifications and feedback
- **Auto-save**: Automatic saving with visual indicators for all content

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Cloudflare Workers with Hono framework, D1 Database
- **Authentication**: Google OAuth 2.0, JWT tokens, bcrypt password hashing
- **PDF Generation**: jsPDF with html2canvas for image-based exports
- **Deployment**: Cloudflare Workers with edge computing and static asset serving
- **Development**: Local development with Wrangler CLI and hot reload

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
npx wrangler d1 create onboarding-builder-versions-dev

# Run migrations
npx wrangler d1 migrations apply onboarding-builder-versions-dev --local
```

### 5. Development
```bash
# Start frontend development server
npm run dev

# Start backend worker in new terminal
npm run dev:wrangler
```

## 📦 Available Scripts

### Development
- `npm run dev` - Start frontend development server (Vite)
- `npm run dev:wrangler` - Start backend worker locally (port 8787)
- `npm run build` - Build frontend for production
- `npm run preview` - Preview production build locally
- `npm run deploy` - Build and deploy to Cloudflare Workers

### Database
- `npm run db:migrate` - Apply migrations to local database
- `npx wrangler d1 migrations apply [DB_NAME] --local` - Apply migrations locally
- `npx wrangler d1 migrations apply [DB_NAME] --remote` - Apply migrations to production
- `npx wrangler secret put [SECRET_NAME]` - Set production environment variables

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
4. Set production secrets using Wrangler CLI:
   ```bash
   npx wrangler secret put GOOGLE_CLIENT_ID
   npx wrangler secret put GOOGLE_CLIENT_SECRET
   npx wrangler secret put JWT_SECRET
   ```

## 🚀 Deployment

### Production Deployment
```bash
# Deploy to Cloudflare Workers
npm run deploy

# Apply database migrations to production
npx wrangler d1 migrations apply your-db-name --remote
```

### Environment Variables (Production)
Set using `wrangler secret put` command:
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `JWT_SECRET` - Secret key for JWT token signing

**Note**: Use `wrangler secret put [SECRET_NAME]` to securely set production secrets. Never commit secrets to version control.

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

- **Production**: https://onboarding-builder.coscient.workers.dev
- **Repository**: https://github.com/czhengjuarez/onboarding-builder
- **Issues**: https://github.com/czhengjuarez/onboarding-builder/issues

## 🏗️ Database Schema

The application uses Cloudflare D1 with the following main tables:

- **users** - User accounts with authentication data
- **template_versions** - Named versions for organizing templates
- **onboarding_templates** - Individual onboarding tasks/items
- **jtbd_categories** - Resource categories (renamed from JTBD)
- **resources** - Individual resources within categories
- **shared_templates** - Template sharing with clone limits

Migrations are located in the `/migrations` directory and should be applied in order.

## 🎯 Development Notes

### Recent Major Updates
- **Template Versioning System**: Complete version management with create, edit, delete, and set-default functionality
- **Enhanced Clone System**: Intelligent duplicate detection and merge options for shared templates
- **PDF Export Enhancement**: Dual export system with hyperlink preservation for resources
- **Authentication Improvements**: Unified JWT system and secure account management
- **UI Polish**: Professional design with consistent brand colors and improved UX

### Known Issues
- Template re-seeding occurs when users delete all templates (by design)
- Google OAuth requires proper redirect URI configuration in Google Console
- Local development requires both frontend and backend servers running simultaneously
