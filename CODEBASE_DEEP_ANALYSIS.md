# NetSysCall React Codebase - Comprehensive Analysis

**Analysis Date:** March 24, 2026  
**Framework:** React 18.3.1 + TypeScript + Vite  
**Build Tool:** Vite 5.4.19  
**Package Manager:** Bun  

---

## 1. PROJECT OVERVIEW & ARCHITECTURE

### Project Purpose
NetSysCall (CallTrack Admin) is an admin dashboard application for managing and tracking commercial call center operations. It provides:
- Call recording and playback management
- Commercial/sales team performance tracking
- Call statistics and analytics
- Commercial management
- Admin dashboard with real-time data

### Tech Stack
- **Frontend Framework:** React 18.3.1 with TypeScript
- **UI Library:** shadcn/ui (built on Radix UI)
- **HTTP Client:** Axios with interceptors for JWT auth
- **State Management:** TanStack React Query (for server state)
- **Routing:** React Router v6.30.1
- **Styling:** Tailwind CSS 3.4.17
- **Charts:** Recharts 2.15.4
- **Icons:** Lucide React 0.462.0
- **Forms:** React Hook Form 7.61.1
- **Validation:** Zod 3.25.76
- **Date Handling:** date-fns 3.6.0
- **Build:** Vite with SWC compiler for fast builds

### Architecture Pattern
- **Client-Side Routing:** React Router with protected routes
- **Authentication:** JWT token-based (Bearer tokens in localStorage)
- **API Communication:** Axios with automatic token injection
- **Component Architecture:** Functional components with hooks
- **Layout Pattern:** Nested layout system with sidebar navigation
- **Data Flow:** Direct API calls + local state, no Redux/Zustand

---

## 2. PROJECT FILE STRUCTURE & ORGANIZATION

```
netsysvoiceWeb/
├── src/
│   ├── App.tsx                          # Main routing configuration
│   ├── main.tsx                         # React DOM entry point
│   ├── index.css                        # Global Tailwind imports
│   ├── vite-env.d.ts                    # Vite type definitions
│   │
│   ├── components/                      # Reusable React components
│   │   ├── layout/
│   │   │   ├── DashboardLayout.tsx     # Main layout wrapper with auth check
│   │   │   └── AppSidebar.tsx          # Navigation sidebar
│   │   ├── ui/                          # shadcn/ui components (40+ components)
│   │   │   ├── button.tsx, card.tsx, table.tsx
│   │   │   ├── dialog.tsx, sheet.tsx, drawer.tsx
│   │   │   ├── form.tsx, input.tsx, label.tsx
│   │   │   ├── badge.tsx, avatar.tsx, tooltip.tsx
│   │   │   └── [30+ more UI components]
│   │   ├── calls/
│   │   │   ├── CallsTable.tsx           # Main calls data table with filters
│   │   │   └── AudioPlayerModal.tsx     # Audio playback modal
│   │   ├── dashboard/
│   │   │   ├── StatCard.tsx             # KPI stat cards
│   │   │   ├── CallsChart.tsx           # Call trend visualization
│   │   │   └── TopPerformers.tsx        # Top sales performers display
│   │   ├── audio/
│   │   │   └── AudioPlayerModal.tsx     # Audio player with controls
│   │   ├── performance/
│   │   │   └── RatingStars.tsx          # Star rating component
│   │   ├── commercials/                 # Commercial management UI
│   │   ├── clients/                     # Client management UI
│   │   └── NavLink.tsx                  # Navigation link component
│   │
│   ├── pages/                           # Page-level components
│   │   ├── Index.tsx                    # Root redirect page
│   │   ├── Login.tsx                    # Authentication page
│   │   ├── Dashboard.tsx                # Main dashboard with stats & charts
│   │   ├── Calls.tsx                    # Calls list page
│   │   ├── Commercials.tsx              # Commercials management page
│   │   ├── Performance.tsx              # Performance analytics page
│   │   ├── Statistics.tsx               # Detailed statistics page
│   │   ├── Settings.tsx                 # Admin settings page
│   │   └── NotFound.tsx                 # 404 page
│   │
│   ├── hooks/                           # Custom React hooks
│   │   ├── useCalls.ts                  # Fetch calls with recording checks
│   │   ├── useCallsWithDetails.ts       # Fetch enriched calls with commercials
│   │   ├── useCommercials.ts            # Fetch and cache commercials list
│   │   ├── use-mobile.tsx               # Mobile breakpoint detector
│   │   └── use-toast.ts                 # Toast notification hook
│   │
│   ├── contexts/                        # React Context providers
│   │   └── AuthContext.tsx              # Authentication state management
│   │
│   ├── services/                        # API/business logic services
│   │   ├── api.ts                       # Axios instance + API services
│   │   └── performanceService.ts        # Performance-specific API calls
│   │
│   ├── types/                           # TypeScript interfaces & types
│   │   ├── api.ts                       # API response types
│   │   ├── index.ts                     # App domain types
│   │   └── user.ts                      # User-related types
│   │
│   ├── config/                          # Configuration files
│   │   └── api.ts                       # API endpoints & base config
│   │
│   ├── lib/                             # Utility functions
│   │   └── utils.ts                     # Tailwind merge & format helpers
│   │
│   ├── utils/                           # Application utilities
│   │   └── userUtils.ts                 # User data mapping/conversion
│   │
│   ├── data/                            # Mock data
│   │   └── mockData.ts                  # Static mock data for dev/testing
│   │
│   └── assets/                          # Static assets
│       └── logo.png                     # Application logo
│
├── public/
│   └── robots.txt
│
├── Configuration Files:
├── package.json                         # Dependencies & scripts
├── tsconfig.json                        # TypeScript configuration
├── tsconfig.app.json                    # App-specific TS config
├── tsconfig.node.json                   # Node-specific TS config
├── vite.config.ts                       # Vite build configuration
├── tailwind.config.ts                   # Tailwind CSS configuration
├── postcss.config.js                    # PostCSS configuration
├── eslint.config.js                     # ESLint rules
├── components.json                      # shadcn/ui configuration
├── index.html                           # HTML entry point
└── bun.lockb                            # Bun lock file
```

