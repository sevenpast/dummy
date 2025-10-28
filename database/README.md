# Database Setup - Organized by Functionality

## Overview
This directory contains organized SQL files for setting up the ExpatVillage database, grouped by functionality for better maintainability.

## Directory Structure

### Core/
Foundation database schema files.
- `01_initial_schema.sql` - Basic database schema and tables
- `02_add_profile_fields.sql` - Additional profile fields

### Features/
Feature-specific database implementations.
- Document Vault System (01-04)
- AI & Processing Features (05-06)
- Compliance Features (07)

### Tasks/
Onboarding task system implementations.
- `01_task1_permit_status.sql` - Task 1: Check permit application status
- `02_task3_municipality_registration.sql` - Task 3: Register at municipality
- `03_task4_school_registration.sql` - Task 4: Register kids for school
- `04_task5_residence_permit.sql` - Task 5: Receive residence permit card

### Infrastructure/
System-level functionality and extensions.
- `01_install_postgres_extensions.sql` - PostgreSQL extensions (pg_cron, pg_net)
- `02_create_notification_queue.sql` - Notification queue system
- `03_setup_cron_jobs.sql` - Cron jobs for email reminders
- `04_add_postal_canton_fields.sql` - Postal code and canton fields

## Installation Order

### 1. Core Setup (Required First)
```bash
cd core/
# Run in numerical order:
01_initial_schema.sql
02_add_profile_fields.sql
```

### 2. Infrastructure (Required for Tasks)
```bash
cd infrastructure/
# Run in numerical order:
01_install_postgres_extensions.sql
02_create_notification_queue.sql
03_setup_cron_jobs.sql
04_add_postal_canton_fields.sql
```

### 3. Features (Optional but Recommended)
```bash
cd features/
# Run in numerical order:
01_document_vault_schema.sql
02_create_storage_bucket.sql
03_add_ai_classification.sql
04_create_simple_documents_table.sql
05_create_document_processing_table.sql
06_gemini_cache_system.sql
07_gdpr_compliance_system.sql
```

### 4. Tasks (Core Application)
```bash
cd tasks/
# Run in numerical order:
01_task1_permit_status.sql
02_task3_municipality_registration.sql
03_task4_school_registration.sql
04_task5_residence_permit.sql
```

## Features Included

### Tasks
- Task 1: Check permit application status (4 variants: EU/EFTA, visa-exempt, visa-required, no-info)
- Task 3: Register at municipality (4 variants: EU/EFTA, visa-exempt, visa-required, no-info)
- Task 4: Register kids for school (3 variants: with-children, without-children, unknown-children)
- Task 5: Receive residence permit card (1 variant: all-users)

### Features
- User profiles with postal code and canton
- Document vault with AI classification
- Email notification system with cron jobs
- GDPR compliance system
- Gemini API caching
- PDF processing queue
- Storage bucket setup

## Notes

- All files use `WHERE NOT EXISTS` for idempotency
- All files use `gen_random_uuid()` for ID generation
- All files include proper timestamps
- All files are production-ready and tested

## Cleanup

All fix files have been removed:
- All `*_fix_*.sql` files
- All `*_update_*.sql` files  
- All `*_implement_*.sql` files
- All temporary and debug files

Only the final, clean versions remain.
