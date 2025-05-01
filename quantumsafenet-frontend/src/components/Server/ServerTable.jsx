import React, { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { FaEdit, FaTrash, FaRocket } from "react-icons/fa";
import ServerModal from "./ServerModal";
import { getData, deleteServer, startServer } from "../../apiService";

const ServerTable = () => {
  const [servers, setServers] = useState([]);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [config, setConfig] = useState(null);

  useEffect(() => {
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
    console.log("Servers", servers);
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentServer, setCurrentServer] = useState(null);

  const handleAdd = () => {
    setCurrentServer(null);
    setIsModalOpen(true);
  };

  const handleEdit = (server) => {
    setCurrentServer(server);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    try {
      deleteServer(id);
      setServers(servers.filter((server) => server.id !== id));
    } catch (error) {
      console.error('Error deleting server:', error);
      alert('Failed to delete server. Please try again.');
    }
  };

  const initializeServer = async (server_id) => {
    try {
      const response = await startServer(server_id);
      console.log("Server started: ", response);
    } catch (error) {
      console.error('Error starting server:', error);
    }
  };

  const handleSubmit = (server) => {
    console.log("Server submitted: ", server);
    if (!server) {
      alert("Server data is missing!");
      return;
    }
    setServers((prev) => {
      const index = prev.findIndex((s) => s.id === server.id);
      if (index !== -1) {
        const updated = [...prev];
        updated[index] = server;
        return updated;
      } else {
        return [...prev, server];
      }
    });
    setIsModalOpen(false);
  };

  return (
    <div className="overflow-x-auto rounded-lg shadow-lg">
      <div className="flex justify-between items-center p-4 bg-gray-100 border-b">
        <h2 className="text-lg font-semibold">Servers</h2>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          onClick={handleAdd}
        >
          Add Server
        </button>
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
                  <button className="mr-2" onClick={() => initializeServer(server.id)}>
                    <FaRocket className="text-green-500" />
                  </button>
                  <button className="mr-2" onClick={() => handleEdit(server)}>
                    <FaEdit className="text-blue-500" />
                  </button>
                  <button onClick={() => handleDelete(server.id)}>
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
      {isModalOpen && (
        <ServerModal
          userId={currentServer ? currentServer.id : null}
          server={currentServer}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
        />
      )}

      {/* Image Modal */}
      {isImageModalOpen && (
        <div
          className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={() => setIsImageModalOpen(false)} // Close modal on click outside
        >
          <div className="bg-white p-4 rounded-lg" onClick={(e) => e.stopPropagation()}>
          <QRCodeCanvas
            value={config}
            size={300}
            bgColor="#ffffff"
            fgColor="#000000"
            level="H"
          />
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
  );
};

export default ServerTable;
