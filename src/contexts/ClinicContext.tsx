import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

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
  userLocation?: { lat: number; lng: number };
  specialty: string;
  insurance: string;
  urgency: 'emergency' | 'urgent' | 'routine';
  maxDistance: number;
  minRating: number;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

const mockClinics: Clinic[] = [
  {
    id: '1',
    name: 'Toronto General Hospital',
    type: 'hospital',
    address: '200 Elizabeth St, Toronto, ON M5G 2C4',
    phone: '+1-416-340-4800',
    location: { lat: 43.6584, lng: -79.389 },
    distance: 1.0,
    rating: 4.6,
    reviews: 1500,
    insuranceAccepted: ['OHIP', 'Sun Life', 'Manulife'],
    availableSlots: ['2024-01-15T09:00', '2024-01-15T14:30', '2024-01-16T11:00'],
    specialties: ['Emergency Medicine', 'Cardiology', 'Internal Medicine'],
    emergencyServices: true,
    coveragePercentage: 85,
    estimatedCost: 450,
    image: 'https://images.pexels.com/photos/236380/pexels-photo-236380.jpeg'
  },
  {
    id: '2',
    name: 'Toronto Western Hospital',
    type: 'urgent_care',
    address: '399 Bathurst St, Toronto, ON M5T 2S8',
    phone: '+1-416-603-2581',
    location: { lat: 43.653, lng: -79.4073 },
    distance: 1.5,
    rating: 4.3,
    reviews: 800,
    insuranceAccepted: ['OHIP', 'Sun Life', 'Manulife'],
    availableSlots: ['2024-01-15T10:30', '2024-01-15T15:00', '2024-01-15T16:30'],
    specialties: ['Urgent Care', 'Minor Emergency'],
    emergencyServices: true,
    coveragePercentage: 90,
    estimatedCost: 180,
    image: 'https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg'
  },
  {
    id: '3',
    name: 'Mount Sinai Hospital',
    type: 'clinic',
    address: '600 University Ave, Toronto, ON M5G 1X5',
    phone: '+1-416-586-4800',
    location: { lat: 43.6558, lng: -79.3894 },
    distance: 0.8,
    rating: 4.7,
    reviews: 1000,
    insuranceAccepted: ['OHIP', 'Sun Life', 'Manulife'],
    availableSlots: ['2024-01-16T09:30', '2024-01-17T13:00', '2024-01-18T10:00'],
    specialties: ['Family Medicine', 'Pediatrics', "Women's Health"],
    emergencyServices: false,
    coveragePercentage: 95,
    estimatedCost: 120,
    image: 'https://images.pexels.com/photos/4021775/pexels-photo-4021775.jpeg'
  },
  {
    id: '4',
    name: "St. Michael's Hospital",
    type: 'hospital',
    address: '30 Bond St, Toronto, ON M5B 1W8',
    phone: '+1-416-360-4000',
    location: { lat: 43.6548, lng: -79.3784 },
    distance: 2.3,
    rating: 4.4,
    reviews: 900,
    insuranceAccepted: ['OHIP', 'Sun Life', 'Manulife'],
    availableSlots: ['2024-01-17T09:00', '2024-01-17T15:30', '2024-01-18T11:00'],
    specialties: ['Emergency Medicine', 'Trauma'],
    emergencyServices: true,
    coveragePercentage: 88,
    estimatedCost: 400,
    image: 'https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg'
  },
  {
    id: '5',
    name: 'Sunnybrook Health Sciences Centre',
    type: 'hospital',
    address: '2075 Bayview Ave, Toronto, ON M4N 3M5',
    phone: '+1-416-480-6100',
    location: { lat: 43.725, lng: -79.378 },
    distance: 5.2,
    rating: 4.5,
    reviews: 1100,
    insuranceAccepted: ['OHIP', 'Sun Life', 'Manulife'],
    availableSlots: ['2024-01-18T09:00', '2024-01-18T14:00', '2024-01-19T10:30'],
    specialties: ['Emergency Medicine', 'Cardiology'],
    emergencyServices: true,
    coveragePercentage: 80,
    estimatedCost: 500,
    image: 'https://images.pexels.com/photos/236380/pexels-photo-236380.jpeg'
  }
];

export const ClinicProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [clinics] = useState<Clinic[]>(mockClinics);
  const [filteredClinics, setFilteredClinics] = useState<Clinic[]>(mockClinics);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);

  const searchClinics = useCallback((filters: SearchFilters) => {
    // Recalculate distances based on user's location if provided
    const processed = clinics.map(clinic => {
      let distance = clinic.distance;
      if (filters.userLocation) {
        const toRad = (value: number) => (value * Math.PI) / 180;
        const R = 3958.8; // Earth radius in miles
        const dLat = toRad(clinic.location.lat - filters.userLocation.lat);
        const dLng = toRad(clinic.location.lng - filters.userLocation.lng);
        const a = Math.sin(dLat / 2) ** 2 +
          Math.cos(toRad(filters.userLocation.lat)) *
          Math.cos(toRad(clinic.location.lat)) *
          Math.sin(dLng / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        distance = parseFloat((R * c).toFixed(1));
      }
      return { ...clinic, distance };
    });

    let filtered = [...processed];

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

    // Filter by insurance
    if (filters.insurance && filters.insurance !== 'any') {
      filtered = filtered.filter(clinic =>
        clinic.insuranceAccepted.includes(filters.insurance)
      );
    }

    // Filter by rating
    if (filters.minRating && filters.minRating > 0) {
      filtered = filtered.filter(clinic => clinic.rating >= filters.minRating);
    }

    // Filter by distance
    filtered = filtered.filter(clinic => clinic.distance <= filters.maxDistance);

    // Sort by distance
    filtered.sort((a, b) => a.distance - b.distance);

    setFilteredClinics(filtered);
  }, [clinics]);

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