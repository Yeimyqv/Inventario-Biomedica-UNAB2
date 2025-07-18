

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

// PINes ahora se manejan individualmente desde la base de datos

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
  
  // Cargar dropdowns dinámicos
  cargarDocentesActivos();
  cargarMateriasActivas();
  cargarDocentesAuth();
  cargarLaboratoristasAuth();
  
  // Mostrar directamente la selección de usuario (ya no hay sección lab-selection)
  document.getElementById('user-selection').style.display = 'block';
  
  // Cargar el inventario desde la base de datos en segundo plano
  try {
    console.log('Iniciando carga del inventario...');
    const loadingMsg = mostrarNotificacion('Cargando', 'Cargando datos del sistema...', 'info', 3000);
    
    INVENTARIO = await cargarInventarioDesdeDB();
    console.log(`Inventario cargado exitosamente: ${INVENTARIO.length} categorías`);
    
    // Verificar que los datos se cargaron correctamente
    if (INVENTARIO.length === 0) {
      console.error('INVENTARIO está vacío después de cargar');
      mostrarNotificacion('Advertencia', 'No se encontraron categorías en el inventario', 'warning', 5000);
    } else {
      console.log('Primeras 3 categorías cargadas:', INVENTARIO.slice(0, 3).map(cat => cat.categoria));
    }
    
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
    
    // Verificar PIN contra la base de datos de forma asíncrona
    verificarPinUsuario(currentUser.tipo, currentUser.nombre, pin)
      .then(esValido => {
        console.log(`PIN verification result for ${currentUser.nombre}: ${esValido}`);
        if (esValido) {
          // PIN correcto, buscar datos del usuario y cargar interfaz
          console.log('PIN correcto, buscando datos del usuario...');
          buscarUsuarioPorTipoYNombre(currentUser.tipo, currentUser.nombre)
            .then(usuarioData => {
              if (usuarioData) {
                currentUser.id = usuarioData.id;
                currentUser.identificacion = usuarioData.identificacion;
                currentUser.correo = usuarioData.correo;
                console.log(`Usuario autenticado exitosamente - ID: ${currentUser.id}`);
              } else {
                currentUser.id = Date.now();
                console.warn(`Usuario "${currentUser.nombre}" no encontrado, usando ID temporal`);
              }
              cargarInterfazPrincipal();
            })
            .catch(error => {
              console.error('Error buscando usuario:', error);
              currentUser.id = Date.now();
              cargarInterfazPrincipal();
            });
        } else {
          mostrarNotificacion('Error', 'PIN incorrecto', 'error');
        }
      })
      .catch(error => {
        console.error('Error verificando PIN:', error);
        mostrarNotificacion('Error', 'Error al verificar credenciales', 'error');
      });
    return; // Salir de la función para esperar la verificación asíncrona
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
  
  // Solo llamar a continuarAutenticacion para estudiantes
  if (currentUser.tipo === 'estudiante') {
    continuarAutenticacion();
  }
}

// Verificar PIN del usuario contra la base de datos
async function verificarPinUsuario(tipo, nombre, pin) {
  try {
    const response = await fetch(`/api/admin/usuarios?tipo=${tipo}`);
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    const usuario = data.usuarios.find(u => u.nombre === nombre && u.activo);
    
    if (!usuario) {
      console.error(`Usuario ${tipo} "${nombre}" no encontrado o inactivo`);
      return false;
    }
    
    // Verificar si el PIN coincide
    return usuario.pin === pin;
  } catch (error) {
    console.error('Error verificando PIN:', error);
    return false;
  }
}

// Continuar con la autenticación para estudiantes
function continuarAutenticacion() {
  // Para estudiantes, buscar el ID real en la base de datos
  if (currentUser.tipo === 'estudiante' && currentUser.id_estudiante) {
    buscarEstudiante(currentUser.id_estudiante)
      .then(estudianteData => {
        if (estudianteData) {
          currentUser.id = estudianteData.id;
          console.log('Estudiante autenticado con ID real:', currentUser.id);
        } else {
          currentUser.id = Date.now();
          console.warn('Estudiante no encontrado en la base de datos, usando ID temporal');
        }
        cargarInterfazPrincipal();
      })
      .catch(error => {
        console.error('Error buscando estudiante:', error);
        currentUser.id = Date.now();
        cargarInterfazPrincipal();
      });
  } else {
    // Para otros tipos de usuario, usar timestamp temporal
    currentUser.id = Date.now();
    cargarInterfazPrincipal();
  }
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
            <div class="col-md-4 mb-3">
              <div class="panel-module">
                <h3 class="module-title">REPORTES Y ESTADÍSTICAS</h3>
                <p class="module-desc">Generar reportes detallados del laboratorio</p>
                <button class="btn btn-success" onclick="mostrarModuloReportes()">GENERAR REPORTES</button>
              </div>
            </div>
            <div class="col-md-4 mb-3">
              <div class="panel-module">
                <h3 class="module-title">ADMINISTRAR USUARIOS</h3>
                <p class="module-desc">Gestionar estudiantes, docentes y materias</p>
                <button class="btn btn-warning" onclick="mostrarModuloAdmin()">ADMINISTRAR SISTEMA</button>
              </div>
            </div>
            <div class="col-md-4 mb-3">
              <div class="panel-module">
                <h3 class="module-title">REINICIAR PRÉSTAMOS</h3>
                <p class="module-desc">Eliminar todos los préstamos y empezar de cero</p>
                <button class="btn btn-danger" onclick="reiniciarPrestamos()">REINICIAR SISTEMA</button>
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

// Función para reiniciar todos los préstamos (solo laboratoristas)
async function reiniciarPrestamos() {
  if (currentUser.tipo !== 'laboratorista') {
    mostrarNotificacion('Error', 'Solo los laboratoristas pueden reiniciar el sistema de préstamos', 'error');
    return;
  }
  
  // Primero obtener estadísticas actuales
  try {
    const response = await fetch('/api/reportes/prestamos');
    const data = await response.json();
    const totalPrestamos = data.prestamos ? data.prestamos.length : 0;
    const prestamosActivos = data.prestamos ? data.prestamos.filter(p => p.estado === 'prestado').length : 0;
    
    // Crear modal de confirmación
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'custom-modal-overlay';
    
    const modal = document.createElement('div');
    modal.className = 'custom-modal';
    
    modal.innerHTML = `
      <div class="custom-modal-header danger">
        <h3>⚠️ REINICIAR SISTEMA DE PRÉSTAMOS</h3>
      </div>
      <div class="custom-modal-body">
        <div class="alert alert-danger mb-3">
          <strong>¡ATENCIÓN!</strong> Esta acción eliminará TODOS los registros de préstamos del sistema.
        </div>
        <div class="mb-3">
          <p><strong>Estadísticas actuales:</strong></p>
          <ul>
            <li>Total de préstamos en el sistema: <strong>${totalPrestamos}</strong></li>
            <li>Préstamos activos (no devueltos): <strong>${prestamosActivos}</strong></li>
            <li>Préstamos devueltos: <strong>${totalPrestamos - prestamosActivos}</strong></li>
          </ul>
        </div>
        <div class="mb-3">
          <p><strong>Esta acción:</strong></p>
          <ul>
            <li>❌ Eliminará todos los registros de préstamos</li>
            <li>❌ Eliminará todo el historial de devoluciones</li>
            <li>❌ Reiniciará todas las estadísticas</li>
            <li>✅ Mantendrá el inventario y usuarios intactos</li>
            <li>✅ Restaurará todas las cantidades disponibles</li>
          </ul>
        </div>
        <div class="mb-3">
          <label class="form-label">Para confirmar, escribe <strong>REINICIAR</strong> en el campo:</label>
          <input type="text" class="form-control" id="confirmar-reinicio" placeholder="Escribe REINICIAR para confirmar">
        </div>
      </div>
      <div class="custom-modal-footer">
        <button class="custom-btn custom-btn-secondary" id="cancelar-reinicio-btn">Cancelar</button>
        <button class="custom-btn custom-btn-danger" id="confirmar-reinicio-btn" disabled>REINICIAR SISTEMA</button>
      </div>
    `;
    
    modalOverlay.appendChild(modal);
    document.getElementById('custom-modal-container').appendChild(modalOverlay);
    
    // Animar entrada
    setTimeout(() => {
      modalOverlay.classList.add('active');
      modal.classList.add('active');
    }, 10);
    
    // Habilitar botón de confirmación solo si se escribe "REINICIAR"
    const confirmarInput = document.getElementById('confirmar-reinicio');
    const confirmarBtn = document.getElementById('confirmar-reinicio-btn');
    
    confirmarInput.addEventListener('input', function() {
      confirmarBtn.disabled = this.value.trim().toUpperCase() !== 'REINICIAR';
    });
    
    // Manejar cancelación
    document.getElementById('cancelar-reinicio-btn').addEventListener('click', function() {
      modalOverlay.classList.remove('active');
      modal.classList.remove('active');
      setTimeout(() => {
        modalOverlay.remove();
      }, 300);
    });
    
    // Manejar confirmación
    confirmarBtn.addEventListener('click', async function() {
      try {
        // Deshabilitar botón para evitar múltiples clics
        confirmarBtn.disabled = true;
        confirmarBtn.textContent = 'Procesando...';
        
        // Llamar a la API para reiniciar préstamos
        const resetResponse = await fetch('/api/admin/reiniciar-prestamos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            laboratorista_id: currentUser.id,
            laboratorista_nombre: currentUser.nombre
          })
        });
        
        if (resetResponse.ok) {
          const resultado = await resetResponse.json();
          
          // Cerrar modal
          modalOverlay.classList.remove('active');
          modal.classList.remove('active');
          setTimeout(() => {
            modalOverlay.remove();
          }, 300);
          
          // Mostrar notificación de éxito
          mostrarNotificacion(
            'Éxito', 
            `Sistema reiniciado exitosamente. Se eliminaron ${resultado.prestamos_eliminados} préstamos y se restauraron ${resultado.elementos_restaurados} elementos.`, 
            'success', 
            8000
          );
          
          // Recargar la página para actualizar todos los datos
          setTimeout(() => {
            window.location.reload();
          }, 2000);
          
        } else {
          const error = await resetResponse.json();
          throw new Error(error.message || 'Error al reiniciar el sistema');
        }
        
      } catch (error) {
        console.error('Error reiniciando sistema:', error);
        mostrarNotificacion('Error', `Error al reiniciar el sistema: ${error.message}`, 'error');
        
        // Reactivar botón
        confirmarBtn.disabled = false;
        confirmarBtn.textContent = 'REINICIAR SISTEMA';
      }
    });
    
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    mostrarNotificacion('Error', 'Error al obtener estadísticas del sistema', 'error');
  }
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
  
  // Si el usuario es laboratorista, mostrar información del préstamo
  if (currentUser.tipo === 'laboratorista') {
    // Verificar si ya existe el contenedor de préstamo por usuario
    let prestamoUsuarioContainer = document.getElementById('prestamo-usuario-container');
    
    if (!prestamoUsuarioContainer) {
      // Crear contenedor para mostrar información del préstamo
      prestamoUsuarioContainer = document.createElement('div');
      prestamoUsuarioContainer.id = 'prestamo-usuario-container';
      prestamoUsuarioContainer.className = 'row mb-4 border-bottom pb-3';
      
      // Contenido del contenedor - solo mostrar información del laboratorista
      prestamoUsuarioContainer.innerHTML = `
        <div class="col-12 mb-3">
          <div class="alert alert-info" role="alert">
            <h5 class="alert-heading">Préstamo de Laboratorio</h5>
            <p class="mb-0">Este préstamo se registrará a nombre del laboratorio: <strong>${currentUser.nombre}</strong></p>
            <small class="text-muted">Los laboratoristas solo pueden realizar préstamos a nombre propio.</small>
          </div>
        </div>
      `;
      
      // Insertar antes del contenido de selección de elemento
      const prestamoContent = prestamoSection.querySelector('.panel-content');
      prestamoContent.insertBefore(prestamoUsuarioContainer, prestamoContent.firstChild);
      
      // No se necesitan eventos adicionales para laboratorista
      // El préstamo se hará automáticamente a nombre del laboratorista
    }
  }
  
  // Cargar categorías desde la API
  await cargarCategorias();
}

