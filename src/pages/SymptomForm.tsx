import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Heart, 
  User, 
  Calendar, 
  ChevronRight, 
  Mic,
  Shield,
  Clock,
  FileText,
  Camera
} from 'lucide-react';
import PhotoUpload from '../components/PhotoUpload';

interface Photo {
  file: File;
  preview: string;
  description: string;
}

interface FormData {
  symptoms: string;
  duration: string;
  severity: number;
  additionalNotes: string;
  photos: Photo[];
  location: string;
  insurance: string;
  preferredTime: string;
  urgency: 'routine' | 'urgent' | 'emergency';
}

const SymptomForm: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    symptoms: '',
    duration: '',
    severity: 5,
    additionalNotes: '',
    photos: [],
    location: 'New York, NY',
    insurance: 'Blue Cross Blue Shield',
    preferredTime: 'morning',
    urgency: 'routine'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create FormData for file upload
    const submitData = new FormData();
    
    // Add text fields
    submitData.append('symptoms', JSON.stringify([formData.symptoms]));
    submitData.append('symptomDescription', formData.symptoms);
    submitData.append('additionalNotes', formData.additionalNotes);
    submitData.append('duration', formData.duration);
    submitData.append('severity', formData.severity.toString());
    submitData.append('location', JSON.stringify({
      lat: 40.7128,
      lng: -74.0060,
      address: formData.location
    }));
    submitData.append('insurance', formData.insurance);
    submitData.append('preferredTime', formData.preferredTime);
    submitData.append('urgency', formData.urgency);
    
    // Add photos
    formData.photos.forEach((photo, index) => {
      submitData.append('photos', photo.file);
      submitData.append(`photo_description_photos`, photo.description);
    });
    
    // Store form data in sessionStorage for the triage page
    sessionStorage.setItem('symptomFormData', JSON.stringify({
      ...formData,
      photos: formData.photos.map(p => ({
        name: p.file.name,
        description: p.description,
        preview: p.preview
      }))
    }));
    
    navigate('/triage');
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

  const handlePhotosChange = (photos: Photo[]) => {
    setFormData({ ...formData, photos });
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

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
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
                    className={`w-20 h-1 mx-2 ${
                      step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4 space-x-8 text-sm text-gray-600">
            <span className={currentStep >= 1 ? 'text-[#1D6FA3] font-medium' : ''}>
              Symptoms
            </span>
            <span className={currentStep >= 2 ? 'text-[#1D6FA3] font-medium' : ''}>
              Details
            </span>
            <span className={currentStep >= 3 ? 'text-[#1D6FA3] font-medium' : ''}>
              Photos
            </span>
            <span className={currentStep >= 4 ? 'text-[#1D6FA3] font-medium' : ''}>
              Location
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          {/* Step 1: Symptoms */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <Heart className="w-6 h-6 text-[#1D6FA3]" />
                <h2 className="text-2xl font-semibold text-gray-900">
                  What symptoms are you experiencing?
                </h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe your symptoms *
                </label>
                <textarea
                  value={formData.symptoms}
                  onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                  placeholder="Please describe your symptoms in detail (e.g., headache, fever, chest pain, etc.)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D6FA3] focus:border-transparent"
                  rows={4}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional notes (Optional)
                </label>
                <textarea
                  value={formData.additionalNotes}
                  onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                  placeholder="Any additional information you'd like to share (e.g., what makes it better/worse, when it started, etc.)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D6FA3] focus:border-transparent"
                  rows={3}
                  maxLength={1000}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {formData.additionalNotes.length}/1000 characters
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Mic className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Voice Input Available</p>
                    <p>You can use your device's voice input feature to describe your symptoms more easily.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <Clock className="w-6 h-6 text-[#1D6FA3]" />
                <h2 className="text-2xl font-semibold text-gray-900">
                  Tell us more details
                </h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How long have you had these symptoms? *
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D6FA3] focus:border-transparent"
                  required
                >
                  <option value="">Select duration</option>
                  <option value="Less than 1 hour">Less than 1 hour</option>
                  <option value="1-6 hours">1-6 hours</option>
                  <option value="6-24 hours">6-24 hours</option>
                  <option value="1-3 days">1-3 days</option>
                  <option value="3-7 days">3-7 days</option>
                  <option value="1-2 weeks">1-2 weeks</option>
                  <option value="2-4 weeks">2-4 weeks</option>
                  <option value="More than 1 month">More than 1 month</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Rate your symptom severity (1 = mild, 10 = severe) *
                </label>
                <div className="px-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>1 - Mild</span>
                    <span className="font-semibold text-[#1D6FA3]">{formData.severity}</span>
                    <span>10 - Severe</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Emergency Warning</p>
                    <p>If you're experiencing severe chest pain, difficulty breathing, or any life-threatening symptoms, please call 911 immediately.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Photos */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <Camera className="w-6 h-6 text-[#1D6FA3]" />
                <h2 className="text-2xl font-semibold text-gray-900">
                  Add photos (Optional)
                </h2>
              </div>

              <div className="text-gray-600 mb-6">
                <p>Photos can help healthcare providers better understand your condition. This step is completely optional.</p>
              </div>

              <PhotoUpload
                photos={formData.photos}
                onPhotosChange={handlePhotosChange}
                maxPhotos={5}
                maxFileSize={10}
              />
            </div>
          )}

          {/* Step 4: Location & Preferences */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <MapPin className="w-6 h-6 text-[#1D6FA3]" />
                <h2 className="text-2xl font-semibold text-gray-900">
                  Location & Preferences
                </h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your location *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Enter your city, state"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D6FA3] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Insurance Provider
                </label>
                <select
                  value={formData.insurance}
                  onChange={(e) => setFormData({ ...formData, insurance: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D6FA3] focus:border-transparent"
                >
                  <option value="Blue Cross Blue Shield">Blue Cross Blue Shield</option>
                  <option value="Aetna">Aetna</option>
                  <option value="Cigna">Cigna</option>
                  <option value="UnitedHealth">UnitedHealth</option>
                  <option value="Medicare">Medicare</option>
                  <option value="Medicaid">Medicaid</option>
                  <option value="Other">Other</option>
                  <option value="No Insurance">No Insurance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred appointment time
                </label>
                <select
                  value={formData.preferredTime}
                  onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D6FA3] focus:border-transparent"
                >
                  <option value="morning">Morning (8AM - 12PM)</option>
                  <option value="afternoon">Afternoon (12PM - 5PM)</option>
                  <option value="evening">Evening (5PM - 8PM)</option>
                  <option value="any">Any time</option>
                </select>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
            )}
            
            <div className="ml-auto">
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={
                    (currentStep === 1 && !formData.symptoms.trim()) ||
                    (currentStep === 2 && (!formData.duration || formData.severity < 1))
                  }
                  className="flex items-center space-x-2 px-6 py-3 bg-[#1D6FA3] text-white rounded-lg hover:bg-[#1a5f8a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!formData.symptoms.trim() || !formData.duration || !formData.location.trim()}
                  className="flex items-center space-x-2 px-8 py-3 bg-[#1D6FA3] text-white rounded-lg hover:bg-[#1a5f8a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Analyze Symptoms</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SymptomForm;