// src/hooks/useProfile.js
// All mutations use authSlice thunks — never profileSlice.
// This is the file that controls what happens when the user clicks Save.

import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  updateProfile,
  uploadAvatar,
  resetAvatar,
  changePassword,
  clearUpdateError,
  clearAvatarError,
  clearPwdError,
  selectUser,
  selectUpdating,
  selectUploadingAvatar,
  selectChangingPwd,
  selectUpdateError,
  selectAvatarError,
  selectPwdError,
  selectPwdSuccess,
} from '../store/authSlice';

import { setProfileData } from '../store/profileSlice';

const useProfile = () => {
  const dispatch = useDispatch();

  // Always read the user from authSlice — single source of truth
  const user = useSelector(selectUser);

  const saving          = useSelector(selectUpdating);
  const uploadingAvatar = useSelector(selectUploadingAvatar);
  const changingPwd     = useSelector(selectChangingPwd);
  const saveError       = useSelector(selectUpdateError);
  const avatarError     = useSelector(selectAvatarError);
  const pwdError        = useSelector(selectPwdError);
  const pwdSuccess      = useSelector(selectPwdSuccess);

  const [isEditing,     setIsEditing]     = useState(false);
  const [localForm,     setLocalForm]     = useState({});
  const [localErrors,   setLocalErrors]   = useState({});
  const [showPwdModal,  setShowPwdModal]  = useState(false);
  const [pwdForm,       setPwdForm]       = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  });
  const [avatarPreview, setAvatarPreview] = useState(null);

  const clearAllErrors = useCallback(() => {
    dispatch(clearUpdateError());
    dispatch(clearAvatarError());
  }, [dispatch]);

  // ── Start editing ─────────────────────────────────────────────────────────
  const startEditing = useCallback(() => {
    if (!user) return;
    setLocalForm({
      fullName: user.fullName || user.name || '',
      email:    user.email    || '',
      bio:      user.bio      || '',
      phone:    user.phone    || '',
      location: user.location || '',
      username: user.username || '',
      website:  user.website  || '',
    });
    setLocalErrors({});
    setAvatarPreview(null);
    clearAllErrors();
    setIsEditing(true);
  }, [user, clearAllErrors]);

  const cancelEditing = useCallback(() => {
    setIsEditing(false);
    setLocalErrors({});
    setAvatarPreview(null);
    clearAllErrors();
  }, [clearAllErrors]);

  const handleFieldChange = useCallback((e) => {
    const { name, value } = e.target;
    setLocalForm((prev) => ({ ...prev, [name]: value }));
    setLocalErrors((prev) => ({ ...prev, [name]: '' }));
  }, []);

  // ── Validation ────────────────────────────────────────────────────────────
  const validateForm = (form) => {
    const errs = {};
    const name = form.fullName?.trim();
    if (!name || name.length < 2 || name.length > 120) {
      errs.fullName = 'Full name must be 2–120 characters.';
    }
    if (!form.email?.trim()) {
      errs.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Must be a valid email address.';
    }
    if (form.bio && form.bio.length > 500) {
      errs.bio = 'Bio must be 500 characters or fewer.';
    }
    return errs;
  };

  // ── Save ─────────────────────────────────────────────────────────────────
  // This is the function called when the user clicks "Save Changes".
  // It dispatches authSlice.updateProfile — the ONLY thunk that should
  // ever update state.auth.user.
  const handleSave = useCallback(async () => {
    const errs = validateForm(localForm);
    if (Object.keys(errs).length > 0) {
      setLocalErrors(errs);
      return false;
    }

    try {
      const result = await dispatch(
        updateProfile({
          fullName: localForm.fullName.trim(),
          email:    localForm.email.trim(),
          phone:    localForm.phone    || null,
          bio:      localForm.bio      || null,
          location: localForm.location || null,
          username: localForm.username || null,
          website:  localForm.website  || null,
        })
      ).unwrap();  // .unwrap() throws on rejection so the catch below fires

      // Keep profileSlice in sync so the profile page doesn't need a re-fetch
      dispatch(setProfileData(result));

      setIsEditing(false);
      setAvatarPreview(null);
      return true;
    } catch (errorMessage) {
      // errorMessage is the rejectWithValue string from the thunk.
      // saveError in Redux is already set — the UI will render it.
      // We do NOT touch state.auth.user here under any circumstances.
      return false;
    }
  }, [dispatch, localForm]);

  // ── Avatar ────────────────────────────────────────────────────────────────
  const handleAvatarFileSelect = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
    dispatch(uploadAvatar(file));
  }, [dispatch]);

  const handleAvatarReset = useCallback(() => {
    setAvatarPreview(null);
    dispatch(resetAvatar());
  }, [dispatch]);

  // ── Password ──────────────────────────────────────────────────────────────
  const handlePwdFieldChange = useCallback((e) => {
    const { name, value } = e.target;
    setPwdForm((prev) => ({ ...prev, [name]: value }));
    dispatch(clearPwdError());
  }, [dispatch]);

  const handlePasswordSubmit = useCallback(async () => {
    try {
      await dispatch(changePassword(pwdForm)).unwrap();
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setShowPwdModal(false), 1500);
    } catch {
      // pwdError is set in Redux — rendered by the modal
    }
  }, [dispatch, pwdForm]);

  return {
    profile:        user,
    user,
    avatarPreview,
    loading:        false,
    saving,
    uploadingAvatar,
    changingPwd,
    isEditing,
    showPwdModal,
    profileError:   null,
    saveError,
    avatarError,
    pwdError,
    pwdSuccess,
    localForm,
    localErrors,
    pwdForm,
    startEditing,
    cancelEditing,
    handleFieldChange,
    handleSave,
    handleAvatarFileSelect,
    handleAvatarReset,
    setShowPwdModal,
    handlePwdFieldChange,
    handlePasswordSubmit,
  };
};

export default useProfile;