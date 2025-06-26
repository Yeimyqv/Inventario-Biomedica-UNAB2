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

// Variables de reportes
let tipoReporteActual = null;
let ultimosDataReporte = null;
let currentChart = null;

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
  // Ocultar la interfaz principal
  document.getElementById("interface").style.display = "none";
  
  // Crear o mostrar la sección de reportes
  let reportesSection = document.getElementById("reportes-section");
  
  if (!reportesSection) {
    reportesSection = document.createElement("div");
    reportesSection.id = "reportes-section";
    reportesSection.className = "container-fluid p-4";
    reportesSection.style.display = "none";
    
    // Configurar fechas por defecto para incluir todos los datos de prueba
    const fechaInicio = "2025-05-01";
    const fechaFin = "2025-06-30";
    
    reportesSection.innerHTML = `
      <div class="row mb-4">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center">
            <h2 class="text-light">MÓDULO DE REPORTES Y ESTADÍSTICAS</h2>
            <button class="btn btn-outline-light" onclick="volverAInterfazPrincipal()">
              Volver al panel principal
            </button>
          </div>
        </div>
      </div>
      
      <!-- Panel de filtros -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card bg-dark border-secondary">
            <div class="card-header">
              <h5 class="card-title mb-0">Filtros de Consulta</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-3 mb-3">
                  <label for="fecha-inicio-reporte" class="form-label">Fecha Inicio:</label>
                  <input type="date" class="form-control" id="fecha-inicio-reporte" value="${fechaInicio}">
                </div>
                <div class="col-md-3 mb-3">
                  <label for="fecha-fin-reporte" class="form-label">Fecha Fin:</label>
                  <input type="date" class="form-control" id="fecha-fin-reporte" value="${fechaFin}">
                </div>
                <div class="col-md-3 mb-3">
                  <label for="tipo-usuario-filtro" class="form-label">Tipo de Usuario:</label>
                  <select class="form-select" id="tipo-usuario-filtro">
                    <option value="">Todos</option>
                    <option value="estudiante">Estudiantes</option>
                    <option value="docente">Docentes</option>
                  </select>
                </div>
                <div class="col-md-3 mb-3">
                  <label for="materia-filtro" class="form-label">Materia:</label>
                  <select class="form-select" id="materia-filtro">
                    <option value="">Todas las materias</option>
                    <option value="Tele-Robótica">Tele-Robótica</option>
                    <option value="Instrumentación">Instrumentación</option>
                    <option value="Electrónica análoga">Electrónica análoga</option>
                    <option value="Electrónica de potencia">Electrónica de potencia</option>
                    <option value="Sistemas embebidos">Sistemas embebidos</option>
                    <option value="Sistemas digitales">Sistemas digitales</option>
                    <option value="Proyecto Integrador">Proyecto Integrador</option>
                    <option value="Proyecto de grado">Proyecto de grado</option>
                    <option value="Circuitos eléctricos">Circuitos eléctricos</option>
                    <option value="Biomecánica clínica">Biomecánica clínica</option>
                    <option value="Procesamiento de señales">Procesamiento de señales</option>
                  </select>
                </div>
              </div>
              <div class="row">
                <div class="col-md-4 mb-3">
                  <label for="buscar-estudiante" class="form-label">Buscar Estudiante:</label>
                  <input type="text" class="form-control" id="buscar-estudiante" placeholder="Nombre o identificación">
                </div>
                <div class="col-md-4 mb-3">
                  <label for="docente-filtro" class="form-label">Filtrar por Docente:</label>
                  <select class="form-select" id="docente-filtro">
                    <option value="">Todos los docentes</option>
                    <option value="Alejandro Arboleda Carvajal">Alejandro Arboleda Carvajal</option>
                    <option value="Carlos Julio Arizmendi Pereira">Carlos Julio Arizmendi Pereira</option>
                    <option value="Leidy Rocío Pico Martínez">Leidy Rocío Pico Martínez</option>
                    <option value="Luis Felipe Buitrago Castro">Luis Felipe Buitrago Castro</option>
                    <option value="Lusvin Javier Amado Forero">Lusvin Javier Amado Forero</option>
                    <option value="Mario Fernando Morales Cordero">Mario Fernando Morales Cordero</option>
                    <option value="Mateo Escobar Jaramillo">Mateo Escobar Jaramillo</option>
                    <option value="Nayibe Chio Cho">Nayibe Chio Cho</option>
                    <option value="Víctor Alfonso Solarte David">Víctor Alfonso Solarte David</option>
                    <option value="William Alexander Salamanca Becerra">William Alexander Salamanca Becerra</option>
                    <option value="Yeimy Liseth Quintana Villamizar">Yeimy Liseth Quintana Villamizar</option>
                  </select>
                </div>
                <div class="col-md-4 mb-3">
                  <label for="limite-productos" class="form-label">Límite de Productos:</label>
                  <select class="form-select" id="limite-productos">
                    <option value="5">Top 5</option>
                    <option value="10" selected>Top 10</option>
                    <option value="20">Top 20</option>
                    <option value="50">Top 50</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Botones de tipos de reporte -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="btn-group w-100" role="group">
            <button type="button" class="btn btn-success active" onclick="generarReportePrestamos()">
              Préstamos Realizados
            </button>
            <button type="button" class="btn btn-outline-success" onclick="generarReporteEstudiantes()">
              Ranking Estudiantes
            </button>
            <button type="button" class="btn btn-outline-success" onclick="generarReporteDocentes()">
              Ranking Docentes
            </button>
            <button type="button" class="btn btn-outline-success" onclick="generarReporteMaterias()">
              Ranking Materias
            </button>
            <button type="button" class="btn btn-outline-success" onclick="generarReporteProductos()">
              Productos Más Solicitados
            </button>
          </div>
        </div>
      </div>
      
      <!-- Contenido del reporte -->
      <div class="row">
        <div class="col-12">
          <div class="card bg-dark border-secondary">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="card-title mb-0" id="titulo-reporte">Reporte de Préstamos Realizados</h5>
              <div class="btn-group">
                <button class="btn btn-sm btn-outline-success" onclick="exportarReportePDF()">
                  PDF
                </button>
                <button class="btn btn-sm btn-outline-success" onclick="exportarReporteExcel()">
                  Excel
                </button>
              </div>
            </div>
            <div class="card-body">
              <div class="row mb-3">
                <div class="col-12">
                  <div class="btn-group" role="group" aria-label="Vista de reportes">
                    <button type="button" class="btn btn-outline-light me-2" id="btn-vista-tabla" onclick="cambiarVistaReporte('tabla')">
                      <i class="fas fa-table"></i> Tabla
                    </button>
                    
                    <!-- Controles de tipo de gráfico para otros reportes -->
                    <div class="btn-group" id="controles-tipo-grafico" style="display: none;">
                      <button type="button" class="btn btn-outline-light me-2" id="btn-vista-grafico-barras" onclick="cambiarVistaReporte('grafico-barras')">
                        <i class="fas fa-chart-bar"></i> Barras
                      </button>
                      <button type="button" class="btn btn-outline-light me-2" id="btn-vista-grafico-circular" onclick="cambiarVistaReporte('grafico-circular')">
                        <i class="fas fa-chart-pie"></i> Circular
                      </button>
                      <button type="button" class="btn btn-outline-light" id="btn-vista-ambos-graficos" onclick="cambiarVistaReporte('ambos-graficos')">
                        <i class="fas fa-columns"></i> Ambos
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="row">
                <div class="col-12" id="contenido-reporte-tabla">
                  <div class="text-center p-4">
                    <p class="text-muted">Seleccione un tipo de reporte para comenzar</p>
                  </div>
                </div>
                <div class="col-12" id="contenido-reporte-grafico" style="display: none;">
                  <div class="chart-container mt-4" id="chart-container" style="display: none; max-width: 300px; max-height: 200px; margin: 0 auto;">
                    <canvas id="chart-reporte" style="max-width: 100%; max-height: 100%;"></canvas>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(reportesSection);
  }
  
  // Mostrar la sección
  reportesSection.style.display = "block";
  
  // Configurar aplicación automática de filtros
  setTimeout(() => {
    // Agregar eventos para aplicar filtros automáticamente
    const filtros = ['fecha-inicio-reporte', 'fecha-fin-reporte', 'tipo-usuario-filtro', 'materia-filtro', 'docente-filtro', 'limite-productos'];
    filtros.forEach(filtroId => {
      const elemento = document.getElementById(filtroId);
      if (elemento) {
        elemento.addEventListener('change', () => {
          // Aplicar filtros automáticamente cuando cambie cualquier valor
          setTimeout(() => {
            const botones = document.querySelectorAll('#reportes-section .btn-group .btn');
            botones.forEach((btn, index) => {
              if (btn.classList.contains('active')) {
                // Regenerar el reporte activo
                switch(index) {
                  case 0: generarReportePrestamos(); break;
                  case 1: generarReporteEstudiantes(); break;
                  case 2: generarReporteDocentes(); break;
                  case 3: generarReporteMaterias(); break;
                  case 4: generarReporteProductos(); break;
                }
              }
            });
          }, 100);
        });
      }
    });
    
    // Agregar evento especial para el campo de búsqueda de estudiante (con debounce)
    const buscarEstudianteInput = document.getElementById('buscar-estudiante');
    if (buscarEstudianteInput) {
      let timeoutId;
      buscarEstudianteInput.addEventListener('input', () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          // Aplicar filtros automáticamente cuando cambie el texto de búsqueda
          const botones = document.querySelectorAll('#reportes-section .btn-group .btn');
          botones.forEach((btn, index) => {
            if (btn.classList.contains('active')) {
              // Regenerar el reporte activo
              switch(index) {
                case 0: generarReportePrestamos(); break;
                case 1: generarReporteEstudiantes(); break;
                case 2: generarReporteDocentes(); break;
                case 3: generarReporteMaterias(); break;
                case 4: generarReporteProductos(); break;
              }
            }
          });
        }, 500); // Esperar 500ms después de que el usuario deje de escribir
      });
    }
    
    // Cargar reporte de préstamos por defecto
    generarReportePrestamos();
  }, 200);
}

// Variables globales para reportes (ya declaradas arriba)
// let ultimosDataReporte = null; - ya existe
// let tipoReporteActual = null; - ya existe como tipoReporteActual
// let currentChart = null; - se declara más abajo

async function generarReportePrestamos() {
  try {
    mostrarCargandoReporte();
    tipoReporteActual = 'prestamos';
    actualizarTituloReporte("Reporte de Préstamos Realizados");
    activarBotonReporte(0);
    
    const filtros = obtenerFiltrosReporte();
    const params = new URLSearchParams(filtros);
    
    console.log('Solicitando datos de préstamos...');
    const response = await fetch(`/api/reportes/prestamos?${params}`);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Datos de préstamos recibidos:', data);
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    ultimosDataReporte = data;
    console.log("Datos recibidos correctamente:", data);
    mostrarReportePrestamos(data);
    
    // Ocultar controles de gráfico para préstamos
    const controlesGrafico = document.getElementById('controles-tipo-grafico');
    if (controlesGrafico) controlesGrafico.style.display = 'none';
    
    // Mostrar solo vista de tabla para préstamos
    cambiarVistaReporte('tabla');
    
  } catch (error) {
    console.error("Error generando reporte de préstamos:", error);
    mostrarErrorReporte(`Error generando reporte: ${error.message || 'Error desconocido'}`);
  } finally {
    // Ocultar indicador de carga
    const spinner = document.querySelector('.spinner-border');
    if (spinner && spinner.parentElement) {
      spinner.parentElement.style.display = 'none';
    }
  }
}

async function generarReporteEstudiantes() {
  try {
    mostrarCargandoReporte();
    tipoReporteActual = 'estudiantes';
    actualizarTituloReporte("Ranking de Estudiantes por Número de Préstamos");
    activarBotonReporte(1);
    
    const filtros = obtenerFiltrosReporte();
    const params = new URLSearchParams(filtros);
    
    const response = await fetch(`/api/reportes/estudiantes?${params}`);
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    ultimosDataReporte = data;
    mostrarReporteEstudiantes(data);
    
    // Mostrar controles de gráfico
    const controlesGrafico = document.getElementById('controles-tipo-grafico');
    if (controlesGrafico) controlesGrafico.style.display = 'inline-flex';
    
    // Mostrar vista de tabla por defecto
    cambiarVistaReporte('tabla');
    
  } catch (error) {
    console.error("Error generando reporte de estudiantes:", error);
    mostrarErrorReporte(`Error generando reporte: ${error.message}`);
  }
}

async function generarReporteDocentes() {
  try {
    mostrarCargandoReporte();
    tipoReporteActual = 'docentes';
    actualizarTituloReporte("Ranking de Docentes por Uso de Insumos");
    activarBotonReporte(2);
    
    const filtros = obtenerFiltrosReporte();
    const params = new URLSearchParams(filtros);
    
    const response = await fetch(`/api/reportes/docentes?${params}`);
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    ultimosDataReporte = data;
    mostrarReporteDocentes(data);
    
    // Mostrar controles de gráfico
    const controlesGrafico = document.getElementById('controles-tipo-grafico');
    if (controlesGrafico) controlesGrafico.style.display = 'inline-flex';
    
    // Mostrar vista de tabla por defecto
    cambiarVistaReporte('tabla');
    
  } catch (error) {
    console.error("Error generando reporte de docentes:", error);
    mostrarErrorReporte(`Error generando reporte: ${error.message}`);
  }
}

async function generarReporteMaterias() {
  try {
    mostrarCargandoReporte();
    tipoReporteActual = 'materias';
    actualizarTituloReporte("Ranking de Materias por Uso de Insumos");
    activarBotonReporte(3);
    
    const filtros = obtenerFiltrosReporte();
    const params = new URLSearchParams(filtros);
    
    const response = await fetch(`/api/reportes/materias?${params}`);
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    ultimosDataReporte = data;
    mostrarReporteMaterias(data);
    
    // Mostrar controles de gráfico
    const controlesGrafico = document.getElementById('controles-tipo-grafico');
    if (controlesGrafico) controlesGrafico.style.display = 'inline-flex';
    
    // Mostrar vista de tabla por defecto
    cambiarVistaReporte('tabla');
    
  } catch (error) {
    console.error("Error generando reporte de materias:", error);
    mostrarErrorReporte(`Error generando reporte: ${error.message}`);
  }
}

async function generarReporteProductos() {
  try {
    mostrarCargandoReporte();
    tipoReporteActual = 'productos';
    actualizarTituloReporte("Productos Más Solicitados del Laboratorio");
    activarBotonReporte(4);
    
    const filtros = obtenerFiltrosReporte();
    const limite = document.getElementById("limite-productos")?.value || 10;
    filtros.limite = limite;
    
    const params = new URLSearchParams(filtros);
    
    const response = await fetch(`/api/reportes/productos?${params}`);
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    ultimosDataReporte = data;
    mostrarReporteProductos(data);
    
    // Mostrar controles de gráfico
    const controlesGrafico = document.getElementById('controles-tipo-grafico');
    if (controlesGrafico) controlesGrafico.style.display = 'inline-flex';
    
    // Mostrar vista de tabla por defecto
    cambiarVistaReporte('tabla');
    
  } catch (error) {
    console.error("Error generando reporte de productos:", error);
    mostrarErrorReporte(`Error generando reporte: ${error.message}`);
  }
}

function obtenerFiltrosReporte() {
  const filtros = {};
  
  const fechaInicio = document.getElementById("fecha-inicio-reporte")?.value;
  const fechaFin = document.getElementById("fecha-fin-reporte")?.value;
  const tipoUsuario = document.getElementById("tipo-usuario-filtro")?.value;
  const materia = document.getElementById("materia-filtro")?.value;
  const buscarEstudiante = document.getElementById("buscar-estudiante")?.value;
  const docenteFiltro = document.getElementById("docente-filtro")?.value;
  const limiteProductos = document.getElementById("limite-productos")?.value;
  
  if (fechaInicio) filtros.fecha_inicio = fechaInicio;
  if (fechaFin) filtros.fecha_fin = fechaFin;
  if (tipoUsuario) filtros.tipo_usuario = tipoUsuario;
  if (materia) filtros.materia = materia;
  if (buscarEstudiante) filtros.buscar_estudiante = buscarEstudiante;
  if (docenteFiltro) filtros.docente = docenteFiltro;
  if (limiteProductos) filtros.limite = limiteProductos;
  
  return filtros;
}

function mostrarReportePrestamos(data) {
  const contenido = `
    <div class="row mb-4">
      <div class="col-12">
        <div class="alert alert-info">
          <strong>Total de préstamos encontrados:</strong> ${data.total_prestamos}
        </div>
      </div>
    </div>
    
    <div class="table-responsive">
      <table class="table table-striped table-dark">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Usuario</th>
            <th>Correo</th>
            <th>Elemento</th>
            <th>Cantidad</th>
            <th>Estado</th>
            <th>Observaciones</th>
          </tr>
        </thead>
        <tbody>
          ${data.prestamos.length > 0 ? data.prestamos.map(prestamo => `
            <tr>
              <td>${formatearFechaReporte(prestamo.fecha_prestamo)}</td>
              <td>
                <strong>${prestamo.usuario_nombre}</strong><br>
                <small class="text-light">${prestamo.usuario_identificacion}</small>
              </td>
              <td>
                <span class="text-info">${prestamo.usuario_correo || 'Sin correo'}</span>
              </td>
              <td>
                <strong>${prestamo.elemento_nombre}</strong><br>
                <small class="text-light">Código: ${prestamo.elemento_codigo}</small>
              </td>
              <td><span class="badge bg-primary fs-6">${prestamo.cantidad}</span></td>
              <td>
                <span class="badge ${obtenerClaseEstadoReporte(prestamo.estado)}">
                  ${prestamo.estado}
                </span>
              </td>
              <td>${prestamo.estado === 'devuelto' && prestamo.observaciones ? `<span class="${obtenerClaseObservacionReporte(prestamo.observaciones)}">${prestamo.observaciones}</span>` : '-'}</td>
            </tr>
          `).join("") : "<tr><td colspan=\"7\" class=\"text-center\">No se encontraron préstamos</td></tr>"}
        </tbody>
      </table>
    </div>
  `;
  
  document.getElementById("contenido-reporte-tabla").innerHTML = contenido;
}

function mostrarReporteEstudiantes(data) {
  const contenido = `
    <div class="row mb-4">
      <div class="col-12">
        <div class="alert alert-info">
          <strong>Total de estudiantes con préstamos:</strong> ${data.total_estudiantes}
        </div>
      </div>
    </div>
    
    <div class="table-responsive">
      <table class="table table-striped table-dark">
        <thead>
          <tr>
            <th>Ranking</th>
            <th>ID</th>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Materia</th>
            <th>Docente</th>
            <th>Total Préstamos</th>
          </tr>
        </thead>
        <tbody>
          ${data.estudiantes.length > 0 ? data.estudiantes.map((estudiante, index) => `
            <tr ${index < 3 ? "class=\"table-warning\"" : ""}>
              <td>
                <strong>#${index + 1}</strong>
                ${index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : ""}
              </td>
              <td>${estudiante.identificacion}</td>
              <td>${estudiante.nombre}</td>
              <td>${estudiante.correo || '-'}</td>
              <td>${estudiante.materia || '-'}</td>
              <td>${estudiante.docente || '-'}</td>
              <td>
                <span class="badge bg-primary fs-6">${estudiante.total_prestamos}</span>
              </td>
            </tr>
          `).join("") : "<tr><td colspan=\"7\" class=\"text-center\">No se encontraron estudiantes</td></tr>"}
        </tbody>
      </table>
    </div>
  `;
  
  document.getElementById("contenido-reporte-tabla").innerHTML = contenido;
}

function mostrarReporteDocentes(data) {
  const contenido = `
    <div class="row mb-4">
      <div class="col-12">
        <div class="alert alert-info">
          <strong>Total de docentes:</strong> ${data.total_docentes}
        </div>
      </div>
    </div>
    
    <div class="table-responsive">
      <table class="table table-striped table-dark">
        <thead>
          <tr>
            <th>Ranking</th>
            <th>Docente</th>
            <th>Correo</th>
            <th>Número de Préstamos</th>
            <th>Número de Productos</th>
          </tr>
        </thead>
        <tbody>
          ${data.docentes.length > 0 ? data.docentes.map((docente, index) => `
            <tr ${index < 3 ? "class=\"table-warning\"" : ""}>
              <td>
                <strong>#${index + 1}</strong>
                ${index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : ""}
              </td>
              <td>${docente.nombre}</td>
              <td>${docente.correo || '-'}</td>
              <td>
                <span class="badge bg-info">${docente.numero_prestamos}</span>
              </td>
              <td>
                <span class="badge bg-primary fs-6">${docente.total_productos}</span>
              </td>
            </tr>
          `).join("") : "<tr><td colspan=\"5\" class=\"text-center\">No se encontraron docentes</td></tr>"}
        </tbody>
      </table>
    </div>
  `;
  
  document.getElementById("contenido-reporte-tabla").innerHTML = contenido;
}

function mostrarReporteMaterias(data) {
  const contenido = `
    <div class="row mb-4">
      <div class="col-12">
        <div class="alert alert-info">
          <strong>Total de materias:</strong> ${data.total_materias}
        </div>
      </div>
    </div>
    
    <div class="table-responsive">
      <table class="table table-striped table-dark">
        <thead>
          <tr>
            <th>Ranking</th>
            <th>Materia</th>
            <th>Docente</th>
            <th>Número de Préstamos</th>
            <th>Total Productos</th>
            <th>Estudiantes</th>
          </tr>
        </thead>
        <tbody>
          ${data.materias.length > 0 ? data.materias.map((materia, index) => `
            <tr ${index < 3 ? "class=\"table-warning\"" : ""}>
              <td>
                <strong>#${index + 1}</strong>
                ${index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : ""}
              </td>
              <td>${materia.materia}</td>
              <td>${materia.docente || "N/A"}</td>
              <td>
                <span class="badge bg-info">${materia.numero_prestamos}</span>
              </td>
              <td>
                <span class="badge bg-primary fs-6">${materia.total_productos}</span>
              </td>
              <td>
                <span class="badge bg-success">${materia.numero_estudiantes}</span>
              </td>
            </tr>
          `).join("") : "<tr><td colspan=\"6\" class=\"text-center\">No se encontraron materias</td></tr>"}
        </tbody>
      </table>
    </div>
  `;
  
  document.getElementById("contenido-reporte-tabla").innerHTML = contenido;
}

function mostrarReporteProductos(data) {
  const contenido = `
    <div class="row mb-4">
      <div class="col-12">
        <div class="alert alert-info">
          <strong>Top ${data.limite_aplicado} productos más solicitados</strong> 
          (Total encontrados: ${data.total_productos})
        </div>
      </div>
    </div>
    
    <div class="table-responsive">
      <table class="table table-striped table-dark">
        <thead>
          <tr>
            <th>Ranking</th>
            <th>Categoría</th>
            <th>Elemento</th>
            <th>Total Solicitado</th>
          </tr>
        </thead>
        <tbody>
          ${data.productos.length > 0 ? data.productos.map((producto, index) => `
            <tr ${index < 3 ? "class=\"table-warning\"" : ""}>
              <td>
                <strong>#${index + 1}</strong>
                ${index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : ""}
              </td>
              <td><span class="badge bg-secondary">${producto.categoria}</span></td>
              <td>${producto.nombre}</td>
              <td>
                <span class="badge bg-primary fs-6">${producto.total_solicitado}</span>
              </td>
            </tr>
          `).join("") : "<tr><td colspan=\"4\" class=\"text-center\">No se encontraron productos</td></tr>"}
        </tbody>
      </table>
    </div>
  `;
  
  document.getElementById("contenido-reporte-tabla").innerHTML = contenido;
}

function cambiarVistaReporte(vista) {
  const btnTabla = document.getElementById('btn-vista-tabla');
  const controlesGrafico = document.getElementById('controles-tipo-grafico');
  const btnBarras = document.getElementById('btn-vista-grafico-barras');
  const btnCircular = document.getElementById('btn-vista-grafico-circular');
  const btnAmbosGraficos = document.getElementById('btn-vista-ambos-graficos');
  const tablaContainer = document.getElementById('contenido-reporte-tabla');
  const chartContainer = document.getElementById('chart-container');
  
  // Remover clase activa de todos los botones
  [btnTabla, btnBarras, btnCircular, btnAmbosGraficos].forEach(btn => {
    if (btn) {
      btn.classList.remove('btn-light');
      btn.classList.add('btn-outline-light');
    }
  });
  
  // Ocultar todos los controles primero
  if (controlesGrafico) controlesGrafico.style.display = 'none';
  
  switch(vista) {
    case 'tabla':
      if (btnTabla) {
        btnTabla.classList.remove('btn-outline-light');
        btnTabla.classList.add('btn-light');
      }
      if (tablaContainer) tablaContainer.style.display = 'block';
      if (chartContainer) chartContainer.style.display = 'none';
      
      // Mostrar controles de gráfico para reportes que no sean préstamos
      if (tipoReporteActual !== 'prestamos' && controlesGrafico) {
        controlesGrafico.style.display = 'inline-flex';
      }
      break;
      
    case 'grafico-barras':
      if (btnBarras) {
        btnBarras.classList.remove('btn-outline-light');
        btnBarras.classList.add('btn-light');
      }
      if (tablaContainer) tablaContainer.style.display = 'none';
      if (chartContainer) chartContainer.style.display = 'block';
      
      // Generar gráfico de barras según el tipo de reporte
      generarGraficoSegunTipo('barras');
      break;
      
    case 'grafico-circular':
      if (btnCircular) {
        btnCircular.classList.remove('btn-outline-light');
        btnCircular.classList.add('btn-light');
      }
      if (tablaContainer) tablaContainer.style.display = 'none';
      if (chartContainer) chartContainer.style.display = 'block';
      
      // Generar gráfico circular según el tipo de reporte
      generarGraficoSegunTipo('circular');
      break;
      
    case 'ambos-graficos':
      if (btnAmbosGraficos) {
        btnAmbosGraficos.classList.remove('btn-outline-light');
        btnAmbosGraficos.classList.add('btn-light');
      }
      if (tablaContainer) tablaContainer.style.display = 'block';
      if (chartContainer) chartContainer.style.display = 'block';
      
      // Generar gráfico de barras por defecto
      generarGraficoSegunTipo('barras');
      break;
  }
}

function mostrarCargandoReporte() {
  const contenedor = document.getElementById("contenido-reporte-tabla");
  if (contenedor) {
    contenedor.innerHTML = `
      <div class="text-center p-5">
        <div class="spinner-border text-success" role="status">
          <span class="visually-hidden">Generando reporte...</span>
        </div>
        <p class="mt-3">Generando reporte...</p>
      </div>
    `;
  }
}

function mostrarErrorReporte(mensaje) {
  const contenedor = document.getElementById("contenido-reporte-tabla");
  if (contenedor) {
    contenedor.innerHTML = `
      <div class="alert alert-danger">
        <strong>Error:</strong> ${mensaje}
      </div>
    `;
  }
}

function actualizarTituloReporte(titulo) {
  const tituloElement = document.getElementById("titulo-reporte");
  if (tituloElement) {
    tituloElement.textContent = titulo;
  }
}

function activarBotonReporte(indice) {
  const botones = document.querySelectorAll("#reportes-section .btn-group .btn");
  if (botones && botones.length > 0) {
    botones.forEach((btn, i) => {
      if (i === indice) {
        btn.classList.remove("btn-outline-success");
        btn.classList.add("btn-success", "active");
      } else {
        btn.classList.remove("btn-success", "active");
        btn.classList.add("btn-outline-success");
      }
    });
  }
}

function formatearFechaReporte(fecha) {
  return new Date(fecha).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function obtenerClaseEstadoReporte(estado) {
  switch(estado) {
    case 'prestado': return 'bg-warning text-dark';
    case 'devuelto': return 'bg-success';
    case 'vencido': return 'bg-danger';
    default: return 'bg-secondary';
  }
}

function obtenerClaseObservacionReporte(observacion) {
  if (!observacion) return '';
  
  const obs = observacion.toLowerCase().trim();
  if (obs.includes('buen') || obs.includes('perfecto') || obs.includes('excelente')) {
    return 'text-success';
  } else if (obs.includes('dañado') || obs.includes('roto') || obs.includes('malo')) {
    return 'text-danger';
  } else if (obs.includes('regular') || obs.includes('usado')) {
    return 'text-warning';
  }
  return 'text-info';
}

function exportarReportePDF() {
  mostrarNotificacion('Exportación', 'Función de exportación a PDF disponible próximamente', 'info');
}

function exportarReporteExcel() {
  mostrarNotificacion('Exportación', 'Función de exportación a Excel disponible próximamente', 'info');
}

// Función para generar gráfico según el tipo de reporte y estilo
function generarGraficoSegunTipo(estiloGrafico) {
  mostrarNotificacion('Gráficos', 'Funcionalidad de gráficos disponible próximamente', 'info');
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
        
        // Agregar evento de cambio para cargar elementos
        categoriaSelect.addEventListener('change', async function() {
          const categoriaId = this.value;
          if (categoriaId) {
            await cargarElementosPorCategoria(categoriaId);
          } else {
            // Limpiar selección de elementos
            const elementoSelect = document.getElementById('elemento-select');
            if (elementoSelect) {
              elementoSelect.innerHTML = '<option value="">Selecciona un elemento</option>';
              elementoSelect.disabled = true;
            }
          }
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

// Función para cargar elementos por categoría
async function cargarElementosPorCategoria(categoriaId) {
  try {
    console.log(`Cargando elementos para categoría: ${categoriaId}`);
    const response = await fetch(`/api/elementos/categoria/${categoriaId}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Elementos recibidos:', data);
    
    const elementoSelect = document.getElementById('elemento-select');
    if (elementoSelect) {
      elementoSelect.innerHTML = '<option value="">Selecciona un elemento</option>';
      
      if (Array.isArray(data) && data.length > 0) {
        data.forEach(elemento => {
          const option = document.createElement('option');
          option.value = elemento.id;
          option.textContent = `${elemento.nombre} (Disponibles: ${elemento.disponibles || elemento.cantidad})`;
          elementoSelect.appendChild(option);
        });
        elementoSelect.disabled = false;
        
        // Agregar evento de cambio para mostrar detalles del elemento
        elementoSelect.addEventListener('change', function() {
          const elementoId = this.value;
          const btnPrestamo = document.getElementById('prestamo-btn');
          const cantidadInput = document.getElementById('cantidad-input');
          
          if (elementoId) {
            const elementoSeleccionado = data.find(e => e.id == elementoId);
            if (elementoSeleccionado) {
              mostrarDetallesElemento(elementoSeleccionado);
              btnPrestamo.disabled = false;
              cantidadInput.disabled = false;
            }
          } else {
            btnPrestamo.disabled = true;
            cantidadInput.disabled = true;
          }
        });
        
        mostrarNotificacion('Elementos cargados', `${data.length} elementos disponibles`, 'success', 2000);
      } else {
        elementoSelect.innerHTML = '<option value="">No hay elementos disponibles</option>';
        elementoSelect.disabled = true;
        mostrarNotificacion('Sin elementos', 'No hay elementos en esta categoría', 'warning', 3000);
      }
    }
  } catch (error) {
    console.error('Error cargando elementos:', error);
    mostrarNotificacion('Error', `No se pudieron cargar los elementos: ${error.message}`, 'error', 5000);
  }
}

