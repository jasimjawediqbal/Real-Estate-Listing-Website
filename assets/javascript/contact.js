async function handleSubmit(event) {
    event.preventDefault();
    
    // Get form values
    const interestType = document.querySelector('input[name="interest-type"]:checked').value;
    const fullname = document.getElementById('fullname').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const preferredDate = document.getElementById('preferredDate').value;
    const message = document.getElementById('message').value;
    
    // Get contact methods
    const contactMethods = [];
    document.querySelectorAll('input[name="contact-method"]:checked').forEach(cb => {
        contactMethods.push(cb.value);
    });

    try {
        const res = await fetch('api/contact.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                interest: interestType,
                fullname,
                email,
                phone,
                preferredDate,
                message,
                contactMethods
            })
        });

        const data = await res.json();

        if (data.success) {
            // Create summary message (same as your UI)
            let summaryMessage = `Thank you, ${fullname}!\n\n`;
            summaryMessage += `Your inquiry for the Modern Luxury Villa has been received.\n\n`;
            summaryMessage += `Interest: ${interestType === 'buy' ? 'Buying' : 'Renting'}\n`;
            if (preferredDate) {
                summaryMessage += `Preferred Date/Time: ${new Date(preferredDate).toLocaleString()}\n`;
            }
            summaryMessage += `\nOur agent John Doe will contact you soon at:\n`;
            summaryMessage += `📧 ${email}\n`;
            summaryMessage += `📱 ${phone}\n`;
            if (contactMethods.length > 0) {
                summaryMessage += `\nPreferred contact: ${contactMethods.join(', ')}\n`;
            }

            alert(summaryMessage);
            document.getElementById('contactForm').reset();

        } else {
            alert(data.error);
        }

    } catch (err) {
        alert('Submission failed: ' + err.message);
    }
}
