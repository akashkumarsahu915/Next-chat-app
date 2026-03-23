import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { MobileHeader } from '../components/layout/MobileHeader';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Avatar } from '../components/ui/Avatar';
import { Search, UserPlus, Filter, X, UserCheck, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useDispatch, useSelector } from 'react-redux';
import { addToast } from '../store/slices/toastSlice';
import { addSentRequest } from '../store/slices/friendsSlice';
import { RootState } from '../store';
import { cn } from '../lib/utils';
import { notificationService } from '../lib/notificationService';

export function ExplorePage() {
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const { friends, sentRequests, blockedUserIds } = useSelector((state: RootState) => state.friends);
  const { notificationSettings } = useSelector((state: RootState) => state.ui);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedInterest, setSelectedInterest] = useState<string | null>(null);
  const [hoveredUserId, setHoveredUserId] = useState<string | null>(null);

  const mockUsers = [
    { id: '1', uid: '123456', username: 'Emma Watson', bio: 'Actress and activist', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma', interests: ['Acting', 'Activism', 'Books'] },
    { id: '2', uid: '234567', username: 'Liam Neeson', bio: 'I have a very particular set of skills', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Liam', interests: ['Acting', 'Action', 'Movies'] },
    { id: '3', uid: '345678', username: 'Sophia Chen', bio: 'Digital artist & coffee lover', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia', interests: ['Art', 'Coffee', 'Design'] },
    { id: '4', uid: '456789', username: 'Marcus Aurelius', bio: 'Stoic philosopher', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus', interests: ['Philosophy', 'History', 'Stoicism'] },
    { id: '5', uid: '567890', username: 'Olivia Wilde', bio: 'Director & dreamer', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia', interests: ['Directing', 'Movies', 'Fashion'] },
    { id: '6', uid: '678901', username: 'David Goggins', bio: 'Stay hard!', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David', interests: ['Fitness', 'Motivation', 'Running'] },
  ];

  const allInterests = Array.from(new Set(mockUsers.flatMap(u => u.interests))).sort();

  const filteredUsers = mockUsers.filter(user => {
    // Filter out current user
    if (currentUser && user.id === currentUser.id) return false;

    // Filter out blocked users
    if (blockedUserIds.includes(user.id)) return false;

    // Filter out existing friends and pending requests
    const isFriend = friends.some(f => f.id === user.id);
    const isPending = sentRequests.some(r => r.to.id === user.id);
    
    if (isFriend || isPending) return false;

    const matchesSearch = 
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.interests.some(interest => interest.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesInterest = !selectedInterest || user.interests.includes(selectedInterest);
    
    return matchesSearch && matchesInterest;
  });

  const handleAddFriend = (user: any) => {
    if (!currentUser) return;

    const newRequest = {
      id: Math.random().toString(36).substring(2, 9),
      from: currentUser,
      to: {
        id: user.id,
        uid: user.uid,
        username: user.username,
        avatar: user.avatar,
        isOnline: false,
        isPrivate: false,
        email: '',
      },
      status: 'pending' as const,
      timestamp: new Date().toISOString(),
    };
    
    dispatch(addSentRequest(newRequest));
    dispatch(addToast({ message: `Friend request sent to ${user.username}`, type: 'success' }));
    
    if (notificationSettings.pushEnabled && notificationSettings.friendRequests) {
      notificationService.notify(
        'Friend Request Sent',
        `You sent a friend request to ${user.username}`,
        'friend_request'
      );
    }
  };

  return (
    <Layout>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-20">
            {filteredUsers.map((user, i) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card p-5 rounded-[2rem] shadow-sm border border-border flex flex-col hover:shadow-md transition-all relative group h-[220px]"
                onMouseEnter={() => setHoveredUserId(user.id)}
                onMouseLeave={() => setHoveredUserId(null)}
              >
                <div className="flex items-start space-x-4 mb-3">
                  <Avatar name={user.username} src={user.avatar} size="lg" className="shrink-0" />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-foreground truncate text-base">{user.username}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 h-8 mb-2 leading-relaxed">
                      {user.bio}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {user.interests.slice(0, 2).map(interest => (
                        <span key={interest} className="text-[9px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground font-semibold uppercase tracking-wider">
                          {interest}
                        </span>
                      ))}
                      {user.interests.length > 2 && (
                        <span className="text-[9px] text-muted-foreground font-medium">+{user.interests.length - 2}</span>
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
                    <span className="text-[10px] text-muted-foreground font-medium">Mutuals</span>
                  </div>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="rounded-xl px-4 h-8 text-xs font-bold shadow-lg shadow-primary/10"
                    onClick={() => handleAddFriend(user)}
                  >
                    <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                    Connect
                  </Button>
                </div>

                {/* Profile Preview Popover */}
                <AnimatePresence>
                  {hoveredUserId === user.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 10 }}
                      className="absolute bottom-full left-0 mb-2 w-64 bg-card border border-border rounded-2xl shadow-2xl z-50 p-4 pointer-events-none"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <Avatar name={user.username} src={user.avatar} size="md" />
                        <div>
                          <h4 className="font-bold text-sm">{user.username}</h4>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Profile Preview</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                        {user.bio}
                      </p>
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Interests</p>
                        <div className="flex flex-wrap gap-1">
                          {user.interests.map(interest => (
                            <span key={interest} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <Info className="h-3 w-3 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground">Mutual Friends: 0</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-20">
              <Search className="h-12 w-12 text-muted mx-auto mb-4" />
              <p className="text-muted-foreground">No users found matching your criteria</p>
              {(searchQuery || selectedInterest) && (
                <Button 
                  variant="link" 
                  onClick={() => { setSearchQuery(''); setSelectedInterest(null); }}
                  className="mt-2"
                >
                  Clear all filters
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
