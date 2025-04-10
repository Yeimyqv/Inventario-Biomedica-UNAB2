// Pines de seguridad
const PINES = {
  docente: 'DOC1234',
  laboratorista: 'LAB5678'
};

// Simulación de inventario cargado desde Excel en formato JSON
const INVENTARIO = [
  {
    categoria: "Amplificadores",
    elementos: [
      { nombre: "AD620", cantidad: 5 },
      { nombre: "LM348", cantidad: 3 }
    ]
  },
  {
    categoria: "Arduino",
    elementos: [
      { nombre: "UNO", cantidad: 4 },
      { nombre: "UNO R3 Compatible", cantidad: 2 },
      { nombre: "Nano", cantidad: 6 }
    ]
  }
  // Se pueden agregar más categorías según necesidad
];
