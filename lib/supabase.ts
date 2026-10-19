import {
  createBrowserClient,
} from "@supabase/ssr";

import {
  getSupabasePublicConfig,
} from "@/lib/client-runtime";


export function createClient() {

  const {
    url,
    anonKey,
  } =
    getSupabasePublicConfig();


  return createBrowserClient(
    url,
    anonKey
  );
}
