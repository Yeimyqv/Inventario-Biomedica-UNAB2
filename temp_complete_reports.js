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
