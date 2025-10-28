# Tasks Database Schema

## Overview
Task-specific database schema files that implement the onboarding task system.

## Files

### Task Implementations
- 01_task1_permit_status.sql - Task 1: Check permit application status
- 02_task3_municipality_registration.sql - Task 3: Register at municipality
- 03_task4_school_registration.sql - Task 4: Register kids for school
- 04_task5_residence_permit.sql - Task 5: Receive residence permit card

## Task Variants

### Task 1: Permit Status
- EU/EFTA citizens
- Visa-exempt countries
- Visa-required countries
- No country selected

### Task 3: Municipality Registration
- EU/EFTA citizens
- Visa-exempt countries
- Visa-required countries
- No country selected

### Task 4: School Registration
- Users with children
- Users without children
- Unknown children status

### Task 5: Residence Permit
- All users (single variant)

## Installation Order
Run these files after core and infrastructure setup:
1. `01_task1_permit_status.sql`
2. `02_task3_municipality_registration.sql`
3. `03_task4_school_registration.sql`
4. `04_task5_residence_permit.sql`

## Dependencies
- Requires: Core schema (01-02)
- Requires: Infrastructure (01-04)
- Optional: Features (for enhanced functionality)
