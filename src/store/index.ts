import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import chatReducer from './slices/chatSlice';
import friendsReducer from './slices/friendsSlice';
import uiReducer from './slices/uiSlice';
import toastReducer from './slices/toastSlice';
import notificationReducer from './slices/notificationSlice';
import callReducer from './slices/callSlice';
import apiSlice from './rtk/apislice';

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
    chat: chatReducer,
    friends: friendsReducer,
    ui: uiReducer,
    toast: toastReducer,
    notifications: notificationReducer,
    call: callReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
