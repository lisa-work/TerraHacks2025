import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Star,
  User,
  Bell,
  Settings,
  CreditCard,
  FileText,
  ChevronRight,
  Plus
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

interface Appointment {
  id: string;
  clinicName: string;
  clinicAddress: string;
  date: string;
  time: string;
  type: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  doctor: string;
  cost: number;
}

const Dashboard: React.FC = () => {
  const { user, isAuthenticated, updateUser } = useUser();
  const [activeTab, setActiveTab] = useState('appointments');
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location?.address || '',
    insuranceProvider: user?.insurance?.provider || '',
    policyNumber: user?.insurance?.policyNumber || ''
  });

  useEffect(() => {
    setProfile({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      location: user?.location?.address || '',
      insuranceProvider: user?.insurance?.provider || '',
      policyNumber: user?.insurance?.policyNumber || ''
    });
  }, [user]);

  const handleSaveProfile = async () => {
    try {
      await updateUser({
        name: profile.name,
        phone: profile.phone,
        location: { ...user?.location, address: profile.location },
        insurance: { ...user?.insurance, provider: profile.insuranceProvider, policyNumber: profile.policyNumber }
      });
      toast.success('Profile updated');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update profile');
    }
  };

  const mockAppointments: Appointment[] = [
    {
      id: '1',
      clinicName: 'Manhattan General Hospital',
      clinicAddress: '123 Medical Center Dr, New York, NY',
      date: '2025-09-15',
      time: '09:00',
      type: 'General Consultation',
      status: 'upcoming',
      doctor: 'Dr. Sarah Johnson',
      cost: 180
    },
    {
      id: '2',
      clinicName: 'CityMed Urgent Care',
      clinicAddress: '456 Health Plaza, New York, NY',
      date: '2025-8-10',
      time: '14:30',
      type: 'Follow-up',
      status: 'completed',
      doctor: 'Dr. Michael Chen',
      cost: 120
    },
    {
      id: '3',
      clinicName: 'Downtown Family Clinic',
      clinicAddress: '789 Wellness Ave, New York, NY',
      date: '2025-10-20',
      time: '11:00',
      type: 'Specialist Visit',
      status: 'upcoming',
      doctor: 'Dr. Emily Rodriguez',
      cost: 250
    }
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign In Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to view your dashboard</p>
          <button className="bg-[#1D6FA3]/80 text-white px-6 py-3 rounded-lg hover:bg-[#1D6FA3] transition-colors">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const upcomingAppointments = mockAppointments.filter(apt => apt.status === 'upcoming');
  const completedAppointments = mockAppointments.filter(apt => apt.status === 'completed');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'blue';
      case 'completed': return 'green';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1E3A5F] mb-2">
            Welcome back, {user?.name}
          </h1>
          <p className="text-gray-600">
            Manage your appointments and health information
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 ">
          <div className="bg-white rounded-xl shadow-sm hover:shadow-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#1D6FA3]/10 rounded-lg">
                <Calendar className="w-6 h-6 text-[#1D6FA3]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 ">{upcomingAppointments.length}</p>
                <p className="text-sm text-gray-600">Upcoming</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm hover:shadow-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{completedAppointments.length}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm hover:shadow-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">$550</p>
                <p className="text-sm text-gray-600">Total Saved</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm hover:shadow-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Star className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">4.8</p>
                <p className="text-sm text-gray-600">Avg Rating</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tab Navigation */}
            <div className="bg-white rounded-xl shadow-sm mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'appointments', label: 'Appointments', icon: Calendar },
                    { id: 'history', label: 'History', icon: FileText },
                    { id: 'settings', label: 'Settings', icon: Settings }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                          activeTab === tab.id
                            ? 'border-[#1D6FA3] text-[#1D6FA3]'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="p-6">
                {/* Appointments Tab */}
                {activeTab === 'appointments' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-gray-900">Upcoming Appointments</h2>
                      <Link to="/symptoms">
                        <button className="flex items-center space-x-2 bg-[#1D6FA3] text-white px-4 py-2 rounded-lg hover:bg-[#1D6FA3]/80 transition-colors">
                          <Plus className="w-4 h-4" />
                          <span>Book New</span>
                        </button>
                      </Link>
                    </div>

                    <div className="space-y-4">
                      {upcomingAppointments.map((appointment) => (
                        <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="font-semibold text-gray-900">{appointment.clinicName}</h3>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${getStatusColor(appointment.status)}-100 text-${getStatusColor(appointment.status)}-800 capitalize`}>
                                  {appointment.status}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                <div className="flex items-center space-x-2">
                                  <Calendar className="w-4 h-4" />
                                  <span>{new Date(appointment.date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Clock className="w-4 h-4" />
                                  <span>{appointment.time}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <User className="w-4 h-4" />
                                  <span>{appointment.doctor}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <CreditCard className="w-4 h-4" />
                                  <span>${appointment.cost}</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2 mt-2 text-sm text-gray-500">
                                <MapPin className="w-4 h-4" />
                                <span>{appointment.clinicAddress}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* History Tab */}
                {activeTab === 'history' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-gray-900">Appointment History</h2>
                      {/* <button className="flex items-center space-x-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <Filter className="w-4 h-4" />
                        <span>Filter</span>
                      </button> */}
                    </div>

                    <div className="space-y-4">
                      {completedAppointments.map((appointment) => (
                        <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="font-semibold text-gray-900">{appointment.clinicName}</h3>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${getStatusColor(appointment.status)}-100 text-${getStatusColor(appointment.status)}-800 capitalize`}>
                                  {appointment.status}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                <div className="flex items-center space-x-2">
                                  <Calendar className="w-4 h-4" />
                                  <span>{new Date(appointment.date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <User className="w-4 h-4" />
                                  <span>{appointment.doctor}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="text-lg font-semibold text-gray-900">${appointment.cost}</div>
                              <button className="text-sm text-[#1D6FA3] hover:text-[#1D6FA3]/80">
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Account Settings</h2>
                    
                    <div className="space-y-6">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-4">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                              type="text"
                              value={profile.name}
                              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                              type="email"
                              value={profile.email}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              readOnly
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input
                              type="tel"
                              value={profile.phone}
                              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                            <input
                              type="text"
                              value={profile.location}
                              onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-4">Insurance Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                            <input
                              type="text"
                              value={profile.insuranceProvider}
                              onChange={(e) => setProfile({ ...profile, insuranceProvider: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Policy Number</label>
                            <input
                              type="text"
                              value={profile.policyNumber}
                              onChange={(e) => setProfile({ ...profile, policyNumber: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-4">Notification Preferences</h3>
                        <div className="space-y-3">
                          <label className="flex items-center space-x-3">
                            <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                            <span className="text-sm text-gray-700">Email appointment reminders</span>
                          </label>
                        </div>
                      </div>

                      <div className="text-right">
                        <button
                          onClick={handleSaveProfile}
                          className="mt-4 bg-[#1D6FA3]/80 text-white px-4 py-2 rounded-lg hover:bg-[#1D6FA3] transition-colors"
                        >
                          Save Changes
                        </button>
                      </div>
                      </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Next Appointment */}
              {upcomingAppointments.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Next Appointment</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {new Date(upcomingAppointments[0].date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{upcomingAppointments[0].time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{upcomingAppointments[0].clinicName}</span>
                    </div>
                  </div>
                  {/* <button className="w-full mt-4 bg-[#1D6FA3]/80 text-white py-2 rounded-lg hover:bg-[#1D6FA3] transition-colors">
                    View Details
                  </button> */}
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link to="/symptoms">
                    <button className="w-full flex items-center space-x-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <Plus className="w-5 h-5 text-[#1D6FA3]" />
                      <span className="text-sm font-medium text-gray-900">Book Appointment</span>
                    </button>
                  </Link>
                  <button className="w-full flex items-center space-x-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <FileText className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-900">View Records</span>
                  </button>
                </div>
              </div>

              {/* Health Tips */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                <h3 className="font-semibold text-blue-900 mb-2">Health Tip</h3>
                <p className="text-sm text-blue-800">
                  Regular check-ups can help detect health issues early. Schedule your annual physical today!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;