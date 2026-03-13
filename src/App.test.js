import { render, screen } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  window.localStorage.clear();
  jest.restoreAllMocks();
});

test('renders role selection landing screen', () => {
  render(<App />);
  expect(screen.getByText(/HealthVault/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Continue as Patient/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Continue as Doctor/i })).toBeInTheDocument();
});

test('restores a persisted doctor session into the doctor portal shell', async () => {
  window.localStorage.setItem(
    'hv_app_session',
    JSON.stringify({
      token: 'demo-token',
      user: {
        role: 'DOCTOR',
        firstName: 'Arjun',
        lastName: 'Reddy',
      },
    }),
  );

  jest.spyOn(global, 'fetch').mockImplementation((url) => {
    if (String(url).includes('/doctors/me/dashboard')) {
      const body = {
        success: true,
        data: {
          profile: {
            firstName: 'Arjun',
            lastName: 'Reddy',
            specialty: 'Pulmonology',
            hospital: { name: 'HackSamrat Central Hospital' },
          },
          stats: {
            activeAccessGrants: 1,
            uploadedRecords: 1,
            verifications: 1,
          },
        },
      };

      return Promise.resolve({
        ok: true,
        text: async () => JSON.stringify(body),
      });
    }

    if (String(url).includes('/doctors/patients/search')) {
      return Promise.resolve({
        ok: true,
        text: async () => JSON.stringify({ success: true, data: { items: [] } }),
      });
    }

    return Promise.resolve({
      ok: true,
      text: async () => JSON.stringify({ success: true, data: {} }),
    });
  });

  render(<App />);

  expect(await screen.findByText(/HealthVault Clinical Portal/i)).toBeInTheDocument();
  expect(await screen.findByText(/Dr. Arjun Reddy/i)).toBeInTheDocument();
});
