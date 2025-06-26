// Variables globales para reportes
var tipoReporteActual = null;
var ultimosDataReporte = null;

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
                  </select>
                </div>
                <div class="col-md-4 mb-3">
                  <label for="limite-productos" class="form-label">Límite de productos:</label>
                  <select class="form-select" id="limite-productos">
                    <option value="10">Top 10</option>
                    <option value="15">Top 15</option>
                    <option value="20">Top 20</option>
                    <option value="25">Top 25</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Panel de navegación de reportes -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card bg-dark border-secondary">
            <div class="card-header">
              <h5 class="card-title mb-0">Tipos de Reportes</h5>
            </div>
            <div class="card-body">
              <div class="btn-group w-100" role="group">
                <button type="button" class="btn btn-outline-success" onclick="generarReportePrestamos()">
                  <i class="fas fa-list"></i> Préstamos Realizados
                </button>
                <button type="button" class="btn btn-outline-success" onclick="generarReporteEstudiantes()">
                  <i class="fas fa-users"></i> Ranking Estudiantes
                </button>
                <button type="button" class="btn btn-outline-success" onclick="generarReporteDocentes()">
                  <i class="fas fa-chalkboard-teacher"></i> Ranking Docentes
                </button>
                <button type="button" class="btn btn-outline-success" onclick="generarReporteMaterias()">
                  <i class="fas fa-book"></i> Ranking Materias
                </button>
                <button type="button" class="btn btn-outline-success" onclick="generarReporteProductos()">
                  <i class="fas fa-box"></i> Productos Más Solicitados
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Controles de vista -->
      <div class="row mb-3">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center">
            <div class="btn-group" role="group" id="controles-vista">
              <button type="button" class="btn btn-outline-light btn-sm active" onclick="cambiarVistaReporte('tabla')" id="btn-vista-tabla">
                <i class="fas fa-table"></i> Tabla
              </button>
              <button type="button" class="btn btn-outline-light btn-sm" onclick="cambiarVistaReporte('grafico')" id="btn-vista-grafico">
                <i class="fas fa-chart-bar"></i> Gráfico
              </button>
              <button type="button" class="btn btn-outline-light btn-sm" onclick="cambiarVistaReporte('combinado')" id="btn-vista-combinado">
                <i class="fas fa-th"></i> Combinado
              </button>
            </div>
            <div class="btn-group" role="group" id="controles-tipo-grafico" style="display: none;">
              <button type="button" class="btn btn-outline-success btn-sm" onclick="generarGraficoSegunTipo('barras')" id="btn-grafico-barras">
                <i class="fas fa-chart-bar"></i> Barras
              </button>
              <button type="button" class="btn btn-outline-success btn-sm" onclick="generarGraficoSegunTipo('circular')" id="btn-grafico-circular">
                <i class="fas fa-chart-pie"></i> Circular
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Panel de contenido del reporte -->
      <div class="row">
        <div class="col-12">
          <div class="card bg-dark border-secondary">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="card-title mb-0" id="titulo-reporte">Selecciona un tipo de reporte</h5>
              <div class="btn-group" role="group">
                <button type="button" class="btn btn-sm btn-outline-light" onclick="exportarReportePDF()">
                  <i class="fas fa-file-pdf"></i> PDF
                </button>
                <button type="button" class="btn btn-sm btn-outline-light" onclick="exportarReporteExcel()">
                  <i class="fas fa-file-excel"></i> Excel
                </button>
              </div>
            </div>
            <div class="card-body">
              <div id="contenido-reporte-tabla">
                <div class="text-center p-5">
                  <i class="fas fa-chart-bar fa-3x text-muted mb-3"></i>
                  <p class="text-muted">Selecciona un tipo de reporte para ver los datos</p>
                </div>
              </div>
              <div id="contenido-reporte-grafico" style="display: none;">
                <canvas id="reportChart" width="400" height="200"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(reportesSection);
  }
  
  reportesSection.style.display = "block";
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
    
  } catch (error) {
    console.error("Error generando reporte de estudiantes:", error);
    mostrarErrorReporte(`Error generando reporte: ${error.message}`);
  }
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
    
  } catch (error) {
    console.error("Error generando reporte de docentes:", error);
    mostrarErrorReporte(`Error generando reporte: ${error.message}`);
  }
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
            <th>Nombre</th>
            <th>Correo</th>
            <th>Total Préstamos</th>
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
                <span class="badge bg-success fs-6">${docente.total_prestamos}</span>
              </td>
            </tr>
          `).join("") : "<tr><td colspan=\"4\" class=\"text-center\">No se encontraron docentes</td></tr>"}
        </tbody>
      </table>
    </div>
  `;
  
  document.getElementById("contenido-reporte-tabla").innerHTML = contenido;
}

