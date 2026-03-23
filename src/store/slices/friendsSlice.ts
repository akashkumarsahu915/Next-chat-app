import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, FriendRequest } from '../../types';

interface FriendsState {
  friends: User[];
  incomingRequests: FriendRequest[];
  sentRequests: FriendRequest[];
  blockedUserIds: string[];
}

const initialState: FriendsState = {
  friends: [],
  incomingRequests: [],
  sentRequests: [],
  blockedUserIds: [],
};

const friendsSlice = createSlice({
  name: 'friends',
  initialState,
  reducers: {
    setFriends: (state, action: PayloadAction<User[]>) => {
      state.friends = action.payload;
    },
    setIncomingRequests: (state, action: PayloadAction<FriendRequest[]>) => {
      state.incomingRequests = action.payload;
    },
    setSentRequests: (state, action: PayloadAction<FriendRequest[]>) => {
      state.sentRequests = action.payload;
    },
    addSentRequest: (state, action: PayloadAction<FriendRequest>) => {
      state.sentRequests.unshift(action.payload);
    },
    removeSentRequest: (state, action: PayloadAction<string>) => {
      state.sentRequests = state.sentRequests.filter(req => req.id !== action.payload);
    },
    removeIncomingRequest: (state, action: PayloadAction<string>) => {
      state.incomingRequests = state.incomingRequests.filter(req => req.id !== action.payload);
    },
    addFriend: (state, action: PayloadAction<User>) => {
      if (!state.friends.find(f => f.id === action.payload.id)) {
        state.friends.push(action.payload);
      }
    },
    clearIncomingRequests: (state) => {
      state.incomingRequests = [];
    },
    clearSentRequests: (state) => {
      state.sentRequests = [];
    },
    blockUser: (state, action: PayloadAction<string>) => {
      if (!state.blockedUserIds.includes(action.payload)) {
        state.blockedUserIds.push(action.payload);
        // Also remove from friends and requests if they were there
        state.friends = state.friends.filter(f => f.id !== action.payload);
        state.incomingRequests = state.incomingRequests.filter(r => r.from.id !== action.payload);
        state.sentRequests = state.sentRequests.filter(r => r.to.id !== action.payload);
      }
    },
    unblockUser: (state, action: PayloadAction<string>) => {
      state.blockedUserIds = state.blockedUserIds.filter(id => id !== action.payload);
    },
  },
});

export const { 
  setFriends, 
  setIncomingRequests, 
  setSentRequests, 
  addSentRequest, 
  removeSentRequest, 
  removeIncomingRequest,
  addFriend,
  clearIncomingRequests,
  clearSentRequests,
  blockUser,
  unblockUser
} = friendsSlice.actions;
export default friendsSlice.reducer;
