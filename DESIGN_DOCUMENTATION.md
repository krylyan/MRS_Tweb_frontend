# FitLife Website Design Documentation

## 1. Project Overview

### Purpose of the website
FitLife is a fitness-oriented web application that combines:
- User authentication (sign in/sign up)
- Guided onboarding questionnaire
- A marketing-style home page for fitness programs
- Profile management and progress visualization
- A gym plan editor experience

The app is designed to guide a user from authentication to personalized plan interaction inside a protected area.

### Type of website
The product is a hybrid:
- Marketing landing page (`/home`) with promotional sections and CTAs
- Authenticated user portal with onboarding (`/questionnaire`), FAQ, profile, and workout editing (`/gym-plan`)

### Main technologies used
- React 18 (`react`, `react-dom`)
- TypeScript (strict mode enabled in `tsconfig.json`)
- React Router DOM v7 for SPA routing and guarded routes
- Tailwind CSS v4 via `@tailwindcss/vite`
- Vite + SWC (`@vitejs/plugin-react-swc`) for build/dev
- Lucide React icons for visual language
- Radix UI Accordion for FAQ interactions
- Browser storage for mock auth/session state:
  - `sessionStorage` for active session and questionnaire pending state
  - `localStorage` for user records and questionnaire responses

---

## 2. Design Philosophy

### Design style
The UI follows a modern, dark-first, gradient-heavy style with glassmorphism overlays and high-contrast call-to-actions:
- Large gradient backgrounds
- Semi-transparent cards with blur effects
- Bright accent gradients for primary actions
- Rounded corners and soft shadows
- Animated transitions for perceived smoothness

### UX principles used
- Progressive disclosure:
  - Route guarding ensures users complete required steps (auth, questionnaire)
- Strong visual hierarchy:
  - Large headings, contrast-rich CTAs, grouped content blocks
- Immediate interactive feedback:
  - Hover transitions, loading spinners, active state styling
- Form clarity:
  - Inline validation and error messaging
- Responsive adaptation:
  - Mobile-first classes with `md`/`lg`/`xl` breakpoints

### Target users
- Fitness users who want guided workout/nutrition planning
- New users needing quick onboarding
- Returning users managing profile and workout plan details

---

## 3. Layout Structure

### Global layout model
There is no single shared shell component. Each page defines its own layout structure while maintaining a consistent visual language.

### Header / Navigation bar
- `Home`: full top nav with brand, section links, FAQ/Profile links, logout button.
- `Profile`: simplified top nav with brand back-link.
- `FAQ`: floating top-left brand link.
- `GymPlanMenu`: local header inside editor surface with action buttons.
- Auth pages: no global nav, focus on form-centered composition.

### Sidebar
- Present in `GymPlanMenu` on large screens (`lg` and up).
- Contains icon-first nav actions and a home shortcut button.
- Collapses into chip-style top controls on smaller screens.

### Main content area
- Built from stacked sections (`Home`, `FAQ`, `Profile`) or structured grids (`GymPlanMenu`, auth pages).
- Uses constrained max-width containers (`max-w-*`) to control reading width and visual rhythm.

### Footer
- Present on `Home` only.
- Includes brand, legal links, FAQ link, and copyright.

### Responsive behavior
- Heavy use of Tailwind responsive modifiers:
  - `md` for medium screen layout shifts
  - `lg` for auth split panel and sidebar exposure
  - `xl` for advanced grid distribution in gym editor
- Mobile layouts prioritize vertical stacking, then progressively expand into multi-column compositions.

---

## 4. Page-by-Page Design

### `SignIn` (`/signin`)
- **Purpose**: Authenticate existing users.
- **UI structure**:
  - Two-column card on large screens: media panel + form panel
  - Single-column form experience on smaller screens
- **Components used**:
  - `AuthInput`, `AuthButton`
  - `Link` for route transitions
- **Layout notes**:
  - Dark gradient backdrop
  - Glass-like outer container
  - Smooth entrance animation controlled by `isLoaded`
  - Inline success and error messaging

