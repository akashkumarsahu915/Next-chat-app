import React, { useState, useEffect } from 'react';
import { MobileHeader } from '../components/layout/MobileHeader';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Search, UserPlus, Filter, X, UserCheck, Info, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useDispatch, useSelector } from 'react-redux';
import { addToast } from '../store/slices/toastSlice';
import { addSentRequest } from '../store/slices/friendsSlice';
import { RootState } from '../store';
import { cn } from '../lib/utils';
import { notificationService } from '../lib/notificationService';
import { User } from '../types';
import { useSearchUsersQuery, useLocateUsersQuery, useSendFriendRequestMutation } from '../store/slices/friends.slice';

export function ExplorePage() {
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const { friends, sentRequests, blockedUserIds } = useSelector((state: RootState) => state.friends);
  const { notificationSettings } = useSelector((state: RootState) => state.ui);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedInterest, setSelectedInterest] = useState<string | null>(null);
  const [hoveredUserId, setHoveredUserId] = useState<string | null>(null);
  const [requestingUserId, setRequestingUserId] = useState<string | null>(null);

  const [sendRequest, { isLoading: isSendingRequest }] = useSendFriendRequestMutation();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch users based on search or discovery
  const { 
    data: searchResults, 
    isFetching: isSearching, 
    isError: searchError 
  } = useSearchUsersQuery(debouncedSearch, { skip: !debouncedSearch });

  const { 
    data: discoveryUsers, 
    isFetching: isDiscovering, 
    isError: discoveryError 
  } = useLocateUsersQuery(debouncedSearch ? '' : 'balasore', { skip: !!debouncedSearch });

  const users = debouncedSearch ? searchResults : discoveryUsers;
  const isLoading = isSearching || isDiscovering;
  const isError = searchError || discoveryError;

  const filteredUsers = (users || []).filter(user => {
    // Filter out current user
    if (currentUser && user._id === currentUser._id) return false;

    // Filter out blocked users
    if (blockedUserIds.includes(user._id)) return false;

    // Filter out existing friends and pending requests
    const isFriend = friends.some(f => f._id === user._id);
    const isPending = sentRequests.some(r => {
      const toId = typeof r.to === 'string' ? r.to : r.to?._id;
      return toId === user._id;
    });
    
    if (isFriend || isPending) return false;

    const matchesInterest = !selectedInterest || (user.interests || []).includes(selectedInterest);
    
    return matchesInterest;
  });

  const allInterests = Array.from(new Set(filteredUsers.flatMap(u => u.interests || []))).sort();

  const handleAddFriend = async (user: User) => {
    if (!currentUser) return;

    try {
      setRequestingUserId(user._id);
      await sendRequest({ receiverId: user._id }).unwrap();
      dispatch(addToast({ message: `Friend request sent to ${user.username}`, type: 'success' }));
      
      if (notificationSettings.pushEnabled && notificationSettings.friendRequests) {
        notificationService.notify(
          'Friend Request Sent',
          `You sent a friend request to ${user.username}`,
          'friend_request'
        );
      }
    } catch (error: any) {
      dispatch(addToast({ message: error?.data?.message || 'Failed to send friend request', type: 'error' }));
    } finally {
      setRequestingUserId(null);
    }
  };

  return (
    <>
      <MobileHeader title="Explore" />
      <div className="flex-1 overflow-y-auto bg-background p-6 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 hidden sm:flex">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Explore</h1>
              <p className="text-muted-foreground">Discover new people and communities</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant={showFilters ? "primary" : "outline"} 
                size="icon" 
                className="rounded-xl"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-6"
              >
                <div className="bg-card border border-border rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold">Filter by Interest</h4>
                    {selectedInterest && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 text-xs"
                        onClick={() => setSelectedInterest(null)}
                      >
                        <X className="h-3 w-3 mr-1" /> Clear
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {allInterests.map(interest => (
                      <button
                        key={interest}
                        onClick={() => setSelectedInterest(interest === selectedInterest ? null : interest)}
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                          selectedInterest === interest 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mb-10">
            <Input 
              placeholder="Search by username, ID, or interests..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="h-5 w-5" />}
              className="h-14 text-lg rounded-2xl shadow-sm border-none bg-card"
            />
          </div>

          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 space-y-4"
              >
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="text-muted-foreground animate-pulse font-medium">
                  {debouncedSearch ? `Searching for "${debouncedSearch}"...` : 'Finding people near you...'}
                </p>
              </motion.div>
            ) : isError ? (
              <motion.div 
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16 bg-red-500/5 rounded-[2rem] border border-dashed border-red-500/20"
              >
                <div className="bg-red-500/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <X className="h-8 w-8 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Something went wrong</h3>
                <p className="text-muted-foreground mb-6 max-w-xs mx-auto">We couldn't fetch the user list. Please check your connection and try again.</p>
                <Button variant="outline" onClick={() => window.location.reload()} className="rounded-xl px-8">
                  Retry
                </Button>
              </motion.div>
            ) : (
              <motion.div 
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-20"
              >
                {filteredUsers.map((user, i) => (
                  <motion.div
                    key={user._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-card p-5 rounded-[2rem] shadow-sm border border-border flex flex-col hover:shadow-md transition-all relative group h-[220px]"
                    onMouseEnter={() => setHoveredUserId(user._id)}
                    onMouseLeave={() => setHoveredUserId(null)}
                  >
                    <div className="flex items-start space-x-4 mb-3">
                      <Avatar name={user.username} src={user.profilePicture} size="lg" className="shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-foreground truncate text-base">{user.username}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 h-8 mb-2 leading-relaxed">
                          {user.bio || 'No bio available'}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {(user.interests || []).slice(0, 2).map(interest => (
                            <span key={interest} className="text-[9px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground font-semibold uppercase tracking-wider">
                              {interest}
                            </span>
                          ))}
                          {(user.interests || []).length > 2 && (
                            <span className="text-[9px] text-muted-foreground font-medium">+{(user.interests || []).length - 2}</span>
                          )}
                          {(user.location && user.location.length > 0) && (
                            <span className="text-[9px] bg-primary/5 text-primary px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                              {user.location[0]}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex -space-x-1.5 mr-2">
                          {[1, 2].map((n) => (
                            <div key={n} className="w-5 h-5 rounded-full border-2 border-card bg-muted overflow-hidden">
                              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=friend${n + i}`} alt="" className="w-full h-full" />
                            </div>
                          ))}
                        </div>
                        <span className="text-[10px] text-muted-foreground font-medium">Connect</span>
                      </div>
                      <Button 
                        variant="primary" 
                        size="sm" 
                        className="rounded-xl px-4 h-8 text-xs font-bold shadow-lg shadow-primary/10"
                        onClick={() => handleAddFriend(user)}
                        disabled={isSendingRequest && requestingUserId === user._id}
                      >
                        {isSendingRequest && requestingUserId === user._id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <>
                            <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                            Connect
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Profile Preview Popover */}
                    <AnimatePresence>
                      {hoveredUserId === user._id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: 10 }}
                          className="absolute bottom-full left-0 mb-2 w-64 bg-card border border-border rounded-2xl shadow-2xl z-50 p-4 pointer-events-none"
                        >
                          <div className="flex items-center space-x-3 mb-3">
                            <Avatar name={user.username} src={user.profilePicture} size="md" />
                            <div>
                              <h4 className="font-bold text-sm">{user.username}</h4>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Profile Preview</p>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                            {user.bio}
                          </p>
                          <div className="space-y-2">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Interests & Location</p>
                            <div className="flex flex-wrap gap-1">
                              {(user.interests || []).map(interest => (
                                <span key={interest} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                  {interest}
                                </span>
                              ))}
                              {user.location?.map(loc => (
                                <span key={loc} className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full">
                                  {loc}
                                </span>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {!isLoading && !isError && filteredUsers.length === 0 && (
            <div className="text-center py-20">
              <Search className="h-12 w-12 text-muted mx-auto mb-4" />
              <p className="text-muted-foreground">No users found matching your criteria</p>
              {(searchQuery || selectedInterest) && (
                <Button 
                  variant="ghost" 
                  onClick={() => { setSearchQuery(''); setSelectedInterest(null); }}
                  className="mt-2 text-primary hover:underline"
                >
                  Clear all filters
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
