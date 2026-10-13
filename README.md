# School Management System

A complete full-stack school management system built with Node.js/Express backend and React frontend.

## Features

### Student Features
- View marks and grades
- Submit claims for mark disputes
- View generated bulletins
- Track claim status

### Teacher Features
- View all students
- Add and manage marks
- Review and approve/reject claims
- Generate student bulletins

### Authentication
- Role-based access control (Student/Teacher/Admin)
- JWT token authentication
- Secure password hashing

## Tech Stack

### Backend
- Node.js
- Express.js
- PostgreSQL with Neon DB
- JWT Authentication
- bcryptjs for password hashing
- pg (PostgreSQL client)

### Frontend
- React 18
- React Router for navigation
- Axios for API calls
- Modern CSS with responsive design

## Installation

### Prerequisites
- Node.js installed
- Neon DB account (PostgreSQL cloud database)

### Backend Setup
1. Navigate to the project directory
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up Neon DB:
   - Create an account at [neon.tech](https://neon.tech)
   - Create a new PostgreSQL project
   - Copy the connection string
   
4. Create a `.env` file with the following:
   ```
   PORT=5000
   DATABASE_URL=postgresql://username:password@host:5432/database_name?sslmode=require
   JWT_SECRET=your_jwt_secret_key_here_change_in_production
   NODE_ENV=development
   EMAIL_USER=your-gmail-address@gmail.com
   EMAIL_PASSWORD=your-gmail-app-password
   CONTACT_EMAIL=cyizihizaintimerank@gmail.com
   ```
   Replace `DATABASE_URL` with your Neon DB connection string.
   To send contact form messages and account verification emails, set `EMAIL_USER` to a Gmail account and `EMAIL_PASSWORD` to its Google App Password (not the normal account password). Contact messages are sent to `CONTACT_EMAIL`.

5. Set up the database schema:
   ```bash
   node setup-database.js
   ```

6. Build the frontend and start the server:
   ```bash
   npm run build
   npm start
   ```
   Open `http://localhost:5000` to use the built website and API from the same server. After changing frontend source files, run `npm run build` again; the running server will serve the updated build without needing to restart.

   For backend development with auto-restart:
   ```bash
   npm run dev
   ```

### Frontend Development
To work on the frontend with live reload, start the React development server in a second terminal:
   ```bash
   npm run client
   ```
The development frontend runs at `http://localhost:3000` and proxies API requests to the backend on port 5000.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Students
- `GET /api/students` - Get all students (teacher/admin only)
- `GET /api/students/:id` - Get specific student

### Teachers
- `GET /api/teachers` - Get all teachers (admin only)
- `GET /api/teachers/:id` - Get specific teacher

### Marks
- `GET /api/marks/student/:studentId` - Get student marks
- `POST /api/marks` - Add new mark (teacher only)
- `PUT /api/marks/:id` - Update mark (teacher only)
- `DELETE /api/marks/:id` - Delete mark (teacher only)

### Claims
- `GET /api/claims` - Get all claims (teacher/admin only)
- `GET /api/claims/student/:studentId` - Get student claims
- `POST /api/claims` - Submit new claim (student only)
- `PUT /api/claims/:id/review` - Review claim (teacher/admin only)

### Bulletins
- `GET /api/bulletins/student/:studentId` - Get student bulletins
- `POST /api/bulletins` - Generate new bulletin (teacher/admin only)
- `GET /api/bulletins/:id` - Get specific bulletin

## Database Schema

### Users Table
- id, username, email, password, role (student/teacher/admin)
- first_name, last_name, date_of_birth (for students)
- grade (for students), subject (for teachers)
- created_at timestamp

### Marks Table
- id, student_id, teacher_id, subject, test_type
- score, max_score, semester, academic_year
- date, comments

### Claims Table
- id, student_id, mark_id, title, description
- status (pending/under_review/approved/rejected)
- reviewed_by, review_comments, submitted_at, reviewed_at

### Bulletins Table
- id, student_id, semester, academic_year
- overall_average, grade, attendance data
- generated_at, generated_by

### Bulletin Subjects & Marks Tables
- Related tables for storing detailed subject-wise data in bulletins

## Usage

1. Start both backend and frontend servers
2. Open browser to `http://localhost:3000`; use the Login link in the top-right navigation to sign in.
3. Register as a student or teacher
4. Login and access the appropriate dashboard

## Security Features

- JWT token-based authentication
- Password hashing with bcryptjs
- Role-based access control
- Input validation and sanitization
- CORS protection

## Development

The system is designed to be scalable and maintainable with:
- Modular route structure
- Reusable middleware
- Error handling
- Input validation
- Responsive UI design

## License

MIT
