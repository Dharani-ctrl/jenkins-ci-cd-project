const request = require('supertest');
const express = require('express');
const app = express();

// Mock a simple route for testing
app.get('/api/jobs', (req, res) => res.status(200).json({ status: 'OK' }));

describe('Server API Tests', () => {
  it('should return 200 for jobs check', async () => {
    const res = await request(app).get('/api/jobs');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toBe('OK');
  });
});
