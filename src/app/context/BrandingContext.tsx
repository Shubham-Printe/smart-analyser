'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'react-hot-toast';

export interface BrandingConfig {
  logo: {
    url: string | null;
    name: string | null;
    size: number; // in pixels
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    gradient: {
      start: string;
      end: string;
    };
  };
  appName: string;
  tagline: string;
  favicon: string | null;
}

interface BrandingContextType {
  branding: BrandingConfig;
  updateLogo: (file: File) => Promise<void>;
  updateColors: (colors: Partial<BrandingConfig['colors']>) => void;
  updateAppInfo: (info: { appName?: string; tagline?: string }) => void;
  resetToDefault: () => void;
  isLoading: boolean;
  saveBranding: () => Promise<void>;
  loadBranding: () => Promise<void>;
}

const defaultBranding: BrandingConfig = {
  logo: {
    url: null,
    name: null,
    size: 40,
  },
  colors: {
    primary: '#007AFF',
    secondary: '#34C759',
    accent: '#FF9500',
    gradient: {
      start: '#007AFF',
      end: '#34C759',
    },
  },
  appName: 'Smart Analyzer',
  tagline: 'Powered by Intelligence',
  favicon: null,
};

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export const useBranding = () => {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
};

interface BrandingProviderProps {
  children: ReactNode;
}

export const BrandingProvider: React.FC<BrandingProviderProps> = ({ children }) => {
  const [branding, setBranding] = useState<BrandingConfig>(defaultBranding);
  const [isLoading, setIsLoading] = useState(false);

  // Load branding from localStorage on mount
  useEffect(() => {
    loadBranding();
  }, []);

  // Update CSS custom properties when colors change
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--brand-primary', branding.colors.primary);
    root.style.setProperty('--brand-secondary', branding.colors.secondary);
    root.style.setProperty('--brand-accent', branding.colors.accent);
    root.style.setProperty('--brand-gradient-start', branding.colors.gradient.start);
    root.style.setProperty('--brand-gradient-end', branding.colors.gradient.end);
    
    // Update favicon if custom one is set
    if (branding.favicon) {
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (favicon) {
        favicon.href = branding.favicon;
      }
    }
  }, [branding]);

  const updateLogo = async (file: File): Promise<void> => {
    setIsLoading(true);
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file');
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Logo file size must be less than 5MB');
      }

      // Convert to base64 for storage
      const base64 = await fileToBase64(file);
      
      setBranding(prev => ({
        ...prev,
        logo: {
          ...prev.logo,
          url: base64,
          name: file.name,
        }
      }));

      toast.success('Logo updated successfully!');
    } catch (error) {
      console.error('Logo upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload logo');
    } finally {
      setIsLoading(false);
    }
  };

  const updateColors = (colors: Partial<BrandingConfig['colors']>) => {
    setBranding(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        ...colors,
      }
    }));
    toast.success('Colors updated successfully!');
  };

  const updateAppInfo = (info: { appName?: string; tagline?: string }) => {
    setBranding(prev => ({
      ...prev,
      ...info,
    }));
    toast.success('App information updated!');
  };

  const resetToDefault = () => {
    setBranding(defaultBranding);
    localStorage.removeItem('brandingConfig');
    toast.success('Branding reset to default');
  };

  const saveBranding = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Save to localStorage
      localStorage.setItem('brandingConfig', JSON.stringify(branding));
      
      // TODO: Also save to database for persistence across devices
      // await axios.post('/api/branding', branding);
      
      toast.success('Branding preferences saved!');
    } catch (error) {
      console.error('Save branding error:', error);
      toast.error('Failed to save branding preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const loadBranding = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Load from localStorage
      const saved = localStorage.getItem('brandingConfig');
      if (saved) {
        const parsedBranding = JSON.parse(saved);
        setBranding({ ...defaultBranding, ...parsedBranding });
      }
      
      // TODO: Also load from database
      // const response = await axios.get('/api/branding');
      // if (response.data) {
      //   setBranding({ ...defaultBranding, ...response.data });
      // }
    } catch (error) {
      console.error('Load branding error:', error);
      // Silently fail and use defaults
    } finally {
      setIsLoading(false);
    }
  };

  const value: BrandingContextType = {
    branding,
    updateLogo,
    updateColors,
    updateAppInfo,
    resetToDefault,
    isLoading,
    saveBranding,
    loadBranding,
  };

  return (
    <BrandingContext.Provider value={value}>
      {children}
    </BrandingContext.Provider>
  );
};

// Helper function to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}; 