// Función para mostrar detalles del elemento seleccionado
function mostrarDetallesElemento(elemento) {
  const detallesDiv = document.getElementById('elemento-detalles');
  if (detallesDiv) {
    detallesDiv.innerHTML = `
      <div class="detail-card">
        <h5 class="detail-title">${elemento.nombre}</h5>
        <p class="detail-description">${elemento.descripcion || 'Sin descripción disponible'}</p>
        <div class="detail-info">
          <p><strong>Código:</strong> ${elemento.codigo}</p>
          <p><strong>Cantidad disponible:</strong> <span class="available-count">${elemento.disponibles || elemento.cantidad}</span></p>
          <p><strong>Ubicación:</strong> ${elemento.ubicacion || 'No especificada'}</p>
        </div>
      </div>
    `;
  }
}

// Función para realizar préstamo
async function realizarPrestamo() {
  try {
    const elementoSelect = document.getElementById('elemento-select');
    const cantidadInput = document.getElementById('cantidad-input');
    
    const elementoId = elementoSelect.value;
    const cantidad = parseInt(cantidadInput.value);
    
    if (!elementoId) {
      mostrarNotificacion('Error', 'Selecciona un elemento', 'error');
      return;
    }
    
    if (!cantidad || cantidad < 1) {
      mostrarNotificacion('Error', 'Ingresa una cantidad válida', 'error');
      return;
    }
    
    // Crear usuario temporal para el préstamo
    const usuarioData = {
      tipo: currentUser.tipo,
      nombre: currentUser.nombre,
      identificacion: currentUser.id_estudiante || currentUser.nombre,
      correo: currentUser.correo || '',
      docente: currentUser.docente || '',
      materia: currentUser.materia || ''
    };
    
    const prestamoData = {
      elemento_id: parseInt(elementoId),
      usuario_data: usuarioData,
      cantidad: cantidad
    };
    
    const response = await fetch('/api/prestar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(prestamoData)
    });
    
    const result = await response.json();
    
    if (response.ok && result.success) {
      mostrarNotificacion('Éxito', result.mensaje, 'success');
      
      // Limpiar formulario
      cantidadInput.value = '1';
      cantidadInput.disabled = true;
      elementoSelect.selectedIndex = 0;
      document.getElementById('prestamo-btn').disabled = true;
      
      // Recargar elementos para actualizar disponibilidad
      const categoriaSelect = document.getElementById('categoria-select');
      if (categoriaSelect.value) {
        await cargarElementosPorCategoria(categoriaSelect.value);
      }
    } else {
      mostrarNotificacion('Error', result.error || 'Error realizando préstamo', 'error');
    }
  } catch (error) {
    console.error('Error realizando préstamo:', error);
    mostrarNotificacion('Error', 'Error al procesar préstamo', 'error');
  }
}

