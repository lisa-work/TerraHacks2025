import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Clinic {
  id: string;
  name: string;
  type: 'hospital' | 'urgent_care' | 'clinic' | 'specialist';
  address: string;
  phone: string;
  location: {
    lat: number;
    lng: number;
  };
  distance: number;
  rating: number;
  reviews: number;
  insuranceAccepted: string[];
  availableSlots: string[];
  specialties: string[];
  emergencyServices: boolean;
  coveragePercentage: number;
  estimatedCost: number;
  image: string;
}

interface ClinicContextType {
  clinics: Clinic[];
  filteredClinics: Clinic[];
  searchClinics: (filters: SearchFilters) => void;
  selectedClinic: Clinic | null;
  setSelectedClinic: (clinic: Clinic | null) => void;
}

interface SearchFilters {
  location: string;
  specialty: string;
  insurance: string;
  urgency: 'emergency' | 'urgent' | 'routine';
  maxDistance: number;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

const mockClinics: Clinic[] = [
  {
    id: '1',
    name: 'Manhattan General Hospital',
    type: 'hospital',
    address: '123 Medical Center Dr, New York, NY 10001',
    phone: '+1-555-0101',
    location: { lat: 40.7589, lng: -73.9851 },
    distance: 2.3,
    rating: 4.5,
    reviews: 1240,
    insuranceAccepted: ['Blue Cross Blue Shield', 'Aetna', 'Cigna'],
    availableSlots: ['2024-01-15T09:00', '2024-01-15T14:30', '2024-01-16T11:00'],
    specialties: ['Emergency Medicine', 'Cardiology', 'Internal Medicine'],
    emergencyServices: true,
    coveragePercentage: 85,
    estimatedCost: 450,
    image: 'https://images.pexels.com/photos/236380/pexels-photo-236380.jpeg'
  },
  {
    id: '2',
    name: 'CityMed Urgent Care',
    type: 'urgent_care',
    address: '456 Health Plaza, New York, NY 10002',
    phone: '+1-555-0102',
    location: { lat: 40.7505, lng: -73.9934 },
    distance: 1.8,
    rating: 4.2,
    reviews: 567,
    insuranceAccepted: ['Blue Cross Blue Shield', 'UnitedHealth'],
    availableSlots: ['2024-01-15T10:30', '2024-01-15T15:00', '2024-01-15T16:30'],
    specialties: ['Urgent Care', 'Minor Emergency'],
    emergencyServices: false,
    coveragePercentage: 90,
    estimatedCost: 180,
    image: 'https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg'
  },
  {
    id: '3',
    name: 'Downtown Family Clinic',
    type: 'clinic',
    address: '789 Wellness Ave, New York, NY 10003',
    phone: '+1-555-0103',
    location: { lat: 40.7282, lng: -73.9942 },
    distance: 1.2,
    rating: 4.7,
    reviews: 892,
    insuranceAccepted: ['Blue Cross Blue Shield', 'Medicaid', 'Medicare'],
    availableSlots: ['2024-01-16T09:30', '2024-01-17T13:00', '2024-01-18T10:00'],
    specialties: ['Family Medicine', 'Pediatrics', 'Women\'s Health'],
    emergencyServices: false,
    coveragePercentage: 95,
    estimatedCost: 120,
    image: 'https://images.pexels.com/photos/4021775/pexels-photo-4021775.jpeg'
  }
];

export const ClinicProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [clinics] = useState<Clinic[]>(mockClinics);
  const [filteredClinics, setFilteredClinics] = useState<Clinic[]>(mockClinics);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);

  const searchClinics = (filters: SearchFilters) => {
    let filtered = [...clinics];

    // Filter by specialty
    if (filters.specialty && filters.specialty !== 'any') {
      filtered = filtered.filter(clinic => 
        clinic.specialties.some(specialty => 
          specialty.toLowerCase().includes(filters.specialty.toLowerCase())
        )
      );
    }

    // Filter by urgency/type
    if (filters.urgency === 'emergency') {
      filtered = filtered.filter(clinic => clinic.emergencyServices);
    } else if (filters.urgency === 'urgent') {
      filtered = filtered.filter(clinic => 
        clinic.type === 'urgent_care' || clinic.emergencyServices
      );
    }

    // Filter by distance
    filtered = filtered.filter(clinic => clinic.distance <= filters.maxDistance);

    // Sort by distance
    filtered.sort((a, b) => a.distance - b.distance);

    setFilteredClinics(filtered);
  };

  return (
    <ClinicContext.Provider value={{
      clinics,
      filteredClinics,
      searchClinics,
      selectedClinic,
      setSelectedClinic
    }}>
      {children}
    </ClinicContext.Provider>
  );
};

export const useClinics = () => {
  const context = useContext(ClinicContext);
  if (context === undefined) {
    throw new Error('useClinics must be used within a ClinicProvider');
  }
  return context;
};