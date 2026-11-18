// src/pages/ProfilePage.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Camera, MapPin, Calendar, Phone, Mail,
  Edit2, Save, X, Loader2, Lock,
  CheckCircle, AlertCircle, LogOut, Eye, EyeOff,
  ShoppingBag, Globe, AtSign, ShieldCheck,
  Heart, Home, Briefcase, Plus, Bell, Trash2,
  CreditCard, Smartphone, Star, Gift, Download,
  Shield, ChevronRight, Leaf, Droplets,
  TreePine, Package, Truck, XCircle, RefreshCw,
  BadgeCheck, BarChart3, Settings, User,
} from 'lucide-react';
import { logout } from '../store/authSlice';
import { useAuth } from '../context/Authcontext';
import useProfile from '../hooks/useProfile';

/* ── Small reusable primitives ─────────────────────────────────────────────── */

const Toggle = ({ active, onToggle, label }) => (
  <button
    onClick={onToggle}
    aria-label={label}
    className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-1 ${
      active ? 'bg-green-500' : 'bg-gray-200'
    }`}
  >
    <span
      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
        active ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
);

const FieldRow = ({ icon: Icon, label, value, action }) => (
  <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
      <Icon className="w-4 h-4 text-green-600" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-gray-800 truncate mt-0.5">{value || <span className="text-gray-300 italic">Not set</span>}</p>
    </div>
    {action}
  </div>
);

const SectionHead = ({ title, subtitle }) => (
  <div className="mb-5">
    <h2 className="text-lg font-bold text-gray-900">{title}</h2>
    {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
  </div>
);

const EmptyState = ({ icon: Icon, message }) => (
  <div className="flex flex-col items-center justify-center py-10 text-center">
    <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-3">
      <Icon className="w-6 h-6 text-green-300" />
    </div>
    <p className="text-sm text-gray-400">{message}</p>
  </div>
);

/* ── Form primitives ───────────────────────────────────────────────────────── */

const FormField = ({ label, name, value, onChange, type = 'text', error, multiline, maxLength, prefix }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
      {label}
      {maxLength && <span className="ml-2 font-normal normal-case text-gray-300">{value?.length || 0}/{maxLength}</span>}
    </label>
    {multiline ? (
      <textarea
        name={name} value={value} onChange={onChange} rows={3} maxLength={maxLength}
        className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none resize-none transition bg-gray-50 ${
          error ? 'border-red-400 bg-red-50' : 'border-gray-200'
        }`}
      />
    ) : (
      <div className={`flex items-center border rounded-xl overflow-hidden transition bg-gray-50 ${
        error ? 'border-red-400' : 'border-gray-200'
      }`}>
        {prefix && <span className="pl-3 pr-1 text-sm text-gray-400 select-none">{prefix}</span>}
        <input
          type={type} name={name} value={value} onChange={onChange} maxLength={maxLength}
          className="flex-1 px-3 py-2.5 text-sm outline-none bg-transparent"
          style={{ paddingLeft: prefix ? '2px' : undefined }}
        />
      </div>
    )}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const PasswordField = ({ label, name, value, onChange, error }) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
      <div className={`flex items-center border rounded-xl overflow-hidden transition bg-gray-50 ${error ? 'border-red-400' : 'border-gray-200'}`}>
        <input
          type={show ? 'text' : 'password'} name={name} value={value} onChange={onChange}
          className="flex-1 px-3 py-2.5 text-sm outline-none bg-transparent"
        />
        <button type="button" onClick={() => setShow(s => !s)} className="px-3 text-gray-400 hover:text-gray-600 transition" tabIndex={-1}>
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

