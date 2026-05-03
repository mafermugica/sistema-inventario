document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = "http://143.198.230.63";

  const btnGuardar = document.getElementById("btnGuardarSubcategoria");
  const form = document.getElementById("formularioSubcategoria");
  const tbody = document.querySelector("#dataTable tbody");
  const inputBuscar = document.getElementById("buscarSubcategoria");
  const inpNombre = document.getElementById("nombreSubcategoria");
  const inpDescripcion = document.getElementById("descripcionSubcategoria");
  const inpValor = document.getElementById("valorNumerico");
  const inpUnidad = document.getElementById("unidad");
  const selectCategorias = document.getElementById("selectCategoriasSub");
  const tituloModal = document.getElementById("tituloModal");
  const modalRegistro = "#modalNuevaSubcategoria";

  const btnAbrirCategoriasSub = document.getElementById("btnAbrirCategoriasSub");
  const btnAgregarCategoriaSub = document.getElementById("btnAgregarCategoriaSub");
  const btnCerrarCategoriasSub = document.getElementById("btnCerrarCategoriasSub");
  const btnCerrarCategoriasSubX = document.getElementById("btnCerrarCategoriasSubX");

  const selectNuevaCategoriaSub = document.getElementById("selectNuevaCategoriaSub");
  const listaCategoriasSub = document.getElementById("listaCategoriasSub");
  const resumenCategoriasSub = document.getElementById("resumenCategoriasSub");

  const modalCategoriasSub = document.getElementById("modalCategoriasSub");

  let categoriasTemporales = [];

  let modo = "create";
  let idEditando = null;
  let subcategoriasCache = [];
  let categoriasCache = [];

  const norm = (v) => (v ?? "").toString().trim();

  function resolverIdSub(s) {
    return s.id_subcat ?? s.id_subcategoria ?? s.id ?? s.idSubcategoria ?? null;
  }

  function resolverCategoriasIds(s) {
    const raw = s.categorias_ids ?? s.categorias ?? s.categorias_relacionadas ?? s.categorias_asociadas ?? [];
    return (Array.isArray(raw) ? raw : []).map((c) => (typeof c === "object" ? (c.id_cat ?? c.id_categoria ?? c.id) : c));
  }

  function resolverNombreCategoria(cat) {
    return cat.nombre || cat.nombre_categoria || `Categoría ${cat.id_cat ?? cat.id}`;
  }

  async function apiFetch(endpoint, options = {}) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      ...options
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.message || "Error en la petición");
    }

    if (data?.success === false) {
      throw new Error(data?.message || "Operación fallida");
    }

    return data;
  }

  async function getSubcategoriasAPI() {
    const res = await apiFetch("/api/subcategorias/");
    return Array.isArray(res.data) ? res.data : [];
  }

  async function crearSubcategoriaAPI(payload) {
    return await apiFetch("/api/subcategorias/", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }

  async function editarSubcategoriaAPI(id, payload) {
    return await apiFetch(`/api/subcategorias/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
  }

  async function eliminarSubcategoriaAPI(id) {
    return await apiFetch(`/api/subcategorias/${id}`, {
      method: "DELETE"
    });
  }

  async function getCategoriasAPI() {
    const res = await apiFetch("/api/categorias/");
    return Array.isArray(res.data) ? res.data : [];
  }

  function showSuccess(texto) {
    return Swal.fire({ icon: "success", title: "Éxito", text: texto, confirmButtonText: "Aceptar" });
  }

  function showError(texto) {
    return Swal.fire({ icon: "error", title: "Error", text: texto, confirmButtonText: "Aceptar" });
  }

  function showWarning(texto) {
    return Swal.fire({ icon: "warning", title: "Atención", text: texto, confirmButtonText: "Aceptar" });
  }

  async function confirmDelete(texto) {
    const result = await Swal.fire({
      icon: "warning",
      title: "¿Estás seguro?",
      text: texto,
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      reverseButtons: true
    });
    return result.isConfirmed;
  }

  function cargarSelectCategorias(idsSeleccionados = []) {
    if (!selectCategorias) return;
    selectCategorias.innerHTML = "";

    categoriasCache.forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat.id_cat ?? cat.id ?? "";
      option.textContent = resolverNombreCategoria(cat);

      if (idsSeleccionados.some((sel) => String(sel) === String(option.value))) {
        option.selected = true;
      }

      selectCategorias.appendChild(option);
    });
  }

  function getNombresCategorias(categoriasIds) {
    if (!Array.isArray(categoriasIds) || categoriasIds.length === 0) return "Sin categorías";

    const nombres = categoriasIds.map((id) => {
      const cat = categoriasCache.find((c) => String(c.id_cat ?? c.id) === String(id));
      return cat ? resolverNombreCategoria(cat) : id;
    });

    return nombres.join(", ");
  }

  function renderTabla(filtro = "") {
    const f = norm(filtro).toLowerCase();
    const lista = !f
      ? subcategoriasCache
      : subcategoriasCache.filter((s) => {
          const texto = `${s.nombre || ""} ${s.descripcion || ""} ${s.unidad || ""}`.toLowerCase();
          return texto.includes(f);
        });

    if (lista.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">Sin subcategorías registradas.</td></tr>`;
      return;
    }

    tbody.innerHTML = lista.map((s) => {
      const id = resolverIdSub(s);
      const valor = s.valor_numerico != null ? s.valor_numerico : "—";
      const unidad = s.unidad || "—";

      return `
        <tr data-id="${id}">
          <td>${id}</td>
          <td>${s.nombre}</td>
          <td class="text-wrap" style="max-width: 250px;">${s.descripcion || "—"}</td>
          <td>${valor}</td>
          <td>${unidad}</td>
          <td>
            <button type="button" class="btn btn-info btn-circle btn-sm btn-detalle" title="Ver detalle"><i class="fas fa-eye"></i></button>
            <button type="button" class="btn btn-warning btn-circle btn-sm btn-editar" title="Editar"><i class="fas fa-pen"></i></button>
            <button type="button" class="btn btn-danger btn-circle btn-sm btn-eliminar" title="Eliminar"><i class="fas fa-trash"></i></button>
          </td>
        </tr>
      `;
    }).join("");
  }

  function resetFormulario() {
    if (form) form.reset();
    modo = "create";
    idEditando = null;
    categoriasTemporales = [];
    tituloModal.textContent = "Nueva Subcategoría";
    btnGuardar.textContent = "Guardar Subcategoría";
  }

  async function abrirDetalle(subcategoria) {
    try {
      const data = subcategoria;
      const categoriasIds = resolverCategoriasIds(data);

      const detalleIdSub = document.getElementById("detalleIdSub");
      const detalleNombreSub = document.getElementById("detalleNombreSub");
      const detalleDescripcionSub = document.getElementById("detalleDescripcionSub");
      const detalleValorSub = document.getElementById("detalleValorSub");
      const detalleUnidadSub = document.getElementById("detalleUnidadSub");
      const detalleCategoriasSub = document.getElementById("detalleCategoriasSub");

      if (detalleIdSub) detalleIdSub.textContent = resolverIdSub(data) || "—";
      if (detalleNombreSub) detalleNombreSub.textContent = data.nombre || "—";
      if (detalleDescripcionSub) detalleDescripcionSub.textContent = data.descripcion || "—";
      if (detalleValorSub) detalleValorSub.textContent = data.valor_numerico != null ? data.valor_numerico : "—";
      if (detalleUnidadSub) detalleUnidadSub.textContent = data.unidad || "—";
      if (detalleCategoriasSub) detalleCategoriasSub.textContent = getNombresCategorias(categoriasIds);

      $("#modalDetalleSubcategoria").modal("show");
    } catch (error) {
      alert(error.message || "Error al cargar el detalle de la subcategoría");
    }
  }

  function abrirEditar(subcategoria) {
    modo = "edit";
    idEditando = resolverIdSub(subcategoria);

    inpNombre.value = subcategoria.nombre || "";
    inpDescripcion.value = subcategoria.descripcion || "";
    inpValor.value = subcategoria.valor_numerico != null ? subcategoria.valor_numerico : "";
    inpUnidad.value = subcategoria.unidad || "";

    const categoriasIds = resolverCategoriasIds(subcategoria);
    categoriasTemporales = [...categoriasIds.map(id => String(id))];

    tituloModal.textContent = "Editar Subcategoría";
    btnGuardar.textContent = "Guardar Cambios";
    $(modalRegistro).modal("show");
  }

  function obtenerCategoriasSeleccionadas() {
    return Array.from(selectCategorias.selectedOptions)
      .map((opt) => Number(opt.value))
      .filter((v) => v > 0);
  }

  function actualizarResumenCategoriasSub() {
    const total = categoriasTemporales.length;
    if (resumenCategoriasSub) {
      resumenCategoriasSub.textContent = `${total} ${total === 1 ? "categoría registrada" : "categorías registradas"}`;
    }
  }

  function renderCategoriasTemporales() {
    if (!listaCategoriasSub) return;

    if (categoriasTemporales.length === 0) {
      listaCategoriasSub.innerHTML = `<div class="text-muted small">No hay categorías agregadas.</div>`;
      actualizarResumenCategoriasSub();
      return;
    }

    listaCategoriasSub.innerHTML = `
      <ul class="list-group">
        ${categoriasTemporales.map(catId => {
          const cat = categoriasCache.find(c => String(c.id_cat ?? c.id) === String(catId));
          const nombre = cat ? resolverNombreCategoria(cat) : catId;
          return `
            <li class="list-group-item d-flex justify-content-between align-items-center">
              ${nombre}
              <button type="button" class="btn btn-danger btn-sm btn-quitar-categoria-sub" data-categoria="${catId}">
                Quitar
              </button>
            </li>
          `;
        }).join("")}
      </ul>
    `;

    actualizarResumenCategoriasSub();
  }

  function cargarSelectNuevaCategoriaSub() {
    if (!selectNuevaCategoriaSub) return;
    selectNuevaCategoriaSub.innerHTML = `<option value="" selected>Elegir categoría...</option>`;
    categoriasCache.forEach(cat => {
      const option = document.createElement("option");
      option.value = cat.id_cat ?? cat.id ?? "";
      option.textContent = resolverNombreCategoria(cat);
      if (categoriasTemporales.includes(option.value)) {
        option.disabled = true;
      }
      selectNuevaCategoriaSub.appendChild(option);
    });
  }

  async function refrescarSubcategorias() {
    subcategoriasCache = await getSubcategoriasAPI();
    renderTabla(inputBuscar ? inputBuscar.value : "");
  }

  if (btnGuardar) {
    btnGuardar.addEventListener("click", async (e) => {
      e.preventDefault();

      const payload = {
        nombre: norm(inpNombre.value),
        descripcion: norm(inpDescripcion.value),
        valor_numerico: inpValor.value ? Number(inpValor.value) : null,
        unidad: norm(inpUnidad.value),
        categorias_ids: categoriasTemporales.map(id => Number(id))
      };

      try {
        if (modo === "create") {
          const res = await crearSubcategoriaAPI(payload);
          await showSuccess(res?.message || "Subcategoría creada correctamente");
        } else {
          const res = await editarSubcategoriaAPI(idEditando, payload);
          await showSuccess(res?.message || "Subcategoría actualizada correctamente");
        }

        await refrescarSubcategorias();
        resetFormulario();
        $(modalRegistro).modal("hide");
      } catch (error) {
        await showError(error.message || "Error al guardar la subcategoría");
      }
    });
  }

  if (tbody) {
    tbody.addEventListener("click", async (e) => {
      const tr = e.target.closest("tr");
      if (!tr) return;

      const id = tr.getAttribute("data-id");
      if (!id) return;

      const subcategoria = subcategoriasCache.find((s) => String(resolverIdSub(s)) === String(id));
      if (!subcategoria) return;

      if (e.target.closest(".btn-detalle")) {
        abrirDetalle(subcategoria);
        return;
      }

      if (e.target.closest(".btn-editar")) {
        abrirEditar(subcategoria);
        return;
      }

      if (e.target.closest(".btn-eliminar")) {
        const confirmado = await confirmDelete(`Se eliminará la subcategoría "${subcategoria.nombre}".`);
        if (!confirmado) return;

        try {
          await eliminarSubcategoriaAPI(resolverIdSub(subcategoria));
          await refrescarSubcategorias();
          await showSuccess("Subcategoría eliminada correctamente");
        } catch (error) {
          await showError(error.message || "Error al eliminar la subcategoría");
        }
      }
    });
  }

  if (inputBuscar) {
    inputBuscar.addEventListener("input", () => renderTabla(inputBuscar.value));
  }

  $(modalRegistro).on("hidden.bs.modal", () => resetFormulario());

  if (btnAbrirCategoriasSub) {
    btnAbrirCategoriasSub.addEventListener("click", () => {
      cargarSelectNuevaCategoriaSub();
      renderCategoriasTemporales();
      if (modalCategoriasSub) {
        modalCategoriasSub.style.display = "flex";
      }
    });
  }

  function cerrarVentanaCategoriasSub() {
    if (modalCategoriasSub) {
      modalCategoriasSub.style.display = "none";
    }
  }

  if (btnCerrarCategoriasSub) {
    btnCerrarCategoriasSub.addEventListener("click", cerrarVentanaCategoriasSub);
  }
  if (btnCerrarCategoriasSubX) {
    btnCerrarCategoriasSubX.addEventListener("click", cerrarVentanaCategoriasSub);
  }

  if (btnAgregarCategoriaSub) {
    btnAgregarCategoriaSub.addEventListener("click", () => {
      const nuevaCategoria = norm(selectNuevaCategoriaSub.value);

      if (!nuevaCategoria) {
        alert("Selecciona una categoría");
        return;
      }

      if (categoriasTemporales.includes(nuevaCategoria)) {
        alert("Esa categoría ya fue agregada");
        return;
      }

      categoriasTemporales.push(nuevaCategoria);
      cargarSelectNuevaCategoriaSub();
      renderCategoriasTemporales();
    });
  }

  if (listaCategoriasSub) {
    listaCategoriasSub.addEventListener("click", (e) => {
      const btnQuitar = e.target.closest(".btn-quitar-categoria-sub");
      if (!btnQuitar) return;

      const categoria = btnQuitar.getAttribute("data-categoria");
      categoriasTemporales = categoriasTemporales.filter(cat => cat !== categoria);
      cargarSelectNuevaCategoriaSub();
      renderCategoriasTemporales();
    });
  }

  (async function init() {
    try {
      categoriasCache = await getCategoriasAPI();
      cargarSelectCategorias();
      await refrescarSubcategorias();
    } catch (error) {
      await showError(`Error al cargar datos iniciales: ${error.message}`);
    }
  })();
});
