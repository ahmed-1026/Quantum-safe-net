import axios from 'axios';

const api = axios.create({
  baseURL: "http://134.122.115.78:8000/",
});

const vpnapi = axios.create({
  baseURL: "http://134.122.115.78:8002/",
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
    const status = error?.response?.status;
    console.log("Error status: ", status)
    console.log("Error message: ", error?.response)
    if (status === 401 || status === 403) {
      handleUnauthorized();
    }
  }
};

export const createUser = async (userData) => {
  try {
    console.log("User data: ", userData);
    const token = localStorage.getItem('authToken');
    const response = await api.post("/user", userData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating user:", error.response?.data || error.message);
    // throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const token = localStorage.getItem('authToken');
    const response = await api.delete(`/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error.response?.data || error.message);
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

const handleUnauthorized = () => {
  localStorage.removeItem('AuthToken');
  localStorage.removeItem('tokenExpiry');
  localStorage.setItem("isAuthenticated", "false");
  window.location.href = '/';  // Redirect to login
};
export default api;
