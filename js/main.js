// Variables globales
let currentUser = {
  id: null,
  tipo: null,
  nombre: null
};

let currentUserType = null;
let elementoSeleccionado = null;
let categoriaSeleccionada = null;
let currentLaboratory = null;
let INVENTARIO = [];
let tipoReporteActual = '';
let ultimosDataReporte = null;

// Objeto para almacenar los PINes de docentes y laboratoristas
const PINES = {
  'docente': 'DOC1234',
  'laboratorista': 'LAB5678'
};

// Función para determinar la clase CSS según el estado de devolución
function getEstadoObservacionClass(observacion) {
  const observacionesProblematicas = [
    'No funciona / presenta fallas',
    'Faltan accesorios / partes incompletas',
    'Daños visibles (físicos)',
    'Requiere mantenimiento / calibración',
    'Contaminado / sucio',
    'Pendiente por revisión técnica',
    'Reportado como defectuoso por el usuario'
  ];
  
  const observacionesNeutrales = [
    'No fue utilizado',
    'No requiere devolución'
  ];
  
  if (observacion === 'Funciona correctamente') {
    return 'text-success';
  } else if (observacionesProblematicas.includes(observacion)) {
    return 'text-danger';
  } else if (observacionesNeutrales.includes(observacion)) {
    return 'text-muted';
  } else {
    return 'text-dark';
  }
}

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', async function() {
  console.log('Aplicación de Gestión de Laboratorio iniciada');
  
  // Inicializar elementos interactivos
  initEventListeners();
  
  // Inicializar notificaciones con Bootstrap
  initNotifications();
  
  // Inicializar modales personalizados
  initCustomModals();
  
  // Mostrar directamente la selección de usuario
  document.getElementById('user-selection').style.display = 'block';
  
  // Cargar el inventario desde la base de datos en segundo plano
  try {
    console.log('Cargando inventario...');
    INVENTARIO = await cargarInventarioDesdeDB();
    console.log(`Inventario cargado: ${INVENTARIO.length} categorías`);
  } catch (error) {
    console.error('Error al cargar el inventario:', error);
    mostrarNotificacion('Error', 'Hubo un problema al cargar el inventario.', 'error', 5000);
  }
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
  
  // Eventos de tecla Enter para el formulario de autenticación
  const authForm = document.getElementById('auth-form');
  if (authForm) {
    authForm.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        autenticarUsuario();
      }
    });
  }
}

// Inicializar notificaciones
function initNotifications() {
  // Bootstrap ya maneja esto automáticamente
}

// Función para alternar input de "otro docente"
function toggleOtroDocenteInput() {
  const selectDocente = document.getElementById('estudiante-docente');
  const otroDocenteDiv = document.getElementById('otro-docente-group');
  
  if (selectDocente && otroDocenteDiv) {
    if (selectDocente.value === 'Otro') {
      otroDocenteDiv.style.display = 'block';
    } else {
      otroDocenteDiv.style.display = 'none';
    }
  }
}

// Función para alternar input de "otra materia"
function toggleOtraMateriaInput() {
  const selectMateria = document.getElementById('estudiante-materia');
  const otraMateriaDiv = document.getElementById('otra-materia-group');
  
  if (selectMateria && otraMateriaDiv) {
    if (selectMateria.value === 'Otra') {
      otraMateriaDiv.style.display = 'block';
    } else {
      otraMateriaDiv.style.display = 'none';
    }
  }
}

// Configuración inicial del laboratorio
function configureDefaultLaboratory() {
  currentLaboratory = 'biomedica';
  mostrarNotificacion('Laboratorio seleccionado', `Laboratorio de Ingeniería Biomédica - Sede Jardín`, 'info');
}

