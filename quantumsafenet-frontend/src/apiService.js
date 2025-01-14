import axios from 'axios';

const api = axios.create({
  baseURL: "http://67.205.164.192:8000/",
});

const vpnapi = axios.create({
  baseURL: "http://67.205.164.192:8002/",
});

// Example: Fetch data
export const getData = async (endpoint) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await api.get(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    console.error('API GET Error:', error);
    throw error;
  }
};

export const getVpnData = async (endpoint, path) => {
  try {
    const response = await vpnapi.post(endpoint+"?file_path="+path, {responseType: 'arraybuffer'});
    return response;
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
