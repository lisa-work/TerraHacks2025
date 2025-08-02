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
  Clock
} from 'lucide-react';

interface FormData {
  symptoms: string;
  duration: string;
  severity: number;
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
    location: 'New York, NY',
    insurance: 'Blue Cross Blue Shield',
    preferredTime: 'morning',
    urgency: 'routine'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Store form data in sessionStorage for the triage page
    sessionStorage.setItem('symptomData', JSON.stringify(formData));
    navigate('/triage');
  };

  const nextStep = () => {
    if (currentStep < 3) {
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
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Tell Us About Your Health Needs
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our AI will analyze your symptoms and find the best healthcare providers for your needs
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
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
            <span className={currentStep >= 1 ? 'text-blue-600 font-medium' : ''}>
              Symptoms
            </span>
            <span className={currentStep >= 2 ? 'text-blue-600 font-medium' : ''}>
              Details
            </span>
            <span className={currentStep >= 3 ? 'text-blue-600 font-medium' : ''}>
              Preferences
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Symptoms */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <Heart className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    What symptoms are you experiencing?
                  </h2>
                  <p className="text-gray-600">
                    Be as detailed as possible to help our AI provide accurate recommendations
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pain/Discomfort Level (1-10)
                    </label>
                    <div className="relative">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={formData.severity}
                        onChange={(e) => setFormData({ ...formData, severity: parseInt(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
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

            {/* Step 2: Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Location & Insurance Details
                  </h2>
                  <p className="text-gray-600">
                    This helps us find providers near you that accept your insurance
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Insurance Provider
                  </label>
                  <select
                    value={formData.insurance}
                    onChange={(e) => setFormData({ ...formData, insurance: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="Blue Cross Blue Shield">Blue Cross Blue Shield</option>
                    <option value="Aetna">Aetna</option>
                    <option value="Cigna">Cigna</option>
                    <option value="UnitedHealth">UnitedHealth</option>
                    <option value="Kaiser Permanente">Kaiser Permanente</option>
                    <option value="Anthem">Anthem</option>
                    <option value="Medicare">Medicare</option>
                    <option value="Medicaid">Medicaid</option>
                    <option value="No Insurance">No Insurance</option>
                  </select>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-blue-900">Privacy Protected</h3>
                      <p className="text-sm text-blue-700 mt-1">
                        Your health information is encrypted and HIPAA compliant. We never share 
                        your data without your explicit consent.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Preferences */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
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
                        color: 'orange'
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
                          onChange={(e) => setFormData({ ...formData, urgency: e.target.value as any })}
                          className="sr-only"
                        />
                        <div className="text-center">
                          <div className={`w-3 h-3 rounded-full mx-auto mb-2 bg-${urgency.color}-500`} />
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

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Next Step
                  <ChevronRight className="ml-2 w-5 h-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Analyze Symptoms
                  <ChevronRight className="ml-2 w-5 h-5" />
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