import { useState, useEffect } from 'react'
import { Asset } from '../../types/asset'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from 'framer-motion'

type AssetModalProps = {
  asset: Asset | null
  onClose: () => void
  onSubmit: (asset: Asset) => void
}

export default function AssetModal({ asset, onClose, onSubmit }: AssetModalProps) {
  const [formData, setFormData] = useState<Asset>({
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
    if (asset) {
      setFormData(asset)
    }
  }, [asset])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative p-8 bg-white w-full max-w-md m-auto rounded-md shadow-lg"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 15 }}
        >
          <h2 className="text-2xl font-bold mb-4">{asset ? 'Edit Asset' : 'Add New Asset'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Asset Name</Label>
              <Input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="type">Asset Type</Label>
              <Input type="text" id="type" name="type" value={formData.type} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="credentials">Asset Credentials</Label>
              <Input type="text" id="credentials" name="credentials" value={formData.credentials} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="encryptionDetails">Encryption Details</Label>
              <Input type="text" id="encryptionDetails" name="encryptionDetails" value={formData.encryptionDetails} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="owner">Owner</Label>
              <Input type="text" id="owner" name="owner" value={formData.owner} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select name="status" value={formData.status} onValueChange={(value) => handleChange({ target: { name: 'status', value } } as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dateAdded">Date Added</Label>
              <Input type="date" id="dateAdded" name="dateAdded" value={formData.dateAdded} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="lastUpdated">Last Updated</Label>
              <Input type="date" id="lastUpdated" name="lastUpdated" value={formData.lastUpdated} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input type="date" id="expiryDate" name="expiryDate" value={formData.expiryDate} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="maintenanceSchedule">Maintenance Schedule</Label>
              <Input type="text" id="maintenanceSchedule" name="maintenanceSchedule" value={formData.maintenanceSchedule} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="physicalLocation">Physical Location</Label>
              <Input type="text" id="physicalLocation" name="physicalLocation" value={formData.physicalLocation} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="geographicZone">Geographic Zone</Label>
              <Input type="text" id="geographicZone" name="geographicZone" value={formData.geographicZone} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="hardwareSpecifications">Hardware Specifications</Label>
              <Input type="text" id="hardwareSpecifications" name="hardwareSpecifications" value={formData.hardwareSpecifications} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="bandwidthLimitations">Bandwidth Limitations</Label>
              <Input type="text" id="bandwidthLimitations" name="bandwidthLimitations" value={formData.bandwidthLimitations} onChange={handleChange} required />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {asset ? 'Update' : 'Add'} Asset
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

