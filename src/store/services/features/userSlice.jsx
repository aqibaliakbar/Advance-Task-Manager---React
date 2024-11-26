import { supabase } from "@/lib/supabase";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const STORAGE_KEY = "app_session";
const STORAGE_PROFILE_KEY = "app_profile";

export const signUp = createAsyncThunk(
  "user/signUp",
  async ({ email, password, full_name }) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (authError) throw authError;

    const { data: profileData, error: profileError } = await supabase
      .from("users")
      .insert([
        {
          id: authData.user.id,
          email: email,
          full_name: full_name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (profileError) throw profileError;

    // Store in localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authData.session));
    localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(profileData));

    return {
      session: authData.session,
      profile: profileData,
    };
  }
);

export const signIn = createAsyncThunk(
  "user/signIn",
  async ({ email, password }) => {
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) throw authError;

    const { data: profileData, error: profileError } = await supabase
      .from("users")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (profileError) throw profileError;

    // Store in localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authData.session));
    localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(profileData));

    return {
      session: authData.session,
      profile: profileData,
    };
  }
);

export const signOut = createAsyncThunk("user/signOut", async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;

  // Clear localStorage
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_PROFILE_KEY);
});

const userSlice = createSlice({
  name: "user",
  initialState: {
    session: null,
    profile: null,
    isLoading: true,
    error: null,
  },
  reducers: {
    setSession: (state, action) => {
      state.session = action.payload;
    },
    setProfile: (state, action) => {
      state.profile = action.payload;
    },
    setIsLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signIn.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.session = action.payload.session;
        state.profile = action.payload.profile;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(signUp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signUp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.session = action.payload.session;
        state.profile = action.payload.profile;
      })
      .addCase(signUp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(signOut.fulfilled, (state) => {
        state.session = null;
        state.profile = null;
      });
  },
});

export const { setSession, setProfile, setIsLoading, clearError } =
  userSlice.actions;

export default userSlice.reducer;
