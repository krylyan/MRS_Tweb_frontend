# FitLife Landing Page - Technical Design Specification

## 1. OVERALL LAYOUT STRUCTURE

### Page Container
- Element: `<div>`
- Classes: `min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white`
- Background: Diagonal gradient from top-left to bottom-right
  - Start: `#111827` (gray-900)
  - Middle: `#1f2937` (gray-800)
  - End: `#111827` (gray-900)
- Text color: `#ffffff` (white)
- Minimum height: 100vh

### Section Order (Top to Bottom)
1. Navigation Bar
2. Hero Section
3. Main Program Cards Section
4. Features Section
5. CTA Section
6. Footer

---

## 2. NAVIGATION BAR

### Container
- Element: `<nav>`
- Layout: Flexbox
- Justify: `space-between`
- Align items: `center`
- Padding:
  - Mobile: `24px` (6 * 4px = p-6)
  - Desktop (md+): `48px horizontal, 32px vertical` (px-12 py-8)
- Border bottom: `1px solid rgba(255, 255, 255, 0.1)`

### Logo Section (Left)
- Container: Flexbox with `space-x-3` (12px gap)
- Align items: `center`

#### Logo Icon Container
- Background: Linear gradient from emerald-400 to blue-500
  - Start: `#34d399` (emerald-400)
  - End: `#3b82f6` (blue-500)
  - Direction: Bottom-right diagonal (`from-emerald-400 to-blue-500`)
- Padding: `8px` (p-2)
- Border radius: `8px` (rounded-lg)
- Icon: Heart from lucide-react
  - Size: `24x24px` (w-6 h-6)
  - Color: White

#### Logo Text
- Element: `<span>`
- Font size: `24px` (text-2xl)
- Font weight: `700` (font-bold)
- Text: "FitLife"
- Color: White

### Navigation Links (Right)
- Container: Flexbox with `space-x-8` (32px gap)
- Align items: `center`
- Display: Hidden on mobile, visible on desktop (md+)
- Classes: `hidden md:flex`

#### Link Items
- Element: `<a>`
- Default color: `#d1d5db` (gray-300)
- Hover color: `#ffffff` (white)
- Transition: `color` with default duration
- Links: "Programs", "Features", "About"

#### Sign In Button
- Background: Linear gradient left to right
  - Start: `#10b981` (emerald-500)
  - End: `#3b82f6` (blue-500)
- Hover gradient:
  - Start: `#059669` (emerald-600)
  - End: `#2563eb` (blue-600)
- Text color: White
- Border: None (border-0)
- Inherits button base styles (see Button System section)

---

## 3. HERO SECTION

### Container
- Element: `<section>`
- Padding:
  - Mobile: `24px horizontal, 64px vertical` (px-6 py-16)
  - Desktop (md+): `48px horizontal, 96px vertical` (px-12 py-24)
- Text alignment: Center

### Inner Wrapper
- Max width: `896px` (max-w-4xl)
- Margin: Auto centered

### Badge
- Container: Inline flex with `gap-2` (8px)
- Background: `rgba(255, 255, 255, 0.1)` with backdrop blur
- Backdrop filter: Blur (small)
- Border: `1px solid rgba(255, 255, 255, 0.2)`
- Border radius: Full (9999px)
- Padding: `16px horizontal, 8px vertical` (px-4 py-2)
- Margin bottom: `32px` (mb-8)
- Content:
  - Zap icon: `16x16px` (w-4 h-4), color `#fbbf24` (yellow-400)
  - Text: "Transform Your Life Today"
    - Font size: `14px` (text-sm)
    - Color: `#d1d5db` (gray-300)

### Main Headline (H1)
- Font size:
  - Mobile: `48px` (text-5xl)
  - Desktop (md+): `72px` (text-7xl)
- Font weight: `700` (font-bold)
- Margin bottom: `24px` (mb-6)
- Text rendering: Gradient with background clip
  - Background: Linear gradient left to right
    - Start: `#34d399` (emerald-400)
    - Middle: `#60a5fa` (blue-400)
    - End: `#c084fc` (purple-400)
  - Background clip: Text
  - Text fill color: Transparent
- Line break: After "Your Personal Health"
- Text content:
  ```
  Your Personal Health
  & Fitness Platform
  ```

### Subtitle
- Element: `<p>`
- Font size:
  - Mobile: `20px` (text-xl)
  - Desktop (md+): `24px` (text-2xl)
