import React, { useState, useEffect } from "react";
import { createServer, updateServer } from "../../apiService";

const ServerModal = ({ serverId, server, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    server_name: "",
    server_ip: "",
    server_port: "",
    is_active: true
  });

  useEffect(() => {
    if (server) {
      setFormData(server);
    }
  }, [server]);

  const handleChange = (u) => {
    const { name, value } = u.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (u) => {
    u.preventDefault();
    var responseServer = null;
    if (serverId) {
      responseServer = await updateServer(serverId, formData);
    }
    else {
      responseServer = await createServer(formData);
    }
    onSubmit(responseServer);
  };
  // console.log("Current formData:", formData);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-full overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">
          {server ? "Edit Server" : "Add New Server"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="server_name"
              className="block text-sm font-medium text-gray-700"
            >
              Server Name
            </label>
            <input
              type="text"
              id="server_name"
              name="server_name"
              value={formData.server_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label
              htmlFor="server_ip"
              className="block text-sm font-medium text-gray-700"
            >
              Server IP
            </label>
            <input
              type="text"
              id="server_ip"
              name="server_ip"
              value={formData.server_ip}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label
              htmlFor="server_port"
              className="block text-sm font-medium text-gray-700"
            >
              Server Port
            </label>
            <input
              type="text"
              id="server_port"
              name="server_port"
              value={formData.server_port}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label
              htmlFor="is_active"
              className="block text-sm font-medium text-gray-700"
            >
              Server Status
            </label>
            <select
              id="is_active"
              name="is_active"
              value={formData.is_active}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          {/* <div>
            <label
              htmlFor="account_status"
              className="block text-sm font-medium text-gray-700"
            >
              Account Status
            </label>
            <select
              id="account_status"
              name="account_status"
              value={formData.account_status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="Blocked">Blocked</option>
              <option value="Active">Active</option>
            </select>
          </div> */}
          {/* <div>
            <label
              htmlFor="account_verify"
              className="block text-sm font-medium text-gray-700"
            >
              Account Verification
            </label>
            <select
              id="account_verify"
              name="account_verify"
              value={formData.account_verify}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="Verified">Verified</option>
              <option value="Unverified">Unverified</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="user_assets"
              className="block text-sm font-medium text-gray-700"
            >
              User Assets
            </label>
            <input
              type="text"
              id="user_assets"
              name="user_assets"
              value={formData.user_assets}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label
              htmlFor="credentials"
              className="block text-sm font-medium text-gray-700"
            >
              User Credentials
            </label>
            <input
              type="text"
              id="credentials"
              name="credentials"
              value={formData.credentials}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label
              htmlFor="encryptionDetails"
              className="block text-sm font-medium text-gray-700"
            >
              Encryption Details
            </label>
            <input
              type="text"
              id="encryptionDetails"
              name="encryptionDetails"
              value={formData.encryptionDetails}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label
              htmlFor="dateAdded"
              className="block text-sm font-medium text-gray-700"
            >
              Date Added
            </label>
            <input
              type="date"
              id="dateAdded"
              name="dateAdded"
              value={formData.dateAdded}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label
              htmlFor="lastUpdated"
              className="block text-sm font-medium text-gray-700"
            >
              Last Updated
            </label>
            <input
              type="date"
              id="lastUpdated"
              name="lastUpdated"
              value={formData.lastUpdated}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label
              htmlFor="expiryDate"
              className="block text-sm font-medium text-gray-700"
            >
              Expiry Date
            </label>
            <input
              type="date"
              id="expiryDate"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label
              htmlFor="maintenanceSchedule"
              className="block text-sm font-medium text-gray-700"
            >
              Maintenance Schedule
            </label>
            <input
              type="text"
              id="maintenanceSchedule"
              name="maintenanceSchedule"
              value={formData.maintenanceSchedule}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label
              htmlFor="physicalLocation"
              className="block text-sm font-medium text-gray-700"
            >
              Physical Location
            </label>
            <input
              type="text"
              id="physicalLocation"
              name="physicalLocation"
              value={formData.physicalLocation}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label
              htmlFor="geographicZone"
              className="block text-sm font-medium text-gray-700"
            >
              Geographic Zone
            </label>
            <input
              type="text"
              id="geographicZone"
              name="geographicZone"
              value={formData.geographicZone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label
              htmlFor="hardwareSpecifications"
              className="block text-sm font-medium text-gray-700"
            >
              Hardware Specifications
            </label>
            <input
              type="text"
              id="hardwareSpecifications"
              name="hardwareSpecifications"
              value={formData.hardwareSpecifications}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label
              htmlFor="bandwidthLimitations"
              className="block text-sm font-medium text-gray-700"
            >
              Bandwidth Limitations
            </label>
            <input
              type="text"
              id="bandwidthLimitations"
              name="bandwidthLimitations"
              value={formData.bandwidthLimitations}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div> */}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              {server ? "Update" : "Add"} Server
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServerModal;
