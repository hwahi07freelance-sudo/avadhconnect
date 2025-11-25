/**
 * Authentication Logic with Supabase
 * Handles Login, Signup, and Role Management
 */

// Get Supabase client instance (will be undefined if not loaded yet)
let supabase;
try {
    supabase = window.supabaseClient;
} catch (e) {
    console.warn('Supabase client not available yet');
}

// Tab Switching
function switchTab(role) {
    const tabs = document.querySelectorAll('.auth-tab');
    const forms = {
        resident: document.getElementById('resident-form'),
        business: document.getElementById('business-form')
    };

    // Update Tabs
    tabs.forEach(tab => {
        if (tab.innerText.toLowerCase().includes(role)) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    // Update Forms
    if (role === 'resident') {
        forms.resident.classList.remove('hidden');
        if (forms.business) forms.business.classList.add('hidden');
    } else {
        if (forms.business) forms.business.classList.remove('hidden');
        forms.resident.classList.add('hidden');
    }
}

// Handle Login with Supabase
async function handleLogin(event) {
    event.preventDefault();
    const inputs = event.target.querySelectorAll('input');
    const email = inputs[0].value;
    const password = inputs[1].value;
    const submitBtn = event.target.querySelector('button[type="submit"]');

    // Disable button and show loading
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in...';

    try {
        // Supabase Authentication
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (authError) throw authError;

        const user = authData.user;
        console.log('User logged in:', user.id);

        // Fetch user profile from database to get role
        const { data: userData, error: dbError } = await supabase
            .from('users')
            .select('*')
            .eq('uid', user.id)
            .single();

        if (dbError) throw new Error('User profile not found');

        const role = userData.role;

        // Redirect based on role
        if (role === 'business') {
            window.location.href = '../dashboard/index.html';
        } else if (role === 'admin') {
            window.location.href = '../admin/index.html';
        } else {
            window.location.href = '../index.html';
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed: ' + error.message);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In';
    }
}

// Handle Signup with Supabase
async function handleSignup(event, role) {
    event.preventDefault();
    const inputs = event.target.querySelectorAll('input');
    const submitBtn = event.target.querySelector('button[type="submit"]');

    // Disable button and show loading
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';

    let email, password, userData;

    if (role === 'resident') {
        const name = inputs[0].value;
        email = inputs[1].value;
        password = inputs[2].value;

        userData = {
            name: name,
            email: email,
            role: 'resident'
        };
    } else {
        const businessName = inputs[0].value;
        const ownerName = inputs[1].value;
        email = inputs[2].value;
        password = inputs[3].value;
        const category = event.target.querySelector('select').value;

        userData = {
            business_name: businessName,
            owner_name: ownerName,
            email: email,
            category: category,
            role: 'business'
        };
    }

    try {
        // Create Supabase user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: password
        });

        if (authError) throw authError;

        const user = authData.user;
        console.log('User created:', user.id);

        // Store user profile in database
        userData.uid = user.id;
        const { error: dbError } = await supabase
            .from('users')
            .insert([userData]);

        if (dbError) throw dbError;

        console.log('User profile created in database');

        // Redirect based on role
        if (role === 'business') {
            window.location.href = '../dashboard/index.html';
        } else {
            window.location.href = '../index.html';
        }
    } catch (error) {
        console.error('Signup error:', error);
        let errorMessage = error.message;

        // Provide user-friendly error messages
        if (errorMessage.includes('already registered') || errorMessage.includes('already exists')) {
            errorMessage = 'This email is already registered. Please login instead.';
        } else if (errorMessage.includes('password')) {
            errorMessage = 'Password should be at least 6 characters.';
        } else if (errorMessage.includes('email') || errorMessage.includes('invalid')) {
            errorMessage = 'Please enter a valid email address.';
        }

        alert('Signup failed: ' + errorMessage);
        submitBtn.disabled = false;
        submitBtn.textContent = role === 'resident' ? 'Create Account' : 'Register Business';
    }
}

// Logout function
async function logout() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        console.log('User logged out');
        window.location.href = '../index.html';
    } catch (error) {
        console.error('Logout error:', error);
        alert('Logout failed: ' + error.message);
    }
}

// Check if user is logged in (for protected pages)
async function requireAuth(allowedRoles = []) {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
        // Not logged in, redirect to login
        window.location.href = '../auth/login.html';
        return;
    }

    // Check role if specified
    if (allowedRoles.length > 0) {
        const { data: userData, error: dbError } = await supabase
            .from('users')
            .select('role')
            .eq('uid', session.user.id)
            .single();

        if (dbError || !userData) {
            alert('Error loading user profile.');
            window.location.href = '../index.html';
            return;
        }

        if (!allowedRoles.includes(userData.role)) {
            alert('Access denied. You do not have permission to view this page.');
            window.location.href = '../index.html';
        }
    }
}