- Color: `#d1d5db` (gray-300)
- Max width: `768px` (max-w-3xl)
- Margin: Auto centered
- Line height: `relaxed` (1.625)
- Text content:
  ```
  Create customized nutrition and workout programs tailored to your goals.
  Track progress, stay motivated, and achieve results.
  ```

---

## 4. MAIN PROGRAM CARDS SECTION

### Section Container
- Element: `<section>`
- ID: "programs"
- Padding:
  - Horizontal: `24px` mobile, `48px` desktop (px-6 md:px-12)
  - Bottom: `96px` (pb-24)

### Inner Wrapper
- Max width: `1280px` (max-w-7xl)
- Margin: Auto centered

### Grid Container
- Display: Grid
- Columns:
  - Mobile: 1 column (default)
  - Desktop (md+): 2 columns (`md:grid-cols-2`)
- Gap:
  - Default: `32px` (gap-8)
  - Large screens (lg+): `48px` (lg:gap-12)

---

## 5. THE TWO MAIN PROGRAM CARDS

### Card Base Structure (Both cards share)
- Component: Card (custom component with base styles)
- Base Card styles:
  - Display: Flex column
  - Gap: `24px` (gap-6)
  - Border radius: `12px` (rounded-xl)
  - Border: 1px solid (color varies per card)
  - Background: Gradient (varies per card)

### Common Card Behaviors
- Position: Relative
- Overflow: Hidden
- Group: Applied for child hover states
- Transition: All properties, duration 300ms
- Hover effects:
  - Border opacity increase
  - Shadow: 2xl with colored glow
  - Transform: Translate Y -8px (`hover:-translate-y-2`)

---

### NUTRITION PROGRAM CARD (LEFT/FIRST)

#### Card Container
- Background gradient: Diagonal bottom-right
  - Start: `rgba(6, 78, 59, 0.4)` (emerald-900/40)
  - End: `rgba(20, 83, 45, 0.4)` (green-900/40)
- Border color: `rgba(16, 185, 129, 0.3)` (emerald-500/30)
- Hover border: `rgba(52, 211, 153, 0.6)` (emerald-400/60)
- Hover shadow: `0 25px 50px -12px rgba(16, 185, 129, 0.2)`

#### Image Section
- Container:
  - Height: `256px` (h-64)
  - Position: Relative
  - Overflow: Hidden
  - Border radius: Top only (`rounded-t-lg`)
- Image:
  - Source: Unsplash healthy nutrition photo
  - Object fit: Cover
  - Width/Height: 100%
  - Hover effect: Scale to 110% with 500ms transition
- Overlay gradient:
  - Position: Absolute, full coverage
  - Direction: Bottom to top
  - Start: `#111827` (gray-900) opaque
  - Middle: `rgba(17, 24, 39, 0.5)` (gray-900/50)
  - End: Transparent

#### Content Section
- Padding:
  - Default: `32px` (p-8)
  - Desktop (md+): `40px` (md:p-10)

#### Icon Container
- Display: Inline flex
- Align/Justify: Center
- Width/Height: `64px` (w-16 h-16)
- Background: `rgba(16, 185, 129, 0.2)` (emerald-500/20)
- Hover background: `rgba(16, 185, 129, 0.3)` (emerald-500/30)
- Border radius: `12px` (rounded-xl)
- Margin bottom: `24px` (mb-6)
- Transition: Colors
- Icon: Apple from lucide-react
  - Size: `32x32px` (w-8 h-8)
  - Color: `#34d399` (emerald-400)

#### Card Title (H2)
- Font size:
  - Default: `30px` (text-3xl)
  - Desktop (md+): `36px` (md:text-4xl)
- Font weight: `700` (font-bold)
- Margin bottom: `16px` (mb-4)
- Color: `#ecfdf5` (emerald-50)
- Text: "Personalized Nutrition"

#### Description Text
- Color: `#d1d5db` (gray-300)
- Font size: `18px` (text-lg)
- Line height: Relaxed (1.625)
- Margin bottom: `32px` (mb-8)
- Text content:
  ```
  Build custom meal plans tailored to your dietary needs and goals. 
  Track calories, macros, and nutrients with ease. Get expert guidance 
  on healthy eating habits that fit your lifestyle.
  ```

#### Feature List
- Container: Flex column with `space-y-3` (12px gap)
- Margin bottom: `32px` (mb-8)
- Each item:
  - Display: Flex
  - Align items: Center
  - Gap: `12px` (gap-3)
  - Color: `#6ee7b7` (emerald-300)
  - Icon size: `20x20px` (w-5 h-5)
  - Features:
    1. TrendingUp icon - "Smart calorie tracking"
    2. Target icon - "Custom meal plans"
    3. Heart icon - "Nutrition insights"

