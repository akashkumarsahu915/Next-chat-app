import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types';

export type CallStatus = 'idle' | 'ringing' | 'active' | 'ended';

interface CallState {
  status: CallStatus;
  caller: User | null;
  receiver: User | null;
  isIncoming: boolean;
  chatId: string | null;
  localStream: string | null; // Stream ID or boolean to indicate activity
  remoteStream: string | null;
  isMuted: boolean;
  isCameraOff: boolean;
}

const initialState: CallState = {
  status: 'idle',
  caller: null,
  receiver: null,
  isIncoming: false,
  chatId: null,
  localStream: null,
  remoteStream: null,
  isMuted: false,
  isCameraOff: false,
};

const callSlice = createSlice({
  name: 'call',
  initialState,
  reducers: {
    initiateCall: (state, action: PayloadAction<{ receiver: User; chatId: string }>) => {
      state.status = 'ringing';
      state.receiver = action.payload.receiver;
      state.chatId = action.payload.chatId;
      state.isIncoming = false;
    },
    incomingCall: (state, action: PayloadAction<{ caller: User; chatId: string }>) => {
      state.status = 'ringing';
      state.caller = action.payload.caller;
      state.chatId = action.payload.chatId;
      state.isIncoming = true;
    },
    acceptCall: (state) => {
      state.status = 'active';
    },
    setCallActive: (state) => {
      state.status = 'active';
    },
    endCall: (state) => {
      state.status = 'idle';
      state.caller = null;
      state.receiver = null;
      state.isIncoming = false;
      state.chatId = null;
      state.localStream = null;
      state.remoteStream = null;
      state.isMuted = false;
      state.isCameraOff = false;
    },
    toggleMute: (state) => {
      state.isMuted = !state.isMuted;
    },
    toggleCamera: (state) => {
      state.isCameraOff = !state.isCameraOff;
    },
  },
});

export const { 
  initiateCall, 
  incomingCall, 
  acceptCall, 
  setCallActive, 
  endCall, 
  toggleMute, 
  toggleCamera 
} = callSlice.actions;

export default callSlice.reducer;
