// Funciones para el autocompletado de estudiantes

// Función para configurar eventos de autocompletado para estudiantes
function configurarEventosAutocompletado() {
  console.log('Configurando eventos de autocompletado para estudiantes');
  
  const idInput = document.getElementById('estudiante-id');
  const buscarBtn = document.getElementById('buscar-estudiante-btn');
  
  if (!idInput || !buscarBtn) {
    console.error('No se encontraron los elementos para autocompletado');
    return;
  }
  
  // Evento al presionar Enter en el campo de ID
  idInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      buscarEstudiantePorId();
    }
  });
  
  // Evento al hacer clic en el botón buscar
  buscarBtn.addEventListener('click', buscarEstudiantePorId);
  
  console.log('Eventos de autocompletado configurados correctamente');
}

// Función para buscar información del estudiante por ID
async function buscarEstudiantePorId() {
  console.log('Buscando estudiante por ID');
  
  const idInput = document.getElementById('estudiante-id');
  const nombreInput = document.getElementById('user-name');
  const correoInput = document.getElementById('estudiante-correo');
  
  if (!idInput || !nombreInput || !correoInput) {
    console.error('Faltan elementos del formulario');
    return;
  }
  
  const estudianteId = idInput.value.trim();
  if (!estudianteId) {
    mostrarNotificacion('Error', 'Por favor ingrese su ID', 'error');
    return;
  }
  
  // Mostrar notificación de búsqueda
  mostrarNotificacion('Buscando', 'Buscando información del estudiante...', 'info');
  
  try {
    // Llamar a la API para buscar el estudiante
    const estudiante = await buscarEstudiante(estudianteId);
    
    if (estudiante) {
      // Autocompletar campos si se encontró el estudiante
      nombreInput.value = estudiante.nombre || '';
      correoInput.value = estudiante.correo || '';
      
      mostrarNotificacion('Éxito', 'Información del estudiante cargada correctamente', 'success');
    } else {
      mostrarNotificacion('No encontrado', 'No se encontró un estudiante con ese ID. Ingrese sus datos manualmente.', 'warning');
    }
  } catch (error) {
    console.error('Error al buscar estudiante:', error);
    mostrarNotificacion('Error', 'Ocurrió un error al buscar la información del estudiante', 'error');
  }
}