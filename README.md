# Appointment System

A comprehensive appointment booking system built with Node.js, Express, and MongoDB. This system allows professors to set their availability and students to book appointments seamlessly.

## Features

- **User Authentication**: Secure signup and login for students and professors
- **Role-based Access**: Different permissions for students and professors
- **Availability Management**: Professors can set their available time slots
- **Appointment Booking**: Students can view and book available appointments
- **Appointment Management**: View, cancel, and manage appointments
- **Comprehensive Testing**: Full test coverage with Jest and Supertest

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB installation
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Manas-Trivedi/appointment-system
   cd appointment-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**

   Create a `.env` file in the root directory:
   ```env
   MONGO_CONN=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=3000
   ```

4. **Start the application**
   ```bash
   # Production mode
   npm start

   # Development mode (with auto-reload)
   npm run dev
   ```

The server will start on `http://localhost:3000`

## API Documentation

### Authentication Endpoints

#### Sign Up
```http
POST /auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Professor Endpoints

#### Set Availability
```http
POST /availability
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "date": "2025-06-30",
  "startTime": "09:00",
  "endTime": "10:00"
}
```

#### View Appointments
```http
GET /appointments/professor
Authorization: Bearer <jwt_token>
```

### Student Endpoints

#### Check Availability
```http
GET /availability?date=2025-06-30&professorId=<professor_id>
Authorization: Bearer <jwt_token>
```

#### Book Appointment
```http
POST /appointments
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "professorId": "<professor_id>",
  "availabilityId": "<availability_id>"
}
```

#### View My Appointments
```http
GET /appointments/student
Authorization: Bearer <jwt_token>
```

#### Cancel Appointment
```http
DELETE /appointments/<appointment_id>
Authorization: Bearer <jwt_token>
```

## Testing

This project includes comprehensive testing with Jest and Supertest.

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Coverage

The project maintains high test coverage across:
- **Authentication Tests**: User registration, login, JWT token generation
- **Availability Tests**: Professor availability creation, role-based access control
- **Appointment Tests**: Student booking, cancellation, double-booking prevention
- **Integration Tests**: Complete user journey from registration to appointment booking

**Current Coverage**: 84% statement coverage, 85% branch coverage

Coverage reports are generated in the `coverage/` directory. See `TESTING.md` for detailed testing documentation.

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Testing**: Jest, Supertest
- **Environment Management**: dotenv

## User Roles

### Students
- Create account and login
- View professor availability
- Book appointments
- View their appointments
- Cancel appointments

### Professors
- Create account and login
- Set availability slots
- View their appointments with students
- Manage their schedule

## Security Features

- **Password Hashing**: All passwords are hashed using bcryptjs
- **JWT Authentication**: Secure token-based authentication
- **Role-based Authorization**: Different permissions for students and professors
- **Input Validation**: Comprehensive validation for all inputs
- **Environment Variables**: Sensitive data stored securely

## Development

### Prerequisites for Development

- Node.js v14+
- MongoDB (local or Atlas)
- Git

### Setting up Development Environment

1. Fork and clone the repository
2. Install dependencies: `npm install`
3. Create `.env` file with required variables
4. Start development server: `npm run dev`
5. Run tests: `npm test`
