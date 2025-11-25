/**
 * Supabase Configuration
 * Initializes Supabase client for authentication and database
 */

const SUPABASE_URL = 'https://qphgtdehhihobjfaaula.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwaGd0ZGVoaGlob2JqZmFhdWxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwNTQ4NjksImV4cCI6MjA3OTYzMDg2OX0.hb-6JeRqs1NN-xyqRBEZDf_YiaZfsHpM0n3FnMi-1ro';

// Check if Supabase library is loaded
if (typeof window.supabase === 'undefined') {
    console.error('❌ Supabase library not loaded! Make sure the CDN script is included.');
    window.supabaseClient = null;
} else {
    try {
        // Initialize Supabase client
        const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

        // Export for use in other files
        window.supabaseClient = supabase;

        // Verify connection
        supabase.auth.getSession().then(({ data, error }) => {
            if (error) {
                console.error('❌ Supabase connection error:', error);
            } else {
                console.log('✅ Supabase initialized successfully');
                if (data.session) {
                    console.log('👤 User session active:', data.session.user.email);
                }
            }
        });
    } catch (error) {
        console.error('❌ Error initializing Supabase:', error);
        window.supabaseClient = null;
    }
}