#### CTA Button
- Width: 100% (w-full)
- Background: Linear gradient left to right
  - Start: `#10b981` (emerald-500)
  - End: `#16a34a` (green-600)
- Hover gradient:
  - Start: `#059669` (emerald-600)
  - End: `#15803d` (green-700)
- Text color: White
- Font weight: `600` (font-semibold)
- Padding vertical: `24px` (py-6)
- Font size: `18px` (text-lg)
- Border: None (border-0)
- Shadow: Large with emerald glow
  - `0 10px 15px -3px rgba(16, 185, 129, 0.3)`
- Text: "Create Nutrition Plan"

---

### WORKOUT PROGRAM CARD (RIGHT/SECOND)

#### Card Container
- Background gradient: Diagonal bottom-right
  - Start: `rgba(30, 58, 138, 0.4)` (blue-900/40)
  - End: `rgba(127, 29, 29, 0.4)` (red-900/40)
- Border color: `rgba(59, 130, 246, 0.3)` (blue-500/30)
- Hover border: `rgba(96, 165, 250, 0.6)` (blue-400/60)
- Hover shadow: `0 25px 50px -12px rgba(59, 130, 246, 0.2)`

#### Image Section
- Container:
  - Height: `256px` (h-64)
  - Position: Relative
  - Overflow: Hidden
  - Border radius: Top only (`rounded-t-lg`)
- Image:
  - Source: Unsplash gym workout photo
  - Object fit: Cover
  - Width/Height: 100%
  - Hover effect: Scale to 110% with 500ms transition
- Overlay gradient:
  - Position: Absolute, full coverage
  - Direction: Bottom to top
  - Start: `#111827` (gray-900) opaque
  - Middle: `rgba(17, 24, 39, 0.5)` (gray-900/50)
  - End: Transparent

#### Content Section
- Padding:
  - Default: `32px` (p-8)
  - Desktop (md+): `40px` (md:p-10)

#### Icon Container
- Display: Inline flex
- Align/Justify: Center
- Width/Height: `64px` (w-16 h-16)
- Background: `rgba(59, 130, 246, 0.2)` (blue-500/20)
- Hover background: `rgba(59, 130, 246, 0.3)` (blue-500/30)
- Border radius: `12px` (rounded-xl)
- Margin bottom: `24px` (mb-6)
- Transition: Colors
- Icon: Dumbbell from lucide-react
  - Size: `32x32px` (w-8 h-8)
  - Color: `#60a5fa` (blue-400)

#### Card Title (H2)
- Font size:
  - Default: `30px` (text-3xl)
  - Desktop (md+): `36px` (md:text-4xl)
- Font weight: `700` (font-bold)
- Margin bottom: `16px` (mb-4)
- Color: `#eff6ff` (blue-50)
- Text: "Personalized Training"

#### Description Text
- Color: `#d1d5db` (gray-300)
- Font size: `18px` (text-lg)
- Line height: Relaxed (1.625)
- Margin bottom: `32px` (mb-8)
- Text content:
  ```
  Design workout routines that match your fitness level and objectives. 
  Track your progress, monitor performance, and stay consistent with 
  structured programs built for real results.
  ```

#### Feature List
- Container: Flex column with `space-y-3` (12px gap)
- Margin bottom: `32px` (mb-8)
- Each item:
  - Display: Flex
  - Align items: Center
  - Gap: `12px` (gap-3)
  - Color: `#93c5fd` (blue-300)
  - Icon size: `20x20px` (w-5 h-5)
  - Features:
    1. TrendingUp icon - "Progress tracking"
    2. Target icon - "Custom workout plans"
    3. Zap icon - "Performance analytics"

#### CTA Button
- Width: 100% (w-full)
- Background: Linear gradient left to right
  - Start: `#3b82f6` (blue-500)
  - End: `#dc2626` (red-600)
- Hover gradient:
  - Start: `#2563eb` (blue-600)
  - End: `#b91c1c` (red-700)
- Text color: White
- Font weight: `600` (font-semibold)
- Padding vertical: `24px` (py-6)
- Font size: `18px` (text-lg)
- Border: None (border-0)
- Shadow: Large with blue glow
  - `0 10px 15px -3px rgba(59, 130, 246, 0.3)`
- Text: "Create Workout Plan"

---

## 6. FEATURES SECTION

