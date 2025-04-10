// API.js - Funciones para interactuar con las APIs del servidor

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