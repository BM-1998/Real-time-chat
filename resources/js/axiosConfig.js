import axios from 'axios';

// Set the base URL for all requests
axios.defaults.baseURL = 'http://127.0.0.1:8000';

// Include credentials (cookies) with each request
axios.defaults.withCredentials = true;

// Fetch CSRF token to start session (only needed once at the beginning)
export const initAxios = async () => {
    await axios.get('/sanctum/csrf-cookie');
};

export default axios;
