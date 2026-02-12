// ================= DOM ELEMENTS =================
const propertyContainer = document.querySelector('.property-listings .container');
const propertyTypeFilter = document.getElementById('propertyTypeFilter');
const cityFilter = document.getElementById('cityFilter');
const priceRangeFilter = document.getElementById('priceRangeFilter');
const resetFiltersBtn = document.getElementById('resetFiltersBtn');
const paginationContainer = document.querySelector('.pagination .container');

let currentPage = 1;
let filters = {};

function normalizeImagePath(path) {
    if (typeof path !== 'string') {
        return path;
    }

    let normalizedPath = path.replace(/\\/g, '/');
    normalizedPath = normalizedPath.replace(/assets\/images\/images(\d+)\.jpg/i, 'assets/images/image$1.jpg');
    normalizedPath = normalizedPath.replace(/assets\/images\/house(\d+)\.jpg/i, 'assets/images/image$1.jpg');
    normalizedPath = normalizedPath.replace(/^images(\d+)\.jpg$/i, 'assets/images/image$1.jpg');
    normalizedPath = normalizedPath.replace(/^house(\d+)\.jpg$/i, 'assets/images/image$1.jpg');

    return normalizedPath;
}

function goToPage(page) {
    currentPage = page;
    fetchProperties(filters, currentPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ================= FETCH PROPERTIES =================
async function fetchProperties(filters = {}, page = 1) {
    try {
        // Build query string dynamically
        let query = `page=${page}`;
        for (const key in filters) {
            if (filters[key]) {
                query += `&${encodeURIComponent(key)}=${encodeURIComponent(filters[key])}`;
            }
        }

        const response = await fetch(`api/properties.php?${query}`);
        const rawText = await response.text();

        let data;
        try {
            data = JSON.parse(rawText);
        } catch (parseError) {
            const preview = rawText.replace(/\s+/g, ' ').slice(0, 180);
            throw new Error(`Invalid JSON from ${response.url} (HTTP ${response.status}). First 180 chars: ${preview}`);
        }

        if (!response.ok) {
            throw new Error(data.error || `HTTP ${response.status}`);
        }
        if (data.error) {
            throw new Error(data.error);
        }

        const properties = Array.isArray(data.properties) ? data.properties : [];
        renderProperties(properties);
        renderPagination(Number(data.totalPages) || 0, page);
    } catch (error) {
        console.error('Error fetching properties:', error);
        propertyContainer.innerHTML = `<p>Error loading properties: ${error.message}</p>`;
    }
}

// ================= RENDER PROPERTY CARDS =================
function renderProperties(properties) {
    propertyContainer.innerHTML = '';

    if (!Array.isArray(properties) || properties.length === 0) {
        propertyContainer.innerHTML = '<p>No properties found.</p>';
        return;
    }

    properties.forEach(property => {
        const card = document.createElement('div');
        card.classList.add('property-card');
        const mainImage = normalizeImagePath(property.main_image);

        card.innerHTML = `
            <img src="${mainImage}" alt="Property Image">
            <h3>${property.title}</h3>
            <p>${property.description.substring(0, 100)}...</p>
            <h4>PKR ${Number(property.price).toLocaleString()}</h4>
            <p>Location: ${property.location}, ${property.city}</p>
            <p>${property.bedrooms} Bedrooms | ${property.bathrooms} Bathrooms | ${property.area_marla} Marla</p>
            <p>Seller: ${property.seller_name}</p>
            <a href="property-details.html?id=${property.id}">View Details</a>
        `;

        propertyContainer.appendChild(card);
    });
}

// ================= RENDER PAGINATION =================
function renderPagination(totalPages, currentPage) {
    paginationContainer.innerHTML = '';

    if (!totalPages || totalPages <= 1) {
        return;
    }

    // Prev button
    if (currentPage > 1) {
        const prev = document.createElement('a');
        prev.href = '#';
        prev.textContent = 'Prev';
        prev.addEventListener('click', (e) => {
            e.preventDefault();
            goToPage(currentPage - 1);
        });
        paginationContainer.appendChild(prev);
    }

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const pageLink = document.createElement('a');
        pageLink.href = '#';
        pageLink.textContent = i;
        if (i === currentPage) pageLink.style.backgroundColor = '#414833';
        pageLink.addEventListener('click', (e) => {
            e.preventDefault();
            goToPage(i);
        });
        paginationContainer.appendChild(pageLink);
    }

    // Next button
    if (currentPage < totalPages) {
        const next = document.createElement('a');
        next.href = '#';
        next.textContent = 'Next';
        next.addEventListener('click', (e) => {
            e.preventDefault();
            goToPage(currentPage + 1);
        });
        paginationContainer.appendChild(next);
    }
}

function applyFilters() {
    filters = {
        type: propertyTypeFilter.value,
        city: cityFilter.value,
        priceRange: priceRangeFilter.value
    };
    currentPage = 1;
    fetchProperties(filters, currentPage);
}

propertyTypeFilter.addEventListener('change', applyFilters);
cityFilter.addEventListener('change', applyFilters);
priceRangeFilter.addEventListener('change', applyFilters);

resetFiltersBtn.addEventListener('click', () => {
    propertyTypeFilter.value = '';
    cityFilter.value = '';
    priceRangeFilter.value = '';
    applyFilters();
});

// ================= INITIAL LOAD =================
fetchProperties();
