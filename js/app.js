/**
 * Avadh Connect - Main Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('Avadh Connect App Initialized');

    // Check authentication state
    checkAuthState();

    // Initialize Categories if empty
    initCategories();
});

function initCategories() {
    if (!localStorage.getItem('categories')) {
        const defaults = [
            {
                id: 'food',
                name: 'Food & Dining',
                icon: '🍽️',
                desc: 'Cafes, Restaurants & Home Bakers',
                subcategories: ['Cafe', 'Restaurant', 'Bakery', 'Fast Food', 'Catering']
            },
            {
                id: 'retail',
                name: 'Retail & Shopping',
                icon: '🛍️',
                desc: 'Boutiques, Groceries & Essentials',
                subcategories: ['Clothing', 'Grocery', 'Electronics', 'Home Decor', 'Stationery']
            },
            {
                id: 'services',
                name: 'Home Services',
                icon: '🔧',
                desc: 'Plumbers, Electricians & Repairs',
                subcategories: ['Plumbing', 'Electrical', 'Cleaning', 'Carpentry', 'Pest Control']
            },
            {
                id: 'health',
                name: 'Health & Wellness',
                icon: '💊',
                desc: 'Doctors, Gyms & Pharmacies',
                subcategories: ['Doctor', 'Pharmacy', 'Gym', 'Yoga', 'Dental']
            },
            {
                id: 'education',
                name: 'Education & Tutoring',
                icon: '📚',
                desc: 'Tutors, Classes & Training',
                subcategories: ['Academic Tutor', 'Music Classes', 'Dance Classes', 'Art Classes', 'Coding Classes']
            },
            {
                id: 'professional',
                name: 'Professional Services',
                icon: '💼',
                desc: 'Consultants, Lawyers & Accountants',
                subcategories: ['Legal', 'Accounting', 'Consulting', 'Real Estate', 'Insurance']
            }
        ];
        localStorage.setItem('categories', JSON.stringify(defaults));
    }
}

function getCategories() {
    return JSON.parse(localStorage.getItem('categories')) || [];
}

function addCategory(name) {
    const categories = getCategories();
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '-');

    if (!categories.find(c => c.id === id)) {
        categories.push({
            id: id,
            name: name,
            icon: '✨', // Default icon for new categories
            desc: 'New Category'
        });
        localStorage.setItem('categories', JSON.stringify(categories));
        return id;
    }
    return categories.find(c => c.name.toLowerCase() === name.toLowerCase()).id;
}

function checkAuthState() {
    // Check Supabase authentication state
    supabase.auth.getSession().then(({ data: { session } }) => {
        const authButtons = document.getElementById('auth-buttons');

        if (session && authButtons) {
            // User is logged in, fetch their profile
            supabase
                .from('users')
                .select('*')
                .eq('uid', session.user.id)
                .single()
                .then(({ data: userData, error }) => {
                    if (userData && authButtons) {
                        const displayName = userData.name || userData.business_name || 'User';
                        const dashboardLink = userData.role === 'business' ? 'dashboard/index.html' :
                            userData.role === 'admin' ? 'admin/index.html' : '#';

                        authButtons.innerHTML = `
                            <div style="position: relative; display: inline-block;">
                                <div onclick="toggleUserMenu()" style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--primary-color), #7c3aed); display: flex; align-items: center; justify-content: center; cursor: pointer; color: white; font-weight: 600; font-size: 1rem; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                                    ${displayName.charAt(0).toUpperCase()}
                                </div>
                                <div id="user-menu" style="display: none; position: absolute; right: 0; top: 50px; background: var(--surface-glass); backdrop-filter: blur(10px); border: 1px solid var(--border-color); border-radius: var(--radius-md); box-shadow: var(--shadow-lg); min-width: 200px; z-index: 1000;">
                                    <div style="padding: 1rem; border-bottom: 1px solid var(--border-color);">
                                        <div style="font-weight: 600; color: var(--text-primary);">${displayName}</div>
                                        <div style="font-size: 0.875rem; color: var(--text-secondary); margin-top: 0.25rem;">${userData.email}</div>
                                        <div style="font-size: 0.75rem; color: var(--primary-color); margin-top: 0.25rem; text-transform: capitalize;">${userData.role}</div>
                                    </div>
                                    ${dashboardLink !== '#' ? `
                                        <a href="${dashboardLink}" style="display: block; padding: 0.75rem 1rem; color: var(--text-primary); text-decoration: none; transition: background 0.2s;" onmouseover="this.style.background='var(--surface-color)'" onmouseout="this.style.background='transparent'">
                                            📊 Dashboard
                                        </a>
                                    ` : ''}
                                    <a href="#" onclick="logout(); return false;" style="display: block; padding: 0.75rem 1rem; color: var(--text-primary); text-decoration: none; transition: background 0.2s; border-top: 1px solid var(--border-color);" onmouseover="this.style.background='var(--surface-color)'" onmouseout="this.style.background='transparent'">
                                        🚪 Logout
                                    </a>
                                </div>
                            </div>
                        `;
                    }
                });
        }
    });
}

async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('Logout error:', error);
    }
    window.location.reload();
}

// Toggle user menu dropdown
function toggleUserMenu() {
    const menu = document.getElementById('user-menu');
    if (menu) {
        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    }
}

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    const menu = document.getElementById('user-menu');
    if (menu && !e.target.closest('#auth-buttons')) {
        menu.style.display = 'none';
    }
});
