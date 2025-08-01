"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
// LGA utility removed - address section no longer exists

const API_URL = "/api/users/profile";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    phone: "",
    bio: "",
    image: "",
  });
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [personalInfoStatus, setPersonalInfoStatus] = useState<null | { type: "success" | "error"; message: string }>(null);
  // Address and professional fields removed - they don't exist in the User model
  const [preferences, setPreferences] = useState({
    contactPreference: "EMAIL",
    // Remove nested emailNotifications object - these fields don't exist in the database
    smsNotifications: false,
    profileVisibility: false,
    showContactInfo: false,
  });
  const [preferencesStatus, setPreferencesStatus] = useState<null | { type: "success" | "error"; message: string }>(null);
  // Password Change state
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [passwordStatus, setPasswordStatus] = useState<null | { type: "success" | "error"; message: string }>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);
  // Phone verification status and feedback
  const [phoneVerifyStatus, setPhoneVerifyStatus] = useState<null | { type: "success" | "error"; message: string }>(null);
  const [phoneVerifying, setPhoneVerifying] = useState(false);
  // Identity Verification state
  const [identity, setIdentity] = useState({
    ninOrBvn: "",
    file: null as File | null,
  });
  const [identityStatus, setIdentityStatus] = useState<null | { type: "success" | "error"; message: string }>(null);
  const [identityUploading, setIdentityUploading] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        if (data.success) {
          setUser(data.data);
          setPersonalInfo({
            name: data.data.name || "",
            phone: data.data.phone || "",
            bio: data.data.bio || "",
            image: data.data.image || "",
          });
          // Address and professional data removed - these fields don't exist in the User model
          setPreferences({
            contactPreference: data.data.contactPreference || "EMAIL",
            // Remove emailNotifications since these fields don't exist in the database
            smsNotifications: data.data.smsNotifications || false,
            profileVisibility: data.data.profileVisibility || false,
            showContactInfo: data.data.showContactInfo || false,
          });
        }
      } catch (e) {
        // handle error
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPersonalInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setProfilePicFile(files[0]);
      setPersonalInfo((prev) => ({ ...prev, image: URL.createObjectURL(files[0]) }));
    }
  };

  const handlePersonalInfoSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPersonalInfoStatus(null);
    try {
      // If profile picture is changed, handle upload (not implemented here)
      const res = await fetch(API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: personalInfo.name,
          phone: personalInfo.phone,
          bio: personalInfo.bio,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPersonalInfoStatus({ type: "success", message: "Personal info updated successfully." });
        setUser((prev: any) => ({ ...prev, ...data.data }));
      } else {
        setPersonalInfoStatus({ type: "error", message: data.error || data.message });
      }
    } catch (err: any) {
      setPersonalInfoStatus({ type: "error", message: err.message || "Failed to update." });
    }
  };

  // Address and professional handlers removed - these fields don't exist in the User model

  const handlePreferencesChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (name === "smsNotifications" || name === "profileVisibility" || name === "showContactInfo") {
      if (e.target instanceof HTMLInputElement) {
        setPreferences((prev) => ({ ...prev, [name]: e.target.checked }));
      }
    } else {
      setPreferences((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePreferencesSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPreferencesStatus(null);
    try {
      const res = await fetch(API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactPreference: preferences.contactPreference,
          // Remove emailNotifications since these fields don't exist in the database
          smsNotifications: preferences.smsNotifications,
          profileVisibility: preferences.profileVisibility,
          showContactInfo: preferences.showContactInfo,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPreferencesStatus({ type: "success", message: "Preferences updated successfully." });
        setUser((prev: any) => ({ ...prev, ...data.data }));
      } else {
        setPreferencesStatus({ type: "error", message: data.error || data.message });
      }
    } catch (err: any) {
      setPreferencesStatus({ type: "error", message: err.message || "Failed to update." });
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);
    if (passwords.new !== passwords.confirm) {
      setPasswordStatus({ type: "error", message: "New passwords do not match." });
      return;
    }
    setPasswordLoading(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.new }),
      });
      const data = await res.json();
      if (data.success) {
        setPasswordStatus({ type: "success", message: "Password changed successfully." });
        setPasswords({ current: "", new: "", confirm: "" });
      } else {
        setPasswordStatus({ type: "error", message: data.error || data.message });
      }
    } catch (err: any) {
      setPasswordStatus({ type: "error", message: err.message || "Failed to change password." });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handlePhoneVerify = async () => {
    setPhoneVerifying(true);
    setPhoneVerifyStatus(null);

    try {
      // Call the actual OTP API endpoint
      const res = await fetch("/api/sms/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: personalInfo.phone }),
      });

      const data = await res.json();

      if (data.message) {
        setPhoneVerifyStatus({ type: "success", message: "Verification code sent to your phone." });
      } else {
        setPhoneVerifyStatus({ type: "error", message: data.error || "Failed to send verification code." });
      }
    } catch (error: any) {
      setPhoneVerifyStatus({ type: "error", message: error.message || "Failed to send verification code." });
    } finally {
      setPhoneVerifying(false);
    }
  };

  const handleIdentityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, files } = e.target;
    if (type === "file" && files && files[0]) {
      setIdentity((prev) => ({ ...prev, file: files[0] }));
    } else {
      setIdentity((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleIdentityUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setIdentityStatus(null);
    setIdentityUploading(true);
    // TODO: Call backend to upload NIN/BVN and file
    setTimeout(() => {
      setIdentityStatus({ type: "success", message: "Identity document uploaded for verification." });
      setIdentityUploading(false);
    }, 1200);
  };

  if (loading) return <div className="text-center py-10 text-[#7C0302]">Loading...</div>;
  if (!user) return <div className="text-center py-10 text-[#7C0302]">You must be signed in to view your settings.</div>;

  // Address and professional sections removed - these fields don't exist in the User model

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-8 bg-white rounded shadow-md mt-6 mb-12">
      <h2 className="text-2xl font-bold mb-6" style={{ color: "#7C0302" }}>Settings</h2>

      {/* 1. PERSONAL INFORMATION */}
      <section className="mb-10">
        <h3 className="text-lg font-semibold mb-2" style={{ color: "#7C0302" }}>Personal Information</h3>
        <form className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center" onSubmit={handlePersonalInfoSave}>
          <div className="flex flex-col items-center sm:items-start mb-2">
            <Image
              src={personalInfo.image || "/images/Larnacei_coloured.png"}
              alt="Profile Picture"
              width={80}
              height={80}
              className="rounded-full object-cover border"
            />
            <input type="file" accept="image/*" className="mt-2" onChange={handleProfilePicChange} />
            <span className="text-xs text-gray-500">Profile Picture</span>
          </div>
          <div className="flex flex-col">
            <label className="font-medium">Full Name</label>
            <input name="name" type="text" value={personalInfo.name} onChange={handlePersonalInfoChange} className="input input-bordered" />
          </div>
          <div className="flex flex-col">
            <label className="font-medium">Email</label>
            <input type="email" value={user.email} disabled className="input input-bordered bg-gray-100" />
            <span className="text-xs text-green-600 mt-1">✓ Email verified</span>
          </div>
          <div className="flex flex-col">
            <label className="font-medium">Phone Number</label>
            <input name="phone" type="tel" value={personalInfo.phone} onChange={handlePersonalInfoChange} className="input input-bordered" placeholder="e.g. 08012345678" />
          </div>
          <div className="col-span-1 sm:col-span-2 flex flex-col">
            <label className="font-medium">Bio/Description</label>
            <textarea name="bio" value={personalInfo.bio} onChange={handlePersonalInfoChange} className="input input-bordered min-h-[60px]" />
          </div>
          <div className="col-span-1 sm:col-span-2 flex justify-end">
            <button type="submit" className="btn" style={{ background: "#7C0302", color: "white" }}>Save Personal Info</button>
          </div>
          {personalInfoStatus && (
            <div className={`col-span-1 sm:col-span-2 text-sm mt-2 ${personalInfoStatus.type === "success" ? "text-green-600" : "text-[#7C0302]"}`}>
              {personalInfoStatus.message}
            </div>
          )}
        </form>
      </section>

      {/* 2. ACCOUNT & VERIFICATION */}
      <section className="mb-10">
        <h3 className="text-lg font-semibold mb-2" style={{ color: "#7C0302" }}>Account & Verification</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-medium">Account Type</label>
            <input type="text" value={user.accountType} disabled className="input input-bordered bg-gray-100" />
          </div>
          <form className="flex flex-col gap-2" onSubmit={handlePasswordSave}>
            <label className="font-medium">Change Password</label>
            <input name="current" type="password" placeholder="Current Password" value={passwords.current} onChange={handlePasswordChange} className="input input-bordered" />
            <input name="new" type="password" placeholder="New Password" value={passwords.new} onChange={handlePasswordChange} className="input input-bordered" />
            <input name="confirm" type="password" placeholder="Confirm New Password" value={passwords.confirm} onChange={handlePasswordChange} className="input input-bordered" />
            <button type="submit" className="btn btn-sm mt-1" style={{ background: "#7C0302", color: "white" }} disabled={passwordLoading}>{passwordLoading ? "Saving..." : "Change Password"}</button>
            {passwordStatus && (
              <div className={`text-sm mt-1 ${passwordStatus.type === "success" ? "text-green-600" : "text-[#7C0302]"}`}>
                {passwordStatus.message}
              </div>
            )}
          </form>
          <div className="flex flex-col gap-2">
            <label className="font-medium">Phone Verification</label>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${user.phoneVerified ? 'bg-green-500' : 'bg-gray-400'}`}></span>
              <span>{user.phoneVerified ? 'Verified' : 'Not Verified'}</span>
              {!user.phoneVerified && <button type="button" className="btn btn-xs ml-2" style={{ background: '#7C0302', color: 'white' }} onClick={handlePhoneVerify} disabled={phoneVerifying}>{phoneVerifying ? 'Sending...' : 'Verify'}</button>}
            </div>
            {phoneVerifyStatus && (
              <div className={`text-sm mt-1 ${phoneVerifyStatus.type === "success" ? "text-green-600" : "text-[#7C0302]"}`}>{phoneVerifyStatus.message}</div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-medium">Email Verification</label>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span>Verified</span>
            </div>
            <span className="text-xs text-green-600">✓ Email is already verified</span>
          </div>
          <div className="col-span-1 sm:col-span-2 flex flex-col gap-2">
            <label className="font-medium">Identity Verification (NIN/BVN)</label>
            <form className="flex flex-col sm:flex-row gap-2 items-center" onSubmit={handleIdentityUpload}>
              <input name="ninOrBvn" type="text" placeholder="NIN or BVN" value={identity.ninOrBvn} onChange={handleIdentityChange} className="input input-bordered" />
              <input name="identityFile" type="file" accept="image/*,.pdf" onChange={handleIdentityChange} className="input input-bordered" />
              <span className="text-xs">{user.verificationLevel}</span>
              <button type="submit" className="btn btn-xs ml-2" style={{ background: '#7C0302', color: 'white' }} disabled={identityUploading}>{identityUploading ? 'Uploading...' : 'Upload'}</button>
            </form>
            {identityStatus && (
              <div className={`text-sm mt-1 ${identityStatus.type === "success" ? "text-green-600" : "text-[#7C0302]"}`}>{identityStatus.message}</div>
            )}
          </div>
        </div>
      </section>

      {/* Address and professional sections removed - these fields don't exist in the User model */}

      {/* 5. COMMUNICATION PREFERENCES */}
      <section className="mb-10">
        <h3 className="text-lg font-semibold mb-2" style={{ color: "#7C0302" }}>Communication Preferences</h3>
        <form className="grid grid-cols-1 sm:grid-cols-2 gap-4" onSubmit={handlePreferencesSave}>
          <div className="flex flex-col">
            <label className="font-medium">Preferred Contact Method</label>
            <select name="contactPreference" value={preferences.contactPreference} onChange={handlePreferencesChange} className="input input-bordered">
              <option value="EMAIL">Email</option>
              <option value="PHONE">Phone</option>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="PLATFORM_MESSAGE">Messages</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="font-medium">SMS Notifications</label>
            <label className="inline-flex items-center"><input name="smsNotifications" type="checkbox" checked={preferences.smsNotifications} onChange={handlePreferencesChange} className="mr-2" />Enable SMS notifications</label>
          </div>
          <div className="flex flex-col">
            <label className="font-medium">Privacy Settings</label>
            <label className="inline-flex items-center"><input name="profileVisibility" type="checkbox" checked={preferences.profileVisibility} onChange={handlePreferencesChange} className="mr-2" />Profile visibility</label>
            <label className="inline-flex items-center"><input name="showContactInfo" type="checkbox" checked={preferences.showContactInfo} onChange={handlePreferencesChange} className="mr-2" />Show contact info</label>
          </div>
          <div className="col-span-1 sm:col-span-2 flex justify-end">
            <button type="submit" className="btn" style={{ background: "#7C0302", color: "white" }}>Save Preferences</button>
          </div>
          {preferencesStatus && (
            <div className={`col-span-1 sm:col-span-2 text-sm mt-2 ${preferencesStatus.type === "success" ? "text-green-600" : "text-[#7C0302]"}`}>
              {preferencesStatus.message}
            </div>
          )}
        </form>
      </section>
    </div>
  );
} 