// Iniciar proceso de retorno
async function iniciarRetorno() {
  // Ocultar la interfaz principal
  document.getElementById('interface').style.display = 'none';
  
  try {
    // Recuperar todos los préstamos desde la API
    const response = await fetch('/api/reportes/prestamos');
    const data = await response.json();
    let prestamos = data.prestamos || [];
    
    // Transformar datos para compatibilidad
    prestamos = prestamos.map(prestamo => ({
      id: prestamo.id,
      codigo: prestamo.elemento_codigo,
      elemento_nombre: prestamo.elemento_nombre,
      categoria: prestamo.categoria || 'Sin categoría',
      cantidad: prestamo.cantidad,
      usuario_nombre: prestamo.usuario_nombre,
      usuario_id: prestamo.usuario_id,
      usuario_tipo: prestamo.usuario_tipo,
      fecha: prestamo.fecha_prestamo,
      estado: prestamo.estado
    }));
    
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
  
  } catch (error) {
    console.error('Error cargando préstamos para retorno:', error);
    // Crear sección con mensaje de error
    const retornoSection = document.createElement('section');
    retornoSection.id = 'prestamos-section';
    retornoSection.className = 'my-5';
    retornoSection.innerHTML = `
      <div class="panel-container">
        <div class="panel-header d-flex justify-content-between align-items-center">
          <h2 class="panel-title">RETORNO DE ELEMENTOS</h2>
          <button class="btn btn-sm btn-outline-light" onclick="confirmarVolverAInterfaz()">Volver</button>
        </div>
        <div class="panel-content">
          <div class="alert alert-danger">
            Error al cargar los préstamos: ${error.message}
          </div>
        </div>
      </div>
    `;
    document.getElementById('interface').insertAdjacentElement('afterend', retornoSection);
  }
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
async function consultarPrestamos() {
  // Ocultar la interfaz principal
  document.getElementById('interface').style.display = 'none';
  
  // Crear y mostrar la sección de consulta de préstamos
  const prestamosSection = document.createElement('section');
  prestamosSection.id = 'prestamos-section';
  prestamosSection.className = 'my-5';
  
  // Recuperar todos los préstamos desde la API
  try {
    const response = await fetch('/api/reportes/prestamos');
    const data = await response.json();
    let prestamos = data.prestamos || [];
    
    // Transformar datos para compatibilidad con la interfaz existente
    prestamos = prestamos.map(prestamo => ({
      id: prestamo.id,
      elemento_nombre: prestamo.elemento_nombre,
      cantidad: prestamo.cantidad,
      usuario_nombre: prestamo.usuario_nombre,
      usuario_id: prestamo.usuario_id,
      usuario_tipo: prestamo.usuario_tipo,
      fecha: prestamo.fecha_prestamo,
      estado: prestamo.estado,
      observaciones: prestamo.observaciones,
      fecha_devolucion: prestamo.fecha_devolucion_real
    }));
    
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
  
  } catch (error) {
    console.error('Error cargando préstamos:', error);
    // Crear sección con mensaje de error
    prestamosSection.innerHTML = `
      <div class="panel-container">
        <div class="panel-header d-flex justify-content-between align-items-center">
          <h2 class="panel-title">CONSULTA DE PRÉSTAMOS</h2>
          <button class="btn btn-sm btn-outline-light" onclick="confirmarVolverAInterfaz()">Volver</button>
        </div>
        <div class="panel-content">
          <div class="alert alert-danger">
            Error al cargar los préstamos: ${error.message}
          </div>
        </div>
      </div>
    `;
    document.getElementById('interface').insertAdjacentElement('afterend', prestamosSection);
  }
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
async function filtrarPrestamos() {
  const filtroEstado = document.getElementById('filtro-estado').value;
  const filtroUsuario = document.getElementById('filtro-usuario').value;
  
  try {
    // Recuperar todos los préstamos desde la API
    const response = await fetch('/api/reportes/prestamos');
    const data = await response.json();
    let prestamos = data.prestamos || [];
    
    // Transformar datos para compatibilidad
    prestamos = prestamos.map(prestamo => ({
      id: prestamo.id,
      elemento_nombre: prestamo.elemento_nombre,
      cantidad: prestamo.cantidad,
      usuario_nombre: prestamo.usuario_nombre,
      usuario_id: prestamo.usuario_id,
      usuario_tipo: prestamo.usuario_tipo,
      fecha: prestamo.fecha_prestamo,
      estado: prestamo.estado,
      observaciones: prestamo.observaciones,
      fecha_devolucion: prestamo.fecha_devolucion_real
    }));
    
    // Filtrar según el tipo de usuario
    const esLaboratorista = currentUser.tipo === 'laboratorista';
    const prestamosAMostrar = esLaboratorista ? prestamos : prestamos.filter(p => p.usuario_id === currentUser.id);
    
    const tbody = document.getElementById('prestamos-tbody');
    
    if (tbody) {
      tbody.innerHTML = generarFilasPrestamos(prestamosAMostrar, filtroEstado, filtroUsuario);
    }
  } catch (error) {
    console.error('Error cargando préstamos:', error);
    const tbody = document.getElementById('prestamos-tbody');
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Error al cargar préstamos</td></tr>';
    }
  }
}

// Registrar devolución de un elemento
async function registrarDevolucion(prestamoId) {
  try {
    // Hacer una llamada a la API para obtener información del préstamo
    const response = await fetch(`/api/prestamo/${prestamoId}`);
    
    if (!response.ok) {
      throw new Error('Préstamo no encontrado');
    }
    
    const prestamo = await response.json();
  
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
        <p><strong>Préstamo a devolver:</strong> ${prestamo.elemento?.nombre || 'Elemento'}</p>
        <p><strong>Cantidad:</strong> ${prestamo.cantidad} unidad(es)</p>
        <p><strong>Usuario:</strong> ${prestamo.usuario?.nombre || 'Usuario'}</p>
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
  document.getElementById('confirmar-devolucion-btn').addEventListener('click', async () => {
    try {
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
      
      // Hacer llamada a la API para registrar la devolución
      const response = await fetch('/api/retornar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prestamo_id: prestamoId,
          observaciones: observacion
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al procesar la devolución');
      }
      
      const result = await response.json();
      
      // Cerrar modal
      modalOverlay.classList.remove('active');
      modal.classList.remove('active');
      setTimeout(() => modalOverlay.remove(), 300);
      
      // Mostrar confirmación
      mostrarNotificacion('Éxito', result.mensaje || 'Elemento devuelto correctamente', 'success');
      
      // Refrescar los reportes si están abiertos
      console.log('Llamando a actualizarReportesEnTiempoReal después de devolución...');
      actualizarReportesEnTiempoReal();
      
      // Actualizar la vista
      const esVistaRetornos = document.getElementById('tabla-retornos') !== null;
      
      if (esVistaRetornos) {
        // Estamos en la sección de retorno, eliminar la fila
        const filaElement = document.querySelector(`button[onclick="registrarDevolucion(${prestamoId})"]`).closest('tr');
        if (filaElement) {
          filaElement.remove();
          
          // Verificar si no quedan más préstamos
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
        // Actualizar el estado en la tabla de consulta
        const filaElement = document.querySelector(`button[onclick="registrarDevolucion(${prestamoId})"]`).closest('tr');
        if (filaElement) {
          const celdaEstado = filaElement.querySelector('td:nth-child(6)');
          const celdaAcciones = filaElement.querySelector('td:nth-child(7)');
          
          if (celdaEstado) {
            celdaEstado.innerHTML = `<span class="badge bg-success">devuelto</span>`;
          }
          
          if (celdaAcciones) {
            celdaAcciones.innerHTML = `<button class="btn btn-sm btn-secondary" disabled>Devuelto</button>`;
          }
        }
      }
      
    } catch (error) {
      console.error('Error al procesar devolución:', error);
      mostrarNotificacion('Error', error.message || 'Error al procesar la devolución', 'error');
    }
  });
  
  } catch (error) {
    console.error('Error al obtener información del préstamo:', error);
    mostrarNotificacion('Error', 'No se pudo encontrar el préstamo', 'error');
  }
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
  
  // Ocultar sección de reportes si existe
  const reportesSection = document.getElementById('reportes-section');
  if (reportesSection) {
    reportesSection.style.display = 'none';
  }
  
  // Mostrar la interfaz principal y recargar el contenido
  document.getElementById('interface').style.display = 'block';
  cargarInterfazPrincipal();
}

// Cargar categorías desde la API
async function cargarCategorias() {
  try {
    console.log('Intentando cargar categorías...');
    const categoriaSelect = document.getElementById('categoria-select');
    
    if (!categoriaSelect) {
      console.error('Elemento categoria-select no encontrado');
      return;
    }
    
    console.log('Elemento categoria-select encontrado, limpiando opciones...');
    categoriaSelect.innerHTML = '<option value="">Selecciona una categoría</option>';
    
    // Cargar categorías desde la API
    console.log('Haciendo petición a /api/categorias...');
    const response = await fetch('/api/categorias');
    if (!response.ok) {
      throw new Error('Error al cargar categorías');
    }
    
    const categorias = await response.json();
    console.log('Categorías recibidas:', categorias.length);
    
    categorias.forEach(categoria => {
      const option = document.createElement('option');
      option.value = categoria.id;
      option.textContent = categoria.nombre;
      categoriaSelect.appendChild(option);
    });
    
    // Rehabilitar el select
    categoriaSelect.disabled = false;
    console.log('Categorías cargadas exitosamente');
    
  } catch (error) {
    console.error('Error al cargar categorías:', error);
    mostrarNotificación('Error', 'No se pudieron cargar las categorías', 'error');
  }
}

// Cargar docentes activos desde la API
async function cargarDocentesActivos() {
  try {
    console.log('Cargando docentes activos...');
    const docenteSelect = document.getElementById('estudiante-docente');
    
    if (!docenteSelect) {
      console.log('No se encontró el elemento estudiante-docente');
      return;
    }
    
    const response = await fetch('/api/docentes-activos');
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Docentes activos recibidos:', data);
    
    // Limpiar opciones existentes manteniendo la primera opción
    docenteSelect.innerHTML = '<option value="" selected>Seleccione un docente</option>';
    
    if (data.docentes && data.docentes.length > 0) {
      data.docentes.forEach(docente => {
        const option = document.createElement('option');
        option.value = docente.nombre;
        option.textContent = docente.nombre;
        docenteSelect.appendChild(option);
      });
      
      // Agregar opción "Otro" al final
      const otroOption = document.createElement('option');
      otroOption.value = 'Otro';
      otroOption.textContent = 'Otro';
      docenteSelect.appendChild(otroOption);
      
      console.log(`Se cargaron ${data.docentes.length} docentes activos`);
    } else {
      console.log('No se encontraron docentes activos');
    }
  } catch (error) {
    console.error('Error al cargar docentes activos:', error);
    // No mostrar notificación para evitar spam, solo log
  }
}

// Cargar materias activas desde la API
async function cargarMateriasActivas() {
  try {
    console.log('Cargando materias activas...');
    const materiaSelect = document.getElementById('estudiante-materia');
    
    if (!materiaSelect) {
      console.log('No se encontró el elemento estudiante-materia');
      return;
    }
    
    const response = await fetch('/api/materias-activas');
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Materias activas recibidas:', data);
    
    // Limpiar opciones existentes manteniendo la primera opción
    materiaSelect.innerHTML = '<option value="" selected>Seleccione una materia</option>';
    
    if (data.materias && data.materias.length > 0) {
      data.materias.forEach(materia => {
        const option = document.createElement('option');
        option.value = materia.nombre;
        option.textContent = materia.nombre;
        materiaSelect.appendChild(option);
      });
      
      // Agregar opción "Otra" al final
      const otraOption = document.createElement('option');
      otraOption.value = 'Otra';
      otraOption.textContent = 'Otra';
      materiaSelect.appendChild(otraOption);
      
      console.log(`Se cargaron ${data.materias.length} materias activas`);
    } else {
      console.log('No se encontraron materias activas');
    }
  } catch (error) {
    console.error('Error al cargar materias activas:', error);
    // No mostrar notificación para evitar spam, solo log
  }
}

// Cargar docentes activos para autenticación
async function cargarDocentesAuth() {
  try {
    console.log('Cargando docentes para autenticación...');
    const docenteAuthSelect = document.getElementById('docente-select');
    
    if (!docenteAuthSelect) {
      console.log('No se encontró el elemento docente-select');
      return;
    }
    
    const response = await fetch('/api/docentes-activos');
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Docentes para autenticación recibidos:', data);
    
    // Limpiar opciones existentes
    docenteAuthSelect.innerHTML = '<option value="" selected>Seleccione su nombre</option>';
    
    if (data.docentes && data.docentes.length > 0) {
      data.docentes.forEach(docente => {
        const option = document.createElement('option');
        option.value = docente.nombre;
        option.textContent = docente.nombre;
        docenteAuthSelect.appendChild(option);
      });
      
      // Agregar opción "Otro" al final
      const otroOption = document.createElement('option');
      otroOption.value = 'Otro';
      otroOption.textContent = 'Otro';
      docenteAuthSelect.appendChild(otroOption);
      
      console.log(`Se cargaron ${data.docentes.length} docentes para autenticación`);
    } else {
      console.log('No se encontraron docentes para autenticación');
    }
  } catch (error) {
    console.error('Error al cargar docentes para autenticación:', error);
  }
}

// Cargar laboratoristas activos para autenticación
async function cargarLaboratoristasAuth() {
  try {
    console.log('Cargando laboratoristas para autenticación...');
    const labAuthSelect = document.getElementById('laboratorista-select');
    
    if (!labAuthSelect) {
      console.log('No se encontró el elemento laboratorista-select');
      return;
    }
    
    const response = await fetch('/api/admin/usuarios?tipo=laboratorista');
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Laboratoristas para autenticación recibidos:', data);
    
    // Limpiar opciones existentes
    labAuthSelect.innerHTML = '<option value="" selected>Seleccione su nombre</option>';
    
    if (data.usuarios && data.usuarios.length > 0) {
      data.usuarios.forEach(laboratorista => {
        const option = document.createElement('option');
        option.value = laboratorista.nombre;
        option.textContent = laboratorista.nombre;
        labAuthSelect.appendChild(option);
      });
      
      console.log(`Se cargaron ${data.usuarios.length} laboratoristas para autenticación`);
    } else {
      console.log('No se encontraron laboratoristas para autenticación');
    }
  } catch (error) {
    console.error('Error al cargar laboratoristas para autenticación:', error);
  }
}

// Manejar selección de categoría
async function onCategoriaSeleccionada(event) {
  const categoriaId = event.target.value;
  
  if (!categoriaId) {
    // Limpiar y deshabilitar elementos dependientes
    const elementoSelect = document.getElementById('elemento-select');
    elementoSelect.innerHTML = '<option value="">Selecciona un elemento</option>';
    elementoSelect.disabled = true;
    document.getElementById('cantidad-input').disabled = true;
    document.getElementById('prestamo-btn').disabled = true;
    return;
  }
  
  // Cargar elementos de esa categoría desde la API
  await cargarElementosPorCategoria(categoriaId);
}

// Cargar elementos por categoría
async function cargarElementosPorCategoria(categoriaId) {
  try {
    const elementoSelect = document.getElementById('elemento-select');
    elementoSelect.innerHTML = '<option value="">Selecciona un elemento</option>';
    
    // Cargar elementos desde la API
    const response = await fetch(`/api/elementos/categoria/${categoriaId}`);
    if (!response.ok) {
      throw new Error('Error al cargar elementos');
    }
    
    const elementos = await response.json();
    
    elementos.forEach(elemento => {
      const option = document.createElement('option');
      option.value = elemento.id;
      option.textContent = `${elemento.nombre} (Disponible: ${elemento.disponibles})`;
      option.disabled = elemento.disponibles <= 0;
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
async function onElementoSeleccionado(event) {
  const elementoId = event.target.value;
  
  if (!elementoId) {
    // Limpiar y deshabilitar elementos dependientes
    document.getElementById('cantidad-input').disabled = true;
    document.getElementById('prestamo-btn').disabled = true;
    document.getElementById('elemento-detalles').innerHTML = '<p class="text-muted">Selecciona un elemento para ver sus detalles</p>';
    return;
  }
  
  try {
    // Cargar detalles del elemento desde la API
    const response = await fetch(`/api/elemento/${elementoId}`);
    if (!response.ok) {
      throw new Error('Error al cargar detalles del elemento');
    }
    
    elementoSeleccionado = await response.json();
    
    // Mostrar detalles del elemento
    mostrarDetallesElemento(elementoSeleccionado);
    
    // Habilitar campos dependientes
    const cantidadInput = document.getElementById('cantidad-input');
    cantidadInput.disabled = false;
    cantidadInput.max = elementoSeleccionado.disponibles;
    cantidadInput.value = 1;
    
    document.getElementById('prestamo-btn').disabled = false;
  } catch (error) {
    console.error('Error al cargar elemento:', error);
    mostrarNotificacion('Error', 'No se pudieron cargar los detalles del elemento', 'error');
  }
}

// Mostrar detalles del elemento seleccionado
function mostrarDetallesElemento(elemento) {
  const detallesContainer = document.getElementById('elemento-detalles');
  
  detallesContainer.innerHTML = `
    <div class="row">
      <div class="col-md-6">
        <p><strong>Nombre:</strong> ${elemento.nombre}</p>
        <p><strong>Código:</strong> ${elemento.codigo}</p>
        <p><strong>Disponibles:</strong> ${elemento.disponibles}</p>
        <p><strong>Ubicación:</strong> ${elemento.ubicacion || 'No especificada'}</p>
      </div>
      <div class="col-md-6">
        <p><strong>Descripción:</strong> ${elemento.descripcion || 'Sin descripción'}</p>
      </div>
    </div>
  `;
  
  // Mostrar imagen del elemento (o placeholder si no hay imagen)
  const imagenContainer = document.getElementById('elemento-imagen');
  imagenContainer.innerHTML = `<img src="/img/placeholder.svg" alt="${elemento.nombre}" class="img-fluid" />`;
}

// Realizar préstamo del elemento
async function realizarPrestamo() {
  const cantidadInput = document.getElementById('cantidad-input');
  const cantidad = parseInt(cantidadInput.value);
  
  if (isNaN(cantidad) || cantidad <= 0) {
    mostrarNotificacion('Error', 'La cantidad debe ser un número positivo', 'error');
    return;
  }
  
  if (cantidad > elementoSeleccionado.disponibles) {
    mostrarNotificacion('Error', 'No hay suficientes unidades disponibles', 'error');
    return;
  }
  
  // Variables para el usuario del préstamo (pueden cambiar si el laboratorista presta a otro usuario)
  let usuarioId = currentUser.id;
  let usuarioNombre = currentUser.nombre;
  let usuarioTipo = currentUser.tipo;
  let mensajeAdicional = '';
  
  // Si es estudiante, buscar el ID real en la base de datos
  if (currentUser.tipo === 'estudiante') {
    const estudianteData = await buscarEstudiante(currentUser.id_estudiante);
    if (!estudianteData) {
      mostrarNotificacion('Error', 'No se pudo encontrar tu información en la base de datos', 'error');
      return;
    }
    usuarioId = estudianteData.id; // Usar el ID real del estudiante
  }
  
  // Si es docente, verificar que tenga un ID válido
  if (currentUser.tipo === 'docente') {
    console.log('Verificando docente:', currentUser.nombre, 'ID actual:', currentUser.id);
    
    if (!currentUser.id || currentUser.id === Date.now() || !Number.isInteger(currentUser.id)) {
      // Si no tiene un ID válido, buscar en la base de datos
      console.log('Buscando docente en la base de datos:', currentUser.nombre);
      const docenteData = await buscarUsuarioPorTipoYNombre('docente', currentUser.nombre);
      console.log('Resultado de búsqueda:', docenteData);
      
      if (!docenteData) {
        mostrarNotificacion('Error', `No se pudo encontrar la información del docente "${currentUser.nombre}" en la base de datos. Verifica que tu nombre esté registrado exactamente como aparece en la lista.`, 'error');
        return;
      }
      usuarioId = docenteData.id; // Usar el ID real del docente
      console.log('ID del docente encontrado:', usuarioId);
    }
    mensajeAdicional = `\n\nEl préstamo se registrará a nombre del docente: ${currentUser.nombre}`;
  }
  
  // Los laboratoristas solo pueden hacer préstamos a nombre propio
  if (currentUser.tipo === 'laboratorista') {
    // Los laboratoristas solo pueden prestar a nombre propio
    mensajeAdicional = `\n\nEl préstamo se registrará a nombre del laboratorio: ${currentUser.nombre}`;
  }
  
  // Confirmar el préstamo
  console.log('Datos finales del préstamo:');
  console.log('- Elemento ID:', elementoSeleccionado.id);
  console.log('- Usuario ID:', usuarioId);
  console.log('- Usuario Nombre:', usuarioNombre);
  console.log('- Usuario Tipo:', usuarioTipo);
  console.log('- Cantidad:', cantidad);
  console.log('- currentUser completo:', currentUser);
  
  mostrarConfirmacion(
    'Confirmar préstamo',
    `¿Confirma el préstamo de ${cantidad} unidad(es) de ${elementoSeleccionado.nombre}?${mensajeAdicional}`,
    () => {
      console.log('Iniciando préstamo con usuario ID:', usuarioId);
      
      // Realizar préstamo usando la API del backend
      // Para estudiantes, pasar información del docente y materia
      let docente = null;
      let materia = null;
      
      if (currentUser.tipo === 'estudiante') {
        docente = currentUser.docente;
        materia = currentUser.materia;
      }
      
      prestarElemento(elementoSeleccionado.id, usuarioId, cantidad, docente, materia)
        .then(result => {
          console.log('Préstamo creado exitosamente:', result);
          
          // Actualizar cantidad disponible en tiempo real
          elementoSeleccionado.disponibles -= cantidad;
          
          // Refrescar los reportes si están abiertos - llamar inmediatamente
          console.log('Préstamo creado exitosamente, actualizando reportes...');
          actualizarReportesEnTiempoReal();
          
          // Mostrar opciones post-préstamo
          mostrarOpcionesPostPrestamo(result);
        })
        .catch(error => {
          console.error('Error al crear préstamo:', error);
          mostrarNotificacion('Error', 'Error al crear el préstamo: ' + error.message, 'error');
        });
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
        <p>Se ha registrado el préstamo de ${prestamo.cantidad} unidad(es) de ${prestamo.elemento_nombre} a nombre de ${prestamo.usuario_nombre}.</p>
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
    
    // Configurar fechas por defecto para incluir todos los datos (últimos 6 meses)
    const hoy = new Date();
    const seiseMesesAtras = new Date(hoy);
    seiseMesesAtras.setMonth(hoy.getMonth() - 6);
    const fechaInicio = seiseMesesAtras.toISOString().split('T')[0];
    const fechaFin = hoy.toISOString().split('T')[0];
    
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
                  <label for="fecha-inicio-filtro" class="form-label">Fecha Inicio:</label>
                  <input type="date" class="form-control" id="fecha-inicio-filtro" value="${fechaInicio}">
                </div>
                <div class="col-md-3 mb-3">
                  <label for="fecha-fin-filtro" class="form-label">Fecha Fin:</label>
                  <input type="date" class="form-control" id="fecha-fin-filtro" value="${fechaFin}">
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
                <button class="btn btn-sm btn-outline-info" onclick="actualizarReportesEnTiempoReal()" title="Actualizar reporte">
                  <i class="fas fa-sync-alt"></i> Actualizar
                </button>
                <button class="btn btn-sm btn-outline-success" onclick="exportarReportePDF()">
                  PDF
                </button>
                <button class="btn btn-sm btn-outline-success" onclick="exportarReporteExcel()">
                  Excel
                </button>
              </div>
            </div>
            <div class="card-body">
              <div class="row mb-3" id="controles-vista-reporte" style="display: none;">
                <div class="col-12">
                  <div class="btn-group" role="group" aria-label="Vista de reportes">
                    <button type="button" class="btn btn-outline-primary active" id="btn-vista-tabla" onclick="cambiarVistaReporte('tabla')">
                      <i class="fas fa-table me-2"></i>Tabla
                    </button>
                    <button type="button" class="btn btn-outline-primary" id="btn-vista-grafico" onclick="cambiarVistaReporte('grafico')">
                      <i class="fas fa-chart-bar me-2"></i>Gráfico
                    </button>
                    <button type="button" class="btn btn-outline-primary" id="btn-vista-ambos" onclick="cambiarVistaReporte('ambos')">
                      <i class="fas fa-columns me-2"></i>Ambos
                    </button>
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
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <div class="card" style="background-color: #ffffff; border: 1px solid #dee2e6;">
                        <div class="card-header" style="background-color: #f8f9fa; color: #000000;">
                          <h6 class="card-title mb-0" style="color: #000000;">Gráfico de Barras</h6>
                        </div>
                        <div class="card-body" style="background-color: #ffffff;">
                          <canvas id="chart-reporte" width="400" height="300"></canvas>
                        </div>
                      </div>
                    </div>
                    <div class="col-md-6 mb-3">
                      <div class="card" style="background-color: #ffffff; border: 1px solid #dee2e6;">
                        <div class="card-header" style="background-color: #f8f9fa; color: #000000;">
                          <h6 class="card-title mb-0" style="color: #000000;">Gráfico de Pastel</h6>
                        </div>
                        <div class="card-body" style="background-color: #ffffff;">
                          <canvas id="chart-reporte-pastel" width="400" height="300"></canvas>
                        </div>
                      </div>
                    </div>
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
          `).join("") : `<tr><td colspan="7" class="text-center text-muted">
            <div class="py-4">
              <i class="fas fa-info-circle mb-2" style="font-size: 2em; color: #6c757d;"></i><br>
              <strong>No se encontraron préstamos</strong>
            </div>
          </td></tr>`}
        </tbody>
      </table>
    </div>
  `;
  
  document.getElementById("contenido-reporte-tabla").innerHTML = contenido;
  
  // Ocultar controles de vista para préstamos realizados (solo tabla)
  document.getElementById("controles-vista-reporte").style.display = 'none';
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
  
  // Mostrar controles de vista para ranking de estudiantes
  document.getElementById("controles-vista-reporte").style.display = 'block';
  
  // Generar gráfico para ranking de estudiantes
  generarGraficoEstudiantes(data);
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
  
  // Mostrar controles de vista para ranking de docentes
  document.getElementById("controles-vista-reporte").style.display = 'block';
  
  // Generar gráfico para ranking de docentes
  generarGraficoDocentes(data);
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
  
  // Mostrar controles de vista para ranking de materias
  document.getElementById("controles-vista-reporte").style.display = 'block';
  
  // Generar gráfico para ranking de materias
  generarGraficoMaterias(data);
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
  
  // Ocultar controles de vista para productos más solicitados (solo tabla)
  document.getElementById("controles-vista-reporte").style.display = 'none';
}

// Variable global para gráficos (declarada más abajo)

// Función para cambiar entre vistas de reporte
function cambiarVistaReporte(vista) {
  const btnTabla = document.getElementById('btn-vista-tabla');
  const btnGrafico = document.getElementById('btn-vista-grafico');
  const btnAmbos = document.getElementById('btn-vista-ambos');
  const contenidoTabla = document.getElementById('contenido-reporte-tabla');
  const contenidoGrafico = document.getElementById('contenido-reporte-grafico');
  
  // Remover clase active de todos los botones
  [btnTabla, btnGrafico, btnAmbos].forEach(btn => btn.classList.remove('active'));
  
  switch(vista) {
    case 'tabla':
      btnTabla.classList.add('active');
      contenidoTabla.style.display = 'block';
      contenidoGrafico.style.display = 'none';
      break;
    case 'grafico':
      btnGrafico.classList.add('active');
      contenidoTabla.style.display = 'none';
      contenidoGrafico.style.display = 'block';
      break;
    case 'ambos':
      btnAmbos.classList.add('active');
      contenidoTabla.style.display = 'block';
      contenidoGrafico.style.display = 'block';
      break;
  }
}

function mostrarCargandoReporte() {
  document.getElementById("contenido-reporte-tabla").innerHTML = `
    <div class="text-center p-5">
      <div class="spinner-border text-success" role="status">
        <span class="visually-hidden">Generando reporte...</span>
      </div>
      <p class="mt-3">Generando reporte...</p>
    </div>
  `;
}

function mostrarErrorReporte(mensaje) {
  document.getElementById("contenido-reporte-tabla").innerHTML = `
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
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Obtener el título del reporte actual
    const tituloReporte = document.getElementById("titulo-reporte")?.textContent || "Reporte";
    const fechaActual = new Date().toLocaleDateString('es-CO');
    
    // Configurar encabezado del PDF
    doc.setFontSize(18);
    doc.text('Sistema de Gestión de Laboratorio - UNAB', 20, 20);
    doc.setFontSize(14);
    doc.text(`${tituloReporte}`, 20, 35);
    doc.setFontSize(10);
    doc.text(`Generado el: ${fechaActual}`, 20, 45);
    
    let yPosition = 60;
    
    // Determinar tipo de reporte actual
    const tipoReporte = determinarTipoReporte();
    
    if (tipoReporte === 'ranking') {
      // Para reportes de ranking: exportar tabla y gráficos
      yPosition = exportarTablaAPDF(doc, yPosition);
      yPosition = exportarGraficosAPDF(doc, yPosition);
    } else {
      // Para reportes de préstamos y productos: solo tabla
      yPosition = exportarTablaAPDF(doc, yPosition);
    }
    
    // Guardar el PDF
    const nombreArchivo = `${tituloReporte.replace(/\s+/g, '_')}_${fechaActual.replace(/\//g, '-')}.pdf`;
    doc.save(nombreArchivo);
    
    mostrarNotificacion("Exportación exitosa", "El reporte PDF ha sido descargado", "success");
    
  } catch (error) {
    console.error("Error exportando PDF:", error);
    mostrarNotificacion("Error", "No se pudo exportar el PDF. Verifique que hay datos para exportar.", "error");
  }
}

function determinarTipoReporte() {
  const tituloReporte = document.getElementById("titulo-reporte")?.textContent || "";
  if (tituloReporte.includes("Estudiantes") || tituloReporte.includes("Docentes") || tituloReporte.includes("Materias")) {
    return 'ranking';
  }
  return 'tabla';
}

function exportarTablaAPDF(doc, yPosition) {
  const tabla = document.querySelector('#contenido-reporte-tabla table');
  if (!tabla) {
    doc.text('No hay datos de tabla para exportar', 20, yPosition);
    return yPosition + 20;
  }
  
  // Extraer datos de la tabla
  const encabezados = [];
  const filas = [];
  
  // Obtener encabezados
  const thead = tabla.querySelector('thead tr');
  if (thead) {
    thead.querySelectorAll('th').forEach(th => {
      encabezados.push(th.textContent.trim());
    });
  }
  
  // Obtener filas de datos
  const tbody = tabla.querySelector('tbody');
  if (tbody) {
    tbody.querySelectorAll('tr').forEach(tr => {
      const fila = [];
      tr.querySelectorAll('td').forEach(td => {
        // Limpiar texto de elementos HTML y obtener solo el texto
        let texto = td.textContent.trim();
        // Remover emojis y caracteres especiales para PDF
        texto = texto.replace(/[🥇🥈🥉]/g, '');
        fila.push(texto);
      });
      if (fila.length > 0 && !fila.join('').includes('No se encontraron')) {
        filas.push(fila);
      }
    });
  }
  
  if (encabezados.length > 0 && filas.length > 0) {
    doc.autoTable({
      head: [encabezados],
      body: filas,
      startY: yPosition,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [240, 248, 255]
      }
    });
    
    return doc.lastAutoTable.finalY + 20;
  } else {
    doc.text('No hay datos disponibles para exportar', 20, yPosition);
    return yPosition + 20;
  }
}

function exportarGraficosAPDF(doc, yPosition) {
  try {
    // Verificar si la página actual tiene espacio, si no, agregar nueva página
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFontSize(14);
    doc.text('Gráficos del Reporte', 20, yPosition);
    yPosition += 20;
    
    let graficosExportados = false;
    
    // Exportar gráfico de barras
    try {
      const chartBarras = document.getElementById('chart-reporte');

      if (chartBarras && currentChart && typeof currentChart.toBase64Image === 'function') {
        const imgBarras = currentChart.toBase64Image('image/png', 2.0);

        if (imgBarras && imgBarras.length > 100) {
          // Título del gráfico de barras
          doc.setFontSize(12);
          doc.text('Gráfico de Barras', 20, yPosition);
          yPosition += 10;
          
          // Imagen del gráfico de barras (5.6" ancho x 5" alto)
          doc.addImage(imgBarras, 'PNG', 20, yPosition, 134.4, 120);
          yPosition += 130;
          
          graficosExportados = true;
        }
      }
    } catch (e) {
      console.warn("Error exportando gráfico de barras:", e);
    }
    
    // Verificar si necesitamos una nueva página para el segundo gráfico
    if (yPosition > 100) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Exportar gráfico de pastel
    try {
      const chartPastel = document.getElementById('chart-reporte-pastel');

      if (chartPastel && currentChartPastel && typeof currentChartPastel.toBase64Image === 'function') {
        const imgPastel = currentChartPastel.toBase64Image('image/png', 2.0);

        if (imgPastel && imgPastel.length > 100) {
          // Título del gráfico de pastel
          doc.setFontSize(12);
          doc.text('Gráfico de Distribución', 20, yPosition);
          yPosition += 10;
          
          // Imagen del gráfico de pastel (6.86" ancho x 7.18" alto)
          doc.addImage(imgPastel, 'PNG', 20, yPosition, 164.64, 172.32);
          yPosition += 182;
          
          graficosExportados = true;
        }
      }
    } catch (e) {
      console.warn("Error exportando gráfico de pastel:", e);
    }
    
    if (!graficosExportados) {
      // Si no se pudieron exportar gráficos, agregar mensaje informativo
      doc.text('Los gráficos no están disponibles para exportar en este momento.', 20, yPosition);
      doc.text('Consulte la vista web para ver los gráficos interactivos.', 20, yPosition + 10);
      return yPosition + 30;
    }
    
    return yPosition;
    
  } catch (error) {
    console.error("Error exportando gráficos:", error);
    doc.text('Los gráficos se encuentran disponibles en la vista web del reporte.', 20, yPosition);
    return yPosition + 20;
  }
}

function exportarReporteExcel() {
  try {
    const tabla = document.querySelector('#contenido-reporte-tabla table');
    if (!tabla) {
      mostrarNotificacion("Error", "No hay datos de tabla para exportar", "error");
      return;
    }
    
    // Obtener el título del reporte
    const tituloReporte = document.getElementById("titulo-reporte")?.textContent || "Reporte";
    const fechaActual = new Date().toLocaleDateString('es-CO');
    
    // Crear contenido CSV
    let csvContent = `${tituloReporte}\nGenerado el: ${fechaActual}\n\n`;
    
    // Extraer encabezados
    const thead = tabla.querySelector('thead tr');
    if (thead) {
      const encabezados = [];
      thead.querySelectorAll('th').forEach(th => {
        encabezados.push(`"${th.textContent.trim()}"`);
      });
      csvContent += encabezados.join(',') + '\n';
    }
    
    // Extraer filas de datos
    const tbody = tabla.querySelector('tbody');
    if (tbody) {
      tbody.querySelectorAll('tr').forEach(tr => {
        const fila = [];
        tr.querySelectorAll('td').forEach(td => {
          let texto = td.textContent.trim();
          // Remover emojis y limpiar texto
          texto = texto.replace(/[🥇🥈🥉]/g, '');
          fila.push(`"${texto}"`);
        });
        if (fila.length > 0 && !fila.join('').includes('No se encontraron')) {
          csvContent += fila.join(',') + '\n';
        }
      });
    }
    
    // Crear y descargar archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const nombreArchivo = `${tituloReporte.replace(/\s+/g, '_')}_${fechaActual.replace(/\//g, '-')}.csv`;
    link.setAttribute('download', nombreArchivo);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    mostrarNotificacion("Exportación exitosa", "El archivo CSV ha sido descargado", "success");
    
  } catch (error) {
    console.error("Error exportando CSV:", error);
    mostrarNotificacion("Error", "No se pudo exportar el archivo CSV", "error");
  }
}

function obtenerClaseObservacionReporte(observacion) {
  if (!observacion) return 'text-muted';
  
  // Observaciones positivas
  if (observacion === 'Funciona correctamente') {
    return 'text-success fw-bold';
  }
  
  // Observaciones que requieren atención
  const observacionesProblematicas = [
    'No funciona / presenta fallas',
    'Faltan accesorios / partes incompletas',
    'Daños visibles (físicos)',
    'Requiere mantenimiento / calibración',
    'Contaminado / sucio',
    'Pendiente por revisión técnica',
    'Reportado como defectuoso por el usuario'
  ];
  
  if (observacionesProblematicas.includes(observacion)) {
    return 'text-danger fw-bold';
  }
  
  // Observaciones neutras
  const observacionesNeutrales = [
    'No fue utilizado',
    'No requiere devolución'
  ];
  
  if (observacionesNeutrales.includes(observacion)) {
    return 'text-info';
  }
  
  // Otras observaciones (campo libre)
  return 'text-warning';
}

// ======= FUNCIONES PARA GRÁFICOS CON CHART.JS =======

// Variable global para almacenar la instancia del gráfico actual
var currentChart = null;

function generarGraficoPrestamos(data) {
  if (!data || !data.prestamos || data.prestamos.length === 0) return;
  
  // Agrupar préstamos por fecha
  const prestamosPorFecha = {};
  data.prestamos.forEach(prestamo => {
    const fecha = prestamo.fecha_prestamo.split('T')[0]; // Solo la fecha, sin hora
    prestamosPorFecha[fecha] = (prestamosPorFecha[fecha] || 0) + 1;
  });
  
  const fechas = Object.keys(prestamosPorFecha).sort();
  const cantidades = fechas.map(fecha => prestamosPorFecha[fecha]);
  
  crearGraficoLineas('Préstamos por Fecha', fechas, cantidades, 'rgba(54, 162, 235, 0.8)');
}

function generarGraficoEstudiantes(data) {
  if (!data || !data.estudiantes || data.estudiantes.length === 0) return;
  
  // Tomar top 10 estudiantes
  const top10 = data.estudiantes.slice(0, 10);
  const nombres = top10.map(est => {
    const partes = est.nombre.split(' ');
    if (partes.length >= 3) {
      // Mostrar dos apellidos arriba y nombre abajo
      const apellidos = partes.slice(-2).join(' '); // Últimas dos palabras (apellidos)
      const nombre = partes[0]; // Primera palabra (nombre)
      return `${apellidos}\n${nombre}`;
    } else if (partes.length === 2) {
      // Solo apellido y nombre
      return `${partes[1]}\n${partes[0]}`;
    }
    return est.nombre;
  });
  const prestamos = top10.map(est => est.total_prestamos);
  
  // Crear ambos gráficos: barras horizontales y pastel
  crearGraficoBarrasHorizontales('Top 10 Estudiantes - Barras', nombres, prestamos, 'rgba(75, 192, 192, 0.8)');
  setTimeout(() => {
    crearGraficoPastel('Top 10 Estudiantes - Distribución', nombres, prestamos);
  }, 100);
}

function generarGraficoDocentes(data) {
  if (!data || !data.docentes || data.docentes.length === 0) return;
  
  // Tomar top 10 docentes
  const top10 = data.docentes.slice(0, 10);
  const nombres = top10.map(doc => {
    const partes = doc.nombre.split(' ');
    if (partes.length >= 3) {
      // Mostrar dos apellidos arriba y nombre abajo
      const apellidos = partes.slice(-2).join(' '); // Últimas dos palabras (apellidos)
      const nombre = partes[0]; // Primera palabra (nombre)
      return `${apellidos}\n${nombre}`;
    } else if (partes.length === 2) {
      // Solo apellido y nombre
      return `${partes[1]}\n${partes[0]}`;
    }
    return doc.nombre;
  });
  const productos = top10.map(doc => doc.total_productos);
  
  // Crear ambos gráficos: barras horizontales y pastel
  crearGraficoBarrasHorizontales('Top 10 Docentes - Barras', nombres, productos, 'rgba(255, 159, 64, 0.8)');
  setTimeout(() => {
    crearGraficoPastel('Top 10 Docentes - Distribución', nombres, productos);
  }, 100);
}

function generarGraficoMaterias(data) {
  if (!data || !data.materias || data.materias.length === 0) return;
  
  // Tomar top 10 materias
  const top10 = data.materias.slice(0, 10);
  const materias = top10.map(mat => {
    // Acortar nombres de materias de forma inteligente
    let nombre = mat.materia;
    if (nombre.length > 20) {
      // Intentar dividir por palabras comunes
      nombre = nombre.replace(/\b(de|del|la|el|en|con|para|por)\b/gi, '');
      if (nombre.length > 20) {
        nombre = nombre.substring(0, 18) + '...';
      }
    }
    return nombre.trim();
  });
  const productos = top10.map(mat => mat.total_productos);
  
  // Crear ambos gráficos: barras horizontales y pastel
  crearGraficoBarrasHorizontales('Top 10 Materias - Barras', materias, productos, 'rgba(153, 102, 255, 0.8)');
  setTimeout(() => {
    crearGraficoPastel('Top 10 Materias - Distribución', materias, productos);
  }, 100);
}

function generarGraficoProductos(data) {
  if (!data || !data.productos || data.productos.length === 0) return;
  
  // Tomar top 10 productos
  const top10 = data.productos.slice(0, 10);
  const nombres = top10.map(prod => prod.nombre.length > 20 ? prod.nombre.substring(0, 20) + '...' : prod.nombre);
  const cantidades = top10.map(prod => prod.total_solicitado);
  
  crearGraficoBarras('Top 10 Productos Más Solicitados', nombres, cantidades, 'rgba(153, 102, 255, 0.8)');
}

function crearGraficoLineas(titulo, etiquetas, datos, color) {
  destruirGraficoAnterior();
  
  const ctx = document.getElementById('chart-reporte').getContext('2d');
  currentChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: etiquetas,
      datasets: [{
        label: 'Préstamos',
        data: datos,
        borderColor: color,
        backgroundColor: color.replace('0.8', '0.2'),
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: titulo,
          color: '#000000'
        },
        legend: {
          labels: {
            color: '#000000'
          }
        }
      },
      scales: {
        x: {
          ticks: { color: '#000000' },
          grid: { color: 'rgba(0, 0, 0, 0.1)' }
        },
        y: {
          ticks: { color: '#000000' },
          grid: { color: 'rgba(0, 0, 0, 0.1)' }
        }
      }
    }
  });
}

function crearGraficoBarrasHorizontales(titulo, etiquetas, datos, color) {
  destruirGraficoAnterior();
  
  // Calcular porcentajes
  const total = datos.reduce((sum, value) => sum + value, 0);
  const porcentajes = datos.map(value => ((value / total) * 100).toFixed(1));
  
  const ctx = document.getElementById('chart-reporte').getContext('2d');
  currentChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: etiquetas,
      datasets: [{
        label: 'Cantidad',
        data: datos,
        backgroundColor: color,
        borderColor: color.replace('0.8', '1'),
        borderWidth: 1
      }]
    },
    options: {
      indexAxis: 'y', // Esto hace las barras horizontales
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: titulo,
          color: '#000000',
          font: { size: 16 }
        },
        legend: {
          labels: {
            color: '#000000'
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const index = context.dataIndex;
              const value = context.parsed.x;
              const percentage = porcentajes[index];
              return `${context.dataset.label}: ${value} (${percentage}%)`;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: { color: '#000000' },
          grid: { color: 'rgba(0, 0, 0, 0.1)' },
          // Agregar espacio adicional para las etiquetas
          afterFit: function(scale) {
            scale.paddingRight = 20;
          }
        },
        y: {
          ticks: { 
            color: '#000000',
            font: { size: 9 },
            maxRotation: 0,
            minRotation: 0
          },
          grid: { color: 'rgba(0, 0, 0, 0.1)' }
        }
      },
      layout: {
        padding: {
          right: 30 // Espacio adicional a la derecha para las etiquetas
        }
      }
    },
    plugins: [{
      id: 'barPercentageLabels',
      afterDatasetsDraw: function(chart) {
        const ctx = chart.ctx;
        ctx.save();
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        
        chart.data.datasets.forEach((dataset, i) => {
          const meta = chart.getDatasetMeta(i);
          meta.data.forEach((bar, index) => {
            const data = dataset.data[index];
            const percentage = porcentajes[index];
            
            // Calcular posición del texto dentro de la barra
            const barWidth = bar.width;
            const barX = bar.x;
            const textWidth = ctx.measureText(`${data} (${percentage}%)`).width;
            
            // Determinar posición X del texto
            let textX;
            if (textWidth + 10 < barWidth) {
              // Si el texto cabe dentro de la barra, centrarlo
              textX = barX - (barWidth / 2) + (textWidth / 2) + 5;
            } else if (barWidth > 30) {
              // Si la barra es pequeña, mostrar solo el porcentaje
              const shortText = `${percentage}%`;
              const shortTextWidth = ctx.measureText(shortText).width;
              if (shortTextWidth + 6 < barWidth) {
                textX = barX - (barWidth / 2) + (shortTextWidth / 2) + 3;
                
                // Texto negro sobre fondo blanco
                ctx.fillStyle = '#000000';
                ctx.fillText(shortText, textX, bar.y);
              }
              return; // Salir sin mostrar texto completo
            } else {
              return; // No mostrar texto si la barra es muy pequeña
            }
            
            // Mostrar texto completo
            // Texto negro sobre fondo blanco
            ctx.fillStyle = '#000000';
            ctx.fillText(`${data} (${percentage}%)`, textX, bar.y);
          });
        });
        ctx.restore();
      }
    }]
  });
}

// Variable global para el segundo gráfico (pastel)
var currentChartPastel = null;

function crearGraficoPastel(titulo, etiquetas, datos) {
  // Destruir gráfico de pastel anterior
  if (currentChartPastel) {
    currentChartPastel.destroy();
    currentChartPastel = null;
  }
  
  // Calcular porcentajes
  const total = datos.reduce((sum, value) => sum + value, 0);
  const porcentajes = datos.map(value => ((value / total) * 100).toFixed(1));
  
  const colores = [
    'rgba(255, 99, 132, 0.8)',
    'rgba(54, 162, 235, 0.8)',
    'rgba(255, 205, 86, 0.8)',
    'rgba(75, 192, 192, 0.8)',
    'rgba(153, 102, 255, 0.8)',
    'rgba(255, 159, 64, 0.8)',
    'rgba(199, 199, 199, 0.8)',
    'rgba(83, 102, 255, 0.8)',
    'rgba(255, 206, 84, 0.8)',
    'rgba(75, 192, 150, 0.8)'
  ];
  
  const ctx = document.getElementById('chart-reporte-pastel').getContext('2d');
  currentChartPastel = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: etiquetas,
      datasets: [{
        data: datos,
        backgroundColor: colores.slice(0, datos.length),
        borderColor: colores.slice(0, datos.length).map(color => color.replace('0.8', '1')),
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      backgroundColor: '#ffffff',
      plugins: {
        title: {
          display: true,
          text: titulo,
          color: '#000000',
          font: { size: 14 }
        },
        legend: {
          position: 'bottom',
          labels: {
            color: '#000000',
            font: { size: 11, weight: 'bold' },
            boxWidth: 15,
            generateLabels: function(chart) {
              const data = chart.data;
              if (data.labels.length && data.datasets.length) {
                return data.labels.map((label, i) => {
                  const value = data.datasets[0].data[i];
                  const percentage = porcentajes[i];
                  return {
                    text: `${label}: ${value} (${percentage}%)`,
                    fillStyle: data.datasets[0].backgroundColor[i],
                    strokeStyle: data.datasets[0].borderColor[i],
                    lineWidth: data.datasets[0].borderWidth,
                    hidden: false,
                    index: i,
                    fontColor: '#000000' // Color negro para fondo blanco
                  };
                });
              }
              return [];
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const index = context.dataIndex;
              const value = context.parsed;
              const percentage = porcentajes[index];
              const label = context.label || '';
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        },
      }
    },
    plugins: [{
      id: 'percentageLabels',
      afterDatasetsDraw: function(chart) {
        const ctx = chart.ctx;
        chart.data.datasets.forEach((dataset, i) => {
          const meta = chart.getDatasetMeta(i);
          meta.data.forEach((element, index) => {
            // Dibujar porcentaje en el centro de cada segmento
            const percentage = porcentajes[index];
            const position = element.tooltipPosition();
            
            ctx.save();
            // Texto negro sobre fondo blanco
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#000000';
            ctx.fillText(`${percentage}%`, position.x, position.y);
            ctx.restore();
          });
        });
      }
    }]
  });
}

function destruirGraficoAnterior() {
  if (currentChart) {
    currentChart.destroy();
    currentChart = null;
  }
  if (currentChartPastel) {
    currentChartPastel.destroy();
    currentChartPastel = null;
  }
}

// ======= FUNCIONES PARA ACTUALIZACIONES EN TIEMPO REAL =======

// Función para actualizar reportes en tiempo real
function actualizarReportesEnTiempoReal() {
  console.log('Actualizando reportes en tiempo real...');
  
  // Verificar si el módulo de reportes está activo
  const reportesSection = document.getElementById('reportes-section');
  if (!reportesSection || reportesSection.style.display === 'none') {
    console.log('No hay reportes abiertos para actualizar');
    return; // No hay reportes abiertos
  }
  
  // Encontrar el botón de reporte activo y regenerar
  const botonesReporte = document.querySelectorAll('#reportes-section .btn-group .btn');
  let reporteActivo = -1;
  
  botonesReporte.forEach((btn, index) => {
    if (btn.classList.contains('active')) {
      reporteActivo = index;
      console.log(`Reporte activo encontrado: ${index}`);
    }
  });
  
  if (reporteActivo !== -1) {
    console.log(`Actualizando reporte activo: ${reporteActivo}`);
    // Regenerar el reporte activo después de un pequeño delay
    setTimeout(() => {
      switch(reporteActivo) {
        case 0: 
          console.log('Actualizando reporte de préstamos...');
          generarReportePrestamos(); 
          break;
        case 1: 
          console.log('Actualizando reporte de estudiantes...');
          generarReporteEstudiantes(); 
          break;
        case 2: 
          console.log('Actualizando reporte de docentes...');
          generarReporteDocentes(); 
          break;
        case 3: 
          console.log('Actualizando reporte de materias...');
          generarReporteMaterias(); 
          break;
        case 4: 
          console.log('Actualizando reporte de productos...');
          generarReporteProductos(); 
          break;
      }
    }, 1500); // Esperar 1.5 segundos para asegurar que la BD se actualice
  } else {
    console.log('No se encontró reporte activo para actualizar');
  }
}

// =============================================================================
// MÓDULO DE ADMINISTRACIÓN DE USUARIOS Y MATERIAS
// =============================================================================

function mostrarModuloAdmin() {
  console.log('Mostrando módulo de administración...');
  
  // Ocultar interfaz principal
  document.getElementById('interface').style.display = 'none';
  
  // Eliminar sección de administración existente si existe
  const existingAdmin = document.getElementById('admin-section');
  if (existingAdmin) {
    existingAdmin.remove();
  }
  
  // Crear sección de administración
  const adminSection = document.createElement('section');
  adminSection.id = 'admin-section';
  adminSection.className = 'my-5';
  
  adminSection.innerHTML = `
    <div class="panel-container">
      <div class="panel-header d-flex justify-content-between align-items-center">
        <h2 class="panel-title">ADMINISTRACIÓN DEL SISTEMA</h2>
        <button class="btn btn-sm btn-outline-light" onclick="volverDesdeAdmin()">Volver</button>
      </div>
      <div class="panel-content">
        <!-- Navegación entre secciones -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="btn-group w-100" role="group">
              <button class="btn btn-outline-light active" id="admin-nav-estudiantes" onclick="cambiarSeccionAdmin('estudiantes')">
                Estudiantes
              </button>
              <button class="btn btn-outline-light" id="admin-nav-docentes" onclick="cambiarSeccionAdmin('docentes')">
                Docentes
              </button>
              <button class="btn btn-outline-light" id="admin-nav-laboratoristas" onclick="cambiarSeccionAdmin('laboratoristas')">
                Laboratoristas
              </button>
              <button class="btn btn-outline-light" id="admin-nav-materias" onclick="cambiarSeccionAdmin('materias')">
                Materias
              </button>
            </div>
          </div>
        </div>
        
        <!-- Área de contenido dinámico -->
        <div id="admin-content">
          <!-- El contenido se carga dinámicamente -->
        </div>
      </div>
    </div>
  `;
  
  // Agregar a la página
  const interfaceElement = document.getElementById('interface');
  if (interfaceElement) {
    interfaceElement.insertAdjacentElement('afterend', adminSection);
    console.log('Sección de administración creada');
  } else {
    console.error('No se pudo encontrar el elemento interface');
    return;
  }
  
  // Cargar sección inicial con un pequeño delay para asegurar que el DOM esté listo
  setTimeout(() => {
    cambiarSeccionAdmin('estudiantes');
  }, 100);
}

function volverDesdeAdmin() {
  // Eliminar sección de administración
  const adminSection = document.getElementById('admin-section');
  if (adminSection) {
    adminSection.remove();
  }
  
  // Mostrar interfaz principal
  document.getElementById('interface').style.display = 'block';
}

function cambiarSeccionAdmin(seccion) {
  console.log(`Cambiando a sección: ${seccion}`);
  
  // Actualizar botones de navegación
  document.querySelectorAll('#admin-section .btn-group .btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  const navButton = document.getElementById(`admin-nav-${seccion}`);
  if (navButton) {
    navButton.classList.add('active');
  } else {
    console.error(`No se encontró el botón de navegación para: ${seccion}`);
  }
  
  // Cargar contenido de la sección
  const contentDiv = document.getElementById('admin-content');
  if (!contentDiv) {
    console.error('No se encontró el contenedor admin-content');
    return;
  }
  
  try {
    switch(seccion) {
      case 'estudiantes':
        cargarSeccionEstudiantes(contentDiv);
        break;
      case 'docentes':
        cargarSeccionDocentes(contentDiv);
        break;
      case 'laboratoristas':
        cargarSeccionLaboratoristas(contentDiv);
        break;
      case 'materias':
        cargarSeccionMaterias(contentDiv);
        break;
      default:
        console.error(`Sección desconocida: ${seccion}`);
    }
  } catch (error) {
    console.error(`Error al cargar la sección ${seccion}:`, error);
  }
}

async function cargarSeccionEstudiantes(container) {
  container.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3>Gestión de Estudiantes</h3>
      <button class="btn btn-success" onclick="mostrarFormularioUsuario('estudiante')">
        <i class="fas fa-plus"></i> Agregar Estudiante
      </button>
    </div>
    
    <div class="mb-3">
      <div class="input-group">
        <span class="input-group-text" style="background-color: rgba(69, 213, 9, 0.1); border-color: #45d509; color: white;">
          <i class="fas fa-search"></i>
        </span>
        <input type="text" class="form-control" id="buscar-estudiantes" placeholder="Buscar por nombre o identificación..." 
               style="background-color: rgba(255, 255, 255, 0.1); border-color: #45d509; color: white;"
               onkeyup="filtrarTabla('tabla-estudiantes', this.value)">
      </div>
    </div>
    
    <div class="table-responsive">
      <table class="table table-striped table-hover">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Identificación</th>
            <th>Correo</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody id="tabla-estudiantes">
          <tr><td colspan="5" class="text-center">Cargando...</td></tr>
        </tbody>
      </table>
    </div>
  `;
  
  // Cargar datos
  await cargarUsuarios('estudiante', 'tabla-estudiantes');
}

async function cargarSeccionDocentes(container) {
  container.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3>Gestión de Docentes</h3>
      <button class="btn btn-success" onclick="mostrarFormularioUsuario('docente')">
        <i class="fas fa-plus"></i> Agregar Docente
      </button>
    </div>
    
    <div class="mb-3">
      <div class="input-group">
        <span class="input-group-text" style="background-color: rgba(69, 213, 9, 0.1); border-color: #45d509; color: white;">
          <i class="fas fa-search"></i>
        </span>
        <input type="text" class="form-control" id="buscar-docentes" placeholder="Buscar por nombre o identificación..." 
               style="background-color: rgba(255, 255, 255, 0.1); border-color: #45d509; color: white;"
               onkeyup="filtrarTabla('tabla-docentes', this.value)">
      </div>
    </div>
    
    <div class="table-responsive">
      <table class="table table-striped table-hover">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Identificación</th>
            <th>Correo</th>
            <th>PIN</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody id="tabla-docentes">
          <tr><td colspan="6" class="text-center">Cargando...</td></tr>
        </tbody>
      </table>
    </div>
  `;
  
  // Cargar datos
  await cargarUsuarios('docente', 'tabla-docentes');
}

async function cargarSeccionLaboratoristas(container) {
  container.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3>Gestión de Laboratoristas</h3>
      <button class="btn btn-success" onclick="mostrarFormularioUsuario('laboratorista')">
        <i class="fas fa-plus"></i> Agregar Laboratorista
      </button>
    </div>
    
    <div class="mb-3">
      <div class="input-group">
        <span class="input-group-text" style="background-color: rgba(69, 213, 9, 0.1); border-color: #45d509; color: white;">
          <i class="fas fa-search"></i>
        </span>
        <input type="text" class="form-control" id="buscar-laboratoristas" placeholder="Buscar por nombre o identificación..." 
               style="background-color: rgba(255, 255, 255, 0.1); border-color: #45d509; color: white;"
               onkeyup="filtrarTabla('tabla-laboratoristas', this.value)">
      </div>
    </div>
    
    <div class="table-responsive">
      <table class="table table-striped table-hover">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Identificación</th>
            <th>Correo</th>
            <th>PIN</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody id="tabla-laboratoristas">
          <tr><td colspan="6" class="text-center">Cargando...</td></tr>
        </tbody>
      </table>
    </div>
  `;
  
  // Cargar datos
  await cargarUsuarios('laboratorista', 'tabla-laboratoristas');
}

async function cargarSeccionMaterias(container) {
  container.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3>Gestión de Materias</h3>
      <button class="btn btn-success" onclick="mostrarFormularioMateria()">
        <i class="fas fa-plus"></i> Agregar Materia
      </button>
    </div>
    
    <div class="mb-3">
      <div class="input-group">
        <span class="input-group-text" style="background-color: rgba(69, 213, 9, 0.1); border-color: #45d509; color: white;">
          <i class="fas fa-search"></i>
        </span>
        <input type="text" class="form-control" id="buscar-materias" placeholder="Buscar por nombre o código..." 
               style="background-color: rgba(255, 255, 255, 0.1); border-color: #45d509; color: white;"
               onkeyup="filtrarTabla('tabla-materias', this.value)">
      </div>
    </div>
    
    <div class="table-responsive">
      <table class="table table-striped table-hover">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Código</th>
            <th>Estado</th>
            <th>Fecha Creación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody id="tabla-materias">
          <tr><td colspan="5" class="text-center">Cargando...</td></tr>
        </tbody>
      </table>
    </div>
  `;
  
  // Cargar datos
  await cargarMaterias();
}

async function cargarUsuarios(tipo, tablaId) {
  try {
    console.log(`Cargando usuarios de tipo: ${tipo}`);
    const response = await fetch(`/api/admin/usuarios?tipo=${tipo}&incluir_inactivos=true`);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Datos recibidos para ${tipo}:`, data);
    
    const tbody = document.getElementById(tablaId);
    
    if (!tbody) {
      console.error(`No se encontró el elemento con ID: ${tablaId}`);
      return;
    }
    
    if (data.usuarios && data.usuarios.length > 0) {
      tbody.innerHTML = data.usuarios.map(usuario => {
        let columnasEspecificas = '';
        
        if (tipo === 'estudiante') {
          columnasEspecificas = '';
        } else {
          columnasEspecificas = `
            <td>${usuario.pin || '<span class="text-muted">No definido</span>'}</td>
          `;
        }
        
        const estadoBadge = usuario.activo 
          ? '<span class="badge bg-success">Activo</span>' 
          : '<span class="badge bg-secondary">Inactivo</span>';
        
        const toggleAction = usuario.activo 
          ? `<button class="btn btn-sm btn-outline-warning ms-1" onclick="toggleUsuarioActivo(${usuario.id}, '${usuario.nombre.replace(/'/g, "\\'")}', false)" title="Inactivar usuario">
               <i class="fas fa-user-slash"></i>
             </button>`
          : `<button class="btn btn-sm btn-outline-success ms-1" onclick="toggleUsuarioActivo(${usuario.id}, '${usuario.nombre.replace(/'/g, "\\'")}', true)" title="Activar usuario">
               <i class="fas fa-user-check"></i>
             </button>`;
        
        return `
          <tr${usuario.activo ? '' : ' class="table-secondary"'}>
            <td>${usuario.nombre}</td>
            <td>${usuario.identificacion}</td>
            <td>${usuario.correo || '<span class="text-muted">No definido</span>'}</td>
            ${columnasEspecificas}
            <td>${estadoBadge}</td>
            <td>
              <button class="btn btn-sm btn-outline-primary" onclick="editarUsuario(${usuario.id})">
                <i class="fas fa-edit"></i>
              </button>
              ${toggleAction}
            </td>
          </tr>
        `;
      }).join('');
      console.log(`Tabla ${tablaId} actualizada con ${data.usuarios.length} registros`);
    } else {
      tbody.innerHTML = `<tr><td colspan="${tipo === 'estudiante' ? '5' : '6'}" class="text-center">No hay ${tipo}s registrados</td></tr>`;
      console.log(`No se encontraron ${tipo}s`);
    }
  } catch (error) {
    console.error(`Error cargando ${tipo}s:`, error);
    const tbody = document.getElementById(tablaId);
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="${tipo === 'estudiante' ? '5' : '6'}" class="text-center text-danger">Error al cargar datos: ${error.message}</td></tr>`;
    }
  }
}