### Section Container
- Element: `<section>`
- ID: "features"
- Padding:
  - Horizontal: `24px` mobile, `48px` desktop (px-6 md:px-12)
  - Vertical: `96px` (py-24)
- Background: `rgba(255, 255, 255, 0.05)` with backdrop blur

### Inner Wrapper
- Max width: `1152px` (max-w-6xl)
- Margin: Auto centered

### Section Header
- Text alignment: Center
- Margin bottom: `64px` (mb-16)

#### Section Title (H2)
- Font size:
  - Default: `36px` (text-4xl)
  - Desktop (md+): `48px` (md:text-5xl)
- Font weight: `700` (font-bold)
- Margin bottom: `16px` (mb-4)
- Text: "Everything You Need to Succeed"

#### Section Subtitle
- Color: `#d1d5db` (gray-300)
- Font size: `20px` (text-xl)
- Max width: `672px` (max-w-2xl)
- Margin: Auto centered
- Text: "Comprehensive tools and features to support your health and fitness journey"

### Features Grid
- Display: Grid
- Columns:
  - Mobile: 1 column
  - Desktop (md+): 3 columns (`md:grid-cols-3`)
- Gap: `32px` (gap-8)

### Feature Card (3 total)
- Background: `rgba(255, 255, 255, 0.05)` with backdrop blur
- Border: `1px solid rgba(255, 255, 255, 0.1)`
- Border radius: `16px` (rounded-2xl)
- Padding: `32px` (p-8)
- Hover background: `rgba(255, 255, 255, 0.1)`
- Transition: Colors

#### Icon Container
- Width/Height: `56px` (w-14 h-14)
- Border radius: `12px` (rounded-xl)
- Display: Flex
- Align/Justify: Center
- Margin bottom: `24px` (mb-6)
- Background colors (per card):
  1. `rgba(168, 85, 247, 0.2)` (purple-500/20)
  2. `rgba(249, 115, 22, 0.2)` (orange-500/20)
  3. `rgba(236, 72, 153, 0.2)` (pink-500/20)

#### Icon
- Size: `28x28px` (w-7 h-7)
- Colors per card:
  1. `#c084fc` (purple-400) - TrendingUp
  2. `#fb923c` (orange-400) - Target
  3. `#f472b6` (pink-400) - Heart

#### Feature Title (H3)
- Font size: `24px` (text-2xl)
- Font weight: `700` (font-bold)
- Margin bottom: `12px` (mb-3)
- Titles:
  1. "Smart Analytics"
  2. "Goal Setting"
  3. "Health Monitoring"

#### Feature Description
- Color: `#9ca3af` (gray-400)
- Line height: Relaxed (1.625)
- Descriptions:
  1. "Track your progress with detailed analytics and insights that help you stay on course."
  2. "Set achievable goals and track milestones with our intelligent goal management system."
  3. "Monitor your overall health metrics and get personalized recommendations."

---

## 7. CTA SECTION

### Section Container
- Element: `<section>`
- Padding:
  - Horizontal: `24px` mobile, `48px` desktop (px-6 md:px-12)
  - Vertical: `96px` (py-24)

### Inner Wrapper
- Max width: `896px` (max-w-4xl)
- Margin: Auto centered
- Text alignment: Center

### Section Title (H2)
- Font size:
  - Default: `36px` (text-4xl)
  - Desktop (md+): `48px` (md:text-5xl)
- Font weight: `700` (font-bold)
- Margin bottom: `24px` (mb-6)
- Text: "Ready to Start Your Journey?"

### Section Description
- Color: `#d1d5db` (gray-300)
- Font size: `20px` (text-xl)
- Margin bottom: `40px` (mb-10)
- Max width: `672px` (max-w-2xl)
- Margin: Auto centered
- Text: "Join thousands who have transformed their lives with personalized nutrition and fitness programs."

### CTA Button
- Background: Linear gradient left to right (3 stops)
  - Start: `#10b981` (emerald-500)
  - Middle: `#3b82f6` (blue-500)
  - End: `#9333ea` (purple-600)
- Hover gradient:
  - Start: `#059669` (emerald-600)
  - Middle: `#2563eb` (blue-600)
  - End: `#7e22ce` (purple-700)
- Text color: White
- Font weight: `600` (font-semibold)
- Padding: `48px horizontal, 24px vertical` (px-12 py-6)
- Font size: `18px` (text-lg)
- Border: None (border-0)
- Shadow: Extra large with blue glow
  - `0 20px 25px -5px rgba(59, 130, 246, 0.3)`
