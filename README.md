# Vessel Central

A cross-platform maritime vessel management application built with Expo and React Native. Provides role-based dashboards for owners, managers, and crew members to manage vessels, maintenance tasks, issues, supply requests, documentation, and scheduling.

## Getting Started

### Prerequisites

- Node.js >= 18.x
- npm or yarn
- Expo CLI (installed via npm)
- iOS Simulator / Android Emulator (optional for mobile development)
- Supabase account for backend services

### Installation

```bash
npm install
```

### Environment Setup

Create a `.env` file in the project root:

```
EXPO_PUBLIC_SUPABASE_URL=<your-supabase-project-url>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

Get these values from your Supabase dashboard under **Project Settings > API**.

### Quick Start

```bash
# Start development server with tunnel
npm run dev

# Or run on specific platform
npm run ios
npm run android
npm run web
```

## Architecture

### Tech Stack

| Layer      | Technology                                |
| ---------- | ----------------------------------------- |
| Framework  | Expo 54 / React Native 0.81               |
| Language   | TypeScript 5.9                            |
| Navigation | Expo Router (file-based)                  |
| Backend    | Supabase (Auth + PostgreSQL)              |
| State      | React Context API                         |
| Styling    | React Native StyleSheet + Linear Gradient |

### Project Structure

```
vessel-central/
├── app/                    # Routes (Expo Router file-based)
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── owner.tsx      # Owner dashboard
│   │   ├── manager.tsx    # Manager dashboard
│   │   ├── crew.tsx       # Crew dashboard
│   │   ├── calendar.tsx   # Calendar & scheduling
│   │   ├── maintenance.tsx# Maintenance tasks
│   │   ├── documents.tsx  # Document management
│   │   ├── issues.tsx     # Issue tracking
│   │   └── supplies.tsx   # Supply requests
│   ├── login.tsx          # Authentication
│   └── add-*.tsx          # Creation modals
├── components/            # Reusable UI components
├── contexts/              # State management
│   ├── AuthContext.tsx    # Authentication & roles
│   ├── DataContext.tsx    # Entity data management
│   └── WidgetContext.tsx  # Widget state
├── hooks/                 # Custom React hooks
├── utils/                 # Utility functions
│   ├── supabase.ts       # Supabase client
│   ├── cacheManager.ts   # Smart caching
│   ├── offlineManager.ts # Offline queue
│   └── realtimeManager.ts# Real-time subscriptions
├── types/                 # TypeScript definitions
├── constants/             # App constants
└── docs/                  # Technical documentation
```

### Key Components

- **AuthContext**: Multi-role authentication (Owner/Manager/Crew) with session persistence
- **DataContext**: Centralized data management for all entities
- **FloatingTabBar**: Role-aware bottom navigation
- **GradientContainer**: Consistent gradient backgrounds
- **OfflineQueueStatus**: Offline mode indicator with sync status

### Data Entities

| Entity            | Description                                 |
| ----------------- | ------------------------------------------- |
| Vessels           | Fleet management with crew assignments      |
| Maintenance Tasks | Recurring/one-time tasks with cost tracking |
| Issues            | Problem reporting with priority levels      |
| Supply Requests   | Material requests with approval workflow    |
| Documents         | File storage with categories                |
| Calendar Events   | Scheduling and crew coordination            |

## Development

### Available Scripts

| Script                  | Description                               |
| ----------------------- | ----------------------------------------- |
| `npm run dev`           | Start Expo with tunnel for remote testing |
| `npm run ios`           | Run on iOS simulator                      |
| `npm run android`       | Run on Android emulator                   |
| `npm run web`           | Run web version                           |
| `npm run build:web`     | Build PWA with service worker             |
| `npm run build:android` | Prebuild Android native code              |
| `npm run lint`          | Run ESLint checks                         |

### Code Quality

ESLint is configured with Expo and TypeScript rules. Run before committing:

```bash
npm run lint
```

### Key Patterns

- **Offline-First**: Actions queue when offline, sync automatically when reconnected
- **Smart Caching**: Multi-level cache (memory + AsyncStorage) with configurable TTL
- **Real-time Updates**: Supabase subscriptions for live data
- **Error Boundaries**: Graceful error handling with recovery options

## Deployment

### EAS Build Configuration

The project uses Expo Application Services (EAS) for builds:

```bash
# Development build
eas build --profile development --platform ios

# Production build
eas build --profile production --platform all
```

### Build Profiles

| Profile     | Purpose                          |
| ----------- | -------------------------------- |
| development | Internal testing with dev client |
| preview     | Internal distribution            |
| production  | App store releases               |

### Web Deployment

```bash
npm run build:web
```

Outputs to `dist/` with Workbox service worker for PWA support.

## API Documentation

### Authentication

```typescript
// AuthContext provides
const { user, role, signIn, signOut, isAuthenticated } = useAuth();

// Roles: 'owner' | 'manager' | 'crew'
```

### Data Access

```typescript
// DataContext provides entity access
const {
  vessels,
  maintenanceTasks,
  issues,
  supplyRequests,
  documents,
  calendarEvents,
  // CRUD operations for each entity
} = useData();
```

### Supabase Client

```typescript
import { supabase } from "@/utils/supabase";

// Direct queries when needed
const { data, error } = await supabase.from("vessels").select("*");
```

## Contributing

1. Create a feature branch from `main`
2. Make changes following existing patterns
3. Run `npm run lint` before committing
4. Submit PR with clear description

For active development context and current work, see [CONTEXT.md](./docs/CONTEXT.md) (if available).

## Troubleshooting

### Common Issues

**Metro bundler cache issues**

```bash
npx expo start --clear
```

**Supabase connection errors**

- Verify `.env` variables are set correctly
- Check Supabase project is running
- Ensure network connectivity

**iOS build fails**

```bash
cd ios && pod install && cd ..
```

**Android build fails**

```bash
cd android && ./gradlew clean && cd ..
```

**Offline queue not syncing**

- Check `OfflineQueueStatus` component for pending items
- Verify network connectivity
- Check Supabase service status

### Debug Commands

```bash
# Clear all caches
npx expo start --clear

# View Metro logs
npx expo start --no-dev --minify

# Check TypeScript
npx tsc --noEmit
```

## Documentation

Additional technical documentation available in `/docs/`:

- `CACHING_SYSTEM.md` - Cache implementation details
- `NOTIFICATION_SYSTEM.md` - Push notification setup
- `IMAGE_OPTIMIZATION.md` - Image handling best practices
- `PERFORMANCE_OPTIMIZATIONS.md` - Performance tuning guide

## License

Private - All rights reserved