/* ── Nav item for sidebar ──────────────────────────────────────────────────── */
const NavItem = ({ icon: Icon, label, active, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
      active
        ? 'bg-green-500 text-white shadow-sm shadow-green-200'
        : 'text-gray-500 hover:bg-green-50 hover:text-green-700'
    }`}
  >
    <Icon className="w-4 h-4 shrink-0" />
    <span className="flex-1 text-left">{label}</span>
    {badge != null && badge > 0 && (
      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active ? 'bg-white/30 text-white' : 'bg-green-100 text-green-700'}`}>
        {badge}
      </span>
    )}
  </button>
);

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════════ */

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { logout: authLogout } = useAuth();

  const {
    profile, avatarPreview,
    saving, uploadingAvatar, changingPwd, isEditing, showPwdModal,
    saveError, avatarError, pwdError, pwdSuccess,
    localForm, localErrors, pwdForm,
    startEditing, cancelEditing,
    handleFieldChange, handleSave,
    handleAvatarFileSelect, handleAvatarReset,
    setShowPwdModal, handlePwdFieldChange, handlePasswordSubmit,
  } = useProfile();

  const avatarInputRef = useRef(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [emailChanged, setEmailChanged] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');

  // Address state — driven from profile when available
  const [addresses, setAddresses] = useState(profile?.addresses || []);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({ type: '', street: '', city: '', pin: '' });

  // Notifications — driven from profile preferences
  const [notifications, setNotifications] = useState(
    profile?.notificationPrefs || [
      { id: 'orders',    label: 'Order Updates',      desc: 'Shipping & delivery alerts',    active: true  },
      { id: 'care',      label: 'Plant Care Tips',    desc: 'Watering & care reminders',     active: true  },
      { id: 'arrivals',  label: 'New Arrivals',       desc: 'Fresh stock notifications',     active: false },
      { id: 'offers',    label: 'Discounts & Offers', desc: 'Deals and promo codes',         active: false },
      { id: 'restock',   label: 'Restock Alerts',     desc: 'Wishlist item back-in-stock',   active: false },
    ]
  );

  // Care reminders
  const [careReminders, setCareReminders] = useState(
    profile?.careReminders || [
      { id: 'water',      label: 'Watering Alerts',      active: false },
      { id: 'fertilizer', label: 'Fertilizer Schedule',  active: false },
      { id: 'repot',      label: 'Repotting Reminders',  active: false },
    ]
  );

  // Gardening interests
  const [interests, setInterests] = useState(
    profile?.gardeningInterests || [
      { id: 1, label: 'Indoor Plants',    emoji: '🪴', active: false },
      { id: 2, label: 'Succulents',       emoji: '🌵', active: false },
      { id: 3, label: 'Flowering Plants', emoji: '🌺', active: false },
      { id: 4, label: 'Trees & Shrubs',   emoji: '🌳', active: false },
      { id: 5, label: 'Herbs',            emoji: '🌿', active: false },
      { id: 6, label: 'Aquatic Plants',   emoji: '💧', active: false },
    ]
  );

  const [twoFAEnabled, setTwoFAEnabled] = useState(profile?.twoFAEnabled ?? false);

  // Profile completion
  const completionFields = ['fullName', 'email', 'phone', 'location', 'bio', 'username', 'website'];
  const filledCount = profile
    ? completionFields.filter(f => {
        if (f === 'fullName') return profile.fullName || profile.name;
        return profile[f];
      }).length
    : 0;
  const completionPct = Math.round((filledCount / completionFields.length) * 100);

  useEffect(() => {
    if (pwdSuccess) {
      const t = setTimeout(() => setShowPwdModal(false), 1500);
      return () => clearTimeout(t);
    }
  }, [pwdSuccess, setShowPwdModal]);

  const wrappedHandleSave = async () => {
    const prevEmail = profile?.email;
    const ok = await handleSave();
    if (!ok) return;
    setSaveSuccess(true);
    if (localForm.email && localForm.email !== prevEmail) setEmailChanged(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCancelEditing = () => {
    const dirty =
      localForm.fullName !== (profile?.fullName || profile?.name || '') ||
      localForm.email    !== (profile?.email    || '') ||
      localForm.phone    !== (profile?.phone    || '') ||
      localForm.location !== (profile?.location || '') ||
      localForm.bio      !== (profile?.bio      || '') ||
      localForm.username !== (profile?.username || '') ||
      localForm.website  !== (profile?.website  || '');
    if (dirty && !window.confirm('You have unsaved changes. Discard them?')) return;
    cancelEditing();
  };

  const handleAvatarChange = (e) => { handleAvatarFileSelect(e); e.target.value = ''; };

  /* ── Guards ── */
  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-gray-700 font-semibold">Profile not available</p>
          <p className="text-gray-400 text-sm mt-1">Please log in to continue.</p>
        </motion.div>
      </div>
    );
  }

  const handleLogout = () => { dispatch(logout()); authLogout(); };

  const displayAvatar = avatarPreview || profile?.avatar || profile?.avatarUrl || null;
  const displayName   = profile?.fullName || profile?.name || 'User';
  const joinedDate    = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : null;
  const roleBadge = profile?.role
    ? ({ admin: 'Admin', member: 'Member', guest: 'Guest' }[profile.role.toLowerCase()] || profile.role)
    : null;
  const emailVerified = profile?.emailVerified ?? false;
  const phoneVerified = profile?.phoneVerified ?? false;
  const orderStats    = profile?.orderStats || { total: 0, active: 0, delivered: 0, cancelled: 0, plants: 0 };
  const loyalty       = profile?.loyalty || { points: 0, tier: null, nextTier: null, nextAt: 0 };
  const wishlist      = profile?.wishlist || [];
  const reviews       = profile?.reviews || [];
  const recentlyViewed = profile?.recentlyViewed || [];
  const plantCollection = profile?.plantCollection || { total: 0, indoor: 0, outdoor: 0 };
  const sessions      = profile?.sessions || [];
  const socialConns   = profile?.socialConnections || [];
  const paymentMethods = profile?.paymentMethods || [];

  const NAV = [
    { id: 'profile',       icon: User,        label: 'Profile'        },
    { id: 'orders',        icon: ShoppingBag, label: 'Orders',        badge: orderStats.active  },
    { id: 'wishlist',      icon: Heart,       label: 'Wishlist',      badge: wishlist.length    },
    { id: 'addresses',     icon: MapPin,      label: 'Addresses'      },
    { id: 'plants',        icon: Leaf,        label: 'My Plants'      },
    { id: 'reviews',       icon: Star,        label: 'Reviews',       badge: reviews.length     },
    { id: 'rewards',       icon: Gift,        label: 'Rewards'        },
    { id: 'notifications', icon: Bell,        label: 'Notifications'  },
    { id: 'security',      icon: Shield,      label: 'Security'       },
    { id: 'privacy',       icon: Lock,        label: 'Privacy'        },
  ];

  /* ════════════════════════════════════════════════════════════════════════
     SECTION RENDERERS
  ════════════════════════════════════════════════════════════════════════ */

  const renderProfile = () => (
    <div>
      <SectionHead
        title={isEditing ? 'Edit Profile' : 'Profile'}
        subtitle={isEditing ? 'Update your personal information' : 'Your public profile and contact details'}
      />

      {saveError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-5">
          <AlertCircle className="w-4 h-4 shrink-0" /> {saveError}
        </div>
      )}

      {isEditing ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Full Name"   name="fullName" value={localForm.fullName || ''} onChange={handleFieldChange} error={localErrors.fullName} maxLength={120} />
            <FormField label="Username"    name="username" value={localForm.username || ''} onChange={handleFieldChange} error={localErrors.username} maxLength={40} prefix="@" />
            <div>
              <FormField label="Email" name="email" type="email" value={localForm.email || ''} onChange={handleFieldChange} error={localErrors.email} />
              {emailVerified && <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><BadgeCheck className="w-3 h-3" /> Verified</p>}
            </div>
            <div>
              <FormField label="Phone" name="phone" value={localForm.phone || ''} onChange={handleFieldChange} error={localErrors.phone} />
              {phoneVerified && <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><BadgeCheck className="w-3 h-3" /> Verified</p>}
            </div>
            <FormField label="Location"          name="location" value={localForm.location || ''} onChange={handleFieldChange} error={localErrors.location} />
            <FormField label="Website / Social"  name="website"  type="url" value={localForm.website || ''} onChange={handleFieldChange} error={localErrors.website} />
          </div>

          <FormField label="Bio" name="bio" multiline value={localForm.bio || ''} onChange={handleFieldChange} error={localErrors.bio} maxLength={500} />

          {/* Avatar */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Profile Picture</p>
            <div className="flex items-center gap-3 flex-wrap">
              <label htmlFor="avatar-upload" className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 text-green-700 rounded-xl cursor-pointer hover:bg-green-100 transition text-sm font-medium">
                {uploadingAvatar ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</> : <><Camera className="w-4 h-4" /> Upload Photo</>}
              </label>
              <button onClick={handleAvatarReset} disabled={uploadingAvatar} className="flex items-center gap-2 px-4 py-2 text-gray-500 rounded-xl hover:bg-gray-100 transition text-sm disabled:opacity-40">
                <RefreshCw className="w-4 h-4" /> Reset
              </button>
            </div>
            <p className="text-[11px] text-gray-300 mt-1.5">JPG, PNG, WebP or GIF · Max 5 MB</p>
          </div>

          {localForm.email && localForm.email !== (profile?.email || '') && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              A verification email will be sent to <strong className="ml-1">{localForm.email}</strong> after saving.
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={handleCancelEditing} className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
              <X className="w-4 h-4" /> Cancel
            </button>
            <button onClick={wrappedHandleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 transition disabled:opacity-60">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Save className="w-4 h-4" /> Save Changes</>}
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1">
          <FieldRow icon={Mail}    label="Email"    value={profile?.email}
            action={
              emailVerified
                ? <BadgeCheck className="w-4 h-4 text-green-500 shrink-0" />
                : <button className="text-[11px] text-amber-600 border border-amber-200 rounded-full px-2 py-0.5 hover:bg-amber-50 transition whitespace-nowrap">Verify</button>
            }
          />
          <FieldRow icon={Phone}   label="Phone"    value={profile?.phone}
            action={
              profile?.phone
                ? phoneVerified
                  ? <BadgeCheck className="w-4 h-4 text-green-500 shrink-0" />
                  : <button className="text-[11px] text-amber-600 border border-amber-200 rounded-full px-2 py-0.5 hover:bg-amber-50 transition whitespace-nowrap">Verify</button>
                : null
            }
          />
          <FieldRow icon={MapPin}  label="Location" value={profile?.location} />
          <FieldRow icon={AtSign}  label="Username" value={profile?.username ? `@${profile.username}` : null} />
          <FieldRow icon={Globe}   label="Website"  value={profile?.website}
            action={
              profile?.website
                ? <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} target="_blank" rel="noopener noreferrer" className="text-[11px] text-green-600 font-medium hover:underline">Visit</a>
                : null
            }
          />
          {profile?.bio && (
            <div className="pt-3 mt-1">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Bio</p>
              <p className="text-sm text-gray-700 leading-relaxed">{profile.bio}</p>
            </div>
          )}
          {joinedDate && (
            <div className="pt-3 flex items-center gap-2 text-xs text-gray-400">
              <Calendar className="w-3.5 h-3.5" /> Member since {joinedDate}
            </div>
          )}
          <div className="pt-4">
            <button onClick={startEditing} className="flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 transition">
              <Edit2 className="w-4 h-4" /> Edit Profile
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );

  const renderOrders = () => (
    <div>
      <SectionHead title="Orders" subtitle="Your purchase history and active deliveries" />
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { icon: Package,     label: 'Total Orders',    value: orderStats.total,     color: 'gray'  },
          { icon: Truck,       label: 'Active',          value: orderStats.active,    color: 'blue'  },
          { icon: CheckCircle, label: 'Delivered',       value: orderStats.delivered, color: 'green' },
          { icon: XCircle,     label: 'Cancelled',       value: orderStats.cancelled, color: 'red'   },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
              color === 'blue' ? 'bg-blue-50' : color === 'green' ? 'bg-green-50' : color === 'red' ? 'bg-red-50' : 'bg-gray-100'
            }`}>
              <Icon className={`w-4 h-4 ${
                color === 'blue' ? 'text-blue-500' : color === 'green' ? 'text-green-500' : color === 'red' ? 'text-red-400' : 'text-gray-400'
              }`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800 leading-none">{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>
      {orderStats.plants > 0 && (
        <div className="flex items-center justify-between bg-green-50 border border-green-100 rounded-xl px-4 py-3 mb-5">
          <div className="flex items-center gap-2 text-green-700">
            <Leaf className="w-4 h-4" />
            <span className="text-sm font-medium">Total Plants Purchased</span>
          </div>
          <span className="text-2xl font-bold text-green-600">{orderStats.plants}</span>
        </div>
      )}
      <a href="/orderhistory" className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 transition">
        <ShoppingBag className="w-4 h-4" /> View Full Order History
      </a>
    </div>
  );

  const renderWishlist = () => (
    <div>
      <SectionHead title="Wishlist" subtitle={wishlist.length ? `${wishlist.length} saved plants` : 'No plants saved yet'} />
      {wishlist.length === 0 ? (
        <EmptyState icon={Heart} message="Save plants you love — they'll appear here" />
      ) : (
        <div className="space-y-2">
          {wishlist.map(p => (
            <div key={p.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:border-green-200 hover:bg-green-50 transition group">
              {p.image
                ? <img src={p.image} alt={p.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                : <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center shrink-0"><Leaf className="w-5 h-5 text-green-500" /></div>
              }
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                {p.price && <p className="text-sm text-green-600 font-bold mt-0.5">{p.price}</p>}
              </div>
              <div className="flex gap-1.5">
                <button className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"><ShoppingBag className="w-3.5 h-3.5" /></button>
                <button className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderAddresses = () => (
    <div>
      <SectionHead title="Saved Addresses" subtitle="Delivery addresses for your orders" />
      <div className="space-y-3 mb-4">
        {addresses.length === 0 && <EmptyState icon={MapPin} message="No addresses saved yet — add one below" />}
        {addresses.map(addr => {
          const AddrIcon = addr.type === 'Office' ? Briefcase : addr.type === 'Farm House' ? TreePine : Home;
          return (
            <div key={addr.id} className={`p-4 rounded-xl border-2 transition ${addr.isDefault ? 'border-green-400 bg-green-50' : 'border-gray-100 bg-white'}`}>
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${addr.isDefault ? 'bg-green-200' : 'bg-gray-100'}`}>
                  <AddrIcon className={`w-4 h-4 ${addr.isDefault ? 'text-green-700' : 'text-gray-500'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-gray-800">{addr.type}</p>
                    {addr.isDefault && <span className="text-[10px] bg-green-500 text-white px-2 py-0.5 rounded-full font-semibold">Default</span>}
                  </div>
                  <p className="text-sm text-gray-600">{addr.address}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{addr.city}</p>
                  <div className="flex gap-4 mt-2">
                    {!addr.isDefault && (
                      <button
                        onClick={() => setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === addr.id })))}
                        className="text-xs text-green-600 font-medium hover:underline"
                      >Set as Default</button>
                    )}
                    <button className="text-xs text-blue-500 font-medium hover:underline">Edit</button>
                    <button
                      onClick={() => setAddresses(prev => prev.filter(a => a.id !== addr.id))}
                      className="text-xs text-red-400 font-medium hover:underline"
                    >Delete</button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <button
        onClick={() => setShowAddressModal(true)}
        className="w-full py-3 border-2 border-dashed border-green-200 text-green-600 rounded-xl text-sm font-medium hover:bg-green-50 transition flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" /> Add New Address
      </button>
    </div>
  );

  const renderPlants = () => (
    <div>
      <SectionHead title="My Plants" subtitle="Your collection, interests & care schedule" />

      {/* Collection */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Total', value: plantCollection.total,   emoji: '🌱' },
          { label: 'Indoor',  value: plantCollection.indoor,  emoji: '🪴' },
          { label: 'Outdoor', value: plantCollection.outdoor, emoji: '🌳' },
        ].map(({ label, value, emoji }) => (
          <div key={label} className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
            <p className="text-xl mb-1">{emoji}</p>
            <p className="text-2xl font-bold text-green-700">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Interests */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Gardening Interests</p>
        <p className="text-xs text-gray-400 mb-3">Helps us personalise recommendations for you</p>
        <div className="flex flex-wrap gap-2">
          {interests.map(i => (
            <button
              key={i.id}
              onClick={() => setInterests(prev => prev.map(x => x.id === i.id ? { ...x, active: !x.active } : x))}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                i.active ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-500 border-gray-200 hover:border-green-300'
              }`}
            >
              {i.emoji} {i.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Recently Viewed</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {recentlyViewed.map(p => (
              <a key={p.id} href={`/plant/${p.id}`} className="shrink-0 w-28 border border-gray-100 rounded-xl p-2 hover:border-green-300 hover:bg-green-50 transition text-center">
                {p.image
                  ? <img src={p.image} alt={p.name} className="w-10 h-10 mx-auto rounded-lg object-cover mb-1.5" />
                  : <div className="w-10 h-10 mx-auto rounded-lg bg-green-100 flex items-center justify-center mb-1.5"><Leaf className="w-4 h-4 text-green-400" /></div>
                }
                <p className="text-xs font-medium text-gray-700 truncate">{p.name}</p>
                {p.price && <p className="text-xs text-green-600 font-semibold">{p.price}</p>}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Care Reminders */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Plant Care Reminders</p>
        <div className="space-y-2">
          {careReminders.map(r => (
            <div key={r.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
              <div className="flex items-center gap-2">
                {r.id === 'water'      && <Droplets className="w-4 h-4 text-blue-400" />}
                {r.id === 'fertilizer' && <Leaf className="w-4 h-4 text-green-500" />}
                {r.id === 'repot'      && <RefreshCw className="w-4 h-4 text-orange-400" />}
                <span className="text-sm text-gray-700">{r.label}</span>
              </div>
              <Toggle active={r.active} onToggle={() => setCareReminders(prev => prev.map(x => x.id === r.id ? { ...x, active: !x.active } : x))} label={r.label} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderReviews = () => (
    <div>
      <SectionHead title="My Reviews" subtitle={reviews.length ? `${reviews.length} reviews submitted` : 'No reviews yet'} />
      {reviews.length === 0 ? (
        <EmptyState icon={Star} message="Purchase a plant and leave your first review" />
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-4 bg-green-50 border border-green-100 rounded-xl p-4 mb-2">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">
                {(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)}
              </p>
              <p className="text-[11px] text-gray-400">Avg Rating</p>
            </div>
            <div>
              <div className="flex gap-0.5 mb-1">
                {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
              </div>
              <p className="text-xs text-gray-500">{reviews.length} reviews given</p>
            </div>
          </div>
          {reviews.map(r => (
            <div key={r.id} className="p-4 border border-gray-100 rounded-xl">
              <div className="flex items-start justify-between mb-1">
                <p className="text-sm font-semibold text-gray-800">{r.plant || r.productName}</p>
                <div className="flex gap-0.5 shrink-0 ml-2">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
                  ))}
                </div>
              </div>
              {r.date && <p className="text-[11px] text-gray-400 mb-1.5">{r.date}</p>}
              {r.text && <p className="text-sm text-gray-600 leading-relaxed">{r.text}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderRewards = () => (
    <div>
      <SectionHead title="Rewards" subtitle="Green Points and membership benefits" />
      {loyalty.tier ? (
        <>
          <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-5 text-white mb-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-semibold opacity-70 uppercase tracking-wide">Green Points</p>
                <p className="text-4xl font-bold mt-0.5">{loyalty.points?.toLocaleString() || 0}</p>
              </div>
              <div className="text-right">
                <p className="text-xs opacity-70">Membership</p>
                <p className="text-lg font-bold">{loyalty.tier}</p>
              </div>
            </div>
            {loyalty.nextTier && loyalty.nextAt && (
              <>
                <div className="flex justify-between text-xs opacity-80 mb-1.5">
                  <span>{loyalty.tier}</span>
                  <span>{loyalty.nextAt - (loyalty.points || 0)} pts to {loyalty.nextTier}</span>
                </div>
                <div className="bg-white/30 rounded-full h-2">
                  <div
                    className="bg-white h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(((loyalty.points || 0) / loyalty.nextAt) * 100, 100)}%` }}
                  />
                </div>
              </>
            )}
          </div>
          {loyalty.perks?.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Your Benefits</p>
              {loyalty.perks.map((perk, i) => (
                <div key={i} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  <p className="text-sm text-gray-700">{perk}</p>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <EmptyState icon={Gift} message="No rewards yet — start shopping to earn Green Points!" />
      )}
    </div>
  );

  const renderNotifications = () => (
    <div>
      <SectionHead title="Notifications" subtitle="Choose what updates you want to receive" />
      <div className="space-y-2">
        {notifications.map(n => (
          <div key={n.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
            <div>
              <p className="text-sm font-semibold text-gray-800">{n.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{n.desc}</p>
            </div>
            <Toggle active={n.active} onToggle={() => setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, active: !x.active } : x))} label={n.label} />
          </div>
        ))}
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div>
      <SectionHead title="Security" subtitle="Password, 2FA, sessions and payment methods" />
      <div className="space-y-4">

        {/* Password */}
        <div className="p-4 border border-gray-100 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center"><Lock className="w-4 h-4 text-green-600" /></div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Password</p>
              <p className="text-xs text-gray-400">Keep your account secure</p>
            </div>
          </div>
          <button onClick={() => setShowPwdModal(true)} className="text-sm text-green-600 font-semibold hover:underline">Change</button>
        </div>

        {/* 2FA */}
        <div className="p-4 border border-gray-100 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center"><Smartphone className="w-4 h-4 text-blue-500" /></div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Two-Factor Authentication</p>
              <p className="text-xs text-gray-400">{twoFAEnabled ? 'Enabled — extra layer of security' : 'Disabled — enable for better security'}</p>
            </div>
          </div>
          <Toggle active={twoFAEnabled} onToggle={() => setTwoFAEnabled(e => !e)} label="2FA" />
        </div>

        {/* Social Connections */}
        {socialConns.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">Social Login</p>
            <div className="space-y-2">
              {socialConns.map(sc => (
                <div key={sc.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
                  {sc.icon && <span className="text-xl">{sc.icon}</span>}
                  <p className="text-sm font-medium text-gray-800 flex-1">{sc.label}</p>
                  {sc.connected
                    ? <span className="flex items-center gap-1 text-xs text-green-600 font-medium"><BadgeCheck className="w-3.5 h-3.5" /> Connected</span>
                    : <button className="text-xs text-blue-500 font-medium hover:underline">Connect</button>
                  }
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment Methods */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">Payment Methods</p>
          <div className="space-y-2">
            {paymentMethods.length === 0 && <p className="text-sm text-gray-400 px-1">No payment methods saved.</p>}
            {paymentMethods.map((pm, i) => (
              <div key={i} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
                <CreditCard className="w-5 h-5 text-gray-400 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{pm.type}</p>
                  <p className="text-xs text-gray-400">{pm.last4 ? `•••• ${pm.last4}` : pm.id}</p>
                </div>
                <button className="text-xs text-red-400 hover:underline">Remove</button>
              </div>
            ))}
            <button className="w-full py-2.5 border-2 border-dashed border-gray-200 text-gray-400 rounded-xl text-sm flex items-center justify-center gap-2 hover:border-green-300 hover:text-green-600 transition">
              <Plus className="w-4 h-4" /> Add Payment Method
            </button>
          </div>
        </div>

        {/* Active Sessions */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">Active Sessions</p>
          <div className="space-y-2">
            {sessions.length === 0 && <p className="text-sm text-gray-400 px-1">No session data available.</p>}
            {sessions.map(s => (
              <div key={s.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
                <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center shrink-0"><Shield className="w-4 h-4 text-gray-400" /></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-800">{s.device}</p>
                    {s.current && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold">Current</span>}
                  </div>
                  <p className="text-xs text-gray-400">{s.location} · {s.time}</p>
                </div>
                {!s.current && <button className="text-xs text-red-400 hover:underline shrink-0">Revoke</button>}
              </div>
            ))}
            {sessions.length > 1 && (
              <button className="w-full py-2.5 text-sm text-red-500 font-medium hover:bg-red-50 rounded-xl transition border border-red-100">
                Logout All Other Devices
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPrivacy = () => (
    <div>
      <SectionHead title="Privacy" subtitle="Your data rights and account controls" />
      <div className="space-y-2 mb-6">
        {[
          { icon: Download, iconColor: 'text-green-600', bg: 'bg-green-50', label: 'Download My Data', desc: 'Get a copy of everything we store about you' },
          { icon: Shield,   iconColor: 'text-blue-500',  bg: 'bg-blue-50',  label: 'Privacy Settings',      desc: 'Control what data is collected and how it is used' },
          { icon: Settings, iconColor: 'text-purple-500',bg: 'bg-purple-50',label: 'Data Sharing',          desc: 'Manage sharing preferences with third parties' },
        ].map(({ icon: Icon, iconColor, bg, label, desc }) => (
          <button key={label} className="w-full flex items-center gap-3 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition text-left">
            <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center shrink-0`}>
              <Icon className={`w-4 h-4 ${iconColor}`} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
          </button>
        ))}
      </div>
      <div className="border-t border-gray-100 pt-5">
        <p className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-3">Danger Zone</p>
        <button className="w-full flex items-center gap-3 p-4 border border-red-100 rounded-xl hover:bg-red-50 transition text-left">
          <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
            <Trash2 className="w-4 h-4 text-red-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-600">Delete Account</p>
            <p className="text-xs text-gray-400 mt-0.5">Permanently remove your account and all associated data</p>
          </div>
        </button>
      </div>
    </div>
  );

  const SECTION_RENDERERS = {
    profile: renderProfile,
    orders: renderOrders,
    wishlist: renderWishlist,
    addresses: renderAddresses,
    plants: renderPlants,
    reviews: renderReviews,
    rewards: renderRewards,
    notifications: renderNotifications,
    security: renderSecurity,
    privacy: renderPrivacy,
  };

  /* ════════════════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════════════════ */

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Global banners ─── */}
      <AnimatePresence>
        {saveSuccess && !saveError && (
          <motion.div
            key="save-success"
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-green-600 text-white text-sm px-5 py-3 rounded-full shadow-lg"
          >
            <CheckCircle className="w-4 h-4" /> Profile saved successfully!
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {emailChanged && (
          <motion.div
            key="email-changed"
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-amber-500 text-white text-sm px-5 py-3 rounded-full shadow-lg max-w-sm text-center"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Please verify your new email address.</span>
            <button onClick={() => setEmailChanged(false)} className="ml-2 opacity-70 hover:opacity-100"><X className="w-4 h-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6">

        {/* ════ LEFT SIDEBAR ════ */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-8">

            {/* Avatar + identity */}
            <div className="bg-gradient-to-b from-green-500 to-green-600 px-5 py-6">
              {/* Avatar */}
              <div className="relative w-16 h-16 mb-3">
                <div className="w-16 h-16 rounded-2xl border-2 border-white/40 overflow-hidden bg-green-400 shadow-md">
                  {uploadingAvatar ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    </div>
                  ) : displayAvatar ? (
                    <img src={displayAvatar} alt={displayName} className="w-full h-full object-cover" onError={e => { e.target.src = ''; e.target.style.display = 'none'; }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white/80">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                {isEditing && (
                  <label htmlFor="avatar-upload" className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-lg shadow flex items-center justify-center cursor-pointer hover:bg-green-50 transition">
                    <Camera className="w-3.5 h-3.5 text-green-600" />
                  </label>
                )}
              </div>
              <input ref={avatarInputRef} id="avatar-upload" type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleAvatarChange} />
              {avatarError && <p className="text-red-200 text-xs mb-2">{avatarError}</p>}

              {/* Name */}
              <h1 className="text-white font-bold text-base leading-tight">{displayName}</h1>
              {profile?.username && (
                <p className="text-green-200 text-xs mt-0.5 flex items-center gap-1">
                  <AtSign className="w-3 h-3" />{profile.username}
                </p>
              )}
              {roleBadge && (
                <span className="inline-flex items-center gap-1 mt-2 bg-white/20 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" /> {roleBadge}
                </span>
              )}

              {/* Profile completion */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-green-200">Profile complete</span>
                  <span className="text-[11px] font-bold text-white">{completionPct}%</span>
                </div>
                <div className="bg-white/20 rounded-full h-1.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPct}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="bg-white h-1.5 rounded-full"
                  />
                </div>
              </div>
            </div>

            {/* Nav */}
            <nav className="p-3 space-y-0.5">
              {NAV.map(item => (
                <NavItem
                  key={item.id}
                  icon={item.icon}
                  label={item.label}
                  active={activeSection === item.id}
                  onClick={() => setActiveSection(item.id)}
                  badge={item.badge}
                />
              ))}
            </nav>

            {/* Logout */}
            <div className="px-3 pb-3 border-t border-gray-50 pt-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-50 hover:text-red-500 transition"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* ════ MAIN CONTENT ════ */}
        <main className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8 min-h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18 }}
              >
                {SECTION_RENDERERS[activeSection]?.()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

      </div>

      {/* ── Change Password Modal ── */}
      <AnimatePresence>
        {showPwdModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-green-600" /> Change Password
                </h3>
                <button onClick={() => setShowPwdModal(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <AnimatePresence>
                {pwdSuccess && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-4">
                    <CheckCircle className="w-4 h-4 shrink-0" /> Password changed! Closing…
                  </motion.div>
                )}
              </AnimatePresence>
              {pwdError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {pwdError}
                </div>
              )}

              <div className="space-y-4">
                {[
                  { label: 'Current Password', name: 'currentPassword' },
                  { label: 'New Password',      name: 'newPassword'     },
                  { label: 'Confirm Password',  name: 'confirmPassword' },
                ].map(({ label, name }) => (
                  <PasswordField key={name} label={label} name={name} value={pwdForm[name]} onChange={handlePwdFieldChange} />
                ))}
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowPwdModal(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button onClick={handlePasswordSubmit} disabled={changingPwd || pwdSuccess} className="flex-1 py-2.5 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 transition flex items-center justify-center gap-2 disabled:opacity-60">
                  {changingPwd ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</> : 'Update Password'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Add Address Modal ── */}
      <AnimatePresence>
        {showAddressModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-600" /> Add Address
                </h3>
                <button onClick={() => setShowAddressModal(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <FormField label="Label (Home, Office…)" name="type"   value={newAddress.type}   onChange={e => setNewAddress(p => ({ ...p, type: e.target.value }))} />
                <FormField label="Street Address"        name="street" value={newAddress.street} onChange={e => setNewAddress(p => ({ ...p, street: e.target.value }))} multiline />
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="City"     name="city" value={newAddress.city} onChange={e => setNewAddress(p => ({ ...p, city: e.target.value }))} />
                  <FormField label="PIN Code" name="pin"  value={newAddress.pin}  onChange={e => setNewAddress(p => ({ ...p, pin: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowAddressModal(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (newAddress.type && newAddress.street) {
                      setAddresses(prev => [
                        ...prev,
                        { id: Date.now(), type: newAddress.type, icon: Home, address: newAddress.street, city: `${newAddress.city}${newAddress.pin ? ' - ' + newAddress.pin : ''}`, isDefault: prev.length === 0 },
                      ]);
                      setNewAddress({ type: '', street: '', city: '', pin: '' });
                      setShowAddressModal(false);
                    }
                  }}
                  className="flex-1 py-2.5 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 transition"
                >
                  Save Address
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePage;