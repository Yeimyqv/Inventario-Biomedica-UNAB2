// charts.js - Módulo para manejo de gráficos con Chart.js

// Variable global para almacenar la instancia del gráfico actual
let currentChart = null;

// Función para cambiar entre vistas de reporte
function cambiarVistaReporte(vista) {
  const btnTabla = document.getElementById('btn-vista-tabla');
  const btnGrafico = document.getElementById('btn-vista-grafico');
  const btnAmbos = document.getElementById('btn-vista-ambos');
  const contenidoTabla = document.getElementById('contenido-reporte-tabla');
  const contenidoGrafico = document.getElementById('contenido-reporte-grafico');
  
  if (!btnTabla || !btnGrafico || !btnAmbos || !contenidoTabla || !contenidoGrafico) {
    console.warn('Elementos de vista de reporte no encontrados');
    return;
  }
  
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

// Funciones para generar gráficos

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

function generarGraficoEstudiantes(data) {
  if (!data || !data.estudiantes || data.estudiantes.length === 0) return;
  
  // Tomar top 10 estudiantes
  const top10 = data.estudiantes.slice(0, 10);
  const nombres = top10.map(est => est.nombre.length > 15 ? est.nombre.substring(0, 15) + '...' : est.nombre);
  const prestamos = top10.map(est => est.total_prestamos);
  
  crearGraficoBarras('Top 10 Estudiantes', nombres, prestamos, 'rgba(75, 192, 192, 0.8)');
}

function generarGraficoDocentes(data) {
  if (!data || !data.docentes || data.docentes.length === 0) return;
  
  // Tomar top 10 docentes
  const top10 = data.docentes.slice(0, 10);
  const nombres = top10.map(doc => doc.nombre.length > 15 ? doc.nombre.substring(0, 15) + '...' : doc.nombre);
  const productos = top10.map(doc => doc.total_productos);
  
  crearGraficoBarras('Top 10 Docentes', nombres, productos, 'rgba(255, 159, 64, 0.8)');
}

function generarGraficoMaterias(data) {
  if (!data || !data.materias || data.materias.length === 0) return;
  
  // Tomar top 8 materias para gráfico de pastel
  const top8 = data.materias.slice(0, 8);
  const materias = top8.map(mat => mat.materia.length > 20 ? mat.materia.substring(0, 20) + '...' : mat.materia);
  const productos = top8.map(mat => mat.total_productos);
  
  crearGraficoPastel('Distribución por Materias', materias, productos);
}

function generarGraficoProductos(data) {
  if (!data || !data.productos || data.productos.length === 0) return;
  
  // Tomar top 10 productos
  const top10 = data.productos.slice(0, 10);
  const nombres = top10.map(prod => prod.nombre.length > 20 ? prod.nombre.substring(0, 20) + '...' : prod.nombre);
  const cantidades = top10.map(prod => prod.total_solicitado);
  
  crearGraficoBarras('Top 10 Productos Más Solicitados', nombres, cantidades, 'rgba(153, 102, 255, 0.8)');
}

function crearGraficoLineas(titulo, etiquetas, datos, color) {
  destruirGraficoAnterior();
  
  const canvas = document.getElementById('chart-reporte');
  if (!canvas) {
    console.warn('Canvas para gráfico no encontrado');
    return;
  }
  
  const ctx = canvas.getContext('2d');
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
      plugins: {
        title: {
          display: true,
          text: titulo,
          color: '#ffffff'
        },
        legend: {
          labels: {
            color: '#ffffff'
          }
        }
      },
      scales: {
        x: {
          ticks: { color: '#ffffff' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' }
        },
        y: {
          ticks: { color: '#ffffff' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' }
        }
      }
    }
  });
}

function crearGraficoBarras(titulo, etiquetas, datos, color) {
  destruirGraficoAnterior();
  
  const canvas = document.getElementById('chart-reporte');
  if (!canvas) {
    console.warn('Canvas para gráfico no encontrado');
    return;
  }
  
  const ctx = canvas.getContext('2d');
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
      plugins: {
        title: {
          display: true,
          text: titulo,
          color: '#ffffff'
        },
        legend: {
          labels: {
            color: '#ffffff'
          }
        }
      },
      scales: {
        x: {
          ticks: { 
            color: '#ffffff',
            maxRotation: 45
          },
          grid: { color: 'rgba(255, 255, 255, 0.1)' }
        },
        y: {
          ticks: { color: '#ffffff' },
          grid: { color: 'rgba(255, 255, 255, 0.1)' }
        }
      }
    }
  });
}

function crearGraficoPastel(titulo, etiquetas, datos) {
  destruirGraficoAnterior();
  
  const canvas = document.getElementById('chart-reporte');
  if (!canvas) {
    console.warn('Canvas para gráfico no encontrado');
    return;
  }
  
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
  
  const ctx = canvas.getContext('2d');
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
      plugins: {
        title: {
          display: true,
          text: titulo,
          color: '#ffffff'
        },
        legend: {
          position: 'right',
          labels: {
            color: '#ffffff'
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