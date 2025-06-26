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
    
