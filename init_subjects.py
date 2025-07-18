#!/usr/bin/env python3
"""
Script para inicializar materias de ejemplo en la base de datos.
"""

import os
from app import app, db
from models import Materia

def init_sample_subjects():
    """Inicializar materias de ejemplo en la base de datos."""
    
    # Lista de materias comunes en Ingeniería Biomédica
    materias_ejemplo = [
        {"nombre": "Bioinstrumentación", "codigo": "BIO001"},
        {"nombre": "Procesamiento de Señales Biomédicas", "codigo": "BIO002"},
        {"nombre": "Sistemas de Imágenes Médicas", "codigo": "BIO003"},
        {"nombre": "Electrónica Médica", "codigo": "BIO004"},
        {"nombre": "Biomateriales", "codigo": "BIO005"},
        {"nombre": "Biomecánica", "codigo": "BIO006"},
        {"nombre": "Telemedicina", "codigo": "BIO007"},
        {"nombre": "Instrumentación Quirúrgica", "codigo": "BIO008"},
        {"nombre": "Bioética", "codigo": "BIO009"},
        {"nombre": "Gestión de Tecnología Médica", "codigo": "BIO010"},
        {"nombre": "Análisis de Imágenes Médicas", "codigo": "BIO011"},
        {"nombre": "Dispositivos Médicos", "codigo": "BIO012"},
        {"nombre": "Fisiología Aplicada", "codigo": "BIO013"},
        {"nombre": "Rehabilitación y Ortopedia", "codigo": "BIO014"},
        {"nombre": "Ingeniería Clínica", "codigo": "BIO015"}
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
                print(f"✓ Se han inicializado {len(materias_ejemplo)} materias de ejemplo.")
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