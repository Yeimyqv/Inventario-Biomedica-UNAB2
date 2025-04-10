// Variables globales
let currentUser = {
  id: null,
  tipo: null,
  nombre: null
};

let elementoSeleccionado = null;
let categoriaSeleccionada = null;

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
  console.log('Aplicación de Gestión de Laboratorio iniciada');
  
  // Inicializar elementos interactivos
  initEventListeners();
  
  // Inicializar notificaciones con Bootstrap
  initNotifications();
});

// Inicializar listeners de eventos
function initEventListeners() {
  // Botón de regreso en módulos
  const backBtn = document.getElementById('back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', volverAInterfazPrincipal);
  }
  
  // Botón de autenticación
  const authButton = document.getElementById('auth-button');
  if (authButton) {
    authButton.addEventListener('click', autenticarUsuario);
  }
  
  // Selección de categoría en préstamo
  const categoriaSelect = document.getElementById('categoria-select');
  if (categoriaSelect) {
    categoriaSelect.addEventListener('change', onCategoriaSeleccionada);
  }
  
  // Selección de elemento en préstamo
  const elementoSelect = document.getElementById('elemento-select');
  if (elementoSelect) {
    elementoSelect.addEventListener('change', onElementoSeleccionado);
  }
  
  // Botón de préstamo
  const prestamoBtn = document.getElementById('prestamo-btn');
  if (prestamoBtn) {
    prestamoBtn.addEventListener('click', realizarPrestamo);
  }
}

// Inicializar sistema de notificaciones
function initNotifications() {
  // Se usa bootstrap para notificaciones tipo toast
}

// Selección inicial del tipo de usuario
function selectUserType(tipo) {
  currentUser.tipo = tipo;
  
  // Ocultar selección de usuario
  document.getElementById('user-selection').style.display = 'none';
  
  // Mostrar formulario de autenticación
  const authSection = document.getElementById('auth-section');
  authSection.style.display = 'block';
  
  // Configurar según tipo de usuario
  const pinGroup = document.getElementById('pin-group');
  
  if (tipo === 'estudiante') {
    pinGroup.style.display = 'none';
  } else {
    pinGroup.style.display = 'block';
  }
  
  // Añadir botón de regreso a la página principal
  const backBtn = document.createElement('button');
  backBtn.className = 'btn btn-outline-secondary mt-3';
  backBtn.textContent = 'Volver a página de inicio';
  backBtn.onclick = volverAPaginaInicio;
  
  const formButtons = document.querySelector('#auth-form .d-grid');
  formButtons.appendChild(backBtn);
}

// Función para volver a la página de inicio con confirmación
function volverAPaginaInicio() {
  const confirmacion = confirm('¿Estás seguro que deseas volver a la página de inicio?');
  if (confirmacion) {
    window.location.reload();
  }
}

// Autenticar al usuario según su tipo
function autenticarUsuario() {
  const nombre = document.getElementById('user-name').value.trim();
  
  if (!nombre) {
    mostrarNotificacion('Error', 'Por favor ingresa tu nombre', 'error');
    return;
  }
  
  currentUser.nombre = nombre;
  
  // Verificar PIN si es docente o laboratorista
  if (currentUser.tipo === 'docente' || currentUser.tipo === 'laboratorista') {
    const pin = document.getElementById('pin-input').value;
    
    if (!pin) {
      mostrarNotificacion('Error', 'Por favor ingresa el PIN', 'error');
      return;
    }
    
    if (PINES[currentUser.tipo] !== pin) {
      mostrarNotificacion('Error', 'PIN incorrecto. Intenta nuevamente.', 'error');
      return;
    }
  }
  
  // Asignar un ID temporal al usuario (en un sistema real, vendría de la BD)
  currentUser.id = Date.now();
  
  // Cargar la interfaz según el tipo de usuario
  cargarInterfazPrincipal();
}

