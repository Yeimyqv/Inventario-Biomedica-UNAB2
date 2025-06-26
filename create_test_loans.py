#!/usr/bin/env python3
"""
Script para crear préstamos de prueba aleatorios para el sistema de gestión de laboratorio.
"""

import random
from datetime import datetime, timedelta
from app import app, db
from models import Usuario, Elemento, Prestamo

def crear_prestamos_aleatorios(cantidad=20):
    """Crear préstamos aleatorios para pruebas del módulo de reportes."""
    with app.app_context():
        # Obtener estudiantes disponibles
        estudiantes = Usuario.query.filter_by(tipo='estudiante').all()
        
        # Obtener elementos disponibles
        elementos = Elemento.query.filter(Elemento.cantidad > 0).all()
        
        if not estudiantes:
            print("No hay estudiantes en la base de datos")
            return
            
        if not elementos:
            print("No hay elementos disponibles en la base de datos")
            return
        
        print(f"Creando {cantidad} préstamos aleatorios...")
        print(f"Estudiantes disponibles: {len(estudiantes)}")
        print(f"Elementos disponibles: {len(elementos)}")
        
        prestamos_creados = 0
        
        for i in range(cantidad):
            try:
                # Seleccionar estudiante y elemento aleatorio
                estudiante = random.choice(estudiantes)
                elemento = random.choice(elementos)
                
                # Cantidad aleatoria entre 1 y 3
                cantidad_prestamo = random.randint(1, min(3, elemento.cantidad))
                
                # Fecha aleatoria en los últimos 60 días
                fecha_base = datetime.now()
                dias_atras = random.randint(1, 60)
                fecha_prestamo = fecha_base - timedelta(days=dias_atras)
                
                # Crear el préstamo
                prestamo = Prestamo(
                    elemento_id=elemento.id,
                    usuario_id=estudiante.id,
                    cantidad=cantidad_prestamo,
                    fecha_prestamo=fecha_prestamo,
                    fecha_devolucion_esperada=fecha_prestamo + timedelta(days=7),
                    estado='prestado'
                )
                
                # 70% de probabilidad de que esté devuelto
                if random.random() < 0.7:
                    # Fecha de devolución entre 1-10 días después del préstamo
                    dias_devolucion = random.randint(1, 10)
                    prestamo.fecha_devolucion_real = fecha_prestamo + timedelta(days=dias_devolucion)
                    prestamo.estado = 'devuelto'
                    
                    # Asignar observación aleatoria para devoluciones
                    observaciones = [
                        'Funciona correctamente',
                        'Perfecto estado',
                        'No funciona / presenta fallas',
                        'Requiere mantenimiento',
                        'Estado regular'
                    ]
                    prestamo.observaciones = random.choice(observaciones)
                
                db.session.add(prestamo)
                prestamos_creados += 1
                
                if prestamos_creados % 5 == 0:
                    print(f"Creados {prestamos_creados}/{cantidad} préstamos...")
                
            except Exception as e:
                print(f"Error creando préstamo {i+1}: {str(e)}")
                continue
        
        # Guardar todos los cambios
        db.session.commit()
        print(f"\n✅ Creados {prestamos_creados} préstamos de prueba exitosamente")
        
        # Mostrar estadísticas
        total_prestamos = Prestamo.query.count()
        prestamos_activos = Prestamo.query.filter_by(estado='prestado').count()
        prestamos_devueltos = Prestamo.query.filter_by(estado='devuelto').count()
        
        print(f"\n📊 Estadísticas actuales:")
        print(f"   Total préstamos en DB: {total_prestamos}")
        print(f"   Préstamos activos: {prestamos_activos}")
        print(f"   Préstamos devueltos: {prestamos_devueltos}")

if __name__ == '__main__':
    crear_prestamos_aleatorios(20)