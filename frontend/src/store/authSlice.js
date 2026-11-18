// src/store/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';
import api from '../services/api';

const unwrapUser = (responseData) => {
  if (responseData?.user && typeof responseData.user === 'object') {
    return responseData.user;
  }
  if (responseData?.data?.user && typeof responseData.data.user === 'object') {
    return responseData.data.user;
  }
  return responseData;
};

export const loginUser = createAsyncThunk(
  'auth/login',
  // ── FIX: destructure `turnstileToken` from the dispatched payload and
  // forward it in the request body. Previously only { email, password }
  // were pulled out, so the CAPTCHA token LoginPage.jsx already collects
  // and dispatches was silently dropped before the request ever left the
  // browser — the backend then correctly rejected every login attempt
  // with 422 "Validation failed." because `turnstileToken` was missing.
  async ({ email, password, turnstileToken }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/login', { email, password, turnstileToken });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return { token: data.token, user: data.user };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Invalid email or password.'
      );
    }
  }
);

// ── NOTE: registerUser already forwards the full `formData` object as-is
// (no destructuring), so SignupPage.jsx's `payload.append('turnstileToken', ...)`
// on the FormData object passes through untouched — no change needed here.
export const registerUser = createAsyncThunk(
  'auth/register',
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/signup', formData, {
        headers: formData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
      });
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      return { token: data.token ?? null, user: data.user ?? null };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Registration failed.'
      );
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/auth/me');
      const user = unwrapUser(data);
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return rejectWithValue(err.response?.data?.message || 'Session expired.');
      }
      return rejectWithValue(err.response?.data?.message || 'Failed to load user.');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const payload = { ...profileData };
      if (!payload.fullName && payload.name) {
        payload.fullName = payload.name;
      }
      delete payload.name;

      const { data } = await api.put('/users/me', payload);
      const user = unwrapUser(data);

      if (!user || !user.id) {
        return rejectWithValue('Server returned an unexpected response. Please try again.');
      }

      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Profile update failed.'
      );
    }
  }
);

export const uploadAvatar = createAsyncThunk(
  'auth/uploadAvatar',
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const { data } = await api.post('/auth/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const user = unwrapUser(data);
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Avatar upload failed.'
      );
    }
  }
);

