import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Phone,
  MapPin,
  Navigation,
  Clock,
  Heart,
  Zap,
  Car,
  Shield,
  ChevronRight
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

interface EmergencyFacility {
  id: string;
  name: string;
  type: 'hospital' | 'urgent_care';
  address: string;
  phone: string;
  distance: number;
  eta: number;
  availability: 'high' | 'medium' | 'low';
  specialties: string[];
}

const EmergencyMode: React.FC = () => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [emergencyFacilities, setEmergencyFacilities] = useState<EmergencyFacility[]>([]);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(coords);

          try {
            const response = await fetch(`${API_BASE_URL}/location/emergency?lat=${coords.lat}&lng=${coords.lng}`);
            const data = await response.json();
            if (data.success) {
              setEmergencyFacilities(data.facilities);
            }
          } catch (err) {
            console.error('Failed to fetch emergency facilities', err);
          }
        },
        (error) => {
          setLocationError('Unable to get your location.');
          console.error('Geolocation error:', error);
        }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser.');
    }
  }, []);

  const call911 = () => {
    window.location.href = 'tel:911';
  };

  const callFacility = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const getDirections = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'high': return 'green';
      case 'medium': return 'yellow';
      case 'low': return 'red';
      default: return 'gray';
    }
  };

  const getAvailabilityText = (availability: string) => {
    switch (availability) {
      case 'high': return 'Low Wait Time';
      case 'medium': return 'Moderate Wait';
      case 'low': return 'High Wait Time';
      default: return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-red-50">
      {/* Emergency Header */}
      <div className="bg-red-600 text-white py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-red-500 rounded-full">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Emergency Mode</h1>
              <p className="text-red-100">Find immediate medical care near you</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Emergency Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border-l-4 border-red-500">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <Zap className="w-6 h-6 text-red-600" />
            <span>Immediate Actions</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={call911}
              className="flex items-center justify-center space-x-3 bg-red-600 text-white p-4 rounded-lg hover:bg-red-700 transition-colors font-semibold"
            >
              <Phone className="w-6 h-6" />
              <span>Call 911</span>
            </button>
            
            <button
              onClick={() => callFacility('+1-555-POISON')}
              className="flex items-center justify-center space-x-3 bg-orange-600 text-white p-4 rounded-lg hover:bg-orange-700 transition-colors font-semibold"
            >
              <Shield className="w-6 h-6" />
              <span>Poison Control</span>
            </button>
            
            <button
              onClick={() => window.open('https://www.redcross.org/take-a-class/first-aid/performing-first-aid/first-aid-steps?srsltid=AfmBOopFHlECoY3kCa1D5MjWRc2TpwJuhyDhkM-c0ITlMjX62pU-GGXU', '_blank')}
              className="flex items-center justify-center space-x-3 bg-[#1D6FA3] text-white p-4 rounded-lg hover:bg-[#1D6FA3]/80 transition-colors font-semibold"
            >
              <Heart className="w-6 h-6" />
              <span>First Aid Guide</span>
            </button>
          </div>
        </div>

        {/* Location Status */}
        {locationError && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-yellow-600" />
              <span className="text-yellow-800">{locationError}</span>
            </div>
          </div>
        )}

        {/* Emergency Facilities */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Nearest Emergency Care</h2>
            <div className="text-sm text-gray-600">
              {userLocation ? 'Based on your location' : 'Waiting for location...'}
            </div>
          </div>

          {emergencyFacilities.map((facility) => {
            const availabilityColor = getAvailabilityColor(facility.availability);
            return (
              <div key={facility.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{facility.name}</h3>
                        <span className={`px-3 py-1 text-sm font-medium rounded-full bg-${availabilityColor}-100 text-${availabilityColor}-800`}>
                          {getAvailabilityText(facility.availability)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>{facility.address}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Navigation className="w-4 h-4" />
                          <span>{facility.distance} miles away</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{facility.eta} min drive</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4" />
                          <span>{facility.phone}</span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Specialties:</h4>
                        <div className="flex flex-wrap gap-2">
                          {facility.specialties.map((specialty, index) => (
                            <span 
                              key={index}
                              className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => getDirections(facility.address)}
                      className="flex-1 bg-[#1D6FA3]/80 text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#1D6FA3] transition-colors flex items-center justify-center space-x-2"
                    >
                      <Car className="w-5 h-5" />
                      <span>Get Directions</span>
                    </button>
                    
                    <button
                      onClick={() => callFacility(facility.phone)}
                      className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center space-x-2"
                    >
                      <Phone className="w-5 h-5" />
                      <span>Call</span>
                    </button>
                  </div>
                </div>

                {/* Real-time status bar */}
                <div className={`bg-${availabilityColor}-50 border-t border-${availabilityColor}-200 px-6 py-3`}>
                  <div className="flex items-center justify-between text-sm">
                    <span className={`text-${availabilityColor}-800 font-medium`}>
                      Current Status: {getAvailabilityText(facility.availability)}
                    </span>
                    <span className={`text-${availabilityColor}-600`}>
                      Last updated: 2 minutes ago
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Emergency Tips */}
        <div className="mt-8 bg-gray-100 rounded-xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Emergency Preparedness Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div className="flex items-start space-x-2">
              <ChevronRight className="w-4 h-4 text-gray-400 mt-0.5" />
              <span>Stay calm and assess the situation</span>
            </div>
            <div className="flex items-start space-x-2">
              <ChevronRight className="w-4 h-4 text-gray-400 mt-0.5" />
              <span>Call 911 for life-threatening emergencies</span>
            </div>
            <div className="flex items-start space-x-2">
              <ChevronRight className="w-4 h-4 text-gray-400 mt-0.5" />
              <span>Have your insurance information ready</span>
            </div>
            <div className="flex items-start space-x-2">
              <ChevronRight className="w-4 h-4 text-gray-400 mt-0.5" />
              <span>Bring a list of current medications</span>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-center">
          <p className="text-sm text-red-800">
            <strong>Emergency Disclaimer:</strong> This tool is for informational purposes only. 
            In case of a life-threatening emergency, call 911 immediately. Do not rely solely on 
            this app for emergency medical decisions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmergencyMode;