// src/store/authSlice.js  — PATCH NOTE (file not provided, so this is guidance,
// not a full rewrite)
//
// Your `loginUser` thunk currently does something like:
//
//   export const loginUser = createAsyncThunk(
//     'auth/login',
//     async ({ email, password }, thunkAPI) => {
//       const { data } = await api.post('/auth/login', { email, password });
//       return data;
//     }
//   );
//
// ── FIX REQUIRED: accept and forward `turnstileToken` ───────────────────────
// Since LoginPage.jsx now dispatches:
//
//   loginUser({ email, password, turnstileToken })
//
// the thunk's request body must include it, or the backend's `loginRules`
// validator (which requires `turnstileToken`) will reject every request
// with a 422 before it even reaches verifyCaptcha. Update the destructuring
// and the request body to pass it straight through:
//
//   export const loginUser = createAsyncThunk(
//     'auth/login',
//     async ({ email, password, turnstileToken }, thunkAPI) => {
//       try {
//         const { data } = await api.post('/auth/login', {
//           email,
//           password,
//           turnstileToken,
//         });
//         return data;
//       } catch (err) {
//         const message =
//           err.response?.data?.message ||
//           err.response?.data?.fields?.[0]?.message ||
//           'Login failed. Please try again.';
//         return thunkAPI.rejectWithValue(message);
//       }
//     }
//   );
//
// No other changes to authSlice are needed — selectAuthError, selectAuthLoading,
// etc. all keep working exactly as before, since the CAPTCHA-specific error
// messages from the backend (CAPTCHA_MISSING / CAPTCHA_INVALID / CAPTCHA_EXPIRED)
// flow through the same `error`/`message` field your existing error handling
// already reads.