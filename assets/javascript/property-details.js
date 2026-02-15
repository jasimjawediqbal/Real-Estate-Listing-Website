const container = document.getElementById('propertyDetailsContainer');

// Get ID from URL
const params = new URLSearchParams(window.location.search);
const propertyId = params.get('id');

if (!propertyId) {
    container.innerHTML = "<p>Invalid property ID.</p>";
} else {
    fetch(`api/propertydetail.php?id=${encodeURIComponent(propertyId)}`)
        .then(res => res.json())
        .then(data => {
            const property = data && data.property ? data.property : null;

            if (!property) {
                const errorMessage = data && data.error ? data.error : "Property not found.";
                container.innerHTML = `<p>${errorMessage}</p>`;
                return;
            }

            const contactUrl = `contact.html?id=${encodeURIComponent(property.id)}`;
            localStorage.setItem('lastViewedProperty', String(property.id));

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

                        <a class="property-contact-btn" href="${contactUrl}">Contact Us</a>

                    </div>

                </div>
            `;
        })
        .catch(err => {
            container.innerHTML = `<p>Error loading property.</p>`;
        });
}
