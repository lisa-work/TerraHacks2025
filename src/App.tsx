import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import { ClinicProvider } from './contexts/ClinicContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import LandingPage from './pages/LandingPage';
import SymptomForm from './pages/SymptomForm';
import TriageResults from './pages/TriageResults';
import SearchResults from './pages/SearchResults';
import BookingPage from './pages/BookingPage';
import Dashboard from './pages/Dashboard';
import EmergencyMode from './pages/EmergencyMode';

function App() {
  return (
    <UserProvider>
      <ClinicProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/symptoms" element={<SymptomForm />} />
                <Route path="/triage" element={<TriageResults />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/booking/:clinicId" element={<BookingPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/emergency" element={<EmergencyMode />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </ClinicProvider>
    </UserProvider>
  );
}

export default App;