// Selección inicial del tipo de usuario
function selectUserType(tipo) {
  currentUser.tipo = tipo;
  currentUserType = tipo;
  
  // Ocultar selección de usuario
  document.getElementById('user-selection').style.display = 'none';
  
  // Mostrar formulario de autenticación
  const authSection = document.getElementById('auth-section');
  authSection.style.display = 'block';
  
  // Configurar según tipo de usuario
  const pinGroup = document.getElementById('pin-group');
  const estudianteFields = document.getElementById('estudiante-fields');
  const nombreGroup = document.getElementById('nombre-group');
  
  // Título dinámico de autenticación según el tipo de usuario
  const authTitle = document.querySelector('#auth-section h3');
  if (authTitle) {
    if (tipo === 'estudiante') {
      authTitle.textContent = 'Datos del Estudiante';
    } else if (tipo === 'docente') {
      authTitle.textContent = 'Acceso para Docentes';
    } else if (tipo === 'laboratorista') {
      authTitle.textContent = 'Acceso para Laboratoristas';
    }
  }
  
  // Configurar campos según el tipo de usuario
  if (tipo === 'estudiante') {
    // Mostrar campos específicos de estudiante
    if (estudianteFields) estudianteFields.style.display = 'block';
    if (nombreGroup) nombreGroup.style.display = 'block';
    if (pinGroup) pinGroup.style.display = 'none';
    
    // Configurar eventos para los selectores
    setTimeout(() => {
      const docenteSelect = document.getElementById('estudiante-docente');
      if (docenteSelect) {
        docenteSelect.addEventListener('change', toggleOtroDocenteInput);
      }
      
      const materiaSelect = document.getElementById('estudiante-materia');
      if (materiaSelect) {
        materiaSelect.addEventListener('change', toggleOtraMateriaInput);
      }
      
      // Configurar eventos de autocompletado
      configurarEventosAutocompletado();
    }, 100);
  } else {
    // Para docentes y laboratoristas
    if (estudianteFields) estudianteFields.style.display = 'none';
    if (nombreGroup) nombreGroup.style.display = 'block';
    if (pinGroup) pinGroup.style.display = 'block';
    
    // Limpiar PIN al cambiar de tipo
    const pinInput = document.getElementById('user-pin');
    if (pinInput) pinInput.value = '';
    
    // Configurar lista desplegable para docentes
    if (tipo === 'docente') {
      const docenteContainer = document.getElementById('docente-select-container');
      const userNameField = document.getElementById('user-name');
      
      if (docenteContainer) docenteContainer.style.display = 'block';
      if (userNameField) userNameField.style.display = 'none';
      
      const docenteSelect = document.getElementById('docente-select');
      if (docenteSelect) {
        docenteSelect.addEventListener('change', function() {
          const otroDocenteGroup = document.getElementById('otro-docente-nombre-group');
          if (otroDocenteGroup) {
            otroDocenteGroup.style.display = (this.value === 'Otro') ? 'block' : 'none';
          }
        });
      }
    } else if (tipo === 'laboratorista') {
      const docenteContainer = document.getElementById('docente-select-container');
      const labContainer = document.getElementById('laboratorista-select-container');
      const userNameField = document.getElementById('user-name');
      
      if (docenteContainer) docenteContainer.style.display = 'none';
      if (labContainer) labContainer.style.display = 'block';
      if (userNameField) userNameField.style.display = 'none';
    }
  }
}