- Text: "Get Started Today"

---

## 8. FOOTER

### Container
- Element: `<footer>`
- Border top: `1px solid rgba(255, 255, 255, 0.1)`
- Padding:
  - Default: `24px` (p-6)
  - Desktop (md+): `32px` (md:p-8)

### Inner Wrapper
- Max width: `1152px` (max-w-6xl)
- Margin: Auto centered
- Display: Flex
- Direction:
  - Mobile: Column (`flex-col`)
  - Desktop: Row (`md:flex-row`)
- Align items: Center
- Justify: Space between

### Logo Section (Left)
- Display: Flex
- Align items: Center
- Gap: `12px` (space-x-3)
- Margin bottom:
  - Mobile: `16px` (mb-4)
  - Desktop: `0` (md:mb-0)

#### Logo Icon Container
- Background: Linear gradient diagonal bottom-right
  - Start: `#34d399` (emerald-400)
  - End: `#3b82f6` (blue-500)
- Padding: `8px` (p-2)
- Border radius: `8px` (rounded-lg)
- Icon: Heart
  - Size: `20x20px` (w-5 h-5)
  - Color: White

#### Logo Text
- Font size: `20px` (text-xl)
- Font weight: `700` (font-bold)
- Text: "FitLife"

### Footer Links (Right)
- Display: Flex
- Align items: Center
- Gap: `24px` (space-x-6)
- Font size: `14px` (text-sm)

#### Link Items
- Color: `#9ca3af` (gray-400)
- Hover color: `#ffffff` (white)
- Transition: Colors
- Links:
  1. "Privacy Policy"
  2. "Terms of Service"

#### Copyright Text
- Color: `#9ca3af` (gray-400)
- Text: "© 2026 FitLife. All rights reserved."

---

## 9. TYPOGRAPHY SYSTEM

### Font Family
- Default: System font stack (inherited from Tailwind)
- Fallback: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif

### Heading Sizes
- H1 (Hero):
  - Mobile: `48px` (3rem / text-5xl)
  - Desktop: `72px` (4.5rem / text-7xl)
  - Weight: `700` (font-bold)
  - Line height: Tight (1.25)
  
- H2 (Section titles):
  - Mobile: `36px` (2.25rem / text-4xl)
  - Desktop: `48px` (3rem / text-5xl)
  - Weight: `700` (font-bold)
  - Line height: Tight (1.25)
  
- H2 (Card titles):
  - Mobile: `30px` (1.875rem / text-3xl)
  - Desktop: `36px` (2.25rem / text-4xl)
  - Weight: `700` (font-bold)
  
- H3 (Feature titles):
  - Size: `24px` (1.5rem / text-2xl)
  - Weight: `700` (font-bold)

### Body Text Sizes
- Large paragraph (Hero subtitle):
  - Mobile: `20px` (1.25rem / text-xl)
  - Desktop: `24px` (1.5rem / text-2xl)
  - Line height: Relaxed (1.625)
  
- Standard paragraph (Card descriptions):
  - Size: `18px` (1.125rem / text-lg)
  - Line height: Relaxed (1.625)
  
- Medium paragraph (Section subtitles):
  - Size: `20px` (1.25rem / text-xl)
  - Line height: Normal (1.5)
  
- Small text (Badge, feature items):
  - Size: `14px` (0.875rem / text-sm)
  - Line height: Normal (1.5)

### Button Text
- Size: `18px` (1.125rem / text-lg) for primary CTAs
- Size: `14px` (0.875rem / text-sm) for nav button
- Weight: `600` (font-semibold) for CTAs
- Weight: `500` (font-medium) for standard buttons

---

## 10. COLOR SYSTEM

### Background Colors
- Page background: Gradient
  - Type: Diagonal (from-gray-900 via-gray-800 to-gray-900)
  - Colors: `#111827` → `#1f2937` → `#111827`
  
- Card backgrounds:
  - Nutrition card: `rgba(6, 78, 59, 0.4)` to `rgba(20, 83, 45, 0.4)`
  - Workout card: `rgba(30, 58, 138, 0.4)` to `rgba(127, 29, 29, 0.4)`
  - Feature cards: `rgba(255, 255, 255, 0.05)`
  - Hover: `rgba(255, 255, 255, 0.1)`

### Text Colors
- Primary text: `#ffffff` (white)
- Secondary text: `#d1d5db` (gray-300)
- Muted text: `#9ca3af` (gray-400)
- Nutrition accent: `#ecfdf5` (emerald-50), `#6ee7b7` (emerald-300)
- Workout accent: `#eff6ff` (blue-50), `#93c5fd` (blue-300)

