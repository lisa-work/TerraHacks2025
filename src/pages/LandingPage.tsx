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
import Footer from '../components/layout/Footer';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen">

      {/* Hero Section */}
      <section className="bg-custom-healthcare text-gray-800 py-20 mx-auto h-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center bg-blue-400 bg-opacity-20 rounded-full px-4 py-2 mb-6">
                <Zap className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">AI-Powered Healthcare</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#1D6FA3] via-[#3C91E6] to-[#3f7485] bg-clip-text text-transparent drop-shadow-md">
                Skip The Wait, Start Healing
              </h1>
              
              <p className="text-md lg:text-lg mb-8 leading-relaxed text-[#1E3A5F]">
                Skip the guesswork. Our AI analyzes your symptoms, insurance, and location 
                to connect you with the perfect healthcare provider in seconds.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/symptoms"
                  className="inline-flex items-center justify-center bg-white text-[#1E3A5F] px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors group"
                >
                  Find Care Now
                  <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link
                  to="/emergency"
                  className="text-red-600 inline-flex items-center justify-center border-2 border-red-600 px-8 py-4 rounded-lg font-semibold hover:border-gray-100 hover:bg-white hover:text-[#1E3A5F] transition-colors"
                >
                  Emergency Care
                </Link>
              </div>
            </div>
            
            <div className="relative my-auto">
              <div className="bg-white bg-opacity-25 backdrop-blur-sm rounded-2xl p-8 border border-white border-opacity-20">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold bg-gradient-to-r from-[#1D6FA3] via-[#3C91E6] to-[#4A63E7] bg-clip-text text-transparent drop-shadow-md">Smart Triage</h3>
                      <p className="text-gray-600 text-sm">AI-powered symptom analysis</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold bg-gradient-to-r from-[#1D6FA3] via-[#3C91E6] to-[#4A63E7] bg-clip-text text-transparent drop-shadow-md">Location-Based</h3>
                      <p className="text-gray-600 text-sm">Find nearby providers instantly</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold bg-gradient-to-r from-[#1D6FA3] via-[#3C91E6] to-[#4A63E7] bg-clip-text text-transparent drop-shadow-md">Insurance Coverage</h3>
                      <p className="text-gray-600 text-sm">Transparent cost estimates</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="relative mt-5 shadow-lg">
        <svg
          className="absolute bottom-0 left-0 w-full h-32"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#ffffff"
            d="M0,160 C120,220 360,80 480,120 C600,160 720,300 840,280 C960,260 1080,120 1200,160 C1320,200 1440,320 1440,320 L0,320 Z"
          />
        </svg>
      </div>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#1D6FA3] via-[#3C91E6] to-[#3f7485] bg-clip-text text-transparent drop-shadow-md mb-4">
              Why Choose WaitlessOS?
            </h2>
            <p className="text-lg font-medium text-[#1E3A5F] max-w-3xl mx-auto">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-gray-50 rounded-2xl p-8 mb-20">
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

      <div className="relative shadow-lg">
        <svg
          className="absolute bottom-0 left-0 w-full h-32"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#f9fafb"
            d="M0,160 C120,220 360,80 480,120 C600,160 720,300 840,280 C960,260 1080,120 1200,160 C1320,200 1440,320 1440,320 L0,320 Z"
          />
        </svg>
      </div>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#1D6FA3] via-[#3C91E6] to-[#3f7485] bg-clip-text text-transparent drop-shadow-md mb-4">
              How It Works
            </h2>
            <p className="text-lg font-medium text-[#1E3A5F]">
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
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Describe Your Symptoms</h3>
              <p className="text-gray-600 text-md">
                Tell us about your symptoms, location, and insurance. Our AI will analyze your needs in seconds.
              </p>
            </div>

            <div className="text-center">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <div className="absolute top-10 left-1/2 transform translate-x-8 hidden md:block">
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Get Smart Recommendations</h3>
              <p className="text-gray-600 text-md">
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
              <p className="text-gray-600 text-md">
                Choose your preferred provider and book your appointment with real-time availability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-b from-[#f9fafb] via-[#ffffff] to-[#b9d4dc] py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#1D6FA3] via-[#3C91E6] to-[#3f7485] bg-clip-text text-transparent drop-shadow-md mb-6 ">
            Ready to Transform Your Healthcare Experience?
          </h2>
          <p className="text-lg text-[#1E3A5F] mb-8">
            Join thousands of users who've found faster, smarter healthcare with WaitlessOS
          </p>
          <Link
            to="/symptoms"
            className="inline-flex items-center bg-white text-[#1E3A5F] px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors group"
          >
            Get Started Now
            <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;