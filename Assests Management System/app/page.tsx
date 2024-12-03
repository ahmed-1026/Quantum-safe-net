'use client'

import { useState } from 'react'
import { Asset } from '../types/asset'
import AssetTable from '../components/AssetTable'
import AssetModal from '../components/AssetModal'
import { Button } from "@/components/ui/button"
import { motion } from 'framer-motion'
import { FaPlus } from 'react-icons/fa'

const initialAssets: Asset[] = [
  {
    id: "1",
    name: "Server 001",
    type: "Hardware",
    credentials: "admin:password123",
    encryptionDetails: "AES-256",
    owner: "IT Department",
    status: "Active",
    dateAdded: "2023-01-01",
    lastUpdated: "2023-06-01",
    expiryDate: "2024-01-01",
    maintenanceSchedule: "Monthly",
    physicalLocation: "Server Room A",
    geographicZone: "North America",
    hardwareSpecifications: "Intel Xeon, 64GB RAM, 2TB SSD",
    bandwidthLimitations: "10 Gbps"
  },
  {
    id: "2",
    name: "Firewall 001",
    type: "Network",
    credentials: "admin:firewall123",
    encryptionDetails: "RSA-2048",
    owner: "Security Team",
    status: "Active",
    dateAdded: "2023-02-15",
    lastUpdated: "2023-05-20",
    expiryDate: "2025-02-15",
    maintenanceSchedule: "Quarterly",
    physicalLocation: "Network Room B",
    geographicZone: "Europe",
    hardwareSpecifications: "Cisco ASA 5500-X Series",
    bandwidthLimitations: "1 Gbps"
  }
]

export default function AssetManagement() {
  const [assets, setAssets] = useState<Asset[]>(initialAssets)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)

  const addAsset = (asset: Asset) => {
    setAssets([...assets, { ...asset, id: Date.now().toString() }])
  }

  const updateAsset = (updatedAsset: Asset) => {
    setAssets(assets.map(asset => asset.id === updatedAsset.id ? updatedAsset : asset))
  }

  const deleteAsset = (id: string) => {
    setAssets(assets.filter(asset => asset.id !== id))
  }

  const openModal = (asset: Asset | null = null) => {
    setEditingAsset(asset)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setEditingAsset(null)
    setIsModalOpen(false)
  }

  return (
    <div className="container mx-auto p-4 bg-gray-100 min-h-screen">
      <motion.h1 
        className="text-4xl font-bold mb-8 text-center text-gray-800"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Asset Management System
      </motion.h1>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Button onClick={() => openModal()} className="mb-8 w-full sm:w-auto">
          <FaPlus className="mr-2" /> Add Asset
        </Button>
        <AssetTable 
          assets={assets} 
          onEdit={openModal} 
          onDelete={deleteAsset} 
        />
      </motion.div>
      {isModalOpen && (
        <AssetModal
          asset={editingAsset}
          onClose={closeModal}
          onSubmit={(asset) => {
            if (editingAsset) {
              updateAsset(asset)
            } else {
              addAsset(asset)
            }
            closeModal()
          }}
        />
      )}
    </div>
  )
}