### Accent Colors

#### Emerald/Green (Nutrition theme)
- emerald-400: `#34d399`
- emerald-500: `#10b981`
- emerald-600: `#059669`
- green-600: `#16a34a`
- green-700: `#15803d`

#### Blue (Workout theme)
- blue-400: `#60a5fa`
- blue-500: `#3b82f6`
- blue-600: `#2563eb`

#### Red (Workout theme)
- red-600: `#dc2626`
- red-700: `#b91c1c`

#### Purple
- purple-400: `#c084fc`
- purple-500: `#a855f7`
- purple-600: `#9333ea`
- purple-700: `#7e22ce`

#### Other Accents
- Yellow: `#fbbf24` (yellow-400)
- Orange: `#fb923c` (orange-400)
- Pink: `#f472b6` (pink-400)

### Border Colors
- Default: `rgba(255, 255, 255, 0.1)`
- Badge: `rgba(255, 255, 255, 0.2)`
- Nutrition card: `rgba(16, 185, 129, 0.3)`
- Nutrition card hover: `rgba(52, 211, 153, 0.6)`
- Workout card: `rgba(59, 130, 246, 0.3)`
- Workout card hover: `rgba(96, 165, 250, 0.6)`

### Gradients

#### Logo Gradient
- Direction: Diagonal bottom-right
- Colors: `#34d399` (emerald-400) → `#3b82f6` (blue-500)

#### Hero Title Gradient
- Direction: Left to right
- Colors: `#34d399` (emerald-400) → `#60a5fa` (blue-400) → `#c084fc` (purple-400)

#### Nutrition Button Gradient
- Direction: Left to right
- Colors: `#10b981` (emerald-500) → `#16a34a` (green-600)
- Hover: `#059669` (emerald-600) → `#15803d` (green-700)

#### Workout Button Gradient
- Direction: Left to right
- Colors: `#3b82f6` (blue-500) → `#dc2626` (red-600)
- Hover: `#2563eb` (blue-600) → `#b91c1c` (red-700)

#### CTA Button Gradient
- Direction: Left to right (3 stops)
- Colors: `#10b981` (emerald-500) → `#3b82f6` (blue-500) → `#9333ea` (purple-600)
- Hover: `#059669` (emerald-600) → `#2563eb` (blue-600) → `#7e22ce` (purple-700)

#### Nav Button Gradient
- Direction: Left to right
- Colors: `#10b981` (emerald-500) → `#3b82f6` (blue-500)
- Hover: `#059669` (emerald-600) → `#2563eb` (blue-600)

---

## 11. BUTTON SYSTEM

### Base Button Styles (from button.tsx)
- Display: Inline flex
- Align/Justify: Center
- Gap: `8px` (gap-2)
- White space: No wrap
- Border radius: `6px` (rounded-md)
- Font size: `14px` (text-sm) - default
- Font weight: `500` (font-medium)
- Transition: All properties
- Outline: None
- Focus visible: Border ring with 3px ring
- Disabled: Opacity 50%, no pointer events

### Size Variants
- Default:
  - Height: `36px` (h-9)
  - Padding: `16px horizontal, 8px vertical` (px-4 py-2)
  
- Small:
  - Height: `32px` (h-8)
  - Padding: `12px horizontal` (px-3)
  
- Large:
  - Height: `40px` (h-10)
  - Padding: `24px horizontal` (px-6)

### Custom CTA Button Overrides
- Width: 100% for card buttons
- Padding vertical: `24px` (py-6)
- Font size: `18px` (text-lg)
- Font weight: `600` (font-semibold)
- Border: None (border-0)

### Shadow Effects
- Card CTA buttons: `0 10px 15px -3px [color]/30`
  - Nutrition: `rgba(16, 185, 129, 0.3)`
  - Workout: `rgba(59, 130, 246, 0.3)`
- Main CTA button: `0 20px 25px -5px rgba(59, 130, 246, 0.3)`

---

## 12. SPACING SYSTEM

### Section Spacing (Vertical)
- Hero section:
  - Padding top/bottom mobile: `64px / 64px` (py-16)
  - Padding top/bottom desktop: `96px / 96px` (py-24)
  
- Program cards section:
  - Padding top: None
  - Padding bottom: `96px` (pb-24)
  
- Features section:
  - Padding top/bottom: `96px / 96px` (py-24)
  
- CTA section:
  - Padding top/bottom: `96px / 96px` (py-24)

