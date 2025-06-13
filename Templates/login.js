document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const loadingDiv = document.getElementById('loading');
    const errorDiv = document.getElementById('loginError');

    // Check if user is already logged in
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
        window.location.href = 'dashboard.html';
        return;
    }

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Reset error message
        errorDiv.textContent = '';
        
        // Get form values
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        // Basic validation
        if (!username || !password) {
            errorDiv.textContent = 'Please fill in all fields.';
            return;
        }

        // Show loading state
        loginBtn.disabled = true;
        loadingDiv.style.display = 'block';

        try {
            const res = await fetch('/auth/logIn', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    username: username, 
                    password: password 
                })
            });

            // Handle different response status codes
            switch (res.status) {
                case 200:
                    const data = await res.json();
                    if (data.accessToken && data.refreshToken) {
                        // Store tokens
                        localStorage.setItem('accessToken', data.accessToken);
                        localStorage.setItem('refreshToken', data.refreshToken);
                        
                        // Redirect to dashboard
                        window.location.href = 'dashboard.html';
                    } else {
                        throw new Error('Invalid server response');
                    }
                    break;
                    
                case 401:
                    errorDiv.textContent = 'Invalid password.';
                    break;
                    
                case 409:
                    errorDiv.textContent = 'User not found.';
                    break;
                    
                default:
                    const errorData = await res.json();
                    errorDiv.textContent = errorData.message || 'Login failed. Please try again.';
            }
        } catch (err) {
            console.error('Login error:', err);
            errorDiv.textContent = 'Network error. Please check your connection.';
        } finally {
            // Reset loading state
            loginBtn.disabled = false;
            loadingDiv.style.display = 'none';
        }
    });

    // Add input event listeners to clear error on new input
    document.getElementById('username').addEventListener('input', () => {
        errorDiv.textContent = '';
    });
    
    document.getElementById('password').addEventListener('input', () => {
        errorDiv.textContent = '';
    });
}); 