# UI/UX Master prompt

```html
REDESIGN MYFESTIVO UI/UX — DO NOT REBUILD THE APPLICATION

You are working on an existing React web application called MyFestivo.

TECH STACK:
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Existing React components and application logic
- Existing Firebase/backend functionality must remain untouched

GOAL:

Redesign the visual system and responsive UX of the existing application.

Do NOT rewrite the application's business logic, authentication, Firebase integration, API/data fetching, event registration logic, routing, or existing functionality.

This is primarily a UI/UX and design-system refactor.

DESIGN DIRECTION:

Use the "Soft Glass / Neumorphic" visual direction.

The design should feel:

- premium
- modern
- futuristic
- elegant
- minimal
- youthful
- suitable for college events
- slightly space-inspired
- NOT like a gaming website
- NOT overly cyberpunk
- NOT overly glassmorphic

PRIMARY BRAND ACCENT:

#B388FF

Use this as the primary MyFestivo violet.

Supporting violet colors may include:

#8B5CF6
#9C6CFF
#C4A7FF

Do not use excessive saturated purple.

Purple should primarily communicate:
- primary actions
- active navigation
- selected filters
- links
- important states
- focus states

THEME SUPPORT:

Implement a complete Light / Dark / System theme system.

The current application probably does not have theme switching. Check once.

Use CSS variables/design tokens so components do NOT contain hardcoded colors.

Users must be able to select:

1. Light
2. Dark
3. System

Persist the user's preference.

Respect the operating system's preferred color scheme when "System" is selected.

Use shadcn/ui's existing theme architecture where possible.

LIGHT THEME:

Background:
#F8F7FC

Foreground:
#17151F

Cards:
white / slightly translucent white

Primary:
#8B5CF6 or #B388FF

Borders:
very subtle lavender-gray

Shadows:
soft and diffused

The light theme should feel airy, soft and premium.

Avoid pure white everywhere.

Use subtle lavender gradients and extremely subtle space/constellation decorations.

DARK THEME:

Background:
#080A14

Secondary background:
#0D1020

Card:
#111321

Foreground:
#F5F3FF

Muted text:
#A09AAF

Primary:
#B388FF

Borders:
subtle violet-gray

Use very subtle violet glows.

The dark theme should feel similar to a premium futuristic dashboard, NOT a pure black cyberpunk interface.

Do not use excessive neon.

GLASSMORPHISM:

Create reusable glass surface styles.

Use:
- translucent surfaces
- backdrop blur
- thin borders
- subtle shadows
- subtle highlights

Do NOT make every component glass.

Use glass primarily for:
- navbar
- sidebar
- floating controls
- filters
- important cards
- modals
- mobile bottom navigation

NEUMORPHISM:

Use very subtle depth through shadows and highlights.

Do NOT use exaggerated embossed controls.

The UI should remain flat enough to preserve accessibility and readability.

TYPOGRAPHY:

Use a modern clean sans-serif.

Strong hierarchy:

Hero heading:
large and bold

Section headings:
clear and compact

Body:
comfortable line height

Metadata:
smaller but readable

Avoid excessive letter spacing.

LANDING PAGE:

Redesign the existing hero to resemble a soft glass/neumorphic futuristic product landing page.

Current messaging:

"Your events.
One place."

Keep this messaging unless there is a strong UX reason to improve it.

Hero structure:

Left:
- small eyebrow
- large heading
- supporting description
- primary CTA
- secondary CTA

Right:
- elegant abstract MyFestivo event/calendar visual
- subtle violet glow
- soft glass layers
- subtle orbital/space-inspired decoration

LIGHT:
airy lavender/white environment

DARK:
deep navy environment with violet glow

Do not introduce a large distracting illustration that reduces readability.

Use responsive event cards.

Desktop:
3-column layout when enough width is available.

Tablet:
2-column layout.

Mobile:
1-column layout.

On smaller mobile screens, allow event cards to become compact horizontal cards where appropriate.

EVENT CARD:

Use subtle hover elevation and border glow.

Do not make cards excessively tall.

EVENT DETAILS:

Create a responsive event details layout.

BUTTONS:

Primary button:
violet background
white/dark readable text
soft violet shadow

Secondary button:
transparent/glass
subtle border

Ghost button:
minimal

Buttons must have:
- hover
- active
- focus-visible
- disabled
states.

Do not make every button purple.

RESPONSIVE DESIGN:

Do not simply scale desktop down.

Design separate responsive behavior for:

Desktop
Tablet
Mobile

Important mobile priorities:

- readable typography
- large touch targets
- minimal horizontal scrolling
- bottom navigation
- compact cards
- sticky registration CTA
- simplified filters
- accessible forms

Breakpoints should use Tailwind's responsive utilities.

ACCESSIBILITY:

Maintain WCAG-conscious contrast.

Do not rely on color alone to communicate state.

All interactive elements need keyboard focus states.

Use semantic HTML.

Buttons must be actual buttons.

Links must be actual links.

Form controls must have labels.

Images must have useful alt text.

Respect prefers-reduced-motion.

Do not make backdrop-filter essential to understanding content.

If backdrop blur is unsupported, the UI should still look good.

PERFORMANCE:

Do not add unnecessarily heavy animations.

Avoid excessive backdrop-filter layers.

Avoid huge box-shadow chains.

Keep animations subtle.

Use transform/opacity for animations where possible.

Do not introduce unnecessary dependencies and bugs.

COMPONENT ARCHITECTURE:

Create reusable design primitives instead of repeating Tailwind classes.

Examples:

GlassCard
GlassPanel
PageHeader
EventCard
EventGrid
CategoryChip
ThemeToggle
MobileBottomNav
DesktopSidebar
PrimaryButton
SecondaryButton
VioletGlow

Use existing shadcn/ui components whenever appropriate.

Do not duplicate components that already exist.

DESIGN TOKENS:

Move colors into CSS variables.

Components should primarily use semantic classes such as:

bg-background
text-foreground
bg-card
text-card-foreground
border-border
text-muted-foreground
bg-primary
text-primary-foreground
ring-primary

Avoid hardcoded colors throughout JSX.

IMPORTANT:

Do not break existing functionality.

Before changing a component, understand its current props and data flow.

Preserve:
- event fetching
- authentication
- registration
- routing
- Firebase
- forms
- existing API calls
- existing state management

Only modify UI structure when necessary.

IMPLEMENTATION STRATEGY:

FIRST:
Audit the existing component architecture.

SECOND:
Create/update the global design tokens and theme system.

THIRD:
Implement Light/Dark/System theme switching.

FOURTH:
Update shared components and shadcn components.

FIFTH:
Redesign the desktop layout.

SIXTH:
Redesign mobile layouts independently where necessary.

SEVENTH:
Apply the new event card and event detail design.

EIGHTH:
Test every major page in:
- Light desktop
- Dark desktop
- Light mobile
- Dark mobile

NINTH:
Check:
- contrast
- keyboard navigation
- focus states
- responsive overflow
- touch target sizes
- reduced motion

DO NOT:
- rewrite backend code
- modify Firebase logic
- remove functionality
- replace React with another framework
- replace Tailwind
- replace shadcn/ui
- add unnecessary UI libraries
- turn the entire application into glassmorphism
- use excessive neon
- use excessive animations

FINAL RESULT:

MyFestivo should visually feel like a premium modern event operating system.

The design language should combine:

SOFT GLASS
+
SUBTLE NEUMORPHISM
+
SPACE-INSPIRED DETAILS
+
MYFESTIVO VIOLET #B388FF
+
CLEAN INFORMATION HIERARCHY
+
EXCELLENT MOBILE UX

The Light and Dark themes should feel like two intentional versions of the same design system, not one theme with colors inverted.
```