async function cargarMaterias() {
  try {
    console.log('Cargando materias...');
    const response = await fetch('/api/admin/materias');
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Datos de materias recibidos:', data);
    
    const tbody = document.getElementById('tabla-materias');
    
    if (!tbody) {
      console.error('No se encontró el elemento tabla-materias');
      return;
    }
    
    if (data.materias && data.materias.length > 0) {
      tbody.innerHTML = data.materias.map(materia => `
        <tr>
          <td>${materia.nombre}</td>
          <td>${materia.codigo || 'N/A'}</td>
          <td>
            <span class="badge ${materia.activa ? 'bg-success' : 'bg-secondary'}">
              ${materia.activa ? 'Activa' : 'Inactiva'}
            </span>
          </td>
          <td>${materia.fecha_creacion ? new Date(materia.fecha_creacion).toLocaleDateString() : 'N/A'}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary" onclick="editarMateria(${materia.id})">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger ms-1" onclick="eliminarMateria(${materia.id}, '${materia.nombre.replace(/'/g, "\\'")}')">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      `).join('');
      console.log(`Tabla de materias actualizada con ${data.materias.length} registros`);
    } else {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center">No hay materias registradas</td></tr>';
      console.log('No se encontraron materias');
    }
  } catch (error) {
    console.error('Error cargando materias:', error);
    const tbody = document.getElementById('tabla-materias');
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Error al cargar datos: ${error.message}</td></tr>`;
    }
  }
}

function mostrarFormularioUsuario(tipo) {
  console.log(`Mostrando formulario para: ${tipo}`);
  
  // Eliminar modal existente si existe
  const existingModal = document.getElementById('modal-usuario');
  if (existingModal) {
    existingModal.remove();
  }
  
  const modal = document.createElement('div');
  modal.className = 'modal fade';
  modal.id = 'modal-usuario';
  modal.tabIndex = -1;
  modal.innerHTML = `
    <div class="modal-dialog modal-lg">
      <div class="modal-content" style="background-color: rgba(0, 0, 0, 0.9); color: white; border: 1px solid #45d509;">
        <div class="modal-header" style="border-bottom: 2px solid #45d509;">
          <h5 class="modal-title" style="color: #45d509; font-weight: 600;">
            <i class="fas fa-user-plus"></i> Agregar ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}
          </h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body" style="padding: 25px;">
          <form id="form-usuario">
            <div class="mb-4">
              <label class="form-label" style="color: white; font-weight: 600;">
                <i class="fas fa-user"></i> Nombre Completo <span class="text-danger">*</span>
              </label>
              <input type="text" class="form-control" name="nombre" required 
                     style="background-color: rgba(255, 255, 255, 0.1); border: 1px solid #45d509; color: white;"
                     placeholder="Ingrese el nombre completo">
              <div class="form-text" style="color: rgba(255, 255, 255, 0.7);">
                Ejemplo: GARCÍA MARTÍNEZ JUAN CARLOS
              </div>
            </div>
            
            <div class="mb-4">
              <label class="form-label" style="color: white; font-weight: 600;">
                <i class="fas fa-id-card"></i> Identificación <span class="text-danger">*</span>
              </label>
              <input type="text" class="form-control" name="identificacion" required 
                     style="background-color: rgba(255, 255, 255, 0.1); border: 1px solid #45d509; color: white;"
                     placeholder="${tipo === 'estudiante' ? 'U00123456' : 'Identificación'}">
              <div class="form-text" style="color: rgba(255, 255, 255, 0.7);">
                ${tipo === 'estudiante' ? 'Formato: U00 seguido de 6 dígitos' : 'Identificación única del usuario'}
              </div>
            </div>
            
            <div class="mb-4">
              <label class="form-label" style="color: white; font-weight: 600;">
                <i class="fas fa-envelope"></i> Correo Electrónico <span class="text-danger">*</span>
              </label>
              <input type="email" class="form-control" name="correo" required 
                     style="background-color: rgba(255, 255, 255, 0.1); border: 1px solid #45d509; color: white;"
                     placeholder="usuario@unab.edu.co">
              <div class="form-text" style="color: rgba(255, 255, 255, 0.7);">
                Correo electrónico institucional
              </div>
            </div>
            
            ${tipo !== 'estudiante' ? `
              <div class="mb-4">
                <label class="form-label" style="color: white; font-weight: 600;">
                  <i class="fas fa-key"></i> PIN de Acceso
                </label>
                <input type="password" class="form-control" name="pin" 
                       style="background-color: rgba(255, 255, 255, 0.1); border: 1px solid #45d509; color: white;"
                       placeholder="PIN de 4 dígitos">
                <div class="form-text" style="color: rgba(255, 255, 255, 0.7);">
                  PIN numérico para autenticación (opcional)
                </div>
              </div>
            ` : ''}
            
            ${tipo === 'estudiante' ? `
              <div class="alert" style="background-color: rgba(69, 213, 9, 0.1); border: 1px solid #45d509; color: rgba(255, 255, 255, 0.8);">
                <i class="fas fa-info-circle"></i> <strong>Nota:</strong> Los estudiantes pueden tener múltiples docentes y materias. 
                Esta información se registra durante el proceso de préstamos.
              </div>
            ` : ''}
          </form>
        </div>
        <div class="modal-footer" style="border-top: 2px solid #45d509; padding: 20px;">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" 
                  style="background-color: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.3);">
            <i class="fas fa-times"></i> Cancelar
          </button>
          <button type="button" class="btn btn-success" onclick="guardarUsuario('${tipo}')" 
                  style="background-color: #45d509; border-color: #45d509; color: #000; font-weight: 600;">
            <i class="fas fa-save"></i> Guardar ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  const bootstrapModal = new bootstrap.Modal(modal);
  bootstrapModal.show();
  
  // Agregar validación en tiempo real para el formato de identificación
  if (tipo === 'estudiante') {
    const identificacionInput = modal.querySelector('input[name="identificacion"]');
    identificacionInput.addEventListener('input', function() {
      const value = this.value.toUpperCase();
      this.value = value;
      
      // Validar formato U00 seguido de 6 dígitos
      const regex = /^U00\d{6}$/;
      if (value && !regex.test(value)) {
        this.style.borderColor = '#FF6600';
        this.nextElementSibling.style.color = '#FF6600';
        this.nextElementSibling.textContent = 'Formato inválido. Debe ser U00 seguido de 6 dígitos (ej: U00123456)';
      } else {
        this.style.borderColor = '#45d509';
        this.nextElementSibling.style.color = 'rgba(255, 255, 255, 0.7)';
        this.nextElementSibling.textContent = 'Formato: U00 seguido de 6 dígitos';
      }
    });
  }
  
  // Agregar validación de correo electrónico
  const correoInput = modal.querySelector('input[name="correo"]');
  correoInput.addEventListener('input', function() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (this.value && !emailRegex.test(this.value)) {
      this.style.borderColor = '#FF6600';
    } else {
      this.style.borderColor = '#45d509';
    }
  });
  
  modal.addEventListener('hidden.bs.modal', () => {
    document.body.removeChild(modal);
  });
}

