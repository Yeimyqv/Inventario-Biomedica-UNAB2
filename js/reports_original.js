// Variables globales para reportes (evitar redeclaración)
if (typeof tipoReporteActual === 'undefined') {
  var tipoReporteActual = null;
}
if (typeof ultimosDataReporte === 'undefined') {
  var ultimosDataReporte = null;
}

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
            <div class="card-body">
              <div class="row mb-3">
                <div class="col-12">
                  <div class="btn-group" role="group" aria-label="Vista de reportes">
                    <button type="button" class="btn btn-outline-light me-2" id="btn-vista-tabla" onclick="cambiarVistaReporte('tabla')">
                      <i class="fas fa-table"></i> Tabla
                    </button>
                    
                    <!-- Controles de tipo de gráfico para otros reportes -->
                    <div class="btn-group" id="controles-tipo-grafico" style="display: none;">
                      <button type="button" class="btn btn-outline-light me-2" id="btn-vista-grafico-barras" onclick="cambiarVistaReporte('grafico-barras')">
                        <i class="fas fa-chart-bar"></i> Barras
                      </button>
                      <button type="button" class="btn btn-outline-light me-2" id="btn-vista-grafico-circular" onclick="cambiarVistaReporte('grafico-circular')">
                        <i class="fas fa-chart-pie"></i> Circular
                      </button>
                      <button type="button" class="btn btn-outline-light" id="btn-vista-ambos-graficos" onclick="cambiarVistaReporte('ambos-graficos')">
                        <i class="fas fa-columns"></i> Ambos
                      </button>
                    </div>
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
                  <div class="chart-container mt-4" id="chart-container" style="display: none; max-width: 300px; max-height: 200px; margin: 0 auto;">
                    <canvas id="chart-reporte" style="max-width: 100%; max-height: 100%;"></canvas>
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
          `).join("") : "<tr><td colspan=\"7\" class=\"text-center\">No se encontraron préstamos</td></tr>"}
        </tbody>
      </table>
    </div>
  `;
  
  document.getElementById("contenido-reporte-tabla").innerHTML = contenido;
  
  // No generar gráfico para préstamos
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
  
  // Los gráficos se generan bajo demanda
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
  
  // Los gráficos se generan bajo demanda
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
  
  // Los gráficos se generan bajo demanda
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
  
  // Los gráficos se generan bajo demanda
}

// Variable global para gráficos
let currentChart = null;

// Función para cambiar entre vistas de reporte
function cambiarVistaReporte(vista) {
  const btnTabla = document.getElementById('btn-vista-tabla');
  const controlesGrafico = document.getElementById('controles-tipo-grafico');
  const btnBarras = document.getElementById('btn-vista-grafico-barras');
  const btnCircular = document.getElementById('btn-vista-grafico-circular');
  const btnAmbosGraficos = document.getElementById('btn-vista-ambos-graficos');
  const tablaContainer = document.getElementById('contenido-reporte-tabla');
  const chartContainer = document.getElementById('chart-container');
  
  // Remover clase activa de todos los botones
  [btnTabla, btnBarras, btnCircular, btnAmbosGraficos].forEach(btn => {
    if (btn) {
      btn.classList.remove('btn-light');
      btn.classList.add('btn-outline-light');
    }
  });
  
  // Ocultar todos los controles primero
  if (controlesGrafico) controlesGrafico.style.display = 'none';
  
  switch(vista) {
    case 'tabla':
      if (btnTabla) {
        btnTabla.classList.remove('btn-outline-light');
        btnTabla.classList.add('btn-light');
      }
      if (tablaContainer) tablaContainer.style.display = 'block';
      if (chartContainer) chartContainer.style.display = 'none';
      
      // Mostrar controles de gráfico para reportes que no sean préstamos
      if (tipoReporteActual !== 'prestamos' && controlesGrafico) {
        controlesGrafico.style.display = 'inline-flex';
      }
      break;
      
    case 'grafico-barras':
      if (btnBarras) {
        btnBarras.classList.remove('btn-outline-light');
        btnBarras.classList.add('btn-light');
      }
      if (tablaContainer) tablaContainer.style.display = 'none';
      if (chartContainer) chartContainer.style.display = 'block';
      
      // Generar gráfico de barras según el tipo de reporte
      generarGraficoSegunTipo('barras');
      break;
      
    case 'grafico-circular':
      if (btnCircular) {
        btnCircular.classList.remove('btn-outline-light');
        btnCircular.classList.add('btn-light');
      }
      if (tablaContainer) tablaContainer.style.display = 'none';
      if (chartContainer) chartContainer.style.display = 'block';
      
      // Generar gráfico circular según el tipo de reporte
      generarGraficoSegunTipo('circular');
      break;
      
    case 'ambos-graficos':
      if (btnAmbosGraficos) {
        btnAmbosGraficos.classList.remove('btn-outline-light');
        btnAmbosGraficos.classList.add('btn-light');
      }
      if (tablaContainer) tablaContainer.style.display = 'block';
      if (chartContainer) chartContainer.style.display = 'block';
      
      // Generar gráfico de barras por defecto
      generarGraficoSegunTipo('barras');
      break;
  }
}

