import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, LoginResponse } from '../../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const storedToken = localStorage.getItem('auth_token');
const storedUser = localStorage.getItem('auth_user');

// Robust check for a valid token
const isValidToken = storedToken && storedToken !== 'undefined' && storedToken !== 'null';

const initialState: AuthState = {
  user: (storedUser && isValidToken) ? JSON.parse(storedUser) : null,
  token: isValidToken ? storedToken : null,
  isAuthenticated: !!isValidToken,
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
        localStorage.setItem('auth_token', token);
        if (user) {
          localStorage.setItem('auth_user', JSON.stringify(user));
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
