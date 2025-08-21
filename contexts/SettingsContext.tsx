import React, { createContext, useState, useEffect } from 'react';
import type { AppSettings } from '../types';
import { supabase } from '../lib/supabaseClient';

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
            setError(null);
            
            const { data, error } = await supabase
                .from('app_settings')
                .select('settings')
                .limit(1)
                .single();

            if (error) throw error;
            
            setSettings(data.settings);

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
            const { data, error } = await supabase
                .from('app_settings')
                .update({ settings: newSettings })
                .eq('id', 1) // Assuming settings are stored in a single row with id=1
                .select()
                .single();

            if (error) throw error;

            setSettings(data.settings);
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