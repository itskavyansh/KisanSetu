
// Ensure all code runs after DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('container');
    // Make toggle globally accessible for inline HTML onclick
    window.toggle = function() {
        container.classList.toggle('sign-in');
        container.classList.toggle('sign-up');
    };

    // Set initial state to 'sign-up' after a short delay
    setTimeout(() => {
        container.classList.add('sign-up');
    }, 200);

    // Prevent form submission from reloading the page and redirect to home
    const forms = document.querySelectorAll('.form');
    forms.forEach(form => {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            // Optionally, validate fields here
            window.location.href = '/';
        });
    });
});