async function generarReporteMaterias() {
  try {
    mostrarCargandoReporte();
    tipoReporteActual = 'materias';
    actualizarTituloReporte("Ranking de Materias con Mayor Uso de Insumos");
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
    
  } catch (error) {
    console.error("Error generando reporte de materias:", error);
    mostrarErrorReporte(`Error generando reporte: ${error.message}`);
  }
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
            <th>Total Préstamos</th>
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
              <td>
                <span class="badge bg-info fs-6">${materia.total_prestamos}</span>
              </td>
            </tr>
          `).join("") : "<tr><td colspan=\"3\" class=\"text-center\">No se encontraron materias</td></tr>"}
        </tbody>
      </table>
    </div>
  `;
  
  document.getElementById("contenido-reporte-tabla").innerHTML = contenido;
}

async function generarReporteProductos() {
  try {
    mostrarCargandoReporte();
    tipoReporteActual = 'productos';
    actualizarTituloReporte("Productos Más Solicitados");
    activarBotonReporte(4);
    
    const filtros = obtenerFiltrosReporte();
    const params = new URLSearchParams(filtros);
    
    const response = await fetch(`/api/reportes/productos?${params}`);
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    ultimosDataReporte = data;
    mostrarReporteProductos(data);
    
  } catch (error) {
    console.error("Error generando reporte de productos:", error);
    mostrarErrorReporte(`Error generando reporte: ${error.message}`);
  }
}

