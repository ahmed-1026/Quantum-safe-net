// src/components/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { FaQrcode, FaCog, FaTrash } from "react-icons/fa";
import { getData, postData, deleteData } from "../../apiService";


const EmployeeDashboard = () => {
  const [user, setUser] = useState(null);
  const [servers, setServers] = useState([]);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [config, setConfig] = useState(null);
  const [configId, setConfigId] = useState(null);

  useEffect(() => {
      const fetchUsers = async () => {
        try {
          const response = await getData('/account/me');
          console.log("Data: ", response?.data);
          setUser(response?.data);
        } catch (error) {
          console.error('Error fetching users:', error);
        }
      };
      const fetchServers = async () => {
        try {
          const response = await getData('/server');
          console.log("Data: ", response?.data);
          setServers(response?.data);
        } catch (error) {
          console.error('Error fetching servers:', error);
        }
      };
  
      fetchServers();
  
      fetchUsers();
    }, []);

  
  const [currentServer, setCurrentServer] = useState(null);

  const wireguardCong = async (server_id) => {
    console.log("Server ID: ", server_id);
    var server = servers.find((server) => server.id === server_id);
    setCurrentServer(server);
    try {
      const response = await getData(`/wgkey/${server_id}/config`);
      console.log("Data: ", response?.data);
      console.log("Config: ", response?.data.configuration);
      setConfig(response?.data.configuration);
      setConfigId(response?.data.id);
      setIsImageModalOpen(true);
    } catch (error) {
      console.error('Error fetching server config:', error);
    }
  }

  const addWireguardConfig = async (server_id) => {
    console.log("Server ID: ", server_id);
    var server = servers.find((server) => server.id === server_id);
    setCurrentServer(server);
    try {
      const response = await postData(`/wgkey`, {
        "server_id": server_id
      });
      console.log("Data: ", response?.data.configuration);
      setConfig(response?.data.configuration);
      setIsImageModalOpen(false);
    } catch (error) {
      console.error('Error fetching server config:', error);
    }
  }

  const deleteWireguardConfig = async (server_id) => {
    console.log("Server ID: ", server_id);
    var server = servers.find((server) => server.id === server_id);
    setCurrentServer(server);
    try {
      const response = await deleteData(`/wgkey/${configId}`);
      console.log("Data: ", response?.data);
      setConfig(null);
      setIsImageModalOpen(false);
    } catch (error) {
      console.error('Error deleting server config:', error);
    }
  }

  return <div>
    Welcome to the Dashboard!
    <h1 className="text-2xl font-bold">Welcome, {user?.full_name || 'User'}!</h1>
    <p className="text-gray-600">Your role: {user?.role || 'N/A'}</p>
    <div className="overflow-x-auto rounded-lg shadow-lg">
      <div className="flex justify-between items-center p-4 bg-gray-100 border-b">
        <h2 className="text-lg font-semibold">Servers</h2>
      </div>
      {servers.length > 0 ? (
        <table className="min-w-full bg-white">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Name</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">IP</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Port</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Is Active</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Location</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {servers.map((server) => (
              <tr key={server.id} className="hover:bg-gray-100 border-b">
                <td className="py-3 px-4">{server.server_name}</td>
                <td className="py-3 px-4">{server.server_ip}</td>
                <td className="py-3 px-4">{server.server_port}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      server.is_active
                        ? "bg-green-200 text-green-800"
                        : "bg-red-200 text-red-800"
                    }`}
                  >
                    {server.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="py-3 px-4">{server.server_location}</td>
                <td className="py-3 px-4">
                  <button className="mr-2" onClick={() => wireguardCong(server.id)}>
                    <FaCog className="text-green-500" />
                  </button>
                  <button className="mr-2" onClick={() => deleteWireguardConfig(server.id)}>
                    <FaTrash className="text-red-500" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="p-4 text-center text-gray-500">No servers found.</div>
      )}

      {/* Image Modal */}
      {isImageModalOpen && (
        <div
          className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={() => setIsImageModalOpen(false)} // Close modal on click outside
        >
          <div className="bg-white p-4 rounded-lg" onClick={(e) => e.stopPropagation()}>
          {config ? (<QRCodeCanvas
            value={config}
            size={300}
            bgColor="#ffffff"
            fgColor="#000000"
            level="H"
          />) : (
            <div className="text-center">
              <p className="text-gray-700">You do not have wireguard configuration for {currentServer.server_name}</p>
              <button
                className="bg-blue-500 text-white px-4 py-2 mt-4 rounded-md hover:bg-blue-600"
                onClick={() => addWireguardConfig(currentServer.id)}
              >
                Add Wireguard Config
              </button>
            </div>
          )}
            <button
              className="bg-red-500 text-white px-4 py-2 mt-4 rounded-md hover:bg-red-600"
              onClick={() => setIsImageModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  </div>;
};


export default EmployeeDashboard;