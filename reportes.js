document.addEventListener("DOMContentLoaded", () => {
    // Configuración estética para que combine con SB Admin 2
    Chart.defaults.font.family = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
    Chart.defaults.color = '#858796';

    // --- 1. GRÁFICA DE UTILIDAD POR CATEGORÍA (BARRAS) ---
    // Ideal para comparar montos de dinero entre diferentes grupos
    const ctxUtilidad = document.getElementById('chartUtilidad').getContext('2d');
    new Chart(ctxUtilidad, {
        type: 'bar',
        data: {
            labels: ["Paneles", "Bombas", "Inversores", "Baterías", "Accesorios"],
            datasets: [{
                label: "Utilidad Bruta ($)",
                backgroundColor: "#4e73df",
                hoverBackgroundColor: "#2e59d9",
                borderColor: "#4e73df",
                data: [4500, 6200, 3100, 8400, 2100], // Aquí entrarán datos de la API
            }],
        },
        options: {
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, ticks: { callback: value => '$' + value } }
            },
            plugins: { legend: { display: false } }
        }
    });

    // --- 2. GRÁFICA DE MÁS VENDIDOS (DONA) ---
    // Excelente para ver la participación de cada producto en el total
    const ctxVendidos = document.getElementById('chartVendidos').getContext('2d');
    new Chart(ctxVendidos, {
        type: 'doughnut',
        data: {
            labels: ["Panel 100W", "Bomba 1HP", "Batería Litio", "Cable Solar"],
            datasets: [{
                data: [40, 25, 20, 15], // Aquí entrarán porcentajes o cantidades
                backgroundColor: ['#1cc88a', '#4e73df', '#36b9cc', '#f6c23e'],
                hoverBorderColor: "rgba(234, 236, 244, 1)",
            }],
        },
        options: {
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: { legend: { position: 'bottom' } }
        }
    });

    // --- 3. GRÁFICA DE VENTAS POR PERIODO (LÍNEAS) ---
    // Perfecta para mostrar tendencias (si el negocio crece o baja)
    const ctxPeriodo = document.getElementById('chartPeriodo').getContext('2d');
    new Chart(ctxPeriodo, {
        type: 'line',
        data: {
            labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul"],
            datasets: [{
                label: "Ventas Totales",
                lineTension: 0.3,
                backgroundColor: "rgba(78, 115, 223, 0.05)",
                borderColor: "#4e73df",
                pointRadius: 3,
                pointBackgroundColor: "#4e73df",
                pointBorderColor: "#4e73df",
                data: [12000, 15000, 11000, 19000, 22000, 28000, 25000], // Datos de API
                fill: true
            }],
        },
        options: {
            maintainAspectRatio: false,
            scales: {
                x: { grid: { display: false } },
                y: { ticks: { callback: value => '$' + value } }
            }
        }
    });
});