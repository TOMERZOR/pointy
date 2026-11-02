// Public configuration for the account pages.
// The Supabase "anon" (publishable) key is meant to be public: the database's row-level security
// decides what it can do. NEVER put the service_role / secret key here or anywhere in this repo.
window.POINTY_CONFIG = {
  supabaseUrl: "https://lrfohfcwsgjxeqdbqwbg.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyZm9oZmN3c2dqeGVxZGJxd2JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0NzMxNjMsImV4cCI6MjEwOTA0OTE2M30.Ocw3fZeL8XI6kgfzEnaLC7V1VJv9Hz7wbDNv4TOBil0",
  termsVersion: "2026-11-01",
  // Sign-in providers switched on in Supabase → Authentication → Sign In / Providers. Only these get a button.
  oauthProviders: ["google"]
};
