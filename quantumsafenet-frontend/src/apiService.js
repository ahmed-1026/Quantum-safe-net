import axios from 'axios';

const api = axios.create({
  baseURL: "https://2e6c-111-68-102-12.ngrok-free.app",
});

// Example: Fetch data
export const getData = async (endpoint) => {
  try {
    const response = await api.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('API GET Error:', error);
    throw error;
  }
};

// Example: Post data
export const postData = async (endpoint, payload) => {
  try {
    const response = await api.post(endpoint, payload);
    return response.data;
  } catch (error) {
    // console.error('API POST Error:', error);
    const message = error?.response?.data?.detail;
    console.log("Error message: ", message)
    return error;
  }
};

// Login API
export const login = async (creds) => {
  try {
    const formData = new URLSearchParams();
    formData.append('grant_type', 'password');
    formData.append('username', creds["email"]);
    formData.append('password', creds["password"]); 
    formData.append('scope', '');
    formData.append('client_id', 'string');
    formData.append('client_secret', 'string');
    const response = await api.post('/login', formData, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              Accept: 'application/json',
            },
          })
      return response
    } catch (err) {
        console.log(err.response?.data?.detail || 'An error occurred. Please try again.');
    } finally {
    }
  };

export default api;
