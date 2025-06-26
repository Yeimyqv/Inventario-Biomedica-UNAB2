// Variables globales para reportes
let tipoReporteActual = null;
let ultimosDataReporte = null;

async function generarReportePrestamos() {
  try {
    mostrarCargandoReporte();
    tipoReporteActual = 'prestamos';
    actualizarTituloReporte("Reporte de Préstamos Realizados");
    activarBotonReporte(0);
    
    const filtros = obtenerFiltrosReporte();
    const params = new URLSearchParams(filtros);
    
    const response = await fetch(`/api/reportes/prestamos?${params}`);
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    ultimosDataReporte = data;
    mostrarReportePrestamos(data);
    
    // Ocultar controles de gráfico para préstamos
    const controlesGrafico = document.getElementById('controles-tipo-grafico');
    if (controlesGrafico) controlesGrafico.style.display = 'none';
    
    // Mostrar solo vista de tabla para préstamos
    cambiarVistaReporte('tabla');
    
  } catch (error) {
    console.error("Error generando reporte de préstamos:", error);
    mostrarErrorReporte(`Error generando reporte: ${error.message}`);
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
    actualizarTituloReporte("Productos Más Solicitados");
    activarBotonReporte(4);
    
    const filtros = obtenerFiltrosReporte();
    const limite = document.getElementById('limite-productos')?.value || 10;
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
  
  const fechaInicio = document.getElementById('fecha-inicio-reporte')?.value;
  const fechaFin = document.getElementById('fecha-fin-reporte')?.value;
  const tipoUsuario = document.getElementById('tipo-usuario-filtro')?.value;
  const materia = document.getElementById('materia-filtro')?.value;
  const buscarEstudiante = document.getElementById('buscar-estudiante')?.value;
  const docenteFiltro = document.getElementById('docente-filtro')?.value;
  
  if (fechaInicio) filtros.fecha_inicio = fechaInicio;
  if (fechaFin) filtros.fecha_fin = fechaFin;
  if (tipoUsuario) filtros.tipo_usuario = tipoUsuario;
  if (materia) filtros.materia = materia;
  if (buscarEstudiante) filtros.buscar_estudiante = buscarEstudiante;
  if (docenteFiltro) filtros.docente = docenteFiltro;
  
  return filtros;
}

function mostrarReportePrestamos(data) {
  const contenido = `
    <div class="row mb-4">
      <div class="col-12">
        <div class="alert alert-info">
          <strong>Total de préstamos:</strong> ${data.total_prestamos}
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
            <th>Materia</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          ${data.prestamos.map(prestamo => `
            <tr>
              <td>${formatearFechaReporte(prestamo.fecha_prestamo)}</td>
              <td>${prestamo.usuario_nombre || 'N/A'}</td>
              <td>
                <span class="badge ${prestamo.usuario_tipo === 'estudiante' ? 'bg-primary' : 'bg-success'}">
                  ${prestamo.usuario_tipo}
                </span>
              </td>
              <td>${prestamo.elemento_nombre || 'N/A'}</td>
              <td>${prestamo.cantidad}</td>
              <td>
                <span class="badge ${obtenerClaseEstadoReporte(prestamo.estado)}">
                  ${prestamo.estado}
                </span>
              </td>
              <td>${prestamo.usuario_materia || 'N/A'}</td>
              <td>${prestamo.usuario_correo || 'N/A'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
  
  document.getElementById('contenido-reporte').innerHTML = contenido;
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
            <th>Email</th>
            <th>Materia</th>
            <th>Docente</th>
            <th>Total Préstamos</th>
          </tr>
        </thead>
        <tbody>
          ${data.estudiantes.map((estudiante, index) => `
            <tr ${index < 3 ? 'class="table-warning"' : ''}>
              <td>
                <strong>#${index + 1}</strong>
                ${index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : ''}
              </td>
              <td>${estudiante.identificacion}</td>
              <td>${estudiante.nombre}</td>
              <td>${estudiante.correo || 'N/A'}</td>
              <td>${estudiante.materia || 'N/A'}</td>
              <td>${estudiante.docente || 'N/A'}</td>
              <td>
                <span class="badge bg-primary fs-6">${estudiante.total_prestamos}</span>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
  
  document.getElementById('contenido-reporte').innerHTML = contenido;
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
            <th>Identificación</th>
            <th>Email</th>
            <th>Número de Préstamos</th>
            <th>Total Productos</th>
            <th>Tipo</th>
          </tr>
        </thead>
        <tbody>
          ${data.docentes.map((docente, index) => `
            <tr ${index < 3 ? 'class="table-warning"' : ''}>
              <td>
                <strong>#${index + 1}</strong>
                ${index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : ''}
              </td>
              <td>${docente.nombre}</td>
              <td>${docente.identificacion}</td>
              <td>${docente.correo || 'N/A'}</td>
              <td>
                <span class="badge bg-info">${docente.numero_prestamos}</span>
              </td>
              <td>
                <span class="badge bg-primary fs-6">${docente.total_productos}</span>
              </td>
              <td>
                <span class="badge ${obtenerClaseTipoDocente(docente.tipo)}">${docente.tipo}</span>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
  
  document.getElementById('contenido-reporte').innerHTML = contenido;
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
          ${data.materias.map((materia, index) => `
            <tr ${index < 3 ? 'class="table-warning"' : ''}>
              <td>
                <strong>#${index + 1}</strong>
                ${index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : ''}
              </td>
              <td>${materia.materia}</td>
              <td>${materia.docente || 'N/A'}</td>
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
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
  
  document.getElementById('contenido-reporte').innerHTML = contenido;
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
            <th>Número de Préstamos</th>
            <th>Total Solicitado</th>
          </tr>
        </thead>
        <tbody>
          ${data.productos.map((producto, index) => `
            <tr ${index < 3 ? 'class="table-warning"' : ''}>
              <td>
                <strong>#${index + 1}</strong>
                ${index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : ''}
              </td>
              <td><code>${producto.codigo}</code></td>
              <td>${producto.nombre}</td>
              <td><span class="badge bg-secondary">${producto.categoria}</span></td>
              <td>
                <span class="badge bg-info">${producto.numero_prestamos}</span>
              </td>
              <td>
                <span class="badge bg-primary fs-6">${producto.total_solicitado}</span>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
  
  document.getElementById('contenido-reporte').innerHTML = contenido;
}

// Funciones auxiliares
function mostrarCargandoReporte() {
  document.getElementById('contenido-reporte').innerHTML = `
    <div class="text-center p-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Generando reporte...</span>
      </div>
      <p class="mt-3 text-light">Generando reporte...</p>
    </div>
  `;
}

function mostrarErrorReporte(mensaje) {
  document.getElementById('contenido-reporte').innerHTML = `
    <div class="alert alert-danger">
      <strong>Error:</strong> ${mensaje}
    </div>
  `;
}

function actualizarTituloReporte(titulo) {
  const elemento = document.getElementById('titulo-reporte');
  if (elemento) {
    elemento.textContent = titulo;
  }
}

function activarBotonReporte(indice) {
  // Remover clase active de todos los botones
  document.querySelectorAll('button[onclick*="generarReporte"]').forEach(btn => {
    btn.classList.remove('active');
    btn.classList.remove('btn-success');
    btn.classList.add('btn-outline-success');
  });
  
  // Activar el botón correspondiente
  const botones = document.querySelectorAll('button[onclick*="generarReporte"]');
  if (botones[indice]) {
    botones[indice].classList.add('active');
    botones[indice].classList.add('btn-success');
    botones[indice].classList.remove('btn-outline-success');
  }
}

function formatearFechaReporte(fecha) {
  return new Date(fecha).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function obtenerClaseEstadoReporte(estado) {
  switch (estado) {
    case 'prestado': return 'bg-warning';
    case 'devuelto': return 'bg-success';
    case 'vencido': return 'bg-danger';
    default: return 'bg-secondary';
  }
}

function obtenerClaseTipoDocente(tipo) {
  switch (tipo) {
    case 'directo': return 'bg-primary';
    case 'estudiantes': return 'bg-info';
    case 'mixto': return 'bg-success';
    default: return 'bg-secondary';
  }
}

function cambiarVistaReporte(vista) {
  // Esta función se implementará más adelante para cambio de vistas
  console.log(`Cambiando vista a: ${vista}`);
}

function exportarReportePDF() {
  if (!ultimosDataReporte) {
    mostrarNotificacion('Error', 'No hay datos de reporte para exportar', 'error');
    return;
  }
  console.log('Exportando a PDF...');
  mostrarNotificacion('Información', 'Exportación a PDF en desarrollo', 'info');
}

function exportarReporteExcel() {
  if (!ultimosDataReporte) {
    mostrarNotificacion('Error', 'No hay datos de reporte para exportar', 'error');
    return;
  }
  console.log('Exportando a Excel...');
  mostrarNotificacion('Información', 'Exportación a Excel en desarrollo', 'info');
}