#!/usr/bin/env python3
"""
Script para inicializar materias de ejemplo en la base de datos.
"""

import os
from app import app, db
from models import Materia

def init_sample_subjects():
    """Inicializar materias de ejemplo en la base de datos."""
    
    # Lista de materias reales de Ingeniería Biomédica UNAB
    materias_ejemplo = [
        {"nombre": "TELE - ROBÓTICA", "codigo": "TR001"},
        {"nombre": "INSTRUMENTACIÓN", "codigo": "INS001"},
        {"nombre": "ELECTRÓNICA ANÁLOGA", "codigo": "EA001"},
        {"nombre": "ELECTRÓNICA DE POTENCIA", "codigo": "EP001"},
        {"nombre": "SISTEMAS EMBEBIDOS", "codigo": "SE001"},
        {"nombre": "SISTEMAS DIGITALES", "codigo": "SD001"},
        {"nombre": "PROYECTO INTEGRADOR", "codigo": "PI001"},
        {"nombre": "PROYECTO DE GRADO", "codigo": "PG001"},
        {"nombre": "CIRCUITOS ELÉCTRICOS", "codigo": "CE001"},
        {"nombre": "BIOMECÁNICA CLÍNICA", "codigo": "BC001"},
        {"nombre": "PROCESAMIENTO DE SEÑALES", "codigo": "PS001"},
        {"nombre": "OTRA", "codigo": "OTR001"}
    ]
    
    with app.app_context():
        # Verificar cuántas materias ya existen
        materias_existentes = Materia.query.count()
        print(f"Materias existentes en la base de datos: {materias_existentes}")
        
        if materias_existentes == 0:
            print("Inicializando materias de ejemplo...")
            
            for materia_data in materias_ejemplo:
                # Verificar si ya existe una materia con el mismo nombre
                materia_existente = Materia.query.filter_by(nombre=materia_data["nombre"]).first()
                
                if not materia_existente:
                    materia = Materia(
                        nombre=materia_data["nombre"],
                        codigo=materia_data["codigo"],
                        activa=True
                    )
                    db.session.add(materia)
                    print(f"  - Agregada: {materia_data['nombre']} ({materia_data['codigo']})")
                else:
                    print(f"  - Ya existe: {materia_data['nombre']}")
            
            try:
                db.session.commit()
                print(f"✓ Se han inicializado {len(materias_ejemplo)} materias reales de Ingeniería Biomédica UNAB.")
            except Exception as e:
                db.session.rollback()
                print(f"✗ Error al guardar materias: {e}")
        else:
            print("Ya existen materias en la base de datos. No se inicializarán nuevas materias.")
            
        # Mostrar resumen final
        total_materias = Materia.query.count()
        materias_activas = Materia.query.filter_by(activa=True).count()
        print(f"\nResumen final:")
        print(f"  - Total de materias: {total_materias}")
        print(f"  - Materias activas: {materias_activas}")

if __name__ == "__main__":
    init_sample_subjects()