// src/components/Dashboard.jsx
import React, {useState, useEffect} from 'react';
import { getData } from '../../apiService';


const Dashboard = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
      const fetchUsers = async () => {
        try {
          const response = await getData('/account/me');
          console.log("email: ", response?.data?.email);
          setUser(response?.data);
        } catch (error) {
          console.error('Error fetching users:', error);
        }
      };
  
      fetchUsers();
    }, []);
  return <div>
    Welcome <strong>{user?.full_name}</strong> to the Dashboard!
    {/* Online Users Count */}
    {/* <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        <span className="text-gray-600 text-sm">Online Users</span>
        <span className="text-lg font-bold">0</span>
      </div>
    </div> */}


  </div>;
};


export default Dashboard;