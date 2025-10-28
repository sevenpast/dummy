# Features Database Schema

## Overview
Feature-specific database schema files that implement various application features.

## Files

### Document Vault System
- 01_document_vault_schema.sql - Document vault system
- 02_create_storage_bucket.sql - Storage bucket setup
- 03_add_ai_classification.sql - AI classification system
- 04_create_simple_documents_table.sql - Simple documents table

### AI & Processing Features
- 05_create_document_processing_table.sql - Document processing queue for PDF OCR
- 06_gemini_cache_system.sql - Gemini API caching system

### Compliance Features
- 07_gdpr_compliance_system.sql - GDPR compliance system

## Installation Order
Run these files after core schema, in numerical order:
1. Document Vault (01-04)
2. AI Features (05-06)
3. Compliance (07)

## Dependencies
- Requires: Core schema (01-02)
- Can be installed independently of tasks