// Autenticar al usuario según su tipo
function autenticarUsuario() {
  let nombre = '';
  
  // Obtener el nombre según el tipo de usuario
  if (currentUser.tipo === 'laboratorista') {
    const laboratoristaSelect = document.getElementById('laboratorista-select');
    if (laboratoristaSelect) {
      nombre = laboratoristaSelect.value;
    }
  } else if (currentUser.tipo === 'docente') {
    const docenteSelect = document.getElementById('docente-select');
    if (docenteSelect) {
      nombre = docenteSelect.value;
      
      if (nombre === 'Otro') {
        const otroNombre = document.getElementById('otro-docente-nombre');
        if (otroNombre) {
          nombre = otroNombre.value.trim();
        }
      }
    }
  } else if (currentUser.tipo === 'estudiante') {
    const userNameInput = document.getElementById('user-name');
    if (userNameInput) {
      nombre = userNameInput.value.trim();
    }
  }
  
  // Validaciones básicas
  if (!nombre) {
    mostrarNotificacion('Error', 'Por favor ingrese su nombre completo', 'error');
    return;
  }
  
  // Validar PIN para docentes y laboratoristas
  if (currentUser.tipo !== 'estudiante') {
    const pinInput = document.getElementById('user-pin');
    const pin = pinInput ? pinInput.value.trim() : '';
    
    if (!pin) {
      mostrarNotificacion('Error', 'Por favor ingrese su PIN', 'error');
      return;
    }
    
    const expectedPin = PINES[currentUser.tipo];
    console.log(`Validando PIN para ${currentUser.tipo}: ingresado="${pin}", esperado="${expectedPin}"`);
    
    if (pin !== expectedPin) {
      mostrarNotificacion('Error', `PIN incorrecto. Use ${expectedPin} para ${currentUser.tipo}`, 'error');
      return;
    }
  }
  
  // Guardar datos del usuario
  currentUser.nombre = nombre;
  currentUser.id = Date.now();
  
  // Procesar datos adicionales para estudiantes
  if (currentUser.tipo === 'estudiante') {
    const estudianteId = document.getElementById('estudiante-id')?.value.trim();
    const estudianteCorreo = document.getElementById('estudiante-correo')?.value.trim();
    const docenteSelect = document.getElementById('estudiante-docente');
    const materiaSelect = document.getElementById('estudiante-materia');
    
    let docente = docenteSelect ? docenteSelect.value : '';
    let materia = materiaSelect ? materiaSelect.value : '';
    
    if (docente === 'Otro') {
      const otroDocente = document.getElementById('otro-docente');
      docente = otroDocente ? otroDocente.value.trim() : '';
    }
    
    if (materia === 'Otra') {
      const otraMateria = document.getElementById('otra-materia');
      materia = otraMateria ? otraMateria.value.trim() : '';
    }
    
    // Validaciones para estudiantes
    if (!estudianteId) {
      mostrarNotificacion('Error', 'Por favor ingrese su ID de estudiante', 'error');
      return;
    }
    
    if (!estudianteCorreo) {
      mostrarNotificacion('Error', 'Por favor busque su ID para autocompletar el correo', 'error');
      return;
    }
    
    currentUser.id_estudiante = estudianteId;
    currentUser.correo = estudianteCorreo;
    currentUser.docente = docente;
    currentUser.materia = materia;
  }
  
  // Cargar la interfaz principal
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
  
  // Interfaz para Estudiante
  if (currentUser.tipo === 'estudiante') {
    contenido = `
      <div class="panel-container">
        <div class="panel-header">
          <h2 class="panel-title">BIENVENIDO <span class="user-name">${currentUser.nombre.toUpperCase()}</span></h2>
          <p class="panel-subtitle">Panel de Estudiante - Puedes solicitar préstamos de elementos</p>
        </div>
        <div class="panel-content">
          <div class="row">
            <div class="col-md-6 mb-3">
              <div class="panel-module">
                <h3 class="module-title">PRÉSTAMO DE ELEMENTOS</h3>
                <p class="module-desc">Solicita elementos para tus prácticas</p>
                <button class="btn btn-green" onclick="iniciarPrestamo()">PRESTAR ELEMENTOS</button>
              </div>
            </div>
            <div class="col-md-6 mb-3">
              <div class="panel-module">
                <h3 class="module-title">CONSULTA DE PRÉSTAMOS</h3>
                <p class="module-desc">Ver elementos que tienes prestados</p>
                <button class="btn btn-outline-light" onclick="iniciarRetorno()">VER PRÉSTAMOS</button>
              </div>
            </div>
          </div>
        </div>
        <div class="panel-nav">
          <button class="btn btn-sm btn-outline-light mt-3" onclick="volverASeleccionUsuario()">Volver a selección</button>
        </div>
      </div>
    `;
  } 
  // Interfaz para Docente
  else if (currentUser.tipo === 'docente') {
    contenido = `
      <div class="panel-container">
        <div class="panel-header">
          <h2 class="panel-title">BIENVENIDO <span class="user-name">${currentUser.nombre.toUpperCase()}</span></h2>
          <p class="panel-subtitle">Panel de Docente - Gestión de elementos y préstamos</p>
        </div>
        <div class="panel-content">
          <div class="row">
            <div class="col-md-4 mb-3">
              <div class="panel-module">
                <h3 class="module-title">PRÉSTAMO DE ELEMENTOS</h3>
                <p class="module-desc">Solicita elementos para tus clases</p>
                <button class="btn btn-green" onclick="iniciarPrestamo()">PRESTAR ELEMENTOS</button>
              </div>
            </div>
            <div class="col-md-4 mb-3">
              <div class="panel-module">
                <h3 class="module-title">CONSULTA DE PRÉSTAMOS</h3>
                <p class="module-desc">Ver elementos que tienes prestados</p>
                <button class="btn btn-outline-light" onclick="iniciarRetorno()">VER PRÉSTAMOS</button>
              </div>
            </div>
            <div class="col-md-4 mb-3">
              <div class="panel-module">
                <h3 class="module-title">CONSULTA DE INVENTARIO</h3>
                <p class="module-desc">Revisar disponibilidad actual</p>
                <button class="btn btn-outline-light" onclick="consultarInventario()">VER INVENTARIO</button>
              </div>
            </div>
          </div>
        </div>
        <div class="panel-nav">
          <button class="btn btn-sm btn-outline-light mt-3" onclick="volverASeleccionUsuario()">Volver a selección</button>
        </div>
      </div>
    `;
  }
  // Interfaz para Laboratorista
  else if (currentUser.tipo === 'laboratorista') {
    contenido = `
      <div class="panel-container">
        <div class="panel-header">
          <h2 class="panel-title">BIENVENIDO <span class="user-name">${currentUser.nombre.toUpperCase()}</span></h2>
          <p class="panel-subtitle">Panel de Laboratorista - Control total del sistema</p>
        </div>
        <div class="panel-content">
          <div class="row">
            <div class="col-md-3 mb-3">
              <div class="panel-module">
                <h3 class="module-title">PRÉSTAMO DE ELEMENTOS</h3>
                <p class="module-desc">Gestionar préstamos</p>
                <button class="btn btn-green" onclick="iniciarPrestamo()">PRESTAR ELEMENTOS</button>
              </div>
            </div>
            <div class="col-md-3 mb-3">
              <div class="panel-module">
                <h3 class="module-title">DEVOLUCIÓN DE ELEMENTOS</h3>
                <p class="module-desc">Procesar devoluciones</p>
                <button class="btn btn-outline-light" onclick="iniciarRetorno()">PROCESAR DEVOLUCIONES</button>
              </div>
            </div>
            <div class="col-md-3 mb-3">
              <div class="panel-module">
                <h3 class="module-title">CONSULTA DE INVENTARIO</h3>
                <p class="module-desc">Ver inventario completo</p>
                <button class="btn btn-outline-light" onclick="consultarInventario()">VER INVENTARIO</button>
              </div>
            </div>
            <div class="col-md-3 mb-3">
              <div class="panel-module">
                <h3 class="module-title">ADMINISTRACIÓN</h3>
                <p class="module-desc">Gestionar elementos</p>
                <button class="btn btn-outline-light" onclick="administrarInventario()">ADMINISTRAR</button>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-md-12 mb-3">
              <div class="panel-module">
                <h3 class="module-title">REPORTES Y ESTADÍSTICAS</h3>
                <p class="module-desc">Generar reportes detallados del laboratorio</p>
                <button class="btn btn-success" onclick="mostrarModuloReportes()">GENERAR REPORTES</button>
              </div>
            </div>
          </div>
        </div>
        <div class="panel-nav">
          <button class="btn btn-sm btn-outline-light mt-3" onclick="volverASeleccionUsuario()">Volver a selección</button>
        </div>
      </div>
    `;
  }
  
  interfaz.innerHTML = contenido;
}

