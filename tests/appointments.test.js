const request = require('supertest');
const app = require('../app');

describe('Appointment Tests', () => {
    let professorToken;
    let studentToken;
    let professorId;
    let studentId;
    let availabilityId;

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
        studentId = studentResponse.body.user.id;

        // Create availability slot
        const availabilityResponse = await request(app)
            .post('/availability')
            .set('Authorization', `Bearer ${professorToken}`)
            .send({
                date: '2024-12-30',
                startTime: '09:00',
                endTime: '10:00'
            });
        availabilityId = availabilityResponse.body.availability._id;
    });

    describe('POST /appointment/:slotId', () => {
        it('should allow student to book appointment', async () => {
            const response = await request(app)
                .post(`/appointment/${availabilityId}`)
                .set('Authorization', `Bearer ${studentToken}`)
                .send({ slotId: availabilityId })
                .expect(201);

            expect(response.body).toHaveProperty('message', 'Appointment booked successfully');
            expect(response.body.appointment).toHaveProperty('status', 'booked');
            expect(response.body.appointment).toHaveProperty('studentId', studentId);
            expect(response.body.appointment).toHaveProperty('professorId', professorId);
        });

        it('should not allow professor to book appointment', async () => {
            const response = await request(app)
                .post(`/appointment/${availabilityId}`)
                .set('Authorization', `Bearer ${professorToken}`)
                .send({ slotId: availabilityId })
                .expect(400);

            expect(response.body).toHaveProperty('error', 'Only students can book assignments');
        });

        it('should not allow booking already booked slot', async () => {
            // First booking
            await request(app)
                .post(`/appointment/${availabilityId}`)
                .set('Authorization', `Bearer ${studentToken}`)
                .send({ slotId: availabilityId })
                .expect(201);

            // Create another student
            const student2Response = await request(app)
                .post('/auth/signup')
                .send({
                    name: 'Student 2',
                    email: 'student2@example.com',
                    password: 'password123',
                    role: 'student'
                });

            // Try to book same slot
            const response = await request(app)
                .post(`/appointment/${availabilityId}`)
                .set('Authorization', `Bearer ${student2Response.body.token}`)
                .send({ slotId: availabilityId })
                .expect(400);

            expect(response.body).toHaveProperty('error', 'Slot unavailable');
        });

        it('should require authentication', async () => {
            await request(app)
                .post(`/appointment/${availabilityId}`)
                .send({ slotId: availabilityId })
                .expect(401);
        });
    });

    describe('GET /appointments', () => {
        beforeEach(async () => {
            // Book an appointment
            await request(app)
                .post(`/appointment/${availabilityId}`)
                .set('Authorization', `Bearer ${studentToken}`)
                .send({ slotId: availabilityId });
        });

        it('should get appointments for student', async () => {
            const response = await request(app)
                .get('/appointments')
                .set('Authorization', `Bearer ${studentToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('appointments');
            expect(response.body.appointments).toHaveLength(1);
            expect(response.body.appointments[0]).toHaveProperty('studentId', studentId);
            expect(response.body.appointments[0]).toHaveProperty('professorId');
            expect(response.body.appointments[0].professorId).toHaveProperty('name', 'Dr. Smith');
        });

        it('should get appointments for professor', async () => {
            const response = await request(app)
                .get('/appointments')
                .set('Authorization', `Bearer ${professorToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('appointments');
            expect(response.body.appointments).toHaveLength(1);
            expect(response.body.appointments[0]).toHaveProperty('professorId', professorId);
            expect(response.body.appointments[0]).toHaveProperty('studentId');
            expect(response.body.appointments[0].studentId).toHaveProperty('name', 'Student User');
        });

        it('should require authentication', async () => {
            await request(app)
                .get('/appointments')
                .expect(401);
        });
    });

    describe('DELETE /appointments/:appointmentId', () => {
        let appointmentId;

        beforeEach(async () => {
            // Book an appointment
            const bookingResponse = await request(app)
                .post(`/appointment/${availabilityId}`)
                .set('Authorization', `Bearer ${studentToken}`)
                .send({ slotId: availabilityId });
            appointmentId = bookingResponse.body.appointment._id;
        });

        it('should allow professor to cancel appointment', async () => {
            const response = await request(app)
                .delete(`/appointments/${appointmentId}`)
                .set('Authorization', `Bearer ${professorToken}`)
                .expect(201);

            expect(response.body).toHaveProperty('message', 'Appointment cancelled successfully');

            // Verify availability slot is now free
            const availabilityResponse = await request(app)
                .get(`/professor/${professorId}/availability`)
                .set('Authorization', `Bearer ${studentToken}`)
                .expect(200);

            expect(availabilityResponse.body.availableSlots).toHaveLength(1);
            expect(availabilityResponse.body.availableSlots[0]).toHaveProperty('isBooked', false);
        });

        it('should not allow student to cancel appointment', async () => {
            const response = await request(app)
                .delete(`/appointments/${appointmentId}`)
                .set('Authorization', `Bearer ${studentToken}`)
                .expect(400);

            expect(response.body).toHaveProperty('error', 'Only professors can cancel appointments');
        });

        it('should require authentication', async () => {
            await request(app)
                .delete(`/appointments/${appointmentId}`)
                .expect(401);
        });
    });
});
