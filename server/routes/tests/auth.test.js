const request = require('supertest');
const express = require('express');
const app = express();

// Mock a simple route for testing
app.get('/api/jobs', (req, res) => res.status(200).json({ status: 'OK' }));

describe('Server API Tests', () => {
  it('should INTENTIONALLY FAIL for HOD demonstration', async () => {
    const res = await request(app).get('/api/jobs');
    
    // 🚨 DELIBERATE FAILURE: We expect 500, but the API returns 200.
    // This will cause `npm test` to fail in the Jenkins pipeline.
    expect(res.statusCode).toEqual(500); 
    expect(res.body.status).toBe('OK');
  });
});
