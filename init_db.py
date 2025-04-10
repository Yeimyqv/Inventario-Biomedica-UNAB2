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
        Usuario(tipo='docente', nombre='Carlos Rodríguez', identificacion='D001', pin='DOC1234'),
        Usuario(tipo='laboratorista', nombre='Ana Torres', identificacion='L001', pin='LAB5678')
    ]
    
    # Crear categorías de ejemplo
    categorias = [
        Categoria(nombre='Amplificadores'),
        Categoria(nombre='Arduino'),
        Categoria(nombre='Sensores'),
        Categoria(nombre='Herramientas')
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
            cantidad=5,
            ubicacion='Estante A, Caja 3',
            categoria_id=1
        ),
        Elemento(
            codigo='AMP002',
            nombre='LM348',
            descripcion='Amplificador operacional cuádruple',
            cantidad=3,
            ubicacion='Estante A, Caja 3',
            categoria_id=1
        ),
        
        # Arduino
        Elemento(
            codigo='ARD001',
            nombre='UNO',
            descripcion='Placa Arduino UNO con microcontrolador ATmega328P',
            cantidad=4,
            ubicacion='Estante B, Caja 1',
            categoria_id=2
        ),
        Elemento(
            codigo='ARD002',
            nombre='UNO R3 Compatible',
            descripcion='Placa compatible con Arduino UNO R3',
            cantidad=2,
            ubicacion='Estante B, Caja 1',
            categoria_id=2
        ),
        Elemento(
            codigo='ARD003',
            nombre='Nano',
            descripcion='Placa Arduino Nano con microcontrolador ATmega328P',
            cantidad=6,
            ubicacion='Estante B, Caja 2',
            categoria_id=2
        ),
        
        # Sensores
        Elemento(
            codigo='SEN001',
            nombre='LM35',
            descripcion='Sensor de temperatura analógico',
            cantidad=8,
            ubicacion='Estante C, Caja 1',
            categoria_id=3
        ),
        Elemento(
            codigo='SEN002',
            nombre='HC-SR04',
            descripcion='Sensor ultrasónico de distancia',
            cantidad=5,
            ubicacion='Estante C, Caja 1',
            categoria_id=3
        ),
        
        # Herramientas
        Elemento(
            codigo='HER001',
            nombre='Multímetro Digital',
            descripcion='Multímetro con medición de voltaje, corriente y resistencia',
            cantidad=3,
            ubicacion='Estante D, Caja 1',
            categoria_id=4
        ),
        Elemento(
            codigo='HER002',
            nombre='Cautín',
            descripcion='Cautín para soldadura electrónica',
            cantidad=2,
            ubicacion='Estante D, Caja 2',
            categoria_id=4
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
            cantidad=1,
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