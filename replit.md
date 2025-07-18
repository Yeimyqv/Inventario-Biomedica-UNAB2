# Sistema de Gestión de Inventario - Laboratorios Ingeniería Biomédica UNAB

## Overview

This is a Flask-based web application for managing biomedical engineering laboratory inventory at Universidad Autónoma de Bucaramanga (UNAB). The system handles equipment loans, returns, user management, and generates reports for laboratory staff. It supports three user types: students, teachers, and laboratory technicians, each with different access levels and capabilities.

## System Architecture

### Backend Architecture
- **Framework**: Flask 3.1.0 with Python 3.11
- **Database ORM**: SQLAlchemy 2.0.40 with Flask-SQLAlchemy 3.1.1
- **Database**: PostgreSQL with psycopg2-binary adapter
- **Web Server**: Gunicorn 23.0.0 for production deployment
- **Validation**: Email-validator for user email validation

### Frontend Architecture
- **Template Engine**: Jinja2 (Flask's default)
- **CSS Framework**: Bootstrap 5.3.0 with custom CSS
- **JavaScript**: Vanilla JavaScript with modular approach
- **UI Components**: Custom modals, notifications, and responsive design
- **Font**: Google Fonts Roboto family

### Database Schema
The application uses four main models:
- **Categoria**: Product categories (amplifiers, Arduino, sensors, etc.)
- **Elemento**: Inventory items with category relationships
- **Usuario**: Users (students, teachers, laboratory staff)
- **Prestamo**: Loan records linking users and elements

## Key Components

### User Management
- **Student Access**: Simple name-based identification with autocomplete
- **Teacher/Lab Staff Access**: PIN-based authentication (DOC1234/LAB5678)
- **Role-based Permissions**: Different interfaces and capabilities per user type

### Inventory Management
- **CSV Import System**: Automated inventory loading from CSV files
- **Category-based Organization**: Elements grouped by categories
- **Real-time Stock Tracking**: Automatic quantity updates on loans/returns
- **Image Support**: Product images with placeholder fallback

### Loan System
- **Loan Processing**: Create loans with user, element, and quantity tracking
- **Return Processing**: Only laboratory staff can process returns
- **Status Tracking**: Active loans vs. returned items
- **Observation System**: Return conditions and notes

### Reporting Module
- **Loan Reports**: Filtered by date range, user type, subject
- **User Analytics**: Student and teacher usage statistics
- **Subject Analysis**: Most active subjects and materials
- **Export Capabilities**: PDF and Excel export functionality

### Administrative Module
- **User Management**: Full CRUD operations for students, teachers, and laboratory staff
- **Subject Management**: Create, edit, and manage academic subjects with codes and active status
- **Data Validation**: Unique identification numbers, email format validation, and referential integrity
- **Laboratory Staff Access**: Administrative functions restricted to authenticated laboratory personnel
- **Audit Trail**: Activity logging for all administrative operations

## Data Flow

1. **User Authentication**: Users select type and authenticate (PIN for staff)
2. **Inventory Loading**: System loads from database, falls back to CSV import
3. **Loan Creation**: User selects items, system validates availability
4. **Return Processing**: Lab staff processes returns with observations
5. **Report Generation**: System aggregates data for various report types

## External Dependencies

### Python Packages
- **Flask**: Web framework and routing
- **SQLAlchemy**: Database ORM and migrations
- **Gunicorn**: WSGI HTTP Server for production
- **psycopg2-binary**: PostgreSQL database adapter
- **email-validator**: Email validation with DNS checking

### Frontend Libraries
- **Bootstrap 5.3.0**: CSS framework via CDN
- **Google Fonts**: Roboto font family

### Development Tools
- **Nix**: Package management and environment setup
- **UV**: Python package manager (lock file present)

## Deployment Strategy

### Production Environment
- **Platform**: Replit with autoscale deployment target
- **Server**: Gunicorn bound to 0.0.0.0:5000
- **Database**: Environment-configured PostgreSQL
- **Process Management**: Automatic restarts and port handling

### Development Environment
- **Local Server**: Flask development server with debug mode
- **Hot Reload**: Template auto-reload enabled
- **Database**: SQLite fallback for development

### Configuration Management
- **Environment Variables**: Database URL, Flask secret key
- **Connection Pooling**: 300-second recycle with pre-ping
- **Security**: Secret key from environment or development fallback

## Recent Changes
- June 25, 2025: Initial setup and core functionality implementation
- June 25, 2025: Enhanced reports module with student search functionality and updated display format
- June 25, 2025: Updated reports table structure to include email column for all user types
- June 25, 2025: Assigned institutional email addresses to all faculty and lab staff members
- June 25, 2025: Added comprehensive charts and graphs module using Chart.js for ranking reports only
- June 25, 2025: Implemented toggle functionality between table view, chart view, and combined view for ranking reports
- June 26, 2025: Configured charts to only appear in ranking reports (students, teachers, subjects) as per user requirements
- June 26, 2025: Implemented PDF export functionality with jsPDF library - table-only reports export tables, ranking reports export both tables and charts
- June 26, 2025: Added CSV export functionality for Excel compatibility with proper data formatting
- June 26, 2025: Enhanced charts with percentage calculations and labels for better data visualization in ranking reports
- July 01, 2025: Implemented comprehensive test data setup for reports module validation with 125 total loans, 30 students, 5 teachers, 85 returns, and 15 observations
- July 16, 2025: Fixed loan system API integration - updated models to include "disponibles" field, resolved category loading issues
- July 16, 2025: Implemented laboratory staff loan restrictions - removed student/teacher loan options, simplified to self-loans only
- July 16, 2025: Fixed teacher authentication and loan creation - added proper database ID lookup for teachers during loan process
- July 16, 2025: Fixed teacher dropdown mismatch - synchronized teacher list with database entries, removed non-existent teachers
- July 16, 2025: Implemented automatic teacher creation - system now creates database entries for any teacher, supports all teachers not just those in database
- July 16, 2025: Completed full student database import - successfully imported all 337 students from CSV file to reach 342 total students in database
- July 18, 2025: Implemented comprehensive administrative module for laboratory staff - added full CRUD operations for managing students, teachers, laboratory technicians, and subjects
- July 18, 2025: Added Subject/Materia model to database schema with proper relationships and validation
- July 18, 2025: Created complete administrative interface with tabbed navigation for managing all user types and academic subjects
- July 18, 2025: Initialized database with 15 sample biomedical engineering subjects including proper codes and active status tracking
- July 18, 2025: Enhanced administrative module with complete edit and delete functionality - added professional modal forms with validation, search functionality, and proper foreign key constraint handling
- July 18, 2025: Implemented data integrity protection - users with active loans cannot be deleted, but users with only returned loans can be safely deleted

## User Preferences

Preferred communication style: Simple, everyday language.