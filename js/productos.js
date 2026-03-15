document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "productos_v1";

  const btnGuardar = document.getElementById("btnGuardarProducto");

  const btnAbrirCategoriasProducto = document.getElementById("btnAbrirCategoriasProducto");
  const btnAgregarCategoriaProducto = document.getElementById("btnAgregarCategoriaProducto");
  const btnCerrarCategorias = document.getElementById("btnCerrarCategorias");
  const btnCerrarCategoriasX = document.getElementById("btnCerrarCategoriasX");

  const btnAbrirSubcategorias = document.getElementById("btnAbrirSubcategorias");
  const btnAgregarSubcategoria = document.getElementById("btnAgregarSubcategoria");
  const btnCerrarSubcategorias = document.getElementById("btnCerrarSubcategorias");
  const btnCerrarSubcategoriasX = document.getElementById("btnCerrarSubcategoriasX");

  const form = document.getElementById("formularioProducto");
  const tbody = document.querySelector("#dataTable tbody");
  const inputBuscar = document.getElementById("buscarProductos");

  const inpCodigo = document.getElementById("codigoProd");
  const inpDescripcion = document.getElementById("descripcionProd");
  const inpPrecio = document.getElementById("precioProd");

  const selectCategoriaProducto = document.getElementById("selectCategoriaProducto");
  const listaCategoriasProducto = document.getElementById("listaCategoriasProducto");
  const resumenCategoriasProducto = document.getElementById("resumenCategoriasProducto");

  const selectNuevaSubcategoria = document.getElementById("selectNuevaSubcategoria");
  const inpValorSubcategoria = document.getElementById("valorSubcategoria");
  const inpUnidadSubcategoria = document.getElementById("unidadSubcategoria");
  const listaSubcategoriasProducto = document.getElementById("listaSubcategoriasProducto");
  const resumenSubcategoriasProducto = document.getElementById("resumenSubcategoriasProducto");

  const catProductoCodigo = document.getElementById("catProductoCodigo");
  const catProductoDescripcion = document.getElementById("catProductoDescripcion");
  const subProductoCodigo = document.getElementById("subProductoCodigo");
  const subProductoDescripcion = document.getElementById("subProductoDescripcion");

  const modalRegistro = "#modalNuevoProducto";
  const modalCategorias = document.getElementById("modalCategoriasProducto");
  const modalSubcategorias = document.getElementById("modalSubcategoriasProducto");
  const tituloModal = document.getElementById("tituloModal");

  let modo = "create";
  let codigoEditando = null;
  let categoriasTemporales = [];
  let subcategoriasTemporales = [];

  const norm = (v) => (v ?? "").toString().trim();

  const getProductos = () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  };

  const setProductos = (arr) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  };

  const catalogoSubcategorias = {
    Peso: {
      nombre: "Peso",
      opciones: [
        { valor: 20, unidad: "kg" },
        { valor: 40, unidad: "kg" },
        { valor: 60, unidad: "kg" }
      ]
    },
    Voltaje: {
      nombre: "Voltaje",
      opciones: [
        { valor: 110, unidad: "V" },
        { valor: 220, unidad: "V" }
      ]
    },
    Capacidad: {
      nombre: "Capacidad",
      opciones: [
        { valor: 1, unidad: "L" },
        { valor: 5, unidad: "L" },
        { valor: 20, unidad: "L" }
      ]
    }
  };

  function actualizarEncabezadosVentanas() {
    const codigo = norm(inpCodigo.value) || "Nuevo producto";
    const descripcion = norm(inpDescripcion.value) || "Sin definir";

    if (catProductoCodigo) catProductoCodigo.textContent = codigo;
    if (catProductoDescripcion) catProductoDescripcion.textContent = descripcion;
    if (subProductoCodigo) subProductoCodigo.textContent = codigo;
    if (subProductoDescripcion) subProductoDescripcion.textContent = descripcion;
  }

  function actualizarResumenCategorias() {
    const total = categoriasTemporales.length;
    resumenCategoriasProducto.textContent =
      `${total} ${total === 1 ? "categoría registrada" : "categorías registradas"}`;
  }

  function actualizarResumenSubcategorias() {
    const total = subcategoriasTemporales.length;
    resumenSubcategoriasProducto.textContent =
      `${total} ${total === 1 ? "subcategoría registrada" : "subcategorías registradas"}`;
  }

  function renderCategoriasTemporales() {
    if (!listaCategoriasProducto) return;

    if (categoriasTemporales.length === 0) {
      listaCategoriasProducto.innerHTML = `
        <div class="text-muted small">No hay categorías agregadas.</div>
      `;
      actualizarResumenCategorias();
      return;
    }

    listaCategoriasProducto.innerHTML = `
      <div>
        ${categoriasTemporales.map((categoria, index) => `
          <span class="chip-item">
            ${categoria}
            <button
              type="button"
              class="btn-quitar-categoria-producto"
              data-index="${index}"
              title="Quitar"
            >&times;</button>
          </span>
        `).join("")}
      </div>
    `;

    actualizarResumenCategorias();
  }

  function renderSubcategoriasTemporales() {
    if (!listaSubcategoriasProducto) return;

    subcategoriasTemporales = (subcategoriasTemporales || []).filter((sub) =>
      sub &&
      typeof sub === "object" &&
      "nombre" in sub &&
      "valor" in sub &&
      "unidad" in sub
    );

    if (subcategoriasTemporales.length === 0) {
      listaSubcategoriasProducto.innerHTML = `
        <div class="text-muted small">No hay subcategorías agregadas.</div>
      `;
      actualizarResumenSubcategorias();
      return;
    }

    listaSubcategoriasProducto.innerHTML = `
      <div class="table-responsive">
        <table class="table table-bordered table-sm mb-0">
          <thead class="thead-light">
            <tr>
              <th>Nombre</th>
              <th>Valor</th>
              <th>Unidad</th>
              <th style="width: 90px;">Acción</th>
            </tr>
          </thead>
          <tbody>
            ${subcategoriasTemporales.map((sub, index) => `
              <tr>
                <td>${sub.nombre}</td>
                <td>${sub.valor}</td>
                <td>${sub.unidad}</td>
                <td>
                  <button
                    type="button"
                    class="btn btn-danger btn-sm btn-quitar-subcategoria"
                    data-index="${index}"
                  >
                    Quitar
                  </button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;

    actualizarResumenSubcategorias();
  }

  function renderTabla(filtro = "") {
    const f = norm(filtro).toLowerCase();
    const productos = getProductos();

    const lista = !f
      ? productos
      : productos.filter((p) => {
          const categoriasTexto = (p.categoria || []).join(" ");
          const subcategoriasTexto = (p.subcategoria || [])
            .map((sub) => `${sub.nombre} ${sub.valor} ${sub.unidad}`)
            .join(" ");

          const texto = `
            ${p.codigo}
            ${p.descripcion}
            ${p.precio}
            ${categoriasTexto}
            ${subcategoriasTexto}
          `.toLowerCase();

          return texto.includes(f);
        });

    tbody.innerHTML = lista.map((p) => `
      <tr data-codigo="${p.codigo}">
        <td>${p.codigo}</td>
        <td>${p.descripcion}</td>
        <td>$${Number(p.precio).toFixed(2)}</td>
        <td>${(p.categoria || []).join(", ")}</td>
        <td>
          <button type="button" class="btn btn-info btn-circle btn-sm btn-detalle" title="Ver detalle">
            <i class="fas fa-eye"></i>
          </button>
          <button type="button" class="btn btn-warning btn-circle btn-sm btn-editar" title="Editar">
            <i class="fas fa-pen"></i>
          </button>
          <button type="button" class="btn btn-danger btn-circle btn-sm btn-eliminar" title="Eliminar">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `).join("");
  }

  function seedFromHTMLIfEmpty() {
    const current = getProductos();
    if (current.length > 0) return;

    const rows = Array.from(tbody.querySelectorAll("tr"));
    const seeded = rows.map((tr) => {
      const tds = tr.querySelectorAll("td");
      if (tds.length < 4) return null;

      const categoriaTexto = norm(tds[3].textContent);

      return {
        codigo: norm(tds[0].textContent),
        descripcion: norm(tds[1].textContent),
        precio: parseFloat(norm(tds[2].textContent).replace("$", "")) || 0,
        categoria: categoriaTexto
          ? categoriaTexto.split(",").map((c) => c.trim()).filter(Boolean)
          : [],
        subcategoria: []
      };
    }).filter(Boolean);

    setProductos(seeded);
  }

  function resetFormularioProducto() {
    form.reset();
    categoriasTemporales = [];
    subcategoriasTemporales = [];
    codigoEditando = null;
    inpCodigo.disabled = false;

    if (selectCategoriaProducto) selectCategoriaProducto.value = "";
    if (selectNuevaSubcategoria) selectNuevaSubcategoria.value = "";
    if (inpValorSubcategoria) inpValorSubcategoria.innerHTML = '<option value="">Elegir valor...</option>';
    if (inpUnidadSubcategoria) inpUnidadSubcategoria.value = "";

    renderCategoriasTemporales();
    renderSubcategoriasTemporales();
    actualizarEncabezadosVentanas();
  }

  function abrirEditar(producto) {
    modo = "edit";
    codigoEditando = producto.codigo;

    inpCodigo.value = producto.codigo;
    inpDescripcion.value = producto.descripcion;
    inpPrecio.value = producto.precio;

    categoriasTemporales = [...(producto.categoria || [])];
    subcategoriasTemporales = [...(producto.subcategoria || [])];

    inpCodigo.disabled = true;

    renderCategoriasTemporales();
    renderSubcategoriasTemporales();
    actualizarEncabezadosVentanas();

    tituloModal.textContent = `Editar Producto ${producto.codigo}`;
    btnGuardar.textContent = "Guardar Cambios";

    $(modalRegistro).modal("show");
  }

  function abrirDetalle(producto) {
    const detalleCodigo = document.getElementById("detalleCodigo");
    const detalleDescripcion = document.getElementById("detalleDescripcion");
    const detallePrecio = document.getElementById("detallePrecio");
    const detalleCategorias = document.getElementById("detalleCategorias");
    const detalleSubcategorias = document.getElementById("detalleSubcategorias");

    detalleCodigo.textContent = producto.codigo;
    detalleDescripcion.textContent = producto.descripcion;
    detallePrecio.textContent = `$${Number(producto.precio).toFixed(2)}`;
    detalleCategorias.textContent = (producto.categoria || []).join(", ") || "Sin categorías";
    detalleSubcategorias.textContent = (producto.subcategoria || []).length
      ? producto.subcategoria.map((sub) => `${sub.nombre}: ${sub.valor} ${sub.unidad}`).join(", ")
      : "Sin subcategorías";

    $("#modalDetalleProducto").modal("show");
  }

  function cerrarVentanaCategorias() {
    if (modalCategorias) modalCategorias.style.display = "none";
  }

  function cerrarVentanaSubcategorias() {
    if (modalSubcategorias) modalSubcategorias.style.display = "none";
  }

  seedFromHTMLIfEmpty();
  renderTabla();
  renderCategoriasTemporales();
  renderSubcategoriasTemporales();
  actualizarResumenCategorias();
  actualizarResumenSubcategorias();
  actualizarEncabezadosVentanas();

  $(modalRegistro).on("show.bs.modal", function () {
    if (modo !== "edit") {
      modo = "create";
      codigoEditando = null;
      resetFormularioProducto();
      tituloModal.textContent = "Registrar Nuevo Producto";
      btnGuardar.textContent = "Guardar Producto";
    }
  });

  $(modalRegistro).on("hidden.bs.modal", function () {
    modo = "create";
    codigoEditando = null;
    resetFormularioProducto();
  });

  if (btnAbrirCategoriasProducto) {
    btnAbrirCategoriasProducto.addEventListener("click", () => {
      actualizarEncabezadosVentanas();
      renderCategoriasTemporales();
      if (modalCategorias) modalCategorias.style.display = "flex";
    });
  }

  if (btnCerrarCategorias) {
    btnCerrarCategorias.addEventListener("click", cerrarVentanaCategorias);
  }

  if (btnCerrarCategoriasX) {
    btnCerrarCategoriasX.addEventListener("click", cerrarVentanaCategorias);
  }

  if (btnAgregarCategoriaProducto) {
    btnAgregarCategoriaProducto.addEventListener("click", () => {
      const nuevaCategoria = norm(selectCategoriaProducto.value);

      if (!nuevaCategoria) {
        alert("Selecciona una categoría");
        return;
      }

      if (categoriasTemporales.includes(nuevaCategoria)) {
        alert("Esa categoría ya fue agregada");
        return;
      }

      categoriasTemporales.push(nuevaCategoria);
      renderCategoriasTemporales();
      selectCategoriaProducto.value = "";
    });
  }

  if (listaCategoriasProducto) {
    listaCategoriasProducto.addEventListener("click", (e) => {
      const btnQuitar = e.target.closest(".btn-quitar-categoria-producto");
      if (!btnQuitar) return;

      const index = Number(btnQuitar.getAttribute("data-index"));
      categoriasTemporales.splice(index, 1);
      renderCategoriasTemporales();
    });
  }

  if (btnAbrirSubcategorias) {
    btnAbrirSubcategorias.addEventListener("click", () => {
      actualizarEncabezadosVentanas();
      renderSubcategoriasTemporales();
      if (modalSubcategorias) modalSubcategorias.style.display = "flex";
    });
  }

  if (btnCerrarSubcategorias) {
    btnCerrarSubcategorias.addEventListener("click", cerrarVentanaSubcategorias);
  }

  if (btnCerrarSubcategoriasX) {
    btnCerrarSubcategoriasX.addEventListener("click", cerrarVentanaSubcategorias);
  }

  if (selectNuevaSubcategoria) {
    selectNuevaSubcategoria.addEventListener("change", () => {
      const key = norm(selectNuevaSubcategoria.value);

      inpValorSubcategoria.innerHTML = '<option value="">Elegir valor...</option>';
      inpUnidadSubcategoria.value = "";

      if (!key || !catalogoSubcategorias[key]) return;

      const opciones = catalogoSubcategorias[key].opciones;

      opciones.forEach((op, index) => {
        inpValorSubcategoria.innerHTML += `<option value="${index}">${op.valor}</option>`;
      });
    });
  }

  if (inpValorSubcategoria) {
    inpValorSubcategoria.addEventListener("change", () => {
      const key = norm(selectNuevaSubcategoria.value);
      const idx = inpValorSubcategoria.value;

      if (!key || idx === "" || !catalogoSubcategorias[key]) {
        inpUnidadSubcategoria.value = "";
        return;
      }

      const opcion = catalogoSubcategorias[key].opciones[idx];
      inpUnidadSubcategoria.value = opcion.unidad;
    });
  }

  if (btnAgregarSubcategoria) {
    btnAgregarSubcategoria.addEventListener("click", () => {
      const key = norm(selectNuevaSubcategoria.value);
      const idx = inpValorSubcategoria.value;

      if (!key || !catalogoSubcategorias[key]) {
        alert("Selecciona una subcategoría");
        return;
      }

      if (idx === "") {
        alert("Selecciona un valor");
        return;
      }

      const subcat = catalogoSubcategorias[key];
      const opcion = subcat.opciones[idx];

      const yaExiste = subcategoriasTemporales.some(
        (sub) =>
          sub.nombre === subcat.nombre &&
          String(sub.valor) === String(opcion.valor) &&
          sub.unidad === opcion.unidad
      );

      if (yaExiste) {
        alert("Esa combinación ya fue agregada");
        return;
      }

      subcategoriasTemporales.push({
        nombre: subcat.nombre,
        valor: opcion.valor,
        unidad: opcion.unidad
      });

      renderSubcategoriasTemporales();

      selectNuevaSubcategoria.value = "";
      inpValorSubcategoria.innerHTML = '<option value="">Elegir valor...</option>';
      inpUnidadSubcategoria.value = "";
    });
  }

  if (listaSubcategoriasProducto) {
    listaSubcategoriasProducto.addEventListener("click", (e) => {
      const btnQuitar = e.target.closest(".btn-quitar-subcategoria");
      if (!btnQuitar) return;

      const index = Number(btnQuitar.getAttribute("data-index"));
      subcategoriasTemporales.splice(index, 1);
      renderSubcategoriasTemporales();
    });
  }

  if (btnGuardar) {
    btnGuardar.addEventListener("click", (e) => {
      e.preventDefault();

      const codigo = norm(inpCodigo.value);
      const descripcion = norm(inpDescripcion.value);
      const precio = parseFloat(inpPrecio.value);

      if (!codigo || !descripcion) {
        alert("Completa todos los campos obligatorios");
        return;
      }

      if (isNaN(precio) || precio <= 0) {
        alert("El precio debe ser válido");
        return;
      }

      if (categoriasTemporales.length === 0) {
        alert("Agrega al menos una categoría");
        return;
      }

      const productos = getProductos();

      if (modo === "create") {
        if (productos.some((p) => norm(p.codigo).toUpperCase() === codigo.toUpperCase())) {
          alert("Ese código ya existe");
          return;
        }

        productos.push({
          codigo,
          descripcion,
          precio,
          categoria: [...categoriasTemporales],
          subcategoria: [...subcategoriasTemporales]
        });

        setProductos(productos);
        renderTabla(inputBuscar ? inputBuscar.value : "");
        resetFormularioProducto();
        $(modalRegistro).modal("hide");
        return;
      }

      const idx = productos.findIndex((p) => p.codigo === codigoEditando);

      if (idx === -1) {
        alert("No se encontró el producto a editar");
        return;
      }

      productos[idx] = {
        ...productos[idx],
        codigo,
        descripcion,
        precio,
        categoria: [...categoriasTemporales],
        subcategoria: [...subcategoriasTemporales]
      };

      setProductos(productos);
      renderTabla(inputBuscar ? inputBuscar.value : "");
      modo = "create";
      codigoEditando = null;
      resetFormularioProducto();
      $(modalRegistro).modal("hide");
    });
  }

  if (tbody) {
    tbody.addEventListener("click", (e) => {
      const tr = e.target.closest("tr");
      if (!tr) return;

      const codigo = tr.getAttribute("data-codigo");
      const productos = getProductos();
      const producto = productos.find((p) => p.codigo === codigo);

      if (!producto) return;

      const btnDetalle = e.target.closest(".btn-detalle");
      if (btnDetalle) {
        abrirDetalle(producto);
        return;
      }

      const btnEditar = e.target.closest(".btn-editar");
      if (btnEditar) {
        abrirEditar(producto);
        return;
      }

      const btnEliminar = e.target.closest(".btn-eliminar");
      if (btnEliminar) {
        if (!confirm(`¿Eliminar el producto ${codigo}?`)) return;

        const nuevos = productos.filter((p) => p.codigo !== codigo);
        setProductos(nuevos);
        renderTabla(inputBuscar ? inputBuscar.value : "");
      }
    });
  }

  if (inputBuscar) {
    inputBuscar.addEventListener("input", () => {
      renderTabla(inputBuscar.value);
    });
  }
});