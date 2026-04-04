import React, { useState, useMemo } from 'react';
import { MobileHeader } from '../components/layout/MobileHeader';
import { Tabs } from '../components/ui/Tabs';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { UserCheck, UserX, ArrowUpRight, ArrowDownLeft, Clock, Shield, Loader2 } from 'lucide-react';
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
import { useGetFriendRequestsQuery, useRespondToFriendRequestMutation } from '../store/slices/friends.slice';

export function FriendRequestsPage() {
  const [activeTab, setActiveTab] = useState('incoming');
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  
  const { data: apiData, isLoading, isError, refetch } = useGetFriendRequestsQuery();
  const [respondToRequest, { isLoading: isResponding }] = useRespondToFriendRequestMutation();
  
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<'accepted' | 'rejected' | null>(null);

  const incomingRequests = useMemo(() => apiData?.data?.incoming || [], [apiData]);
  const sentRequests = useMemo(() => apiData?.data?.outgoing || [], [apiData]);

  const { notificationSettings } = useSelector((state: RootState) => state.ui);

  const handleAccept = async (req: any) => {
    try {
      setProcessingId(req._id);
      setProcessingAction('accepted');
      await respondToRequest({ requestId: req._id, action: 'accepted' }).unwrap();
      
      dispatch(addToast({ message: `You are now friends with ${req.from.username}!`, type: 'success' }));
      
      if (notificationSettings.pushEnabled && notificationSettings.friendRequests) {
        notificationService.notify(
          'Friend Request Accepted',
          `You are now friends with ${req.from.username}`,
          'friend_request'
        );
      }
    } catch (error: any) {
      dispatch(addToast({ message: error?.data?.message || 'Failed to accept request', type: 'error' }));
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  const handleReject = async (req: any) => {
    try {
      setProcessingId(req._id);
      setProcessingAction('rejected');
      await respondToRequest({ requestId: req._id, action: 'rejected' }).unwrap();
      
      dispatch(addToast({ message: `Request from ${req.from.username} rejected`, type: 'info' }));
    } catch (error: any) {
      dispatch(addToast({ message: error?.data?.message || 'Failed to reject request', type: 'error' }));
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  const handleCancel = (req: any) => {
    dispatch(removeSentRequest(req._id || req.id));
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
    <>
      <MobileHeader title="Friend Requests" />
      <div className="flex-1 overflow-y-auto bg-background p-6 sm:p-8 uppercase-none">
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
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground animate-pulse">Loading requests...</p>
                </div>
              ) : isError ? (
                <div className="text-center py-12 text-red-500 bg-red-500/5 rounded-3xl border border-dashed border-red-500/20">
                  <p className="mb-4">Failed to fetch friend requests</p>
                  <Button variant="outline" size="sm" onClick={() => refetch()} className="rounded-full">
                    Try Again
                  </Button>
                </div>
              ) : activeTab === 'incoming' ? (
                <motion.div 
                  key="incoming"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  {incomingRequests.length > 0 ? (
                    incomingRequests.map((req: any) => (
                      <div
                        key={req._id}
                        className="bg-card p-4 rounded-2xl shadow-sm border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-center space-x-4 min-w-0">
                          <Avatar name={req.from.username} src={req.from.profilePicture} size="md" isOnline={false} className="shrink-0" />
                          <div className="min-w-0">
                            <h3 className="font-bold text-foreground truncate">{req.from.username}</h3>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                              {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'Pending'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 sm:shrink-0">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 sm:flex-none rounded-full text-red-500 border-red-500/20 hover:bg-red-50/50 dark:hover:bg-red-500/10 h-9 px-4"
                            onClick={() => handleReject(req)}
                            disabled={isResponding && processingId === req._id}
                          >
                            {isResponding && processingId === req._id && processingAction === 'rejected' ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <UserX className="h-4 w-4 mr-2" />
                                <span className="text-xs font-bold uppercase tracking-wider">Reject</span>
                              </>
                            )}
                          </Button>
                          <Button 
                            size="sm" 
                            className="flex-1 sm:flex-none rounded-full bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 h-9 px-4"
                            onClick={() => handleAccept(req)}
                            disabled={isResponding && processingId === req._id}
                          >
                            {isResponding && processingId === req._id && processingAction === 'accepted' ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <UserCheck className="h-4 w-4 mr-2" />
                                <span className="text-xs font-bold uppercase tracking-wider">Accept</span>
                              </>
                            )}
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
                    sentRequests.map((req: any) => (
                      <div
                        key={req._id}
                        className="bg-card p-4 rounded-2xl shadow-sm border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-center space-x-4 min-w-0">
                          <Avatar name={req.to.username} src={req.to.profilePicture} size="md" isOnline={false} className="shrink-0" />
                          <div className="min-w-0">
                            <h3 className="font-bold text-foreground truncate">{req.to.username}</h3>
                            <div className="flex items-center space-x-2">
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                                Sent {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'Recently'}
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
    </>
  );
}
