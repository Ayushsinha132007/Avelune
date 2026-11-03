import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Sparkles,
  ShieldCheck,
  ArrowLeft,
  Check,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useStore } from '../../hooks/useStore';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { showToast } = useStore();

  const [firstName, setFirstName] = useState(user?.firstName || 'Ayush');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [city, setCity] = useState(user?.preferredCity || 'Mumbai, India');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      firstName,
      fullName: firstName,
      phone,
      preferredCity: city,
    });
    setSavedSuccess(true);
    showToast({
      title: 'Profile Updated',
      description: 'Your profile preferences have been updated.',
      type: 'info',
    });
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  return (
    <div className="w-full py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Breadcrumb / Back Link */}
        <div className="mb-6">
          <Link
            to="/account/home"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#777B63] hover:text-[#242522] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Account Dashboard</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="pb-6 border-b border-[#E4DED4] mb-8">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-[#777B63]" />
            <span className="text-[10px] uppercase tracking-widest font-medium text-[#777B63]">
              Private Client Identity
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#242522] font-normal tracking-tight">
            Client Profile
          </h1>
          <p className="text-xs sm:text-sm text-[#5A5C55] font-light mt-1">
            Manage your personal styling credentials and delivery communications.
          </p>
        </div>

        {/* Client Tier Card */}
        <div className="p-6 bg-white border border-[#E4DED4] rounded-none mb-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#242522] text-[#D8C6AA] flex items-center justify-center font-serif text-xl font-normal shrink-0">
              {user?.avatarInitials || 'A'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-xl text-[#242522]">{user?.fullName || 'Ayush'}</h3>
                <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 bg-[#D8C6AA] text-[#242522] font-semibold">
                  Active
                </span>
              </div>
              <p className="text-xs text-[#5A5C55] font-light mt-0.5">{user?.email}</p>
              <div className="flex items-center gap-1.5 text-xs text-[#777B63] font-medium mt-1">
                <Sparkles className="w-3.5 h-3.5 text-[#D8C6AA]" />
                <span>{user?.membershipTier || 'Atelier Private Client'} • Member since {user?.memberSince || 'October 2026'}</span>
              </div>
            </div>
          </div>

          <div className="text-right sm:border-l sm:border-[#E4DED4] sm:pl-6 text-xs text-[#5A5C55]">
            <span className="block text-[10px] uppercase tracking-wider text-[#777B63]">Privilege Status</span>
            <strong className="text-sm text-[#242522] font-medium">Complimentary Courier & Gift Packaging</strong>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="bg-white border border-[#E4DED4] p-6 sm:p-8 space-y-6 shadow-xs">
          <h4 className="font-serif text-xl text-[#242522] pb-3 border-b border-[#E4DED4]">
            Personal Preferences
          </h4>

          {savedSuccess && (
            <div className="p-3 bg-[#F4F6F1] border border-[#CBD3BE] text-[#535941] text-xs flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Your profile preferences were updated successfully.</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Preferred Display Name */}
            <div className="space-y-1.5 text-left">
              <label className="text-[11px] uppercase tracking-wider font-medium text-[#242522]">
                First Name / Display Name
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-[#777B63] pointer-events-none">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full py-2.5 pl-10 pr-3 text-xs sm:text-sm bg-[#F8F6F1] border border-[#E4DED4] focus:outline-none focus:border-[#242522]"
                />
              </div>
            </div>

            {/* Email (Read Only) */}
            <div className="space-y-1.5 text-left">
              <label className="text-[11px] uppercase tracking-wider font-medium text-[#242522]">
                Registered Email Address
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-[#777B63] pointer-events-none">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full py-2.5 pl-10 pr-3 text-xs sm:text-sm bg-[#EFE9DF]/50 border border-[#E4DED4] text-[#5A5C55] cursor-not-allowed"
                />
              </div>
            </div>

            {/* Contact Phone */}
            <div className="space-y-1.5 text-left">
              <label className="text-[11px] uppercase tracking-wider font-medium text-[#242522]">
                Concierge Contact Number
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-[#777B63] pointer-events-none">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full py-2.5 pl-10 pr-3 text-xs sm:text-sm bg-[#F8F6F1] border border-[#E4DED4] focus:outline-none focus:border-[#242522]"
                />
              </div>
            </div>

            {/* Preferred City */}
            <div className="space-y-1.5 text-left">
              <label className="text-[11px] uppercase tracking-wider font-medium text-[#242522]">
                Primary Atelier Region
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-[#777B63] pointer-events-none">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full py-2.5 pl-10 pr-3 text-xs sm:text-sm bg-[#F8F6F1] border border-[#E4DED4] focus:outline-none focus:border-[#242522]"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between">
            <span className="text-[11px] text-[#5A5C55] font-light">
              Stored locally under client session
            </span>
            <button
              type="submit"
              className="px-6 py-3 bg-[#242522] hover:bg-[#383934] text-[#F8F6F1] text-xs uppercase tracking-widest font-medium transition-colors"
            >
              Save Preferences
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

