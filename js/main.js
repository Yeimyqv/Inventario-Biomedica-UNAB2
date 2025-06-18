// Variables globales
let currentUser = {
  id: null,
  tipo: null,
  nombre: null
};

let elementoSeleccionado = null;
let categoriaSeleccionada = null;
let currentLaboratory = null; // Para almacenar el laboratorio seleccionado

// Reemplazar variable INVENTARIO estática con datos de la API
let INVENTARIO = []; // Será llenado dinámicamente desde la base de datos

// Objeto para almacenar los PINes de docentes y laboratoristas
const PINES = {
  'docente': 'DOC1234',
  'laboratorista': 'LAB5678'
};

// Función para determinar la clase CSS según el estado de devolución
function getEstadoObservacionClass(observacion) {
  // Mapeo de observaciones a clases CSS
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
  
  // Mostrar directamente la selección de usuario (ya no hay sección lab-selection)
  document.getElementById('user-selection').style.display = 'block';
  
  // Cargar el inventario desde la base de datos en segundo plano
  try {
    const loadingMsg = mostrarNotificacion('Cargando', 'Cargando datos del sistema...', 'info', 3000);
    INVENTARIO = await cargarInventarioDesdeDB();
    console.log(`Inventario cargado: ${INVENTARIO.length} categorías`);
    
    // Cerrar la notificación inmediatamente después de cargar
    if (loadingMsg && loadingMsg.close) {
      loadingMsg.close();
    }
  } catch (error) {
    console.error('Error al cargar el inventario:', error);
    mostrarNotificacion('Error', 'Hubo un problema al cargar el inventario. Algunas funciones podrían no estar disponibles.', 'error', 5000);
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
        e.preventDefault(); // Evitar envío del formulario por defecto
        autenticarUsuario();
      }
    });
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

// Funciones para manejar los campos "Otro" en los selectores
function toggleOtroDocenteInput() {
  const selectDocente = document.getElementById('estudiante-docente');
  const otroDocenteDiv = document.getElementById('otro-docente-div');
  
  if (selectDocente && otroDocenteDiv) {
    if (selectDocente.value === 'otro') {
      otroDocenteDiv.style.display = 'block';
    } else {
      otroDocenteDiv.style.display = 'none';
    }
  }
}

function toggleOtraMateriaInput() {
  const selectMateria = document.getElementById('estudiante-materia');
  const otraMateriaDiv = document.getElementById('otra-materia-div');
  
  if (selectMateria && otraMateriaDiv) {
    if (selectMateria.value === 'otra') {
      otraMateriaDiv.style.display = 'block';
    } else {
      otraMateriaDiv.style.display = 'none';
    }
  }
}

// Configuración inicial del laboratorio (ahora automática)
function configureDefaultLaboratory() {
  currentLaboratory = 'biomedica';
  
  // Mostrar mensaje de confirmación del laboratorio
  mostrarNotificacion('Laboratorio seleccionado', `Laboratorio de Ingeniería Biomédica - Sede Jardín`, 'info');
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
    estudianteFields.style.display = 'block';
    nombreGroup.style.display = 'block';
    pinGroup.style.display = 'none';
    
    // Configurar eventos para los selectores de "Otro"
    const docenteSelect = document.getElementById('estudiante-docente');
    if (docenteSelect) {
      docenteSelect.addEventListener('change', function() {
        const otroDocenteGroup = document.getElementById('otro-docente-group');
        otroDocenteGroup.style.display = (this.value === 'Otro') ? 'block' : 'none';
      });
    }
    
    const materiaSelect = document.getElementById('estudiante-materia');
    if (materiaSelect) {
      materiaSelect.addEventListener('change', function() {
        const otraMateriaGroup = document.getElementById('otra-materia-group');
        otraMateriaGroup.style.display = (this.value === 'Otra') ? 'block' : 'none';
      });
    }
    
    // Configurar eventos de autocompletado después de un breve tiempo
    setTimeout(configurarEventosAutocompletado, 100);
  } else {
    // Para docentes y laboratoristas
    if (estudianteFields) {
      estudianteFields.style.display = 'none';
    }
    nombreGroup.style.display = 'block';
    pinGroup.style.display = 'block';
    
    // Configurar lista desplegable para docentes
    if (tipo === 'docente') {
      // Mostrar selector de docentes y ocultar campo de texto
      document.getElementById('docente-select-container').style.display = 'block';
      document.getElementById('user-name').style.display = 'none';
      
      // Configurar evento para opción "Otro"
      const docenteSelect = document.getElementById('docente-select');
      docenteSelect.addEventListener('change', function() {
        const otroDocenteNombreGroup = document.getElementById('otro-docente-nombre-group');
        otroDocenteNombreGroup.style.display = (this.value === 'Otro') ? 'block' : 'none';
      });
    } else if (tipo === 'laboratorista') {
      // Para laboratoristas, usar el selector específico
      document.getElementById('docente-select-container').style.display = 'none';
      document.getElementById('laboratorista-select-container').style.display = 'block';
      document.getElementById('user-name').style.display = 'none';
    } else {
      // Para otros tipos de usuario
      document.getElementById('docente-select-container').style.display = 'none';
      document.getElementById('laboratorista-select-container').style.display = 'none';
      document.getElementById('user-name').style.display = 'block';
    }
  }
}

// Función eliminada - reemplazada por volverASeleccionUsuario()

