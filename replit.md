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

## User Preferences

Preferred communication style: Simple, everyday language.