import React from 'react';
import { useRole } from '@/store/RoleContext';
import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function UserProfile() {
  // Get the currently logged-in user from the role context
  const { user, isAuthenticated } = useRole();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className="p-4 md:p-8 space-y-8 max-w-[1400px] mx-auto min-h-[80vh] flex flex-col items-center justify-center text-center">
        <div className="bg-card/40 backdrop-blur-md p-12 rounded-3xl border border-dashed border-border/60 max-w-lg w-full">
          <User className="w-16 h-16 text-primary/50 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-3">Join the Library</h2>
          <p className="text-muted-foreground mb-8">Register now to manage your profile, track your reading history, and access all library features.</p>
          <Button size="lg" className="w-full font-bold uppercase tracking-widest" onClick={() => navigate('/login?mode=register')}>
            Register Now
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-[1400px] mx-auto">
      {/* Page header */}
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Member Profile</h1>
        <p className="text-muted-foreground mt-1 font-medium">Manage your personal information and account settings</p>
      </div>

      {/* Profile card */}
      <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-3xl overflow-hidden shadow-xl p-8 md:p-12 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        
        {/* User avatar and basic info */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
          {/* Avatar icon */}
          <div className="size-24 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
            <User className="w-12 h-12 text-primary" />
          </div>
          {/* Name and email */}
          <div className="text-center md:text-left space-y-2">
            <h3 className="text-3xl font-black text-card-foreground tracking-tight">{user?.name}</h3>
            <p className="text-lg text-muted-foreground font-medium">{user?.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
              <span className="px-4 py-1.5 rounded-full bg-primary text-white text-[10px] font-bold uppercase tracking-widest shadow-lg">
                Active Member
              </span>
              <span className="px-4 py-1.5 rounded-full bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/10">
                Premium Access
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16 relative z-10">
          {/* Additional user details */}
          <div className="space-y-6">
            <div className="p-6 bg-background/40 backdrop-blur-md rounded-2xl border border-border/50">
              <label className="block text-[10px] font-bold text-primary/60 uppercase tracking-widest mb-1">Member Since</label>
              <p className="text-lg font-bold text-foreground">January 2024</p>
            </div>

            <div className="p-6 bg-background/40 backdrop-blur-md rounded-2xl border border-border/50">
              <label className="block text-[10px] font-bold text-primary/60 uppercase tracking-widest mb-1">Library ID</label>
              <p className="text-lg font-bold text-foreground">M-2024-001</p>
            </div>
          </div>

          <div className="space-y-6 text-sm text-muted-foreground/80 font-medium leading-relaxed">
            <p>
              Thank you for being a valued member of our library community. Your account gives you access to a world of knowledge, including thousands of physical books, digital resources, and exclusive member events.
            </p>
            <p>
              If you need to update your contact information or change your library preferences, please visit the help desk or contact our support team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