// Cargar interfaz principal según el tipo de usuario
function cargarInterfazPrincipal() {
  // Ocultar sección de autenticación
  document.getElementById('auth-section').style.display = 'none';
  
  // Mostrar la interfaz principal
  const interfaz = document.getElementById('interface');
  interfaz.style.display = 'block';
  
  // Generar contenido según tipo de usuario
  let contenido = '';
  const tipoCapitalizado = currentUser.tipo.charAt(0).toUpperCase() + currentUser.tipo.slice(1);
  
  // Interfaz para Estudiante
  if (currentUser.tipo === 'estudiante') {
    contenido = `
      <div class="card shadow mb-4">
        <div class="card-header bg-success text-white">
          <h3>Bienvenido, ${currentUser.nombre}</h3>
          <p class="mb-0">Panel de Estudiante - Puedes prestar y retornar elementos</p>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6 mb-3">
              <div class="card h-100">
                <div class="card-body text-center">
                  <h4>Préstamo de elementos</h4>
                  <p>Solicita elementos para tus prácticas</p>
                  <button class="btn btn-primary" onclick="iniciarPrestamo()">Prestar elementos</button>
                </div>
              </div>
            </div>
            <div class="col-md-6 mb-3">
              <div class="card h-100">
                <div class="card-body text-center">
                  <h4>Retorno de elementos</h4>
                  <p>Devuelve elementos prestados</p>
                  <button class="btn btn-secondary" onclick="iniciarRetorno()">Retornar elementos</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  } 
  // Interfaz para Docente
  else if (currentUser.tipo === 'docente') {
    contenido = `
      <div class="card shadow mb-4">
        <div class="card-header bg-primary text-white">
          <h3>Bienvenido, ${currentUser.nombre}</h3>
          <p class="mb-0">Panel de Docente - Gestión de elementos y préstamos</p>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-4 mb-3">
              <div class="card h-100">
                <div class="card-body text-center">
                  <h4>Préstamo de elementos</h4>
                  <p>Solicita elementos para tus clases</p>
                  <button class="btn btn-primary" onclick="iniciarPrestamo()">Prestar elementos</button>
                </div>
              </div>
            </div>
            <div class="col-md-4 mb-3">
              <div class="card h-100">
                <div class="card-body text-center">
                  <h4>Retorno de elementos</h4>
                  <p>Devuelve elementos prestados</p>
                  <button class="btn btn-secondary" onclick="iniciarRetorno()">Retornar elementos</button>
                </div>
              </div>
            </div>
            <div class="col-md-4 mb-3">
              <div class="card h-100">
                <div class="card-body text-center">
                  <h4>Consultar inventario</h4>
                  <p>Revisar disponibilidad actual</p>
                  <button class="btn btn-info" onclick="consultarInventario()">Ver inventario</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  } 
  // Interfaz para Laboratorista
  else if (currentUser.tipo === 'laboratorista') {
    contenido = `
      <div class="card shadow mb-4">
        <div class="card-header bg-warning">
          <h3>Bienvenido, ${currentUser.nombre}</h3>
          <p class="mb-0">Panel de Laboratorista - Administración completa del sistema</p>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-3 mb-3">
              <div class="card h-100">
                <div class="card-body text-center">
                  <h4>Préstamo de elementos</h4>
                  <p>Gestionar nuevos préstamos</p>
                  <button class="btn btn-primary" onclick="iniciarPrestamo()">Prestar elementos</button>
                </div>
              </div>
            </div>
            <div class="col-md-3 mb-3">
              <div class="card h-100">
                <div class="card-body text-center">
                  <h4>Retorno de elementos</h4>
                  <p>Registrar devoluciones</p>
                  <button class="btn btn-secondary" onclick="iniciarRetorno()">Retornar elementos</button>
                </div>
              </div>
            </div>
            <div class="col-md-3 mb-3">
              <div class="card h-100">
                <div class="card-body text-center">
                  <h4>Administrar inventario</h4>
                  <p>Agregar o eliminar elementos</p>
                  <button class="btn btn-warning" onclick="administrarInventario()">Administrar</button>
                </div>
              </div>
            </div>
            <div class="col-md-3 mb-3">
              <div class="card h-100">
                <div class="card-body text-center">
                  <h4>Consultar préstamos</h4>
                  <p>Ver historial y estado actual</p>
                  <button class="btn btn-info" onclick="consultarPrestamos()">Ver préstamos</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  interfaz.innerHTML = contenido;
}

// Iniciar proceso de préstamo
async function iniciarPrestamo() {
  // Ocultar la interfaz principal
  document.getElementById('interface').style.display = 'none';
  
  // Mostrar la sección de préstamo
  const prestamoSection = document.getElementById('prestamo-section');
  prestamoSection.style.display = 'block';
  
  // Configurar título
  document.getElementById('prestamo-title').textContent = 'Préstamo de elementos';
  
  // Cargar categorías desde la API
  await cargarCategorias();
}

// Iniciar proceso de retorno
function iniciarRetorno() {
  // Esta función será implementada más adelante
  mostrarNotificacion('Información', 'La funcionalidad de retorno estará disponible próximamente', 'info');
}

// Consultar inventario completo
function consultarInventario() {
  // Ocultar la interfaz principal
  document.getElementById('interface').style.display = 'none';
  
  // Crear y mostrar la sección de consulta de inventario
  const inventarioSection = document.createElement('section');
  inventarioSection.id = 'inventario-section';
  inventarioSection.className = 'my-5';
  
  // Estructura del contenido
  inventarioSection.innerHTML = `
    <div class="card shadow">
      <div class="card-header bg-info text-white d-flex justify-content-between align-items-center">
        <h3>Consulta de Inventario</h3>
        <button class="btn btn-sm btn-light" onclick="confirmarVolverAInterfaz()">Volver</button>
      </div>
      <div class="card-body">
        <!-- Filtros -->
        <div class="mb-4">
          <div class="row">
            <div class="col-md-4 mb-3">
              <label for="filtro-categoria" class="form-label">Filtrar por categoría:</label>
              <select class="form-select" id="filtro-categoria">
                <option value="">Todas las categorías</option>
                ${INVENTARIO.map(cat => `<option value="${cat.categoria}">${cat.categoria}</option>`).join('')}
              </select>
            </div>
            <div class="col-md-4 mb-3">
              <label for="filtro-nombre" class="form-label">Buscar por nombre:</label>
              <input type="text" class="form-control" id="filtro-nombre" placeholder="Nombre del elemento">
            </div>
            <div class="col-md-4 mb-3 d-flex align-items-end">
              <button class="btn btn-primary w-100" onclick="filtrarInventario()">Filtrar</button>
            </div>
          </div>
        </div>
        
        <!-- Tabla de inventario -->
        <div class="table-responsive">
          <table class="table table-striped table-hover">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Categoría</th>
                <th>Cantidad</th>
                <th>Ubicación</th>
              </tr>
            </thead>
            <tbody id="inventario-tbody">
              ${generarFilasInventario()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
  
  // Agregar a la página
  document.getElementById('interface').insertAdjacentElement('afterend', inventarioSection);
  
  // Agregar eventos
  document.getElementById('filtro-categoria').addEventListener('change', filtrarInventario);
  document.getElementById('filtro-nombre').addEventListener('input', filtrarInventario);
  
  // Mostrar la sección
  inventarioSection.style.display = 'block';
}

// Generar filas para la tabla de inventario
function generarFilasInventario(filtroCategoria = '', filtroNombre = '') {
  let html = '';
  let elementosFiltered = [];
  
  // Aplicar filtros
  INVENTARIO.forEach(categoria => {
    if (!filtroCategoria || categoria.categoria === filtroCategoria) {
      categoria.elementos.forEach(elemento => {
        if (!filtroNombre || elemento.nombre.toLowerCase().includes(filtroNombre.toLowerCase())) {
          elementosFiltered.push({...elemento, categoria: categoria.categoria});
        }
      });
    }
  });
  
  // Generar filas
  if (elementosFiltered.length > 0) {
    elementosFiltered.forEach(elemento => {
      html += `
        <tr>
          <td>${elemento.id}</td>
          <td>${elemento.nombre}</td>
          <td>${elemento.categoria}</td>
          <td>${elemento.cantidad}</td>
          <td>${elemento.ubicacion || 'No especificada'}</td>
        </tr>
      `;
    });
  } else {
    html = `<tr><td colspan="5" class="text-center">No se encontraron elementos que coincidan con los filtros</td></tr>`;
  }
  
  return html;
}

// Filtrar inventario según los criterios
function filtrarInventario() {
  const filtroCategoria = document.getElementById('filtro-categoria').value;
  const filtroNombre = document.getElementById('filtro-nombre').value;
  
  const tbody = document.getElementById('inventario-tbody');
  tbody.innerHTML = generarFilasInventario(filtroCategoria, filtroNombre);
}

// Administrar inventario (solo laboratorista)
function administrarInventario() {
  // Mostrar sección de administración
  document.getElementById('interface').style.display = 'none';
  
  const adminSection = document.getElementById('admin-section');
  adminSection.style.display = 'block';
  
  // Generar contenido
  adminSection.querySelector('.card-body').innerHTML = `
    <div class="mb-4">
      <h4>Control de Inventario</h4>
      <p>Desde esta sección puede agregar, editar o eliminar elementos del inventario.</p>
    </div>
    
    <!-- Botones de acción -->
    <div class="mb-4">
      <button class="btn btn-success me-2" onclick="mostrarFormularioNuevoElemento()">Agregar nuevo elemento</button>
      <button class="btn btn-danger me-2" onclick="confirmarEliminarElemento()">Eliminar elemento</button>
      <button class="btn btn-warning" onclick="mostrarFormularioEditarElemento()">Editar elemento existente</button>
    </div>
    
    <!-- Listado de inventario -->
    <div class="mt-4">
      <h5>Inventario actual</h5>
      <div class="accordion" id="accordion-inventario">
        ${generarAcordeonInventario()}
      </div>
    </div>
    
    <!-- Formulario para nuevo elemento (oculto por defecto) -->
    <div id="nuevo-elemento-form" class="mt-4 p-3 border rounded" style="display: none;">
      <h5>Agregar nuevo elemento</h5>
      <form id="form-nuevo-elemento">
        <div class="row">
          <div class="col-md-6 mb-3">
            <label for="nuevo-codigo" class="form-label">Código:</label>
            <input type="text" class="form-control" id="nuevo-codigo" required>
          </div>
          <div class="col-md-6 mb-3">
            <label for="nuevo-nombre" class="form-label">Nombre:</label>
            <input type="text" class="form-control" id="nuevo-nombre" required>
          </div>
          <div class="col-md-6 mb-3">
            <label for="nuevo-categoria" class="form-label">Categoría:</label>
            <select class="form-select" id="nuevo-categoria" required>
              <option value="">Seleccione una categoría</option>
              ${INVENTARIO.map(cat => `<option value="${cat.categoria}">${cat.categoria}</option>`).join('')}
            </select>
          </div>
          <div class="col-md-6 mb-3">
            <label for="nuevo-cantidad" class="form-label">Cantidad:</label>
            <input type="number" class="form-control" id="nuevo-cantidad" min="0" value="1" required>
          </div>
          <div class="col-md-6 mb-3">
            <label for="nuevo-ubicacion" class="form-label">Ubicación:</label>
            <input type="text" class="form-control" id="nuevo-ubicacion">
          </div>
          <div class="col-12 mb-3">
            <label for="nuevo-descripcion" class="form-label">Descripción:</label>
            <textarea class="form-control" id="nuevo-descripcion" rows="3"></textarea>
          </div>
        </div>
        <div class="d-flex justify-content-end">
          <button type="button" class="btn btn-secondary me-2" onclick="ocultarFormularioNuevoElemento()">Cancelar</button>
          <button type="button" class="btn btn-success" onclick="agregarNuevoElemento()">Guardar elemento</button>
        </div>
      </form>
    </div>
  `;
}

// Generar acordeón para el inventario
function generarAcordeonInventario() {
  let html = '';
  
  INVENTARIO.forEach((categoria, index) => {
    html += `
      <div class="accordion-item">
        <h2 class="accordion-header" id="heading-${index}">
          <button class="accordion-button ${index === 0 ? '' : 'collapsed'}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${index}" aria-expanded="${index === 0 ? 'true' : 'false'}" aria-controls="collapse-${index}">
            ${categoria.categoria} (${categoria.elementos.length} elementos)
          </button>
        </h2>
        <div id="collapse-${index}" class="accordion-collapse collapse ${index === 0 ? 'show' : ''}" aria-labelledby="heading-${index}">
          <div class="accordion-body">
            <div class="table-responsive">
              <table class="table table-sm table-hover">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Cantidad</th>
                    <th>Ubicación</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  ${categoria.elementos.map(elem => `
                    <tr>
                      <td>${elem.id}</td>
                      <td>${elem.nombre}</td>
                      <td>${elem.cantidad}</td>
                      <td>${elem.ubicacion || 'No especificada'}</td>
                      <td>
                        <button class="btn btn-sm btn-warning me-1" onclick="editarElemento(${elem.id})">Editar</button>
                        <button class="btn btn-sm btn-danger" onclick="eliminarElemento(${elem.id})">Eliminar</button>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  
  return html;
}

// Mostrar formulario para agregar nuevo elemento
function mostrarFormularioNuevoElemento() {
  document.getElementById('nuevo-elemento-form').style.display = 'block';
  
  // Scroll hasta el formulario
  document.getElementById('nuevo-elemento-form').scrollIntoView({ behavior: 'smooth' });
}

// Ocultar formulario de nuevo elemento
function ocultarFormularioNuevoElemento() {
  document.getElementById('nuevo-elemento-form').style.display = 'none';
}

// Agregar un nuevo elemento al inventario
function agregarNuevoElemento() {
  const codigo = document.getElementById('nuevo-codigo').value;
  const nombre = document.getElementById('nuevo-nombre').value;
  const categoriaNombre = document.getElementById('nuevo-categoria').value;
  const cantidad = parseInt(document.getElementById('nuevo-cantidad').value);
  const ubicacion = document.getElementById('nuevo-ubicacion').value;
  const descripcion = document.getElementById('nuevo-descripcion').value;
  
  // Validaciones básicas
  if (!codigo || !nombre || !categoriaNombre || isNaN(cantidad)) {
    mostrarNotificacion('Error', 'Todos los campos marcados son obligatorios', 'error');
    return;
  }
  
  // Encontrar la categoría
  const categoria = INVENTARIO.find(cat => cat.categoria === categoriaNombre);
  if (!categoria) {
    mostrarNotificacion('Error', 'Categoría no encontrada', 'error');
    return;
  }
  
  // Crear nuevo elemento
  const nuevoElemento = {
    id: Date.now(), // ID temporal (en un sistema real sería asignado por la BD)
    nombre: nombre,
    descripcion: descripcion,
    cantidad: cantidad,
    ubicacion: ubicacion
  };
  
  // Agregar a la categoría
  categoria.elementos.push(nuevoElemento);
  
  // Actualizar interfaz
  mostrarNotificacion('Éxito', 'Elemento agregado correctamente', 'success');
  
  // Ocultar formulario y recargar administración
  ocultarFormularioNuevoElemento();
  administrarInventario();
}

// Editar elemento existente
function editarElemento(elementoId) {
  mostrarNotificacion('Información', 'Función de edición en desarrollo', 'info');
  // Esta funcionalidad se implementará en la siguiente fase
}

// Eliminar elemento
function eliminarElemento(elementoId) {
  const confirmacion = confirm(`¿Estás seguro de eliminar este elemento? Esta acción no se puede deshacer.`);
  
  if (confirmacion) {
    // Buscar elemento
    let eliminado = false;
    
    INVENTARIO.forEach(categoria => {
      const index = categoria.elementos.findIndex(elem => elem.id === elementoId);
      if (index !== -1) {
        categoria.elementos.splice(index, 1);
        eliminado = true;
      }
    });
    
    if (eliminado) {
      mostrarNotificacion('Éxito', 'Elemento eliminado correctamente', 'success');
      administrarInventario(); // Recargar para ver cambios
    } else {
      mostrarNotificacion('Error', 'No se pudo encontrar el elemento', 'error');
    }
  }
}

// Confirmar eliminación de elemento
function confirmarEliminarElemento() {
  mostrarNotificacion('Información', 'Seleccione el elemento que desea eliminar en la lista de inventario', 'info');
}

// Confirmar volver a interfaz principal
function confirmarVolverAInterfaz() {
  const confirmacion = confirm('¿Estás seguro que deseas volver a la interfaz principal?');
  if (confirmacion) {
    // Eliminar sección de inventario si existe
    const inventarioSection = document.getElementById('inventario-section');
    if (inventarioSection) {
      inventarioSection.remove();
    }
    
    // Eliminar sección de préstamos si existe
    const prestamosSection = document.getElementById('prestamos-section');
    if (prestamosSection) {
      prestamosSection.remove();
    }
    
    volverAInterfazPrincipal();
  }
}

// Consultar préstamos (laboratorista y docente)
function consultarPrestamos() {
  // Ocultar la interfaz principal
  document.getElementById('interface').style.display = 'none';
  
  // Crear y mostrar la sección de consulta de préstamos
  const prestamosSection = document.createElement('section');
  prestamosSection.id = 'prestamos-section';
  prestamosSection.className = 'my-5';
  
  // Recuperar préstamos (simulación usando localStorage)
  const prestamos = JSON.parse(localStorage.getItem('prestamos') || '[]');
  
  // Estructura del contenido
  prestamosSection.innerHTML = `
    <div class="card shadow">
      <div class="card-header bg-info text-white d-flex justify-content-between align-items-center">
        <h3>Consulta de Préstamos</h3>
        <button class="btn btn-sm btn-light" onclick="confirmarVolverAInterfaz()">Volver</button>
      </div>
      <div class="card-body">
        <!-- Filtros -->
        <div class="mb-4">
          <div class="row">
            <div class="col-md-4 mb-3">
              <label for="filtro-estado" class="form-label">Filtrar por estado:</label>
              <select class="form-select" id="filtro-estado">
                <option value="">Todos los estados</option>
                <option value="prestado">Prestado</option>
                <option value="devuelto">Devuelto</option>
              </select>
            </div>
            <div class="col-md-4 mb-3">
              <label for="filtro-usuario" class="form-label">Buscar por usuario:</label>
              <input type="text" class="form-control" id="filtro-usuario" placeholder="Nombre del usuario">
            </div>
            <div class="col-md-4 mb-3 d-flex align-items-end">
              <button class="btn btn-primary w-100" onclick="filtrarPrestamos()">Filtrar</button>
            </div>
          </div>
        </div>
        
        <!-- Tabla de préstamos -->
        ${prestamos.length > 0 ? `
          <div class="table-responsive">
            <table class="table table-striped table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Elemento</th>
                  <th>Cantidad</th>
                  <th>Usuario</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody id="prestamos-tbody">
                ${generarFilasPrestamos(prestamos)}
              </tbody>
            </table>
          </div>
        ` : `
          <div class="alert alert-info">
            No hay préstamos registrados en el sistema.
          </div>
        `}
      </div>
    </div>
  `;
  
  // Agregar a la página
  document.getElementById('interface').insertAdjacentElement('afterend', prestamosSection);
  
  // Agregar eventos
  const filtroEstado = document.getElementById('filtro-estado');
  const filtroUsuario = document.getElementById('filtro-usuario');
  
  if (filtroEstado && filtroUsuario) {
    filtroEstado.addEventListener('change', filtrarPrestamos);
    filtroUsuario.addEventListener('input', filtrarPrestamos);
  }
  
  // Mostrar la sección
  prestamosSection.style.display = 'block';
}

// Generar filas para la tabla de préstamos
function generarFilasPrestamos(prestamos, filtroEstado = '', filtroUsuario = '') {
  let html = '';
  let prestamosFiltered = [];
  
  // Aplicar filtros
  prestamosFiltered = prestamos.filter(prestamo => {
    const matchEstado = !filtroEstado || prestamo.estado === filtroEstado;
    const matchUsuario = !filtroUsuario || 
      prestamo.usuario_nombre.toLowerCase().includes(filtroUsuario.toLowerCase());
    return matchEstado && matchUsuario;
  });
  
  // Generar filas
  if (prestamosFiltered.length > 0) {
    prestamosFiltered.forEach(prestamo => {
      html += `
        <tr>
          <td>${prestamo.id}</td>
          <td>${prestamo.elemento_nombre}</td>
          <td>${prestamo.cantidad}</td>
          <td>${prestamo.usuario_nombre}</td>
          <td>${prestamo.fecha}</td>
          <td>
            <span class="badge ${prestamo.estado === 'prestado' ? 'bg-warning' : 'bg-success'}">
              ${prestamo.estado}
            </span>
          </td>
          <td>
            ${prestamo.estado === 'prestado' ? 
              `<button class="btn btn-sm btn-success" onclick="registrarDevolucion(${prestamo.id})">
                Registrar devolución
              </button>` : 
              `<button class="btn btn-sm btn-secondary" disabled>Devuelto</button>`
            }
          </td>
        </tr>
      `;
    });
  } else {
    html = `<tr><td colspan="7" class="text-center">No se encontraron préstamos que coincidan con los filtros</td></tr>`;
  }
  
  return html;
}

// Filtrar préstamos según los criterios
function filtrarPrestamos() {
  const filtroEstado = document.getElementById('filtro-estado').value;
  const filtroUsuario = document.getElementById('filtro-usuario').value;
  
  const prestamos = JSON.parse(localStorage.getItem('prestamos') || '[]');
  const tbody = document.getElementById('prestamos-tbody');
  
  if (tbody) {
    tbody.innerHTML = generarFilasPrestamos(prestamos, filtroEstado, filtroUsuario);
  }
}

// Registrar devolución de un elemento
function registrarDevolucion(prestamoId) {
  const confirmacion = confirm('¿Confirma la devolución de este elemento?');
  
  if (confirmacion) {
    // Recuperar préstamos
    let prestamos = JSON.parse(localStorage.getItem('prestamos') || '[]');
    const index = prestamos.findIndex(p => p.id === prestamoId);
    
    if (index !== -1) {
      const prestamo = prestamos[index];
      
      // Actualizar estado del préstamo
      prestamo.estado = 'devuelto';
      prestamo.fecha_devolucion = new Date().toLocaleString();
      prestamos[index] = prestamo;
      
      // Actualizar inventario: devolver la cantidad al stock disponible
      INVENTARIO.forEach(categoria => {
        const elemento = categoria.elementos.find(e => e.id === prestamo.elemento_id);
        if (elemento) {
          elemento.cantidad += prestamo.cantidad;
        }
      });
      
      // Guardar cambios
      localStorage.setItem('prestamos', JSON.stringify(prestamos));
      
      // Mostrar confirmación
      mostrarNotificacion('Éxito', 'Elemento devuelto correctamente', 'success');
      
      // Actualizar la vista de préstamos
      consultarPrestamos();
    } else {
      mostrarNotificacion('Error', 'No se pudo encontrar el préstamo', 'error');
    }
  }
}

// Volver a la interfaz principal desde cualquier módulo
function volverAInterfazPrincipal() {
  const confirmacion = confirm('¿Estás seguro que deseas volver a la página principal?');
  
  if (confirmacion) {
    // Ocultar todas las secciones
    document.getElementById('prestamo-section').style.display = 'none';
    document.getElementById('admin-section').style.display = 'none';
    
    // Eliminar sección de inventario si existe
    const inventarioSection = document.getElementById('inventario-section');
    if (inventarioSection) {
      inventarioSection.remove();
    }
    
    // Eliminar sección de préstamos si existe
    const prestamosSection = document.getElementById('prestamos-section');
    if (prestamosSection) {
      prestamosSection.remove();
    }
    
    // Mostrar la interfaz principal
    document.getElementById('interface').style.display = 'block';
  }
}

// Cargar categorías desde la API
async function cargarCategorias() {
  try {
    // Usar datos del archivo data.js por ahora, luego se conectará a la API
    const categoriaSelect = document.getElementById('categoria-select');
    categoriaSelect.innerHTML = '<option value="">Selecciona una categoría</option>';
    
    INVENTARIO.forEach(categoria => {
      const option = document.createElement('option');
      option.value = categoria.categoria;
      option.textContent = categoria.categoria;
      categoriaSelect.appendChild(option);
    });
    
    // Rehabilitar el select
    categoriaSelect.disabled = false;
    
  } catch (error) {
    console.error('Error al cargar categorías:', error);
    mostrarNotificacion('Error', 'No se pudieron cargar las categorías', 'error');
  }
}

// Manejar selección de categoría
function onCategoriaSeleccionada(event) {
  const categoriaNombre = event.target.value;
  
  if (!categoriaNombre) {
    // Limpiar y deshabilitar elementos dependientes
    const elementoSelect = document.getElementById('elemento-select');
    elementoSelect.innerHTML = '<option value="">Selecciona un elemento</option>';
    elementoSelect.disabled = true;
    document.getElementById('cantidad-input').disabled = true;
    document.getElementById('prestamo-btn').disabled = true;
    return;
  }
  
  // Encontrar la categoría seleccionada en los datos locales
  categoriaSeleccionada = INVENTARIO.find(cat => cat.categoria === categoriaNombre);
  
  // Cargar elementos de esa categoría
  cargarElementosPorCategoria(categoriaSeleccionada);
}

// Cargar elementos por categoría
function cargarElementosPorCategoria(categoria) {
  try {
    const elementoSelect = document.getElementById('elemento-select');
    elementoSelect.innerHTML = '<option value="">Selecciona un elemento</option>';
    
    categoria.elementos.forEach(elemento => {
      const option = document.createElement('option');
      option.value = elemento.nombre;
      option.textContent = `${elemento.nombre} (Disponible: ${elemento.cantidad})`;
      option.disabled = elemento.cantidad <= 0;
      elementoSelect.appendChild(option);
    });
    
    // Habilitar el select
    elementoSelect.disabled = false;
    
  } catch (error) {
    console.error('Error al cargar elementos:', error);
    mostrarNotificacion('Error', 'No se pudieron cargar los elementos', 'error');
  }
}

// Manejar selección de elemento
function onElementoSeleccionado(event) {
  const elementoNombre = event.target.value;
  
  if (!elementoNombre) {
    // Limpiar y deshabilitar elementos dependientes
    document.getElementById('cantidad-input').disabled = true;
    document.getElementById('prestamo-btn').disabled = true;
    document.getElementById('elemento-detalles').innerHTML = '<p class="text-muted">Selecciona un elemento para ver sus detalles</p>';
    return;
  }
  
  // Encontrar el elemento seleccionado
  elementoSeleccionado = categoriaSeleccionada.elementos.find(elem => elem.nombre === elementoNombre);
  
  // Mostrar detalles del elemento
  mostrarDetallesElemento(elementoSeleccionado);
  
  // Habilitar campos dependientes
  const cantidadInput = document.getElementById('cantidad-input');
  cantidadInput.disabled = false;
  cantidadInput.max = elementoSeleccionado.cantidad;
  cantidadInput.value = 1;
  
  document.getElementById('prestamo-btn').disabled = false;
}

// Mostrar detalles del elemento seleccionado
function mostrarDetallesElemento(elemento) {
  const detallesContainer = document.getElementById('elemento-detalles');
  
  // En un sistema real, esto podría incluir más información desde la base de datos
  detallesContainer.innerHTML = `
    <div class="row">
      <div class="col-md-6">
        <p><strong>Nombre:</strong> ${elemento.nombre}</p>
        <p><strong>Disponibles:</strong> ${elemento.cantidad}</p>
      </div>
    </div>
  `;
  
  // Mostrar imagen del elemento (o placeholder si no hay imagen)
  const imagenContainer = document.getElementById('elemento-imagen');
  imagenContainer.innerHTML = `<img src="/img/placeholder.svg" alt="${elemento.nombre}" class="img-fluid" />`;
}

// Realizar préstamo del elemento
function realizarPrestamo() {
  const cantidadInput = document.getElementById('cantidad-input');
  const cantidad = parseInt(cantidadInput.value);
  
  if (isNaN(cantidad) || cantidad <= 0) {
    mostrarNotificacion('Error', 'La cantidad debe ser un número positivo', 'error');
    return;
  }
  
  if (cantidad > elementoSeleccionado.cantidad) {
    mostrarNotificacion('Error', 'No hay suficientes unidades disponibles', 'error');
    return;
  }
  
  // Confirmar el préstamo
  const confirmacion = confirm(`¿Confirma el préstamo de ${cantidad} unidad(es) de ${elementoSeleccionado.nombre}?`);
  
  if (confirmacion) {
    // Simular préstamo (en un sistema real, se usaría la API)
    // Actualizar cantidad disponible en tiempo real
    elementoSeleccionado.cantidad -= cantidad;
    
    // Registrar el préstamo (en un sistema real, se almacenaría en la BD)
    const prestamo = {
      id: Date.now(),
      elemento_id: elementoSeleccionado.id,
      elemento_nombre: elementoSeleccionado.nombre,
      cantidad: cantidad,
      fecha: new Date().toLocaleString(),
      usuario_id: currentUser.id,
      usuario_nombre: currentUser.nombre,
      estado: 'prestado'
    };
    
    // Almacenar préstamo en localStorage para simular persistencia
    // En un sistema real, esto se enviaría al servidor
    let prestamos = JSON.parse(localStorage.getItem('prestamos') || '[]');
    prestamos.push(prestamo);
    localStorage.setItem('prestamos', JSON.stringify(prestamos));
    
    // Mostrar confirmación con detalles del préstamo
    mostrarNotificacion('Éxito', `Se ha registrado el préstamo de ${cantidad} unidad(es) de ${elementoSeleccionado.nombre} a nombre de ${currentUser.nombre}`, 'success');
    
    // Volver a la interfaz principal con confirmación
    volverAInterfazPrincipal();
  }
}

// Mostrar notificación al usuario
function mostrarNotificacion(titulo, mensaje, tipo = 'info') {
  // Por ahora, usamos alert simple en vez de Toast de Bootstrap
  alert(`${titulo}: ${mensaje}`);
}
