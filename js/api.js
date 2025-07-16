// API.js - Funciones para interactuar con las APIs del servidor

// Función para cargar y preparar el inventario desde la base de datos
async function cargarInventarioDesdeDB() {
  try {
    console.log("Cargando inventario desde la base de datos...");
    
    // Obtener todas las categorías
    const categoriasResponse = await fetch('/api/categorias');
    
    if (!categoriasResponse.ok) {
      throw new Error(`Error al cargar las categorías del inventario: ${categoriasResponse.status}`);
    }
    
    const categorias = await categoriasResponse.json();
    console.log(`Categorías obtenidas: ${categorias.length}`);
    
    // Crear un array con formato compatible con la estructura anterior de INVENTARIO
    const inventarioFormateado = [];
    
    // Procesar cada categoría y cargar sus elementos
    for (const categoria of categorias) {
      // Obtener elementos para esta categoría
      const elementosResponse = await fetch(`/api/elementos/categoria/${categoria.id}`);
      
      if (!elementosResponse.ok) {
        console.error(`Error al cargar los elementos de la categoría: ${categoria.nombre} (${elementosResponse.status})`);
        continue;
      }
      
      const elementos = await elementosResponse.json();
      console.log(`Categoría ${categoria.nombre}: ${elementos.length} elementos`);
      
      // Añadir esta categoría con sus elementos al inventario formateado
      inventarioFormateado.push({
        categoria: categoria.nombre,
        categoria_id: categoria.id,
        elementos: elementos
      });
    }
    
    console.log(`Inventario cargado exitosamente: ${inventarioFormateado.length} categorías`);
    
    // Devolver el inventario formateado
    return inventarioFormateado;
  } catch (error) {
    console.error('Error cargando inventario:', error);
    mostrarNotificacion('Error', 'No se pudo cargar el inventario. Por favor, intente de nuevo más tarde.', 'error');
    return [];
  }
}

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

// Buscar usuario por tipo y nombre (para laboratoristas y docentes)
async function buscarUsuarioPorTipoYNombre(tipo, nombre) {
  try {
    console.log(`API: Buscando usuario ${tipo} con nombre:`, nombre);
    const response = await fetch(`/api/usuario/${tipo}/${encodeURIComponent(nombre)}`);
    
    if (response.status === 404) {
      console.log('API: Usuario no encontrado (404)');
      return null;
    }
    
    if (!response.ok) {
      console.error('API: Error de respuesta', response.status);
      throw new Error(`Error al buscar usuario: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('API: Usuario encontrado:', data);
    return data;
  } catch (error) {
    console.error('API: Error en buscarUsuarioPorTipoYNombre:', error);
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
    console.log('API: Creando préstamo con datos:', { elemento_id: elementoId, usuario_id: usuarioId, cantidad: cantidad });
    
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
    console.log('API: Respuesta del servidor:', data);
    
    if (!response.ok) {
      throw new Error(data.error || 'Error al realizar el préstamo');
    }
    
    return data.prestamo || data; // Retornar el objeto préstamo
  } catch (error) {
    console.error('Error al crear préstamo:', error);
    mostrarNotificacion('Error', error.message, 'error');
    throw error; // Re-lanzar el error para que se maneje en el lugar correcto
  }
}

// Retornar elemento prestado
async function retornarElemento(prestamoId, observaciones = null) {
  try {
    const payload = {
      prestamo_id: prestamoId
    };
    
    if (observaciones) {
      payload.observaciones = observaciones;
    }
    
    const response = await fetch('/api/retornar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
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