function mostrarFormularioMateria() {
  const modal = document.createElement('div');
  modal.className = 'modal fade';
  modal.id = 'modal-materia';
  modal.tabIndex = -1;
  modal.innerHTML = `
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Agregar Materia</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <form id="form-materia">
            <div class="mb-3">
              <label class="form-label">Nombre de la Materia</label>
              <input type="text" class="form-control" name="nombre" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Código</label>
              <input type="text" class="form-control" name="codigo">
            </div>
            <div class="mb-3">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" name="activa" checked>
                <label class="form-check-label">Materia Activa</label>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
          <button type="button" class="btn btn-primary" onclick="guardarMateria()">Guardar</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  const bootstrapModal = new bootstrap.Modal(modal);
  bootstrapModal.show();
  
  modal.addEventListener('hidden.bs.modal', () => {
    document.body.removeChild(modal);
  });
}

async function guardarUsuario(tipo) {
  console.log(`Guardando usuario de tipo: ${tipo}`);
  
  const form = document.getElementById('form-usuario');
  const formData = new FormData(form);
  
  // Validar campos obligatorios
  const nombre = formData.get('nombre')?.trim();
  const identificacion = formData.get('identificacion')?.trim();
  const correo = formData.get('correo')?.trim();
  
  if (!nombre || !identificacion || !correo) {
    mostrarNotificacion('Error', 'Por favor complete todos los campos obligatorios (nombre, identificación y correo)', 'error');
    return;
  }
  
  // Validar formato de identificación para estudiantes
  if (tipo === 'estudiante') {
    const regex = /^U00\d{6}$/;
    if (!regex.test(identificacion)) {
      mostrarNotificacion('Error', 'El formato de identificación debe ser U00 seguido de 6 dígitos (ej: U00123456)', 'error');
      return;
    }
  }
  
  // Validar formato de correo
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(correo)) {
    mostrarNotificacion('Error', 'Por favor ingrese un correo electrónico válido', 'error');
    return;
  }
  
  const data = {
    tipo: tipo,
    nombre: nombre,
    identificacion: identificacion,
    correo: correo
  };
  
  if (tipo !== 'estudiante') {
    data.pin = formData.get('pin')?.trim() || null;
  }
  
  console.log('Datos a enviar:', data);
  
  // Mostrar indicador de carga
  const saveBtn = document.querySelector('#modal-usuario .btn-success');
  const originalText = saveBtn.innerHTML;
  saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
  saveBtn.disabled = true;
  
  try {
    const response = await fetch('/api/admin/usuarios', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    console.log('Respuesta del servidor:', result);
    
    if (response.ok) {
      mostrarNotificacion('Éxito', result.mensaje || `${tipo.charAt(0).toUpperCase() + tipo.slice(1)} creado exitosamente`, 'success');
      bootstrap.Modal.getInstance(document.getElementById('modal-usuario')).hide();
      
      // Recargar la sección actual
      const activeTab = document.querySelector('#admin-section .btn-group .btn.active');
      if (activeTab) {
        const seccion = activeTab.id.replace('admin-nav-', '');
        cambiarSeccionAdmin(seccion);
      }
    } else {
      mostrarNotificacion('Error', result.error || 'Error al guardar el usuario', 'error');
      // Restaurar botón
      saveBtn.innerHTML = originalText;
      saveBtn.disabled = false;
    }
  } catch (error) {
    console.error('Error al guardar usuario:', error);
    mostrarNotificacion('Error', 'Error de conexión al guardar el usuario', 'error');
    // Restaurar botón
    saveBtn.innerHTML = originalText;
    saveBtn.disabled = false;
  }
}

async function guardarMateria() {
  const form = document.getElementById('form-materia');
  const formData = new FormData(form);
  
  const data = {
    nombre: formData.get('nombre'),
    codigo: formData.get('codigo'),
    activa: formData.has('activa')
  };
  
  try {
    const response = await fetch('/api/admin/materias', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      mostrarNotificacion('Éxito', result.mensaje, 'success');
      bootstrap.Modal.getInstance(document.getElementById('modal-materia')).hide();
      cambiarSeccionAdmin('materias');
    } else {
      mostrarNotificacion('Error', result.error, 'error');
    }
  } catch (error) {
    mostrarNotificacion('Error', 'Error al guardar la materia', 'error');
  }
}

// Función eliminada - ahora se usa toggleUsuarioActivo

async function toggleUsuarioActivo(id, nombre, activar) {
  console.log(`${activar ? 'Activando' : 'Inactivando'} usuario: ${nombre} (ID: ${id})`);
  
  const accion = activar ? 'activar' : 'inactivar';
  const color = activar ? '#28a745' : '#ffc107';
  
  // Crear modal de confirmación personalizado
  const modal = document.createElement('div');
  modal.className = 'modal fade';
  modal.id = 'modal-confirmar-toggle';
  modal.innerHTML = `
    <div class="modal-dialog">
      <div class="modal-content" style="background-color: rgba(0, 0, 0, 0.9); color: white; border: 1px solid ${color};">
        <div class="modal-header" style="border-bottom: 2px solid ${color};">
          <h5 class="modal-title" style="color: ${color}; font-weight: 600;">
            <i class="fas fa-user-${activar ? 'check' : 'slash'}"></i> ${activar ? 'Activar' : 'Inactivar'} Usuario
          </h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body" style="padding: 25px;">
          <p style="font-size: 1.1rem; margin-bottom: 20px;">
            ¿Está seguro que desea ${accion} al usuario?
          </p>
          <div class="alert alert-info" style="background-color: rgba(${activar ? '40, 167, 69' : '255, 193, 7'}, 0.1); border: 1px solid ${color}; color: ${color};">
            <strong>Nombre:</strong> ${nombre}<br>
            <strong>Acción:</strong> ${activar ? 'El usuario podrá acceder y aparecer en las listas' : 'El usuario no podrá acceder y se ocultará de las listas'}
          </div>
        </div>
        <div class="modal-footer" style="border-top: 2px solid ${color}; padding: 20px;">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" 
                  style="background-color: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.3);">
            <i class="fas fa-times"></i> Cancelar
          </button>
          <button type="button" class="btn btn-${activar ? 'success' : 'warning'}" onclick="confirmarToggleUsuario(${id}, '${nombre.replace(/'/g, "\\'")}', ${activar})">
            <i class="fas fa-user-${activar ? 'check' : 'slash'}"></i> ${activar ? 'Activar' : 'Inactivar'} Usuario
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  const bootstrapModal = new bootstrap.Modal(modal);
  bootstrapModal.show();
  
  modal.addEventListener('hidden.bs.modal', () => {
    document.body.removeChild(modal);
  });
}

