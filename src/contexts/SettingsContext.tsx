
import React, { createContext, useContext, useState, useCallback } from 'react';

interface Settings {
  webhookUrl: string;
  maxPeticoesUsuario: number;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  saveSettings: () => Promise<boolean>;
  isLoading: boolean;
  lastSaved: Date | null;
}

const defaultSettings: Settings = {
  webhookUrl: '',
  maxPeticoesUsuario: 5,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const updateSettings = useCallback((newSettings: Partial<Settings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  }, []);

  const saveSettings = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simular salvamento assíncrono
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Aqui os dados já estão persistidos no contexto global
      setLastSaved(new Date());
      
      return true;
    } catch (error) {
      console.error('Erro ao salvar:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = {
    settings,
    updateSettings,
    saveSettings,
    isLoading,
    lastSaved
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useGlobalSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useGlobalSettings deve ser usado dentro do SettingsProvider');
  }
  return context;
};
