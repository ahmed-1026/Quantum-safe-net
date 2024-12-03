import { Asset } from '../../types/asset'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { motion } from 'framer-motion'
import { FaEdit, FaTrash } from 'react-icons/fa'

type AssetTableProps = {
  assets: Asset[]
  onEdit: (asset: Asset) => void
  onDelete: (id: string) => void
}

export default function AssetTable({ assets, onEdit, onDelete }: AssetTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg shadow">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-bold">Name</TableHead>
            <TableHead className="font-bold">Type</TableHead>
            <TableHead className="font-bold">Owner</TableHead>
            <TableHead className="font-bold">Status</TableHead>
            <TableHead className="font-bold">Location</TableHead>
            <TableHead className="font-bold">Expiry Date</TableHead>
            <TableHead className="font-bold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.map((asset, index) => (
            <motion.tr
              key={asset.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <TableCell>{asset.name}</TableCell>
              <TableCell>{asset.type}</TableCell>
              <TableCell>{asset.owner}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  asset.status === 'Active' ? 'bg-green-200 text-green-800' :
                  asset.status === 'Inactive' ? 'bg-red-200 text-red-800' :
                  'bg-yellow-200 text-yellow-800'
                }`}>
                  {asset.status}
                </span>
              </TableCell>
              <TableCell>{asset.physicalLocation}</TableCell>
              <TableCell>{asset.expiryDate}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" className="mr-2" onClick={() => onEdit(asset)}>
                  <FaEdit className="mr-1" /> Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => onDelete(asset.id)}>
                  <FaTrash className="mr-1" /> Delete
                </Button>
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

