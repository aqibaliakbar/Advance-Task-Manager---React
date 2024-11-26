// lib/supabase.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// export const supabaseClient = {
//   // Auth operations
//   auth: {
//     signIn: async ({ email, password }) => {
//       const { data, error } = await supabase.auth.signInWithPassword({
//         email,
//         password,
//       });
//       if (error) throw error;
//       return data;
//     },
//     signUp: async ({ email, password, full_name }) => {
//       const { data, error } = await supabase.auth.signUp({
//         email,
//         password,
//         options: {
//           data: { full_name },
//         },
//       });
//       if (error) throw error;
//       return data;
//     },
//     signOut: async () => {
//       const { error } = await supabase.auth.signOut();
//       if (error) throw error;
//     },
//   },

  // Team operations
  // teams: {
  //   create: async ({ name, created_by }) => {
  //     const { data, error } = await supabase
  //       .from("teams")
  //       .insert({ name, created_by })
  //       .select()
  //       .single();

  //     if (error) throw error;
  //     return data;
  //   },

  //   addMember: async ({ team_id, email, user_id }) => {
  //     const { data, error } = await supabase
  //       .from("team_members")
  //       .insert({ team_id, email, user_id })
  //       .select()
  //       .single();

  //     if (error) throw error;
  //     return data;
  //   },
  // },

  // // Real-time subscriptions
  // subscribeToProject: (projectId, callback) => {
  //   const subscription = supabase
  //     .channel(`project-${projectId}`)
  //     .on(
  //       "postgres_changes",
  //       {
  //         event: "*",
  //         schema: "public",
  //         table: "tasks",
  //         filter: `project_id=eq.${projectId}`,
  //       },
  //       callback
  //     )
  //     .subscribe();
  //   return subscription;
  // },
// };