function mostrarReporteProductos(data) {
  const contenido = `
    <div class="row mb-4">
      <div class="col-12">
        <div class="alert alert-info">
          <strong>Total de productos:</strong> ${data.total_productos}
        </div>
      </div>
    </div>
    
    <div class="table-responsive">
      <table class="table table-striped table-dark">
        <thead>
          <tr>
            <th>Ranking</th>
            <th>Código</th>
            <th>Nombre del Producto</th>
            <th>Categoría</th>
            <th>Total Préstamos</th>
          </tr>
        </thead>
        <tbody>
          ${data.productos.length > 0 ? data.productos.map((producto, index) => `
            <tr ${index < 3 ? "class=\"table-warning\"" : ""}>
              <td>
                <strong>#${index + 1}</strong>
                ${index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : ""}
              </td>
              <td>${producto.codigo}</td>
              <td>${producto.nombre}</td>
              <td>${producto.categoria}</td>
              <td>
                <span class="badge bg-warning fs-6">${producto.total_prestamos}</span>
              </td>
            </tr>
          `).join("") : "<tr><td colspan=\"5\" class=\"text-center\">No se encontraron productos</td></tr>"}
        </tbody>
      </table>
    </div>
  `;
  
  document.getElementById("contenido-reporte-tabla").innerHTML = contenido;
}

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
    
  } catch (error) {
    console.error("Error generando reporte de préstamos:", error);
    mostrarErrorReporte(`Error generando reporte: ${error.message}`);
  }
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
            <th>ID</th>
            <th>Fecha Préstamo</th>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Producto</th>
            <th>Categoría</th>
            <th>Cantidad</th>
            <th>Estado</th>
            <th>Observaciones</th>
          </tr>
        </thead>
        <tbody>
          ${data.prestamos.length > 0 ? data.prestamos.map(prestamo => `
            <tr>
              <td>${prestamo.id}</td>
              <td>${formatearFechaReporte(prestamo.fecha_prestamo)}</td>
              <td>
                <div><strong>${prestamo.usuario_nombre}</strong></div>
                <small class="text-muted">ID: ${prestamo.usuario_identificacion}</small>
                ${prestamo.usuario_materia ? `<br><small class="text-info">${prestamo.usuario_materia}</small>` : ''}
                ${prestamo.usuario_docente ? `<br><small class="text-warning">Docente: ${prestamo.usuario_docente}</small>` : ''}
              </td>
              <td>${prestamo.usuario_correo || '-'}</td>
              <td>
                <div><strong>${prestamo.elemento_nombre}</strong></div>
                <small class="text-muted">Código: ${prestamo.elemento_codigo}</small>
              </td>
              <td><span class="badge bg-secondary">${prestamo.elemento_categoria}</span></td>
              <td><span class="badge bg-info">${prestamo.cantidad}</span></td>
              <td>
                <span class="badge ${obtenerClaseEstadoReporte(prestamo.estado)}">
                  ${prestamo.estado === 'prestado' ? 'No devuelto' : 
                    prestamo.estado === 'devuelto' ? 'Devuelto' : prestamo.estado}
                </span>
                ${prestamo.fecha_devolucion_real ? 
                  `<br><small class="text-muted">Devuelto: ${formatearFechaReporte(prestamo.fecha_devolucion_real)}</small>` : ''}
              </td>
              <td>
                ${prestamo.observaciones ? 
                  `<span class="badge ${obtenerClaseObservacionReporte(prestamo.observaciones)}">${prestamo.observaciones}</span>` : 
                  '<span class="text-muted">Sin observaciones</span>'}
              </td>
            </tr>
          `).join("") : "<tr><td colspan=\"9\" class=\"text-center\">No se encontraron préstamos</td></tr>"}
        </tbody>
      </table>
    </div>
  `;
  
  document.getElementById("contenido-reporte-tabla").innerHTML = contenido;
}

// Funciones auxiliares
function obtenerFiltrosReporte() {
  return {
    fecha_inicio: document.getElementById('fecha-inicio-reporte')?.value || '',
    fecha_fin: document.getElementById('fecha-fin-reporte')?.value || '',
    tipo_usuario: document.getElementById('tipo-usuario-filtro')?.value || '',
    materia: document.getElementById('materia-filtro')?.value || '',
    buscar_estudiante: document.getElementById('buscar-estudiante')?.value || '',
    docente: document.getElementById('docente-filtro')?.value || '',
    producto_especifico: document.getElementById('producto-especifico')?.value || '',
    limite_productos: document.getElementById('limite-productos')?.value || '50'
  };
}

function mostrarCargandoReporte() {
  document.getElementById('contenido-reporte-tabla').innerHTML = `
    <div class="text-center p-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Generando reporte...</span>
      </div>
      <p class="mt-3 text-light">Generando reporte...</p>
    </div>
  `;
}

function mostrarErrorReporte(mensaje) {
  document.getElementById('contenido-reporte-tabla').innerHTML = `
    <div class="alert alert-danger">
      <strong>Error:</strong> ${mensaje}
    </div>
  `;
}

function actualizarTituloReporte(titulo) {
  document.getElementById('titulo-reporte').textContent = titulo;
}

function activarBotonReporte(indice) {
  const botones = document.querySelectorAll('#reportes-section .btn-group .btn');
  botones.forEach((btn, i) => {
    if (i === indice) {
      btn.classList.remove('btn-outline-success');
      btn.classList.add('btn-success');
    } else {
      btn.classList.remove('btn-success');
      btn.classList.add('btn-outline-success');
    }
  });
}

function formatearFechaReporte(fecha) {
  return new Date(fecha).toLocaleDateString('es-ES');
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
  if (!observacion) return 'bg-secondary';
  
  const obs = observacion.toLowerCase();
  if (obs.includes('bueno') || obs.includes('excelente') || obs.includes('perfecto')) {
    return 'bg-success';
  } else if (obs.includes('regular') || obs.includes('advertencia') || obs.includes('cuidado')) {
    return 'bg-warning text-dark';
  } else if (obs.includes('dañado') || obs.includes('roto') || obs.includes('malo')) {
    return 'bg-danger';
  }
  return 'bg-info';
}

function cambiarVistaReporte(vista) {
  const tablaDiv = document.getElementById('contenido-reporte-tabla');
  const graficoDiv = document.getElementById('contenido-reporte-grafico');
  
  switch(vista) {
    case 'tabla':
      tablaDiv.style.display = 'block';
      graficoDiv.style.display = 'none';
      break;
    case 'grafico':
      tablaDiv.style.display = 'none';
      graficoDiv.style.display = 'block';
      break;
    case 'combinado':
      tablaDiv.style.display = 'block';
      graficoDiv.style.display = 'block';
      break;
  }
}

function exportarReportePDF() {
  alert('Función de exportación PDF en desarrollo');
}

function exportarReporteExcel() {
  alert('Función de exportación Excel en desarrollo');
}

let currentChart = null;

function generarGraficoSegunTipo(tipo) {
  if (!ultimosDataReporte) {
    console.error('No hay datos para generar gráfico');
    return;
  }

  const canvas = document.getElementById('reportChart');
  if (!canvas) {
    console.error('Canvas no encontrado');
    return;
  }

  // Destruir gráfico anterior si existe
  if (currentChart) {
    currentChart.destroy();
  }

  const ctx = canvas.getContext('2d');

  switch(tipoReporteActual) {
    case 'prestamos':
      generarGraficoPrestamos(ctx, ultimosDataReporte, tipo);
      break;
    case 'estudiantes':
      generarGraficoEstudiantes(ctx, ultimosDataReporte, tipo);
      break;
    case 'docentes':
      generarGraficoDocentes(ctx, ultimosDataReporte, tipo);
      break;
    case 'materias':
      generarGraficoMaterias(ctx, ultimosDataReporte, tipo);
      break;
    case 'productos':
      generarGraficoProductos(ctx, ultimosDataReporte, tipo);
      break;
  }
}

function generarGraficoPrestamos(ctx, data, tipo) {
  // Agrupar préstamos por mes
  const prestamosPorMes = {};
  data.prestamos.forEach(prestamo => {
    const fecha = new Date(prestamo.fecha_prestamo);
    const mes = fecha.toLocaleDateString('es-ES', { year: 'numeric', month: 'short' });
    prestamosPorMes[mes] = (prestamosPorMes[mes] || 0) + 1;
  });

  const etiquetas = Object.keys(prestamosPorMes);
  const valores = Object.values(prestamosPorMes);

  if (tipo === 'barras') {
    currentChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: etiquetas,
        datasets: [{
          label: 'Préstamos por mes',
          data: valores,
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Distribución de Préstamos por Mes'
          }
        }
      }
    });
  } else {
    currentChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: etiquetas,
        datasets: [{
          data: valores,
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 205, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Distribución de Préstamos'
          }
        }
      }
    });
  }
}

function generarGraficoEstudiantes(ctx, data, tipo) {
  const etiquetas = data.estudiantes.slice(0, 10).map(e => e.nombre);
  const valores = data.estudiantes.slice(0, 10).map(e => e.total_prestamos);

  if (tipo === 'barras') {
    currentChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: etiquetas,
        datasets: [{
          label: 'Préstamos',
          data: valores,
          backgroundColor: 'rgba(75, 192, 192, 0.8)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Top 10 Estudiantes por Préstamos'
          }
        }
      }
    });
  } else {
    currentChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: etiquetas,
        datasets: [{
          data: valores,
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 205, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 159, 64, 0.8)',
            'rgba(199, 199, 199, 0.8)',
            'rgba(83, 102, 255, 0.8)',
            'rgba(255, 99, 255, 0.8)',
            'rgba(99, 255, 132, 0.8)'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Distribución de Préstamos por Estudiante'
          }
        }
      }
    });
  }
}

function generarGraficoDocentes(ctx, data, tipo) {
  const etiquetas = data.docentes.slice(0, 10).map(d => d.nombre);
  const valores = data.docentes.slice(0, 10).map(d => d.total_prestamos);

  if (tipo === 'barras') {
    currentChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: etiquetas,
        datasets: [{
          label: 'Préstamos',
          data: valores,
          backgroundColor: 'rgba(255, 159, 64, 0.8)',
          borderColor: 'rgba(255, 159, 64, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Préstamos por Docente'
          }
        }
      }
    });
  } else {
    currentChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: etiquetas,
        datasets: [{
          data: valores,
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 205, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Distribución por Docente'
          }
        }
      }
    });
  }
}

function generarGraficoMaterias(ctx, data, tipo) {
  const etiquetas = data.materias.slice(0, 10).map(m => m.materia);
  const valores = data.materias.slice(0, 10).map(m => m.total_prestamos);

  if (tipo === 'barras') {
    currentChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: etiquetas,
        datasets: [{
          label: 'Préstamos',
          data: valores,
          backgroundColor: 'rgba(153, 102, 255, 0.8)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Préstamos por Materia'
          }
        }
      }
    });
  } else {
    currentChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: etiquetas,
        datasets: [{
          data: valores,
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 205, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 159, 64, 0.8)',
            'rgba(199, 199, 199, 0.8)',
            'rgba(83, 102, 255, 0.8)'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Distribución por Materia'
          }
        }
      }
    });
  }
}

function generarGraficoProductos(ctx, data, tipo) {
  const etiquetas = data.productos.slice(0, 10).map(p => p.nombre);
  const valores = data.productos.slice(0, 10).map(p => p.total_prestamos);

  if (tipo === 'barras') {
    currentChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: etiquetas,
        datasets: [{
          label: 'Préstamos',
          data: valores,
          backgroundColor: 'rgba(255, 206, 86, 0.8)',
          borderColor: 'rgba(255, 206, 86, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Productos Más Solicitados'
          }
        }
      }
    });
  } else {
    currentChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: etiquetas,
        datasets: [{
          data: valores,
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 205, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 159, 64, 0.8)',
            'rgba(199, 199, 199, 0.8)',
            'rgba(83, 102, 255, 0.8)',
            'rgba(255, 99, 255, 0.8)',
            'rgba(99, 255, 132, 0.8)'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Distribución de Productos Solicitados'
          }
        }
      }
    });
  }
}