// src/stores/authStore.ts
import { create } from 'zustand';
import { User } from '@/types/userType';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    accessToken: string | null;
    refreshToken: string | null;
    setUser: (user: User | null) => void;
    setIsAuthenticated: (value: boolean) => void;
    login: (accessToken: string, refreshToken: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
    setUser: (user) => set({ user }),
    setIsAuthenticated: (value) => set({ isAuthenticated: value }),
    login: (accessToken, refreshToken) => 
        set({ 
            accessToken, 
            refreshToken, 
            isAuthenticated: true 
        }),
    logout: () => 
        set({ 
            user: null, 
            isAuthenticated: false, 
            accessToken: null, 
            refreshToken: null 
        }),
}));
