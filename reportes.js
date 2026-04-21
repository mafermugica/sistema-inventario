document.addEventListener("DOMContentLoaded", () => {
    Chart.defaults.font.family = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
    Chart.defaults.color = "#858796";

    const formatoMXN = new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        maximumFractionDigits: 0
    });

    const datosReportes = {
        flujo: {
            labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
            entradas: [120, 150, 100, 180, 130, 200],
            salidas: [110, 160, 90, 175, 140, 190]
        },
        utilidad: {
            labels: ["Paneles", "Bombas", "Inversores", "Baterías", "Accesorios"],
            valores: [4500, 6200, 3100, 8400, 2100]
        },
        vendidos: {
            labels: ["Panel 100W", "Bomba 1HP", "Batería Litio", "Cable Solar"],
            valores: [40, 25, 20, 15]
        },
        ventasPeriodo: {
            labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul"],
            valores: [12000, 15000, 11000, 19000, 22000, 28000, 25000]
        }
    };

    function tooltipMoneda() {
        return {
            callbacks: {
                label(context) {
                    const valor = context.parsed.y ?? context.parsed.x ?? context.parsed;
                    return `${context.dataset.label}: ${formatoMXN.format(valor)}`;
                }
            }
        };
    }

    function fechaArchivo() {
        return new Date().toISOString().slice(0, 10);
    }

    function descargarArchivo(nombre, contenido, tipo) {
        const blob = new Blob([contenido], { type: tipo });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = nombre;
        link.click();
        URL.revokeObjectURL(url);
    }

    function obtenerAlertasStock() {
        const filas = document.querySelectorAll("#tablaAlertasStock tbody tr");
        return Array.from(filas).map((fila) => {
            const celdas = fila.querySelectorAll("td");
            return {
                codigo: celdas[0]?.textContent.trim() || "",
                producto: celdas[1]?.textContent.trim() || "",
                categoria: celdas[2]?.textContent.trim() || "",
                stockActual: celdas[3]?.textContent.trim() || "",
                minimo: celdas[4]?.textContent.trim() || "",
                estado: celdas[5]?.textContent.trim() || ""
            };
        });
    }

    function construirResumenCSV() {
        const alertas = obtenerAlertasStock();
        const lineas = [
            ["Resumen de reportes Agromundo"],
            ["Fecha de exportación", new Date().toLocaleString("es-MX")],
            [],
            ["Filtros aplicados"],
            ["Almacén", document.getElementById("filtroAlmacen")?.selectedOptions[0]?.textContent.trim() || "Todos"],
            ["Fecha inicio", document.getElementById("fechaInicio")?.value || "Sin filtro"],
            ["Fecha fin", document.getElementById("fechaFinal")?.value || "Sin filtro"],
            [],
            ["Utilidad por categoría"],
            ["Categoría", "Utilidad (MXN)"],
            ...datosReportes.utilidad.labels.map((label, index) => [label, datosReportes.utilidad.valores[index]]),
            [],
            ["Productos más vendidos"],
            ["Producto", "Unidades vendidas"],
            ...datosReportes.vendidos.labels.map((label, index) => [label, datosReportes.vendidos.valores[index]]),
            [],
            ["Ventas por periodo"],
            ["Periodo", "Ventas (MXN)"],
            ...datosReportes.ventasPeriodo.labels.map((label, index) => [label, datosReportes.ventasPeriodo.valores[index]]),
            [],
            ["Alertas de inventario"],
            ["Código", "Producto", "Categoría", "Stock actual", "Mínimo permitido", "Estado"],
            ...alertas.map((item) => [item.codigo, item.producto, item.categoria, item.stockActual, item.minimo, item.estado])
        ];

        return "\uFEFF" + lineas
            .map((fila) => fila.map((valor) => `"${String(valor ?? "").replace(/"/g, '""')}"`).join(","))
            .join("\r\n");
    }

    function normalizarNumeroWhatsApp(numero) {
        const limpio = (numero || "").replace(/\D/g, "");
        if (!limpio) {
            return "";
        }
        if (limpio.length === 10) {
            return `52${limpio}`;
        }
        return limpio;
    }

    function construirMensajeWhatsApp() {
        const alertas = obtenerAlertasStock();
        const encabezado = [
            "Hola, comparto el resumen de alertas de inventario de Agromundo:",
            ""
        ];
        const detalle = alertas.map((item, index) =>
            `${index + 1}. ${item.producto} (${item.codigo}) - Stock actual: ${item.stockActual}, mínimo: ${item.minimo}, estado: ${item.estado}`
        );
        return [...encabezado, ...detalle, "", "Favor de revisar resurtido prioritario."].join("\n");
    }

    const ctxFlujo = document.getElementById("chartFlujo");
    if (ctxFlujo) {
        new Chart(ctxFlujo.getContext("2d"), {
            type: "bar",
            data: {
                labels: datosReportes.flujo.labels,
                datasets: [
                    {
                        label: "Entradas (Compras/Devoluciones)",
                        backgroundColor: "#1cc88a",
                        data: datosReportes.flujo.entradas
                    },
                    {
                        label: "Salidas (Ventas/Mermas)",
                        backgroundColor: "#e74a3b",
                        data: datosReportes.flujo.salidas
                    }
                ]
            },
            options: {
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: { display: true, text: "Cantidad de productos" }
                    }
                },
                plugins: { legend: { position: "top" } }
            }
        });
    }

    const ctxUtilidad = document.getElementById("chartUtilidad");
    if (ctxUtilidad) {
        new Chart(ctxUtilidad.getContext("2d"), {
            type: "bar",
            data: {
                labels: datosReportes.utilidad.labels,
                datasets: [{
                    label: "Utilidad bruta (MXN)",
                    backgroundColor: "#4e73df",
                    hoverBackgroundColor: "#2e59d9",
                    data: datosReportes.utilidad.valores
                }]
            },
            options: {
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => formatoMXN.format(value)
                        }
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: tooltipMoneda()
                }
            }
        });
    }

    const ctxVendidos = document.getElementById("chartVendidos");
    if (ctxVendidos) {
        new Chart(ctxVendidos.getContext("2d"), {
            type: "bar",
            data: {
                labels: datosReportes.vendidos.labels,
                datasets: [{
                    label: "Unidades vendidas",
                    data: datosReportes.vendidos.valores,
                    backgroundColor: ["#1cc88a", "#4e73df", "#36b9cc", "#f6c23e"],
                    borderRadius: 6,
                    barThickness: 24
                }]
            },
            options: {
                indexAxis: "y",
                maintainAspectRatio: false,
                scales: {
                    x: {
                        beginAtZero: true,
                        title: { display: true, text: "Unidades vendidas" }
                    },
                    y: {
                        grid: { display: false }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    const ctxPeriodo = document.getElementById("chartPeriodo");
    if (ctxPeriodo) {
        new Chart(ctxPeriodo.getContext("2d"), {
            type: "line",
            data: {
                labels: datosReportes.ventasPeriodo.labels,
                datasets: [{
                    label: "Ventas Totales (MXN)",
                    lineTension: 0.3,
                    backgroundColor: "rgba(78, 115, 223, 0.05)",
                    borderColor: "#4e73df",
                    pointRadius: 3,
                    pointBackgroundColor: "#4e73df",
                    pointBorderColor: "#4e73df",
                    data: datosReportes.ventasPeriodo.valores,
                    fill: true
                }]
            },
            options: {
                maintainAspectRatio: false,
                scales: {
                    x: { grid: { display: false } },
                    y: {
                        ticks: {
                            callback: (value) => formatoMXN.format(value)
                        }
                    }
                },
                plugins: {
                    tooltip: tooltipMoneda()
                }
            }
        });
    }

    const btnExportarGrafica = document.getElementById("btnExportarGrafica");
    if (btnExportarGrafica) {
        btnExportarGrafica.addEventListener("click", () => {
            const activeCanvas = document.querySelector(".tab-pane.active canvas");
            if (!activeCanvas) {
                alert("No se encontró ninguna gráfica para exportar.");
                return;
            }

            const link = document.createElement("a");
            link.download = `Reporte_Agromundo_${fechaArchivo()}.png`;
            link.href = activeCanvas.toDataURL("image/png");
            link.click();
        });
    }

    const btnExportarExcel = document.getElementById("btnExportarExcel");
    if (btnExportarExcel) {
        btnExportarExcel.addEventListener("click", () => {
            descargarArchivo(
                `Resumen_Reportes_Agromundo_${fechaArchivo()}.csv`,
                construirResumenCSV(),
                "text/csv;charset=utf-8;"
            );
        });
    }

    const btnWhatsAppAlertas = document.getElementById("btnWhatsAppAlertas");
    if (btnWhatsAppAlertas) {
        btnWhatsAppAlertas.addEventListener("click", () => {
            const guardado = localStorage.getItem("agromundo_whatsapp_alertas") || "";
            const ingresado = window.prompt(
                "Ingresa el número de WhatsApp que recibirá las alertas. Puedes ponerlo con o sin +52.",
                guardado
            );

            if (ingresado === null) {
                return;
            }

            const numero = normalizarNumeroWhatsApp(ingresado);
            if (!numero) {
                alert("Necesitas ingresar un número válido para enviar las alertas.");
                return;
            }

            localStorage.setItem("agromundo_whatsapp_alertas", numero);
            const mensaje = encodeURIComponent(construirMensajeWhatsApp());
            window.open(`https://wa.me/${numero}?text=${mensaje}`, "_blank");
        });
    }

    const filtroAlmacen = document.getElementById("filtroAlmacen");
    const inputFechaInicio = document.getElementById("fechaInicio");
    const inputFechaFinal = document.getElementById("fechaFinal");

    function aplicarFiltros() {
        const almacen = filtroAlmacen ? filtroAlmacen.value : "todos";
        const inicio = inputFechaInicio ? inputFechaInicio.value : "";
        const fin = inputFechaFinal ? inputFechaFinal.value : "";

        console.log(`Buscando datos -> Almacén: ${almacen} | Desde: ${inicio} | Hasta: ${fin}`);
    }

    if (filtroAlmacen) filtroAlmacen.addEventListener("change", aplicarFiltros);
    if (inputFechaInicio) inputFechaInicio.addEventListener("change", aplicarFiltros);
    if (inputFechaFinal) inputFechaFinal.addEventListener("change", aplicarFiltros);
});
