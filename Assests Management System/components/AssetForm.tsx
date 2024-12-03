import { useState, useEffect } from 'react'
import { Asset } from '../../types/asset'

type AssetFormProps = {
  onSubmit: (asset: Asset) => void
  initialAsset?: Asset | null
}

export default function AssetForm({ onSubmit, initialAsset }: AssetFormProps) {
  const [asset, setAsset] = useState<Asset>({
    id: '',
    name: '',
    type: '',
    credentials: '',
    encryptionDetails: '',
    owner: '',
    status: 'Active',
    dateAdded: '',
    lastUpdated: '',
    expiryDate: '',
    maintenanceSchedule: '',
    physicalLocation: '',
    geographicZone: '',
    hardwareSpecifications: '',
    bandwidthLimitations: '',
  })

  useEffect(() => {
    if (initialAsset) {
      setAsset(initialAsset)
    }
  }, [initialAsset])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setAsset(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(asset)
    setAsset({
      id: '',
      name: '',
      type: '',
      credentials: '',
      encryptionDetails: '',
      owner: '',
      status: 'Active',
      dateAdded: '',
      lastUpdated: '',
      expiryDate: '',
      maintenanceSchedule: '',
      physicalLocation: '',
      geographicZone: '',
      hardwareSpecifications: '',
      bandwidthLimitations: '',
    })
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          name="name"
          value={asset.name}
          onChange={handleChange}
          placeholder="Asset Name"
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          name="type"
          value={asset.type}
          onChange={handleChange}
          placeholder="Asset Type"
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          name="credentials"
          value={asset.credentials}
          onChange={handleChange}
          placeholder="Asset Credentials"
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          name="encryptionDetails"
          value={asset.encryptionDetails}
          onChange={handleChange}
          placeholder="Encryption Details"
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          name="owner"
          value={asset.owner}
          onChange={handleChange}
          placeholder="Owner"
          className="border p-2 rounded"
          required
        />
        <select
          name="status"
          value={asset.status}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Maintenance">Maintenance</option>
        </select>
        <input
          type="date"
          name="dateAdded"
          value={asset.dateAdded}
          onChange={handleChange}
          placeholder="Date Added"
          className="border p-2 rounded"
          required
        />
        <input
          type="date"
          name="lastUpdated"
          value={asset.lastUpdated}
          onChange={handleChange}
          placeholder="Last Updated"
          className="border p-2 rounded"
          required
        />
        <input
          type="date"
          name="expiryDate"
          value={asset.expiryDate}
          onChange={handleChange}
          placeholder="Expiry Date"
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          name="maintenanceSchedule"
          value={asset.maintenanceSchedule}
          onChange={handleChange}
          placeholder="Maintenance Schedule"
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          name="physicalLocation"
          value={asset.physicalLocation}
          onChange={handleChange}
          placeholder="Physical Location"
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          name="geographicZone"
          value={asset.geographicZone}
          onChange={handleChange}
          placeholder="Geographic Zone"
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          name="hardwareSpecifications"
          value={asset.hardwareSpecifications}
          onChange={handleChange}
          placeholder="Hardware Specifications"
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          name="bandwidthLimitations"
          value={asset.bandwidthLimitations}
          onChange={handleChange}
          placeholder="Bandwidth Limitations"
          className="border p-2 rounded"
          required
        />
      </div>
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        {initialAsset ? 'Update Asset' : 'Add Asset'}
      </button>
    </form>
  )
}

