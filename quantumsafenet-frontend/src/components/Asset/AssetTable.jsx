import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import AssetModal from './AssetModal'; // Import the AssetModal component
import assetsData from '../../data/assets.json'; // Import the assets data from JSON file

const AssetTable = () => {
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    setAssets(assetsData);
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAsset, setCurrentAsset] = useState(null);

  const handleAdd = () => {
    setCurrentAsset(null);
    setIsModalOpen(true);
  };

  const handleEdit = (asset) => {
    setCurrentAsset(asset);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setAssets(assets.filter(asset => asset.id !== id));
  };

  const handleSubmit = (asset) => {
    if (asset.id) {
      // Update existing asset
      setAssets(assets.map(a => (a.id === asset.id ? asset : a)));
    } else {
      // Add new asset
      asset.id = Date.now().toString();
      setAssets([...assets, asset]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="overflow-x-auto rounded-lg shadow-lg">
      <div className="flex justify-between items-center p-4 bg-gray-100 border-b">
        <h2 className="text-lg font-semibold">Assets</h2>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          onClick={handleAdd}
        >
          Add Asset
        </button>
      </div>
      <table className="min-w-full bg-white">
        <thead className="bg-gray-200">
          <tr>
            <th className="py-3 px-4 text-left font-semibold text-gray-700">Name</th>
            <th className="py-3 px-4 text-left font-semibold text-gray-700">Type</th>
            <th className="py-3 px-4 text-left font-semibold text-gray-700">Owner</th>
            <th className="py-3 px-4 text-left font-semibold text-gray-700">Status</th>
            <th className="py-3 px-4 text-left font-semibold text-gray-700">Location</th>
            <th className="py-3 px-4 text-left font-semibold text-gray-700">Expiry Date</th>
            <th className="py-3 px-4 text-left font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset, index) => (
            <tr key={asset.id} className="hover:bg-gray-100 border-b">
              <td className="py-3 px-4">{asset.name}</td>
              <td className="py-3 px-4">{asset.type}</td>
              <td className="py-3 px-4">{asset.owner}</td>
              <td className="py-3 px-4">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  asset.status === 'Active' ? 'bg-green-200 text-green-800' :
                  asset.status === 'Inactive' ? 'bg-red-200 text-red-800' :
                  'bg-yellow-200 text-yellow-800'
                }`}>
                  {asset.status}
                </span>
              </td>
              <td className="py-3 px-4">{asset.physicalLocation}</td>
              <td className="py-3 px-4">{asset.expiryDate}</td>
              <td className="py-3 px-4">
                <button className="mr-2" onClick={() => handleEdit(asset)}>
                  <FaEdit className="text-blue-500" />
                </button>
                <button onClick={() => handleDelete(asset.id)}>
                  <FaTrash className="text-red-500" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {isModalOpen && (
        <AssetModal
          asset={currentAsset}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default AssetTable;