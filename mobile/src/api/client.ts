import axios from 'axios';

// In production (Vercel), EXPO_PUBLIC_API_URL will be your live Render URL.
// In local development, it safely falls back to your local machine's IP.
const baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.103:3000';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Adding a slight timeout prevents the app from hanging forever if the server goes down
  timeout: 10000, 
});

// Optional: A quick console log to catch network errors during development
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Network Error:', error.message);
    return Promise.reject(error);
  }
);