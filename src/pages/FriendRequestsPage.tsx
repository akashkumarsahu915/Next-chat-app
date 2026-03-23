import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { MobileHeader } from '../components/layout/MobileHeader';
import { Tabs } from '../components/ui/Tabs';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { UserCheck, UserX, ArrowUpRight, ArrowDownLeft, Clock, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { addToast } from '../store/slices/toastSlice';
import { 
  setIncomingRequests, 
  setSentRequests, 
  removeIncomingRequest, 
  removeSentRequest, 
  addFriend,
  clearIncomingRequests,
  clearSentRequests
} from '../store/slices/friendsSlice';
import { useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { notificationService } from '../lib/notificationService';

export function FriendRequestsPage() {
  const [activeTab, setActiveTab] = useState('incoming');
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const { incomingRequests, sentRequests } = useSelector((state: RootState) => state.friends);
  const { notificationSettings } = useSelector((state: RootState) => state.ui);

  // Initialize mock data if empty
  useEffect(() => {
    if (!currentUser) return;

    if (incomingRequests.length === 0 && sentRequests.length === 0) {
      dispatch(setIncomingRequests([
        { id: '1', from: { id: 'u1', uid: '111111', username: 'Jake Paul', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jake', isOnline: true, isPrivate: false, email: '' }, to: currentUser, status: 'pending', timestamp: new Date().toISOString() },
        { id: '2', from: { id: 'u2', uid: '222222', username: 'Bella Thorne', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bella', isOnline: false, isPrivate: true, email: '' }, to: currentUser, status: 'pending', timestamp: new Date().toISOString() },
      ]));
      dispatch(setSentRequests([
        { id: '3', from: currentUser, to: { id: 'u3', uid: '333333', username: 'Elon Musk', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elon', isOnline: true, isPrivate: true, email: '' }, status: 'pending', timestamp: new Date().toISOString() },
        { id: '4', from: currentUser, to: { id: 'u4', uid: '444444', username: 'Bill Gates', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bill', isOnline: false, isPrivate: false, email: '' }, status: 'accepted', timestamp: new Date().toISOString() },
        { id: '5', from: currentUser, to: { id: 'u5', uid: '555555', username: 'Mark Zuckerberg', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mark', isOnline: true, isPrivate: true, email: '' }, status: 'rejected', timestamp: new Date().toISOString() },
      ]));
    }
  }, [dispatch, incomingRequests.length, sentRequests.length, currentUser]);

  const handleAccept = (req: any) => {
    dispatch(addFriend(req.from));
    dispatch(removeIncomingRequest(req.id));
    dispatch(addToast({ message: `You are now friends with ${req.from.username}!`, type: 'success' }));
    
    if (notificationSettings.pushEnabled && notificationSettings.friendRequests) {
      notificationService.notify(
        'Friend Request Accepted',
        `You are now friends with ${req.from.username}`,
        'friend_request'
      );
    }
  };

  const handleReject = (req: any) => {
    dispatch(removeIncomingRequest(req.id));
    dispatch(addToast({ message: `Request from ${req.from.username} rejected`, type: 'info' }));
  };

  const handleCancel = (req: any) => {
    dispatch(removeSentRequest(req.id));
    dispatch(addToast({ message: `Request to ${req.to.username} cancelled`, type: 'info' }));
  };

  const handleClearAll = () => {
    if (activeTab === 'incoming') {
      dispatch(clearIncomingRequests());
      dispatch(addToast({ message: 'All incoming requests cleared', type: 'info' }));
    } else {
      dispatch(clearSentRequests());
      dispatch(addToast({ message: 'All sent requests cleared', type: 'info' }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'rejected': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    }
  };

  return (
    <Layout>
      <MobileHeader title="Friend Requests" />
      <div className="flex-1 overflow-y-auto bg-background p-6 sm:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center space-x-3 mb-2 hidden sm:flex">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Friend Requests</h1>
          </div>
          <p className="text-muted-foreground mb-8 hidden sm:block">Manage your connections and pending invitations</p>

          <Tabs 
            tabs={[
              { id: 'incoming', label: `Incoming (${incomingRequests.length})`, icon: <ArrowDownLeft className="h-4 w-4" /> },
              { id: 'sent', label: `Sent (${sentRequests.length})`, icon: <ArrowUpRight className="h-4 w-4" /> }
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
            className="mb-8"
          />

          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                {activeTab === 'incoming' ? 'Pending Invitations' : 'Your Outgoing Requests'}
              </h2>
              {((activeTab === 'incoming' && incomingRequests.length > 0) || 
                (activeTab === 'sent' && sentRequests.length > 0)) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 h-8 px-3 rounded-full font-bold uppercase tracking-wider"
                  onClick={handleClearAll}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  Clear All
                </Button>
              )}
            </div>
            
            <AnimatePresence mode="wait">
              {activeTab === 'incoming' ? (
                <motion.div 
                  key="incoming"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  {incomingRequests.length > 0 ? (
                    incomingRequests.map((req) => (
                      <div
                        key={req.id}
                        className="bg-card p-4 rounded-2xl shadow-sm border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-center space-x-4 min-w-0">
                          <Avatar name={req.from.username} src={req.from.avatar} size="md" isOnline={req.from.isOnline} className="shrink-0" />
                          <div className="min-w-0">
                            <h3 className="font-bold text-foreground truncate">{req.from.username}</h3>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                              {new Date(req.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 sm:shrink-0">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 sm:flex-none rounded-full text-red-500 border-red-500/20 hover:bg-red-50/50 dark:hover:bg-red-500/10 h-9 px-4"
                            onClick={() => handleReject(req)}
                          >
                            <UserX className="h-4 w-4 mr-2" />
                            <span className="text-xs font-bold uppercase tracking-wider">Reject</span>
                          </Button>
                          <Button 
                            size="sm" 
                            className="flex-1 sm:flex-none rounded-full bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 h-9 px-4"
                            onClick={() => handleAccept(req)}
                          >
                            <UserCheck className="h-4 w-4 mr-2" />
                            <span className="text-xs font-bold uppercase tracking-wider">Accept</span>
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-3xl border border-dashed border-border">
                      No incoming requests
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  key="sent"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  {sentRequests.length > 0 ? (
                    sentRequests.map((req) => (
                      <div
                        key={req.id}
                        className="bg-card p-4 rounded-2xl shadow-sm border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-center space-x-4 min-w-0">
                          <Avatar name={req.to.username} src={req.to.avatar} size="md" isOnline={req.to.isOnline} className="shrink-0" />
                          <div className="min-w-0">
                            <h3 className="font-bold text-foreground truncate">{req.to.username}</h3>
                            <div className="flex items-center space-x-2">
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                                Sent {new Date(req.timestamp).toLocaleDateString()}
                              </p>
                              <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border', getStatusColor(req.status))}>
                                {req.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        {req.status === 'pending' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full sm:w-auto rounded-full text-red-500 border-red-500/20 hover:bg-red-50/50 dark:hover:bg-red-500/10 h-9 px-6"
                            onClick={() => handleCancel(req)}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-3xl border border-dashed border-border">
                      No sent requests
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Layout>
  );
}
