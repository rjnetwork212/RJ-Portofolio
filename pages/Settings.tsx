import React, { useState, useContext, useEffect } from 'react';
import { CategoryContext } from '../contexts/CategoryContext';
import { SettingsContext } from '../contexts/SettingsContext';
import type { Category, AppSettings } from '../types';

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string) => Promise<void>;
    initialName?: string;
    title: string;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, onSave, initialName = '', title }) => {
    const [name, setName] = useState(initialName);
    const [isSaving, setIsSaving] = useState(false);

    React.useEffect(() => {
        if (isOpen) {
            setName(initialName);
        }
    }, [isOpen, initialName]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            setIsSaving(true);
            try {
                await onSave(name.trim());
                onClose();
            } catch (error) {
                console.error("Failed to save:", error);
            } finally {
                setIsSaving(false);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-lg w-full max-w-md">
                <h2 className="text-xl font-bold mb-6">{title}</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Category Name"
                        required
                        className="w-full p-2 rounded bg-gray-100 dark:bg-slate-700"
                    />
                    <div className="flex justify-end space-x-4 pt-6">
                        <button type="button" onClick={onClose} disabled={isSaving} className="px-4 py-2 rounded bg-gray-200 dark:bg-slate-600 disabled:opacity-50">Cancel</button>
                        <button type="submit" disabled={isSaving} className="px-4 py-2 rounded bg-cyan-500 text-white font-semibold disabled:bg-cyan-800">
                            {isSaving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ManageCategories: React.FC = () => {
    const { categories, addCategory, editCategory, deleteCategory, addSubCategory, editSubCategory, deleteSubCategory, loading, error } = useContext(CategoryContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState<{
        title: string;
        onSave: (name: string) => Promise<void>;
        initialName?: string;
    } | null>(null);
    
    const handleOpenModal = (title: string, onSave: (name: string) => Promise<void>, initialName?: string) => {
        setModalConfig({ title, onSave, initialName });
        setIsModalOpen(true);
    };

    const handleAddCategory = () => handleOpenModal('Add New Category', addCategory);
    const handleEditCategory = (category: Category) => handleOpenModal('Edit Category', (newName) => editCategory(category.id, newName), category.name);
    const handleDeleteCategory = async (id: string) => {
        if (window.confirm("Are you sure? This will delete the category and all its sub-categories.")) await deleteCategory(id);
    };
    const handleAddSubCategory = (categoryId: string) => handleOpenModal('Add New Sub-category', (name) => addSubCategory(categoryId, name));
    const handleEditSubCategory = (cat: Category, sub: Category['subCategories'][0]) => handleOpenModal('Edit Sub-category', (newName) => editSubCategory(cat.id, sub.id, newName), sub.name);
    const handleDeleteSubCategory = async (catId: string, subId: string) => {
        if (window.confirm("Are you sure you want to delete this sub-category?")) await deleteSubCategory(catId, subId);
    };

    return (
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-gray-200 dark:border-slate-800">
            {modalConfig && <CategoryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} {...modalConfig} />}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Manage Categories</h2>
                <button onClick={handleAddCategory} className="bg-cyan-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-cyan-600 transition-colors text-sm">
                    Add Category
                </button>
            </div>
            {loading && <p>Loading categories...</p>}
            {error && <p className="text-red-500 bg-red-500/10 p-4 rounded-lg">Error: {error}</p>}
            {!loading && !error && (
                <div className="space-y-6">
                    {categories.map(cat => (
                        <div key={cat.id} className="bg-gray-50 dark:bg-slate-950/50 p-4 rounded-xl">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{cat.name}</h3>
                                <div className="flex items-center space-x-2">
                                    <button onClick={() => handleEditCategory(cat)} className="p-2 text-slate-500 hover:text-cyan-500 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800">✏️</button>
                                    <button onClick={() => handleDeleteCategory(cat.id)} className="p-2 text-slate-500 hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800">🗑️</button>
                                    <button onClick={() => handleAddSubCategory(cat.id)} className="p-2 text-slate-500 hover:text-green-500 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800">➕</button>
                                </div>
                            </div>
                            <div className="mt-4 pl-4 border-l-2 border-slate-200 dark:border-slate-700">
                                {cat.subCategories.length > 0 ? (
                                    <ul className="space-y-2">
                                        {cat.subCategories.map(sub => (
                                            <li key={sub.id} className="flex justify-between items-center bg-white dark:bg-slate-800/50 p-3 rounded-lg">
                                                <span className="text-slate-600 dark:text-slate-300">{sub.name}</span>
                                                <div className="flex items-center space-x-1">
                                                    <button onClick={() => handleEditSubCategory(cat, sub)} className="p-1 text-slate-500 hover:text-cyan-500 rounded-full text-sm">✏️</button>
                                                    <button onClick={() => handleDeleteSubCategory(cat.id, sub.id)} className="p-1 text-slate-500 hover:text-red-500 rounded-full text-sm">🗑️</button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-slate-500 italic text-sm">No sub-categories yet.</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const ApiConnections: React.FC = () => {
    const { settings, loading, error, updateSettings } = useContext(SettingsContext);
    const [formData, setFormData] = useState<AppSettings>({ geminiApiKey: '', marketDataApiKey: '', plaidClientId: '', plaidSecret: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

    useEffect(() => {
        if (settings) {
            setFormData(settings);
        }
    }, [settings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({...prev, [e.target.name]: e.target.value}));
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setSaveMessage(null);
        try {
            await updateSettings(formData);
            setSaveMessage({type: 'success', text: 'Settings saved successfully!'});
        } catch (err) {
            if(err instanceof Error) setSaveMessage({type: 'error', text: err.message});
            else setSaveMessage({type: 'error', text: 'An unknown error occurred.'});
        } finally {
            setIsSaving(false);
            setTimeout(() => setSaveMessage(null), 3000);
        }
    }
    
    if (loading) return <p>Loading settings...</p>;
    if (error && !settings) return <p className="text-red-500 bg-red-500/10 p-4 rounded-lg">Error loading settings: {error}</p>;

    return (
         <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-gray-200 dark:border-slate-800">
             <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">API & Connections</h2>
             <p className="text-slate-500 mb-6">Manage your API keys for third-party services.</p>

             <form onSubmit={handleSave} className="space-y-6">
                <div>
                    <label htmlFor="geminiApiKey" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Gemini API Key</label>
                    <input type="password" id="geminiApiKey" name="geminiApiKey" value={formData.geminiApiKey} onChange={handleChange} className="w-full p-2 rounded bg-gray-100 dark:bg-slate-700 border border-transparent focus:border-cyan-500" />
                </div>
                 <div>
                    <label htmlFor="marketDataApiKey" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Market Data API Key</label>
                    <input type="password" id="marketDataApiKey" name="marketDataApiKey" value={formData.marketDataApiKey} onChange={handleChange} className="w-full p-2 rounded bg-gray-100 dark:bg-slate-700 border border-transparent focus:border-cyan-500" />
                </div>
                 <div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mt-4 mb-2">Plaid (for Bank Sync)</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                             <label htmlFor="plaidClientId" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Client ID</label>
                             <input type="text" id="plaidClientId" name="plaidClientId" value={formData.plaidClientId} onChange={handleChange} className="w-full p-2 rounded bg-gray-100 dark:bg-slate-700 border border-transparent focus:border-cyan-500" />
                         </div>
                         <div>
                            <label htmlFor="plaidSecret" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Secret</label>
                             <input type="password" id="plaidSecret" name="plaidSecret" value={formData.plaidSecret} onChange={handleChange} className="w-full p-2 rounded bg-gray-100 dark:bg-slate-700 border border-transparent focus:border-cyan-500" />
                         </div>
                     </div>
                </div>

                <div className="flex items-center justify-end pt-4 gap-4">
                    {saveMessage && <p className={`${saveMessage.type === 'success' ? 'text-green-500' : 'text-red-500'} text-sm`}>{saveMessage.text}</p>}
                    <button type="submit" disabled={isSaving} className="bg-cyan-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-cyan-600 transition-colors disabled:bg-slate-600">
                        {isSaving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
             </form>
        </div>
    );
};


const Settings: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Settings</h1>
            <ApiConnections />
            <ManageCategories />
        </div>
    );
};

export default Settings;