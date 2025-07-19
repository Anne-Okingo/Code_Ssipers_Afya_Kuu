'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  profileName: string; // First part of email before @
  userType: 'doctor' | 'admin';
  hospitalName?: string;
  licenseNumber?: string;
  branchRegistration?: string;
  adminName?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, userType: 'doctor' | 'admin') => Promise<boolean>;
  signup: (userData: SignupData) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

interface SignupData {
  email: string;
  password: string;
  userType: 'doctor' | 'admin';
  hospitalName?: string;
  licenseNumber?: string;
  branchRegistration?: string;
  adminName?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('afya_kuu_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('afya_kuu_user');
      }
    }
    setIsLoading(false);
  }, []);

  const extractProfileName = (email: string): string => {
    return email.split('@')[0];
  };

  const login = async (email: string, password: string, userType: 'doctor' | 'admin'): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API call - In real app, this would be an actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user exists in localStorage (simulated database)
      const users = JSON.parse(localStorage.getItem('afya_kuu_users') || '[]');
      const existingUser = users.find((u: any) => 
        u.email === email && u.userType === userType && u.password === password
      );
      
      if (existingUser) {
        const userData: User = {
          id: existingUser.id,
          email: existingUser.email,
          profileName: extractProfileName(existingUser.email),
          userType: existingUser.userType,
          hospitalName: existingUser.hospitalName,
          licenseNumber: existingUser.licenseNumber,
          branchRegistration: existingUser.branchRegistration,
          adminName: existingUser.adminName
        };
        
        setUser(userData);
        localStorage.setItem('afya_kuu_user', JSON.stringify(userData));

        // Set cookie for middleware authentication
        document.cookie = `afya_kuu_user=${JSON.stringify(userData)}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days

        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: SignupData): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user already exists
      const users = JSON.parse(localStorage.getItem('afya_kuu_users') || '[]');
      const existingUser = users.find((u: any) => 
        u.email === userData.email && u.userType === userData.userType
      );
      
      if (existingUser) {
        return false; // User already exists
      }
      
      // Create new user
      const newUser = {
        id: Date.now().toString(),
        email: userData.email,
        password: userData.password,
        userType: userData.userType,
        hospitalName: userData.hospitalName,
        licenseNumber: userData.licenseNumber,
        branchRegistration: userData.branchRegistration,
        adminName: userData.adminName,
        createdAt: new Date().toISOString()
      };
      
      // Save to localStorage (simulated database)
      users.push(newUser);
      localStorage.setItem('afya_kuu_users', JSON.stringify(users));
      
      // Auto-login after signup
      const userSession: User = {
        id: newUser.id,
        email: newUser.email,
        profileName: extractProfileName(newUser.email),
        userType: newUser.userType,
        hospitalName: newUser.hospitalName,
        licenseNumber: newUser.licenseNumber,
        branchRegistration: newUser.branchRegistration,
        adminName: newUser.adminName
      };
      
      setUser(userSession);
      localStorage.setItem('afya_kuu_user', JSON.stringify(userSession));

      // Set cookie for middleware authentication
      document.cookie = `afya_kuu_user=${JSON.stringify(userSession)}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days
      
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('afya_kuu_user');

    // Clear cookie
    document.cookie = 'afya_kuu_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    signup,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
