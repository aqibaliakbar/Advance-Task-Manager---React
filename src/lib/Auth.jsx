import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { supabase } from "./supabase";
import {
  setIsLoading,
  setProfile,
  setSession,
} from "@/store/services/features/userSlice";

const STORAGE_KEY = "app_session";
const STORAGE_PROFILE_KEY = "app_profile";

const Auth = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setIsLoading(true));

    const initializeAuth = async () => {
      try {
        // First check localStorage for existing session
        const storedSession = localStorage.getItem(STORAGE_KEY);
        const storedProfile = localStorage.getItem(STORAGE_PROFILE_KEY);

        if (storedSession && storedProfile) {
          dispatch(setSession(JSON.parse(storedSession)));
          dispatch(setProfile(JSON.parse(storedProfile)));
        }

        // Then verify with Supabase
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (session) {
          const { data: profile, error: profileError } = await supabase
            .from("users")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (profileError) throw profileError;

          // Store in localStorage and Redux
          localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
          localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(profile));
          dispatch(setSession(session));
          dispatch(setProfile(profile));
        } else {
          // Clear everything if no session
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(STORAGE_PROFILE_KEY);
          dispatch(setSession(null));
          dispatch(setProfile(null));
        }
      } catch (error) {
        console.error("Auth initialization error:", error.message);
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_PROFILE_KEY);
        dispatch(setSession(null));
        dispatch(setProfile(null));
      } finally {
        dispatch(setIsLoading(false));
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        try {
          const { data: profile, error: profileError } = await supabase
            .from("users")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (profileError) throw profileError;

          // Store in localStorage and Redux
          localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
          localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(profile));
          dispatch(setSession(session));
          dispatch(setProfile(profile));
        } catch (error) {
          console.error("Profile fetch error:", error.message);
        }
      } else if (event === "SIGNED_OUT") {
        // Clear everything on sign out
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STORAGE_PROFILE_KEY);
        dispatch(setSession(null));
        dispatch(setProfile(null));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch]);

  return null;
};

export default Auth;
