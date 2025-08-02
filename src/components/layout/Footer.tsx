import React from 'react';
import { Heart, Shield, Phone, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-b from-[#b9d4dc] to-[#a1adc0] text-white">
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
            <p className="text-white mb-4 max-w-md">
              AI-powered healthcare booking platform that helps you find the right care, 
              at the right time, with transparent insurance coverage.
            </p>
            <div className="flex items-center space-x-2 text-sm">
              <Shield className="w-4 h-4 text-green-200" />
              <span className="text-white">HIPAA Compliant & Secure</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-white">
              <li><a href="/symptoms" className="hover:text-gray-200 transition-colors">Find Care</a></li>
              <li><a href="/emergency" className="hover:text-gray-200 transition-colors">Emergency</a></li>
              <li><a href="/dashboard" className="hover:text-gray-200 transition-colors">Dashboard</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <div className="space-y-3 text-white">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span className="text-sm">ourteamname@terrahacks2025</span>
              </div>
              <p className="text-sm">24/7 Emergency Support</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white mt-8 pt-8 flex flex-col md:flex-row justify-end items-center">
          <p className="text-white/90 text-sm">
            © 2025 MediConnect AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;