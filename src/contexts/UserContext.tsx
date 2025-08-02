import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  insurance: {
    provider: string;
    policyNumber: string;
    groupNumber: string;
  };
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('mediconnect_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email: string, password: string) => {
    // Mock login - in real app, this would call your auth API
    const mockUser: User = {
      id: '1',
      name: 'John Doe',
      email,
      phone: '+1-555-0123',
      location: {
        lat: 40.7128,
        lng: -74.0060,
        address: 'New York, NY'
      },
      insurance: {
        provider: 'Blue Cross Blue Shield',
        policyNumber: 'BC123456789',
        groupNumber: 'GRP001'
      }
    };
    
    setUser(mockUser);
    localStorage.setItem('mediconnect_user', JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mediconnect_user');
  };

  return (
    <UserContext.Provider value={{
      user,
      setUser,
      isAuthenticated: !!user,
      login,
      logout
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};