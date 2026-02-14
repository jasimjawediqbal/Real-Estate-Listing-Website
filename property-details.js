const container = document.getElementById('propertyDetailsContainer');

// Get ID from URL
const params = new URLSearchParams(window.location.search);
const propertyId = params.get('id');

if (!propertyId) {
    container.innerHTML = "<p>Invalid property ID.</p>";
} else {
    fetch(`api/properties.php?page=1&id=${propertyId}`)
        .then(res => res.json())
        .then(data => {
            const property = Array.isArray(data.properties)
                ? data.properties.find(p => p.id == propertyId)
                : null;

            if (!property) {
                container.innerHTML = "<p>Property not found.</p>";
                return;
            }

            container.innerHTML = `
                <div class="property-detail-wrapper">

                    <div class="property-detail-image">
                        <img src="${property.main_image}" alt="Property Image">
                    </div>

                    <div class="property-detail-body">

                        <div class="property-detail-title">
                            ${property.title}
                        </div>

                        <div class="property-detail-price">
                            PKR ${Number(property.price).toLocaleString()}
                        </div>

                        <div class="property-detail-location">
                            ${property.location}, ${property.city}
                        </div>

                        <div class="property-detail-features">
                            <div class="detail-feature">
                                ${property.bedrooms} Bedrooms
                            </div>
                            <div class="detail-feature">
                                ${property.bathrooms} Bathrooms
                            </div>
                            <div class="detail-feature">
                                ${property.area_marla} Marla
                            </div>
                        </div>

                        <div class="property-detail-description">
                            ${property.description}
                        </div>

                        <div class="property-detail-seller">
                            <div><strong>Seller Information</strong></div>
                            <div><strong>Name:</strong> ${property.seller_name}</div>
                            <div><strong>Email:</strong> ${property.seller_email}</div>
                            <div><strong>Phone:</strong> ${property.seller_phone}</div>
                        </div>

                    </div>

                </div>
            `;
        })
        .catch(err => {
            container.innerHTML = `<p>Error loading property.</p>`;
        });
}
