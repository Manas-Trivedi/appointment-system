const mongoose = require('mongoose');

// Setup test database
beforeAll(async () => {
    // Close any existing connections
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }

    const url = process.env.MONGO_TEST_URI || 'mongodb://127.0.0.1:27017/appointment-system-test';
    await mongoose.connect(url);
});

// Clean up database after each test
afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
    }
});

// Close database connection after all tests
afterAll(async () => {
    await mongoose.connection.close();
});