### `SignUp` (`/signup`)
- **Purpose**: Register new users with validation.
- **UI structure**:
  - Centered auth card with stacked fields
- **Components used**:
  - `AuthCard`, `AuthInput`, `AuthButton`
- **Layout notes**:
  - Reuses auth visual language for consistency
  - Client-side validation for full name, email, password length, password match

### `Home` (`/home`)
- **Purpose**: Main branded landing and feature discovery page.
- **UI structure**:
  - Top nav
  - Hero
  - Program cards (Outdoor / Gym)
  - Features grid
  - CTA section
  - Footer
- **Components used**:
  - `Card`, `Button`, `ImageWithFallback`
  - Lucide icons for semantic highlights
- **Layout notes**:
  - Two prominent program cards with distinct color themes
  - "Create Gym Plan" routes into the gym editor workflow

### `FAQ` (`/faq`)
- **Purpose**: Resolve common user questions.
- **UI structure**:
  - Centered card with heading and accordion list
- **Components used**:
  - Radix `Accordion.Root`, `Accordion.Item`, `Accordion.Trigger`, `Accordion.Content`
- **Layout notes**:
  - Animated reveal on mount
  - Single-open accordion behavior (`type="single"`)

### `Questionnaire` (`/questionnaire`)
- **Purpose**: Multi-step onboarding questions before full app access (admin test flow).
- **UI structure**:
  - Compact, centered vertical wizard
  - Step counter, progress bar, question title/subtitle, option buttons, continue CTA
- **Components used**:
  - Native button groups and local state
- **Layout notes**:
  - Sequential progression with explicit selection requirement
  - Skip path is supported

### `Profile` (`/profile`)
- **Purpose**: Show and edit account data with visual progress stats.
- **UI structure**:
  - Brand header
  - Main split layout: avatar summary + account/metrics panel
  - Two stat cards (Nutrition, Workouts)
- **Components used**:
  - Local `StatsCard` subcomponent
  - Native inputs/buttons
- **Layout notes**:
  - Editable form rows with save/cancel state handling
  - Progress bars represented as percentage-filled strips

### `GymPlanMenu` (`/gym-plan`)
- **Purpose**: Interactive workout editor-style workspace.
- **UI structure**:
  - Decorative ambient background gradients
  - Main white editor surface with:
    - Left sidebar (desktop)
    - Header with actions
    - Three-column content grid (media/days, activities, workout preview/phone card)
- **Components used**:
  - `ImageWithFallback`
  - Lucide icons
  - Native buttons/textarea
- **Layout notes**:
  - Multiple interactive controls (create workout, add day, add activity, select activity, like/play, apply activity)
  - Mobile fallback for sidebar controls

### Route-level infrastructure
- `ProtectedRoute` wraps private pages and redirects:
  - To `/signin` when unauthenticated
  - To `/questionnaire` when questionnaire is required

---

## 5. Component Design System

### Buttons
- `components/ui/button.tsx`:
  - Minimal pass-through wrapper for semantic consistency.
- `components/auth/AuthButton.tsx`:
  - Primary auth CTA style
  - Gradient fill, loading spinner state, disabled treatment
- Custom page-level buttons:
  - Explicit utility-class styling for specialized contexts (logout, day chips, add actions, icon controls)

### Cards
- `components/ui/card.tsx`:
  - Minimal wrapper used for content blocks (not opinionated).
- `components/auth/AuthCard.tsx`:
  - Structured card container with animated entrance and title treatment.
- Page-specific card patterns:
  - Feature cards, program cards, stats cards, glass panels.

### Accent Box / Action Card Color System
Important action boxes, plan cards, and highlighted interactive cards must follow the **Accent Box** palette below. Each color variant uses a single hue family applied consistently across border, background gradient, icon container, and hover shadow. This creates strong visual contrast on the dark background while keeping a cohesive look.

