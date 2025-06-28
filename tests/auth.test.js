const request = require('supertest');
const app = require('../app');
const User = require('../models/User');

describe('Authentication Tests', () => {
    describe('POST /auth/signup', () => {
        it('should create a new user successfully', async () => {
            const userData = {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123',
                role: 'student'
            };

            const response = await request(app)
                .post('/auth/signup')
                .send(userData)
                .expect(201);

            expect(response.body).toHaveProperty('message', 'User created successfully');
            expect(response.body).toHaveProperty('token');
            expect(response.body.user).toHaveProperty('name', 'John Doe');
            expect(response.body.user).toHaveProperty('role', 'student');
            expect(response.body.user).not.toHaveProperty('password');
        });

        it('should not create user with duplicate email', async () => {
            const userData = {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123',
                role: 'student'
            };

            // Create first user
            await request(app).post('/auth/signup').send(userData);

            // Try to create duplicate
            const response = await request(app)
                .post('/auth/signup')
                .send(userData)
                .expect(400);

            expect(response.body).toHaveProperty('error', 'User already exists');
        });

        it('should create professor user', async () => {
            const professorData = {
                name: 'Dr. Smith',
                email: 'dr.smith@example.com',
                password: 'password123',
                role: 'professor'
            };

            const response = await request(app)
                .post('/auth/signup')
                .send(professorData)
                .expect(201);

            expect(response.body.user).toHaveProperty('role', 'professor');
        });
    });

    describe('POST /auth/login', () => {
        beforeEach(async () => {
            // Create a test user
            await request(app).post('/auth/signup').send({
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                role: 'student'
            });
        });

        it('should login with valid credentials', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                })
                .expect(200);

            expect(response.body).toHaveProperty('token');
            expect(response.body.user).toHaveProperty('name', 'Test User');
        });

        it('should not login with invalid email', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'password123'
                })
                .expect(400);

            expect(response.body).toHaveProperty('error', 'User does not exist');
        });

        it('should not login with invalid password', async () => {
            const response = await request(app)
                .post('/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword'
                })
                .expect(400);

            expect(response.body).toHaveProperty('error', 'Invalid Credentials');
        });
    });
});