---

## 3. REACT COMPONENTS INVENTORY & PURPOSE

### Layout Components

#### [DashboardLayout.tsx](src/components/layout/DashboardLayout.tsx)
- **Purpose:** Main layout wrapper for authenticated pages
- **Features:**
  - Authentication check - redirects to login if not authenticated
  - Loading state display
  - Desktop sidebar (fixed, 256px width)
  - Mobile responsive hamburger menu
  - Page title and subtitle display
  - Auto-closes mobile menu on navigation
- **Props:** `{ children, title, subtitle }`
- **Used by:** All page components except Login/Index

#### [AppSidebar.tsx](src/components/layout/AppSidebar.tsx)
- **Purpose:** Main navigation sidebar
- **Features:**
  - Logo display with branding
  - Collapsible menu (16px when collapsed, 256px expanded)
  - 6 navigation items with icons
  - Active route highlighting
  - Current user info display (name + email)
  - Logout button
  - Dark theme styling
- **Navigation Items:**
  - Dashboard → `/dashboard`
  - Commerciaux (Commercials) → `/commercials`
  - Appels (Calls) → `/calls`
  - Performances → `/performance`
  - Statistiques (Statistics) → `/statistics`
  - Paramètres (Settings) → `/settings`

### Calls Components

#### [CallsTable.tsx](src/components/calls/CallsTable.tsx)
- **Purpose:** Display paginated table of all calls with filtering
- **Features:**
  - Uses `useCallsWithDetails` hook for enriched call data
  - Multi-column table: Commercial name, Phone, Call date, Duration, Status, Decision, Recording
  - Search filter (by commercial name or phone number)
  - Status filter dropdown (answered, missed, rejected, no_answer)
  - Decision filter dropdown (interested, call_back, not_interested, etc.)
  - Expandable rows for call details
  - Audio player modal for playback
  - Loading and error states
  - Refetch capability
  - Icon indicators: Phone in/out, recording availability
- **Status Badge Colors:**
  - Answered → Green
  - Missed → Red
  - Rejected → Orange
  - No Answer → Gray
- **Decision Badge Colors:**
  - Interested → Green background
  - Call Back → Blue background
  - Not Interested → Gray background

#### [AudioPlayerModal.tsx](src/components/audio/AudioPlayerModal.tsx)
- **Purpose:** Modal dialog for playing call recordings
- **Features:**
  - Audio playback controls (play/pause)
  - Timeline slider with current time display
  - Volume control with mute button
  - Skip forward/backward buttons
  - Displays call metadata (phone, date, decision, notes)
  - HH:MM:SS duration formatting
  - Responsive design

### Dashboard Components

#### [StatCard.tsx](src/components/dashboard/StatCard.tsx)
- **Purpose:** KPI card for displaying metrics
- **Features:**
  - Title, large value display
  - Icon display with color variants
  - Trend indicator (positive/negative with percentage)
  - Subtitle support
  - 5 style variants: default, primary, success, warning, destructive
- **Used in Dashboard for:** Total calls, Answered calls, Calls with recordings, Duration, Avg duration, Response rate

#### [CallsChart.tsx](src/components/dashboard/CallsChart.tsx)
- **Purpose:** Line/area chart showing call trends over time
- **Features:**
  - Chart visualization (specific implementation details in component)
  - Time-series data display
  - Legend and tooltips