### Section Spacing (Horizontal)
- Mobile: `24px` (px-6)
- Desktop (md+): `48px` (px-12)

### Content Max Widths
- Hero content: `896px` (max-w-4xl)
- Program cards: `1280px` (max-w-7xl)
- Features: `1152px` (max-w-6xl)
- CTA: `896px` (max-w-4xl)
- Footer: `1152px` (max-w-6xl)

### Card Internal Spacing
- Image height: `256px` (h-64)
- Content padding:
  - Default: `32px` (p-8)
  - Desktop: `40px` (p-10)
- Icon margin bottom: `24px` (mb-6)
- Title margin bottom: `16px` (mb-4)
- Description margin bottom: `32px` (mb-8)
- Feature list margin bottom: `32px` (mb-8)
- Feature list gap: `12px` (space-y-3)

### Grid Gaps
- Program cards:
  - Default: `32px` (gap-8)
  - Large: `48px` (lg:gap-12)
- Features grid: `32px` (gap-8)

---

## 13. EFFECTS & TRANSITIONS

### Hover Effects

#### Navigation Links
- Property: Color
- Duration: Default transition
- From: `#d1d5db` (gray-300)
- To: `#ffffff` (white)

#### Card Container
- Properties: All
- Duration: 300ms
- Effects:
  - Border opacity increase
  - Shadow: 2xl with colored glow (20% opacity)
  - Transform: TranslateY(-8px)

#### Card Images
- Property: Transform scale
- Duration: 500ms
- Scale: 110%

#### Icon Containers (in cards)
- Property: Background color
- Duration: Default transition
- Opacity increase: 20% → 30%

#### Feature Cards
- Property: Background color
- Duration: Default transition
- From: `rgba(255, 255, 255, 0.05)`
- To: `rgba(255, 255, 255, 0.1)`

#### Buttons
- Properties: Gradient colors
- Duration: Default transition
- All gradients shift to darker variants

### Shadow System

#### Cards on Hover
- Type: `shadow-2xl` with colored glow
- Nutrition: `0 25px 50px -12px rgba(16, 185, 129, 0.2)`
- Workout: `0 25px 50px -12px rgba(59, 130, 246, 0.2)`

#### Buttons
- Card CTAs: `shadow-lg` with 30% opacity glow
- Main CTA: `shadow-xl` with 30% opacity glow

### Backdrop Effects
- Hero badge: Backdrop blur (small)
- Features section: Backdrop blur (small)
- Feature cards: Backdrop blur (small)

---

## 14. RESPONSIVE BEHAVIOR

### Breakpoints (Tailwind defaults)
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px

### Navigation Bar
- Mobile (< md):
  - Logo: Visible
  - Navigation links: Hidden
  - Sign In button: Hidden
- Desktop (≥ md):
  - All elements visible
  - Horizontal padding: 48px
  - Vertical padding: 32px

### Hero Section
- Mobile (< md):
  - Padding: 24px horizontal, 64px vertical
  - H1: 48px (text-5xl)
  - Subtitle: 20px (text-xl)
- Desktop (≥ md):
  - Padding: 48px horizontal, 96px vertical
  - H1: 72px (text-7xl)
  - Subtitle: 24px (text-2xl)

### Program Cards Grid
- Mobile (< md):
  - Layout: Single column (stacked)
  - Cards: Full width
  - Gap: 32px
- Tablet/Desktop (≥ md):
  - Layout: 2 columns side by side
  - Cards: Equal width (50% each minus gap)
  - Gap: 32px
- Large Desktop (≥ lg):
  - Gap increases to: 48px

### Card Content
- Mobile:
  - Padding: 32px
  - Title: 30px (text-3xl)
- Desktop (≥ md):
  - Padding: 40px
  - Title: 36px (text-4xl)

### Features Grid
- Mobile (< md):
  - Layout: Single column (stacked)
  - Cards: Full width
  - Gap: 32px
- Desktop (≥ md):
  - Layout: 3 columns
  - Cards: Equal width (~33% each minus gap)
  - Gap: 32px

### Section Headers
- Mobile:
  - Title: 36px (text-4xl)
  - Subtitle: 20px (text-xl)
- Desktop (≥ md):
  - Title: 48px (text-5xl)
  - Subtitle: Same (20px)

### Footer
- Mobile (< md):
  - Direction: Column (stacked)
  - Logo margin bottom: 16px
  - Text alignment: Center
  - Padding: 24px