// Función para generar gráfico según el tipo de reporte y estilo
function generarGraficoSegunTipo(estiloGrafico) {
  if (!ultimosDataReporte) return;
  
  try {
    switch(tipoReporteActual) {
      case 'estudiantes':
        if (estiloGrafico === 'barras') {
          generarGraficoEstudiantesBarras(ultimosDataReporte);
        } else {
          generarGraficoEstudiantesCircular(ultimosDataReporte);
        }
        break;
      case 'docentes':
        if (estiloGrafico === 'barras') {
          generarGraficoDocentesBarras(ultimosDataReporte);
        } else {
          generarGraficoDocentesCircular(ultimosDataReporte);
        }
        break;
      case 'materias':
        if (estiloGrafico === 'barras') {
          generarGraficoMateriasBarras(ultimosDataReporte);
        } else {
          generarGraficoMateriasCircular(ultimosDataReporte);
        }
        break;
      case 'productos':
        if (estiloGrafico === 'barras') {
          generarGraficoProductosBarras(ultimosDataReporte);
        } else {
          generarGraficoProductosCircular(ultimosDataReporte);
        }
        break;
    }
  } catch (error) {
    console.error('Error generando gráfico:', error);
  }
}
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
  mostrarNotificacion("Exportación a PDF", "Funcionalidad en desarrollo", "info");
}

function exportarReporteExcel() {
  mostrarNotificacion("Exportación a Excel", "Funcionalidad en desarrollo", "info");
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

function generarGraficoEstudiantesBarras(data) {
  if (!data || !data.estudiantes || data.estudiantes.length === 0) return;
  
  // Tomar top 10 estudiantes
  const top10 = data.estudiantes.slice(0, 10);
  const nombres = top10.map(est => est.nombre.length > 15 ? est.nombre.substring(0, 15) + '...' : est.nombre);
  const prestamos = top10.map(est => est.total_prestamos);
  
  crearGraficoBarras('Top 10 Estudiantes - Ranking', nombres, prestamos, 'rgba(75, 192, 192, 0.8)');
}

function generarGraficoEstudiantesCircular(data) {
  if (!data || !data.estudiantes || data.estudiantes.length === 0) return;
  
  // Tomar top 8 estudiantes para gráfico circular
  const top8 = data.estudiantes.slice(0, 8);
  const nombres = top8.map(est => est.nombre.length > 20 ? est.nombre.substring(0, 20) + '...' : est.nombre);
  const prestamos = top8.map(est => est.total_prestamos);
  
  crearGraficoPastel('Top 8 Estudiantes - Distribución', nombres, prestamos);
}

function generarGraficoDocentesBarras(data) {
  if (!data || !data.docentes || data.docentes.length === 0) return;
  
  // Tomar top 10 docentes
  const top10 = data.docentes.slice(0, 10);
  const nombres = top10.map(doc => doc.nombre.length > 15 ? doc.nombre.substring(0, 15) + '...' : doc.nombre);
  const productos = top10.map(doc => doc.total_productos);
  
  crearGraficoBarras('Top 10 Docentes - Ranking', nombres, productos, 'rgba(255, 159, 64, 0.8)');
}

function generarGraficoDocentesCircular(data) {
  if (!data || !data.docentes || data.docentes.length === 0) return;
  
  // Tomar top 8 docentes para gráfico circular
  const top8 = data.docentes.slice(0, 8);
  const nombres = top8.map(doc => doc.nombre.length > 20 ? doc.nombre.substring(0, 20) + '...' : doc.nombre);
  const productos = top8.map(doc => doc.total_productos);
  
  crearGraficoPastel('Top 8 Docentes - Distribución', nombres, productos);
}

function generarGraficoMateriasBarras(data) {
  if (!data || !data.materias || data.materias.length === 0) return;
  
  // Tomar top 10 materias
  const top10 = data.materias.slice(0, 10);
  const materias = top10.map(mat => mat.materia.length > 15 ? mat.materia.substring(0, 15) + '...' : mat.materia);
  const productos = top10.map(mat => mat.total_productos);
  
  crearGraficoBarras('Top 10 Materias - Ranking', materias, productos, 'rgba(153, 102, 255, 0.8)');
}

function generarGraficoMateriasCircular(data) {
  if (!data || !data.materias || data.materias.length === 0) return;
  
  // Tomar top 8 materias para gráfico de pastel
  const top8 = data.materias.slice(0, 8);
  const materias = top8.map(mat => mat.materia.length > 20 ? mat.materia.substring(0, 20) + '...' : mat.materia);
  const productos = top8.map(mat => mat.total_productos);
  
  crearGraficoPastel('Top 8 Materias - Distribución', materias, productos);
}

function generarGraficoProductosBarras(data) {
  if (!data || !data.productos || data.productos.length === 0) return;
  
  // Tomar top 10 productos
  const top10 = data.productos.slice(0, 10);
  const nombres = top10.map(prod => prod.nombre.length > 15 ? prod.nombre.substring(0, 15) + '...' : prod.nombre);
  const cantidades = top10.map(prod => prod.total_solicitado);
  
  crearGraficoBarras('Top 10 Productos - Ranking', nombres, cantidades, 'rgba(255, 99, 132, 0.8)');
}

function generarGraficoProductosCircular(data) {
  if (!data || !data.productos || data.productos.length === 0) return;
  
  // Tomar top 8 productos para gráfico circular
  const top8 = data.productos.slice(0, 8);
  const nombres = top8.map(prod => prod.nombre.length > 20 ? prod.nombre.substring(0, 20) + '...' : prod.nombre);
  const cantidades = top8.map(prod => prod.total_solicitado);
  
  crearGraficoPastel('Top 8 Productos - Distribución', nombres, cantidades);
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
      maintainAspectRatio: true,
      plugins: {
        title: {
          display: true,
          text: titulo,
          color: '#ffffff',
          font: { size: 14 }
        },
        legend: {
          labels: {
            color: '#ffffff',
            font: { size: 12 }
          }
        }
      },
      scales: {
        x: {
          ticks: { 
            color: '#ffffff',
            font: { size: 10 }
          },
          grid: { color: 'rgba(255, 255, 255, 0.1)' }
        },
        y: {
          ticks: { 
            color: '#ffffff',
            font: { size: 10 }
          },
          grid: { color: 'rgba(255, 255, 255, 0.1)' }
        }
      }
    }
  });
}

