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
  // Esta función será implementada más adelante
  mostrarNotificacion('Información', 'La funcionalidad de consulta de inventario estará disponible próximamente', 'info');
}

// Administrar inventario (solo laboratorista)
function administrarInventario() {
  // Esta función será implementada más adelante
  mostrarNotificacion('Información', 'La funcionalidad de administración de inventario estará disponible próximamente', 'info');
}

// Consultar préstamos (laboratorista y docente)
function consultarPrestamos() {
  // Esta función será implementada más adelante
  mostrarNotificacion('Información', 'La funcionalidad de consulta de préstamos estará disponible próximamente', 'info');
}

// Volver a la interfaz principal desde cualquier módulo
function volverAInterfazPrincipal() {
  // Ocultar todas las secciones
  document.getElementById('prestamo-section').style.display = 'none';
  document.getElementById('admin-section').style.display = 'none';
  
  // Mostrar la interfaz principal
  document.getElementById('interface').style.display = 'block';
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
  
  // Simular préstamo (en un sistema real, se usaría la API)
  // Actualizar cantidad disponible
  elementoSeleccionado.cantidad -= cantidad;
  
  // Mostrar confirmación
  mostrarNotificacion('Éxito', `Se ha prestado ${cantidad} unidad(es) de ${elementoSeleccionado.nombre}`, 'success');
  
  // Volver a la interfaz principal
  volverAInterfazPrincipal();
}

// Mostrar notificación al usuario
function mostrarNotificacion(titulo, mensaje, tipo = 'info') {
  // Por ahora, usamos alert simple en vez de Toast de Bootstrap
  alert(`${titulo}: ${mensaje}`);
}