async function confirmarToggleUsuario(id, nombre, activar) {
  console.log(`Confirmando ${activar ? 'activación' : 'inactivación'} de usuario: ${nombre} (ID: ${id})`);
  
  // Cerrar modal de confirmación
  const modal = bootstrap.Modal.getInstance(document.getElementById('modal-confirmar-toggle'));
  if (modal) {
    modal.hide();
  }
  
  try {
    const response = await fetch(`/api/admin/usuarios/${id}/toggle-activo`, {
      method: 'PATCH'
    });
    
    const result = await response.json();
    
    if (response.ok) {
      mostrarNotificacion('Éxito', result.mensaje || `Usuario ${activar ? 'activado' : 'inactivado'} exitosamente`, 'success');
      // Recargar la sección actual
      const activeTab = document.querySelector('#admin-section .btn-group .btn.active');
      if (activeTab) {
        const seccion = activeTab.id.replace('admin-nav-', '');
        cambiarSeccionAdmin(seccion);
      }
    } else {
      mostrarNotificacion('Error', result.error || `Error al ${activar ? 'activar' : 'inactivar'} el usuario`, 'error');
    }
  } catch (error) {
    console.error(`Error al ${activar ? 'activar' : 'inactivar'} usuario:`, error);
    mostrarNotificacion('Error', `Error de conexión al ${activar ? 'activar' : 'inactivar'} el usuario`, 'error');
  }
}

