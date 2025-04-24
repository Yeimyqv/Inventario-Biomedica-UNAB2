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
  buscarBtn.addEventListener('click', function() {
    console.log('Botón buscar estudiante clickeado');
    buscarEstudiantePorId();
  });
  
  console.log('Eventos de autocompletado configurados correctamente');
}

// Función para buscar información del estudiante por ID
async function buscarEstudiantePorId() {
  console.log('Ejecutando búsqueda de estudiante por ID');
  
  const idInput = document.getElementById('estudiante-id');
  const nombreInput = document.getElementById('user-name');
  const correoInput = document.getElementById('estudiante-correo');
  
  if (!idInput || !nombreInput || !correoInput) {
    console.error('Faltan elementos del formulario:', {
      idInput: !!idInput,
      nombreInput: !!nombreInput,
      correoInput: !!correoInput
    });
    alert('Error: Faltan elementos del formulario');
    return;
  }
  
  const estudianteId = idInput.value.trim();
  if (!estudianteId) {
    console.log('ID de estudiante vacío');
    alert('Por favor ingrese su ID');
    return;
  }
  
  // Mostrar mensaje de búsqueda
  console.log('Buscando estudiante con ID:', estudianteId);
  alert('Buscando información del estudiante...');
  
  try {
    // Llamar a la API para buscar el estudiante
    const estudiante = await buscarEstudiante(estudianteId);
    console.log('Respuesta de la API:', estudiante);
    
    if (estudiante) {
      // Autocompletar campos si se encontró el estudiante
      nombreInput.value = estudiante.nombre || '';
      correoInput.value = estudiante.correo || '';
      
      console.log('Información cargada:', {
        nombre: estudiante.nombre,
        correo: estudiante.correo
      });
      
      alert('Información del estudiante cargada correctamente');
    } else {
      console.log('Estudiante no encontrado');
      alert('No se encontró un estudiante con ese ID. Ingrese sus datos manualmente.');
    }
  } catch (error) {
    console.error('Error al buscar estudiante:', error);
    alert('Ocurrió un error al buscar la información del estudiante');
  }
}