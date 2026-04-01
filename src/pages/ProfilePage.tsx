import React, { useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { MobileHeader } from '../components/layout/MobileHeader';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { UserPlus, MessageSquare, Shield, Info, MapPin, Link as LinkIcon, Camera } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { updateUser } from '../store/slices/authSlice';
import { addToast } from '../store/slices/toastSlice';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../lib/notificationService';

export function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handlePrivacyToggle = () => {
    const newStatus = !user.isPrivate;
    dispatch(updateUser({ isPrivate: newStatus }));
    dispatch(addToast({ 
      message: `Profile is now ${newStatus ? 'Private' : 'Public'}`, 
      type: 'info' 
    }));
    
    notificationService.notify(
      'Privacy Updated',
      `Your profile is now ${newStatus ? 'Private' : 'Public'}`,
      'system'
    );
  };

  const handleEditProfile = () => {
    navigate('/settings');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        dispatch(updateUser({ profilePicture: reader.result as string }));
        dispatch(addToast({ message: 'Profile picture updated successfully!', type: 'success' }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <MobileHeader title="Profile" />
      <div className="flex-1 overflow-y-auto bg-background">
        <div className="h-48 bg-gradient-to-r from-primary to-purple-600 relative">
          <div className="absolute -bottom-16 left-8">
            <div className="relative group">
              <Avatar name={user.username} src={user.profilePicture} size="xl" isOnline={true} className="border-4 border-background shadow-xl" />
              <button 
                onClick={handleAvatarClick}
                className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity border-4 border-transparent"
              >
                <Camera className="h-8 w-8 text-white" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
              />
            </div>
          </div>
        </div>

        <div className="mt-20 px-8 pb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{user.username}</h1>
              <div className="flex items-center space-x-2">
                <p className="text-muted-foreground font-medium">@{user.username.toLowerCase().replace(' ', '_')}</p>
                <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded-md text-muted-foreground">#{user.uid}</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                className="rounded-full"
                onClick={handlePrivacyToggle}
              >
                <Shield className="h-4 w-4 mr-2" />
                Privacy Settings
              </Button>
              <Button 
                className="rounded-full px-6"
                onClick={handleEditProfile}
              >
                Edit Profile
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              <section className="bg-card p-6 rounded-3xl shadow-sm border border-border">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Info className="h-5 w-5 mr-2 text-primary" />
                  About
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {user.bio || "No bio yet. Tell the world about yourself!"}
                </p>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="flex items-center text-muted-foreground text-sm">
                    <MapPin className="h-4 w-4 mr-2" />
                    San Francisco, CA
                  </div>
                  <div className="flex items-center text-muted-foreground text-sm">
                    <LinkIcon className="h-4 w-4 mr-2" />
                    nexchat.app/alex
                  </div>
                </div>
              </section>

              <section className="bg-card p-6 rounded-3xl shadow-sm border border-border">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-4 p-3 rounded-2xl hover:bg-muted transition-colors">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Joined "Designers Hub" group</p>
                        <p className="text-xs text-muted-foreground">2 days ago</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              <section className="bg-card p-6 rounded-3xl shadow-sm border border-border">
                <h3 className="text-lg font-semibold mb-4">Friends</h3>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <Avatar 
                      key={i}
                      name={`Friend ${i}`} 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} 
                      size="md" 
                      className="cursor-pointer hover:scale-110 transition-transform"
                    />
                  ))}
                </div>
                <Button variant="ghost" className="w-full mt-4 text-primary">
                  View All Friends
                </Button>
              </section>

              <section className={cn(
                "p-6 rounded-3xl shadow-sm border relative overflow-hidden",
                user.isPrivate ? "bg-muted border-border" : "bg-primary/5 border-primary/20"
              )}>
                <h3 className="text-lg font-semibold mb-2 text-foreground">Privacy Status</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {user.isPrivate ? "Your profile is private. Only friends can see your full info." : "Your profile is public. Anyone can find you and send requests."}
                </p>
                <div className="flex items-center space-x-2">
                  <div className={cn("h-2 w-2 rounded-full", user.isPrivate ? "bg-muted-foreground" : "bg-emerald-500")} />
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground">{user.isPrivate ? "Private" : "Public"}</span>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
