# Appointment System Testing

This project now includes comprehensive testing with Jest and Supertest.

## Test Setup

The testing environment has been configured with:

- **Jest**: Testing framework
- **Supertest**: HTTP endpoint testing
- **Test Database**: Separate MongoDB test database
- **Environment Isolation**: Test-specific environment variables

## Test Structure

### Test Files

- `tests/auth.test.js` - Authentication (login/signup) tests
- `tests/availability.test.js` - Professor availability management tests
- `tests/appointments.test.js` - Appointment booking and management tests
- `tests/integration.test.js` - End-to-end workflow tests

### Test Configuration

- `jest.config.json` - Jest configuration
- `tests/setup.js` - Database setup and cleanup
- `tests/env-setup.js` - Environment variables setup
- `.env.test` - Test environment variables

## Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npx jest tests/auth.test.js
```

## Test Coverage

Current test coverage:
- Statement Coverage: 84%
- Branch Coverage: 85.29%
- Function Coverage: 71.42%
- Line Coverage: 84%

## Test Features

### Authentication Tests
- User registration (student and professor)
- User login with valid/invalid credentials
- Duplicate email handling
- JWT token generation

### Availability Tests
- Professor availability creation
- Role-based access control
- Time slot overlap validation
- Availability retrieval

### Appointment Tests
- Student appointment booking
- Appointment cancellation by professors
- Double-booking prevention
- User-specific appointment viewing

### Integration Tests
- Complete user journey from registration to appointment booking
- API endpoint availability
- Error handling

## Database Management

Tests use a separate test database to avoid interfering with development data:
- Test database: `mongodb://127.0.0.1:27017/appointment-system-test`
- Database is cleaned after each test
- Connection is properly closed after test completion

## Environment Variables

Test environment uses `.env.test` with:
- `NODE_ENV=test`
- `MONGO_TEST_URI` for test database
- `JWT_SECRET` for test JWT tokens
- `PORT=3001` for test server

## Note

Tests run sequentially (`--runInBand`) to avoid database conflicts between parallel test executions.
