export type Asset = {
  id: string;
  name: string;
  type: string;
  credentials: string;
  encryptionDetails: string;
  owner: string;
  status: 'Active' | 'Inactive' | 'Maintenance';
  dateAdded: string;
  lastUpdated: string;
  expiryDate: string;
  maintenanceSchedule: string;
  physicalLocation: string;
  geographicZone: string;
  hardwareSpecifications: string;
  bandwidthLimitations: string;
};