export const resetAvatar = createAsyncThunk(
  'auth/resetAvatar',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/me/reset-avatar');
      const user = unwrapUser(data);
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Avatar reset failed.'
      );
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ currentPassword, newPassword, confirmPassword }, { rejectWithValue }) => {
    try {
      if (newPassword !== confirmPassword) {
        return rejectWithValue('New passwords do not match.');
      }
      if (!newPassword || newPassword.length < 8) {
        return rejectWithValue('New password must be at least 8 characters.');
      }
      const { data } = await api.post('/auth/me/change-password', {
        currentPassword,
        newPassword,
      });
      return data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Password change failed.'
      );
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:            JSON.parse(localStorage.getItem('user') || 'null'),
    token:           localStorage.getItem('token') || null,
    loading:         false,
    hydrating:       true,
    updating:        false,
    uploadingAvatar: false,
    changingPwd:     false,
    error:           null,
    updateError:     null,
    avatarError:     null,
    pwdError:        null,
    pwdSuccess:      false,
  },
  reducers: {
    clearAuthError(state)   { state.error = null; },
    clearUpdateError(state) { state.updateError = null; },
    clearAvatarError(state) { state.avatarError = null; },
    clearPwdError(state)    { state.pwdError = null; state.pwdSuccess = false; },

    logout(state) {
      state.user    = null;
      state.token   = null;
      state.error   = null;
      state.loading = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    syncUser(state, { payload }) {
      if (payload && payload.id) {
        state.user = payload;
        localStorage.setItem('user', JSON.stringify(payload));
      }
    },
    clearAuth(state) {
      state.user    = null;
      state.token   = null;
      state.error   = null;
      state.loading = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },

  extraReducers: (builder) => {
    // ── REHYDRATE ─────────────────────────────────────────────────────────────
    builder.addCase(REHYDRATE, (state, action) => {
      const persistedAuth = action.payload?.auth;
      if (persistedAuth) {
        state.user  = persistedAuth.user  ?? state.user;
        state.token = persistedAuth.token ?? state.token;
      }
      state.hydrating = false;
    });

    builder
      .addCase(loginUser.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(loginUser.fulfilled, (s, { payload }) => {
        s.loading = false;
        s.token   = payload.token;
        s.user    = payload.user;
      })
      .addCase(loginUser.rejected, (s, { payload }) => {
        s.loading = false;
        s.error   = payload;
      });

    builder
      .addCase(registerUser.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(registerUser.fulfilled, (s, { payload }) => {
        s.loading = false;
        s.user    = payload.user;
        s.token   = payload.token;
      })
      .addCase(registerUser.rejected, (s, { payload }) => {
        s.loading = false;
        s.error   = payload;
      });

    builder
      .addCase(fetchCurrentUser.pending,   (s) => { s.hydrating = true; })
      .addCase(fetchCurrentUser.fulfilled, (s, { payload }) => {
        s.hydrating = false;
        s.user      = payload;
      })
      .addCase(fetchCurrentUser.rejected, (s, { payload }) => {
        s.hydrating = false;
        if (
          typeof payload === 'string' &&
          (payload.includes('Session expired') || payload.includes('expired'))
        ) {
          s.user  = null;
          s.token = null;
        }
      });

    builder
      .addCase(updateProfile.pending,   (s) => { s.updating = true; s.updateError = null; })
      .addCase(updateProfile.fulfilled, (s, { payload }) => {
        s.updating = false;
        s.user     = payload;
      })
      .addCase(updateProfile.rejected, (s, { payload }) => {
        s.updating    = false;
        s.updateError = payload;
      });

    builder
      .addCase(uploadAvatar.pending,   (s) => { s.uploadingAvatar = true; s.avatarError = null; })
      .addCase(uploadAvatar.fulfilled, (s, { payload }) => {
        s.uploadingAvatar = false;
        s.user            = payload;
      })
      .addCase(uploadAvatar.rejected, (s, { payload }) => {
        s.uploadingAvatar = false;
        s.avatarError     = payload;
      });

    builder
      .addCase(resetAvatar.pending,   (s) => { s.uploadingAvatar = true; s.avatarError = null; })
      .addCase(resetAvatar.fulfilled, (s, { payload }) => {
        s.uploadingAvatar = false;
        s.user            = payload;
      })
      .addCase(resetAvatar.rejected, (s, { payload }) => {
        s.uploadingAvatar = false;
        s.avatarError     = payload;
      });

    builder
      .addCase(changePassword.pending,   (s) => { s.changingPwd = true; s.pwdError = null; s.pwdSuccess = false; })
      .addCase(changePassword.fulfilled, (s) => {
        s.changingPwd = false;
        s.pwdSuccess  = true;
      })
      .addCase(changePassword.rejected, (s, { payload }) => {
        s.changingPwd = false;
        s.pwdError    = payload;
      });
  },
});

export const {
  clearAuthError,
  clearUpdateError,
  clearAvatarError,
  clearPwdError,
  logout,
  syncUser,
  clearAuth,
} = authSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectUser            = (s) => s.auth.user;
export const selectToken           = (s) => s.auth.token;
export const selectAuthLoading     = (s) => s.auth.loading;
export const selectHydrating       = (s) => s.auth.hydrating;
export const selectAuthError       = (s) => s.auth.error;
export const selectIsLoggedIn      = (s) => Boolean(s.auth.token);
export const selectUpdating        = (s) => s.auth.updating;
export const selectUpdateError     = (s) => s.auth.updateError;
export const selectUploadingAvatar = (s) => s.auth.uploadingAvatar;
export const selectAvatarError     = (s) => s.auth.avatarError;
export const selectChangingPwd     = (s) => s.auth.changingPwd;
export const selectPwdError        = (s) => s.auth.pwdError;
export const selectPwdSuccess      = (s) => s.auth.pwdSuccess;
export const selectUserRole        = (s) => s.auth.user?.role ?? 'User';

export const selectIsAdmin = (s) =>
  s.auth.user?.role === 'Admin' || s.auth.user?.isAdmin === true;

export default authSlice.reducer;