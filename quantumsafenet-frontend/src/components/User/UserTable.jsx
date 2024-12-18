import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import UserModal from "./UserModal"; // Import the UserModal component
import usersData from "../../data/users.json"; // Import the user data from JSON file

const UserTable = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    setUsers(usersData);
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
      <table className="min-w-full bg-white">
        <thead className="bg-gray-200">
          <tr>
            <th className="py-3 px-4 text-left font-semibold text-gray-700">
              Role
            </th>
            <th className="py-3 px-4 text-left font-semibold text-gray-700">
              Name
            </th>
            <th className="py-3 px-4 text-left font-semibold text-gray-700">
              Email Id
            </th>
            <th className="py-3 px-4 text-left font-semibold text-gray-700">
              User Status
            </th>
            <th className="py-3 px-4 text-left font-semibold text-gray-700">
              Account Status
            </th>
            <th className="py-3 px-4 text-left font-semibold text-gray-700">
              Account Verification
            </th>
            <th className="py-3 px-4 text-left font-semibold text-gray-700">
              User Assets
            </th>
            <th className="py-3 px-4 text-left font-semibold text-gray-700">
              Location
            </th>
            <th className="py-3 px-4 text-left font-semibold text-gray-700">
              Expiry Date
            </th>
            <th className="py-3 px-4 text-left font-semibold text-gray-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={user.id} className="hover:bg-gray-100 border-b">
              <td className="py-3 px-4">{user.role}</td>
              <td className="py-3 px-4">{user.username}</td>
              <td className="py-3 px-4">{user.emailId}</td>
              <td className="py-3 px-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    user.user_status === "Active"
                      ? "bg-green-200 text-green-800"
                      : user.user_status === "Inactive"
                      ? "bg-red-200 text-red-800"
                      : "bg-yellow-200 text-yellow-800"
                  }`}
                >
                  {user.user_status}
                </span>
              </td>
              <td className="py-3 px-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    user.account_status === "Blocked"
                      ? "bg-green-200 text-green-800"
                      : user.account_status === "Active"
                      ? "bg-red-200 text-red-800"
                      : "bg-yellow-200 text-yellow-800"
                  }`}
                >
                  {user.account_status}
                </span>
              </td>
              <td className="py-3 px-4 ">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    user.account_verify === "Verified"
                      ? "bg-green-200 text-green-800"
                      : user.account_verify === "Unverified"
                      ? "bg-red-200 text-red-800"
                      : user.account_verify === "Pending"
                      ? "bg-blue-200 text-blue-800"
                      : "bg-yellow-200 text-yellow-800"
                  }`}
                >
                  {user.account_verify}
                </span>
              </td>
              <td className="py-3 px-4">{user.user_assets}</td>
              <td className="py-3 px-4">{user.physicalLocation}</td>
              <td className="py-3 px-4">{user.expiryDate}</td>
              <td className="py-3 px-4">
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
      {isModalOpen && (
        <UserModal
          user={currentUser}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default UserTable;