// ===== FUNCIONES DE REPORTES =====

async function generarReportePrestamos() {
  try {
    mostrarCargandoReporte();
    
    const filtros = obtenerFiltrosReporte();
    const params = new URLSearchParams(filtros);
    
    const response = await fetch(`/api/reportes/prestamos?${params}`);
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    mostrarReportePrestamos(data);
    
  } catch (error) {
    console.error('Error generando reporte de préstamos:', error);
    mostrarErrorReporte(`Error generando reporte: ${error.message}`);
  }
}

async function generarReporteEstudiantes() {
  try {
    mostrarCargandoReporte();
    
    const filtros = obtenerFiltrosReporte();
    const params = new URLSearchParams(filtros);
    
    const response = await fetch(`/api/reportes/estudiantes?${params}`);
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    mostrarReporteEstudiantes(data);
    
  } catch (error) {
    console.error('Error generando reporte de estudiantes:', error);
    mostrarErrorReporte(`Error generando reporte: ${error.message}`);
  }
}

async function generarReporteDocentes() {
  try {
    mostrarCargandoReporte();
    
    const filtros = obtenerFiltrosReporte();
    const params = new URLSearchParams(filtros);
    
    const response = await fetch(`/api/reportes/docentes?${params}`);
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    mostrarReporteDocentes(data);
    
  } catch (error) {
    console.error('Error generando reporte de docentes:', error);
    mostrarErrorReporte(`Error generando reporte: ${error.message}`);
  }
}

async function generarReporteMaterias() {
  try {
    mostrarCargandoReporte();
    
    const filtros = obtenerFiltrosReporte();
    const params = new URLSearchParams(filtros);
    
    const response = await fetch(`/api/reportes/materias?${params}`);
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    mostrarReporteMaterias(data);
    
  } catch (error) {
    console.error('Error generando reporte de materias:', error);
    mostrarErrorReporte(`Error generando reporte: ${error.message}`);
  }
}

async function generarReporteProductos() {
  try {
    mostrarCargandoReporte();
    
    const filtros = obtenerFiltrosReporte();
    const params = new URLSearchParams(filtros);
    
    const response = await fetch(`/api/reportes/productos?${params}`);
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    mostrarReporteProductos(data);
    
  } catch (error) {
    console.error('Error generando reporte de productos:', error);
    mostrarErrorReporte(`Error generando reporte: ${error.message}`);
  }
}

function obtenerFiltrosReporte() {
  return {
    fecha_inicio: document.getElementById('fecha-inicio-reporte')?.value || '',
    fecha_fin: document.getElementById('fecha-fin-reporte')?.value || '',
    tipo_usuario: document.getElementById('tipo-usuario-reporte')?.value || '',
    materia: document.getElementById('materia-reporte')?.value || ''
  };
}

function mostrarReportePrestamos(data) {
  ocultarCargandoReporte();
  actualizarTituloReporte('Reporte de Préstamos Realizados');
  
  let html = `
    <div class="table-responsive">
      <table class="table table-dark table-striped">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Usuario</th>
            <th>Elemento</th>
            <th>Cantidad</th>
            <th>Estado</th>
            <th>Observaciones</th>
          </tr>
        </thead>
        <tbody>
  `;
  
  if (data.prestamos && data.prestamos.length > 0) {
    data.prestamos.forEach(prestamo => {
      html += `
        <tr>
          <td>${formatearFechaReporte(prestamo.fecha_prestamo)}</td>
          <td>
            <div><strong>${prestamo.usuario_nombre}</strong></div>
            <small class="text-muted">${prestamo.usuario_email || 'Sin email'}</small>
          </td>
          <td>
            <div><strong>${prestamo.elemento_nombre}</strong></div>
            <small class="text-muted">${prestamo.elemento_codigo}</small>
          </td>
          <td>${prestamo.cantidad}</td>
          <td><span class="badge ${obtenerClaseEstadoReporte(prestamo.estado)}">${prestamo.estado}</span></td>
          <td><span class="${obtenerClaseObservacionReporte(prestamo.observaciones)}">${prestamo.observaciones || 'N/A'}</span></td>
        </tr>
      `;
    });
  } else {
    html += '<tr><td colspan="6" class="text-center">No hay préstamos en el período seleccionado</td></tr>';
  }
  
  html += `
        </tbody>
      </table>
    </div>
    <div class="mt-3">
      <p class="text-light"><strong>Total de préstamos:</strong> ${data.prestamos?.length || 0}</p>
    </div>
  `;
  
  document.getElementById('contenido-reporte').innerHTML = html;
  
  // Generar gráfico
  if (data.prestamos && data.prestamos.length > 0) {
    generarGraficoPrestamos(data);
  }
}

