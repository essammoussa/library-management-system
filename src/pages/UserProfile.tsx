import React from 'react';
import { useRole } from '@/store/RoleContext';
import { User } from 'lucide-react';

export default function UserProfile() {
  const { user } = useRole();

  return (
    <div className="p-6 lg:p-8">
      <h2 className="text-3xl font-bold text-foreground mb-6">My Profile</h2>
      <div className="bg-card border border-border rounded-lg p-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="bg-secondary/10 p-4 rounded-full">
            <User className="w-12 h-12 text-secondary" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-card-foreground">{user?.name}</h3>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Member Since</label>
            <p className="text-foreground">January 2024</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Member ID</label>
            <p className="text-foreground">M-2024-001</p>
          </div>
        </div>
      </div>
    </div>
  );
}