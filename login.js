document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === 'admin' && password === 'admin') {
        sessionStorage.setItem('authenticated', true);
        window.location.href = 'index.html'; // Redirigir a la página principal
    } else {
        document.getElementById('errorMessage').style.display = 'block';
    }
});

