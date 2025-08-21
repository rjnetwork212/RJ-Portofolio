import React, { createContext, useState, useEffect } from 'react';
import type { Category } from '../types';

interface CategoryContextType {
    categories: Category[];
    loading: boolean;
    error: string | null;
    fetchCategories: () => Promise<void>;
    addCategory: (name: string) => Promise<void>;
    editCategory: (id: string, newName: string) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
    addSubCategory: (categoryId: string, subCategoryName: string) => Promise<void>;
    editSubCategory: (categoryId: string, subCategoryId: string, newName: string) => Promise<void>;
    deleteSubCategory: (categoryId: string, subCategoryId: string) => Promise<void>;
}

export const CategoryContext = createContext<CategoryContextType>({
    categories: [],
    loading: true,
    error: null,
    fetchCategories: async () => {},
    addCategory: async () => {},
    editCategory: async () => {},
    deleteCategory: async () => {},
    addSubCategory: async () => {},
    editSubCategory: async () => {},
    deleteSubCategory: async () => {},
});

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/categories');
            if (!response.ok) throw new Error('Failed to fetch categories.');
            const data = await response.json();
            setCategories(data);
            setError(null);
        } catch (err) {
            if (err instanceof Error) setError(err.message);
            else setError('An unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const apiRequest = async (url: string, method: string, body?: object) => {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: body ? JSON.stringify(body) : undefined,
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to ${method} data at ${url}`);
        }
        return response.json();
    };

    const addCategory = async (name: string) => {
        await apiRequest('/api/categories', 'POST', { name });
        await fetchCategories();
    };

    const editCategory = async (id: string, newName: string) => {
        await apiRequest(`/api/categories/${id}`, 'PUT', { name: newName });
        await fetchCategories();
    };
    
    const deleteCategory = async (id: string) => {
        await apiRequest(`/api/categories/${id}`, 'DELETE');
        await fetchCategories();
    };

    const addSubCategory = async (categoryId: string, subCategoryName: string) => {
        await apiRequest(`/api/categories/${categoryId}/subcategories`, 'POST', { name: subCategoryName });
        await fetchCategories();
    };

    const editSubCategory = async (categoryId: string, subCategoryId: string, newName: string) => {
        await apiRequest(`/api/categories/${categoryId}/subcategories/${subCategoryId}`, 'PUT', { name: newName });
        await fetchCategories();
    };

    const deleteSubCategory = async (categoryId: string, subCategoryId: string) => {
        await apiRequest(`/api/categories/${categoryId}/subcategories/${subCategoryId}`, 'DELETE');
        await fetchCategories();
    };

    return (
        <CategoryContext.Provider value={{
            categories,
            loading,
            error,
            fetchCategories,
            addCategory,
            editCategory,
            deleteCategory,
            addSubCategory,
            editSubCategory,
            deleteSubCategory,
        }}>
            {children}
        </CategoryContext.Provider>
    );
};