function mostrarReporteEstudiantes(data) {
  ocultarCargandoReporte();
  actualizarTituloReporte('Reporte de Estudiantes');
  
  let html = `
    <div class="table-responsive">
      <table class="table table-dark table-striped">
        <thead>
          <tr>
            <th>Estudiante</th>
            <th>Email</th>
            <th>Docente</th>
            <th>Materia</th>
            <th>Total Préstamos</th>
          </tr>
        </thead>
        <tbody>
  `;
  
  if (data.estudiantes && data.estudiantes.length > 0) {
    data.estudiantes.forEach(estudiante => {
      html += `
        <tr>
          <td><strong>${estudiante.nombre}</strong></td>
          <td>${estudiante.correo || 'Sin email'}</td>
          <td>${estudiante.docente || 'N/A'}</td>
          <td>${estudiante.materia || 'N/A'}</td>
          <td><span class="badge bg-success">${estudiante.total_prestamos}</span></td>
        </tr>
      `;
    });
  } else {
    html += '<tr><td colspan="5" class="text-center">No hay estudiantes en el período seleccionado</td></tr>';
  }
  
  html += `
        </tbody>
      </table>
    </div>
  `;
  
  document.getElementById('contenido-reporte').innerHTML = html;
  
  // Generar gráficos
  if (data.estudiantes && data.estudiantes.length > 0) {
    generarGraficoEstudiantesBarras(data);
  }
}

