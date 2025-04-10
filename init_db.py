"""
Script para inicializar la base de datos con datos de ejemplo.
"""
from app import app, db
from models import Categoria, Elemento, Usuario, Prestamo
from datetime import datetime, timedelta

def init_db():
    """Inicializar la base de datos con datos de prueba."""
    print("Inicializando base de datos...")
    
    # Crear usuarios de ejemplo
    usuarios = [
        Usuario(tipo='estudiante', nombre='Juan Pérez', identificacion='E001'),
        Usuario(tipo='estudiante', nombre='María González', identificacion='E002'),
        Usuario(tipo='estudiante', nombre='Carolina Ramírez', identificacion='E003'),
        Usuario(tipo='estudiante', nombre='David Martínez', identificacion='E004'),
        Usuario(tipo='estudiante', nombre='Sofía Torres', identificacion='E005'),
        Usuario(tipo='docente', nombre='Carlos Rodríguez', identificacion='D001', pin='DOC1234'),
        Usuario(tipo='docente', nombre='Laura Mendoza', identificacion='D002', pin='DOC1234'),
        Usuario(tipo='laboratorista', nombre='Ana Torres', identificacion='L001', pin='LAB5678'),
        Usuario(tipo='laboratorista', nombre='Roberto Sánchez', identificacion='L002', pin='LAB5678')
    ]
    
    # Crear categorías de ejemplo
    categorias = [
        Categoria(nombre='Amplificadores'),
        Categoria(nombre='Arduino'),
        Categoria(nombre='Sensores'),
        Categoria(nombre='Herramientas'),
        Categoria(nombre='Equipos Biomédicos'),
        Categoria(nombre='Componentes Electrónicos'),
        Categoria(nombre='Equipos de Medición'),
        Categoria(nombre='Material de Laboratorio')
    ]
    
    # Guardar categorías para obtener IDs
    for categoria in categorias:
        db.session.add(categoria)
    
    db.session.commit()
    
    # Crear elementos para cada categoría
    elementos = [
        # Amplificadores
        Elemento(
            codigo='AMP001',
            nombre='AD620',
            descripcion='Amplificador de instrumentación de baja potencia',
            cantidad=15,
            ubicacion='Estante A, Caja 3',
            categoria_id=1
        ),
        Elemento(
            codigo='AMP002',
            nombre='LM348',
            descripcion='Amplificador operacional cuádruple',
            cantidad=12,
            ubicacion='Estante A, Caja 3',
            categoria_id=1
        ),
        Elemento(
            codigo='AMP003',
            nombre='INA128',
            descripcion='Amplificador de instrumentación de precisión',
            cantidad=8,
            ubicacion='Estante A, Caja 4',
            categoria_id=1
        ),
        Elemento(
            codigo='AMP004',
            nombre='LM324',
            descripcion='Amplificador operacional cuádruple de bajo consumo',
            cantidad=20,
            ubicacion='Estante A, Caja 4',
            categoria_id=1
        ),
        
        # Arduino
        Elemento(
            codigo='ARD001',
            nombre='UNO',
            descripcion='Placa Arduino UNO con microcontrolador ATmega328P',
            cantidad=10,
            ubicacion='Estante B, Caja 1',
            categoria_id=2
        ),
        Elemento(
            codigo='ARD002',
            nombre='UNO R3 Compatible',
            descripcion='Placa compatible con Arduino UNO R3',
            cantidad=8,
            ubicacion='Estante B, Caja 1',
            categoria_id=2
        ),
        Elemento(
            codigo='ARD003',
            nombre='Nano',
            descripcion='Placa Arduino Nano con microcontrolador ATmega328P',
            cantidad=12,
            ubicacion='Estante B, Caja 2',
            categoria_id=2
        ),
        Elemento(
            codigo='ARD004',
            nombre='Mega 2560',
            descripcion='Placa Arduino Mega con microcontrolador ATmega2560',
            cantidad=6,
            ubicacion='Estante B, Caja 2',
            categoria_id=2
        ),
        Elemento(
            codigo='ARD005',
            nombre='ESP32',
            descripcion='Placa de desarrollo con módulo ESP32 y conectividad WiFi/BT',
            cantidad=8,
            ubicacion='Estante B, Caja 3',
            categoria_id=2
        ),
        
        # Sensores
        Elemento(
            codigo='SEN001',
            nombre='LM35',
            descripcion='Sensor de temperatura analógico',
            cantidad=15,
            ubicacion='Estante C, Caja 1',
            categoria_id=3
        ),
        Elemento(
            codigo='SEN002',
            nombre='HC-SR04',
            descripcion='Sensor ultrasónico de distancia',
            cantidad=10,
            ubicacion='Estante C, Caja 1',
            categoria_id=3
        ),
        Elemento(
            codigo='SEN003',
            nombre='MPU6050',
            descripcion='Acelerómetro y giroscopio de 6 ejes',
            cantidad=10,
            ubicacion='Estante C, Caja 2',
            categoria_id=3
        ),
        Elemento(
            codigo='SEN004',
            nombre='MAX30100',
            descripcion='Sensor de pulso y oximetría',
            cantidad=8,
            ubicacion='Estante C, Caja 2',
            categoria_id=3
        ),
        Elemento(
            codigo='SEN005',
            nombre='AD8232',
            descripcion='Módulo de monitoreo de frecuencia cardíaca',
            cantidad=5,
            ubicacion='Estante C, Caja 3',
            categoria_id=3
        ),
        
        # Herramientas
        Elemento(
            codigo='HER001',
            nombre='Multímetro Digital',
            descripcion='Multímetro con medición de voltaje, corriente y resistencia',
            cantidad=8,
            ubicacion='Estante D, Caja 1',
            categoria_id=4
        ),
        Elemento(
            codigo='HER002',
            nombre='Cautín',
            descripcion='Cautín para soldadura electrónica',
            cantidad=6,
            ubicacion='Estante D, Caja 2',
            categoria_id=4
        ),
        Elemento(
            codigo='HER003',
            nombre='Estación de soldadura',
            descripcion='Estación de soldadura con temperatura regulable',
            cantidad=3,
            ubicacion='Estante D, Caja 2',
            categoria_id=4
        ),
        Elemento(
            codigo='HER004',
            nombre='Kit de destornilladores',
            descripcion='Kit de destornilladores de precisión para electrónica',
            cantidad=5,
            ubicacion='Estante D, Caja 3',
            categoria_id=4
        ),
        
        # Equipos Biomédicos
        Elemento(
            codigo='BIO001',
            nombre='Electrocardiograma',
            descripcion='Dispositivo para registrar la actividad eléctrica del corazón',
            cantidad=2,
            ubicacion='Estante E, Gabinete 1',
            categoria_id=5
        ),
        Elemento(
            codigo='BIO002',
            nombre='Monitor de signos vitales',
            descripcion='Monitor de signos vitales multiparámetro',
            cantidad=2,
            ubicacion='Estante E, Gabinete 1',
            categoria_id=5
        ),
        Elemento(
            codigo='BIO003',
            nombre='Doppler fetal',
            descripcion='Dispositivo para detección de latidos fetales',
            cantidad=3,
            ubicacion='Estante E, Gabinete 2',
            categoria_id=5
        ),
        Elemento(
            codigo='BIO004',
            nombre='Simulador de paciente',
            descripcion='Equipo para calibración y prueba de dispositivos médicos',
            cantidad=1,
            ubicacion='Estante E, Gabinete 3',
            categoria_id=5
        ),
        
        # Componentes Electrónicos
        Elemento(
            codigo='COM001',
            nombre='Kit de resistencias',
            descripcion='Kit variado de resistencias de distintos valores',
            cantidad=15,
            ubicacion='Estante F, Caja 1',
            categoria_id=6
        ),
        Elemento(
            codigo='COM002',
            nombre='Kit de capacitores',
            descripcion='Kit variado de capacitores de distintos valores',
            cantidad=10,
            ubicacion='Estante F, Caja 1',
            categoria_id=6
        ),
        Elemento(
            codigo='COM003',
            nombre='Transistores NPN/PNP',
            descripcion='Surtido de transistores bipolares NPN y PNP',
            cantidad=20,
            ubicacion='Estante F, Caja 2',
            categoria_id=6
        ),
        Elemento(
            codigo='COM004',
            nombre='Cristales de cuarzo',
            descripcion='Cristales osciladores de diversos valores',
            cantidad=12,
            ubicacion='Estante F, Caja 3',
            categoria_id=6
        ),
        
        # Equipos de Medición
        Elemento(
            codigo='MED001',
            nombre='Osciloscopio Digital',
            descripcion='Osciloscopio digital de 2 canales 100MHz',
            cantidad=3,
            ubicacion='Estante G, Mesa 1',
            categoria_id=7
        ),
        Elemento(
            codigo='MED002',
            nombre='Analizador de espectro',
            descripcion='Analizador de espectros para señales de RF',
            cantidad=1,
            ubicacion='Estante G, Mesa 1',
            categoria_id=7
        ),
        Elemento(
            codigo='MED003',
            nombre='Generador de señales',
            descripcion='Generador de funciones arbitrarias',
            cantidad=2,
            ubicacion='Estante G, Mesa 2',
            categoria_id=7
        ),
        
        # Material de Laboratorio
        Elemento(
            codigo='LAB001',
            nombre='Cables de conexión',
            descripcion='Set de cables de conexión rápida para protoboard',
            cantidad=20,
            ubicacion='Estante H, Cajón 1',
            categoria_id=8
        ),
        Elemento(
            codigo='LAB002',
            nombre='Protoboard',
            descripcion='Tabla de prototipos de 830 puntos',
            cantidad=15,
            ubicacion='Estante H, Cajón 1',
            categoria_id=8
        ),
        Elemento(
            codigo='LAB003',
            nombre='Fuente de alimentación',
            descripcion='Fuente DC regulable dual 0-30V/0-5A',
            cantidad=4,
            ubicacion='Estante H, Mesa 1',
            categoria_id=8
        ),
        Elemento(
            codigo='LAB004',
            nombre='Kit Cables USB',
            descripcion='Variedad de cables USB para conexión de dispositivos',
            cantidad=12,
            ubicacion='Estante H, Cajón 2',
            categoria_id=8
        )
    ]
    
    # Guardar elementos
    for elemento in elementos:
        db.session.add(elemento)
    
    # Guardar usuarios
    for usuario in usuarios:
        db.session.add(usuario)
    
    # Crear algunos préstamos de ejemplo
    prestamos = [
        Prestamo(
            elemento_id=1,
            usuario_id=1,
            cantidad=2,
            fecha_prestamo=datetime.utcnow() - timedelta(days=5),
            fecha_devolucion_esperada=datetime.utcnow() + timedelta(days=2),
            estado='prestado'
        ),
        Prestamo(
            elemento_id=3,
            usuario_id=2,
            cantidad=1,
            fecha_prestamo=datetime.utcnow() - timedelta(days=10),
            fecha_devolucion_esperada=datetime.utcnow() - timedelta(days=3),
            fecha_devolucion_real=datetime.utcnow() - timedelta(days=4),
            estado='devuelto'
        ),
        Prestamo(
            elemento_id=5,
            usuario_id=1,
            cantidad=1,
            fecha_prestamo=datetime.utcnow() - timedelta(days=3),
            fecha_devolucion_esperada=datetime.utcnow() + timedelta(days=4),
            estado='prestado'
        ),
        Prestamo(
            elemento_id=12,
            usuario_id=3,
            cantidad=2,
            fecha_prestamo=datetime.utcnow() - timedelta(days=7),
            fecha_devolucion_esperada=datetime.utcnow() - timedelta(days=1),
            estado='prestado'
        ),
        Prestamo(
            elemento_id=18,
            usuario_id=2,
            cantidad=1,
            fecha_prestamo=datetime.utcnow() - timedelta(days=15),
            fecha_devolucion_esperada=datetime.utcnow() - timedelta(days=8),
            fecha_devolucion_real=datetime.utcnow() - timedelta(days=9),
            estado='devuelto'
        ),
        Prestamo(
            elemento_id=22,
            usuario_id=3,
            cantidad=1,
            fecha_prestamo=datetime.utcnow() - timedelta(days=1),
            fecha_devolucion_esperada=datetime.utcnow() + timedelta(days=6),
            estado='prestado'
        )
    ]
    
    # Guardar préstamos
    for prestamo in prestamos:
        db.session.add(prestamo)
    
    db.session.commit()
    print("Base de datos inicializada con éxito.")

if __name__ == '__main__':
    with app.app_context():
        # Recrear todas las tablas
        db.drop_all()
        db.create_all()
        
        # Inicializar con datos de ejemplo
        init_db()