import React, { createContext, useState, useEffect } from 'react';
import type { Category } from '../types';
import { supabase } from '../lib/supabaseClient';

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
            setError(null);
            // Use Supabase's relational query feature.
            // This assumes a foreign key relationship is set up in Supabase
            // from sub_categories.category_id to categories.id
            const { data, error } = await supabase
                .from('categories')
                .select('id, name, subCategories:sub_categories(id, name)');

            if (error) {
                if (error.message.includes('relation') && error.message.includes('does not exist')) {
                     throw new Error("Database table not found. Please check your Supabase schema.");
                }
                 if (error.message.includes("could not find a relationship")) {
                    throw new Error("Supabase relationship between categories and sub_categories might be missing. Please check your table foreign keys.");
                }
                throw error;
            }
            
            // The data from Supabase should match the Category type structure now
            setCategories(data as Category[]);

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

    const addCategory = async (name: string) => {
        const { error } = await supabase.from('categories').insert({ name });
        if (error) throw error;
        await fetchCategories();
    };

    const editCategory = async (id: string, newName: string) => {
        const { error } = await supabase.from('categories').update({ name: newName }).eq('id', id);
        if (error) throw error;
        await fetchCategories();
    };
    
    const deleteCategory = async (id: string) => {
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) throw error;
        await fetchCategories();
    };

    const addSubCategory = async (categoryId: string, subCategoryName: string) => {
        const { error } = await supabase.from('sub_categories').insert({ name: subCategoryName, category_id: categoryId });
        if (error) throw error;
        await fetchCategories();
    };

    const editSubCategory = async (categoryId: string, subCategoryId: string, newName: string) => {
        const { error } = await supabase.from('sub_categories').update({ name: newName }).eq('id', subCategoryId);
        if (error) throw error;
        await fetchCategories();
    };

    const deleteSubCategory = async (categoryId: string, subCategoryId: string) => {
        const { error } = await supabase.from('sub_categories').delete().eq('id', subCategoryId);
        if (error) throw error;
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