#### [TopPerformers.tsx](src/components/dashboard/TopPerformers.tsx)
- **Purpose:** Display top-performing salespeople
- **Features:**
  - User list with ratings
  - Performance ranking
  - Call statistics per commercial

### UI Components (shadcn/ui - 40+ components)

**Form Components:**
- `button.tsx`, `input.tsx`, `label.tsx`, `textarea.tsx`
- `form.tsx` (React Hook Form integration)
- `select.tsx`, `checkbox.tsx`, `radio-group.tsx`, `toggle.tsx`, `switch.tsx`

**Display Components:**
- `card.tsx`, `badge.tsx`, `avatar.tsx`
- `table.tsx`, `pagination.tsx`
- `skeleton.tsx`, `alert.tsx`, `alert-dialog.tsx`
- `progress.tsx`, `slider.tsx`

**Dialog/Modal Components:**
- `dialog.tsx`, `drawer.tsx`, `sheet.tsx`
- `popover.tsx`, `hover-card.tsx`
- `context-menu.tsx`, `dropdown-menu.tsx`
- `command.tsx` (command palette)

**Layout Components:**
- `tabs.tsx`, `accordion.tsx`, `collapsible.tsx`
- `breadcrumb.tsx`, `navigation-menu.tsx`
- `scroll-area.tsx`, `resizable.tsx`
- `separator.tsx`

**Utility Components:**
- `tooltip.tsx`, `aspect-ratio.tsx`
- `carousel.tsx`, `chart.tsx`
- `input-otp.tsx`, `menubar.tsx`
- `toaster.tsx`, `sonner.tsx`, `use-toast.ts`

---

## 4. CUSTOM HOOKS INVENTORY

### [useCalls](src/hooks/useCalls.ts)
```typescript
interface UseCalls {
  calls: Call[];
  loading: boolean;
  error: string | null;
  pagination: { page: number; limit: number; total: number };
  fetchCalls: (page?: number, limit?: number) => Promise<void>;
  refreshCalls: () => Promise<void>;
  updateCall: (id: number, updates: Partial<Call>) => Promise<void>;
}
```
- **Purpose:** Fetch and manage calls from API
- **Features:**
  - Fetches calls with pagination (default 10 per page)
  - Background recording checking (batched in groups of 3)
  - Updates call state with recording availability
  - Error handling and logging
  - Refresh capability
  - Call update functionality
- **Data Sources:**
  - `/api/v1/calls?skip=X&limit=Y` (calls)
  - `/api/v1/recordings/by-call/{callId}` (recording availability)

### [useCallsWithDetails](src/hooks/useCallsWithDetails.ts)
```typescript
interface EnrichedCall {
  id: number;
  phoneNumber: string;
  callDate: Date;
  duration: number;
  status: string;
  decision: string | null;
  notes: string | null;
  commercialId: number;
  commercialName: string;
  hasRecording: boolean;
  audioUrl: string | null;
  callType?: 'incoming' | 'outgoing';
}

interface UseCallsWithDetailsReturn {
  enrichedCalls: EnrichedCall[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
```
- **Purpose:** Fetch calls enriched with commercial names and recording info
- **Features:**
  - Parallel data fetching (calls + commercials simultaneously)
  - Parallel recording availability checks for all calls
  - Maps commercials to calls for display
  - Constructs audio playback URLs with token
  - Comprehensive error handling
  - Refetch capability
- **Data Sources:**
  - `/api/v1/calls?skip=0&limit=100`
  - `/api/v1/users/commercials`
  - `/api/v1/recordings/by-call/{callId}` (for each call)

### [useCommercials](src/hooks/useCommercials.ts)
```typescript
interface UseCommercials {
  commercials: Record<number, User>;
  loading: boolean;
  error: string | null;
  getCommercialName: (id: number) => string;
  refresh: () => Promise<void>;
}
```
- **Purpose:** Fetch and cache commercials list
- **Features:**
  - Caches commercials as map (by ID) for O(1) lookup
  - Helper function to get commercial name by ID
  - Error handling
  - Refresh capability
- **Data Source:** `/api/v1/users/commercials`

### [useIsMobile](src/hooks/use-mobile.tsx)
```typescript
function useIsMobile(): boolean
```
- **Purpose:** Detect if viewport is mobile-sized
- **Features:**
  - Media query listener for breakpoint (768px)
  - Updates on window resize
  - SSR-safe (initialization check)
- **Usage:** Conditional rendering of mobile vs desktop UI

### [useToast](src/hooks/use-toast.ts)
- **Purpose:** Toast notification system
- **Features:** Provided by shadcn/ui wrapper

---

## 5. PAGE COMPONENTS & ROUTING

### Route Configuration (in [App.tsx](src/App.tsx))

