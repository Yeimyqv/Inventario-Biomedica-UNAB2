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
    console.error('Faltan elementos del formulario');
    return;
  }
  
  const estudianteId = idInput.value.trim().toUpperCase(); // Convertir a mayúsculas para uniformidad
  if (!estudianteId) {
    console.log('ID de estudiante vacío');
    return;
  }
  
  // Mostrar un spinner o indicador de carga en lugar de alerta
  const buscarBtn = document.getElementById('buscar-estudiante-btn');
  if (buscarBtn) {
    buscarBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Buscando...';
    buscarBtn.disabled = true;
  }
  
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
      
      // No mostrar alerta de éxito, solo actualizar los campos silenciosamente
    } else {
      console.log('Estudiante no encontrado');
      // Usar una notificación con estilo personalizado en lugar de alert
      const notificacion = document.createElement('div');
      notificacion.className = 'alert alert-warning alert-dismissible fade show mt-2';
      notificacion.role = 'alert';
      notificacion.innerHTML = `
        <strong>Estudiante no encontrado.</strong> Por favor ingrese sus datos manualmente.
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      `;
      
      // Insertar la notificación después del campo de ID
      const parentElement = idInput.parentElement.parentElement;
      parentElement.appendChild(notificacion);
      
      // Configurar auto-cierre después de 5 segundos
      setTimeout(() => {
        const bsAlert = new bootstrap.Alert(notificacion);
        bsAlert.close();
      }, 5000);
    }
  } catch (error) {
    console.error('Error al buscar estudiante:', error);
    // No mostrar alerta para errores técnicos, solo registrar en consola
  } finally {
    // Restaurar el botón de búsqueda
    if (buscarBtn) {
      buscarBtn.innerHTML = 'Buscar';
      buscarBtn.disabled = false;
    }
  }
}