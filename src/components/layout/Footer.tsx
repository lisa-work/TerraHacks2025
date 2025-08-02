import React from 'react';
import { Heart, Shield, Phone, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">MediConnect AI</span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              AI-powered healthcare booking platform that helps you find the right care, 
              at the right time, with transparent insurance coverage.
            </p>
            <div className="flex items-center space-x-2 text-sm">
              <Shield className="w-4 h-4 text-green-500" />
              <span className="text-gray-400">HIPAA Compliant & Secure</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/symptoms" className="hover:text-white transition-colors">Find Care</a></li>
              <li><a href="/emergency" className="hover:text-white transition-colors">Emergency</a></li>
              <li><a href="/dashboard" className="hover:text-white transition-colors">Dashboard</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <div className="space-y-3 text-gray-400">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span className="text-sm">(555) 123-MEDI</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span className="text-sm">support@mediconnect.ai</span>
              </div>
              <p className="text-sm">24/7 Emergency Support</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 MediConnect AI. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">HIPAA Notice</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;