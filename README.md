# 🎓 VoiceHub - Anonymous Grievance Portal

<div align="center">

![VoiceHub Banner](https://img.shields.io/badge/VoiceHub-Anonymous%20Feedback%20System-blue?style=for-the-badge)
[![Made with Lovable](https://img.shields.io/badge/Made%20with-Lovable-ff69b4?style=for-the-badge)](https://lovable.dev)
[![React](https://img.shields.io/badge/React-18.3-61dafb?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)

**A secure, anonymous grievance management system for Meru University of Science and Technology**

[🚀 Live Demo](https://lovable.dev/projects/9df96e49-5f48-4ea7-89d8-57d9e1f66e43) • [📖 Documentation](#documentation) • [🐛 Report Bug](https://github.com/yourusername/voicehub/issues)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Usage Guide](#-usage-guide)
- [Database Schema](#-database-schema)
- [Security & Privacy](#-security--privacy)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Future Improvements](#-future-improvements)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**VoiceHub** is a comprehensive web-based platform designed to empower students at Meru University of Science and Technology to voice their concerns, complaints, and suggestions **completely anonymously**. The system ensures privacy while maintaining accountability through a unique tracking code system.

### 🎯 Problem Statement

Students often face barriers when reporting grievances due to:
- Fear of identification and retaliation
- Complex reporting procedures
- Lack of transparency in resolution processes
- No way to track complaint status

### ✅ Solution

VoiceHub provides:
- **100% Anonymous submissions** - No login required for students
- **Unique tracking codes** - Monitor your grievance without revealing identity
- **Secure admin portal** - Authorized staff can manage and respond to grievances
- **Category-based routing** - Complaints are organized for efficient handling
- **Real-time status updates** - Track progress from submission to resolution

---

## ✨ Features

### 🔓 Public Features (No Authentication Required)

#### 📝 Anonymous Grievance Submission
- Simple, intuitive form with validation
- Required fields:
  - **Title** - Brief summary (max 100 characters)
  - **Description** - Detailed explanation
  - **Category** - Academics, Security, Maintenance, Administration, or Other
- Auto-generated unique tracking code (Format: `MU-XXXX-YYYY`)
- Success modal with tracking code display and save warning
- Mobile-responsive design

#### 🔍 Status Tracking
- Check grievance status using tracking code
- View public information:
  - Title and category
  - Current status (New, In Progress, Action Taken, Closed)
  - Submission timestamp
  - Official response from administration
- Real-time data fetching
- Error handling for invalid tracking codes

### 🔐 Admin Features (Authentication Required)

#### 🎛️ Admin Dashboard
- Comprehensive grievance list view
- Sortable table with columns:
  - Tracking Code
  - Category
  - Status
  - Submission Date
- Default sorting: By date (newest first), grouped by status
- Status badge indicators with color coding
- Quick access to detailed view
- Responsive table design with mobile optimization

#### 📊 Grievance Detail & Management
- Full grievance information display
- Editable fields:
  - **Status** - Update progress (dropdown)
  - **Response** - Public message to student
  - **Private Notes** - Internal notes (hidden from public)
- Audit trail (submission timestamp)
- Update confirmation with toast notifications
- Navigation back to dashboard

#### 🔑 Secure Authentication
- Email/password login system
- Session persistence
- Protected routes with authentication guards
- Automatic token refresh
- Secure logout functionality

---

## 🛠️ Tech Stack

### Frontend
- **⚛️ React 18.3** - Modern UI library
- **📘 TypeScript 5.0** - Type-safe development
- **🎨 Tailwind CSS 3.4** - Utility-first styling
- **🧩 shadcn/ui** - High-quality component library
- **🔀 React Router 6** - Client-side routing
- **🎣 React Hook Form** - Form management
- **🔔 Sonner** - Toast notifications
- **📅 date-fns** - Date formatting utilities

### Backend & Database
- **🗄️ Supabase (PostgreSQL)** - Backend-as-a-Service
  - Database with Row-Level Security (RLS)
  - Authentication system
  - Real-time subscriptions (ready for future features)
  - RESTful API
- **🔐 Row-Level Security (RLS)** - Database-level access control

### Development Tools
- **⚡ Vite** - Fast build tool and dev server
- **🎯 ESLint** - Code quality and consistency
- **📦 npm** - Package management

### Deployment
- **☁️ Lovable Platform** - One-click deployment
- **🌐 Custom Domain Support** - Connect your own domain
- **🔄 Automatic CI/CD** - Continuous deployment from Git

---

## 🏗️ Architecture

### System Design

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                      │
│  ┌───────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Submit Page  │  │  Track Page  │  │ Admin Portal │ │
│  └───────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│          │                 │                  │          │
└──────────┼─────────────────┼──────────────────┼──────────┘
           │                 │                  │
           ▼                 ▼                  ▼
    ┌──────────────────────────────────────────────────┐
    │         Supabase JavaScript Client               │
    │  ┌────────────┐  ┌────────────┐  ┌────────────┐ │
    │  │    API     │  │    Auth    │  │  Realtime  │ │
    │  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘ │
    └────────┼───────────────┼───────────────┼─────────┘
             │               │               │
             ▼               ▼               ▼
    ┌────────────────────────────────────────────────────┐
    │              SUPABASE BACKEND                      │
    │  ┌──────────────────────────────────────────────┐ │
    │  │         PostgreSQL Database                  │ │
    │  │  ┌────────────────────────────────────────┐  │ │
    │  │  │  grievances table                      │  │ │
    │  │  │  - Row-Level Security (RLS)           │  │ │
    │  │  │  - Anon: INSERT with tracking_code    │  │ │
    │  │  │  - Anon: SELECT by tracking_code      │  │ │
    │  │  │  - Auth: Full CRUD access             │  │ │
    │  │  └────────────────────────────────────────┘  │ │
    │  └──────────────────────────────────────────────┘ │
    │  ┌──────────────────────────────────────────────┐ │
    │  │         Authentication System                │ │
    │  │  - Email/Password Auth                       │ │
    │  │  - Auto-confirm emails (dev mode)            │ │
    │  │  - JWT token management                      │ │
    │  └──────────────────────────────────────────────┘ │
    └────────────────────────────────────────────────────┘
```

### Component Structure

```
src/
├── components/
│   ├── ui/                      # Reusable UI components (shadcn)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── GrievanceForm.tsx        # Anonymous submission form
│   ├── StatusChecker.tsx        # Track grievance by code
│   ├── SuccessModal.tsx         # Post-submission modal
│   ├── Header.tsx               # Site header
│   └── Footer.tsx               # Site footer
├── pages/
│   ├── Home.tsx                 # Landing + submission page
│   ├── Track.tsx                # Status tracking page
│   ├── NotFound.tsx             # 404 page
│   └── admin/
│       ├── Login.tsx            # Admin authentication
│       ├── Dashboard.tsx        # Grievance list view
│       └── GrievanceDetail.tsx  # Detail + edit view
├── integrations/
│   └── supabase/
│       ├── client.ts            # Supabase client setup
│       └── types.ts             # Auto-generated DB types
├── types/
│   └── grievance.ts             # TypeScript interfaces
├── lib/
│   ├── utils.ts                 # Utility functions
│   └── grievance-utils.ts       # Grievance-specific utilities
└── hooks/
    ├── use-toast.ts             # Toast notification hook
    └── use-mobile.tsx           # Mobile detection hook
```

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher) - [Install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- **npm** (comes with Node.js)
- **Git** - [Download Git](https://git-scm.com/downloads)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/voicehub.git
   cd voicehub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   The `.env` file is automatically configured by Lovable Cloud. It contains:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
   VITE_SUPABASE_PROJECT_ID=your_project_id
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173` to see the application running.

### Database Setup

The database is automatically configured with migrations. The schema includes:

- ✅ `grievances` table with proper columns
- ✅ Row-Level Security (RLS) policies
- ✅ Check constraints for categories and status
- ✅ Indexes for performance

**Create your first admin account:**

1. Navigate to `/admin/login`
2. Click "Don't have an account? Sign up"
3. Register with your email and password
4. You'll be automatically logged in (auto-confirm is enabled for development)

---

## 📖 Usage Guide

### For Students

#### Submitting a Grievance

1. **Navigate to Home Page**
   - Visit the website homepage
   - You'll see the grievance submission form

2. **Fill Out the Form**
   - **Title**: Briefly describe your issue (max 100 characters)
   - **Description**: Provide detailed information about your grievance
   - **Category**: Select the most appropriate category:
     - 📚 **Academics** - Course content, teaching, exams
     - 🔒 **Security** - Campus safety, access control
     - 🔧 **Maintenance** - Facilities, infrastructure
     - 📋 **Administration** - Procedures, documentation
     - 💡 **Other** - Anything else

3. **Submit**
   - Click "Submit Grievance"
   - A unique tracking code will be generated (e.g., `MU-7834-2156`)
   - **IMPORTANT**: Save this code! You'll need it to track your grievance

4. **Track Your Grievance**
   - Navigate to the "Track Status" page
   - Enter your tracking code
   - View current status and any official responses

#### Understanding Status Levels

- 🆕 **New** - Your grievance has been submitted and is awaiting review
- ⏳ **In Progress** - An administrator is actively working on your grievance
- ✅ **Action Taken** - Actions have been completed; awaiting verification
- 🔒 **Closed** - Your grievance has been resolved

### For Administrators

#### Logging In

1. Navigate to `/admin/login`
2. Enter your registered email and password
3. Click "Sign In"
4. You'll be redirected to the dashboard

#### Managing Grievances

1. **Dashboard Overview**
   - View all submitted grievances in a sortable table
   - Grievances are sorted by date (newest first)
   - Status badges provide quick visual indication
   - Click on any row to view details

2. **Updating a Grievance**
   - Click on a grievance to open the detail view
   - Update the **Status** dropdown to reflect current progress
   - Add a **Response** message that will be visible to the student
   - Use **Private Notes** for internal communication (not visible to students)
   - Click "Update Grievance" to save changes

3. **Best Practices**
   - Respond promptly to new grievances
   - Keep status updated as you work on issues
   - Write clear, professional responses
   - Use private notes to track internal actions

---

## 🗄️ Database Schema

### `grievances` Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | Primary Key, Default: `gen_random_uuid()` | Unique identifier for each grievance |
| `tracking_code` | `text` | Unique, Not Null | 8-digit code for anonymous tracking (e.g., MU-4589-2025) |
| `title` | `text` | Not Null | Brief summary of the grievance (max 100 chars) |
| `description` | `text` | Not Null | Detailed description of the issue |
| `category` | `text` | Not Null, Check: `('Academics', 'Security', 'Maintenance', 'Administration', 'Other')` | Type of grievance |
| `status` | `text` | Not Null, Default: `'New'`, Check: `('New', 'In Progress', 'Action Taken', 'Closed')` | Current status of the grievance |
| `submitted_at` | `timestamp with time zone` | Default: `now()` | Timestamp when grievance was submitted |
| `response` | `text` | Nullable | Official public response from administration |
| `private_notes` | `text` | Nullable | Internal notes for admin use only |

### Indexes

- Primary key index on `id`
- Unique index on `tracking_code`
- Index on `status` for faster filtering
- Index on `submitted_at` for sorting

---

## 🔐 Security & Privacy

### Row-Level Security (RLS) Policies

VoiceHub implements strict database-level security through PostgreSQL RLS:

#### 1. **Anonymous Insert Policy**
```sql
Policy: "Allow anon to submit grievances"
Target: INSERT operations
Users: Anonymous (unauthenticated)
Condition: title, description, category, and tracking_code must be present
```
- Students can submit grievances without authentication
- No PII is stored in the database
- Tracking code is generated client-side

#### 2. **Anonymous Select Policy**
```sql
Policy: "Allow anon to track by code"
Target: SELECT operations
Users: Anonymous (unauthenticated)
Condition: tracking_code must match
Redaction: private_notes is hidden
```
- Students can only view their own grievance using the tracking code
- Private notes are automatically redacted from public views
- No access to other grievances

#### 3. **Admin Full Access Policy**
```sql
Policy: "Allow admins full access"
Target: ALL operations (SELECT, INSERT, UPDATE, DELETE)
Users: Authenticated users
Condition: User must be logged in
```
- Authenticated administrators have full CRUD access
- All fields including private notes are accessible
- Audit trail maintained through Supabase auth logs

### Authentication Security

- **Password Requirements**: Enforced by Supabase Auth
- **JWT Tokens**: Automatic token refresh for session management
- **HTTPS**: All production traffic encrypted with SSL/TLS
- **CORS**: Configured for frontend origin only
- **Auto-confirm**: Enabled for development; should be disabled in production

### Data Privacy

- **No PII Collection**: Students never provide names, emails, or student IDs
- **Anonymous by Design**: Tracking codes cannot be reverse-engineered to identify users
- **Secure Storage**: All data encrypted at rest in Supabase
- **Access Logs**: Admin actions are logged for accountability

### Best Practices Implemented

- ✅ Environment variables for sensitive keys
- ✅ No hardcoded credentials
- ✅ Secure password hashing (Supabase bcrypt)
- ✅ Protected admin routes
- ✅ Input validation and sanitization
- ✅ Rate limiting (Supabase default)
- ✅ SQL injection protection (Supabase parameterized queries)

---

## 📡 API Documentation

### Supabase Client Usage

The application uses the official Supabase JavaScript client:

```typescript
import { supabase } from "@/integrations/supabase/client";
```

### Public Endpoints (No Auth Required)

#### Submit Grievance
```typescript
const { data, error } = await supabase
  .from("grievances")
  .insert({
    tracking_code: generateTrackingCode(),
    title: formData.title,
    description: formData.description,
    category: formData.category,
  })
  .select()
  .single();
```

#### Track Grievance
```typescript
const { data, error } = await supabase
  .from("grievances")
  .select("id, tracking_code, title, category, status, submitted_at, response")
  .eq("tracking_code", trackingCode)
  .single();
```

### Admin Endpoints (Auth Required)

#### Login
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: email,
  password: password,
});
```

#### Fetch All Grievances
```typescript
const { data, error } = await supabase
  .from("grievances")
  .select("*")
  .order("submitted_at", { ascending: false });
```

#### Update Grievance
```typescript
const { error } = await supabase
  .from("grievances")
  .update({
    status: formData.status,
    response: formData.response,
    private_notes: formData.private_notes,
  })
  .eq("id", grievanceId);
```

---

## 🚢 Deployment

### Deploy to Lovable Platform (Recommended)

1. **Connect to Lovable**
   - Visit [Lovable Project](https://lovable.dev/projects/9df96e49-5f48-4ea7-89d8-57d9e1f66e43)
   - All changes are automatically synced

2. **Publish**
   - Click the "Publish" button in top right (desktop) or bottom right (mobile)
   - Your app will be deployed to `yoursite.lovable.app`

3. **Custom Domain (Optional)**
   - Navigate to Project > Settings > Domains
   - Click "Connect Domain"
   - Follow DNS configuration instructions
   - Requires paid Lovable plan

### Deploy to Other Platforms

#### Vercel
```bash
npm install -g vercel
vercel deploy
```

#### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

#### Manual Build
```bash
npm run build
# Deploy the 'dist' folder to your hosting provider
```

### Environment Variables

Ensure these are set in your deployment platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

### Production Checklist

- [ ] Disable auto-confirm emails in Supabase Auth settings
- [ ] Set up email templates for password reset
- [ ] Configure custom domain with SSL
- [ ] Enable Supabase Auth rate limiting
- [ ] Set up monitoring and error tracking
- [ ] Create backup admin accounts
- [ ] Test all user flows
- [ ] Set up analytics (optional)

---

## 🎯 Future Improvements

### 🚀 High Priority Features

#### 1. **📧 Email Notifications**
- Notify admins of new grievances via email
- Send status update notifications to students (via tracking code link)
- Weekly digest of pending grievances
- **Tech**: Supabase Edge Functions + SendGrid/Resend

#### 2. **📊 Analytics Dashboard**
- Visualize grievance trends by category
- Response time metrics
- Resolution rate statistics
- Monthly/yearly reports
- **Tech**: Recharts, Chart.js

#### 3. **🔍 Advanced Search & Filtering**
- Search by keywords in title/description
- Filter by date range
- Multi-select category filter
- Export filtered results to CSV
- **Tech**: React Query, CSV export library

#### 4. **📱 Progressive Web App (PWA)**
- Offline tracking capability
- Install as mobile app
- Push notifications
- **Tech**: Vite PWA plugin, Service Workers

#### 5. **🌐 Multi-language Support**
- English and Swahili translations
- Language switcher in header
- Localized date formats
- **Tech**: i18next, react-i18next

### 🎨 UI/UX Enhancements

#### 6. **🎯 Improved Status Tracker**
- Visual progress timeline
- Estimated resolution time
- History of status changes
- **Tech**: Custom timeline component

#### 7. **📸 File Attachments**
- Allow students to upload evidence (images, PDFs)
- Image preview in admin panel
- File size limits and validation
- **Tech**: Supabase Storage

#### 8. **💬 Internal Communication**
- Request more information from student (via tracking code)
- Private messaging between admins
- Comment threads on grievances
- **Tech**: Supabase Realtime

#### 9. **🎨 Dark Mode**
- Toggle between light and dark themes
- System preference detection
- Persistent theme selection
- **Tech**: next-themes (already installed)

#### 10. **♿ Accessibility Improvements**
- ARIA labels for screen readers
- Keyboard navigation improvements
- High contrast mode
- Font size adjustment
- **Tech**: axe-core, WAVE testing

### 🔒 Security & Performance

#### 11. **🔐 Two-Factor Authentication (2FA)**
- TOTP-based 2FA for admin accounts
- Backup codes
- **Tech**: Supabase Auth MFA

#### 12. **⚡ Performance Optimization**
- Implement pagination for large datasets
- Lazy loading for images
- Code splitting for faster loads
- **Tech**: React.lazy, Intersection Observer

#### 13. **🛡️ Rate Limiting**
- Prevent spam submissions
- Admin API rate limiting
- CAPTCHA for suspicious activity
- **Tech**: Supabase rate limiting, hCaptcha

#### 14. **📝 Audit Logs**
- Track all admin actions
- IP address logging
- Login attempt monitoring
- **Tech**: Custom Supabase table + triggers

### 🤖 Advanced Features

#### 15. **🧠 AI-Powered Features**
- Auto-categorization of grievances
- Sentiment analysis
- Suggested responses for admins
- Duplicate detection
- **Tech**: OpenAI API, Lovable AI

#### 16. **📈 Priority System**
- Mark grievances as high/medium/low priority
- Auto-priority based on keywords
- SLA tracking
- **Tech**: Custom priority field + logic

#### 17. **👥 Multi-Role Admin System**
- Department-specific admins
- Role-based permissions (viewer, editor, admin)
- Assignment system
- **Tech**: Supabase Auth roles

#### 18. **🔔 Real-time Updates**
- Live dashboard updates without refresh
- Real-time status changes
- Active user indicators
- **Tech**: Supabase Realtime subscriptions

#### 19. **📋 Template Responses**
- Pre-written response templates
- Quick reply shortcuts
- Response library
- **Tech**: Custom templates table

#### 20. **🎓 Student Feedback**
- Rate the resolution process
- Anonymous satisfaction surveys
- Feedback on admin responses
- **Tech**: Custom feedback table

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute

- 🐛 Report bugs and issues
- 💡 Suggest new features
- 📝 Improve documentation
- 🎨 Enhance UI/UX design
- 🔧 Submit pull requests

### Development Workflow

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/voicehub.git
   cd voicehub
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow the existing code style
   - Add comments for complex logic
   - Update documentation if needed

4. **Test your changes**
   ```bash
   npm run dev
   # Test thoroughly in the browser
   ```

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```
   
   **Commit Message Convention:**
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `style:` - Code style changes (formatting)
   - `refactor:` - Code refactoring
   - `test:` - Adding tests
   - `chore:` - Maintenance tasks

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Describe your changes in detail
   - Reference any related issues

### Code Style Guidelines

- Use TypeScript for all new files
- Follow React best practices and hooks patterns
- Use semantic HTML elements
- Implement responsive design (mobile-first)
- Use Tailwind CSS semantic tokens from `index.css`
- Add JSDoc comments for complex functions
- Keep components small and focused
- Use meaningful variable and function names

### Testing

Before submitting a PR:
- [ ] Test all user flows
- [ ] Check responsive design on mobile
- [ ] Verify no TypeScript errors
- [ ] Test with anonymous users (incognito mode)
- [ ] Test admin features
- [ ] Check browser console for errors

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Meru University of Science and Technology

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📞 Support & Contact

### Need Help?

- 📚 [Documentation](https://docs.lovable.dev)
- 💬 [Lovable Discord Community](https://discord.com/channels/1119885301872070706/1280461670979993613)
- 📧 Email: support@mu.ac.ke (replace with actual support email)
- 🐦 Twitter: [@MeruUniversity](https://twitter.com/meruuniversity) (replace with actual handle)

### Project Links

- 🌐 **Live Application**: [lovable.app deployment URL]
- 💻 **GitHub Repository**: [github.com/yourusername/voicehub](https://github.com/yourusername/voicehub)
- 📖 **Project Dashboard**: [Lovable Project](https://lovable.dev/projects/9df96e49-5f48-4ea7-89d8-57d9e1f66e43)

### Acknowledgments

- Built with ❤️ by the Meru University IT Department
- Powered by [Lovable](https://lovable.dev)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons by [Lucide](https://lucide.dev)

---

## 🌟 Star History

If you find this project useful, please consider giving it a ⭐ on GitHub!

---

<div align="center">

**Made with ❤️ for Meru University Students**

*Empowering voices, one grievance at a time* 🎓

[⬆ Back to Top](#-voicehub---anonymous-grievance-portal)

</div>
