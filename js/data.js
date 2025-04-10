// Data.js - Datos estáticos para el cliente

// Objeto para almacenar los PINes de docentes y laboratoristas
const PINES = {
  'docente': 'DOC1234',
  'laboratorista': 'LAB5678'
};

// Datos de categorías y elementos para uso sin API
const INVENTARIO = [
  {
    categoria: 'Amplificadores',
    elementos: [
      {
        id: 1,
        nombre: 'AD620',
        descripcion: 'Amplificador de instrumentación de baja potencia',
        cantidad: 5,
        ubicacion: 'Estante A, Caja 3'
      },
      {
        id: 2,
        nombre: 'LM348',
        descripcion: 'Amplificador operacional cuádruple',
        cantidad: 3,
        ubicacion: 'Estante A, Caja 3'
      }
    ]
  },
  {
    categoria: 'Arduino',
    elementos: [
      {
        id: 3,
        nombre: 'UNO',
        descripcion: 'Placa Arduino UNO con microcontrolador ATmega328P',
        cantidad: 4,
        ubicacion: 'Estante B, Caja 1'
      },
      {
        id: 4,
        nombre: 'UNO R3 Compatible',
        descripcion: 'Placa compatible con Arduino UNO R3',
        cantidad: 2,
        ubicacion: 'Estante B, Caja 1'
      },
      {
        id: 5,
        nombre: 'Nano',
        descripcion: 'Placa Arduino Nano con microcontrolador ATmega328P',
        cantidad: 6,
        ubicacion: 'Estante B, Caja 2'
      }
    ]
  },
  {
    categoria: 'Sensores',
    elementos: [
      {
        id: 6,
        nombre: 'LM35',
        descripcion: 'Sensor de temperatura analógico',
        cantidad: 8,
        ubicacion: 'Estante C, Caja 1'
      },
      {
        id: 7,
        nombre: 'HC-SR04',
        descripcion: 'Sensor ultrasónico de distancia',
        cantidad: 5,
        ubicacion: 'Estante C, Caja 1'
      }
    ]
  },
  {
    categoria: 'Herramientas',
    elementos: [
      {
        id: 8,
        nombre: 'Multímetro Digital',
        descripcion: 'Multímetro con medición de voltaje, corriente y resistencia',
        cantidad: 3,
        ubicacion: 'Estante D, Caja 1'
      },
      {
        id: 9,
        nombre: 'Cautín',
        descripcion: 'Cautín para soldadura electrónica',
        cantidad: 2,
        ubicacion: 'Estante D, Caja 2'
      }
    ]
  }
];