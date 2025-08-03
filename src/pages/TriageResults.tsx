import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  Brain, 
  ChevronRight,
  Phone,
  MapPin,
  Shield
} from 'lucide-react';

interface TriageResult {
  urgency: 'emergency' | 'urgent' | 'routine';
  recommendation: string;
  reasoning: string;
  careType: string;
  timeframe: string;
  confidence: number;
}

const TriageResults: React.FC = () => {
  const navigate = useNavigate();
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate AI analysis
    const symptomData = sessionStorage.getItem('symptomData');
    if (!symptomData) {
      navigate('/symptoms');
      return;
    }

    const data = JSON.parse(symptomData);

    // Mock AI triage analysis based on symptoms
    setTimeout(() => {
      const inferredUrgency = determineUrgency(data);
      const mockResult: TriageResult = {
        urgency: inferredUrgency,
        recommendation: getRecommendation(inferredUrgency),
        reasoning: getReasoning(data),
        careType: getCareType(inferredUrgency),
        timeframe: getTimeframe(inferredUrgency),
        confidence: 89
      };

      setTriageResult(mockResult);
      setLoading(false);
    }, 3000);
  }, [navigate]);

  const determineUrgency = (data: any): 'emergency' | 'urgent' | 'routine' => {
    const symptoms = data.symptoms.toLowerCase();
    if (symptoms.includes('chest pain') || symptoms.includes('difficulty breathing')) {
      return 'emergency';
    }
    if (data.severity >= 7) {
      return 'urgent';
    }
    return 'routine';
  };

  const getRecommendation = (urgency: string): string => {
    if (urgency === 'emergency') {
      return 'Seek immediate emergency care';
    } else if (urgency === 'urgent') {
      return 'Visit urgent care within 24 hours';
    } else {
      return 'Schedule routine appointment with primary care';
    }
  };

  const getReasoning = (data: any): string => {
    const symptoms = data.symptoms.toLowerCase();
    if (symptoms.includes('chest pain') || symptoms.includes('difficulty breathing')) {
      return 'Symptoms suggest potential cardiovascular or respiratory issues that require immediate attention.';
    } else if (symptoms.includes('headache') && symptoms.includes('nausea')) {
      return 'Combination of headache with nausea may indicate various conditions from migraine to more serious issues.';
    } else {
      return 'Based on symptom analysis, this appears to be a routine medical concern that can be addressed through standard care.';
    }
  };

  const getCareType = (urgency: string): string => {
    if (urgency === 'emergency') return 'Emergency Room';
    if (urgency === 'urgent') return 'Urgent Care Center';
    return 'Primary Care Clinic';
  };

  const getTimeframe = (urgency: string): string => {
    if (urgency === 'emergency') return 'Immediate';
    if (urgency === 'urgent') return 'Within 24 hours';
    return 'Within 1-2 weeks';
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'red';
      case 'urgent': return 'orange';
      default: return 'green';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return AlertTriangle;
      case 'urgent': return Clock;
      default: return CheckCircle;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Brain className="w-16 h-16 text-blue-[#1D6FA3] mx-auto mb-4 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-blue-[#1D6FA3] border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-[#1D6FA3] mb-2">
            AI Analyzing Your Symptoms
          </h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Our advanced AI is processing your symptoms and medical history to provide 
            personalized recommendations...
          </p>
          <div className="mt-6 space-y-2 text-sm text-gray-500">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-[#1D6FA3]/80 rounded-full animate-bounce" />
              <span>Analyzing symptom patterns</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-[#1D6FA3]/80 rounded-full animate-bounce animation-delay-200" />
              <span>Evaluating severity indicators</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-[#1D6FA3]/80 rounded-full animate-bounce animation-delay-400" />
              <span>Generating recommendations</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!triageResult) return null;

  const urgencyColor = getUrgencyColor(triageResult.urgency);
  const UrgencyIcon = getUrgencyIcon(triageResult.urgency);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Brain className="w-8 h-8 text-[#1D6FA3] mr-2" />
            <span className="text-lg font-medium text-[#1D6FA3]">AI Analysis Complete</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Your Health Assessment
          </h1>
          <p className="text-lg text-gray-600">
            Based on your symptoms, here's what our AI recommends
          </p>
        </div>

        {/* Main Result Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          <div className={`bg-${urgencyColor}-50 border-l-4 border-${urgencyColor}-500 p-6`}>
            <div className="flex items-center space-x-4">
              <div className={`p-3 bg-${urgencyColor}-100 rounded-full`}>
                <UrgencyIcon className={`w-8 h-8 text-${urgencyColor}-600`} />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {triageResult.recommendation}
                </h2>
                <p className="text-gray-700 mb-2">
                  {triageResult.reasoning}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>Timeframe: {triageResult.timeframe}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Shield className="w-4 h-4" />
                    <span>{triageResult.confidence}% confidence</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Recommended Care</h3>
                <p className={`text-${urgencyColor}-600 font-medium`}>
                  {triageResult.careType}
                </p>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Urgency Level</h3>
                <p className={`text-${urgencyColor}-600 font-medium capitalize`}>
                  {triageResult.urgency}
                </p>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Time Frame</h3>
                <p className={`text-${urgencyColor}-600 font-medium`}>
                  {triageResult.timeframe}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Actions */}
        {triageResult.urgency === 'emergency' && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h3 className="text-xl font-bold text-red-900">Emergency Action Required</h3>
            </div>
            <p className="text-red-800 mb-4">
              Your symptoms indicate a potential medical emergency. Please seek immediate care.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex items-center justify-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors">
                <Phone className="w-5 h-5" />
                <span>Call 911</span>
              </button>
              <button 
                onClick={() => navigate('/emergency')}
                className="flex items-center justify-center space-x-2 border-2 border-red-600 text-red-600 px-6 py-3 rounded-lg font-medium hover:bg-red-50 transition-colors"
              >
                <MapPin className="w-5 h-5" />
                <span>Find Nearest ER</span>
              </button>
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Next Steps</h3>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-[#1D6FA3]/80 text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Find Healthcare Providers</h4>
                <p className="text-gray-600 text-sm mt-1">
                  Browse {triageResult.careType.toLowerCase()} facilities near you that accept your insurance
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Book Your Appointment</h4>
                <p className="text-gray-600 text-sm mt-1">
                  Select your preferred provider and book an available appointment slot
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Prepare for Your Visit</h4>
                <p className="text-gray-600 text-sm mt-1">
                  Get directions, appointment reminders, and estimated costs
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => navigate('/search')}
              className="w-full bg-[#1D6FA3]/80 text-white py-4 rounded-lg font-semibold hover:bg-[#1D6FA3]/100 transition-colors flex items-center justify-center space-x-2"
            >
              <span>Find Healthcare Providers</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-center">
          <p className="text-sm text-gray-600">
            <strong>Medical Disclaimer:</strong> This AI assessment is for informational purposes only 
            and should not replace professional medical advice. Always consult with a healthcare provider 
            for proper diagnosis and treatment.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TriageResults;