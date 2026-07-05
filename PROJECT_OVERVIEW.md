# MyFestivo: Project Overview & Architecture

## 1. Concept & Vision
**MyFestivo** is designed as "The Event Operating System for College Communities". It is an all-in-one platform intended to help college communities create, manage, and participate in campus events—from registration to check-in. Its primary goal is to replace the chaos of managing events via WhatsApp or fragmented tools with a professional, scalable, and centralized platform.

## 2. Target Audience
- **Primary:** College event organizers, student coordinators, and student clubs.
- **Secondary:** Institution administrators and campus engagement teams.

## 3. Technology Stack
The project is built on a modern, robust, and interactive tech stack:
- **Frontend Framework:** Next.js (React) using the App Router.
- **Styling & UI:** Tailwind CSS, Shadcn UI, and Base UI.
- **Animations & 3D:** Framer Motion, Three.js (`@react-three/fiber`) for rich micro-interactions and 3D elements.
- **Backend & Database:** Firebase (Firestore, Authentication, Hosting/Functions).
- **Payments:** Razorpay integration for ticketing and event fees.
- **Email/Notifications:** Nodemailer.
- **Other Utilities:** `dnd-kit` (drag and drop), `jsqr` and `qrcode.react` (QR code generation/scanning for event check-ins).

## 4. Design System & Aesthetics
The site is modeled after a premium, dark-themed SaaS aesthetic (inspired by `save.design`). 
- **Aesthetic Direction:** Refined brutalist dark—near-black backgrounds, crisp off-white type, and a single vivid accent color (electric indigo/violet `#7C5CFC`).
- **Visual Features:** Frosted-glass card surfaces, subtle noise grain overlays, layered gradient blooms, and rich micro-animations.
- **Typography:** Syne (Headlines), DM Sans (Body), and DM Mono (Badges/Labels).

## 5. Core Project Structure
The repository is divided into several main areas:

### `src/` (The Next.js Application)
Contains the core application code:
- `app/`: Next.js App Router pages and layouts.
- `components/`: Reusable React components (likely structured using Shadcn UI).
- `hooks/`: Custom React hooks for state and lifecycle management.
- `lib/`: Utility functions, Firebase initialization, and Razorpay/Nodemailer wrappers.

### `.seo-engine/` (Automated Content & SEO System)
A standout feature of this repository is its heavily integrated **SEO Content Engine**, designed to automate inbound marketing using AI.
- **`config.yaml`**: Project settings, target audience, and CMS configurations.
- **`data/`**: Stores feature registries, competitor analysis, keyword targets, and a queue of blog ideas.
- **`templates/`**: Guidelines for blog frontmatter, blog structures, and tone-of-voice (E-E-A-T rules).
- **Workflow:** The engine allows AI agents (like Claude/Gemini) to automatically research, write, format, and queue SEO-optimized blog posts directly into the site based on the data provided here.

### Configurations & Deployment
- **Firebase:** `firebase.json`, `firestore.rules`, and `firestore.indexes.json` define the database security rules and deployment configs.
- **Netlify:** Includes scripts like `NETLIFY_DEPLOYMENT.sh` and `netlify.toml` for CI/CD deployment pipelines.

## 6. How It Works (The Workflow)
1. **Event Organizers** sign up and create event pages via the MyFestivo dashboard.
2. **Design System** ensures the interface looks highly premium, building trust with college admins and students.
3. **Payments & Ticketing:** Users purchase tickets or register via Razorpay. A QR code is generated (`qrcode.react`) and emailed to the user (`nodemailer`).
4. **Check-in:** On the day of the event, organizers can use the built-in QR scanner (`jsqr`) to validate tickets and check students in.
5. **Marketing (SEO Engine):** In the background, the SEO engine continuously generates pillar and cluster blog content comparing MyFestivo to competitors (like Eventbrite, Unstop, DoorList) to drive organic search traffic to the platform.