function mostrarReporteDocentes(data) {
  ocultarCargandoReporte();
  actualizarTituloReporte('Reporte de Docentes');
  
  let html = `
    <div class="table-responsive">
      <table class="table table-dark table-striped">
        <thead>
          <tr>
            <th>Docente</th>
            <th>Email</th>
            <th>Tipo</th>
            <th>Total Préstamos</th>
          </tr>
        </thead>
        <tbody>
  `;
  
  if (data.docentes && data.docentes.length > 0) {
    data.docentes.forEach(docente => {
      html += `
        <tr>
          <td><strong>${docente.nombre}</strong></td>
          <td>${docente.correo || 'Sin email'}</td>
          <td><span class="badge ${obtenerClaseTipoDocente(docente.tipo)}">${docente.tipo}</span></td>
          <td><span class="badge bg-success">${docente.total_prestamos}</span></td>
        </tr>
      `;
    });
  } else {
    html += '<tr><td colspan="4" class="text-center">No hay docentes en el período seleccionado</td></tr>';
  }
  
  html += `
        </tbody>
      </table>
    </div>
  `;
  
  document.getElementById('contenido-reporte').innerHTML = html;
  
  // Generar gráficos
  if (data.docentes && data.docentes.length > 0) {
    generarGraficoDocentesBarras(data);
  }
}

function mostrarReporteMaterias(data) {
  ocultarCargandoReporte();
  actualizarTituloReporte('Reporte de Materias');
  
  let html = `
    <div class="table-responsive">
      <table class="table table-dark table-striped">
        <thead>
          <tr>
            <th>Materia</th>
            <th>Total Préstamos</th>
            <th>Estudiantes Activos</th>
          </tr>
        </thead>
        <tbody>
  `;
  
  if (data.materias && data.materias.length > 0) {
    data.materias.forEach(materia => {
      html += `
        <tr>
          <td><strong>${materia.nombre}</strong></td>
          <td><span class="badge bg-success">${materia.total_prestamos}</span></td>
          <td><span class="badge bg-info">${materia.estudiantes_unicos}</span></td>
        </tr>
      `;
    });
  } else {
    html += '<tr><td colspan="3" class="text-center">No hay materias en el período seleccionado</td></tr>';
  }
  
  html += `
        </tbody>
      </table>
    </div>
  `;
  
  document.getElementById('contenido-reporte').innerHTML = html;
  
  // Generar gráficos
  if (data.materias && data.materias.length > 0) {
    generarGraficoMateriasBarras(data);
  }
}

function mostrarReporteProductos(data) {
  ocultarCargandoReporte();
  actualizarTituloReporte('Reporte de Productos Más Solicitados');
  
  let html = `
    <div class="table-responsive">
      <table class="table table-dark table-striped">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Código</th>
            <th>Categoría</th>
            <th>Total Préstamos</th>
            <th>Cantidad Total Prestada</th>
          </tr>
        </thead>
        <tbody>
  `;
  
  if (data.productos && data.productos.length > 0) {
    data.productos.forEach(producto => {
      html += `
        <tr>
          <td><strong>${producto.nombre}</strong></td>
          <td>${producto.codigo}</td>
          <td><span class="badge bg-secondary">${producto.categoria}</span></td>
          <td><span class="badge bg-success">${producto.total_prestamos}</span></td>
          <td><span class="badge bg-warning">${producto.cantidad_total}</span></td>
        </tr>
      `;
    });
  } else {
    html += '<tr><td colspan="5" class="text-center">No hay productos en el período seleccionado</td></tr>';
  }
  
  html += `
        </tbody>
      </table>
    </div>
  `;
  
  document.getElementById('contenido-reporte').innerHTML = html;
  
  // Generar gráficos
  if (data.productos && data.productos.length > 0) {
    generarGraficoProductosBarras(data);
  }
}

// Funciones auxiliares para reportes
function cambiarVistaReporte(vista) {
  const tablaDiv = document.getElementById('contenido-reporte');
  const graficoDiv = document.getElementById('reporte-grafico');
  
  switch(vista) {
    case 'tabla':
      tablaDiv.style.display = 'block';
      graficoDiv.style.display = 'none';
      break;
    case 'grafico':
      tablaDiv.style.display = 'none';
      graficoDiv.style.display = 'block';
      break;
    case 'ambos':
      tablaDiv.style.display = 'block';
      graficoDiv.style.display = 'block';
      break;
  }
}

