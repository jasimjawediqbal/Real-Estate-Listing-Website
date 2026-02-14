const addPropertyForm = document.getElementById('addPropertyForm');
const formMessage = document.getElementById('formMessage');
const submitPropertyBtn = document.getElementById('submitPropertyBtn');

const ALLOWED_CITIES = ['Lahore', 'Islamabad', 'Rawalpindi'];
const ALLOWED_TYPES = ['House', 'Apartment', 'Commercial'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_ADDITIONAL_IMAGES = 6;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

function setFieldError(fieldName, message) {
    const errorNode = document.querySelector(`[data-error-for="${fieldName}"]`);
    if (errorNode) {
        errorNode.textContent = message || '';
    }
}

function clearFieldErrors() {
    document.querySelectorAll('.field-error').forEach((node) => {
        node.textContent = '';
    });
}

function showFormMessage(message, type) {
    if (!formMessage) {
        return;
    }

    formMessage.textContent = message;
    formMessage.classList.remove('success', 'error');
    formMessage.classList.add('show', type);
}

function clearFormMessage() {
    if (!formMessage) {
        return;
    }

    formMessage.textContent = '';
    formMessage.classList.remove('show', 'success', 'error');
}

function getTrimmedValue(name) {
    const field = addPropertyForm.elements[name];
    return field ? field.value.trim() : '';
}

function validateImageFile(file, label) {
    if (!file) {
        return `${label} is required.`;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return `${label} must be JPG, PNG, or WEBP.`;
    }

    if (file.size > MAX_IMAGE_SIZE) {
        return `${label} must be 5MB or smaller.`;
    }

    return '';
}

function validateForm() {
    const errors = {};

    const title = getTrimmedValue('title');
    if (title.length < 5 || title.length > 150) {
        errors.title = 'Title must be between 5 and 150 characters.';
    }

    const description = getTrimmedValue('description');
    if (description.length < 20 || description.length > 2000) {
        errors.description = 'Description must be between 20 and 2000 characters.';
    }

    const location = getTrimmedValue('location');
    if (location.length < 3 || location.length > 150) {
        errors.location = 'Location must be between 3 and 150 characters.';
    }

    const price = Number(addPropertyForm.elements.price.value);
    if (!Number.isFinite(price) || price <= 0) {
        errors.price = 'Price must be a valid amount greater than 0.';
    }

    const city = getTrimmedValue('city');
    if (!ALLOWED_CITIES.includes(city)) {
        errors.city = 'Please select a valid city.';
    }

    const propertyType = getTrimmedValue('property_type');
    if (!ALLOWED_TYPES.includes(propertyType)) {
        errors.property_type = 'Please select a valid property type.';
    }

    const bedroomsRaw = addPropertyForm.elements.bedrooms.value;
    const bedrooms = Number(bedroomsRaw);
    if (!Number.isInteger(bedrooms) || bedrooms < 0 || bedrooms > 20) {
        errors.bedrooms = 'Bedrooms must be an integer between 0 and 20.';
    }

    const bathroomsRaw = addPropertyForm.elements.bathrooms.value;
    const bathrooms = Number(bathroomsRaw);
    if (!Number.isInteger(bathrooms) || bathrooms < 0 || bathrooms > 20) {
        errors.bathrooms = 'Bathrooms must be an integer between 0 and 20.';
    }

    const areaMarla = Number(addPropertyForm.elements.area_marla.value);
    if (!Number.isFinite(areaMarla) || areaMarla <= 0 || areaMarla > 10000) {
        errors.area_marla = 'Area must be a number greater than 0.';
    }

    const sellerName = getTrimmedValue('seller_name');
    if (sellerName.length < 2 || sellerName.length > 100) {
        errors.seller_name = 'Seller name must be between 2 and 100 characters.';
    }

    const sellerEmail = getTrimmedValue('seller_email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sellerEmail) || sellerEmail.length > 100) {
        errors.seller_email = 'Please enter a valid email address.';
    }

    const sellerPhone = getTrimmedValue('seller_phone');
    const phoneRegex = /^[0-9+\-\s]{7,20}$/;
    if (!phoneRegex.test(sellerPhone)) {
        errors.seller_phone = 'Phone must be 7-20 chars and use digits, +, -, or spaces.';
    }

    const sellerDescription = getTrimmedValue('seller_description');
    if (sellerDescription.length > 500) {
        errors.seller_description = 'Seller description can be up to 500 characters.';
    }

    const mainImageInput = addPropertyForm.elements.main_image;
    const mainImageFile = mainImageInput.files[0];
    const mainImageError = validateImageFile(mainImageFile, 'Main image');
    if (mainImageError) {
        errors.main_image = mainImageError;
    }

    const additionalImagesInput = addPropertyForm.elements['additional_images[]'];
    const additionalFiles = additionalImagesInput.files;
    if (additionalFiles.length > MAX_ADDITIONAL_IMAGES) {
        errors.additional_images = `You can upload up to ${MAX_ADDITIONAL_IMAGES} additional images.`;
    } else {
        for (let i = 0; i < additionalFiles.length; i += 1) {
            const fileError = validateImageFile(additionalFiles[i], `Additional image ${i + 1}`);
            if (fileError) {
                errors.additional_images = fileError;
                break;
            }
        }
    }

    return errors;
}

function renderErrors(errors) {
    clearFieldErrors();

    Object.keys(errors).forEach((key) => {
        setFieldError(key, errors[key]);
    });
}

if (addPropertyForm) {
    addPropertyForm.addEventListener('input', (event) => {
        const fieldName = event.target.name === 'additional_images[]'
            ? 'additional_images'
            : event.target.name;

        if (fieldName) {
            setFieldError(fieldName, '');
        }
    });

    addPropertyForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        clearFormMessage();

        const errors = validateForm();
        renderErrors(errors);

        if (Object.keys(errors).length > 0) {
            showFormMessage('Please fix the highlighted fields and try again.', 'error');
            return;
        }

        const payload = new FormData(addPropertyForm);
        submitPropertyBtn.disabled = true;
        submitPropertyBtn.textContent = 'Submitting...';

        try {
            const response = await fetch('api/add-property.php', {
                method: 'POST',
                body: payload
            });

            const raw = await response.text();
            let data;

            try {
                data = JSON.parse(raw);
            } catch (parseError) {
                throw new Error('Unexpected response from server.');
            }

            if (!response.ok || !data.success) {
                if (data.errors && typeof data.errors === 'object') {
                    renderErrors(data.errors);
                }

                throw new Error(data.error || data.message || 'Failed to add property.');
            }

            addPropertyForm.reset();
            showFormMessage(data.message || 'Property added successfully.', 'success');
        } catch (error) {
            showFormMessage(error.message || 'Unable to submit the form right now.', 'error');
        } finally {
            submitPropertyBtn.disabled = false;
            submitPropertyBtn.textContent = 'Submit Property';
        }
    });
}
