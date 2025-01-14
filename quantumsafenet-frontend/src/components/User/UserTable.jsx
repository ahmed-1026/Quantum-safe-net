import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaQrcode } from "react-icons/fa";
import UserModal from "./UserModal";
import { getData, getVpnData } from "../../apiService";

const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [qrImage, setQrImage] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await getData('/user');
        console.log("Data: ", response?.data);
        setUsers(response?.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
    console.log("Users", users);
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const handleAdd = () => {
    setCurrentUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user) => {
    setCurrentUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setUsers(users.filter((user) => user.id !== id));
  };

  const handleQr = async (path) => {
    try {
      const response = await getVpnData('/generate-qr', path);
      console.log("Base64 Image: ", response); // For debugging
      setQrImage(response.data.qr_code_base64);
      setIsImageModalOpen(true);
    } catch (error) {
      console.error('Error fetching QR code:', error);
    }
  };

  const handleSubmit = (user) => {
    if (user.id) {
      // Update existing asset
      setUsers(users.map((u) => (u.id === user.id ? user : u)));
    } else {
      // Add new asset
      user.id = Date.now().toString();
      setUsers([...users, user]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="overflow-x-auto rounded-lg shadow-lg">
      <div className="flex justify-between items-center p-4 bg-gray-100 border-b">
        <h2 className="text-lg font-semibold">Users</h2>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          onClick={handleAdd}
        >
          Add User
        </button>
      </div>
      {users.length > 0 ? (
        <table className="min-w-full bg-white">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Role</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Name</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Email Id</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">User Status</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">User Assets</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Location</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Trust Score</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-100 border-b">
                <td className="py-3 px-4">{user.role}</td>
                <td className="py-3 px-4">{user.full_name}</td>
                <td className="py-3 px-4">{user.email}</td>
                <td className="py-3 px-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      user.is_active
                        ? "bg-green-200 text-green-800"
                        : "bg-red-200 text-red-800"
                    }`}
                  >
                    {user.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="py-3 px-4">{user.user_assets}</td>
                <td className="py-3 px-4">{user.location}</td>
                <td className="py-3 px-4">{user.trustscore}</td>
                <td className="py-3 px-4">
                  <button className="mr-2" onClick={() => handleQr(user.vpnconfig)}>
                    <FaQrcode className="text-blue-500" />
                  </button>
                  <button className="mr-2" onClick={() => handleEdit(user)}>
                    <FaEdit className="text-blue-500" />
                  </button>
                  <button onClick={() => handleDelete(user.id)}>
                    <FaTrash className="text-red-500" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="p-4 text-center text-gray-500">No users found.</div>
      )}
      {/* {isModalOpen && (
        <UserModal
          user={currentUser}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
        />
      )} */}

      {/* Image Modal */}
      {isImageModalOpen && (
        <div
          className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={() => setIsImageModalOpen(false)} // Close modal on click outside
        >
          <div className="bg-white p-4 rounded-lg" onClick={(e) => e.stopPropagation()}>
            <img
              src={qrImage}
              alt="QR Code"
              className="max-w-full max-h-full"
              style={{ width: "300px", height: "300px" }}
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

export default UserTable;
