import React, { createContext, useState, useEffect } from 'react';
import type { AppSettings } from '../types';

interface SettingsContextType {
    settings: AppSettings | null;
    loading: boolean;
    error: string | null;
    updateSettings: (newSettings: AppSettings) => Promise<void>;
}

export const SettingsContext = createContext<SettingsContextType>({
    settings: null,
    loading: true,
    error: null,
    updateSettings: async () => {},
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/settings');
            if (!response.ok) throw new Error('Failed to fetch settings.');
            const data = await response.json();
            setSettings(data);
            setError(null);
        } catch (err) {
            if (err instanceof Error) setError(err.message);
            else setError('An unknown error occurred');
            // Provide default empty state on error so the form doesn't crash
            setSettings({ geminiApiKey: '', marketDataApiKey: '', plaidClientId: '', plaidSecret: '' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const updateSettings = async (newSettings: AppSettings) => {
        try {
            const response = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSettings),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update settings');
            }
            const updatedData = await response.json();
            setSettings(updatedData);
        } catch (err) {
             if (err instanceof Error) throw err;
             throw new Error('An unknown error occurred while updating settings.');
        }
    };
    
    return (
        <SettingsContext.Provider value={{ settings, loading, error, updateSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};