// Funciones de navegación básicas
function volverASeleccionUsuario() {
  // Ocultar todas las secciones
  document.getElementById('auth-section').style.display = 'none';
  document.getElementById('interface').style.display = 'none';
  
  // Mostrar selección de usuario
  document.getElementById('user-selection').style.display = 'block';
  
  // Resetear datos del usuario
  currentUser = { id: null, tipo: null, nombre: null };
  currentUserType = null;
}

function volverAInterfazPrincipal() {
  // Ocultar todas las secciones especiales
  const sections = ['prestamo-section', 'retorno-section', 'consulta-section', 'admin-section', 'reportes-section'];
  sections.forEach(sectionId => {
    const section = document.getElementById(sectionId);
    if (section) section.style.display = 'none';
  });
  
  // Mostrar interfaz principal
  document.getElementById('interface').style.display = 'block';
}

// Funciones de los módulos principales
function iniciarPrestamo() {
  // Ocultar interfaz principal
  document.getElementById('interface').style.display = 'none';
  
  // Mostrar sección de préstamo
  const prestamoSection = document.getElementById('prestamo-section');
  if (prestamoSection) {
    prestamoSection.style.display = 'block';
    cargarCategorias();
  } else {
    mostrarNotificacion('Error', 'Sección de préstamo no encontrada', 'error');
  }
}