function activarBotonReporte(indice) {
  document.querySelectorAll('.reporte-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`[data-reporte="${indice}"]`).classList.add('active');
}

function mostrarCargandoReporte() {
  document.getElementById('cargando-reporte').style.display = 'block';
  document.getElementById('contenido-reporte').style.display = 'none';
}

function ocultarCargandoReporte() {
  document.getElementById('cargando-reporte').style.display = 'none';
  document.getElementById('contenido-reporte').style.display = 'block';
}

function mostrarErrorReporte(mensaje) {
  ocultarCargandoReporte();
  document.getElementById('contenido-reporte').innerHTML = `
    <div class="alert alert-danger" role="alert">
      <i class="fas fa-exclamation-triangle"></i> ${mensaje}
    </div>
  `;
}

function actualizarTituloReporte(titulo) {
  document.getElementById('reporte-titulo').innerHTML = `<h5 class="text-success">${titulo}</h5>`;
}

function formatearFechaReporte(fecha) {
  return new Date(fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function obtenerClaseEstadoReporte(estado) {
  switch(estado?.toLowerCase()) {
    case 'prestado': return 'bg-warning';
    case 'devuelto': return 'bg-success';
    case 'vencido': return 'bg-danger';
    default: return 'bg-secondary';
  }
}

function obtenerClaseTipoDocente(tipo) {
  switch(tipo?.toLowerCase()) {
    case 'docente': return 'bg-primary';
    case 'laboratorista': return 'bg-info';
    default: return 'bg-secondary';
  }
}

function obtenerClaseObservacionReporte(observacion) {
  if (!observacion || observacion === 'N/A') return 'text-muted';
  if (observacion.toLowerCase().includes('buen estado')) return 'text-success';
  if (observacion.toLowerCase().includes('mal estado') || observacion.toLowerCase().includes('dañado')) return 'text-danger';
  return 'text-warning';
}

function exportarReportePDF() {
  mostrarNotificacion('Exportar', 'Función de exportar a PDF disponible próximamente', 'info');
}

function exportarReporteExcel() {
  mostrarNotificacion('Exportar', 'Función de exportar a Excel disponible próximamente', 'info');
}

// Variables globales para gráficos (mantener esta declaración)
let currentChart = null;

function destruirGraficoAnterior() {
  if (currentChart) {
    currentChart.destroy();
    currentChart = null;
  }
}

function generarGraficoPrestamos(data) {
  destruirGraficoAnterior();
  
  // Agrupar préstamos por fecha
  const prestamosPorFecha = {};
  data.prestamos.forEach(prestamo => {
    const fecha = prestamo.fecha_prestamo.split('T')[0];
    prestamosPorFecha[fecha] = (prestamosPorFecha[fecha] || 0) + 1;
  });
  
  const fechas = Object.keys(prestamosPorFecha).sort();
  const cantidades = fechas.map(fecha => prestamosPorFecha[fecha]);
  
  crearGraficoLineas('Préstamos por Fecha', fechas, cantidades, '#45d509');
}

function generarGraficoEstudiantesBarras(data) {
  destruirGraficoAnterior();
  
  const estudiantes = data.estudiantes.slice(0, 10); // Top 10
  const nombres = estudiantes.map(e => e.nombre.split(' ')[0] + ' ' + e.nombre.split(' ')[1]);
  const prestamos = estudiantes.map(e => e.total_prestamos);
  
  crearGraficoBarras('Top 10 Estudiantes por Préstamos', nombres, prestamos, '#45d509');
}

function generarGraficoDocentesBarras(data) {
  destruirGraficoAnterior();
  
  const nombres = data.docentes.map(d => d.nombre);
  const prestamos = data.docentes.map(d => d.total_prestamos);
  
  crearGraficoBarras('Préstamos por Docente', nombres, prestamos, '#FF6600');
}

function generarGraficoMateriasBarras(data) {
  destruirGraficoAnterior();
  
  const nombres = data.materias.map(m => m.nombre);
  const prestamos = data.materias.map(m => m.total_prestamos);
  
  crearGraficoBarras('Préstamos por Materia', nombres, prestamos, '#17a2b8');
}

function generarGraficoProductosBarras(data) {
  destruirGraficoAnterior();
  
  const productos = data.productos.slice(0, 10); // Top 10
  const nombres = productos.map(p => p.nombre.length > 20 ? p.nombre.substring(0, 20) + '...' : p.nombre);
  const prestamos = productos.map(p => p.total_prestamos);
  
  crearGraficoBarras('Top 10 Productos Más Solicitados', nombres, prestamos, '#6f42c1');
}

function crearGraficoLineas(titulo, etiquetas, datos, color) {
  const ctx = document.getElementById('chart-canvas').getContext('2d');
  currentChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: etiquetas,
      datasets: [{
        label: titulo,
        data: datos,
        borderColor: color,
        backgroundColor: color + '20',
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: titulo,
          color: '#ffffff'
        },
        legend: {
          labels: {
            color: '#ffffff'
          }
        }
      },
      scales: {
        x: {
          ticks: { color: '#ffffff' },
          grid: { color: '#444444' }
        },
        y: {
          ticks: { color: '#ffffff' },
          grid: { color: '#444444' }
        }
      }
    }
  });
}

function crearGraficoBarras(titulo, etiquetas, datos, color) {
  const ctx = document.getElementById('chart-canvas').getContext('2d');
  currentChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: etiquetas,
      datasets: [{
        label: titulo,
        data: datos,
        backgroundColor: color,
        borderColor: color,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: titulo,
          color: '#ffffff'
        },
        legend: {
          labels: {
            color: '#ffffff'
          }
        }
      },
      scales: {
        x: {
          ticks: { 
            color: '#ffffff',
            maxRotation: 45
          },
          grid: { color: '#444444' }
        },
        y: {
          ticks: { color: '#ffffff' },
          grid: { color: '#444444' }
        }
      }
    }
  });
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
        
        // También actualizar el campo de nombre si existe y bloquearlo para edición
        const nombreInput = document.getElementById('user-name');
        if (nombreInput) {
          nombreInput.value = data.nombre;
          nombreInput.readOnly = true;
          nombreInput.style.backgroundColor = '#1a1a1a';
          nombreInput.style.color = '#ffffff';
          nombreInput.style.border = '2px solid #45d509';
          nombreInput.style.borderRadius = '5px';
          nombreInput.title = 'Nombre cargado automáticamente desde la base de datos';
        }
        
        mostrarNotificacion('Estudiante encontrado', `${data.nombre}`, 'success', 3000);
      } else {
        if (userEmailInput) {
          userEmailInput.value = '';
        }
        const nombreInput = document.getElementById('user-name');
        if (nombreInput) {
          nombreInput.value = '';
          nombreInput.readOnly = false;
          nombreInput.style.backgroundColor = '';
          nombreInput.style.color = '';
          nombreInput.style.border = '';
          nombreInput.style.borderRadius = '';
          nombreInput.title = '';
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