import axios from 'axios';

// Replace '192.168.1.X' with your actual IPv4 Address from the ipconfig command.
// Keep the :3000 port exactly as it is!
const LOCAL_BACKEND_IP = '192.168.1.103'; 

export const apiClient = axios.create({
  baseURL: `http://${LOCAL_BACKEND_IP}:3000`,
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