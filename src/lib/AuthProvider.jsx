// src/providers/AuthProvider.jsx
import React, { createContext, useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { supabase } from "../lib/supabase";
import {
  setIsLoading,
  setProfile,
  setSession,
} from "../store/services/features/userSlice";

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { session, profile, isLoading } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(setIsLoading(true));

    const initializeAuth = async () => {
      try {
        const {
          data: { session: currentSession },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (currentSession) {
          const { data: profileData, error: profileError } = await supabase
            .from("users")
            .select("*")
            .eq("id", currentSession.user.id)
            .single();

          if (profileError) throw profileError;

          dispatch(setSession(currentSession));
          dispatch(setProfile(profileData));
        } else {
          dispatch(setSession(null));
          dispatch(setProfile(null));
        }
      } catch (error) {
        console.error("Auth initialization error:", error.message);
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

          dispatch(setSession(session));
          dispatch(setProfile(profile));
        } catch (error) {
          console.error("Profile fetch error:", error.message);
        }
      } else if (event === "SIGNED_OUT") {
        dispatch(setSession(null));
        dispatch(setProfile(null));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch]);

  const value = {
    session,
    profile,
    isLoading,
    isAuthenticated: !!session?.user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
