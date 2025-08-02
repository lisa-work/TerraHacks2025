import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Clock, 
  Shield, 
  MapPin, 
  Zap, 
  Star,
  ChevronRight,
  Heart,
  Users,
  Award
} from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center bg-blue-500 bg-opacity-20 rounded-full px-4 py-2 mb-6">
                <Zap className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">AI-Powered Healthcare</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Find the Right Care,
                <span className="text-blue-200"> Right Now</span>
              </h1>
              
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Skip the guesswork. Our AI analyzes your symptoms, insurance, and location 
                to connect you with the perfect healthcare provider in seconds.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/symptoms"
                  className="inline-flex items-center justify-center bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors group"
                >
                  Find Care Now
                  <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link
                  to="/emergency"
                  className="inline-flex items-center justify-center border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                >
                  Emergency Care
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8 border border-white border-opacity-20">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Smart Triage</h3>
                      <p className="text-blue-200 text-sm">AI-powered symptom analysis</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Location-Based</h3>
                      <p className="text-blue-200 text-sm">Find nearby providers instantly</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Insurance Coverage</h3>
                      <p className="text-blue-200 text-sm">Transparent cost estimates</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose MediConnect AI?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We've reimagined healthcare booking to be faster, smarter, and more transparent
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">AI-Powered Search</h3>
              <p className="text-gray-600">
                Our advanced AI analyzes your symptoms and preferences to recommend the most suitable healthcare providers
              </p>
            </div>

            <div className="text-center p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Real-Time Booking</h3>
              <p className="text-gray-600">
                Book appointments instantly with real-time availability and join waitlists for earlier slots
              </p>
            </div>

            <div className="text-center p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Insurance Transparency</h3>
              <p className="text-gray-600">
                Get upfront cost estimates and insurance coverage details before booking your appointment
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 bg-gray-50 rounded-2xl p-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">10,000+</div>
              <div className="text-gray-600">Healthcare Providers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">2 min</div>
              <div className="text-gray-600">Average Booking Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">98%</div>
              <div className="text-gray-600">User Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
              <div className="text-gray-600">Emergency Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get the care you need in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <div className="absolute top-10 left-1/2 transform translate-x-8 hidden md:block">
                  <ChevronRight className="w-6 h-6 text-gray-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Describe Your Symptoms</h3>
              <p className="text-gray-600">
                Tell us about your symptoms, location, and insurance. Our AI will analyze your needs in seconds.
              </p>
            </div>

            <div className="text-center">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <div className="absolute top-10 left-1/2 transform translate-x-8 hidden md:block">
                  <ChevronRight className="w-6 h-6 text-gray-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Get Smart Recommendations</h3>
              <p className="text-gray-600">
                Receive personalized provider recommendations with cost estimates and insurance coverage details.
              </p>
            </div>

            <div className="text-center">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Book Instantly</h3>
              <p className="text-gray-600">
                Choose your preferred provider and book your appointment with real-time availability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Healthcare Experience?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of users who've found faster, smarter healthcare with MediConnect AI
          </p>
          <Link
            to="/symptoms"
            className="inline-flex items-center bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors group"
          >
            Get Started Now
            <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;