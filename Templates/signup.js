document.getElementById('signupForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('signupError');
    const submitBtn = document.querySelector('button[type="submit"]');
    
    // Reset error message
    errorDiv.textContent = '';
    
    // Basic validation
    if (!username || !email || !password) {
        errorDiv.textContent = 'Please fill in all fields.';
        return;
    }

    // Disable submit button and show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating Account...';

    try {
        const res = await fetch('/auth/signUp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                username, 
                emailid: email, 
                password 
            })
        });

        const data = await res.json();

        if (!res.ok) {
            errorDiv.textContent = data.message || 'Signup failed. Please try again.';
        } else {
            // Redirect to login page on success
            window.location.href = 'login.html';
        }
    } catch (err) {
        console.error('Signup error:', err);
        errorDiv.textContent = 'Network error. Please check your connection.';
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign Up';
    }
}); 