function crearGraficoBarras(titulo, etiquetas, datos, color) {
  destruirGraficoAnterior();
  
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
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        title: {
          display: true,
          text: titulo,
          color: '#ffffff',
          font: { size: 14 }
        },
        legend: {
          labels: {
            color: '#ffffff',
            font: { size: 12 }
          }
        }
      },
      scales: {
        x: {
          ticks: { 
            color: '#ffffff',
            maxRotation: 45,
            font: { size: 10 }
          },
          grid: { color: 'rgba(255, 255, 255, 0.1)' }
        },
        y: {
          ticks: { 
            color: '#ffffff',
            font: { size: 10 }
          },
          grid: { color: 'rgba(255, 255, 255, 0.1)' }
        }
      }
    }
  });
}

function crearGraficoPastel(titulo, etiquetas, datos) {
  destruirGraficoAnterior();
  
  const colores = [
    'rgba(255, 99, 132, 0.8)',
    'rgba(54, 162, 235, 0.8)',
    'rgba(255, 205, 86, 0.8)',
    'rgba(75, 192, 192, 0.8)',
    'rgba(153, 102, 255, 0.8)',
    'rgba(255, 159, 64, 0.8)',
    'rgba(199, 199, 199, 0.8)',
    'rgba(83, 102, 255, 0.8)'
  ];
  
  const ctx = document.getElementById('chart-reporte').getContext('2d');
  currentChart = new Chart(ctx, {
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
      maintainAspectRatio: true,
      plugins: {
        title: {
          display: true,
          text: titulo,
          color: '#ffffff',
          font: { size: 14 }
        },
        legend: {
          position: 'bottom',
          labels: {
            color: '#ffffff',
            font: { size: 10 },
            boxWidth: 12,
            padding: 10
          }
        }
      }
    }
  });
}

function destruirGraficoAnterior() {
  if (currentChart) {
    currentChart.destroy();
    currentChart = null;
  }
}

// Función para volver a la selección de usuario desde cualquier parte
function volverASeleccionUsuario() {
  // Ocultar todas las secciones
  document.getElementById('auth-section').style.display = 'none';
  document.getElementById('interface').style.display = 'none';
  document.getElementById('prestamo-section').style.display = 'none';
  document.getElementById('retorno-section').style.display = 'none';
  document.getElementById('consulta-section').style.display = 'none';
  document.getElementById('admin-section').style.display = 'none';
  
  // Mostrar selección de usuario
  document.getElementById('user-selection').style.display = 'block';
  
  // Resetear datos del usuario
  currentUser = {
    id: null,
    tipo: null,
    nombre: null
  };
  currentUserType = null;
}
}
