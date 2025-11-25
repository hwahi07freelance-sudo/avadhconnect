/**
 * Dashboard Logic with Supabase
 */

// Get Supabase client
const supabase = window.supabaseClient;

document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is logged in
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        window.location.href = '../auth/login.html';
        return;
    }

    // Get user profile
    const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('uid', session.user.id)
        .single();

    if (!userData || userData.role !== 'business') {
        alert('Access denied. Business accounts only.');
        window.location.href = '../index.html';
        return;
    }

    // Update Welcome Message
    const welcomeMsg = document.getElementById('welcome-msg');
    if (welcomeMsg) {
        welcomeMsg.innerText = `Welcome Back, ${userData.business_name || userData.name}`;
    }

    // Load Dashboard Stats
    await loadDashboardStats(session.user.id);
});

async function loadDashboardStats(userId) {
    const listingStatus = document.getElementById('listing-status');
    const listingViews = document.getElementById('listing-views');

    if (!listingStatus) return;

    // Fetch user's listing
    const { data: listing, error } = await supabase
        .from('listings')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error loading listing:', error);
        return;
    }

    if (listing) {
        listingStatus.innerText = listing.status || 'Pending';
        listingStatus.style.color = listing.status === 'Approved' ? 'var(--success-color)' : 'var(--warning-color)';

        if (listingViews) {
            listingViews.innerText = listing.views || 0;
        }
    } else {
        listingStatus.innerText = 'No Listing';
        listingStatus.style.color = 'var(--text-secondary)';
    }
}

async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('Logout error:', error);
    }
    window.location.href = '../index.html';
}
