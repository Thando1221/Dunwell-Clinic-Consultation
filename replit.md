# Dunwell Nurse Portal

## Overview

This is a healthcare management application designed for nurses at Dunwell Executive Wellness & Healthcare clinic. The application enables nurses to manage patient appointments, record visit information, view patient histories, and generate medical documents (sick notes, prescriptions, referrals, and medical fitness certificates).

The system consists of a React frontend with a Node.js/Express backend that connects to a Microsoft SQL Server database. It follows a role-based access control model where only users with the "N" (Nurse) role can access the application.

## Recent Changes (January 2026)

- **Attend Booking Page**: Fixed the "Record Visit Info" functionality to properly save visit data to the Visit table
- **Follow-up Appointments**: When a follow-up date/time is selected, a new appointment is created with isFollow_Up set to "Yes" and StartTime set to the selected follow-up datetime
- **Dashboard**: Fixed to properly join with Patients table and display patient names
- **UI/UX Improvements**: Enhanced AttendBooking page with better animations, loading states, scroll areas, and visual feedback

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Routing**: React Router DOM for client-side navigation with protected routes
- **State Management**: React Context API for authentication and theme state; TanStack Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom theme configuration supporting light/dark modes
- **Animations**: Framer Motion for smooth UI transitions
- **PDF Generation**: jsPDF for creating medical documents client-side

### Backend Architecture
- **Runtime**: Node.js 20 with ES modules
- **Framework**: Express.js for REST API handling
- **Database Driver**: mssql package for Microsoft SQL Server connectivity
- **Authentication**: JWT-based authentication with bcryptjs for password hashing
- **API Structure**: Route-based organization under `/backend/routes/`
- **Server Port**: Runs on port 5000, serves both API and static frontend

### Key Design Patterns
- **Protected Routes**: Authentication wrapper component redirects unauthenticated users to login
- **Context Providers**: AuthContext manages user session; ThemeContext handles light/dark mode
- **API Service Layer**: Axios for HTTP requests with JWT token headers
- **Component Composition**: Reusable UI components with consistent styling via CVA (class-variance-authority)
- **Transaction Safety**: Database operations use SQL transactions for data integrity

### Data Flow
1. Frontend makes authenticated API calls to `/api/*` endpoints
2. Backend validates JWT tokens via middleware
3. Backend queries SQL Server database using parameterized queries with transactions
4. Results are transformed and returned as JSON

### Application Pages
- **Login**: Authentication entry point for nurses
- **Dashboard**: Overview of daily appointments with statistics (InPatient, OutPatient, Pending counts)
- **Patients**: Searchable patient directory
- **Attend Booking**: Interface for recording visit details for today's InPatient appointments; supports follow-up scheduling
- **Visit History**: Historical visit records by patient
- **Notes**: Medical document generation (sick notes, prescriptions, referrals, fitness certificates)

### Database Tables
- **Appointments**: AppointID, PatientID, MedicalAidNumber, StartTime, EndTime, UserID, MedicalAidName, Status, ServiceName, ServicePrice, MedicalAid_MainMember, MainMember__IDNo, MedicalAid_option, PaymentMethod, FinalPrice, IsStudent, isFollow_Up
- **Visit**: VisitID, AppointID, Examination, History, Diagnoses, Treatment, Health_Education, FollowUp_Plan, endTime
- **Patients**: PatientID, Name, Surname, and other patient details
- **Users**: User authentication and roles

## External Dependencies

### Database
- **Microsoft SQL Server**: Primary data store accessed via the `mssql` npm package
- Connection configured through environment variables (DB_USER, DB_PASSWORD, DB_DATABASE, DB_SERVER, DB_PORT)

### Authentication
- **JWT (jsonwebtoken)**: Token-based session management with 8-hour expiration
- **bcryptjs**: Password hashing and verification

### Environment Variables Required
- `VITE_API_URL`: Frontend API base URL for backend communication (set to `/api`)
- `JWT_SECRET`: Secret key for signing JWT tokens
- `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`, `DB_SERVER`, `DB_PORT`: SQL Server connection details
- `DB_ENCRYPT`, `DB_TRUST_SERVER_CERTIFICATE`: SQL Server security options

### Third-Party UI Libraries
- **Radix UI**: Accessible component primitives (dialogs, dropdowns, forms)
- **react-select**: Enhanced select inputs for patient selection
- **date-fns**: Date formatting and manipulation
- **lucide-react**: Icon library
- **sonner**: Toast notifications

### Development Tools
- **Lovable Tagger**: Development-only component tagging for the Lovable platform