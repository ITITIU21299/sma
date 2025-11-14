# School Management System - React + Next.js Conversion

This document describes the conversion of the Java-based School Management System to a modern React + Next.js application.

## Overview

The original Java web application (located in `src/main/`) has been converted to a modern React + Next.js application with:
- **Modern UI**: Built with React, Next.js, Tailwind CSS, and Radix UI components
- **OOP Principles**: All models are implemented as ES6 classes with proper encapsulation
- **Type Safety**: Using JavaScript with clear class structures
- **Responsive Design**: Mobile-first approach with dark mode support

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes (replaces servlets)
│   │   └── auth/          # Authentication endpoints
│   ├── login/             # Login page
│   ├── student/           # Student pages
│   │   ├── dashboard/
│   │   ├── fee/
│   │   ├── exam-schedule/
│   │   ├── schedule/
│   │   ├── attendance/
│   │   ├── feedback/
│   │   ├── profile/
│   │   └── change-password/
│   ├── staff/             # Staff pages
│   │   ├── dashboard/
│   │   ├── salary/
│   │   ├── schedule/
│   │   ├── attendance/
│   │   ├── assign-room/
│   │   ├── profile/
│   │   └── change-password/
│   └── layout.js           # Root layout
├── components/            # React components
│   ├── layout/           # Layout components (Navbar, Footer)
│   └── ui/               # Reusable UI components
├── models/               # OOP models (classes)
│   ├── User.js
│   ├── Student.js
│   ├── Staff.js
│   ├── Attendance.js
│   ├── Schedule.js
│   ├── Fee.js
│   ├── Exam.js
│   └── Salary.js
├── services/             # Service layer (DAO pattern)
│   └── UserService.js
└── lib/                  # Utilities
    ├── utils.js          # Utility functions
    └── password.js       # Password hashing utilities
```

## Key Features

### 1. Object-Oriented Programming
All data models are implemented as ES6 classes with:
- Constructor methods
- Getter and setter methods
- `toJSON()` methods for serialization
- Proper encapsulation

Example:
```javascript
export class Student {
  constructor(studentId, name, email, ...) {
    this.studentId = studentId;
    this.name = name;
    // ...
  }
  
  getStudentId() { return this.studentId; }
  setStudentId(studentId) { this.studentId = studentId; }
  toJSON() { return { ... }; }
}
```

### 2. Modern UI Components
- Built with Radix UI primitives
- Tailwind CSS for styling
- Dark mode support
- Responsive design
- Accessible components

### 3. Authentication System
- Session-based authentication using cookies
- Protected routes with layout-level guards
- Login/Logout functionality
- Password change feature

### 4. API Routes
Next.js API routes replace Java servlets:
- `/api/auth/login` - User authentication
- `/api/auth/logout` - Session termination
- `/api/auth/session` - Session validation

## Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env.local` file:
   ```env
   DB_URL=your_database_url
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

## Database Integration

The API routes currently have placeholder implementations. To connect to your database:

1. Install a database driver (e.g., `mysql2` for MySQL):
   ```bash
   npm install mysql2
   ```

2. Create a database utility in `src/lib/db.js`:
   ```javascript
   import mysql from 'mysql2/promise';
   
   export async function getConnection() {
     return await mysql.createConnection({
       host: process.env.DB_HOST,
       user: process.env.DB_USER,
       password: process.env.DB_PASSWORD,
       database: process.env.DB_NAME,
     });
   }
   ```

3. Update API routes to use the database connection.

## Conversion Mapping

### Java → JavaScript/React

| Java Component | React/Next.js Equivalent |
|---------------|-------------------------|
| `Class/*.java` | `models/*.js` (ES6 Classes) |
| `Servlet/*.java` | `app/api/**/route.js` (API Routes) |
| `DAO/*.java` | `services/*.js` (Service Layer) |
| `JSP/*.jsp` | `app/**/page.jsx` (React Components) |
| `Util/*.java` | `lib/*.js` (Utility Functions) |

### Pages Converted

**Student Pages:**
- ✅ Login Page
- ✅ Dashboard
- ✅ Fee Information
- ✅ Exam Schedule
- ✅ Room Schedule
- ✅ Attendance
- ✅ Feedback
- ✅ Profile
- ✅ Change Password

**Staff Pages:**
- ✅ Dashboard
- ✅ Salary Information
- ✅ Schedule
- ✅ Manage Attendance
- ✅ Assign Room
- ✅ Profile
- ✅ Change Password

## Dependencies

### Core
- `next`: 16.0.1 - React framework
- `react`: 19.2.0 - UI library
- `react-dom`: 19.2.0 - React DOM renderer

### UI Components
- `@radix-ui/react-*` - Accessible UI primitives
- `lucide-react` - Icon library
- `tailwindcss` - CSS framework
- `class-variance-authority` - Component variants
- `clsx` & `tailwind-merge` - Class name utilities

### Utilities
- `bcryptjs` - Password hashing
- `next-auth` - Authentication (optional, currently using cookies)

## Next Steps

1. **Database Integration**: Connect API routes to your database
2. **API Implementation**: Complete all API endpoints with actual database queries
3. **Error Handling**: Add comprehensive error handling
4. **Testing**: Add unit and integration tests
5. **Deployment**: Configure for production deployment

## Notes

- The original Java code in `src/main/` is preserved for reference
- All API routes have TODO comments indicating where database integration is needed
- Mock data is used in components for demonstration purposes
- Dark mode is implemented and persists in localStorage

## License

Same as the original project.

