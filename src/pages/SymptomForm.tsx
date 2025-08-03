import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Heart,
  ChevronRight,
  Mic,
  Shield,
  Clock,
  Upload,
  X,
  Search,
  AlertCircle,
  Camera,
  FileText
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

interface FormData {
  symptoms: string;
  duration: string;
  severity: number;
  location: string;
  coordinates?: { lat: number; lng: number };
  insurance: string;
  preferredTime: string;
  urgency: 'routine' | 'urgent' | 'emergency';
  medicalHistory: {
    allergies: string[];
    conditions: string[];
    medications: string[];
  };
  uploadedImages: File[];
  imageDescriptions: string[];
}

interface InsuranceProvider {
  _id: string;
  name: string;
  type: string;
  contactInfo: {
    phone: string;
    website?: string;
  };
}

const SymptomForm: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    symptoms: '',
    duration: '',
    severity: 5,
    location: user?.location?.address || 'Toronto, ON',
    coordinates: user?.location ? { lat: user.location.lat, lng: user.location.lng } : { lat: 43.6532, lng: -79.3832 },
    insurance: user?.insurance?.provider || '',
    preferredTime: 'morning',
    urgency: 'routine',
    medicalHistory: {
      allergies: user?.medicalHistory?.allergies || [],
      conditions: user?.medicalHistory?.conditions?.map(c => c.name) || [],
      medications: user?.medicalHistory?.medications?.map(m => m.name) || []
    },
    uploadedImages: [],
    imageDescriptions: []
  });

  const [insuranceProviders, setInsuranceProviders] = useState<InsuranceProvider[]>([]);
  const [insuranceSearch, setInsuranceSearch] = useState('');
  const [showInsuranceDropdown, setShowInsuranceDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Auto-populate user data when available
    if (user) {
      setFormData(prev => ({
        ...prev,
        location: user.location?.address || prev.location,
        coordinates: user.location ? { lat: user.location.lat, lng: user.location.lng } : prev.coordinates,
        insurance: user.insurance?.provider || prev.insurance,
        medicalHistory: {
          allergies: user.medicalHistory?.allergies || [],
          conditions: user.medicalHistory?.conditions?.map(c => c.name) || [],
          medications: user.medicalHistory?.medications?.map(m => m.name) || []
        }
      }));
    }
  }, [user]);

  // Attempt to auto-detect user location if not already set
  useEffect(() => {
    if ((!formData.location || !formData.coordinates) && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(`${API_BASE_URL}/location/reverse-geocode?lat=${latitude}&lng=${longitude}`);
          const data = await response.json();
          if (data.success && data.address) {
            setFormData(prev => ({
              ...prev,
              location: data.address,
              coordinates: { lat: latitude, lng: longitude }
            }));
          }
        } catch (err) {
          console.error('Failed to fetch address from coordinates', err);
        }
      }, (error) => {
        console.error('Geolocation error:', error);
      });
    }
  }, [formData.location, formData.coordinates]);

  // Geocode address when location changes
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      if (formData.location) {
        try {
          const response = await fetch(`${API_BASE_URL}/location/geocode?address=${encodeURIComponent(formData.location)}`, {
            signal: controller.signal
          });
          const data = await response.json();
          if (data.success && data.location) {
            setFormData(prev => ({
              ...prev,
              coordinates: { lat: data.location.lat, lng: data.location.lng }
            }));
          }
        } catch (err) {
          console.error('Failed to geocode address', err);
        }
      }
    }, 500);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [formData.location]);

  const searchInsuranceProviders = async (query: string) => {
    if (!query.trim()) {
      setInsuranceProviders([]);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/insurance/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data.success) {
        setInsuranceProviders(data.data);
      }
    } catch (error) {
      console.error('Insurance search failed:', error);
    }
  };

  const handleInsuranceSearch = (value: string) => {
    setInsuranceSearch(value);
    setShowInsuranceDropdown(true);
    searchInsuranceProviders(value);
  };

  const selectInsuranceProvider = (provider: InsuranceProvider) => {
    setFormData({ ...formData, insurance: provider.name });
    setInsuranceSearch(provider.name);
    setShowInsuranceDropdown(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      setError('Some files were skipped. Only image files under 10MB are allowed.');
    }

    setFormData(prev => ({
      ...prev,
      uploadedImages: [...prev.uploadedImages, ...validFiles],
      imageDescriptions: [...prev.imageDescriptions, ...validFiles.map(() => '')]
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      uploadedImages: prev.uploadedImages.filter((_, i) => i !== index),
      imageDescriptions: prev.imageDescriptions.filter((_, i) => i !== index)
    }));
  };

  const updateImageDescription = (index: number, description: string) => {
    setFormData(prev => ({
      ...prev,
      imageDescriptions: prev.imageDescriptions.map((desc, i) => 
        i === index ? description : desc
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Upload images first if any
      const uploadedImageIds: string[] = [];
      
      if (formData.uploadedImages.length > 0) {
        for (let i = 0; i < formData.uploadedImages.length; i++) {
          const formDataUpload = new FormData();
          formDataUpload.append('image', formData.uploadedImages[i]);
          formDataUpload.append('description', formData.imageDescriptions[i]);
          formDataUpload.append('symptoms', formData.symptoms);

          const token = localStorage.getItem('mediconnect_token');
          const response = await fetch(`${API_BASE_URL}/upload/image`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formDataUpload
          });

          if (response.ok) {
            const data = await response.json();
            uploadedImageIds.push(data.data._id);
          }
        }
      }

      // Store form data with uploaded image IDs
      const submissionData = {
        ...formData,
        uploadedImageIds,
        userId: user?._id
      };
      
      sessionStorage.setItem('symptomData', JSON.stringify(submissionData));
      navigate('/triage');
    } catch (error) {
      console.error('Submission failed:', error);
      setError('Failed to submit form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#1D6FA3] mb-4">
            Tell Us About Your Health Needs
          </h1>
          <p className="text-lg text-[#374151] max-w-2xl mx-auto">
            Our AI will analyze your symptoms and find the best healthcare providers for your needs
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-2">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step <= currentStep
                      ? 'bg-[#1D6FA3]/80 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step}
                </div>
                {step < 4 && (
                  <div
                    className={`w-16 h-1 mx-1 ${
                      step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4 space-x-6 text-sm text-gray-600">
            <span className={currentStep >= 1 ? 'text-[#1D6FA3] font-medium' : ''}>
              Symptoms
            </span>
            <span className={currentStep >= 2 ? 'text-[#1D6FA3] font-medium' : ''}>
              History
            </span>
            <span className={currentStep >= 3 ? 'text-[#1D6FA3] font-medium' : ''}>
              Images
            </span>
            <span className={currentStep >= 4 ? 'text-[#1D6FA3] font-medium' : ''}>
              Details
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Symptoms */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <Heart className="w-12 h-12 text-[#1D6FA3] mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-[#1D6FA3] mb-2">
                    What symptoms are you experiencing?
                  </h2>
                  <p className="text-gray-600">
                    Be as detailed as possible to help our AI provide accurate recommendations
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#1D6FA3] mb-2">
                    Describe your symptoms
                  </label>
                  <div className="relative">
                    <textarea
                      value={formData.symptoms}
                      onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                      className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="e.g., I've been having a persistent headache for 2 days, along with mild nausea and sensitivity to light..."
                      required
                    />
                    <button
                      type="button"
                      className="absolute bottom-3 right-3 p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Voice input"
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-[#1D6FA3] mb-2">
                      How long have you had these symptoms?
                    </label>
                    <select
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select duration</option>
                      <option value="less_than_day">Less than a day</option>
                      <option value="1-3_days">1-3 days</option>
                      <option value="1_week">About a week</option>
                      <option value="2_weeks">2 weeks</option>
                      <option value="1_month">About a month</option>
                      <option value="longer">Longer than a month</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#1D6FA3] mb-2">
                      Pain/Discomfort Level (1-10)
                    </label>
                    <div className="relative ">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={formData.severity}
                        onChange={(e) => setFormData({ ...formData, severity: parseInt(e.target.value) })}
                        className="w-full h-2 text-[#1D6FA3]/70 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Mild</span>
                        <span className="font-medium text-blue-600">{formData.severity}</span>
                        <span>Severe</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Medical History */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <FileText className="w-12 h-12 text-[#1D6FA3] mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-[#1D6FA3] mb-2">
                    Medical History
                  </h2>
                  <p className="text-gray-600">
                    This information helps our AI provide more accurate recommendations
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-[#1D6FA3] mb-2">
                      Current Medications
                    </label>
                    <textarea
                      value={formData.medicalHistory.medications.join(', ')}
                      onChange={(e) => setFormData({
                        ...formData,
                        medicalHistory: {
                          ...formData.medicalHistory,
                          medications: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                        }
                      })}
                      className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                      placeholder="e.g., Lisinopril 10mg, Metformin 500mg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#1D6FA3] mb-2">
                      Allergies
                    </label>
                    <textarea
                      value={formData.medicalHistory.allergies.join(', ')}
                      onChange={(e) => setFormData({
                        ...formData,
                        medicalHistory: {
                          ...formData.medicalHistory,
                          allergies: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                        }
                      })}
                      className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                      placeholder="e.g., Penicillin, Shellfish, Pollen"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#1D6FA3] mb-2">
                      Medical Conditions
                    </label>
                    <textarea
                      value={formData.medicalHistory.conditions.join(', ')}
                      onChange={(e) => setFormData({
                        ...formData,
                        medicalHistory: {
                          ...formData.medicalHistory,
                          conditions: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                        }
                      })}
                      className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                      placeholder="e.g., Diabetes, Hypertension, Asthma"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-[#1D6FA3] mt-0.5" />
                    <div>
                      <h3 className="font-bold text-[#1D6FA3]">Optional Information</h3>
                      <p className="text-sm text-[#1D6FA3] mt-1">
                        This information is optional but helps provide more personalized care recommendations. 
                        You can skip this step if you prefer.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Image Upload */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <Camera className="w-12 h-12 text-[#1D6FA3] mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-[#1D6FA3] mb-2">
                    Upload Images (Optional)
                  </h2>
                  <p className="text-gray-600">
                    Upload photos of your symptoms, injuries, or relevant medical documents for AI analysis
                  </p>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    id="image-upload"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center space-y-4"
                  >
                    <Upload className="w-12 h-12 text-gray-400" />
                    <div>
                      <p className="text-lg font-medium text-gray-700">
                        Click to upload images
                      </p>
                      <p className="text-sm text-gray-500">
                        PNG, JPG, GIF up to 10MB each
                      </p>
                    </div>
                  </label>
                </div>

                {formData.uploadedImages.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-[#1D6FA3]">Uploaded Images</h3>
                    {formData.uploadedImages.map((file, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Upload ${index + 1}`}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{file.name}</p>
                              <p className="text-sm text-gray-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description (Optional)
                          </label>
                          <input
                            type="text"
                            value={formData.imageDescriptions[index]}
                            onChange={(e) => updateImageDescription(index, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Describe what this image shows..."
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-yellow-800">AI Analysis Available</h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        Our AI will analyze your uploaded images to help assess the urgency of your condition 
                        and provide more accurate recommendations.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Location & Insurance Details */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <MapPin className="w-12 h-12 text-[#1D6FA3] mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-[#1D6FA3] mb-2">
                    Location & Insurance Details
                  </h2>
                  <p className="text-gray-600">
                    This helps us find providers near you that accept your insurance
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#1D6FA3] mb-2">
                    Your Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your city or zip code"
                      required
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-sm font-bold text-[#1D6FA3] mb-2">
                    Insurance Provider
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={insuranceSearch || formData.insurance}
                      onChange={(e) => handleInsuranceSearch(e.target.value)}
                      onFocus={() => setShowInsuranceDropdown(true)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Search for your insurance provider..."
                      required
                    />
                  </div>
                  
                  {showInsuranceDropdown && insuranceProviders.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {insuranceProviders.map((provider) => (
                        <button
                          key={provider._id}
                          type="button"
                          onClick={() => selectInsuranceProvider(provider)}
                          className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-gray-900">{provider.name}</div>
                          <div className="text-sm text-gray-500">{provider.contactInfo.phone}</div>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-500 mt-1">
                    Start typing to search, or select "No Insurance" if uninsured
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-[#1D6FA3] mt-0.5" />
                    <div>
                      <h3 className="font-bold text-[#1D6FA3]">Privacy Protected</h3>
                      <p className="text-sm text-[#1D6FA3] mt-1">
                        Your health information is encrypted and HIPAA compliant. We never share 
                        your data without your explicit consent.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Preferences - moved to end */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center my-8">
                  <h2 className="text-2xl font-bold text-[#1D6FA3] mb-2">
                    Appointment Preferences
                  </h2>
                  <p className="text-gray-600">
                    Help us find the best appointment times and care options for you
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Preferred Time of Day
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { value: 'morning', label: 'Morning', desc: '8AM - 12PM' },
                      { value: 'afternoon', label: 'Afternoon', desc: '12PM - 5PM' },
                      { value: 'evening', label: 'Evening', desc: '5PM - 8PM' }
                    ].map((time) => (
                      <label
                        key={time.value}
                        className={`relative p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          formData.preferredTime === time.value
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="preferredTime"
                          value={time.value}
                          checked={formData.preferredTime === time.value}
                          onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                          className="sr-only"
                        />
                        <div className="text-center">
                          <Clock className="w-6 h-6 mx-auto mb-2 text-gray-600" />
                          <div className="font-medium text-gray-900">{time.label}</div>
                          <div className="text-sm text-gray-500">{time.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    How urgent is your condition?
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { 
                        value: 'routine', 
                        label: 'Routine', 
                        desc: 'Can wait a few days',
                        color: 'green'
                      },
                      { 
                        value: 'urgent', 
                        label: 'Urgent', 
                        desc: 'Need care within 24hrs',
                        color: 'yellow'
                      },
                      { 
                        value: 'emergency', 
                        label: 'Emergency', 
                        desc: 'Need immediate care',
                        color: 'red'
                      }
                    ].map((urgency) => (
                      <label
                        key={urgency.value}
                        className={`relative p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                          formData.urgency === urgency.value
                            ? `border-${urgency.color}-600 bg-${urgency.color}-50`
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="urgency"
                          value={urgency.value}
                          checked={formData.urgency === urgency.value}
                        onChange={(e) => setFormData({ ...formData, urgency: e.target.value as 'routine' | 'urgent' | 'emergency' })}
                          className="sr-only"
                        />
                        <div className="text-center">
                          {/* <div className={`w-3 h-3 rounded-full mx-auto mb-2 bg-${urgency.color}-500`} /> */}
                          <div className="font-medium text-gray-900">{urgency.label}</div>
                          <div className="text-sm text-gray-500">{urgency.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={prevStep}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  currentStep === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                disabled={currentStep === 1}
              >
                Previous
              </button>

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="inline-flex items-center px-6 py-3 bg-[#1D6FA3]/80 text-white rounded-lg font-medium hover:bg-[#1D6FA3] transition-colors"
                >
                  Next Step
                  <ChevronRight className="ml-2 w-5 h-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Analyze Symptoms'}
                  {!loading && <ChevronRight className="ml-2 w-5 h-5" />}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SymptomForm;