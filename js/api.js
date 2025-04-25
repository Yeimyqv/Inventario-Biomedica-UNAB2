// API.js - Funciones para interactuar con las APIs del servidor

// Buscar estudiante por ID
async function buscarEstudiante(identificacion) {
  try {
    console.log('API: Buscando estudiante con ID:', identificacion);
    const response = await fetch(`/api/estudiante/${identificacion}`);
    
    console.log('API: Respuesta del servidor:', response.status);
    
    if (response.status === 404) {
      // No se encontró el estudiante, pero no es un error crítico
      console.log('API: Estudiante no encontrado (404)');
      return null;
    }
    
    if (!response.ok) {
      console.error('API: Error de respuesta', response.status);
      throw new Error(`Error al buscar estudiante: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('API: Datos recibidos:', data);
    return data;
  } catch (error) {
    console.error('API: Error en buscarEstudiante:', error);
    return null;
  }
}

// Obtener todas las categorías
async function getCategorias() {
  try {
    const response = await fetch('/api/categorias');
    if (!response.ok) {
      throw new Error('Error al obtener categorías');
    }
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    mostrarNotificacion('Error', 'No se pudieron cargar las categorías', 'error');
    return [];
  }
}

// Obtener elementos por categoría
async function getElementosByCategoria(categoriaId) {
  try {
    const response = await fetch(`/api/elementos/categoria/${categoriaId}`);
    if (!response.ok) {
      throw new Error('Error al obtener elementos');
    }
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    mostrarNotificacion('Error', 'No se pudieron cargar los elementos', 'error');
    return [];
  }
}

// Obtener detalles de un elemento específico
async function getElementoDetalle(elementoId) {
  try {
    const response = await fetch(`/api/elemento/${elementoId}`);
    if (!response.ok) {
      throw new Error('Error al obtener detalles del elemento');
    }
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    mostrarNotificacion('Error', 'No se pudieron cargar los detalles del elemento', 'error');
    return null;
  }
}

// Realizar préstamo de elemento
async function prestarElemento(elementoId, usuarioId, cantidad) {
  try {
    const response = await fetch('/api/prestar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        elemento_id: elementoId,
        usuario_id: usuarioId,
        cantidad: cantidad
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Error al realizar el préstamo');
    }
    
    return data;
  } catch (error) {
    console.error('Error:', error);
    mostrarNotificacion('Error', error.message, 'error');
    return null;
  }
}

// Retornar elemento prestado
async function retornarElemento(prestamoId) {
  try {
    const response = await fetch('/api/retornar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prestamo_id: prestamoId
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Error al retornar el elemento');
    }
    
    return data;
  } catch (error) {
    console.error('Error:', error);
    mostrarNotificacion('Error', error.message, 'error');
    return null;
  }
}

// Crear nuevo elemento (solo laboratorista)
async function crearElemento(datosElemento) {
  try {
    const response = await fetch('/api/elemento', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(datosElemento)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Error al crear el elemento');
    }
    
    return data;
  } catch (error) {
    console.error('Error:', error);
    mostrarNotificacion('Error', error.message, 'error');
    return null;
  }
}

// Eliminar elemento (solo laboratorista)
async function eliminarElemento(elementoId) {
  try {
    const response = await fetch(`/api/elemento/${elementoId}`, {
      method: 'DELETE'
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Error al eliminar el elemento');
    }
    
    return data;
  } catch (error) {
    console.error('Error:', error);
    mostrarNotificacion('Error', error.message, 'error');
    return null;
  }
}

// Importar inventario desde CSV (solo laboratorista)
async function importarInventarioCSV() {
  try {
    mostrarNotificacion('Procesando', 'Importando inventario desde archivo CSV...', 'info', 10000);
    
    const response = await fetch('/api/importar-inventario', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Error al importar el inventario');
    }
    
    mostrarNotificacion('Éxito', data.message || 'Inventario importado correctamente', 'success');
    return data;
  } catch (error) {
    console.error('Error:', error);
    mostrarNotificacion('Error', error.message, 'error');
    return null;
  }
}