function iniciarRetorno() {
  mostrarNotificacion('Retorno', 'Función de retorno disponible próximamente', 'info');
}

function consultarInventario() {
  // Ocultar interfaz principal
  document.getElementById('interface').style.display = 'none';
  
  // Mostrar sección de consulta
  const consultaSection = document.getElementById('consulta-section');
  if (consultaSection) {
    consultaSection.style.display = 'block';
    generarFilasInventario();
  } else {
    mostrarNotificacion('Info', 'Consultando inventario...', 'info');
  }
}

function administrarInventario() {
  mostrarNotificacion('Administración', 'Módulo de administración disponible próximamente', 'info');
}

function mostrarModuloReportes() {
  mostrarNotificacion('Reportes', 'Módulo de reportes disponible próximamente', 'info');
}

// Función para cargar categorías en préstamo
async function cargarCategorias() {
  try {
    const response = await fetch('/api/categorias');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Datos de categorías recibidos:', data);
    
    const categoriaSelect = document.getElementById('categoria-select');
    if (categoriaSelect) {
      categoriaSelect.innerHTML = '<option value="">Selecciona una categoría</option>';
      
      // Los datos vienen directamente como array
      if (Array.isArray(data)) {
        data.forEach(categoria => {
          const option = document.createElement('option');
          option.value = categoria.id;
          option.textContent = categoria.nombre;
          categoriaSelect.appendChild(option);
        });
        mostrarNotificacion('Éxito', `${data.length} categorías cargadas`, 'success', 2000);
      } else {
        throw new Error('Formato de datos incorrecto');
      }
    }
  } catch (error) {
    console.error('Error cargando categorías:', error);
    mostrarNotificacion('Error', `No se pudieron cargar las categorías: ${error.message}`, 'error', 5000);
  }
}

// Función básica para mostrar inventario
function generarFilasInventario() {
  mostrarNotificacion('Inventario', 'Cargando inventario...', 'info', 2000);
}