| Route | Component | Purpose | Auth Required |
|-------|-----------|---------|---|
| `/` | Index | Root redirect | No |
| `/login` | Login | Authentication page | No |
| `/dashboard` | Dashboard | Main dashboard with stats | Yes |
| `/commercials` | Commercials | Commercial management | Yes |
| `/calls` | Calls | Call history & management | Yes |
| `/performance` | Performance | Individual/all commercial performance | Yes |
| `/performance/:id` | Performance | Specific commercial performance | Yes |
| `/statistics` | Statistics | Detailed analytics | Yes |
| `/settings` | Settings | Admin settings | Yes |
| `*` | NotFound | 404 page | No |

### Page Details

#### [Index.tsx](src/pages/Index.tsx)
- **Purpose:** Root path redirect
- **Logic:** 
  - If authenticated → redirect to `/dashboard`
  - If not authenticated → redirect to `/login`
  - Shows loading spinner while checking auth

#### [Login.tsx](src/pages/Login.tsx)
- **Purpose:** User authentication
- **Features:**
  - Email + password form
  - Show/hide password toggle
  - Logo and branding
  - Form validation
  - Loading state on submit
  - Error toast notifications
  - Auto-redirect if already authenticated
  - Beautiful gradient background with pattern overlay

#### [Dashboard.tsx](src/pages/Dashboard.tsx)
- **Purpose:** Main admin dashboard
- **Features:**
  - Loads real data from `useCallsWithDetails` hook
  - 6 KPI stat cards (total calls, answered, with recordings, duration, avg duration, response rate)
  - Calls trend chart
  - Top performers display
  - Recent calls table
  - Responsive grid layout (1→2→3→6 columns)

#### [Calls.tsx](src/pages/Calls.tsx)
- **Purpose:** Complete calls history
- **Features:**
  - Full CallsTable component
  - Uses mock data (`mockCalls`)
  - Card container

#### [Commercials.tsx](src/pages/Commercials.tsx)
- **Purpose:** Commercial/sales team management
- **Features:**
  - List active commercials
  - Toggle to view inactive users
  - Create new commercial modal
  - User table with status indicators (active/inactive)
  - User data: name, email, phone, role, active status
  - Creation date display

#### [Performance.tsx](src/pages/Performance.tsx)
- **Purpose:** Performance analytics for commercials
- **Features:**
  - If no ID: displays grid of all commercials with performance cards
  - If ID provided: displays detailed performance for specific commercial
  - KPI cards: total calls, answered, response rate, avg duration
  - Bar and line charts for weekly/monthly trends
  - Commercial details (name, avatar, rating)
  - Rating input for coaching
  - Comments section
  - Shows: weekly stats, monthly stats, performance trends

#### [Statistics.tsx](src/pages/Statistics.tsx)
- **Purpose:** Detailed statistics and analytics
- **Features:**
  - Multiple chart visualizations:
    - Call status distribution (pie chart)
    - Incoming vs Outgoing calls (pie chart)
    - Monthly trends (bar/line chart)
    - Hourly activity (chart)
    - Weekly calls trend (area chart)
  - Uses mock data for charts
  - Color-coded metrics

#### [Settings.tsx](src/pages/Settings.tsx)
- **Purpose:** Admin configuration
- **Features:**
  - Profile settings (name, email, phone)
  - Security settings (password change)
  - Notification preferences (email, push, weekly)
  - Data export functionality
  - Settings organized by category with icons
  - Not fully implemented (uses toast placeholders)

#### [NotFound.tsx](src/pages/NotFound.tsx)
- **Purpose:** 404 page
- **Features:** Friendly error message with redirect to dashboard

---

## 6. UI COMPONENT LIBRARY USAGE

### shadcn/ui Components Used

**Installation Location:** `src/components/ui/`

**Component Categories:**

1. **Form Controls** (8 components)
   - Button with variants (primary, secondary, ghost, destructive, outline)
   - Input (text fields)
   - Label (form labels)
   - Textarea (multi-line input)
   - Select (dropdown)
   - Checkbox (multi-select)
   - Radio Group (exclusive select)
   - Toggle/Toggle Group

2. **Data Display** (7 components)
   - Card (container with header, content, footer)
   - Table (structured data)
   - Badge (status/tag indicators)
   - Avatar (user profile pictures)
   - Skeleton (loading placeholder)
   - Alert (alert messages)
   - Pagination

3. **Dialogs/Modals** (6 components)
   - Dialog (modal dialog)
   - Drawer (side drawer)
   - Sheet (off-canvas navigation)
   - AlertDialog (confirmation)
   - Popover (floating content)
   - HoverCard (tooltip variant)

4. **Navigation** (3 components)
   - Breadcrumb
   - Navigation Menu
   - Command/Command Palette

