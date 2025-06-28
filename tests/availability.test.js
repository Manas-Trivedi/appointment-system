const request = require('supertest');
const app = require('../app');

describe('Availability Tests', () => {
    let professorToken;
    let studentToken;
    let professorId;

    beforeEach(async () => {
        // Create professor
        const professorResponse = await request(app)
            .post('/auth/signup')
            .send({
                name: 'Dr. Smith',
                email: 'professor@example.com',
                password: 'password123',
                role: 'professor'
            });
        professorToken = professorResponse.body.token;
        professorId = professorResponse.body.user.id;

        // Create student
        const studentResponse = await request(app)
            .post('/auth/signup')
            .send({
                name: 'Student User',
                email: 'student@example.com',
                password: 'password123',
                role: 'student'
            });
        studentToken = studentResponse.body.token;
    });

    describe('POST /availability', () => {
        it('should allow professor to create availability', async () => {
            const availabilityData = {
                date: '2024-12-30',
                startTime: '09:00',
                endTime: '10:00'
            };

            const response = await request(app)
                .post('/availability')
                .set('Authorization', `Bearer ${professorToken}`)
                .send(availabilityData)
                .expect(201);

            expect(response.body).toHaveProperty('message', 'Availability set successfully');
            expect(response.body.availability).toHaveProperty('startTime', '09:00');
            expect(response.body.availability).toHaveProperty('endTime', '10:00');
        });

        it('should not allow student to create availability', async () => {
            const availabilityData = {
                date: '2024-12-30',
                startTime: '09:00',
                endTime: '10:00'
            };

            const response = await request(app)
                .post('/availability')
                .set('Authorization', `Bearer ${studentToken}`)
                .send(availabilityData)
                .expect(403);

            expect(response.body).toHaveProperty('error', 'Only professors can set availability');
        });

        it('should not allow overlapping availability slots', async () => {
            const availabilityData1 = {
                date: '2024-12-30',
                startTime: '09:00',
                endTime: '11:00'
            };

            const availabilityData2 = {
                date: '2024-12-30',
                startTime: '10:00',
                endTime: '12:00'
            };

            // Create first slot
            await request(app)
                .post('/availability')
                .set('Authorization', `Bearer ${professorToken}`)
                .send(availabilityData1)
                .expect(201);

            // Try to create overlapping slot
            const response = await request(app)
                .post('/availability')
                .set('Authorization', `Bearer ${professorToken}`)
                .send(availabilityData2)
                .expect(400);

            expect(response.body).toHaveProperty('error', 'Time slot overlaps with existing availability');
        });

        it('should require authentication', async () => {
            const availabilityData = {
                date: '2024-12-30',
                startTime: '09:00',
                endTime: '10:00'
            };

            await request(app)
                .post('/availability')
                .send(availabilityData)
                .expect(401);
        });
    });

    describe('GET /professor/:professorId/availability', () => {
        beforeEach(async () => {
            // Create some availability slots
            await request(app)
                .post('/availability')
                .set('Authorization', `Bearer ${professorToken}`)
                .send({
                    date: '2024-12-30',
                    startTime: '09:00',
                    endTime: '10:00'
                });

            await request(app)
                .post('/availability')
                .set('Authorization', `Bearer ${professorToken}`)
                .send({
                    date: '2024-12-30',
                    startTime: '11:00',
                    endTime: '12:00'
                });
        });

        it('should get available slots for professor', async () => {
            const response = await request(app)
                .get(`/professor/${professorId}/availability`)
                .set('Authorization', `Bearer ${studentToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('availableSlots');
            expect(response.body.availableSlots).toHaveLength(2);
            expect(response.body.availableSlots[0]).toHaveProperty('isBooked', false);
        });

        it('should require authentication', async () => {
            await request(app)
                .get(`/professor/${professorId}/availability`)
                .expect(401);
        });
    });
});
