document.addEventListener("DOMContentLoaded", () => {
    const ctx = document.getElementById('graficaUtilidad').getContext('2d');
    
    // Ejemplo de cómo procesarías los datos de los endpoints
    new Chart(ctx, {
        type: 'bar', // Tipo de gráfica solicitado
        data: {
            labels: ['Solar', 'Riego', 'Ganado', 'Herramientas'], // Aquí irán tus categorías
            datasets: [{
                label: 'Utilidad en MXN',
                data: [12000, 19000, 3000, 5000], // Aquí irá el cálculo de tu compañero
                backgroundColor: '#4e73df',
                hoverBackgroundColor: '#2e59d9',
                borderColor: '#4e73df',
            }]
        },
        options: {
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
});