# ProductivityHub - Progressive Web App

A full-stack offline-first productivity application featuring task management, expense tracking, and note-taking with seamless synchronization and mobile installation capabilities.

## Features

### 📋 Task Management
- Create and organize tasks with projects/labels
- Set due dates and times with reminder notifications
- Add subtasks and set priorities (low/medium/high)
- Offline-first with automatic sync

### 💰 Expense Tracking
- Track income and expenses with categories
- Manage debts, EMIs, and recurring payments
- Comprehensive analytics (daily/monthly/yearly)
- Visual charts and quick statistics

### 📝 Note Taking
- Rich text formatting with project organization
- Link notes to tasks and create backlinks
- Search and filter capabilities
- Markdown-like editing experience

### 🔐 User Management
- Secure authentication via Replit OAuth
- User-scoped data with profile management
- Session-based security with HTTP-only cookies

### 📱 Progressive Web App
- **Installable** on mobile devices and desktops
- **Offline-first** - works without internet connection
- **Background sync** - automatic data synchronization
- **Service worker** caching for fast performance
- **Responsive design** optimized for all screen sizes

## Technology Stack

### Frontend
- **React** with TypeScript for type safety
- **Vite** for fast development and building
- **shadcn/ui** components built on Radix UI
- **Tailwind CSS** for modern styling
- **TanStack Query** for server state management
- **Wouter** for lightweight routing

### Backend
- **Express.js** with TypeScript
- **Drizzle ORM** with PostgreSQL
- **Passport.js** for authentication
- **Session management** with PostgreSQL storage

### Storage
- **PostgreSQL** (Neon) for production data
- **IndexedDB** (via Dexie) for offline storage
- **Automatic synchronization** between local and remote

## Prerequisites

- **Node.js** 18+ 
- **PostgreSQL** database (provided by Replit)
- **Replit Account** for authentication

## Installation & Setup

### 1. Clone and Install Dependencies

```bash
# Install all dependencies
npm install
```

### 2. Database Setup

The app uses PostgreSQL with automatic schema management:

```bash
# Push database schema to create tables
npm run db:push
```

### 3. Environment Configuration

The following environment variables are automatically provided by Replit:

- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption key
- `REPL_ID` - Replit application ID
- `REPLIT_DOMAINS` - Allowed domains for authentication

### 4. Start Development Server

```bash
# Start both frontend and backend
npm run dev
```

The application will be available at your Replit domain.

## Usage Guide

### Getting Started

1. **Sign In**: Click the "Sign In" button to authenticate with Replit
2. **Navigate**: Use the tabs to switch between Tasks, Expenses, and Notes
3. **Install**: Click the install button (📱) to add the app to your home screen

### Mobile Installation

1. **On iOS Safari**:
   - Tap the share button
   - Select "Add to Home Screen"
   - Confirm installation

2. **On Android Chrome**:
   - Tap the menu (⋮)
   - Select "Add to Home Screen" or "Install App"
   - Confirm installation

3. **Using Install Button**:
   - Look for the install icon (📱) in the app header
   - Click and follow the browser prompts

### Offline Usage

- **Automatic**: The app works offline by default
- **Data Storage**: All data is stored locally in IndexedDB
- **Sync**: Data automatically syncs when connection is restored
- **Indicators**: Connection status is shown in the app

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── lib/            # Utilities and database
│   │   └── hooks/          # Custom React hooks
│   └── public/             # Static assets and PWA manifest
├── server/                 # Backend Express application
│   ├── db.ts              # Database connection
│   ├── storage.ts         # Data access layer
│   ├── routes.ts          # API endpoints
│   └── replitAuth.ts      # Authentication setup
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Database schema and types
└── package.json           # Dependencies and scripts
```

## API Endpoints

### Authentication
- `GET /api/auth/user` - Get current user
- `GET /api/login` - Start login flow
- `GET /api/logout` - Sign out user
- `GET /api/callback` - OAuth callback

### Tasks
- `GET /api/tasks` - List user tasks
- `POST /api/tasks` - Create new task
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Projects
- `GET /api/projects` - List user projects
- `POST /api/projects` - Create new project

### Expenses
- `GET /api/expenses` - List user expenses
- `POST /api/expenses` - Create new expense
- `GET /api/expenses/analytics` - Get expense analytics

### Notes
- `GET /api/notes` - List user notes
- `POST /api/notes` - Create new note
- `PATCH /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database operations
npm run db:push          # Push schema changes
npm run db:push --force  # Force push schema changes

# Type checking
npm run type-check
```

## Deployment

The app is designed to run on Replit with automatic deployment:

1. **Database**: Automatically provisioned PostgreSQL
2. **Authentication**: Integrated Replit OAuth
3. **Hosting**: Served on Replit domains
4. **SSL**: Automatic HTTPS certificates

## PWA Features

### Service Worker
- Caches app shell and assets
- Handles offline requests
- Background sync capabilities

### Web App Manifest
- App name and description
- Icons for different sizes
- Theme colors and display mode
- Start URL and scope

### Offline Capabilities
- Full functionality without internet
- Local data persistence
- Queue actions for sync
- Graceful online/offline transitions

## Browser Support

- **Chrome/Edge** 88+
- **Firefox** 84+
- **Safari** 14+
- **Mobile browsers** with PWA support

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Ensure Replit OAuth is properly configured
   - Check REPLIT_DOMAINS environment variable

2. **Database Connection Error**
   - Verify DATABASE_URL is set
   - Run `npm run db:push` to sync schema

3. **Offline Sync Issues**
   - Check browser console for service worker errors
   - Clear browser cache and reload

4. **Install Button Not Showing**
   - Ensure HTTPS is enabled
   - Check PWA manifest validation

### Logs and Debugging

- **Server logs**: Available in Replit console
- **Browser console**: Press F12 for developer tools
- **Network tab**: Monitor API requests and responses
- **Application tab**: Check IndexedDB and service worker

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Security

- Session-based authentication with HTTP-only cookies
- CSRF protection through session validation
- User-scoped data access
- Secure password handling via OAuth
- Environment-based configuration

## License

This project is licensed under the MIT License - see the LICENSE file for details.