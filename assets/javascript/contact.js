// Get property ID from URL OR localStorage
const params = new URLSearchParams(window.location.search);
let propertyId = params.get('id');

// If no ID in URL, check localStorage for last viewed property
if (!propertyId) {
    propertyId = localStorage.getItem('lastViewedProperty');
    console.log("No ID in URL, using last viewed property:", propertyId);
}

let propertyTitle = "this property";

// Load property details if we have an ID
if (propertyId) {
    fetch(`api/properties.php?page=1&id=${propertyId}`)
        .then(res => {
            if (!res.ok) {
                throw new Error('Failed to fetch property');
            }
            return res.json();
        })
        .then(data => {
            console.log("API Response:", data);
            
            if (!data.properties || data.properties.length === 0) {
                throw new Error('No properties found');
            }
            
            const property = data.properties.find(p => p.id == propertyId);
            
            if (!property) {
                throw new Error('Property not found with ID: ' + propertyId);
            }
            
            // Update property details
            propertyTitle = property.title;
            document.getElementById("propTitle").textContent = property.title;
            document.getElementById("propBeds").textContent = property.bedrooms + " Beds";
            document.getElementById("propBaths").textContent = property.bathrooms + " Baths";
            document.getElementById("propArea").textContent = property.area_marla + " Marla";
            document.getElementById("propLocation").textContent = property.location + ", " + property.city;
            document.getElementById("propPrice").textContent = "PKR " + Number(property.price).toLocaleString();
            
            console.log("Property loaded successfully:", property.title);
        })
        .catch(err => {
            console.error("Property load error:", err);
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
    console.log("No property ID available, showing general contact form");
    
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
        alert('Please select your interest type (Buying or Renting)');
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
        alert('Please fill all required fields');
        return;
    }
    
    // Get contact methods
    const contactMethods = [];
    document.querySelectorAll('input[name="contact-method"]:checked').forEach(cb => {
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
                'Content-Type': 'application/json',
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
                summaryMessage += `Your message has been received.\n\n`;
            }
            
            summaryMessage += `Interest: ${interestType === 'buy' ? 'Buying' : 'Renting'}\n`;
            
            if (preferredDate) {
                const dateObj = new Date(preferredDate);
                summaryMessage += `Preferred Date/Time: ${dateObj.toLocaleString()}\n`;
            }
            
            summaryMessage += `\nOur agent will contact you soon at:\n`;
            summaryMessage += `📧 ${email}\n`;
            summaryMessage += `📱 ${phone}\n`;
            
            if (contactMethods.length > 0) {
                summaryMessage += `\nPreferred contact: ${contactMethods.join(', ')}\n`;
            }

            alert(summaryMessage);
            
            // Reset form
            document.getElementById('contactForm').reset();
            
            // Clear localStorage after successful submission
            localStorage.removeItem('lastViewedProperty');
            
            // Redirect to home page
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);

        } else {
            alert(data.error || 'Failed to send inquiry');
        }

    } catch (err) {
        console.error('Submission error:', err);
        alert('Submission failed: ' + err.message);
    } finally {
        // Restore button state
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
    }
}