5. **Layout** (6 components)
   - Tabs (tabbed content)
   - Accordion (collapsible sections)
   - Collapsible (show/hide content)
   - Separator (visual divider)
   - Scroll Area (custom scrollbar)
   - Resizable (draggable panels)

6. **Charts & Media** (5 components)
   - Chart (recharts wrapper)
   - Carousel (image carousel)
   - Aspect Ratio (constrain aspect)
   - Audio/Video support

7. **Notifications** (3 components)
   - Toast/Toaster (toast notifications)
   - Sonner (alternative toast)
   - Tooltip (hover tooltips)

8. **Utility** (2 components)
   - Input OTP (one-time password)
   - Dropdown Menu
   - Context Menu
   - Menubar

---

## 7. API INTEGRATION PATTERNS

### Configuration ([src/config/api.ts](src/config/api.ts))

```typescript
const API_CONFIG = {
  BASE_URL: 'http://localhost:8000',  // Backend API location
  TIMEOUT: 10000,                      // Request timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};

const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/login',
    REGISTER: '/api/v1/register',
    PROFILE: '/api/v1/me',
  },
  USERS: {
    BASE: '/api/v1/users',
    BY_ID: (id: string) => `/api/v1/users/${id}`,
    COMMERCIALS: '/api/v1/users/commercials',
    INACTIVE: '/api/v1/users/inactive',
  },
  CLIENTS: {
    BASE: '/api/v1/clients',
    BY_ID: (id: string) => `/api/v1/clients/${id}`,
  },
  CALLS: {
    BASE: '/api/v1/calls',
    BY_ID: (id: string) => `/api/v1/calls/${id}`,
  },
  RECORDINGS: {
    BASE: '/api/v1/recordings',
    UPLOAD: '/api/v1/recordings/upload',
    BY_ID: (id: string) => `/api/v1/recordings/${id}`,
    DOWNLOAD: (id: string) => `/api/v1/recordings/${id}/download`,
  },
};
```

### Service Layer ([src/services/api.ts](src/services/api.ts))

**Axios Instance Configuration:**
- Automatic JWT token injection via interceptor
- Bearer token format with prefix handling
- CORS headers added
- Token passed both as header AND query parameter (for API compatibility)
- Auth header: `Authorization: Bearer <token>`
- Timeout: 10000ms

**Request Interceptors:**
- Add JWT token to all requests (except login/register)
- Avoid request loops by checking endpoint
- Handle both Bearer and non-Bearer token formats

**Response Interceptors:**
- Handle 401 Unauthorized → redirect to login
- Handle 403 Forbidden errors
- Log all responses with status and URL
- Error logging with full context

**API Services:**

#### authService
```typescript
login(email: string, password: string): Promise<LoginResponse>
register(userData: RegisterRequest): Promise<UserResponse>
getProfile(): Promise<UserResponse>
```

#### userService
```typescript
getAll(): Promise<UsersResponse>                    // All users
getCommercials(): Promise<UsersResponse>           // All commercials
getInactiveUsers(): Promise<UsersResponse>         // Inactive users
getById(id: string): Promise<UserResponse>
create(userData: RegisterRequest): Promise<UserResponse>
update(id: string, userData: UpdateUserRequest): Promise<ApiResponse<User>>
delete(id: string): Promise<{ success: boolean }>
```

#### clientService
```typescript
getAll()
getById(id: string)
create(clientData: any)
update(id: string, clientData: any)
delete(id: string)
```

#### callService
```typescript
getAll(params?: { skip?: number; limit?: number }): Promise<CallsResponse>
getById(id: string): Promise<CallResponse>
create(callData: any): Promise<CallResponse>
update(id: string, callData: any): Promise<CallResponse>
delete(id: string): Promise<{ success: boolean }>
```

#### recordingService
```typescript
getAll(): Promise<RecordingsResponse>
getById(id: string): Promise<RecordingResponse>
getByCallId(callId: number): Promise<RecordingResponse>
upload(file: File): Promise<RecordingResponse>
download(id: string): Promise<Blob>
```

### performanceService ([src/services/performanceService.ts](src/services/performanceService.ts))
```typescript
getCommercialPerformance(commercialId: string | number): Promise<PerformanceResponse>
getMyPerformance(): Promise<PerformanceResponse>
getAllCommercialsPerformance(): Promise<CommercialPerformance[]>
formatDuration(seconds: number): string          // HH:MM:SS formatting
calculateResponseRate(answered: number, total: number): number  // Percentage
```

### Error Handling Pattern
- Try-catch blocks in components
- Toast notifications for user-facing errors
- Console logging for debugging
- Graceful fallbacks with mock data when needed

---

## 8. AUTHENTICATION & CONTEXT SETUP

### AuthContext ([src/contexts/AuthContext.tsx](src/contexts/AuthContext.tsx))