**Structure of an accent box:**
```
Container:  rounded-2xl border border-{color}-500/40 bg-gradient-to-br from-{color}-600/30 to-{color}-900/40
Icon badge: rounded-xl bg-{color}-500 shadow-lg shadow-{color}-500/40
Hover:      hover:border-{color}-400/60 hover:shadow-xl hover:shadow-{color}-500/20 hover:-translate-y-1
Text:       title in text-white (font-bold), subtitle in text-gray-400
```

**Available color variants (in rotation order):**

| Variant   | Border                   | Background gradient                                       | Icon badge          | Hover shadow              |
|-----------|--------------------------|-----------------------------------------------------------|---------------------|---------------------------|
| Emerald   | `border-emerald-500/40`  | `from-emerald-600/30 to-emerald-900/40`                   | `bg-emerald-500`    | `shadow-emerald-500/20`   |
| Blue      | `border-blue-500/40`     | `from-blue-600/30 to-blue-900/40`                         | `bg-blue-500`       | `shadow-blue-500/20`      |
| Purple    | `border-purple-500/40`   | `from-purple-600/30 to-purple-900/40`                     | `bg-purple-500`     | `shadow-purple-500/20`    |
| Orange    | `border-orange-500/40`   | `from-orange-600/20 to-amber-900/40`                      | `bg-orange-500`     | `shadow-orange-500/20`    |

**Rules for applying accent box colors:**
1. When rendering a list of cards, cycle through the variants in order: emerald -> blue -> purple -> orange -> emerald -> ...
2. The icon badge must be **fully opaque** (`bg-{color}-500`) with a colored `shadow-lg` — never translucent.
3. Borders use `/40` opacity at rest, `/60` on hover.
4. Background gradients go from a lighter `/30` top-left to a darker `/40` bottom-right.
5. Use `transition-all duration-300` and `hover:-translate-y-1` for lift effect.
6. For card variants that include an inner header area (e.g., plan cards), the inner header keeps `bg-slate-950/28 border-white/12` to maintain contrast with the colored outer card.
7. These colors apply to: Dashboard quick-action boxes, My Plans workout/alimentation cards, and any other highlighted interactive card throughout the app.

### Forms
- `AuthInput`:
  - Label support, error state support, optional password visibility toggle.
- Auth forms:
  - `SignIn` and `SignUp` use controlled inputs and validation messaging.
- Profile edit form:
  - In-place edit mode with save/cancel flow.

### Modals
- No modal components are currently implemented.

### Navigation elements
- Route links via `Link` from React Router.
- Programmatic navigation via `useNavigate`.
- Contextual nav patterns:
  - Full top nav (`Home`)
  - Minimal top nav (`Profile`)
  - Icon sidebar and responsive quick actions (`GymPlanMenu`)

### Tables or lists
- No data table component is present.
- List-driven UI patterns are used instead:
  - FAQ accordion list
  - Questionnaire option list
  - Activity/day list in gym editor
  - Stats list with progress bars

---

## 6. Styling System

### Styling approach
- Tailwind utility-first styling across all pages/components.
- Global CSS is minimal (`src/tailwind.css` only imports Tailwind).
- No CSS modules, styled-components, or custom token runtime.

### Color palette
Primary palette follows FitLife docs and implementation:
- Dark foundations: `gray-900`, `gray-800`, `slate-900`
- Brand accents: `emerald-400/500/600`, `blue-300/400/500/600`
- Supplementary accents: purple/orange/pink for feature differentiation
- Glass surfaces: low-opacity white overlays with white borders
- Error/negative states: red/rose tones

### Typography
- Tailwind default sans stack (no custom font import in codebase).
- Strong display typography for hero/headings (`text-4xl` to `text-7xl`).
- Smaller utility text for secondary metadata (`text-xs`, `text-sm`).
- Frequent use of `font-semibold`/`font-bold` to prioritize key actions.

### Spacing system
- Utility-driven spacing using Tailwind scale plus arbitrary values:
  - `p-6`, `px-12`, `gap-8`, `mb-6`
  - Arbitrary sizing for fine control (`rounded-[14px]`, `max-w-[1260px]`)
