# Infrastructure Database Schema

## Overview
Infrastructure database schema files that provide system-level functionality.

## Files

### System Extensions
- 01_install_postgres_extensions.sql - PostgreSQL extensions (pg_cron, pg_net)

### Notification System
- 02_create_notification_queue.sql - Notification queue system
- 03_setup_cron_jobs.sql - Cron jobs for email reminders

### Profile Extensions
- 04_add_postal_canton_fields.sql - Postal code and canton fields

## Installation Order
Run these files after core schema, in numerical order:
1. `01_install_postgres_extensions.sql`
2. `02_create_notification_queue.sql`
3. `03_setup_cron_jobs.sql`
4. `04_add_postal_canton_fields.sql`

## Dependencies
- Requires: Core schema (01-02)
- Required for: Tasks (01-04)
- Optional for: Features

## Features Provided
- Email notification system
- Automated task reminders
- Swiss postal code support
- Cron job scheduling