**Context Shape:**
```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  hasRequiredRole: (user: User | null) => boolean;
}
```

**Authentication Flow:**

1. **On App Mount:**
   - Check for token in localStorage
   - If token exists, call `/api/v1/me` to get user profile
   - Validate user has required role (ADMIN or MANAGER)
   - Store user state if valid, clear token if invalid

2. **Login Process:**
   - POST to `/api/v1/login` with email/password
   - Store returned token in localStorage with "Bearer " prefix
   - Fetch user profile via `/api/v1/me`
   - Validate role requirement
   - Show toast success/failure
   - Return true/false for UI logic

3. **Logout Process:**
   - Remove token from localStorage
   - Clear user state
   - No backend logout call

4. **Role Validation:**
   - Required roles: ADMIN, MANAGER
   - Commercial role users denied access
   - Redirects to login if role invalid

5. **Token Management:**
   - Stored as `Bearer <token>` in localStorage
   - Automatically injected in requests via interceptor
   - Auto-redirect on 401/403 errors

**Provider Wrapping:**
```tsx
<BrowserRouter>
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>...</Routes>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
</BrowserRouter>
```

---

## 9. DATA TYPES & INTERFACES

### API Types ([src/types/api.ts](src/types/api.ts))

**User Types:**
```typescript
interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  role: 'commercial' | 'admin' | 'manager';
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  // App compatibility aliases
  firstName?: string;
  lastName?: string;
  rating?: number;
  totalCalls?: number;
  answeredCalls?: number;
  totalDuration?: number;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

interface LoginRequest {
  email: string;
  password: string;
}
```

**Call Types:**
```typescript
interface Call {
  id: number;
  phone_number: string;
  duration: number;
  status: 'answered' | 'missed' | 'rejected' | 'no_answer';
  decision: 'interested' | 'not_interested' | 'call_back' | null;
  notes: string | null;
  client_id: number | null;
  commercial_id: number;
  commercial: Commercial;
  call_date: string;
  call_type?: 'incoming' | 'outgoing';
  has_recording?: boolean;
}

interface CallsResponse extends ApiResponse<Call[]> {
  total?: number;
}
```

**Recording Types:**
```typescript
interface Recording {
  id: number;
  file_size: number;
  uploaded_at: string;
  filename: string;
  file_path: string;
  duration: number;
  call_id: number;
  call?: Call;
}
```

**Generic Response Type:**
```typescript
interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}
```

### Application Domain Types ([src/types/index.ts](src/types/index.ts))

```typescript
export type UserRole = 'commercial' | 'admin' | 'manager';
export type CallStatus = 'answered' | 'missed' | 'rejected' | 'no_answer';
export type CallDecision = 'interested' | 'call_back' | 'not_interested' | 'no_answer' | 'wrong_number';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  rating?: number;
  totalCalls?: number;
  answeredCalls?: number;
}

interface Call {
  id: number;
  phoneNumber: string;
  duration: number;
  status: CallStatus;
  decision?: CallDecision;
  notes?: string;
  callDate: string;
  commercialId: number;
  commercial?: User;
  callType: 'incoming' | 'outgoing';
  recording?: Recording;
}

interface DashboardStats {
  totalCalls: number;
  answeredCalls: number;
  missedCalls: number;
  totalDuration: number;
  averageDuration: number;
  responseRate: number;
}

interface CommercialPerformance extends User {
  stats: DashboardStats;
  rating: number;
}
```

### User Type ([src/types/user.ts](src/types/user.ts))

```typescript
enum UserRole {
  COMMERCIAL = "commercial",
  ADMIN = "admin",
  MANAGER = "manager",
}

interface PerformanceStats {
  total_calls: number;
  answered_calls: number;
  response_rate: number;
  average_duration: number;
  total_duration: number;
  rating?: number | null;
}

interface WeeklyStats {
  week_start: string;
  week_end: string;
  calls: number;
  answered: number;
}

interface CommercialPerformance extends User {
  stats: PerformanceStats;
  weekly_stats: WeeklyStats[];
  monthly_stats: MonthlyStats[];
}
```

**Type Mapping:**
- API types use snake_case (first_name, phone_number, created_at, etc.)
- App types use camelCase (firstName, phoneNumber, createdAt, etc.)
- [userUtils.ts](src/utils/userUtils.ts) provides conversion functions

---

## 10. DATA FLOW & STATE MANAGEMENT

### Global State
- **Authentication:** AuthContext (login, logout, user, isLoading)
- **Server State:** Managed via hooks that call services directly
- **UI State:** Component-level useState

### Data Fetching Pattern

```
Component → Hook (custom) → Service (api.ts) → Axios → API Backend
                                                        ↓
                              localStorage (token) ← Response + Interceptor Processing
```

