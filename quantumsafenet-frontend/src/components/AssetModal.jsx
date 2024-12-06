import React, { useState, useEffect } from 'react';

const AssetModal = ({ asset, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    type: '',
    owner: '',
    status: 'Active',
    physicalLocation: '',
    expiryDate: '',
    credentials: '',
    encryptionDetails: '',
    dateAdded: '',
    lastUpdated: '',
    maintenanceSchedule: '',
    geographicZone: '',
    hardwareSpecifications: '',
    bandwidthLimitations: '',
  });

  useEffect(() => {
    if (asset) {
      setFormData(asset);
    }
  }, [asset]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-full overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">{asset ? 'Edit Asset' : 'Add New Asset'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Asset Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Asset Type</label>
            <input
              type="text"
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label htmlFor="credentials" className="block text-sm font-medium text-gray-700">Asset Credentials</label>
            <input
              type="text"
              id="credentials"
              name="credentials"
              value={formData.credentials}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label htmlFor="encryptionDetails" className="block text-sm font-medium text-gray-700">Encryption Details</label>
            <input
              type="text"
              id="encryptionDetails"
              name="encryptionDetails"
              value={formData.encryptionDetails}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label htmlFor="owner" className="block text-sm font-medium text-gray-700">Owner</label>
            <input
              type="text"
              id="owner"
              name="owner"
              value={formData.owner}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
          <div>
            <label htmlFor="dateAdded" className="block text-sm font-medium text-gray-700">Date Added</label>
            <input
              type="date"
              id="dateAdded"
              name="dateAdded"
              value={formData.dateAdded}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label htmlFor="lastUpdated" className="block text-sm font-medium text-gray-700">Last Updated</label>
            <input
              type="date"
              id="lastUpdated"
              name="lastUpdated"
              value={formData.lastUpdated}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">Expiry Date</label>
            <input
              type="date"
              id="expiryDate"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label htmlFor="maintenanceSchedule" className="block text-sm font-medium text-gray-700">Maintenance Schedule</label>
            <input
              type="text"
              id="maintenanceSchedule"
              name="maintenanceSchedule"
              value={formData.maintenanceSchedule}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label htmlFor="physicalLocation" className="block text-sm font-medium text-gray-700">Physical Location</label>
            <input
              type="text"
              id="physicalLocation"
              name="physicalLocation"
              value={formData.physicalLocation}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label htmlFor="geographicZone" className="block text-sm font-medium text-gray-700">Geographic Zone</label>
            <input
              type="text"
              id="geographicZone"
              name="geographicZone"
              value={formData.geographicZone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label htmlFor="hardwareSpecifications" className="block text-sm font-medium text-gray-700">Hardware Specifications</label>
            <input
              type="text"
              id="hardwareSpecifications"
              name="hardwareSpecifications"
              value={formData.hardwareSpecifications}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label htmlFor="bandwidthLimitations" className="block text-sm font-medium text-gray-700">Bandwidth Limitations</label>
            <input
              type="text"
              id="bandwidthLimitations"
              name="bandwidthLimitations"
              value={formData.bandwidthLimitations}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
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
              {asset ? 'Update' : 'Add'} Asset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssetModal;