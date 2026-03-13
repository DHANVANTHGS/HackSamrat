const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { once } = require('node:events');

const { app } = require('../src/app');

let server;
let baseUrl;

test.before(async () => {
  server = http.createServer(app);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

test.after(async () => {
  if (!server) {
    return;
  }

  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
});

test('health endpoint responds ok', async () => {
  const response = await fetch(`${baseUrl}/health`);
  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.success, true);
  assert.equal(payload.data.status, 'ok');
});

test('doctor login issues a bearer session', async () => {
  const response = await fetch(`${baseUrl}/api/v1/auth/doctor/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'doctor.demo@hacksamrat.local',
      password: 'Doctor@123',
    }),
  });

  assert.equal(response.status, 200);
  const payload = await response.json();
  assert.equal(payload.success, true);
  assert.equal(payload.data.tokenType, 'Bearer');
  assert.equal(payload.data.user.email, 'doctor.demo@hacksamrat.local');
});

test('doctor dashboard is reachable with issued token', async () => {
  const loginResponse = await fetch(`${baseUrl}/api/v1/auth/doctor/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'doctor.demo@hacksamrat.local',
      password: 'Doctor@123',
    }),
  });

  const loginPayload = await loginResponse.json();
  const token = loginPayload.data.token;

  const dashboardResponse = await fetch(`${baseUrl}/api/v1/doctors/me/dashboard`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  assert.equal(dashboardResponse.status, 200);
  const dashboardPayload = await dashboardResponse.json();
  assert.equal(dashboardPayload.success, true);
  assert.equal(dashboardPayload.data.profile.email, 'doctor.demo@hacksamrat.local');
});
