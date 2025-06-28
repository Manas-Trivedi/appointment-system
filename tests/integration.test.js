const request = require('supertest');
const app = require('../app');

describe('API Integration Tests', () => {
    it('should return API message on root endpoint', async () => {
        const response = await request(app)
            .get('/')
            .expect(200);

        expect(response.body).toHaveProperty('message', 'Appointment system API');
    });

    it('should handle 404 for unknown endpoints', async () => {
        await request(app)
            .get('/unknown-endpoint')
            .expect(404);
    });

    describe('Complete User Journey', () => {
        it('should complete full appointment booking flow', async () => {
            // 1. Create professor
            const professorResponse = await request(app)
                .post('/auth/signup')
                .send({
                    name: 'Dr. Johnson',
                    email: 'dr.johnson@university.edu',
                    password: 'securepass123',
                    role: 'professor'
                })
                .expect(201);

            const professorToken = professorResponse.body.token;
            const professorId = professorResponse.body.user.id;

            // 2. Create student
            const studentResponse = await request(app)
                .post('/auth/signup')
                .send({
                    name: 'Alice Smith',
                    email: 'alice@student.edu',
                    password: 'studentpass123',
                    role: 'student'
                })
                .expect(201);

            const studentToken = studentResponse.body.token;

            // 3. Professor sets availability
            const availabilityResponse = await request(app)
                .post('/availability')
                .set('Authorization', `Bearer ${professorToken}`)
                .send({
                    date: '2024-12-30',
                    startTime: '14:00',
                    endTime: '15:00'
                })
                .expect(201);

            const availabilityId = availabilityResponse.body.availability._id;

            // 4. Student checks available slots
            const slotsResponse = await request(app)
                .get(`/professor/${professorId}/availability`)
                .set('Authorization', `Bearer ${studentToken}`)
                .expect(200);

            expect(slotsResponse.body.availableSlots).toHaveLength(1);
            expect(slotsResponse.body.availableSlots[0].isBooked).toBe(false);

            // 5. Student books appointment
            const appointmentResponse = await request(app)
                .post(`/appointment/${availabilityId}`)
                .set('Authorization', `Bearer ${studentToken}`)
                .send({ slotId: availabilityId })
                .expect(201);

            const appointmentId = appointmentResponse.body.appointment._id;

            // 6. Verify slot is now booked
            const updatedSlotsResponse = await request(app)
                .get(`/professor/${professorId}/availability`)
                .set('Authorization', `Bearer ${studentToken}`)
                .expect(200);

            expect(updatedSlotsResponse.body.availableSlots).toHaveLength(0);

            // 7. Student views their appointments
            const studentAppointmentsResponse = await request(app)
                .get('/appointments')
                .set('Authorization', `Bearer ${studentToken}`)
                .expect(200);

            expect(studentAppointmentsResponse.body.appointments).toHaveLength(1);
            expect(studentAppointmentsResponse.body.appointments[0].professorId.name).toBe('Dr. Johnson');

            // 8. Professor views their appointments
            const professorAppointmentsResponse = await request(app)
                .get('/appointments')
                .set('Authorization', `Bearer ${professorToken}`)
                .expect(200);

            expect(professorAppointmentsResponse.body.appointments).toHaveLength(1);
            expect(professorAppointmentsResponse.body.appointments[0].studentId.name).toBe('Alice Smith');

            // 9. Professor cancels appointment
            await request(app)
                .delete(`/appointments/${appointmentId}`)
                .set('Authorization', `Bearer ${professorToken}`)
                .expect(201);

            // 10. Verify slot is available again
            const finalSlotsResponse = await request(app)
                .get(`/professor/${professorId}/availability`)
                .set('Authorization', `Bearer ${studentToken}`)
                .expect(200);

            expect(finalSlotsResponse.body.availableSlots).toHaveLength(1);
            expect(finalSlotsResponse.body.availableSlots[0].isBooked).toBe(false);
        });
    });
});
