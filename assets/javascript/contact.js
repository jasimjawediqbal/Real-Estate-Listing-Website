// Get property ID from URL OR localStorage
const params = new URLSearchParams(window.location.search);
let propertyId = params.get('id');

// If no ID in URL, check localStorage for last viewed property
if (!propertyId) {
    propertyId = localStorage.getItem('lastViewedProperty');
    console.log('No ID in URL, using last viewed property:', propertyId);
}

let propertyTitle = 'this property';
let messageBoxOnClose = null;

function ensureMessageBox() {
    let overlay = document.getElementById('messageBoxOverlay');
    if (overlay) {
        return overlay;
    }

    overlay = document.createElement('div');
    overlay.id = 'messageBoxOverlay';
    overlay.className = 'message-box-overlay';
    overlay.innerHTML = `
        <div class="message-box" role="dialog" aria-modal="true" aria-labelledby="messageBoxTitle">
            <h3 id="messageBoxTitle" class="message-box-title"></h3>
            <p id="messageBoxBody" class="message-box-body"></p>
            <button id="messageBoxCloseBtn" type="button" class="message-box-btn">OK</button>
        </div>
    `;

    document.body.appendChild(overlay);

    const closeBtn = overlay.querySelector('#messageBoxCloseBtn');
    closeBtn.addEventListener('click', closeMessageBox);

    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) {
            closeMessageBox();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && overlay.classList.contains('show')) {
            closeMessageBox();
        }
    });

    return overlay;
}

function showMessageBox(message, options = {}) {
    const overlay = ensureMessageBox();
    const box = overlay.querySelector('.message-box');
    const titleEl = overlay.querySelector('#messageBoxTitle');
    const bodyEl = overlay.querySelector('#messageBoxBody');
    const closeBtn = overlay.querySelector('#messageBoxCloseBtn');

    const title = options.title || 'Message';
    const type = options.type || 'info';

    messageBoxOnClose = typeof options.onClose === 'function' ? options.onClose : null;

    titleEl.textContent = title;
    bodyEl.textContent = message;
    box.classList.remove('is-success', 'is-error', 'is-info');
    box.classList.add(`is-${type}`);
    overlay.classList.add('show');

    closeBtn.focus();
}

function closeMessageBox() {
    const overlay = document.getElementById('messageBoxOverlay');
    if (!overlay) {
        return;
    }

    overlay.classList.remove('show');

    if (messageBoxOnClose) {
        const callback = messageBoxOnClose;
        messageBoxOnClose = null;
        callback();
    }
}

// Load property details if we have an ID
if (propertyId) {
    fetch(`api/properties.php?page=1&id=${propertyId}`)
        .then((res) => {
            if (!res.ok) {
                throw new Error('Failed to fetch property');
            }
            return res.json();
        })
        .then((data) => {
            console.log('API Response:', data);

            if (!data.properties || data.properties.length === 0) {
                throw new Error('No properties found');
            }

            const property = data.properties.find((p) => p.id == propertyId);

            if (!property) {
                throw new Error('Property not found with ID: ' + propertyId);
            }

            // Update property details
            propertyTitle = property.title;
            document.getElementById('propTitle').textContent = property.title;
            document.getElementById('propBeds').textContent = property.bedrooms + ' Beds';
            document.getElementById('propBaths').textContent = property.bathrooms + ' Baths';
            document.getElementById('propArea').textContent = property.area_marla + ' Marla';
            document.getElementById('propLocation').textContent = property.location + ', ' + property.city;
            document.getElementById('propPrice').textContent = 'PKR ' + Number(property.price).toLocaleString();

            console.log('Property loaded successfully:', property.title);
        })
        .catch((err) => {
            console.error('Property load error:', err);

            // If property loading fails, hide the showcase
            const propertyShowcase = document.querySelector('.property-showcase');
            if (propertyShowcase) {
                propertyShowcase.style.display = 'none';
            }

            // Update header for general contact
            const formHeader = document.querySelector('.form-header h2');
            const formSubtext = document.querySelector('.form-header p');
            if (formHeader) formHeader.textContent = 'Contact Us';
            if (formSubtext) formSubtext.textContent = 'Get in touch with our team';
        });
} else {
    // No property ID at all - show general contact form
    console.log('No property ID available, showing general contact form');

    const propertyShowcase = document.querySelector('.property-showcase');
    if (propertyShowcase) {
        propertyShowcase.style.display = 'none';
    }

    const formHeader = document.querySelector('.form-header h2');
    const formSubtext = document.querySelector('.form-header p');
    if (formHeader) formHeader.textContent = 'Contact Us';
    if (formSubtext) formSubtext.textContent = 'Get in touch with our team';
}

async function handleSubmit(event) {
    event.preventDefault();

    // Get form values
    const interestTypeElement = document.querySelector('input[name="interest-type"]:checked');
    if (!interestTypeElement) {
        showMessageBox('Please select your interest type (Buying or Renting).', {
            title: 'Missing Information',
            type: 'error'
        });
        return;
    }

    const interestType = interestTypeElement.value;
    const fullname = document.getElementById('fullname').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const preferredDate = document.getElementById('preferredDate').value;
    const message = document.getElementById('message').value.trim();

    // Validate required fields
    if (!fullname || !email || !phone || !message) {
        showMessageBox('Please fill all required fields.', {
            title: 'Missing Information',
            type: 'error'
        });
        return;
    }

    // Get contact methods
    const contactMethods = [];
    document.querySelectorAll('input[name="contact-method"]:checked').forEach((cb) => {
        contactMethods.push(cb.value);
    });

    // Show loading state
    const submitBtn = document.querySelector('.submit-btn');
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    try {
        const res = await fetch('api/contact.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                property_id: propertyId || null,
                interest: interestType,
                fullname: fullname,
                email: email,
                phone: phone,
                preferredDate: preferredDate || null,
                message: message,
                contactMethods: contactMethods
            })
        });

        const data = await res.json();

        if (res.ok && data.success) {
            // Create success message
            let summaryMessage = `Thank you, ${fullname}!\n\n`;

            if (propertyId) {
                summaryMessage += `Your inquiry for "${propertyTitle}" has been received.\n\n`;
            } else {
                summaryMessage += 'Your message has been received.\n\n';
            }

            summaryMessage += `Interest: ${interestType === 'buy' ? 'Buying' : 'Renting'}\n`;

            if (preferredDate) {
                const dateObj = new Date(preferredDate);
                summaryMessage += `Preferred Date/Time: ${dateObj.toLocaleString()}\n`;
            }

            summaryMessage += '\nOur agent will contact you soon at:\n';
            summaryMessage += `Email: ${email}\n`;
            summaryMessage += `Phone: ${phone}\n`;

            if (contactMethods.length > 0) {
                summaryMessage += `\nPreferred contact: ${contactMethods.join(', ')}\n`;
            }

            // Reset form
            document.getElementById('contactForm').reset();

            // Clear localStorage after successful submission
            localStorage.removeItem('lastViewedProperty');

            showMessageBox(summaryMessage, {
                title: 'Inquiry Sent',
                type: 'success',
                onClose: () => {
                    window.location.href = 'index.html';
                }
            });
        } else {
            showMessageBox(data.error || 'Failed to send inquiry.', {
                title: 'Submission Failed',
                type: 'error'
            });
        }
    } catch (err) {
        console.error('Submission error:', err);
        showMessageBox('Submission failed: ' + err.message, {
            title: 'Submission Failed',
            type: 'error'
        });
    } finally {
        // Restore button state
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
    }
}
