import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  theme: 'light' | 'dark';
  isSidebarOpen: boolean;
  activeModal: string | null;
  notificationSettings: {
    pushEnabled: boolean;
    newMessages: boolean;
    friendRequests: boolean;
    systemAlerts: boolean;
    browserNotifications: boolean;
    emailAlerts: boolean;
  };
}

const initialState: UIState = {
  theme: 'light',
  isSidebarOpen: true,
  activeModal: null,
  notificationSettings: {
    pushEnabled: true,
    newMessages: true,
    friendRequests: true,
    systemAlerts: true,
    browserNotifications: true,
    emailAlerts: false,
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.isSidebarOpen = action.payload;
    },
    setActiveModal: (state, action: PayloadAction<string | null>) => {
      state.activeModal = action.payload;
    },
    updateNotificationSettings: (state, action: PayloadAction<Partial<UIState['notificationSettings']>>) => {
      state.notificationSettings = { ...state.notificationSettings, ...action.payload };
    },
  },
});

export const { toggleTheme, setSidebarOpen, setActiveModal, updateNotificationSettings } = uiSlice.actions;
export default uiSlice.reducer;
