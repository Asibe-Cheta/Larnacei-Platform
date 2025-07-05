"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { lgasByState } from '@/utils/nigeria-lga';

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
  const [address, setAddress] = useState({
    streetAddress: "",
    city: "",
    state: "",
    lga: "",
    location: "",
  });
  const [addressStatus, setAddressStatus] = useState<null | { type: "success" | "error"; message: string }>(null);
  const [professional, setProfessional] = useState({
    businessName: "",
    experience: "",
    specialization: "",
    cacNumber: "",
    socialLinks: {
      linkedin: "",
      instagram: "",
      twitter: "",
      website: "",
    },
  });
  const [professionalStatus, setProfessionalStatus] = useState<null | { type: "success" | "error"; message: string }>(null);
  const [preferences, setPreferences] = useState({
    contactPreference: "EMAIL",
    emailNotifications: {
      inquiries: false,
      updates: false,
      marketing: false,
    },
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
  // Verification status and feedback
  const [phoneVerifyStatus, setPhoneVerifyStatus] = useState<null | { type: "success" | "error"; message: string }>(null);
  const [emailVerifyStatus, setEmailVerifyStatus] = useState<null | { type: "success" | "error"; message: string }>(null);
  const [phoneVerifying, setPhoneVerifying] = useState(false);
  const [emailVerifying, setEmailVerifying] = useState(false);
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
          setAddress({
            streetAddress: data.data.streetAddress || "",
            city: data.data.city || "",
            state: data.data.state || "",
            lga: data.data.lga || "",
            location: data.data.location || "",
          });
          setProfessional({
            businessName: data.data.businessName || "",
            experience: data.data.experience?.toString() || "",
            specialization: Array.isArray(data.data.specialization) ? data.data.specialization.join(", ") : "",
            cacNumber: data.data.cacNumber || "",
            socialLinks: {
              linkedin: data.data.socialLinks?.linkedin || "",
              instagram: data.data.socialLinks?.instagram || "",
              twitter: data.data.socialLinks?.twitter || "",
              website: data.data.socialLinks?.website || "",
            },
          });
          setPreferences({
            contactPreference: data.data.contactPreference || "EMAIL",
            emailNotifications: {
              inquiries: data.data.emailNotifications?.inquiries || false,
              updates: data.data.emailNotifications?.updates || false,
              marketing: data.data.emailNotifications?.marketing || false,
            },
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

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value, ...(name === "state" ? { lga: "" } : {}) }));
  };

  const handleAddressSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressStatus(null);
    try {
      const res = await fetch(API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          streetAddress: address.streetAddress,
          city: address.city,
          state: address.state,
          lga: address.lga,
          location: address.location,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAddressStatus({ type: "success", message: "Address updated successfully." });
        setUser((prev: any) => ({ ...prev, ...data.data }));
      } else {
        setAddressStatus({ type: "error", message: data.error || data.message });
      }
    } catch (err: any) {
      setAddressStatus({ type: "error", message: err.message || "Failed to update." });
    }
  };

  const handleProfessionalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name in professional.socialLinks) {
      setProfessional((prev) => ({ ...prev, socialLinks: { ...prev.socialLinks, [name]: value } }));
    } else {
      setProfessional((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleProfessionalSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfessionalStatus(null);
    try {
      const res = await fetch(API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: professional.businessName,
          experience: professional.experience ? parseInt(professional.experience) : undefined,
          specialization: professional.specialization.split(",").map((s) => s.trim()).filter(Boolean),
          cacNumber: professional.cacNumber,
          socialLinks: professional.socialLinks,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setProfessionalStatus({ type: "success", message: "Professional info updated successfully." });
        setUser((prev: any) => ({ ...prev, ...data.data }));
      } else {
        setProfessionalStatus({ type: "error", message: data.error || data.message });
      }
    } catch (err: any) {
      setProfessionalStatus({ type: "error", message: err.message || "Failed to update." });
    }
  };

  const handlePreferencesChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (name.startsWith("emailNotifications.")) {
      const key = name.split(".")[1];
      if (type === "checkbox" && e.target instanceof HTMLInputElement) {
        setPreferences((prev) => ({
          ...prev,
          emailNotifications: { ...prev.emailNotifications, [key]: e.target.checked },
        }));
      } else {
        setPreferences((prev) => ({
          ...prev,
          emailNotifications: { ...prev.emailNotifications, [key]: value },
        }));
      }
    } else if (
      name === "smsNotifications" || name === "profileVisibility" || name === "showContactInfo"
    ) {
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
          emailNotifications: preferences.emailNotifications,
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
    // TODO: Call backend to send OTP
    setTimeout(() => {
      setPhoneVerifyStatus({ type: "success", message: "Verification code sent to your phone." });
      setPhoneVerifying(false);
    }, 1000);
  };

  const handleEmailVerify = async () => {
    setEmailVerifying(true);
    setEmailVerifyStatus(null);
    // TODO: Call backend to send verification email
    setTimeout(() => {
      setEmailVerifyStatus({ type: "success", message: "Verification email sent." });
      setEmailVerifying(false);
    }, 1000);
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

  const states = Object.keys(lgasByState);
  const lgas = address.state ? lgasByState[address.state] || [] : [];
  const isProfessional = user.accountType === 'AGENT' || user.accountType === 'AGENCY' || user.accountType === 'CORPORATE';

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
            <button type="button" className="text-xs underline text-[#7C0302] mt-1">Change Email</button>
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
              <span className={`w-3 h-3 rounded-full ${user.emailVerified ? 'bg-green-500' : 'bg-gray-400'}`}></span>
              <span>{user.emailVerified ? 'Verified' : 'Not Verified'}</span>
              {!user.emailVerified && <button type="button" className="btn btn-xs ml-2" style={{ background: '#7C0302', color: 'white' }} onClick={handleEmailVerify} disabled={emailVerifying}>{emailVerifying ? 'Sending...' : 'Verify'}</button>}
            </div>
            {emailVerifyStatus && (
              <div className={`text-sm mt-1 ${emailVerifyStatus.type === "success" ? "text-green-600" : "text-[#7C0302]"}`}>{emailVerifyStatus.message}</div>
            )}
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

      {/* 3. LOCATION & ADDRESS */}
      <section className="mb-10">
        <h3 className="text-lg font-semibold mb-2" style={{ color: "#7C0302" }}>Location & Address</h3>
        <form className="grid grid-cols-1 sm:grid-cols-2 gap-4" onSubmit={handleAddressSave}>
          <div className="flex flex-col">
            <label className="font-medium">Street Address</label>
            <input name="streetAddress" type="text" value={address.streetAddress} onChange={handleAddressChange} className="input input-bordered" />
          </div>
          <div className="flex flex-col">
            <label className="font-medium">City</label>
            <input name="city" type="text" value={address.city} onChange={handleAddressChange} className="input input-bordered" />
          </div>
          <div className="flex flex-col">
            <label className="font-medium">State</label>
            <select name="state" value={address.state} onChange={handleAddressChange} className="input input-bordered">
              <option value="">Select State</option>
              {states.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="font-medium">Local Government Area (LGA)</label>
            <select name="lga" value={address.lga} onChange={handleAddressChange} className="input input-bordered">
              <option value="">Select LGA</option>
              {lgas.map((lga) => (
                <option key={lga} value={lga}>{lga}</option>
              ))}
            </select>
          </div>
          <div className="col-span-1 sm:col-span-2 flex flex-col">
            <label className="font-medium">Preferred Contact Address</label>
            <input name="location" type="text" value={address.location} onChange={handleAddressChange} className="input input-bordered" />
          </div>
          <div className="col-span-1 sm:col-span-2 flex justify-end">
            <button type="submit" className="btn" style={{ background: "#7C0302", color: "white" }}>Save Address</button>
          </div>
          {addressStatus && (
            <div className={`col-span-1 sm:col-span-2 text-sm mt-2 ${addressStatus.type === "success" ? "text-green-600" : "text-[#7C0302]"}`}>
              {addressStatus.message}
            </div>
          )}
        </form>
      </section>

      {/* 4. PROFESSIONAL INFO (conditional) */}
      {isProfessional && (
        <section className="mb-10">
          <h3 className="text-lg font-semibold mb-2" style={{ color: "#7C0302" }}>Professional Info</h3>
          <form className="grid grid-cols-1 sm:grid-cols-2 gap-4" onSubmit={handleProfessionalSave}>
            <div className="flex flex-col">
              <label className="font-medium">Business Name</label>
              <input name="businessName" type="text" value={professional.businessName} onChange={handleProfessionalChange} className="input input-bordered" />
            </div>
            <div className="flex flex-col">
              <label className="font-medium">Years of Experience</label>
              <input name="experience" type="number" min={0} max={100} value={professional.experience} onChange={handleProfessionalChange} className="input input-bordered" />
            </div>
            <div className="flex flex-col">
              <label className="font-medium">Specialization Areas</label>
              <input name="specialization" type="text" value={professional.specialization} onChange={handleProfessionalChange} className="input input-bordered" placeholder="e.g. Residential, Commercial, Land" />
            </div>
            <div className="flex flex-col">
              <label className="font-medium">Professional License/CAC Number</label>
              <input name="cacNumber" type="text" value={professional.cacNumber} onChange={handleProfessionalChange} className="input input-bordered" />
            </div>
            <div className="flex flex-col">
              <label className="font-medium">Social Media Links</label>
              <input name="linkedin" type="text" value={professional.socialLinks.linkedin} onChange={handleProfessionalChange} className="input input-bordered mb-1" placeholder="LinkedIn" />
              <input name="instagram" type="text" value={professional.socialLinks.instagram} onChange={handleProfessionalChange} className="input input-bordered mb-1" placeholder="Instagram" />
              <input name="twitter" type="text" value={professional.socialLinks.twitter} onChange={handleProfessionalChange} className="input input-bordered mb-1" placeholder="Twitter" />
              <input name="website" type="text" value={professional.socialLinks.website} onChange={handleProfessionalChange} className="input input-bordered mb-1" placeholder="Website" />
            </div>
            <div className="col-span-1 sm:col-span-2 flex justify-end">
              <button type="submit" className="btn" style={{ background: "#7C0302", color: "white" }}>Save Professional Info</button>
            </div>
            {professionalStatus && (
              <div className={`col-span-1 sm:col-span-2 text-sm mt-2 ${professionalStatus.type === "success" ? "text-green-600" : "text-[#7C0302]"}`}>
                {professionalStatus.message}
              </div>
            )}
          </form>
        </section>
      )}

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
            <label className="font-medium">Email Notifications</label>
            <div className="flex flex-col gap-1">
              <label className="inline-flex items-center"><input name="emailNotifications.inquiries" type="checkbox" checked={preferences.emailNotifications.inquiries} onChange={handlePreferencesChange} className="mr-2" />Property inquiries</label>
              <label className="inline-flex items-center"><input name="emailNotifications.updates" type="checkbox" checked={preferences.emailNotifications.updates} onChange={handlePreferencesChange} className="mr-2" />Updates</label>
              <label className="inline-flex items-center"><input name="emailNotifications.marketing" type="checkbox" checked={preferences.emailNotifications.marketing} onChange={handlePreferencesChange} className="mr-2" />Marketing</label>
            </div>
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