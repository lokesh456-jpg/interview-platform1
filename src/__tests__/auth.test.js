const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/User');

describe('Auth Controller & Routes', () => {
  beforeAll(async () => {
    // If not connected, connect to test database or local
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/interviewai_test');
    }
  });

  afterAll(async () => {
    try {
      await User.deleteMany({ email: /test.*@example\.com/ });
      await mongoose.disconnect();
    } catch (_) {}
  });

  const testUser = {
    name: 'Test Candidate',
    email: `test_${Date.now()}@example.com`,
    password: 'Password123!',
  };

  it('should register a new candidate successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toHaveProperty('email', testUser.email.toLowerCase());
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('should prevent duplicate registration with same email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should reject invalid password format', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Short Pass',
        email: `invalid_${Date.now()}@example.com`,
        password: 'weak',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe(testUser.email.toLowerCase());
  });

  it('should reject incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'WrongPassword999!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should return health status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });
});
