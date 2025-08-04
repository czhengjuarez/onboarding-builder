# DesignOps Onboarding Template Builder

A comprehensive onboarding template builder with dual authentication system (email/password + Google OAuth), guest mode exploration, and account management features. Built with React, TypeScript, and deployed on Cloudflare Workers with D1 database.

## 🚀 Live Demo

**Production URL:** https://onboarding-builder.coscient.workers.dev

## ✨ Features

### 🔐 **Comprehensive Authentication System**
- **Email/Password Registration & Login** - Secure account creation with bcrypt hashing
- **Google OAuth Integration** - Seamless Google Sign-In alongside email/password
- **Guest Mode Exploration** - Users can explore all features before signing in
- **Smart Warning System** - Alerts guest users about data loss when making changes
- **Account Management** - Profile viewing and secure account deletion with complete data cleanup

### 📋 **Onboarding Template Builder**
- **Period-based Templates** - Organize tasks by Day 1, Week 1, Month 1, etc.
- **Priority Management** - High, Medium, Low priority task categorization
- **JTBD Framework** - Jobs-to-be-Done categories with resource management
- **PDF Export** - Download professional onboarding templates
- **Real-time Updates** - Instant synchronization across all user sessions

### 🛠️ **Technical Stack**
- **Frontend:** React 18, TypeScript, Tailwind CSS
- **Backend:** Cloudflare Workers with Hono framework
- **Database:** Cloudflare D1 (SQLite)
- **Authentication:** JWT tokens with bcrypt password hashing
- **Deployment:** Cloudflare Workers with automatic CI/CD

## 🏗️ **Setup & Development**

### Prerequisites
- Node.js 18+
- npm or yarn
- Cloudflare account (for deployment)
- Google Cloud Console project (for OAuth)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/czhengjuarez/onboarding-builder
   cd onboarding-builder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

4. **Run database migrations**
   ```bash
   npx wrangler d1 execute onboarding-builder --local --file=./migrations/0001_initial_schema.sql
   npx wrangler d1 execute onboarding-builder --local --file=./migrations/0002_jtbd_resources_update.sql
   npx wrangler d1 execute onboarding-builder --local --file=./migrations/0003_add_password_auth.sql
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🔧 **Configuration**

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:8787/api/auth/google/callback` (development)
   - `https://your-domain.workers.dev/api/auth/google/callback` (production)

### Environment Variables
Required environment variables (see `.env.example`):
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `JWT_SECRET` - Secure random string for JWT signing

## 🚀 **Deployment**

### Production Deployment to Cloudflare Workers

1. **Set up Wrangler secrets**
   ```bash
   npx wrangler secret put GOOGLE_CLIENT_ID
   npx wrangler secret put GOOGLE_CLIENT_SECRET
   npx wrangler secret put JWT_SECRET
   ```

2. **Run remote database migrations**
   ```bash
   npx wrangler d1 execute onboarding-builder --remote --file=./migrations/0001_initial_schema.sql
   npx wrangler d1 execute onboarding-builder --remote --file=./migrations/0002_jtbd_resources_update.sql
   npx wrangler d1 execute onboarding-builder --remote --file=./migrations/0003_add_password_auth.sql
   ```

3. **Deploy to Cloudflare Workers**
   ```bash
   npm run deploy
   ```

## 📡 **API Endpoints**

### Authentication
- `POST /api/auth/register` - Email/password registration
- `POST /api/auth/login` - Email/password login
- `GET /api/auth/google` - Google OAuth redirect
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/verify` - JWT token verification
- `GET /api/auth/config` - Google Client ID for frontend
- `DELETE /api/auth/delete-account` - Account deletion

### Templates & JTBD
- `GET /api/templates/:userId` - Get user's onboarding templates
- `POST /api/templates` - Create new template
- `PUT /api/templates/:id` - Update template
- `DELETE /api/templates/:id` - Delete template
- `GET /api/jtbd/:userId` - Get user's JTBD categories
- `POST /api/jtbd` - Create JTBD category
- `DELETE /api/jtbd/:id` - Delete JTBD category

## 🗄️ **Database Schema**

The application uses Cloudflare D1 with the following tables:
- `users` - User accounts with email/password and OAuth data
- `onboarding_templates` - Period-based onboarding tasks
- `jtbd_categories` - Jobs-to-be-Done categories
- `resources` - Resources linked to JTBD categories
- `jtbd_category_resources` - Many-to-many relationship table

## 🔒 **Security Features**

- **Password Hashing:** bcrypt with salt rounds
- **JWT Tokens:** 7-day expiry with secure signing
- **Input Validation:** Server-side validation for all endpoints
- **SQL Injection Protection:** Prepared statements with parameter binding
- **CORS Configuration:** Proper cross-origin resource sharing setup
- **Secret Management:** Environment variables and Wrangler secrets

## 🧪 **Available Scripts**

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
