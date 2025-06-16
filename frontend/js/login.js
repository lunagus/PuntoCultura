async function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    try {
        const response = await fetch('http://localhost:8000/api/token/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Save tokens in localStorage or sessionStorage
            localStorage.setItem('access', data.access);
            localStorage.setItem('refresh', data.refresh);

            // Redirect to admin page
            window.location.href = 'admin.html';
        } else {
            errorMessage.textContent = data.detail || 'Credenciales inválidas';
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        console.error('Error:', error);
        errorMessage.textContent = 'Error de conexión con el servidor';
        errorMessage.style.display = 'block';
    }

    return false;
}
