import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Star, 
  Shield, 
  DollarSign,
  User,
  Mail,
  CreditCard,
  CheckCircle,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { useClinics } from '../contexts/ClinicContext';
import { useUser } from '../contexts/UserContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const BookingPage: React.FC = () => {
  const { clinicId } = useParams<{ clinicId: string }>();
  const navigate = useNavigate();
  const { clinics, selectedClinic } = useClinics();
  const { user, isAuthenticated } = useUser();
  
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [appointmentType, setAppointmentType] = useState('consultation');
  const [notes, setNotes] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);

  const clinic = selectedClinic || clinics.find(c => c.id === clinicId);

  useEffect(() => {
    if (!clinic) {
      navigate('/search');
    }
  }, [clinic, navigate]);

  if (!clinic) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Clinic Not Found</h2>
          <p className="text-gray-600 mb-6">The clinic you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/search')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please sign in to book an appointment');
      return;
    }

    setIsBooking(true);

    try {
      const token = localStorage.getItem('mediconnect_token');
      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          clinicId: clinic.id,
          appointmentDate: selectedDate,
          appointmentTime: selectedTime,
          type: appointmentType,
          notes
        })
      });

      if (!response.ok) {
        throw new Error('Booking failed');
      }

      setBookingComplete(true);
    } catch (err) {
      console.error('Booking failed', err);
      alert('Failed to book appointment');
    } finally {
      setIsBooking(false);
    }
  };

  const availableDates = [
    '2024-01-15',
    '2024-01-16',
    '2024-01-17',
    '2024-01-18',
    '2024-01-19'
  ];

  const availableTimes = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Appointment Confirmed!
          </h2>
          <p className="text-gray-600 mb-6">
            Your appointment with {clinic.name} has been successfully booked for{' '}
            {new Date(selectedDate).toLocaleDateString()} at {selectedTime}.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              View Dashboard
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/search')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Search</span>
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Book Appointment
          </h1>
          <p className="text-gray-600">
            Schedule your visit with {clinic.name}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Clinic Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <img 
                src={clinic.image} 
                alt={clinic.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">{clinic.name}</h3>
              
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>{clinic.address}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>{clinic.phone}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span>{clinic.rating} ({clinic.reviews} reviews)</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>{clinic.distance} miles away</span>
                </div>
              </div>

              {/* Insurance Info */}
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-900">Insurance Coverage</span>
                </div>
                <p className="text-sm text-green-700">
                  {clinic.coveragePercentage}% covered by your insurance
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">
                    Est. cost: ${Math.round(clinic.estimatedCost * (1 - clinic.coveragePercentage / 100))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <form onSubmit={handleBooking} className="space-y-6">
                {/* Appointment Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Appointment Type
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { value: 'consultation', label: 'General Consultation', desc: 'Standard visit' },
                      { value: 'followup', label: 'Follow-up', desc: 'Previous patient' },
                      { value: 'urgent', label: 'Urgent Care', desc: 'Same-day care' },
                      { value: 'specialist', label: 'Specialist Visit', desc: 'Specialized care' }
                    ].map((type) => (
                      <label
                        key={type.value}
                        className={`relative p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          appointmentType === type.value
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="appointmentType"
                          value={type.value}
                          checked={appointmentType === type.value}
                          onChange={(e) => setAppointmentType(e.target.value)}
                          className="sr-only"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{type.label}</div>
                          <div className="text-sm text-gray-500">{type.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Date Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Select Date
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {availableDates.map((date) => (
                      <button
                        key={date}
                        type="button"
                        onClick={() => setSelectedDate(date)}
                        className={`p-3 text-center border-2 rounded-lg transition-colors ${
                          selectedDate === date
                            ? 'border-blue-600 bg-blue-50 text-blue-600'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-sm font-medium">
                          {new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Selection */}
                {selectedDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Select Time
                    </label>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                      {availableTimes.map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => setSelectedTime(time)}
                          className={`p-3 text-center border-2 rounded-lg transition-colors ${
                            selectedTime === time
                              ? 'border-blue-600 bg-blue-50 text-blue-600'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-sm font-medium">{time}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Patient Information */}
                {isAuthenticated && user && (
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Patient Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <User className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">Patient Name</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="font-medium text-sm text-gray-900">{user.email}</div>
                          <div className="text-sm text-gray-500">Email</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">{user.phone}</div>
                          <div className="text-sm text-gray-500">Phone</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <CreditCard className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">{user.insurance.provider}</div>
                          <div className="text-sm text-gray-500">Insurance</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Any specific concerns or information for your appointment..."
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={!selectedDate || !selectedTime || isBooking}
                    className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isBooking ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Booking Appointment...</span>
                      </>
                    ) : (
                      <>
                        <Calendar className="w-5 h-5" />
                        <span>Confirm Appointment</span>
                      </>
                    )}
                  </button>
                  
                  {(!selectedDate || !selectedTime) && (
                    <p className="text-sm text-gray-500 text-center mt-2">
                      Please select both date and time to continue
                    </p>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;