**Example Flow: Dashboard Loading**

```
Dashboard.tsx
  ↓
  useCallsWithDetails()
    ↓
    fetchCalls() + fetchCommercials() [parallel]
      ↙                         ↘
  GET /api/v1/calls         GET /api/v1/users/commercials
      ↓                         ↓
  Call[] data               User[] data (map by ID)
      ↓                         ↓
    For each call: checkRecording() [parallel]
      ↓
    GET /api/v1/recordings/by-call/{id} [batch requests]
      ↓
    Enrich calls with commercial names + recording availability
      ↓
  enrichedCalls state
      ↓
  Render <CallsTable />
```

### Local Component State
- Search/filter values
- Modal open/close states
- Form input states
- Pagination states
- Audio player states

---

## 11. ARCHITECTURE PATTERNS USED

### Design Patterns

1. **Provider Pattern** - AuthContext wraps app for auth state
2. **Composition Pattern** - DashboardLayout composes with pages
3. **Custom Hooks Pattern** - useCalls, useCallsWithDetails, useCommercials extract logic
4. **Service Layer Pattern** - api.ts centralizes all HTTP calls
5. **Context + Reducer Pattern** - AuthContext for global auth state
6. **Interceptor Pattern** - Axios interceptors for automatic token injection

### Code Organization

- **Separation of Concerns:**
  - Components: UI rendering only
  - Hooks: Business logic + data fetching
  - Services: API communication
  - Contexts: Global state
  - Types: TypeScript interfaces

- **Reusability:**
  - shadcn/ui components for consistency
  - Custom hooks avoid duplication
  - Service layer abstracts API
  - Layout components wrapping

### Performance Optimizations

- useCallback in hooks to prevent unnecessary re-renders
- useMemo in CallsTable for filtered/sorted data
- Parallel API requests (Promise.all)
- Lazy recording verification (batch loading)
- Pagination in tables (default 10 items)

---

## 12. EXISTING FUNCTIONALITY SUMMARY

### ✅ IMPLEMENTED FEATURES

**Authentication:**
- ✅ Login page with email/password form
- ✅ JWT token storage and validation
- ✅ Automatic auth checking on app mount
- ✅ Role-based access (ADMIN/MANAGER only)
- ✅ Logout functionality
- ✅ Protected routes with auth check

**Dashboard:**
- ✅ 6 KPI stat cards with trend indicators
- ✅ Call trend chart
- ✅ Top performers display
- ✅ Recent calls table
- ✅ Responsive grid layout

**Calls Management:**
- ✅ Full calls table with multiple columns
- ✅ Search by commercial name or phone
- ✅ Filter by call status
- ✅ Filter by decision
- ✅ Audio player modal with controls
- ✅ Expandable row details
- ✅ Icon indicators for call type/recording

**Commercials Management:**
- ✅ List active commercials
- ✅ Toggle inactive users view
- ✅ Create new commercial modal (form UI)
- ✅ User details display

**Performance Analytics:**
- ✅ All commercials grid view
- ✅ Individual commercial detail view
- ✅ Performance stats display
- ✅ Weekly trends visualization
- ✅ Monthly trends visualization
- ✅ Rating input for coaching

**Statistics:**
- ✅ Call status distribution pie chart
- ✅ Incoming/outgoing calls pie chart
- ✅ Monthly trends bar chart
- ✅ Hourly activity chart
- ✅ Weekly calls trend area chart

**Navigation:**
- ✅ Desktop sidebar with collapsible menu
- ✅ Mobile hamburger menu
- ✅ Active route highlighting
- ✅ 6 main navigation items

**Settings:**
- ✅ Profile settings form (UI only)
- ✅ Security settings form (UI only)
- ✅ Notification preferences (UI only)
- ✅ Data export button (UI only)

---

## 13. MISSING OR NOT FULLY IMPLEMENTED

### ❌ INCOMPLETE/MISSING FEATURES

1. **Commercials Management:**
   - Create commercial form not connecting to API
   - Edit commercial functionality
   - Delete commercial functionality
   - No real data loading (uses mock data)

2. **Settings Page:**
   - Profile update not functional
   - Password change not implemented
   - Notification preferences not saved
   - Data export not implemented

3. **Performance Page:**
   - Rating submission not saving
   - Comments not functional
   - No coaching workflow

4. **Advanced Filtering:**
   - No date range filters for calls
   - No duration range filters
   - No commercial assignment management

5. **Real-time Updates:**
   - No WebSocket connections
   - No polling for new calls
   - Data not auto-refreshing

6. **Error Pages:**
   - NotFound page exists but minimal
   - No error boundary implementation

7. **Testing:**
   - No unit tests
   - No integration tests
   - No e2e tests