// Autenticar al usuario según su tipo
function autenticarUsuario() {
  let nombre = '';
  
  // Obtener el nombre según el tipo de usuario
  if (currentUser.tipo === 'laboratorista') {
    // Para laboratoristas, obtener el nombre del selector
    const laboratoristaSelect = document.getElementById('laboratorista-select');
    if (laboratoristaSelect) {
      nombre = laboratoristaSelect.value;
    } else {
      // Fallback al campo de texto si no existe el selector
      nombre = document.getElementById('user-name').value.trim();
    }
  } else if (currentUser.tipo === 'docente') {
    // Para docentes, obtener el nombre del selector
    const docenteSelect = document.getElementById('docente-select');
    nombre = docenteSelect.value;
    
    // Si seleccionó "Otro", obtener el nombre del campo de texto adicional
    if (nombre === 'Otro') {
      nombre = document.getElementById('otro-docente-nombre').value.trim();
      if (!nombre) {
        mostrarNotificacion('Error', 'Por favor ingrese su nombre completo', 'error');
        return;
      }
    } else if (!nombre) {
      mostrarNotificacion('Error', 'Por favor seleccione su nombre de la lista', 'error');
      return;
    }
  } else {
    // Para estudiantes, obtener el nombre del campo de texto
    nombre = document.getElementById('user-name').value.trim();
  }
  
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
      mostrarNotificacion('Error', `PIN incorrecto. Para ${currentUser.tipo === 'docente' ? 'docentes' : 'laboratoristas'} el PIN correcto es: ${PINES[currentUser.tipo]}`, 'error');
      return;
    }
  } 
  // Verificar datos adicionales para estudiantes
  else if (currentUser.tipo === 'estudiante') {
    const estudianteId = document.getElementById('estudiante-id').value.trim();
    const estudianteCorreo = document.getElementById('estudiante-correo').value.trim();
    
    // Obtener el docente (manejo de "Otro")
    let docente = document.getElementById('estudiante-docente').value;
    if (docente === 'Otro') {
      docente = document.getElementById('otro-docente').value.trim();
      if (!docente) {
        mostrarNotificacion('Error', 'Por favor ingresa el nombre del docente', 'error');
        return;
      }
    } else if (!docente) {
      mostrarNotificacion('Error', 'Por favor selecciona un docente', 'error');
      return;
    }
    
    // Obtener la materia (manejo de "Otra")
    let materia = document.getElementById('estudiante-materia').value;
    if (materia === 'Otra') {
      materia = document.getElementById('otra-materia').value.trim();
      if (!materia) {
        mostrarNotificacion('Error', 'Por favor ingresa el nombre de la materia', 'error');
        return;
      }
    } else if (!materia) {
      mostrarNotificacion('Error', 'Por favor selecciona una materia', 'error');
      return;
    }
    
    if (!estudianteId) {
      mostrarNotificacion('Error', 'Por favor ingresa tu ID', 'error');
      return;
    }
    
    if (!estudianteCorreo) {
      mostrarNotificacion('Error', 'Por favor busca tu ID para autocompletar tu correo', 'error');
      return;
    }
    
    if (!estudianteCorreo.includes('@')) {
      mostrarNotificacion('Error', 'El correo electrónico debe contener @', 'error');
      return;
    }
    
    // Guardar datos adicionales del estudiante
    currentUser.id_estudiante = estudianteId;
    currentUser.docente = docente;
    currentUser.materia = materia;
    currentUser.correo = estudianteCorreo;
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
          <p class="panel-subtitle">Panel de Laboratorista - Administración completa del sistema</p>
        </div>
        
        <div class="panel-content">
          <div class="row">
            <div class="col-md-3 mb-3">
              <div class="panel-module">
                <h3 class="module-title">PRÉSTAMO DE ELEMENTOS</h3>
                <p class="module-desc">Gestionar nuevos préstamos</p>
                <button class="btn btn-green" onclick="iniciarPrestamo()">PRESTAR ELEMENTOS</button>
              </div>
            </div>
            <div class="col-md-3 mb-3">
              <div class="panel-module">
                <h3 class="module-title">RETORNO DE ELEMENTOS</h3>
                <p class="module-desc">Registrar devoluciones</p>
                <button class="btn btn-outline-light" onclick="iniciarRetorno()">RETORNAR ELEMENTOS</button>
              </div>
            </div>
            <div class="col-md-3 mb-3">
              <div class="panel-module">
                <h3 class="module-title">ADMINISTRAR INVENTARIO</h3>
                <p class="module-desc">Agregar o eliminar elementos</p>
                <button class="btn btn-outline-light" onclick="administrarInventario()">ADMINISTRAR</button>
              </div>
            </div>
            <div class="col-md-3 mb-3">
              <div class="panel-module">
                <h3 class="module-title">CONSULTAR PRÉSTAMOS</h3>
                <p class="module-desc">Ver historial y estado actual</p>
                <button class="btn btn-outline-light" onclick="consultarPrestamos()">VER PRÉSTAMOS</button>
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

// Iniciar proceso de préstamo
async function iniciarPrestamo() {
  // Ocultar la interfaz principal
  document.getElementById('interface').style.display = 'none';
  
  // Mostrar la sección de préstamo
  const prestamoSection = document.getElementById('prestamo-section');
  prestamoSection.style.display = 'block';
  
  // Configurar título
  document.getElementById('prestamo-title').textContent = 'Préstamo de elementos';
  
  // Si el usuario es laboratorista, mostrar opciones adicionales
  if (currentUser.tipo === 'laboratorista') {
    // Verificar si ya existe el contenedor de préstamo por usuario
    let prestamoUsuarioContainer = document.getElementById('prestamo-usuario-container');
    
    if (!prestamoUsuarioContainer) {
      // Crear contenedor para opciones de préstamo por usuario
      prestamoUsuarioContainer = document.createElement('div');
      prestamoUsuarioContainer.id = 'prestamo-usuario-container';
      prestamoUsuarioContainer.className = 'row mb-4 border-bottom pb-3';
      
      // Contenido del contenedor
      prestamoUsuarioContainer.innerHTML = `
        <div class="col-12 mb-3">
          <h4 class="mb-3">Realizar préstamo en nombre de:</h4>
          <div class="btn-group w-100" role="group" id="tipo-prestamo-grupo">
            <button type="button" class="btn btn-outline-light active" data-tipo="propio">Laboratorio (Propio)</button>
            <button type="button" class="btn btn-outline-light" data-tipo="estudiante">Estudiante</button>
            <button type="button" class="btn btn-outline-light" data-tipo="docente">Docente</button>
          </div>
        </div>
        
        <!-- Campos para préstamo a estudiante -->
        <div class="col-md-12 mt-2 mb-3" id="prestamo-estudiante-container" style="display: none;">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="prestamo-estudiante-id" class="form-label">ID del Estudiante:</label>
              <div class="input-group">
                <input type="text" class="form-control" id="prestamo-estudiante-id" placeholder="Ej: U00123456">
                <button class="btn btn-outline-light" type="button" id="buscar-estudiante-prestamo">
                  <i class="bi bi-search"></i> Buscar
                </button>
              </div>
            </div>
            <div class="col-md-6 mb-3">
              <label for="prestamo-estudiante-nombre" class="form-label">Nombre del Estudiante:</label>
              <input type="text" class="form-control" id="prestamo-estudiante-nombre" readonly>
            </div>
            <div class="col-12">
              <div class="alert alert-info" role="alert">
                <small>Ingrese el ID del estudiante y presione "Buscar" para cargar sus datos automáticamente.</small>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Campos para préstamo a docente -->
        <div class="col-md-12 mt-2 mb-3" id="prestamo-docente-container" style="display: none;">
          <div class="row">
            <div class="col-md-12 mb-3">
              <label for="prestamo-docente-select" class="form-label">Seleccione un Docente:</label>
              <select class="form-select" id="prestamo-docente-select">
                <option value="" selected>Seleccione un docente</option>
                <option value="Luis Felipe Buitrago Castro">Luis Felipe Buitrago Castro</option>
                <option value="Lusvin Javier Amado Forero">Lusvin Javier Amado Forero</option>
                <option value="Alejandro Arboleda Carvajal">Alejandro Arboleda Carvajal</option>
                <option value="Leidy Rocío Pico Martínez">Leidy Rocío Pico Martínez</option>
                <option value="Mateo Escobar Jaramillo">Mateo Escobar Jaramillo</option>
                <option value="Yeimy Liseth Quintana Villamizar">Yeimy Liseth Quintana Villamizar</option>
                <option value="Mario Fernando Morales Cordero">Mario Fernando Morales Cordero</option>
                <option value="Víctor Alfonso Solarte David">Víctor Alfonso Solarte David</option>
                <option value="Manuel Hernando Franco Arias">Manuel Hernando Franco Arias</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div class="col-md-12 mb-3" id="prestamo-otro-docente-container" style="display: none;">
              <label for="prestamo-otro-docente" class="form-label">Nombre del Docente:</label>
              <input type="text" class="form-control" id="prestamo-otro-docente" placeholder="Ingrese el nombre completo del docente">
            </div>
          </div>
        </div>
      `;
      
      // Insertar antes del contenido de selección de elemento
      const prestamoContent = prestamoSection.querySelector('.panel-content');
      prestamoContent.insertBefore(prestamoUsuarioContainer, prestamoContent.firstChild);
      
      // Configurar eventos de los botones de tipo de préstamo
      document.querySelectorAll('#tipo-prestamo-grupo button').forEach(button => {
        button.addEventListener('click', function() {
          // Eliminar clase activa de todos los botones
          document.querySelectorAll('#tipo-prestamo-grupo button').forEach(b => {
            b.classList.remove('active');
          });
          
          // Agregar clase activa al botón seleccionado
          this.classList.add('active');
          
          // Obtener el tipo de préstamo
          const tipoPrestamo = this.getAttribute('data-tipo');
          
          // Mostrar/ocultar contenedores correspondientes
          document.getElementById('prestamo-estudiante-container').style.display = tipoPrestamo === 'estudiante' ? 'block' : 'none';
          document.getElementById('prestamo-docente-container').style.display = tipoPrestamo === 'docente' ? 'block' : 'none';
        });
      });
      
      // Configurar evento para buscar estudiante
      document.getElementById('buscar-estudiante-prestamo').addEventListener('click', async function() {
        const estudianteId = document.getElementById('prestamo-estudiante-id').value.trim();
        
        if (!estudianteId) {
          mostrarNotificacion('Error', 'Por favor ingrese el ID del estudiante', 'error');
          return;
        }
        
        // Mostrar spinner o indicador de carga
        document.getElementById('buscar-estudiante-prestamo').innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Buscando...';
        document.getElementById('buscar-estudiante-prestamo').disabled = true;
        
        try {
          const respuesta = await buscarEstudiante(estudianteId);
          
          if (respuesta && respuesta.nombre) {
            document.getElementById('prestamo-estudiante-nombre').value = respuesta.nombre;
          } else {
            mostrarNotificacion('Error', 'Estudiante no encontrado', 'error');
            document.getElementById('prestamo-estudiante-nombre').value = '';
          }
        } catch (error) {
          mostrarNotificacion('Error', 'No se pudo buscar el estudiante: ' + error.message, 'error');
          document.getElementById('prestamo-estudiante-nombre').value = '';
        } finally {
          // Restaurar botón de búsqueda
          document.getElementById('buscar-estudiante-prestamo').innerHTML = '<i class="bi bi-search"></i> Buscar';
          document.getElementById('buscar-estudiante-prestamo').disabled = false;
        }
      });
      
      // Configurar evento para selector de docente
      document.getElementById('prestamo-docente-select').addEventListener('change', function() {
        document.getElementById('prestamo-otro-docente-container').style.display = 
          this.value === 'Otro' ? 'block' : 'none';
      });
    }
  }
  
  // Cargar categorías desde la API
  await cargarCategorias();
}

// Iniciar proceso de retorno
function iniciarRetorno() {
  // Ocultar la interfaz principal
  document.getElementById('interface').style.display = 'none';
  
  // Recuperar todos los préstamos o solo los del usuario actual según tipo de usuario
  let prestamos = JSON.parse(localStorage.getItem('prestamos') || '[]');
  
  // Si es laboratorista, muestra todos los préstamos activos; si no, solo los del usuario
  if (currentUser.tipo === 'laboratorista') {
    prestamos = prestamos.filter(p => p.estado === 'prestado');
  } else {
    prestamos = prestamos.filter(p => p.usuario_id === currentUser.id && p.estado === 'prestado');
  }
  
  // Crear y mostrar la sección de retorno
  const retornoSection = document.createElement('section');
  retornoSection.id = 'prestamos-section'; // Reutilizamos el mismo ID
  retornoSection.className = 'my-5';
  
  // Estructura del contenido
  const esLaboratorista = currentUser.tipo === 'laboratorista';
  const puedeDevolver = esLaboratorista; // Solo el laboratorista puede devolver elementos
  
  // Título para la sección
  const tituloSeccion = esLaboratorista ? 'RETORNO DE ELEMENTOS' : 'MIS PRÉSTAMOS ACTIVOS';
  
  retornoSection.innerHTML = `
    <div class="panel-container">
      <div class="panel-header d-flex justify-content-between align-items-center">
        <h2 class="panel-title">${tituloSeccion}</h2>
        <button class="btn btn-sm btn-outline-light" onclick="confirmarVolverAInterfaz()">Volver</button>
      </div>
      <div class="panel-content">
        ${prestamos.length > 0 ? `
          <p class="mb-4">${esLaboratorista ? 'Seleccione los elementos que desea devolver:' : 'Estos son tus elementos en préstamo actualmente:'}</p>
          
          <!-- Barra de búsqueda con estilo similar a Administrar Inventario -->
          ${esLaboratorista ? `
            <div class="row mb-4 align-items-end">
              <div class="col-md-12">
                <div class="input-group">
                  <span class="input-group-text">🔍</span>
                  <input type="text" class="form-control" id="buscar-prestamo" 
                    placeholder="Buscar por nombre de usuario o elemento" onkeyup="filtrarTablaRetornos()">
                </div>
              </div>
            </div>
          ` : ''}
          
          <div class="accordion" id="prestamos-accordion">
            <div class="accordion-item">
              <h2 class="accordion-header" id="heading-prestamos">
                <button class="accordion-button" type="button" data-bs-toggle="collapse" 
                  data-bs-target="#collapse-prestamos" aria-expanded="true" aria-controls="collapse-prestamos">
                  Préstamos Activos (${prestamos.length} elementos)
                </button>
              </h2>
              <div id="collapse-prestamos" class="accordion-collapse collapse show" aria-labelledby="heading-prestamos">
                <div class="accordion-body">
                  <div class="table-responsive">
                    <table class="table table-sm table-hover" id="tabla-retornos">
                      <thead>
                        <tr>
                          ${esLaboratorista ? '<th>Usuario</th>' : ''}
                          <th>Código</th>
                          <th>Elemento</th>
                          <th>Categoría</th>
                          <th>Cantidad</th>
                          <th>Fecha préstamo</th>
                          ${puedeDevolver ? '<th>Acciones</th>' : ''}
                        </tr>
                      </thead>
                      <tbody>
                        ${prestamos.map(prestamo => `
                          <tr>
                            ${esLaboratorista ? `<td>${prestamo.usuario_nombre}</td>` : ''}
                            <td>${prestamo.elemento_id}</td>
                            <td>${prestamo.elemento_nombre}</td>
                            <td>${prestamo.categoria || 'Sin categoría'}</td>
                            <td>${prestamo.cantidad}</td>
                            <td>${prestamo.fecha}</td>
                            ${puedeDevolver ? `
                            <td>
                              <button class="btn btn-sm btn-green" onclick="registrarDevolucion(${prestamo.id})">
                                Devolver elemento
                              </button>
                            </td>
                            ` : ''}
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ` : `
          <div class="alert alert-info">
            <p>No hay elementos pendientes por devolver.</p>
          </div>
        `}
        ${!esLaboratorista ? `
          <div class="alert alert-warning mt-3">
            <p><strong>Nota:</strong> Para devolver un elemento, debes acudir personalmente al laboratorio donde un laboratorista registrará la devolución.</p>
          </div>
        ` : ''}
      </div>
    </div>
  `;
  
  // Agregar a la página
  document.getElementById('interface').insertAdjacentElement('afterend', retornoSection);
  
  // Mostrar la sección
  retornoSection.style.display = 'block';
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
    <div class="panel-container">
      <div class="panel-header d-flex justify-content-between align-items-center">
        <h2 class="panel-title">CONSULTA DE INVENTARIO</h2>
        <button class="btn btn-sm btn-outline-light" onclick="confirmarVolverAInterfaz()">Volver</button>
      </div>
      <div class="panel-content">
        <!-- Filtros y búsqueda con estilo similar a Administrar Inventario -->
        <div class="row mb-4 align-items-end">
          <div class="col-md-4 mb-3">
            <label for="filtro-categoria" class="form-label">Filtrar por categoría:</label>
            <select class="form-select" id="filtro-categoria">
              <option value="">Todas las categorías</option>
              ${INVENTARIO.map(cat => `<option value="${cat.categoria}">${cat.categoria}</option>`).join('')}
            </select>
          </div>
          <div class="col-md-8 mb-3">
            <div class="input-group">
              <span class="input-group-text">🔍</span>
              <input type="text" class="form-control" id="filtro-nombre" 
                placeholder="Buscar por nombre de elemento" onkeyup="filtrarInventario()">
            </div>
          </div>
        </div>
        
        <!-- Inventario con acordeón similar a Administrar Inventario -->
        <div class="mt-4">
          <h5>Inventario actual</h5>
          <div class="accordion" id="inventario-consulta-accordion">
            ${INVENTARIO.map((categoria, index) => `
              <div class="accordion-item">
                <h2 class="accordion-header" id="heading-consulta-${index}">
                  <button class="accordion-button ${index === 0 ? '' : 'collapsed'}" type="button" data-bs-toggle="collapse" 
                    data-bs-target="#collapse-consulta-${index}" aria-expanded="${index === 0 ? 'true' : 'false'}" 
                    aria-controls="collapse-consulta-${index}">
                    ${categoria.categoria} (${categoria.elementos.length} elementos)
                  </button>
                </h2>
                <div id="collapse-consulta-${index}" class="accordion-collapse collapse ${index === 0 ? 'show' : ''}" 
                  aria-labelledby="heading-consulta-${index}">
                  <div class="accordion-body">
                    <div class="table-responsive">
                      <table class="table table-sm table-hover">
                        <thead>
                          <tr>
                            <th>Código</th>
                            <th>Nombre</th>
                            <th>Cantidad</th>
                            <th>Ubicación</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${categoria.elementos.map(elem => `
                            <tr class="inventario-fila" data-categoria="${categoria.categoria}" data-nombre="${elem.nombre.toLowerCase()}">
                              <td>${elem.id}</td>
                              <td>${elem.nombre}</td>
                              <td>${elem.cantidad}</td>
                              <td>${elem.ubicacion || 'No especificada'}</td>
                            </tr>
                          `).join('')}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
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
  const filtroNombre = document.getElementById('filtro-nombre').value.toLowerCase();
  
  // Nueva implementación para el acordeón
  if (document.getElementById('inventario-consulta-accordion')) {
    // Si estamos en la consulta de inventario con acordeón
    const filas = document.querySelectorAll('.inventario-fila');
    
    filas.forEach(fila => {
      const filaNombre = fila.getAttribute('data-nombre');
      const filaCategoria = fila.getAttribute('data-categoria');
      
      // Verificar si la fila cumple con los filtros
      const cumpleFiltroNombre = !filtroNombre || filaNombre.includes(filtroNombre);
      const cumpleFiltroCategoria = !filtroCategoria || filaCategoria === filtroCategoria;
      
      // Mostrar u ocultar según los filtros
      if (cumpleFiltroNombre && cumpleFiltroCategoria) {
        fila.style.display = '';
      } else {
        fila.style.display = 'none';
      }
    });
    
    // Mostrar u ocultar secciones del acordeón según los resultados
    const categorias = document.querySelectorAll('#inventario-consulta-accordion .accordion-item');
    categorias.forEach((categoria, index) => {
      const contenido = categoria.querySelector('.accordion-collapse');
      const filas = contenido.querySelectorAll('.inventario-fila');
      const filasVisibles = Array.from(filas).filter(fila => fila.style.display !== 'none');
      
      // Actualizar el contador en el título
      const boton = categoria.querySelector('.accordion-button');
      const nombreCategoria = boton.textContent.split('(')[0].trim();
      boton.textContent = `${nombreCategoria} (${filasVisibles.length} elementos)`;
      
      // Mostrar u ocultar la categoría completa
      if (filasVisibles.length === 0) {
        categoria.style.display = 'none';
      } else {
        categoria.style.display = '';
        // Si hay un filtro, expandir todas las categorías con resultados
        if (filtroNombre || filtroCategoria) {
          contenido.classList.add('show');
        }
      }
    });
  } else {
    // Implementación original para tabla simple
    const tbody = document.getElementById('inventario-tbody');
    if (tbody) {
      tbody.innerHTML = generarFilasInventario(filtroCategoria, filtroNombre);
    }
  }
}

// Administrar inventario (solo laboratorista)
function administrarInventario() {
  // Mostrar sección de administración
  document.getElementById('interface').style.display = 'none';
  
  const adminSection = document.getElementById('admin-section');
  adminSection.style.display = 'block';
  
  // Generar contenido
  adminSection.querySelector('.panel-content').innerHTML = `
    <div class="mb-4">
      <h4>Control de Inventario</h4>
      <p>Desde esta sección puede agregar, editar o eliminar elementos del inventario.</p>
    </div>
    
    <!-- Botones de acciones y búsqueda -->
    <div class="row mb-4 align-items-end">
      <div class="col-md-4">
        <button class="btn btn-green" onclick="mostrarFormularioNuevoElemento()">Agregar nuevo elemento</button>
      </div>
      <div class="col-md-8">
        <div class="input-group">
          <span class="input-group-text">🔍</span>
          <input type="text" class="form-control" id="buscar-elemento-inventario" 
            placeholder="Buscar por nombre o marca de elemento" onkeyup="filtrarInventarioAdmin()">
        </div>
      </div>
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
          <button type="button" class="btn btn-green" onclick="agregarNuevoElemento()">Guardar elemento</button>
        </div>
      </form>
    </div>
  `;
}

// Generar acordeón para el inventario
function generarAcordeonInventario(filtroTexto = '') {
  let html = '';
  let elementosVisibles = 0;
  let categoriasVisibles = 0;
  const filtroLower = filtroTexto.toLowerCase();
  
  INVENTARIO.forEach((categoria, index) => {
    // Filtrar elementos según búsqueda
    const elementosFiltrados = filtroTexto ? 
      categoria.elementos.filter(elem => 
        elem.nombre.toLowerCase().includes(filtroLower) || 
        (elem.descripcion && elem.descripcion.toLowerCase().includes(filtroLower))
      ) : 
      categoria.elementos;
    
    // Solo mostrar categorías con elementos después del filtro
    if (elementosFiltrados.length > 0) {
      categoriasVisibles++;
      elementosVisibles += elementosFiltrados.length;
      
      html += `
        <div class="accordion-item">
          <h2 class="accordion-header" id="heading-${index}">
            <button class="accordion-button ${index === 0 ? '' : 'collapsed'}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${index}" aria-expanded="${index === 0 ? 'true' : 'false'}" aria-controls="collapse-${index}">
              ${categoria.categoria} (${elementosFiltrados.length} elementos)
            </button>
          </h2>
          <div id="collapse-${index}" class="accordion-collapse collapse ${filtroTexto || index === 0 ? 'show' : ''}" aria-labelledby="heading-${index}">
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
                    ${elementosFiltrados.map(elem => `
                      <tr>
                        <td>${elem.id}</td>
                        <td>${elem.nombre}</td>
                        <td>${elem.cantidad}</td>
                        <td>${elem.ubicacion || 'No especificada'}</td>
                        <td>
                          <button class="btn btn-sm btn-green me-1" onclick="editarElemento(${elem.id})">Editar</button>
                          <button class="btn btn-sm btn-outline-light" onclick="eliminarElemento(${elem.id})">Eliminar</button>
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
    }
  });
  
  // Si no hay resultados, mostrar mensaje
  if (categoriasVisibles === 0) {
    html = `
      <div class="alert alert-info">
        <p>No se encontraron elementos que coincidan con el término de búsqueda: "${filtroTexto}"</p>
      </div>
    `;
  }
  
  return html;
}

// Filtrar inventario en la sección de administración
function filtrarInventarioAdmin() {
  const filtroTexto = document.getElementById('buscar-elemento-inventario').value.trim();
  const acordeonContainer = document.getElementById('accordion-inventario');
  
  // Regenerar el acordeón con el filtro aplicado
  acordeonContainer.innerHTML = generarAcordeonInventario(filtroTexto);
}

// Importar inventario desde archivo CSV
async function importarInventario() {
  // Mostrar diálogo de confirmación
  mostrarConfirmacion(
    'Importar Inventario', 
    'Se importarán los elementos desde el archivo CSV proporcionado. Este proceso puede tardar unos momentos. ¿Desea continuar?',
    async () => {
      try {
        // Llamar a la API para importar
        const resultado = await importarInventarioCSV();
        
        if (resultado && resultado.success) {
          // Recargar la página después de 2 segundos para mostrar los cambios
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      } catch (error) {
        console.error('Error importando inventario:', error);
        mostrarNotificacion('Error', 'No se pudo importar el inventario', 'error');
      }
    }
  );
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
  // Buscar el elemento en todas las categorías
  let elementoAEditar = null;
  let categoriaElemento = null;
  
  INVENTARIO.forEach(categoria => {
    const elemento = categoria.elementos.find(elem => elem.id === elementoId);
    if (elemento) {
      elementoAEditar = elemento;
      categoriaElemento = categoria;
    }
  });
  
  if (!elementoAEditar) {
    mostrarNotificacion('Error', 'No se pudo encontrar el elemento para editar', 'error');
    return;
  }
  
  // Crear formulario de edición
  const adminBody = document.querySelector('#admin-section .panel-content');
  
  // Ocultar acordeón de inventario
  const inventarioActual = adminBody.querySelector('.mt-4');
  if (inventarioActual) {
    inventarioActual.style.display = 'none';
  }
  
  // Crear y mostrar formulario de edición
  const formEditarHtml = `
    <div id="editar-elemento-form" class="mt-4 p-3 border rounded">
      <h5>Editar elemento</h5>
      <form id="form-editar-elemento">
        <div class="row">
          <div class="col-md-6 mb-3">
            <label for="editar-codigo" class="form-label">Código:</label>
            <input type="text" class="form-control" id="editar-codigo" value="${elementoAEditar.id}" readonly>
            <small class="form-text text-muted">El código no se puede modificar</small>
          </div>
          <div class="col-md-6 mb-3">
            <label for="editar-nombre" class="form-label">Nombre:</label>
            <input type="text" class="form-control" id="editar-nombre" value="${elementoAEditar.nombre}" required>
          </div>
          <div class="col-md-6 mb-3">
            <label for="editar-categoria" class="form-label">Categoría:</label>
            <select class="form-select" id="editar-categoria" required>
              ${INVENTARIO.map(cat => `
                <option value="${cat.categoria}" ${cat.categoria === categoriaElemento.categoria ? 'selected' : ''}>
                  ${cat.categoria}
                </option>
              `).join('')}
            </select>
          </div>
          <div class="col-md-6 mb-3">
            <label for="editar-cantidad" class="form-label">Cantidad:</label>
            <input type="number" class="form-control" id="editar-cantidad" min="0" value="${elementoAEditar.cantidad}" required>
          </div>
          <div class="col-md-6 mb-3">
            <label for="editar-ubicacion" class="form-label">Ubicación:</label>
            <input type="text" class="form-control" id="editar-ubicacion" value="${elementoAEditar.ubicacion || ''}">
          </div>
          <div class="col-12 mb-3">
            <label for="editar-descripcion" class="form-label">Descripción:</label>
            <textarea class="form-control" id="editar-descripcion" rows="3">${elementoAEditar.descripcion || ''}</textarea>
          </div>
        </div>
        <div class="d-flex justify-content-end">
          <button type="button" class="btn btn-secondary me-2" onclick="cancelarEdicion()">Cancelar</button>
          <button type="button" class="btn btn-green" onclick="guardarEdicionElemento(${elementoId})">Guardar cambios</button>
        </div>
      </form>
    </div>
  `;
  
  // Insertar formulario
  adminBody.insertAdjacentHTML('beforeend', formEditarHtml);
  
  // Ocultar otros formularios
  const nuevoElementoForm = document.getElementById('nuevo-elemento-form');
  if (nuevoElementoForm) {
    nuevoElementoForm.style.display = 'none';
  }
  
  // Scroll hasta el formulario
  document.getElementById('editar-elemento-form').scrollIntoView({ behavior: 'smooth' });
}

// Cancelar edición de elemento
function cancelarEdicion() {
  // Eliminar formulario de edición
  const editarForm = document.getElementById('editar-elemento-form');
  if (editarForm) {
    editarForm.remove();
  }
  
  // Mostrar acordeón de inventario
  const inventarioActual = document.querySelector('#admin-section .panel-content .mt-4');
  if (inventarioActual) {
    inventarioActual.style.display = 'block';
  }
}

// Guardar cambios de edición
function guardarEdicionElemento(elementoId) {
  // Recuperar valores del formulario
  const nombre = document.getElementById('editar-nombre').value;
  const categoriaNombre = document.getElementById('editar-categoria').value;
  const cantidad = parseInt(document.getElementById('editar-cantidad').value);
  const ubicacion = document.getElementById('editar-ubicacion').value;
  const descripcion = document.getElementById('editar-descripcion').value;
  
  // Validaciones básicas
  if (!nombre || !categoriaNombre || isNaN(cantidad)) {
    mostrarNotificacion('Error', 'Todos los campos marcados son obligatorios', 'error');
    return;
  }
  
  // Encontrar elemento y categoría actual
  let elementoEncontrado = false;
  let categoriaOriginal = null;
  let indiceElemento = -1;
  
  INVENTARIO.forEach(categoria => {
    const index = categoria.elementos.findIndex(elem => elem.id === elementoId);
    if (index !== -1) {
      elementoEncontrado = true;
      categoriaOriginal = categoria;
      indiceElemento = index;
    }
  });
  
  if (!elementoEncontrado) {
    mostrarNotificacion('Error', 'No se pudo encontrar el elemento para actualizar', 'error');
    return;
  }
  
  // Crear objeto con datos actualizados
  const elementoActualizado = {
    ...categoriaOriginal.elementos[indiceElemento],
    nombre: nombre,
    cantidad: cantidad,
    ubicacion: ubicacion,
    descripcion: descripcion
  };
  
  // Si cambió la categoría, mover el elemento
  if (categoriaNombre !== categoriaOriginal.categoria) {
    // Encontrar nueva categoría
    const nuevaCategoria = INVENTARIO.find(cat => cat.categoria === categoriaNombre);
    if (!nuevaCategoria) {
      mostrarNotificacion('Error', 'Categoría destino no encontrada', 'error');
      return;
    }
    
    // Eliminar de categoría original
    categoriaOriginal.elementos.splice(indiceElemento, 1);
    
    // Agregar a nueva categoría
    nuevaCategoria.elementos.push(elementoActualizado);
  } else {
    // Actualizar en misma categoría
    categoriaOriginal.elementos[indiceElemento] = elementoActualizado;
  }
  
  // Mostrar confirmación y actualizar vista
  mostrarNotificacion('Éxito', 'Elemento actualizado correctamente', 'success');
  administrarInventario();
}

// Eliminar elemento
function eliminarElemento(elementoId) {
  // Buscar el elemento para mostrar su nombre
  let nombreElemento = "este elemento";
  INVENTARIO.forEach(categoria => {
    const elemento = categoria.elementos.find(elem => elem.id === elementoId);
    if (elemento) {
      nombreElemento = elemento.nombre;
    }
  });
  
  mostrarConfirmacion(
    'Eliminar elemento',
    `¿Está seguro que desea eliminar "${nombreElemento}"?<br>Esta acción no se puede deshacer.`,
    () => {
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
  );
}

// Confirmar eliminación de elemento
function confirmarEliminarElemento() {
  mostrarNotificacion('Información', 'Seleccione el elemento que desea eliminar en la lista de inventario', 'info');
}

// Volver a interfaz principal con confirmación
function confirmarVolverAInterfaz() {
  mostrarConfirmacion(
    'Volver al menú principal',
    '¿Está seguro que desea volver al menú principal? Los cambios no guardados se perderán.',
    () => {
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
  );
}

// Consultar préstamos (laboratorista y docente)
function consultarPrestamos() {
  // Ocultar la interfaz principal
  document.getElementById('interface').style.display = 'none';
  
  // Crear y mostrar la sección de consulta de préstamos
  const prestamosSection = document.createElement('section');
  prestamosSection.id = 'prestamos-section';
  prestamosSection.className = 'my-5';
  
  // Recuperar todos los préstamos
  let prestamos = JSON.parse(localStorage.getItem('prestamos') || '[]');
  
  // Si es laboratorista, muestra todos los préstamos; si es docente, solo los suyos
  const esLaboratorista = currentUser.tipo === 'laboratorista';
  const prestamosAMostrar = esLaboratorista ? prestamos : prestamos.filter(p => p.usuario_id === currentUser.id);
  
  // Estructura del contenido
  prestamosSection.innerHTML = `
    <div class="panel-container">
      <div class="panel-header d-flex justify-content-between align-items-center">
        <h2 class="panel-title">CONSULTA DE PRÉSTAMOS</h2>
        <button class="btn btn-sm btn-outline-light" onclick="confirmarVolverAInterfaz()">Volver</button>
      </div>
      <div class="panel-content">
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
              <button class="btn btn-green w-100" onclick="filtrarPrestamos()">Filtrar</button>
            </div>
          </div>
        </div>
        
        <!-- Tabla de préstamos -->
        ${prestamosAMostrar.length > 0 ? `
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
                ${generarFilasPrestamos(prestamosAMostrar)}
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
    
    // Filtro por usuario (busca tanto en nombre de usuario como en quien realizó el préstamo)
    let matchUsuario = true;
    if (filtroUsuario) {
      const busqueda = filtroUsuario.toLowerCase();
      const nombreUsuario = prestamo.usuario_nombre.toLowerCase();
      const prestadoPor = prestamo.prestado_por ? prestamo.prestado_por.toLowerCase() : '';
      
      matchUsuario = nombreUsuario.includes(busqueda) || prestadoPor.includes(busqueda);
    }
    
    return matchEstado && matchUsuario;
  });
  
  // Generar filas
  if (prestamosFiltered.length > 0) {
    prestamosFiltered.forEach(prestamo => {
      // Indicador para préstamos realizados por laboratorista en nombre de otro usuario
      const prestadoPorLab = prestamo.prestado_por ? 
        `<span class="small text-muted d-block">Registrado por: ${prestamo.prestado_por}</span>` : '';
      
      // Indicador del tipo de usuario
      const tipoUsuario = prestamo.usuario_tipo ? 
        `<span class="badge bg-secondary ms-1">${prestamo.usuario_tipo.charAt(0).toUpperCase() + prestamo.usuario_tipo.slice(1)}</span>` : '';
      
      // Obtener información de devolución si existe
      const observaciones = prestamo.estado === 'devuelto' && prestamo.observaciones ? 
        `<div class="mt-1 small">
          <strong>Observación:</strong> <span class="${getEstadoObservacionClass(prestamo.observaciones)}">${prestamo.observaciones}</span>
          ${prestamo.fecha_devolucion ? `<span class="small d-block text-muted">Devuelto: ${prestamo.fecha_devolucion}</span>` : ''}
        </div>` : '';
      
      html += `
        <tr>
          <td>${prestamo.id}</td>
          <td>${prestamo.elemento_nombre}</td>
          <td>${prestamo.cantidad}</td>
          <td>
            ${prestamo.usuario_nombre} ${tipoUsuario}
            ${prestadoPorLab}
          </td>
          <td>${prestamo.fecha}</td>
          <td>
            <span class="badge ${prestamo.estado === 'prestado' ? 'bg-warning' : 'bg-green'}">
              ${prestamo.estado}
            </span>
            ${observaciones}
          </td>
          <td>
            ${prestamo.estado === 'prestado' ? 
              `<button class="btn btn-sm btn-green" onclick="registrarDevolucion(${prestamo.id})">
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
  
  // Recuperar todos los préstamos
  const prestamos = JSON.parse(localStorage.getItem('prestamos') || '[]');
  
  // Filtrar según el tipo de usuario
  const esLaboratorista = currentUser.tipo === 'laboratorista';
  const prestamosAMostrar = esLaboratorista ? prestamos : prestamos.filter(p => p.usuario_id === currentUser.id);
  
  const tbody = document.getElementById('prestamos-tbody');
  
  if (tbody) {
    tbody.innerHTML = generarFilasPrestamos(prestamosAMostrar, filtroEstado, filtroUsuario);
  }
}

// Registrar devolución de un elemento
function registrarDevolucion(prestamoId) {
  // Obtener información del préstamo para mostrarla en el formulario de devolución
  let prestamos = JSON.parse(localStorage.getItem('prestamos') || '[]');
  const index = prestamos.findIndex(p => p.id === prestamoId);
  
  if (index === -1) {
    mostrarNotificacion('Error', 'No se pudo encontrar el préstamo', 'error');
    return;
  }
  
  const prestamo = prestamos[index];
  
  // Crear modal personalizado para devolución con observaciones
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'custom-modal-overlay';
  
  const modal = document.createElement('div');
  modal.className = 'custom-modal';
  
  modal.innerHTML = `
    <div class="custom-modal-header warning">
      <h3>Confirmar devolución</h3>
    </div>
    <div class="custom-modal-body">
      <div class="mb-3">
        <p><strong>Préstamo a devolver:</strong> ${prestamo.elemento_nombre}</p>
        <p><strong>Cantidad:</strong> ${prestamo.cantidad} unidad(es)</p>
        <p><strong>Usuario:</strong> ${prestamo.usuario_nombre}</p>
      </div>
      <div class="mb-3">
        <label for="devolucion-observacion" class="form-label">Observaciones sobre el estado:</label>
        <select class="form-select" id="devolucion-observacion">
          <option value="Funciona correctamente">Funciona correctamente</option>
          <option value="No funciona / presenta fallas">No funciona / presenta fallas</option>
          <option value="Faltan accesorios / partes incompletas">Faltan accesorios / partes incompletas</option>
          <option value="Daños visibles (físicos)">Daños visibles (físicos)</option>
          <option value="Requiere mantenimiento / calibración">Requiere mantenimiento / calibración</option>
          <option value="No fue utilizado">No fue utilizado</option>
          <option value="Contaminado / sucio">Contaminado / sucio</option>
          <option value="Pendiente por revisión técnica">Pendiente por revisión técnica</option>
          <option value="Reportado como defectuoso por el usuario">Reportado como defectuoso por el usuario</option>
          <option value="No requiere devolución">No requiere devolución</option>
          <option value="Otro">Otro</option>
        </select>
      </div>
      <div class="mb-3" id="otra-observacion-container" style="display: none;">
        <label for="otra-observacion" class="form-label">Especifique:</label>
        <input type="text" class="form-control" id="otra-observacion" placeholder="Ingrese la observación">
      </div>
    </div>
    <div class="custom-modal-footer">
      <button class="custom-btn custom-btn-secondary" id="cancelar-devolucion-btn">Cancelar</button>
      <button class="custom-btn custom-btn-primary" id="confirmar-devolucion-btn">Confirmar devolución</button>
    </div>
  `;
  
  modalOverlay.appendChild(modal);
  document.getElementById('custom-modal-container').appendChild(modalOverlay);
  
  // Animar entrada
  setTimeout(() => {
    modalOverlay.classList.add('active');
    modal.classList.add('active');
  }, 10);
  
  // Configurar evento para mostrar/ocultar campo de otra observación
  document.getElementById('devolucion-observacion').addEventListener('change', function() {
    document.getElementById('otra-observacion-container').style.display = 
      this.value === 'Otro' ? 'block' : 'none';
  });
  
  // Manejar cancelación
  document.getElementById('cancelar-devolucion-btn').addEventListener('click', () => {
    modalOverlay.classList.remove('active');
    modal.classList.remove('active');
    setTimeout(() => modalOverlay.remove(), 300);
  });
  
  // Manejar confirmación
  document.getElementById('confirmar-devolucion-btn').addEventListener('click', () => {
    // Obtener la observación seleccionada
    const observacionSelect = document.getElementById('devolucion-observacion');
    let observacion = observacionSelect.value;
    
    // Si se seleccionó "Otro", obtener el texto especificado
    if (observacion === 'Otro') {
      const otraObservacion = document.getElementById('otra-observacion').value.trim();
      if (!otraObservacion) {
        mostrarNotificacion('Error', 'Por favor especifique la observación', 'error');
        return;
      }
      observacion = otraObservacion;
    }
    
    // Cerrar el modal
    modalOverlay.classList.remove('active');
    modal.classList.remove('active');
    
    setTimeout(() => {
      modalOverlay.remove();
      
      // Actualizar estado del préstamo
      prestamo.estado = 'devuelto';
      prestamo.fecha_devolucion = new Date().toLocaleString();
      prestamo.observaciones = observacion;
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
      
      // Actualizar solo la fila correspondiente al préstamo devuelto
      // Primero verificamos si estamos en la vista de préstamos o retornos
      const esVistaRetornos = document.getElementById('tabla-retornos') !== null;
      
      if (esVistaRetornos) {
        // Estamos en la sección de retorno, actualizar la tabla de retornos
        const filaElement = document.querySelector(`button[onclick="registrarDevolucion(${prestamoId})"]`).closest('tr');
        if (filaElement) {
          // Eliminar la fila de la tabla de retornos (porque ya no está prestado)
          filaElement.remove();
          
          // Verificar si no quedan más préstamos y mostrar mensaje si es necesario
          const tbody = document.querySelector('#tabla-retornos tbody');
          if (tbody && tbody.children.length === 0) {
            const tabla = document.querySelector('#tabla-retornos').closest('.table-responsive');
            if (tabla) {
              tabla.innerHTML = `
                <div class="alert alert-info">
                  <p>No hay elementos pendientes por devolver.</p>
                </div>
              `;
            }
          }
        }
      } else {
        // Estamos en la sección de consulta de préstamos, actualizar solo esa fila
        const filaElement = document.querySelector(`button[onclick="registrarDevolucion(${prestamoId})"]`).closest('tr');
        if (filaElement) {
          // Actualizar el estado y el botón
          const celdaEstado = filaElement.querySelector('td:nth-child(6)');
          const celdaAcciones = filaElement.querySelector('td:nth-child(7)');
          
          if (celdaEstado) {
            celdaEstado.innerHTML = `
              <span class="badge bg-green">
                devuelto
              </span>
            `;
          }
          
          if (celdaAcciones) {
            celdaAcciones.innerHTML = `<button class="btn btn-sm btn-secondary" disabled>Devuelto</button>`;
          }
        }
      }
    });
  });
}

// Filtrar la tabla de retornos (para laboratoristas)
function filtrarTablaRetornos() {
  const busqueda = document.getElementById('buscar-prestamo').value.toLowerCase();
  const tabla = document.getElementById('tabla-retornos');
  const filas = tabla.getElementsByTagName('tr');
  
  for (let i = 1; i < filas.length; i++) { // Empezar desde 1 para saltar el encabezado
    const fila = filas[i];
    const celdas = fila.getElementsByTagName('td');
    let mostrar = false;
    
    // Buscar en todas las celdas de la fila
    for (let j = 0; j < celdas.length; j++) {
      const texto = celdas[j].textContent.toLowerCase();
      if (texto.includes(busqueda)) {
        mostrar = true;
        break;
      }
    }
    
    // Mostrar u ocultar la fila
    fila.style.display = mostrar ? '' : 'none';
  }
}

// Volver a la interfaz principal desde cualquier módulo
function volverAInterfazPrincipal() {
  // Ocultar todas las secciones secundarias
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
  
  // Variables para el usuario del préstamo (pueden cambiar si el laboratorista presta a otro usuario)
  let usuarioId = currentUser.id;
  let usuarioNombre = currentUser.nombre;
  let usuarioTipo = currentUser.tipo;
  let mensajeAdicional = '';
  
  // Si es laboratorista, verificar si está prestando a otro usuario
  if (currentUser.tipo === 'laboratorista') {
    const tipoPrestamo = document.querySelector('#tipo-prestamo-grupo button.active')?.getAttribute('data-tipo');
    
    if (tipoPrestamo === 'estudiante') {
      // Verificar que se haya buscado un estudiante
      const estudianteNombre = document.getElementById('prestamo-estudiante-nombre').value.trim();
      const estudianteId = document.getElementById('prestamo-estudiante-id').value.trim();
      
      if (!estudianteNombre || !estudianteId) {
        mostrarNotificacion('Error', 'Por favor busque un estudiante válido', 'error');
        return;
      }
      
      usuarioNombre = estudianteNombre;
      usuarioId = 'est_' + estudianteId; // Prefijo para distinguir
      usuarioTipo = 'estudiante';
      mensajeAdicional = `\n\nEl préstamo se registrará a nombre del estudiante: ${estudianteNombre}`;
    } 
    else if (tipoPrestamo === 'docente') {
      // Verificar que se haya seleccionado un docente
      const docenteSelect = document.getElementById('prestamo-docente-select');
      let docenteNombre = docenteSelect.value;
      
      if (docenteNombre === 'Otro') {
        docenteNombre = document.getElementById('prestamo-otro-docente').value.trim();
        if (!docenteNombre) {
          mostrarNotificacion('Error', 'Por favor ingrese el nombre del docente', 'error');
          return;
        }
      } else if (!docenteNombre) {
        mostrarNotificacion('Error', 'Por favor seleccione un docente', 'error');
        return;
      }
      
      usuarioNombre = docenteNombre;
      usuarioId = 'doc_' + Date.now(); // ID temporal
      usuarioTipo = 'docente';
      mensajeAdicional = `\n\nEl préstamo se registrará a nombre del docente: ${docenteNombre}`;
    }
  }
  
  // Confirmar el préstamo
  mostrarConfirmacion(
    'Confirmar préstamo',
    `¿Confirma el préstamo de ${cantidad} unidad(es) de ${categoriaSeleccionada.categoria} - ${elementoSeleccionado.nombre}?${mensajeAdicional}`,
    () => {
      // Simular préstamo (en un sistema real, se usaría la API)
      // Actualizar cantidad disponible en tiempo real
      elementoSeleccionado.cantidad -= cantidad;
      
      // Registrar el préstamo (en un sistema real, se almacenaría en la BD)
      const prestamo = {
        id: Date.now(),
        elemento_id: elementoSeleccionado.id,
        elemento_nombre: elementoSeleccionado.nombre,
        categoria: categoriaSeleccionada.categoria,
        cantidad: cantidad,
        fecha: new Date().toLocaleString(),
        usuario_id: usuarioId,
        usuario_nombre: usuarioNombre,
        usuario_tipo: usuarioTipo,
        prestado_por: currentUser.tipo === 'laboratorista' ? currentUser.nombre : null,
        estado: 'prestado'
      };
      
      // Almacenar préstamo en localStorage para simular persistencia
      // En un sistema real, esto se enviaría al servidor
      let prestamos = JSON.parse(localStorage.getItem('prestamos') || '[]');
      prestamos.push(prestamo);
      localStorage.setItem('prestamos', JSON.stringify(prestamos));
      
      // Mostrar opciones post-préstamo
      mostrarOpcionesPostPrestamo(prestamo);
    }
  );
}

// Mostrar opciones post-préstamo
function mostrarOpcionesPostPrestamo(prestamo) {
  // Crear el modal personalizado
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'custom-modal-overlay';
  
  const modal = document.createElement('div');
  modal.className = 'custom-modal';
  
  modal.innerHTML = `
    <div class="custom-modal-header success">
      <h3>¡Préstamo exitoso!</h3>
    </div>
    <div class="custom-modal-body">
      <div class="confirmation-icon">
        <i class="fas fa-check-circle"></i>
      </div>
      <div class="confirmation-text">
        <p>Se ha registrado el préstamo de ${prestamo.cantidad} unidad(es) de ${prestamo.categoria} - ${prestamo.elemento_nombre} a nombre de ${prestamo.usuario_nombre}.</p>
        ${prestamo.prestado_por ? 
          `<p class="mt-2"><small>Préstamo registrado por: ${prestamo.prestado_por} (Laboratorista)</small></p>` : 
          ''}
        <p class="mt-3"><strong>¿Qué desea hacer ahora?</strong></p>
      </div>
    </div>
    <div class="custom-modal-footer">
      <button class="custom-btn custom-btn-secondary" id="volver-panel-btn">VOLVER A PÁGINA PRINCIPAL</button>
      <button class="custom-btn custom-btn-primary" id="nuevo-prestamo-btn">REALIZAR OTRO PRÉSTAMO</button>
    </div>
  `;
  
  modalOverlay.appendChild(modal);
  document.getElementById('custom-modal-container').appendChild(modalOverlay);
  
  // Animar entrada
  setTimeout(() => {
    modalOverlay.classList.add('active');
    modal.classList.add('active');
  }, 10);
  
  // Manejar opción de nuevo préstamo
  document.getElementById('nuevo-prestamo-btn').addEventListener('click', () => {
    modalOverlay.classList.remove('active');
    modal.classList.remove('active');
    
    setTimeout(() => {
      modalOverlay.remove();
      
      // Reiniciar el formulario de préstamo
      document.getElementById('categoria-select').value = '';
      document.getElementById('elemento-select').innerHTML = '<option value="">Selecciona un elemento</option>';
      document.getElementById('elemento-select').disabled = true;
      document.getElementById('cantidad-input').value = '1';
      document.getElementById('cantidad-input').disabled = true;
      document.getElementById('prestamo-btn').disabled = true;
      document.getElementById('elemento-detalles').style.display = 'none';
      
      // Reiniciar campos específicos para laboratoristas
      if (currentUser.tipo === 'laboratorista') {
        // Establecer el primer botón (préstamo propio) como activo
        document.querySelectorAll('#tipo-prestamo-grupo button').forEach((btn, index) => {
          btn.classList.toggle('active', index === 0);
        });
        
        // Ocultar contenedores de estudiante y docente
        document.getElementById('prestamo-estudiante-container').style.display = 'none';
        document.getElementById('prestamo-docente-container').style.display = 'none';
        
        // Reiniciar campos de estudiante
        if (document.getElementById('prestamo-estudiante-id')) {
          document.getElementById('prestamo-estudiante-id').value = '';
          document.getElementById('prestamo-estudiante-nombre').value = '';
        }
        
        // Reiniciar campos de docente
        if (document.getElementById('prestamo-docente-select')) {
          document.getElementById('prestamo-docente-select').value = '';
          document.getElementById('prestamo-otro-docente-container').style.display = 'none';
          document.getElementById('prestamo-otro-docente').value = '';
        }
      }
      
      // Volver a cargar categorías
      cargarCategorias();
    }, 300);
  });
  
  // Manejar opción de volver al panel
  document.getElementById('volver-panel-btn').addEventListener('click', () => {
    modalOverlay.classList.remove('active');
    modal.classList.remove('active');
    
    setTimeout(() => {
      modalOverlay.remove();
      volverAInterfazPrincipal();
    }, 300);
  });
}

// Inicializar modales personalizados
function initCustomModals() {
  // Mostrar el botón de inicio después de un tiempo
  setTimeout(() => {
    const homeButton = document.getElementById('home-button');
    if (homeButton) {
      homeButton.style.display = 'flex';
    }
  }, 5000);
}

// Volver a la selección de usuario (pantalla de inicio)
function volverASeleccionUsuario() {
  // Resetear el estado de la aplicación
  currentUser = { id: null, tipo: null, nombre: null };
  elementoSeleccionado = null;
  categoriaSeleccionada = null;
  
  // Ocultar todas las secciones
  document.getElementById('auth-section').style.display = 'none';
  document.getElementById('interface').style.display = 'none';
  document.getElementById('prestamo-section').style.display = 'none';
  document.getElementById('admin-section').style.display = 'none';
  
  // Eliminar secciones dinámicas
  const inventarioSection = document.getElementById('inventario-section');
  if (inventarioSection) inventarioSection.remove();
  
  const prestamosSection = document.getElementById('prestamos-section');
  if (prestamosSection) prestamosSection.remove();
  
  // Mostrar selección de usuario
  document.getElementById('user-selection').style.display = 'block';
}

// Mostrar notificación al usuario
function mostrarNotificacion(titulo, mensaje, tipo = 'info', autoCloseMs = 0) {
  // Crear el modal personalizado
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'custom-modal-overlay';
  
  const modal = document.createElement('div');
  modal.className = 'custom-modal';
  
  modal.innerHTML = `
    <div class="custom-modal-header ${tipo}">
      <h3>${titulo}</h3>
    </div>
    <div class="custom-modal-body">
      ${mensaje}
    </div>
    <div class="custom-modal-footer">
      <button class="custom-btn custom-btn-primary" id="modal-ok-btn">Aceptar</button>
    </div>
  `;
  
  modalOverlay.appendChild(modal);
  document.getElementById('custom-modal-container').appendChild(modalOverlay);
  
  // Animar entrada
  setTimeout(() => {
    modalOverlay.classList.add('active');
    modal.classList.add('active');
  }, 10);
  
  // Función para cerrar el modal
  const cerrarModal = () => {
    modalOverlay.classList.remove('active');
    modal.classList.remove('active');
    
    setTimeout(() => {
      modalOverlay.remove();
    }, 300);
  };
  
  // Manejar cierre con botón
  document.getElementById('modal-ok-btn').addEventListener('click', cerrarModal);
  
  // Auto-cierre si se especifica un tiempo
  if (autoCloseMs > 0) {
    setTimeout(cerrarModal, autoCloseMs);
  }
  
  // Devolver el objeto modal para operaciones adicionales
  return { overlay: modalOverlay, modal, close: cerrarModal };
}

// Mostrar confirmación al usuario
function mostrarConfirmacion(titulo, mensaje, onConfirm, onCancel) {
  // Crear el modal personalizado
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'custom-modal-overlay';
  
  const modal = document.createElement('div');
  modal.className = 'custom-modal';
  
  modal.innerHTML = `
    <div class="custom-modal-header warning">
      <h3>${titulo}</h3>
    </div>
    <div class="custom-modal-body">
      <div class="confirmation-icon">
        <i class="fas fa-question-circle"></i>
      </div>
      <div class="confirmation-text">
        ${mensaje.replace(/\n/g, '<br>')}
      </div>
    </div>
    <div class="custom-modal-footer">
      <button class="custom-btn custom-btn-secondary" id="modal-cancel-btn">Cancelar</button>
      <button class="custom-btn custom-btn-primary" id="modal-confirm-btn">Confirmar</button>
    </div>
  `;
  
  modalOverlay.appendChild(modal);
  document.getElementById('custom-modal-container').appendChild(modalOverlay);
  
  // Animar entrada
  setTimeout(() => {
    modalOverlay.classList.add('active');
    modal.classList.add('active');
  }, 10);
  
  // Manejar confirmación
  document.getElementById('modal-confirm-btn').addEventListener('click', () => {
    modalOverlay.classList.remove('active');
    modal.classList.remove('active');
    
    setTimeout(() => {
      modalOverlay.remove();
      if (typeof onConfirm === 'function') onConfirm();
    }, 300);
  });
  
  // Manejar cancelación
  document.getElementById('modal-cancel-btn').addEventListener('click', () => {
    modalOverlay.classList.remove('active');
    modal.classList.remove('active');
    
    setTimeout(() => {
      modalOverlay.remove();
      if (typeof onCancel === 'function') onCancel();
    }, 300);
  });
}


// ======= MÓDULO DE REPORTES PARA LABORATORISTA =======

/**
 * Mostrar el módulo completo de reportes
 */
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
            <div class="card-body" id="contenido-reporte">
              <div class="text-center p-4">
                <p class="text-muted">Seleccione un tipo de reporte para comenzar</p>
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
    
    // Cargar reporte de préstamos por defecto
    generarReportePrestamos();
  }, 200);
}

async function generarReportePrestamos() {
  try {
    mostrarCargandoReporte();
    actualizarTituloReporte("Reporte de Préstamos Realizados");
    activarBotonReporte(0);
    
    const filtros = obtenerFiltrosReporte();
    const params = new URLSearchParams(filtros);
    
    const response = await fetch(`/api/reportes/prestamos?${params}`);
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    mostrarReportePrestamos(data);
    
  } catch (error) {
    console.error("Error generando reporte de préstamos:", error);
    mostrarErrorReporte(`Error generando reporte: ${error.message}`);
  }
}

async function generarReporteEstudiantes() {
  try {
    mostrarCargandoReporte();
    actualizarTituloReporte("Ranking de Estudiantes por Número de Préstamos");
    activarBotonReporte(1);
    
    const filtros = obtenerFiltrosReporte();
    const params = new URLSearchParams(filtros);
    
    const response = await fetch(`/api/reportes/estudiantes?${params}`);
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    mostrarReporteEstudiantes(data);
    
  } catch (error) {
    console.error("Error generando reporte de estudiantes:", error);
    mostrarErrorReporte(`Error generando reporte: ${error.message}`);
  }
}

async function generarReporteDocentes() {
  try {
    mostrarCargandoReporte();
    actualizarTituloReporte("Ranking de Docentes por Uso de Insumos");
    activarBotonReporte(2);
    
    const filtros = obtenerFiltrosReporte();
    const params = new URLSearchParams(filtros);
    
    const response = await fetch(`/api/reportes/docentes?${params}`);
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    mostrarReporteDocentes(data);
    
  } catch (error) {
    console.error("Error generando reporte de docentes:", error);
    mostrarErrorReporte(`Error generando reporte: ${error.message}`);
  }
}

async function generarReporteMaterias() {
  try {
    mostrarCargandoReporte();
    actualizarTituloReporte("Ranking de Materias por Uso de Insumos");
    activarBotonReporte(3);
    
    const filtros = obtenerFiltrosReporte();
    const params = new URLSearchParams(filtros);
    
    const response = await fetch(`/api/reportes/materias?${params}`);
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    mostrarReporteMaterias(data);
    
  } catch (error) {
    console.error("Error generando reporte de materias:", error);
    mostrarErrorReporte(`Error generando reporte: ${error.message}`);
  }
}

async function generarReporteProductos() {
  try {
    mostrarCargandoReporte();
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
    
    mostrarReporteProductos(data);
    
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
  
  if (fechaInicio) filtros.fecha_inicio = fechaInicio;
  if (fechaFin) filtros.fecha_fin = fechaFin;
  if (tipoUsuario) filtros.tipo_usuario = tipoUsuario;
  if (materia) filtros.materia = materia;
  
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
            <th>Tipo</th>
            <th>Elemento</th>
            <th>Cantidad</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          ${data.prestamos.length > 0 ? data.prestamos.map(prestamo => `
            <tr>
              <td>${formatearFechaReporte(prestamo.fecha_prestamo)}</td>
              <td>${prestamo.usuario_nombre || "N/A"}</td>
              <td>
                <span class="badge ${prestamo.usuario_tipo === "estudiante" ? "bg-primary" : "bg-success"}">
                  ${prestamo.usuario_tipo}
                </span>
              </td>
              <td>${prestamo.elemento_nombre || "N/A"}</td>
              <td><span class="badge bg-info">${prestamo.cantidad}</span></td>
              <td>
                <span class="badge ${obtenerClaseEstadoReporte(prestamo.estado)}">
                  ${prestamo.estado}
                </span>
              </td>
            </tr>
          `).join("") : "<tr><td colspan=\"6\" class=\"text-center\">No se encontraron préstamos</td></tr>"}
        </tbody>
      </table>
    </div>
  `;
  
  document.getElementById("contenido-reporte").innerHTML = contenido;
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
            <th>Identificación</th>
            <th>Nombre</th>
            <th>Materia</th>
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
              <td>${estudiante.materia || "N/A"}</td>
              <td>
                <span class="badge bg-primary fs-6">${estudiante.total_prestamos}</span>
              </td>
            </tr>
          `).join("") : "<tr><td colspan=\"5\" class=\"text-center\">No se encontraron estudiantes</td></tr>"}
        </tbody>
      </table>
    </div>
  `;
  
  document.getElementById("contenido-reporte").innerHTML = contenido;
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
            <th>Número de Préstamos</th>
            <th>Total Productos</th>
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
              <td>
                <span class="badge bg-info">${docente.numero_prestamos}</span>
              </td>
              <td>
                <span class="badge bg-primary fs-6">${docente.total_productos}</span>
              </td>
            </tr>
          `).join("") : "<tr><td colspan=\"4\" class=\"text-center\">No se encontraron docentes</td></tr>"}
        </tbody>
      </table>
    </div>
  `;
  
  document.getElementById("contenido-reporte").innerHTML = contenido;
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
  
  document.getElementById("contenido-reporte").innerHTML = contenido;
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
            <th>Código</th>
            <th>Producto</th>
            <th>Categoría</th>
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
              <td><code>${producto.codigo}</code></td>
              <td>${producto.nombre}</td>
              <td><span class="badge bg-secondary">${producto.categoria}</span></td>
              <td>
                <span class="badge bg-primary fs-6">${producto.total_solicitado}</span>
              </td>
            </tr>
          `).join("") : "<tr><td colspan=\"5\" class=\"text-center\">No se encontraron productos</td></tr>"}
        </tbody>
      </table>
    </div>
  `;
  
  document.getElementById("contenido-reporte").innerHTML = contenido;
}

function mostrarCargandoReporte() {
  document.getElementById("contenido-reporte").innerHTML = `
    <div class="text-center p-5">
      <div class="spinner-border text-success" role="status">
        <span class="visually-hidden">Generando reporte...</span>
      </div>
      <p class="mt-3">Generando reporte...</p>
    </div>
  `;
}

function mostrarErrorReporte(mensaje) {
  document.getElementById("contenido-reporte").innerHTML = `
    <div class="alert alert-danger">
      <strong>Error:</strong> ${mensaje}
    </div>
  `;
}

function actualizarTituloReporte(titulo) {
  document.getElementById("titulo-reporte").textContent = titulo;
}

function activarBotonReporte(indice) {
  const botones = document.querySelectorAll("#reportes-section .btn-group .btn");
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
  switch (estado) {
    case "prestado": return "bg-warning";
    case "devuelto": return "bg-success";
    case "vencido": return "bg-danger";
    default: return "bg-secondary";
  }
}

function exportarReportePDF() {
  mostrarNotificacion("Exportación a PDF", "Funcionalidad en desarrollo", "info");
}

function exportarReporteExcel() {
  mostrarNotificacion("Exportación a Excel", "Funcionalidad en desarrollo", "info");
}
