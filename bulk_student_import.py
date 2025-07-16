#!/usr/bin/env python3
"""
Script para importar masivamente todos los estudiantes faltantes
"""

import csv
import os
import sys
from app import app, db
from models import Usuario

def main():
    with app.app_context():
        # Archivo CSV con los estudiantes
        csv_file = 'attached_assets/Estudiantes_Biomedica_PostgreSQL.csv'
        
        if not os.path.exists(csv_file):
            print(f"Error: No se encontró el archivo {csv_file}")
            return
        
        # Contar estudiantes actuales
        current_count = Usuario.query.filter_by(tipo='estudiante').count()
        print(f"Estudiantes actuales: {current_count}")
        
        # Leer y procesar el archivo CSV
        added = 0
        updated = 0
        
        try:
            with open(csv_file, 'r', encoding='utf-8') as file:
                reader = csv.DictReader(file)
                
                for row in reader:
                    idd = row['IDD'].strip()
                    nombre = row['NOMBRE'].strip()
                    correo = row['Correo_Institucional'].strip()
                    
                    if not idd or not nombre or not correo:
                        continue
                    
                    # Verificar si el estudiante ya existe
                    existing = Usuario.query.filter_by(identificacion=idd, tipo='estudiante').first()
                    
                    if existing:
                        # Actualizar estudiante existente
                        existing.nombre = nombre
                        existing.correo = correo
                        updated += 1
                    else:
                        # Crear nuevo estudiante
                        nuevo_estudiante = Usuario(
                            tipo='estudiante',
                            nombre=nombre,
                            identificacion=idd,
                            correo=correo
                        )
                        db.session.add(nuevo_estudiante)
                        added += 1
                    
                    # Hacer commit cada 50 registros
                    if (added + updated) % 50 == 0:
                        db.session.commit()
                        print(f"Procesados: {added + updated} (Agregados: {added}, Actualizados: {updated})")
                
                # Commit final
                db.session.commit()
                
                # Contar estudiantes finales
                final_count = Usuario.query.filter_by(tipo='estudiante').count()
                
                print(f"\nResumen:")
                print(f"Estudiantes actualizados: {updated}")
                print(f"Estudiantes agregados: {added}")
                print(f"Total de estudiantes en la base de datos: {final_count}")
                
        except Exception as e:
            print(f"Error durante la importación: {e}")
            db.session.rollback()
            return False
        
        return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)