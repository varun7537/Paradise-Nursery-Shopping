// src/store/consultationSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

// ─────────────────────────────────────────────────────────────────────────────
// Thunk — POST /api/consultations
// Sends multipart/form-data with every field the form collects, plus files.
// ─────────────────────────────────────────────────────────────────────────────
export const submitConsultation = createAsyncThunk(
  'consultation/submit',
  async (formData, { rejectWithValue }) => {
    try {
      const payload = new FormData();

      // ── Core contact fields ──
      payload.append('name', formData.name);
      payload.append('email', formData.email);
      payload.append('phone', formData.phone);
      if (formData.whatsapp) payload.append('whatsapp', formData.whatsapp);
      payload.append('preferredContact', formData.preferredContact);
      payload.append('consultationType', formData.consultationType);

      // ── Plant Care fields ──
      if (formData.plantCategory) payload.append('plantCategory', formData.plantCategory);
      if (formData.plantCount) payload.append('plantCount', formData.plantCount);
      (formData.problemType || []).forEach((p) => payload.append('problemType', p));
      if (formData.plantName) payload.append('plantName', formData.plantName);
      if (formData.plantAge) payload.append('plantAge', formData.plantAge);

      // ── Landscape Design fields ──
      if (formData.areaSize) payload.append('areaSize', formData.areaSize);
      if (formData.budget) payload.append('budget', formData.budget);
      if (formData.address) payload.append('address', formData.address);

      // ── Pest Control fields ──
      if (formData.pestType) payload.append('pestType', formData.pestType);
      if (formData.severity) payload.append('severity', formData.severity);

      // ── Scheduling / message ──
      if (formData.preferredDate) payload.append('preferredDate', formData.preferredDate);
      if (formData.preferredTime) payload.append('preferredTime', formData.preferredTime);
      if (formData.message) payload.append('message', formData.message);

      // ── Home visit ──
      payload.append('requiresHomeVisit', formData.requiresHomeVisit ? 'true' : 'false');
      if (formData.requiresHomeVisit && formData.homeVisitAddress) {
        payload.append('homeVisitAddress', formData.homeVisitAddress);
      }

      // ── Consent (REQUIRED by the backend validator — this was missing before) ──
      payload.append('agreeToTerms', formData.agreeToTerms ? 'true' : 'false');
      payload.append('agreeToPrivacy', formData.agreeToPrivacy ? 'true' : 'false');

      // ── Lead tracking / honeypot ──
      payload.append('source', formData.source || 'website');
      payload.append('page', formData.page || '/');
      if (formData._hp_field) payload.append('_hp_field', formData._hp_field);

      // ── Files — field name must be "files" to match upload.array('files', 5) ──
      (formData.files || []).forEach((file) => payload.append('files', file));

      const { data } = await api.post('/consultations', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    } catch (err) {
      // Backend error shape: { success:false, message, errors: [{field, message, location}] }
      const fieldMessages = err.response?.data?.errors?.map((e) => e.message).join(', ');
      const message =
        fieldMessages ||
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Something went wrong. Please try again.';
      return rejectWithValue(message);
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────────────────────────────────────
const consultationSlice = createSlice({
  name: 'consultation',
  initialState: {
    loading: false,
    success: false,
    error: null,
    submitted: null,
  },
  reducers: {
    resetConsultation(state) {
      state.loading = false;
      state.success = false;
      state.error = null;
      state.submitted = null;
    },
    clearConsultationError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitConsultation.pending, (s) => {
        s.loading = true;
        s.error = null;
        s.success = false;
      })
      .addCase(submitConsultation.fulfilled, (s, { payload }) => {
        s.loading = false;
        s.success = true;
        s.submitted = payload.data ?? payload.consultation ?? payload;
      })
      .addCase(submitConsultation.rejected, (s, { payload }) => {
        s.loading = false;
        s.error = payload;
      });
  },
});

export const { resetConsultation, clearConsultationError } = consultationSlice.actions;

export const selectConsultationLoading = (s) => s.consultation.loading;
export const selectConsultationSuccess = (s) => s.consultation.success;
export const selectConsultationError = (s) => s.consultation.error;
export const selectSubmittedConsultation = (s) => s.consultation.submitted;

export default consultationSlice.reducer;