- Desktop (≥ md):
  - Direction: Row (horizontal)
  - Logo margin bottom: 0
  - Space between: Justified
  - Padding: 32px

### Image Behavior
- All images: `object-fit: cover`
- Width: 100% of container
- Height: Fixed at 256px
- Responsive scaling: Container width adjusts, image crops/scales to fit

---

## 15. ICONOGRAPHY

### Icon Library
- Source: lucide-react
- Style: Outline stroke

### Icon Sizes
- Navigation logo: `24x24px` (w-6 h-6)
- Hero badge: `16x16px` (w-4 h-4)
- Card main icons: `32x32px` (w-8 h-8)
- Card feature list icons: `20x20px` (w-5 h-5)
- Feature section icons: `28x28px` (w-7 h-7)
- Footer logo: `20x20px` (w-5 h-5)

### Icons Used
1. Heart - Logo and footer (navigation, branding)
2. Zap - Hero badge, workout features (energy, speed)
3. Apple - Nutrition card (healthy eating)
4. Dumbbell - Workout card (fitness, training)
5. TrendingUp - Feature lists (progress, analytics)
6. Target - Feature lists (goals, precision)

### Icon Colors
- Navigation/Footer logo: White
- Hero badge: `#fbbf24` (yellow-400)
- Nutrition icon: `#34d399` (emerald-400)
- Nutrition features: `#6ee7b7` (emerald-300)
- Workout icon: `#60a5fa` (blue-400)
- Workout features: `#93c5fd` (blue-300)
- Analytics feature: `#c084fc` (purple-400)
- Goal feature: `#fb923c` (orange-400)
- Health feature: `#f472b6` (pink-400)

---

## 16. COMPONENT DEPENDENCIES

### External Components Used
1. Button (./components/ui/button)
   - Variant-based styling system
   - Size options
   - Accessibility features
   
2. Card (./components/ui/card)
   - Base structure with flex column
   - 24px internal gap
   - Rounded corners
   - Border support
   
3. ImageWithFallback (./components/figma/ImageWithFallback)
   - Fallback handling for broken images
   - Same API as standard img tag

### External Libraries
1. lucide-react - Icon components
2. React - Component framework
3. Tailwind CSS - Utility styling

---

## 17. ACCESSIBILITY CONSIDERATIONS

### Semantic HTML
- Proper heading hierarchy: H1 → H2 → H3
- Nav element for navigation
- Section elements for major page sections
- Footer element for page footer

### Interactive Elements
- Links have hover states with color change
- Buttons have focus-visible ring states
- Transition timing for smooth feedback
- Sufficient color contrast ratios

### Content Structure
- Alt text on images
- Meaningful link text
- Clear visual hierarchy
- Descriptive section IDs for anchor navigation

---

## 18. TECHNICAL NOTES

### CSS Framework
- Tailwind CSS v4
- Utility-first approach
- Custom design tokens in globals.css
- Responsive modifiers (md:, lg:)

### State Management
- No complex state (static landing page)
- Hover states managed by CSS
- Group hover pattern for nested element states

### Performance Considerations
- Images loaded via external URLs (Unsplash CDN)
- CSS transitions for smooth interactions
- Minimal JavaScript (React only)

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS Grid for layouts
- Backdrop filter support
- CSS gradients support
- CSS custom properties (variables)

---

## 19. MEASUREMENT REFERENCE

### Tailwind to Pixel Conversion
- Base: 4px (0.25rem)
- p-1: 4px
- p-2: 8px
- p-3: 12px
- p-4: 16px
- p-6: 24px
- p-8: 32px
- p-10: 40px
- p-12: 48px

### Text Size Reference
- text-sm: 14px (0.875rem)
- text-base: 16px (1rem)
- text-lg: 18px (1.125rem)
- text-xl: 20px (1.25rem)
- text-2xl: 24px (1.5rem)
- text-3xl: 30px (1.875rem)
- text-4xl: 36px (2.25rem)
- text-5xl: 48px (3rem)
- text-7xl: 72px (4.5rem)

### Spacing Scale Reference
- space-x-2: 8px horizontal gap
- space-x-3: 12px horizontal gap
- space-x-6: 24px horizontal gap
- space-x-8: 32px horizontal gap
- space-y-3: 12px vertical gap
- gap-2: 8px grid gap
- gap-3: 12px grid gap
- gap-8: 32px grid gap
- gap-12: 48px grid gap

---

## END OF SPECIFICATION

This specification provides a complete technical description of the FitLife landing page design and can be used to recreate the interface in any development environment or design tool.
