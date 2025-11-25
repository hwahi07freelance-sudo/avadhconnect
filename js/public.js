/**
 * Public Interface Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    if (path.includes('category.html')) {
        loadCategoryPage();
    } else if (path.includes('listing.html')) {
        loadListingPage();
    } else if (path.includes('index.html') || path.endsWith('/')) {
        setupCategoryLinks();
    }
});

function getListings() {
    const listingsStr = localStorage.getItem('listings');
    return listingsStr ? JSON.parse(listingsStr) : [];
}

function setupCategoryLinks() {
    // Render Homepage Categories Dynamically
    const categoryContainer = document.querySelector('.grid-cols-4');
    if (categoryContainer && (window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/'))) {
        const categories = getCategories();
        categoryContainer.innerHTML = categories.map(c => `
            <div class="category-card" onclick="window.location.href='category.html?type=${c.id}'">
                <div class="category-icon">${c.icon}</div>
                <h3>${c.name}</h3>
                <p style="color: var(--text-secondary); margin-top: 0.5rem;">${c.desc}</p>
            </div>
        `).join('');
    }
}

function loadCategoryPage() {
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type');

    if (!type) return;

    // Update Title
    const categories = getCategories();
    const category = categories.find(c => c.id === type);

    const titleEl = document.getElementById('category-title');
    const descEl = document.getElementById('category-desc');

    if (titleEl) titleEl.innerText = category ? category.name : 'Category Not Found';
    if (descEl && category) descEl.innerText = category.desc;

    // Filter Listings
    const listings = getListings().filter(l => l.category === type && l.status === 'Approved');
    const grid = document.getElementById('listings-grid');

    if (!grid) return;

    if (listings.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1 / -1; text-align: center; color: var(--text-secondary);">No approved businesses found in this category yet.</p>`;
        return;
    }

    grid.innerHTML = listings.map(l => `
        <div class="glass-card category-card" style="text-align: left; padding: 0; overflow: hidden;" onclick="window.location.href='listing.html?id=${l.id}'">
            <div style="height: 150px; background-color: #e2e8f0; background-image: url('${l.imageUrl || ''}'); background-size: cover; background-position: center;"></div>
            <div style="padding: 1.5rem;">
                <h3 style="margin-bottom: 0.5rem;">${l.businessName}</h3>
                <p style="color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 1rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${l.description}</p>
                <span style="color: var(--primary-color); font-weight: 500; font-size: 0.875rem;">View Details &rarr;</span>
            </div>
        </div>
    `).join('');
}

function loadListingPage() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) return;

    const listings = getListings();
    const listing = listings.find(l => l.id === id);
    const container = document.getElementById('listing-content');

    if (!listing || !container) {
        if (container) container.innerHTML = '<p style="text-align: center;">Listing not found.</p>';
        return;
    }

    container.innerHTML = `
        <div class="listing-header" style="background: transparent; border: none; padding-top: 0;">
            <h1 style="font-size: 2.5rem; margin-bottom: 1rem;">${listing.businessName}</h1>
            <p style="color: var(--text-secondary); font-size: 1.125rem;">
                ${listing.category.toUpperCase()} 
                ${listing.subcategory ? ' • ' + listing.subcategory : ''} 
                • ${listing.address}
            </p>
        </div>

        <!-- Main Image -->
        <img src="${listing.imageUrl || 'https://via.placeholder.com/800x400?text=No+Image'}" class="listing-image" alt="${listing.businessName}" style="cursor: pointer;" onclick="openGallery('${listing.imageUrl}')">

        <!-- Gallery Grid -->
        ${listing.images && listing.images.length > 1 ? `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                ${listing.images.map(img => `
                    <div style="height: 100px; background-image: url('${img}'); background-size: cover; background-position: center; border-radius: var(--radius-md); cursor: pointer; transition: transform 0.2s;" 
                         onclick="openGallery('${img}')"
                         onmouseover="this.style.transform='scale(1.05)'" 
                         onmouseout="this.style.transform='scale(1)'">
                    </div>
                `).join('')}
            </div>
        ` : ''}

        <div class="listing-grid">
            <div>
                <h2 style="margin-bottom: 1rem;">About Us</h2>
                <p style="color: var(--text-secondary); line-height: 1.8; margin-bottom: 2rem;">${listing.description}</p>
                
                ${listing.catalogUrl ? `
                    <h2 style="margin-bottom: 1rem;">Catalog</h2>
                    <a href="${listing.catalogUrl}" target="_blank" class="btn btn-outline">
                        📄 Download PDF Catalog
                    </a>
                ` : ''}
            </div>

            <aside>
                <div class="contact-card">
                    <h3 style="margin-bottom: 1.5rem;">Contact Info</h3>
                    
                    <div class="contact-item">
                        <span class="contact-icon">📞</span>
                        <a href="tel:${listing.phone}" style="color: inherit; text-decoration: none;">${listing.phone}</a>
                    </div>
                    
                    <div class="contact-item">
                        <span class="contact-icon">✉️</span>
                        <a href="mailto:${listing.email}" style="color: inherit; text-decoration: none;">${listing.email}</a>
                    </div>

                    ${listing.website ? `
                    <div class="contact-item">
                        <span class="contact-icon">🌐</span>
                        <a href="${listing.website}" target="_blank" style="color: inherit; text-decoration: none;">Visit Website</a>
                    </div>
                    ` : ''}

                    <button class="btn btn-primary" style="width: 100%; margin-top: 1rem;">Send Message</button>
                </div>
            </aside>
        </div>
    `;
}

function openGallery(src) {
    const modal = document.getElementById('gallery-modal');
    const modalImg = document.getElementById('modal-img');
    if (modal && modalImg) {
        modal.style.display = 'flex';
        modalImg.src = src;
    }
}

// Search function for hero search bar
function performSearch() {
    const searchInput = document.getElementById('hero-search');
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';

    if (!query) {
        alert('Please enter a search term');
        return;
    }

    // For now, redirect to categories page
    // In future, this could search across all listings
    const categories = getCategories();
    const matchedCategory = categories.find(c =>
        c.name.toLowerCase().includes(query) ||
        c.desc.toLowerCase().includes(query)
    );

    if (matchedCategory) {
        window.location.href = `category.html?type=${matchedCategory.id}`;
    } else {
        // Search in all listings
        const listings = getListings();
        const matchedListing = listings.find(l =>
            l.businessName.toLowerCase().includes(query) ||
            l.description.toLowerCase().includes(query) ||
            l.category.toLowerCase().includes(query)
        );

        if (matchedListing) {
            window.location.href = `listing.html?id=${matchedListing.id}`;
        } else {
            alert(`No results found for "${query}". Try browsing categories instead!`);
        }
    }
}