8. **Documentation:**
   - No code comments
   - No API documentation
   - Minimal type documentation

---

## 14. CODE QUALITY & STANDARDS

### What's Good ✅
- Consistent TypeScript types throughout
- Clear component naming
- Organized file structure
- Proper use of React hooks
- Good UI component reuse via shadcn/ui
- Error handling with try-catch
- Toast notifications for user feedback
- Responsive design with mobile support
- French localization

### What Could Improve ⚠️
- No error boundaries for crash prevention
- Limited JSDoc documentation
- Mock data mixed with real API calls
- No loading state consistency
- Some components could be split smaller
- No accessibility (a11y) testing
- No error recovery strategies
- Token refresh not implemented (will expire)

---

## 15. DEPLOYMENT & BUILD INFO

### Build Configuration (vite.config.ts)
```typescript
- Dev server: localhost:8080
- SWC compiler for fast builds
- Path alias: @ → src/
- Component tagger plugin (development only)
```

### Scripts
```json
"dev": "vite"                    // Start dev server
"build": "vite build"            // Production build
"build:dev": "vite build --mode development"  // Dev build
"lint": "eslint ."               // Lint code
"preview": "vite preview"        // Preview build
```

### Dependencies Summary
- React ecosystem: React 18, React Router 6, React DOM
- UI: shadcn/ui (40+ components), Tailwind CSS
- Data: TanStack React Query, Axios
- Visualization: Recharts
- Forms: React Hook Form, Zod validation
- Icons: Lucide React
- Date handling: date-fns
- Notifications: Sonner toast
- Build: Vite, TypeScript, ESLint

---

## 16. API ENDPOINTS SUMMARY

### Implemented Endpoints Used

| Method | Endpoint | Purpose | Used By |
|--------|----------|---------|---------|
| POST | `/api/v1/login` | User authentication | authService |
| GET | `/api/v1/me` | Get current user profile | authService |
| POST | `/api/v1/register` | Register new user | authService |
| GET | `/api/v1/users` | Get all users | userService |
| GET | `/api/v1/users/commercials` | Get all commercials | userService, useCommercials |
| GET | `/api/v1/users/inactive` | Get inactive users | userService |
| GET | `/api/v1/users/{id}` | Get user by ID | userService |
| PUT | `/api/v1/users/{id}` | Update user | userService |
| DELETE | `/api/v1/users/{id}` | Delete user | userService |
| GET | `/api/v1/calls` | Get calls with pagination | useCalls |
| GET | `/api/v1/calls/{id}` | Get call by ID | callService |
| GET | `/api/v1/recordings/by-call/{callId}` | Check if recording exists | useCalls, useCallsWithDetails |
| GET | `/api/v1/recordings/by-call/{callId}/play` | Stream recording audio | CallsTable playback |
| GET | `/api/v1/performance/commercials` | Get all commercials performance | performanceService |
| GET | `/api/v1/performance/commercials/{id}` | Get specific commercial performance | performanceService |
| GET | `/api/v1/performance/my-performance` | Get current user performance | performanceService |

---

## 17. KEY FILES SUMMARY TABLE

| File | Lines | Purpose | Status |
|------|-------|---------|--------|
| src/App.tsx | 45 | Main routing & providers | ✅ Complete |
| src/components/layout/DashboardLayout.tsx | 70 | Main layout wrapper | ✅ Complete |
| src/components/calls/CallsTable.tsx | 200+ | Calls table with filters | ✅ Complete |
| src/hooks/useCallsWithDetails.ts | 150+ | Enriched call data | ✅ Complete |
| src/services/api.ts | 300+ | API layer & interceptors | ✅ Complete |
| src/contexts/AuthContext.tsx | 180 | Auth state management | ✅ Complete |
| src/pages/Dashboard.tsx | 100+ | Main dashboard | ✅ Complete |
| src/pages/Commercials.tsx | 200+ | Commercial management | ⚠️ Partial |
| src/pages/Settings.tsx | 150+ | Settings page | ⚠️ Partial |
| src/types/api.ts | 100+ | API type definitions | ✅ Complete |

---

## CONCLUSION

The NetSysCall codebase is a well-structured React admin dashboard with:

✅ **Strengths:**
- Clear component hierarchy and organization
- Type-safe TypeScript implementation
- Professional UI with shadcn/ui
- Robust API integration with Axios
- Working authentication system
- Responsive mobile-friendly design
- Comprehensive hooks for data management

⚠️ **Areas for Improvement:**
- Finish Commercials CRUD operations
- Implement Settings functionality
- Add error boundaries
- Implement token refresh
- Add data persistence for filters
- Complete Performance coaching features
- Add more comprehensive error handling

🚀 **Production Readiness:** 70% - Core features working, some admin functions incomplete

---

*Analysis completed: March 24, 2026*
