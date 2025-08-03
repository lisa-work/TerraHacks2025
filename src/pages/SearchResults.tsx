import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Star,
  Phone,
  Shield,
  Filter,
  ChevronDown,
  Navigation,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useClinics, Clinic } from '../contexts/ClinicContext';

const SearchResults: React.FC = () => {
  const navigate = useNavigate();
  const { filteredClinics, searchClinics, setSelectedClinic } = useClinics();
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('distance');
  const [filters, setFilters] = useState({
    maxDistance: 10,
    minRating: 0,
    insurance: 'any',
    specialty: 'any'
  });
  const [searchParams, setSearchParams] = useState<{
    location: string;
    urgency: 'emergency' | 'urgent' | 'routine';
  } | null>(null);

  useEffect(() => {
    // Get search data from previous page
    const symptomData = sessionStorage.getItem('symptomData');
    if (symptomData) {
      const data = JSON.parse(symptomData);
      setSearchParams({ location: data.location, urgency: data.urgency });
      setFilters(prev => ({ ...prev, insurance: data.insurance || 'any' }));
      searchClinics({
        location: data.location,
        userLocation: data.coordinates,
        specialty: 'any',
        insurance: data.insurance || 'any',
        urgency: data.urgency,
        maxDistance: 10,
        minRating: 0
      });
    }
  }, [searchClinics]);

  useEffect(() => {
    if (searchParams) {
      searchClinics({
        location: searchParams.location,
        specialty: filters.specialty,
        insurance: filters.insurance,
        urgency: searchParams.urgency,
        maxDistance: filters.maxDistance,
        minRating: filters.minRating
      });
    }
  }, [filters, searchClinics, searchParams]);

  const handleBooking = (clinic: Clinic) => {
    setSelectedClinic(clinic);
    navigate(`/booking/${clinic.id}`);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'hospital': return 'blue';
      case 'urgent_care': return 'orange';
      case 'clinic': return 'green';
      case 'specialist': return 'purple';
      default: return 'gray';
    }
  };

  const sortedClinics = [...filteredClinics].sort((a, b) => {
    switch (sortBy) {
      case 'distance': return a.distance - b.distance;
      case 'rating': return b.rating - a.rating;
      case 'cost': return a.estimatedCost - b.estimatedCost;
      default: return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Healthcare Providers Near You
          </h1>
          <p className="text-gray-600">
            Found {filteredClinics.length} providers that match your needs
          </p>
        </div>

        {/* Filters and Sort */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="distance">Distance</option>
                  <option value="rating">Rating</option>
                  <option value="cost">Cost</option>
                </select>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              Showing results within {filters.maxDistance} miles
            </div>
          </div>

          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Distance (miles)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={filters.maxDistance}
                    onChange={(e) => setFilters({ ...filters, maxDistance: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-500 mt-1">{filters.maxDistance} miles</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Rating
                  </label>
                  <select
                    value={filters.minRating}
                    onChange={(e) => setFilters({ ...filters, minRating: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="0">Any Rating</option>
                    <option value="3">3+ Stars</option>
                    <option value="4">4+ Stars</option>
                    <option value="4.5">4.5+ Stars</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Insurance
                  </label>
                  <select
                    value={filters.insurance}
                    onChange={(e) => setFilters({ ...filters, insurance: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="any">Any Insurance</option>
                    <option value="Blue Cross Blue Shield">Blue Cross Blue Shield</option>
                    <option value="Aetna">Aetna</option>
                    <option value="Cigna">Cigna</option>
                    <option value="UnitedHealth">UnitedHealth</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Specialty
                  </label>
                  <select
                    value={filters.specialty}
                    onChange={(e) => setFilters({ ...filters, specialty: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="any">Any Specialty</option>
                    <option value="family">Family Medicine</option>
                    <option value="urgent">Urgent Care</option>
                    <option value="emergency">Emergency Medicine</option>
                    <option value="cardiology">Cardiology</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sortedClinics.map((clinic) => {
            const typeColor = getTypeColor(clinic.type);
            return (
              <div key={clinic.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow border border-gray-200">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{clinic.name}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${typeColor}-100 text-${typeColor}-800 capitalize`}>
                          {clinic.type.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="font-medium">{clinic.rating}</span>
                          <span>({clinic.reviews} reviews)</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{clinic.distance} miles away</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm">{clinic.address}</p>
                    </div>
                    
                    <img 
                      src={clinic.image} 
                      alt={clinic.name}
                      className="w-20 h-20 object-cover rounded-lg ml-4"
                    />
                  </div>

                  {/* Insurance and Cost */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Shield className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-900">
                          {clinic.coveragePercentage}% Coverage
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-900">
                          Est. ${clinic.estimatedCost}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      Your insurance is accepted • Out-of-pocket: ~${Math.round(clinic.estimatedCost * (1 - clinic.coveragePercentage / 100))}
                    </p>
                  </div>

                  {/* Specialties */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Specialties:</h4>
                    <div className="flex flex-wrap gap-2">
                      {clinic.specialties.slice(0, 3).map((specialty, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                      {clinic.specialties.length > 3 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                          +{clinic.specialties.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Available Slots */}
                  {clinic.availableSlots.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Next Available:</h4>
                      <div className="text-sm text-blue-600 font-medium">
                        {new Date(clinic.availableSlots[0]).toLocaleDateString()} at{' '}
                        {new Date(clinic.availableSlots[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleBooking(clinic)}
                      className="flex-1 bg-[#1D6FA3] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#1D6FA3]/80 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Book Appointment</span>
                    </button>
                    
                    <button className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <Phone className="w-4 h-4 text-gray-600" />
                    </button>
                    
                    <button className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <Navigation className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* No Results */}
        {filteredClinics.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No providers found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your filters or expanding your search radius
            </p>
            <button
              onClick={() => setShowFilters(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Adjust Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;