async function eliminarMateria(id, nombre) {
  if (confirm(`¿Está seguro que desea eliminar la materia "${nombre}"?`)) {
    try {
      const response = await fetch(`/api/admin/materias/${id}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (response.ok) {
        mostrarNotificacion('Éxito', result.mensaje, 'success');
        cambiarSeccionAdmin('materias');
      } else {
        mostrarNotificacion('Error', result.error, 'error');
      }
    } catch (error) {
      mostrarNotificacion('Error', 'Error al eliminar la materia', 'error');
    }
  }
}

async function editarUsuario(id) {
  console.log(`Editando usuario con ID: ${id}`);
  
  try {
    // Obtener datos del usuario
    const response = await fetch(`/api/admin/usuarios/${id}`);
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Datos del usuario a editar:', data);
    
    if (!data.usuario) {
      throw new Error('Usuario no encontrado');
    }
    
    const usuario = data.usuario;
    mostrarFormularioEdicion(usuario);
    
  } catch (error) {
    console.error('Error al obtener datos del usuario:', error);
    mostrarNotificacion('Error', 'Error al cargar los datos del usuario', 'error');
  }
}

function editarMateria(id) {
  mostrarNotificacion('Información', 'Función de edición en desarrollo', 'info');
}

function mostrarFormularioEdicion(usuario) {
  console.log(`Mostrando formulario de edición para usuario:`, usuario);
  
  // Eliminar modal existente si existe
  const existingModal = document.getElementById('modal-editar-usuario');
  if (existingModal) {
    existingModal.remove();
  }
  
  const modal = document.createElement('div');
  modal.className = 'modal fade';
  modal.id = 'modal-editar-usuario';
  modal.tabIndex = -1;
  modal.innerHTML = `
    <div class="modal-dialog modal-lg">
      <div class="modal-content" style="background-color: rgba(0, 0, 0, 0.9); color: white; border: 1px solid #45d509;">
        <div class="modal-header" style="border-bottom: 2px solid #45d509;">
          <h5 class="modal-title" style="color: #45d509; font-weight: 600;">
            <i class="fas fa-user-edit"></i> Editar ${usuario.tipo.charAt(0).toUpperCase() + usuario.tipo.slice(1)}
          </h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body" style="padding: 25px;">
          <form id="form-editar-usuario">
            <input type="hidden" name="id" value="${usuario.id}">
            <input type="hidden" name="tipo" value="${usuario.tipo}">
            
            <div class="mb-4">
              <label class="form-label" style="color: white; font-weight: 600;">
                <i class="fas fa-user"></i> Nombre Completo <span class="text-danger">*</span>
              </label>
              <input type="text" class="form-control" name="nombre" required 
                     style="background-color: rgba(255, 255, 255, 0.1); border: 1px solid #45d509; color: white;"
                     value="${usuario.nombre || ''}" placeholder="Ingrese el nombre completo">
            </div>
            
            <div class="mb-4">
              <label class="form-label" style="color: white; font-weight: 600;">
                <i class="fas fa-id-card"></i> Identificación <span class="text-danger">*</span>
              </label>
              <input type="text" class="form-control" name="identificacion" required 
                     style="background-color: rgba(255, 255, 255, 0.1); border: 1px solid #45d509; color: white;"
                     value="${usuario.identificacion || ''}" placeholder="${usuario.tipo === 'estudiante' ? 'U00123456' : 'Identificación'}">
              <div class="form-text" style="color: rgba(255, 255, 255, 0.7);">
                ${usuario.tipo === 'estudiante' ? 'Formato: U00 seguido de 6 dígitos' : 'Identificación única del usuario'}
              </div>
            </div>
            
            <div class="mb-4">
              <label class="form-label" style="color: white; font-weight: 600;">
                <i class="fas fa-envelope"></i> Correo Electrónico <span class="text-danger">*</span>
              </label>
              <input type="email" class="form-control" name="correo" required 
                     style="background-color: rgba(255, 255, 255, 0.1); border: 1px solid #45d509; color: white;"
                     value="${usuario.correo || ''}" placeholder="usuario@unab.edu.co">
            </div>
            
            ${usuario.tipo !== 'estudiante' ? `
              <div class="mb-4">
                <label class="form-label" style="color: white; font-weight: 600;">
                  <i class="fas fa-key"></i> PIN de Acceso
                </label>
                <input type="password" class="form-control" name="pin" 
                       style="background-color: rgba(255, 255, 255, 0.1); border: 1px solid #45d509; color: white;"
                       value="${usuario.pin || ''}" placeholder="Dejar vacío para mantener el PIN actual">
                <div class="form-text" style="color: rgba(255, 255, 255, 0.7);">
                  Dejar vacío para mantener el PIN actual
                </div>
              </div>
            ` : ''}
            
            ${usuario.tipo === 'estudiante' ? `
              <div class="alert" style="background-color: rgba(69, 213, 9, 0.1); border: 1px solid #45d509; color: rgba(255, 255, 255, 0.8);">
                <i class="fas fa-info-circle"></i> <strong>Nota:</strong> Los estudiantes pueden tener múltiples docentes y materias. 
                Esta información se registra durante el proceso de préstamos.
              </div>
            ` : ''}
          </form>
        </div>
        <div class="modal-footer" style="border-top: 2px solid #45d509; padding: 20px;">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" 
                  style="background-color: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.3);">
            <i class="fas fa-times"></i> Cancelar
          </button>
          <button type="button" class="btn btn-success" onclick="guardarEdicionUsuario()" 
                  style="background-color: #45d509; border-color: #45d509; color: #000; font-weight: 600;">
            <i class="fas fa-save"></i> Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  const bootstrapModal = new bootstrap.Modal(modal);
  bootstrapModal.show();
  
  // Agregar validación en tiempo real
  if (usuario.tipo === 'estudiante') {
    const identificacionInput = modal.querySelector('input[name="identificacion"]');
    identificacionInput.addEventListener('input', function() {
      const value = this.value.toUpperCase();
      this.value = value;
      
      const regex = /^U00\d{6}$/;
      if (value && !regex.test(value)) {
        this.style.borderColor = '#FF6600';
      } else {
        this.style.borderColor = '#45d509';
      }
    });
  }
  
  // Validación de correo
  const correoInput = modal.querySelector('input[name="correo"]');
  correoInput.addEventListener('input', function() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (this.value && !emailRegex.test(this.value)) {
      this.style.borderColor = '#FF6600';
    } else {
      this.style.borderColor = '#45d509';
    }
  });
  
  modal.addEventListener('hidden.bs.modal', () => {
    document.body.removeChild(modal);
  });
}

function filtrarTabla(tablaId, filtro) {
  const tabla = document.getElementById(tablaId);
  if (!tabla) return;
  
  const filas = tabla.getElementsByTagName('tr');
  const filtroLower = filtro.toLowerCase().trim();
  
  for (let i = 0; i < filas.length; i++) {
    const fila = filas[i];
    const celdas = fila.getElementsByTagName('td');
    
    if (celdas.length === 0) continue; // Skip header row
    
    let mostrarFila = false;
    
    // Buscar en las primeras dos columnas (Nombre e Identificación/Código)
    for (let j = 0; j < Math.min(2, celdas.length); j++) {
      const textoCelda = celdas[j].textContent.toLowerCase();
      if (textoCelda.includes(filtroLower)) {
        mostrarFila = true;
        break;
      }
    }
    
    if (filtroLower === '') {
      mostrarFila = true;
    }
    
    fila.style.display = mostrarFila ? '' : 'none';
  }
}

async function guardarEdicionUsuario() {
  console.log('Guardando edición de usuario...');
  
  const form = document.getElementById('form-editar-usuario');
  const formData = new FormData(form);
  
  // Validar campos obligatorios
  const nombre = formData.get('nombre')?.trim();
  const identificacion = formData.get('identificacion')?.trim();
  const correo = formData.get('correo')?.trim();
  const id = formData.get('id');
  const tipo = formData.get('tipo');
  
  if (!nombre || !identificacion || !correo) {
    mostrarNotificacion('Error', 'Por favor complete todos los campos obligatorios (nombre, identificación y correo)', 'error');
    return;
  }
  
  // Validar formato de identificación para estudiantes
  if (tipo === 'estudiante') {
    const regex = /^U00\d{6}$/;
    if (!regex.test(identificacion)) {
      mostrarNotificacion('Error', 'El formato de identificación debe ser U00 seguido de 6 dígitos (ej: U00123456)', 'error');
      return;
    }
  }
  
  // Validar formato de correo
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(correo)) {
    mostrarNotificacion('Error', 'Por favor ingrese un correo electrónico válido', 'error');
    return;
  }
  
  const data = {
    nombre: nombre,
    identificacion: identificacion,
    correo: correo
  };
  
  if (tipo !== 'estudiante') {
    const pin = formData.get('pin')?.trim();
    if (pin) {
      data.pin = pin;
    }
  }
  
  console.log('Datos a actualizar:', data);
  
  // Mostrar indicador de carga
  const saveBtn = document.querySelector('#modal-editar-usuario .btn-success');
  const originalText = saveBtn.innerHTML;
  saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
  saveBtn.disabled = true;
  
  try {
    const response = await fetch(`/api/admin/usuarios/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    console.log('Respuesta del servidor:', result);
    
    if (response.ok) {
      mostrarNotificacion('Éxito', result.mensaje || 'Usuario actualizado exitosamente', 'success');
      bootstrap.Modal.getInstance(document.getElementById('modal-editar-usuario')).hide();
      
      // Recargar la sección actual
      const activeTab = document.querySelector('#admin-section .btn-group .btn.active');
      if (activeTab) {
        const seccion = activeTab.id.replace('admin-nav-', '');
        cambiarSeccionAdmin(seccion);
      }
    } else {
      mostrarNotificacion('Error', result.error || 'Error al actualizar el usuario', 'error');
      // Restaurar botón
      saveBtn.innerHTML = originalText;
      saveBtn.disabled = false;
    }
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    mostrarNotificacion('Error', 'Error de conexión al actualizar el usuario', 'error');
    // Restaurar botón
    saveBtn.innerHTML = originalText;
    saveBtn.disabled = false;
  }
}