- Section-level vertical rhythm is consistently generous on marketing pages.

### Responsive design strategy
- Mobile-first base classes.
- Progressive enhancement at breakpoints:
  - `md`: text and spacing expansion
  - `lg`: split panels, desktop nav/sidebar visibility
  - `xl`: advanced editor grid proportions
- Content remains accessible in single-column stacks on smaller screens.

---

## 7. User Flow

### Main routes
- `/` -> redirect to `/signin`
- `/signin` -> sign in
- `/signup` -> account creation
- `/home` -> authenticated home landing
- `/faq` -> authenticated FAQ
- `/questionnaire` -> authenticated onboarding gate
- `/gym-plan` -> authenticated workout editor
- `/profile` -> authenticated profile
- `*` -> redirect to `/signin`

### Navigation structure
- Authenticated navigation is page-contextual (not globally fixed).
- Primary flow from home:
  - FAQ link
  - Profile link
  - Create Gym Plan CTA -> `/gym-plan`
- Editor and FAQ include return links to home.

### Authentication flow
1. User signs in (`AuthUtils.login`) against local mock user store.
2. Session status is written to `sessionStorage`.
3. `ProtectedRoute` checks `isAuthenticated()`.
4. If admin user has questionnaire pending, redirect to `/questionnaire`.
5. Completing or skipping questionnaire clears pending state.
6. Logout clears session keys and returns to `/signin`.

---

## 8. Visual Hierarchy

### Primary UI elements
- Hero headlines and major section titles
- Program cards in `Home`
- Main CTAs:
  - Login / Sign up / Get Started
  - Create Gym Plan / Create workout / Add activity

### Secondary UI elements
- Supporting text blocks and feature descriptions
- Stat bars and metadata values
- Section navigation links in headers/footers

### Interactive components
- Buttons with hover/transition feedback
- Accordion interactions (FAQ)
- Form fields with focus and error styling
- Toggleable controls in gym editor (selected activities, like/play states)

### Call-to-action strategy
- Gradient buttons are used for highest-priority actions.
- Secondary actions use bordered/ghost variants.
- CTA prominence is reinforced through size, contrast, and placement at section bottoms.

---

## 9. Design Patterns

### Component composition patterns
- Small reusable primitives (`Button`, `Card`) combined with page-specific layout blocks.
- Auth-specific component set (`AuthCard`, `AuthInput`, `AuthButton`) reused across auth pages.
- Utility components (`ImageWithFallback`, `ProtectedRoute`) abstract repeated concerns.

### Layout reuse patterns
- Repeated dark gradient page backdrops create visual continuity.
- Repeated glass card motif across auth, FAQ, profile, and sections of home.
- Common brand identity block (FitLife icon + text) reused in multiple page headers.

### State management patterns
- Local state with React hooks (`useState`, `useEffect`, `useMemo`).
- No external state library (Redux/Zustand) currently used.
- Persistent pseudo-backend state via browser storage:
  - User map in `localStorage`
  - Session in `sessionStorage`
  - Questionnaire records in `localStorage`

### Interaction and animation patterns
- Mount animations via `isLoaded` + transition classes.
- Hover transitions for elevation/color emphasis.
- Explicit disabled and loading states for form CTAs.

---

## 10. Summary

FitLife's UI/UX architecture is a coherent dark-themed, gradient-forward SPA with clear separation between public authentication surfaces and protected product workflows. The design system is implemented pragmatically through Tailwind utility classes, lightweight reusable components, and consistent interaction feedback patterns.

Strengths:
- Consistent visual language across pages
- Clear CTA hierarchy and strong interactive affordances
- Good route protection and onboarding gating for user flow control
- Responsive behavior implemented throughout key screens

Current constraints:
- No centralized global layout shell
- No formal design token layer in code (tokens are implicit in utility classes/docs)
- Mock auth and storage-based persistence are suitable for prototype/staging, not production

Overall, the project presents a solid, modern UI foundation with reusable patterns that are easy to extend for production-grade features.

