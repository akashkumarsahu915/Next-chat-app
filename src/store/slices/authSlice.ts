import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, LoginResponse } from '../../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

let initialUser = null;
let initialToken = null;
let initialIsAuthenticated = false;

try {
  const storedToken = localStorage.getItem('auth_token');
  const storedUser = localStorage.getItem('auth_user');
  
  // Robust check for a valid token
  const isValidToken = storedToken && storedToken !== 'undefined' && storedToken !== 'null';
  
  initialUser = (storedUser && isValidToken) ? JSON.parse(storedUser) : null;
  initialToken = isValidToken ? storedToken : null;
  initialIsAuthenticated = !!isValidToken;
} catch (e) {
  console.error('[STORAGE ERROR] Failed to load initial auth state:', e);
}

const initialState: AuthState = {
  user: initialUser,
  token: initialToken,
  isAuthenticated: initialIsAuthenticated,
  loading: false,
};


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<LoginResponse>) => {
      const { user, token } = action.payload;
      state.user = user || null;
      state.token = token || null;
      state.isAuthenticated = !!token;
      
      if (token) {
        try {
          localStorage.setItem('auth_token', token);
          if (user) {
            localStorage.setItem('auth_user', JSON.stringify(user));
          }
        } catch (storageError) {
          console.error('[STORAGE ERROR] Failed to save credentials to localStorage:', storageError);
          // Non-blocking: The user is still logged in to the Redux state
        }
      }
    },

    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const { setCredentials, setUser, setLoading, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
