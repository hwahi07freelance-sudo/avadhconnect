/**
 * Admin Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // Basic admin check (very insecure, just for demo)
    // In real app, check claims/roles in Firebase token
    const userStr = localStorage.getItem('user');
    // For demo, we'll allow anyone who accesses this page to see it, 
    // or we could enforce a specific email.

    loadStats();
    loadListingsTable();
});

function getListings() {
    const listingsStr = localStorage.getItem('listings');
    return listingsStr ? JSON.parse(listingsStr) : [];
}

function loadStats() {
    const listings = getListings();
    const pendingCount = listings.filter(l => l.status === 'Pending').length;

    const pendingEl = document.getElementById('pending-count');
    const totalEl = document.getElementById('total-count');

    if (pendingEl) pendingEl.innerText = pendingCount;
    if (totalEl) totalEl.innerText = listings.length;
}

function loadListingsTable() {
    const tbody = document.getElementById('listings-table-body');
    if (!tbody) return;

    const listings = getListings();
    tbody.innerHTML = '';

    listings.forEach(listing => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <div style="font-weight: 500;">${listing.businessName}</div>
                <div style="font-size: 0.875rem; color: var(--text-secondary);">${listing.email}</div>
            </td>
            <td>${listing.category}</td>
            <td>${listing.ownerName || 'Unknown'}</td>
            <td><span class="status-badge status-${listing.status.toLowerCase()}">${listing.status}</span></td>
            <td>
                <button onclick="runAICheck('${listing.id}')" class="btn btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;">AI Check</button>
                <button onclick="updateStatus('${listing.id}', 'Approved')" class="btn btn-primary" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; background: var(--success-color);">Approve</button>
                <button onclick="updateStatus('${listing.id}', 'Rejected')" class="btn btn-primary" style="padding: 0.25rem 0.5rem; font-size: 0.75rem; background: var(--danger-color);">Reject</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function updateStatus(id, status) {
    const listings = getListings();
    const index = listings.findIndex(l => l.id === id);
    if (index >= 0) {
        listings[index].status = status;
        localStorage.setItem('listings', JSON.stringify(listings));
        loadListingsTable();
        loadStats();
    }
}

function runAICheck(id) {
    const listings = getListings();
    const listing = listings.find(l => l.id === id);
    if (!listing) return;

    alert(`Running AI Analysis on ${listing.businessName}...\n\n(Simulating Genkit Flow)`);

    setTimeout(() => {
        // Mock AI Result
        const isSafe = !listing.description.toLowerCase().includes('bad');
        const message = isSafe
            ? "✅ AI Analysis Passed: Content appears appropriate and complete."
            : "⚠️ AI Analysis Flagged: Potential policy violation detected in description.";

        alert(message);
    }, 1500);
}
