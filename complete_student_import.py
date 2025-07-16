#!/usr/bin/env python3
"""
Script para importar la base de datos completa de estudiantes (337 estudiantes)
desde el archivo CSV a la base de datos PostgreSQL.
"""

import csv
import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

def main():
    # Configuración de la base de datos
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        print("Error: DATABASE_URL no configurada")
        return
    
    # Crear conexión a la base de datos
    engine = create_engine(database_url)
    Session = sessionmaker(bind=engine)
    session = Session()
    
    # Archivo CSV con los estudiantes
    csv_file = 'attached_assets/Estudiantes_Biomedica_PostgreSQL.csv'
    
    if not os.path.exists(csv_file):
        print(f"Error: No se encontró el archivo {csv_file}")
        return
    
    # Contar estudiantes actuales
    count_query = text("SELECT COUNT(*) FROM usuario WHERE tipo = 'estudiante'")
    current_count = session.execute(count_query).scalar()
    print(f"Estudiantes actuales en la base de datos: {current_count}")
    
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
                check_query = text("SELECT id FROM usuario WHERE identificacion = :id AND tipo = 'estudiante'")
                exists = session.execute(check_query, {'id': idd}).first()
                
                if exists:
                    # Actualizar estudiante existente
                    update_query = text("""
                        UPDATE usuario 
                        SET nombre = :nombre, correo = :correo 
                        WHERE identificacion = :id AND tipo = 'estudiante'
                    """)
                    session.execute(update_query, {
                        'nombre': nombre,
                        'correo': correo,
                        'id': idd
                    })
                    updated += 1
                    if updated % 50 == 0:
                        print(f"Actualizados: {updated}")
                else:
                    # Insertar nuevo estudiante
                    insert_query = text("""
                        INSERT INTO usuario (tipo, nombre, identificacion, correo) 
                        VALUES ('estudiante', :nombre, :id, :correo)
                    """)
                    session.execute(insert_query, {
                        'nombre': nombre,
                        'id': idd,
                        'correo': correo
                    })
                    added += 1
                    if added % 50 == 0:
                        print(f"Agregados: {added}")
                
                # Hacer commit cada 100 registros para evitar problemas de memoria
                if (added + updated) % 100 == 0:
                    session.commit()
        
        # Commit final
        session.commit()
        
        # Contar estudiantes finales
        final_count = session.execute(count_query).scalar()
        
        print(f"\nResumen:")
        print(f"Estudiantes actualizados: {updated}")
        print(f"Estudiantes agregados: {added}")
        print(f"Total de estudiantes en la base de datos: {final_count}")
        
    except Exception as e:
        print(f"Error durante la importación: {e}")
        session.rollback()
        return False
    finally:
        session.close()
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)