// Función para mostrar notificaciones
function mostrarNotificacion(titulo, mensaje, tipo = 'info', autoCloseMs = 0) {
  console.log(`${tipo.toUpperCase()}: ${titulo} - ${mensaje}`);
  
  // Remover notificaciones anteriores del mismo tipo
  const existingAlerts = document.querySelectorAll('.alert.position-fixed');
  existingAlerts.forEach(alert => alert.remove());
  
  // Crear elemento de notificación simple
  const notification = document.createElement('div');
  notification.className = `alert alert-${tipo === 'error' ? 'danger' : tipo === 'success' ? 'success' : tipo === 'warning' ? 'warning' : 'info'} alert-dismissible fade show position-fixed`;
  notification.style.top = '20px';
  notification.style.right = '20px';
  notification.style.zIndex = '9999';
  notification.style.minWidth = '300px';
  notification.style.maxWidth = '400px';
  
  notification.innerHTML = `
    <strong>${titulo}:</strong> ${mensaje}
    <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
  `;
  
  document.body.appendChild(notification);
  
  // Auto-cerrar si se especifica tiempo
  if (autoCloseMs > 0) {
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, autoCloseMs);
  }
  
  return {
    close: () => notification.remove()
  };
}

// Función para inicializar modales personalizados
function initCustomModals() {
  // Implementación básica de modales
}

// Función para configurar eventos de autocompletado
function configurarEventosAutocompletado() {
  const userIdInput = document.getElementById('estudiante-id');
  const userEmailInput = document.getElementById('estudiante-correo');
  const buscarBtn = document.getElementById('buscar-estudiante-btn');
  
  // Función para buscar estudiante
  async function buscarEstudiante(id) {
    if (!id || id.length < 3) return;
    
    try {
      console.log(`Buscando estudiante con ID: ${id}`);
      const response = await fetch(`/api/estudiante/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Respuesta del servidor:', data);
      
      // El endpoint /api/estudiante devuelve directamente los datos del estudiante
      if (data && data.nombre) {
        if (userEmailInput) {
          userEmailInput.value = data.correo || `${id.toLowerCase()}@unab.edu.co`;
        }
        
        // También actualizar el campo de nombre si existe
        const nombreInput = document.getElementById('user-name');
        if (nombreInput) {
          nombreInput.value = data.nombre;
        }
        
        mostrarNotificacion('Estudiante encontrado', `${data.nombre}`, 'success', 3000);
      } else {
        if (userEmailInput) {
          userEmailInput.value = '';
        }
        const nombreInput = document.getElementById('user-name');
        if (nombreInput) {
          nombreInput.value = '';
        }
        mostrarNotificacion('No encontrado', 'Estudiante no encontrado', 'warning', 3000);
      }
    } catch (error) {
      console.error('Error buscando estudiante:', error);
      mostrarNotificacion('Error', `Error al buscar estudiante: ${error.message}`, 'error', 3000);
    }
  }
  
  // Evento para input automático
  if (userIdInput) {
    userIdInput.addEventListener('input', async function() {
      const idValue = this.value.trim();
      if (idValue.length >= 6) {
        await buscarEstudiante(idValue);
      }
    });
  }
  
  // Evento para botón de búsqueda
  if (buscarBtn) {
    buscarBtn.addEventListener('click', async function() {
      const idValue = userIdInput ? userIdInput.value.trim() : '';
      if (idValue) {
        await buscarEstudiante(idValue);
      } else {
        mostrarNotificacion('Error', 'Ingrese un ID de estudiante', 'error');
      }
    });
  }
}

// Función para cargar inventario desde la base de datos
async function cargarInventarioDesdeDB() {
  try {
    const response = await fetch('/api/categorias');
    if (!response.ok) throw new Error('Error al cargar categorías');
    
    const data = await response.json();
    console.log('Categorías cargadas:', data);
    return data || [];
  } catch (error) {
    console.error('Error cargando inventario:', error);
    return [];
  }
}