-- ============================================================================
-- GDPR COMPLIANCE SYSTEM - FINAL CLEAN VERSION
-- PostgreSQL 15+ with Supabase
-- Complete GDPR compliance implementation
-- ============================================================================

-- =====
-- GDPR-SPECIFIC TABLES
-- =====

-- Data Processing Activities (GDPR Art. 30)
CREATE TABLE IF NOT EXISTS public.data_processing_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_name VARCHAR(200) NOT NULL,
    purpose TEXT NOT NULL,
    legal_basis VARCHAR(100) NOT NULL, -- 'consent', 'contract', 'legal_obligation', 'legitimate_interest'
    data_categories TEXT[] NOT NULL, -- ['personal_data', 'biometric_data', 'financial_data']
    data_subjects TEXT[] NOT NULL, -- ['users', 'children', 'employees']
    recipients TEXT[] NOT NULL, -- ['supabase', 'google_cloud', 'resend']
    third_country_transfers TEXT[] DEFAULT '{}', -- ['usa', 'eu']
    retention_period VARCHAR(100) NOT NULL, -- '1_year', '7_years', 'indefinite'
    security_measures TEXT[] NOT NULL, -- ['encryption', 'access_control', 'audit_logs']
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Consent Management (GDPR Art. 6, 7)
CREATE TABLE IF NOT EXISTS public.user_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    consent_type VARCHAR(100) NOT NULL, -- 'data_processing', 'marketing', 'analytics', 'cookies'
    consent_given BOOLEAN NOT NULL,
    consent_method VARCHAR(50) NOT NULL, -- 'explicit', 'opt_in', 'opt_out'
    consent_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    withdrawal_timestamp TIMESTAMP WITH TIME ZONE,
    ip_address INET,
    user_agent TEXT,
    consent_version VARCHAR(20) DEFAULT '1.0',
    legal_basis VARCHAR(100) NOT NULL,
    purpose TEXT NOT NULL,
    data_categories TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, consent_type, consent_version)
);

-- Data Subject Rights Requests (GDPR Art. 15-22)
CREATE TABLE IF NOT EXISTS public.data_subject_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    request_type VARCHAR(50) NOT NULL, -- 'access', 'rectification', 'erasure', 'portability', 'restriction', 'objection'
    request_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'rejected'
    request_description TEXT,
    requested_data_categories TEXT[],
    verification_method VARCHAR(50), -- 'email', 'id_document', 'phone'
    verification_status VARCHAR(50) DEFAULT 'pending',
    verification_token VARCHAR(255),
    verification_expires_at TIMESTAMP WITH TIME ZONE,
    response_data JSONB, -- For access requests
    response_file_url TEXT, -- For data export files
    rejection_reason TEXT,
    processed_by UUID REFERENCES auth.users(id),
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data Breach Log (GDPR Art. 33, 34)
CREATE TABLE IF NOT EXISTS public.data_breaches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    breach_type VARCHAR(100) NOT NULL, -- 'confidentiality', 'integrity', 'availability'
    severity VARCHAR(50) NOT NULL, -- 'low', 'medium', 'high', 'critical'
    affected_users_count INTEGER DEFAULT 0,
    affected_data_categories TEXT[] NOT NULL,
    breach_description TEXT NOT NULL,
    cause TEXT,
    containment_measures TEXT,
    notification_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'notified_authority', 'notified_users', 'completed'
    authority_notified_at TIMESTAMP WITH TIME ZONE,
    users_notified_at TIMESTAMP WITH TIME ZONE,
    authority_deadline TIMESTAMP WITH TIME ZONE,
    users_deadline TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Privacy Settings (User Preferences)
CREATE TABLE IF NOT EXISTS public.privacy_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    data_processing_consent BOOLEAN DEFAULT false,
    marketing_consent BOOLEAN DEFAULT false,
    analytics_consent BOOLEAN DEFAULT false,
    cookies_consent BOOLEAN DEFAULT false,
    data_sharing_consent BOOLEAN DEFAULT false,
    profile_visibility VARCHAR(50) DEFAULT 'private', -- 'public', 'private', 'friends'
    email_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    data_retention_preference VARCHAR(50) DEFAULT 'standard', -- 'minimal', 'standard', 'extended'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- =====
-- GDPR FUNCTIONS
-- =====

-- Function to get all user data (GDPR Art. 15 - Right of Access)
CREATE OR REPLACE FUNCTION public.get_all_user_data(user_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB := '{}';
    user_profile JSONB;
    user_consents JSONB;
    user_requests JSONB;
    user_settings JSONB;
    user_tasks JSONB;
    user_documents JSONB;
BEGIN
    -- Get user profile data
    SELECT to_jsonb(p.*) INTO user_profile
    FROM public.user_profiles p
    WHERE p.user_id = user_uuid;
    
    -- Get user consents
    SELECT jsonb_agg(to_jsonb(c.*)) INTO user_consents
    FROM public.user_consents c
    WHERE c.user_id = user_uuid;
    
    -- Get user requests
    SELECT jsonb_agg(to_jsonb(r.*)) INTO user_requests
    FROM public.data_subject_requests r
    WHERE r.user_id = user_uuid;
    
    -- Get user privacy settings
    SELECT to_jsonb(s.*) INTO user_settings
    FROM public.privacy_settings s
    WHERE s.user_id = user_uuid;
    
    -- Get user tasks
    SELECT jsonb_agg(to_jsonb(t.*)) INTO user_tasks
    FROM public.user_tasks t
    WHERE t.user_id = user_uuid;
    
    -- Get user documents (if table exists)
    BEGIN
        SELECT jsonb_agg(to_jsonb(d.*)) INTO user_documents
        FROM public.uploaded_documents d
        WHERE d.user_id = user_uuid;
    EXCEPTION
        WHEN undefined_table THEN
            user_documents := '[]'::jsonb;
    END;
    
    -- Compile result
    result := jsonb_build_object(
        'user_profile', COALESCE(user_profile, '{}'::jsonb),
        'consents', COALESCE(user_consents, '[]'::jsonb),
        'data_requests', COALESCE(user_requests, '[]'::jsonb),
        'privacy_settings', COALESCE(user_settings, '{}'::jsonb),
        'tasks', COALESCE(user_tasks, '[]'::jsonb),
        'documents', COALESCE(user_documents, '[]'::jsonb),
        'export_timestamp', NOW(),
        'data_categories', ARRAY['personal_data', 'preferences', 'activity_data', 'documents']
    );
    
    RETURN result;
END;
$$;

-- Function to soft delete user data (GDPR Art. 17 - Right to Erasure)
CREATE OR REPLACE FUNCTION public.soft_delete_user_data(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update user profile to anonymize
    UPDATE public.user_profiles 
    SET 
        full_name = 'DELETED_USER',
        email = 'deleted@example.com',
        phone_number = NULL,
        address = NULL,
        date_of_birth = NULL,
        updated_at = NOW()
    WHERE user_id = user_uuid;
    
    -- Delete user consents
    DELETE FROM public.user_consents WHERE user_id = user_uuid;
    
    -- Delete user privacy settings
    DELETE FROM public.privacy_settings WHERE user_id = user_uuid;
    
    -- Delete user tasks
    DELETE FROM public.user_tasks WHERE user_id = user_uuid;
    
    -- Delete user documents (if table exists)
    BEGIN
        DELETE FROM public.uploaded_documents WHERE user_id = user_uuid;
    EXCEPTION
        WHEN undefined_table THEN
            -- Table doesn't exist, continue
            NULL;
    END;
    
    -- Mark data subject requests as processed
    UPDATE public.data_subject_requests 
    SET 
        request_status = 'completed',
        processed_at = NOW(),
        updated_at = NOW()
    WHERE user_id = user_uuid;
    
    RETURN TRUE;
END;
$$;

-- =====
-- GDPR DATA INSERTION
-- =====

-- Insert default data processing activities
INSERT INTO public.data_processing_activities (
    activity_name, purpose, legal_basis, data_categories, data_subjects,
    recipients, third_country_transfers, retention_period, security_measures
) VALUES
(
    'User Registration and Authentication',
    'User account creation, authentication, and profile management',
    'contract',
    ARRAY['personal_data', 'authentication_data'],
    ARRAY['users'],
    ARRAY['supabase'],
    ARRAY['eu'],
    'account_lifetime',
    ARRAY['encryption', 'access_control', 'audit_logs']
),
(
    'Task Management and Onboarding',
    'Providing personalized onboarding tasks and progress tracking',
    'contract',
    ARRAY['personal_data', 'preference_data', 'activity_data'],
    ARRAY['users'],
    ARRAY['supabase'],
    ARRAY['eu'],
    '7_years',
    ARRAY['encryption', 'access_control', 'audit_logs']
),
(
    'Document Storage and Processing',
    'Secure storage and AI-powered processing of user documents',
    'consent',
    ARRAY['personal_data', 'biometric_data', 'financial_data'],
    ARRAY['users'],
    ARRAY['supabase', 'google_cloud'],
    ARRAY['usa', 'eu'],
    '7_years',
    ARRAY['encryption', 'access_control', 'audit_logs', 'client_side_encryption']
),
(
    'Email Notifications',
    'Sending task reminders and important notifications',
    'contract',
    ARRAY['personal_data', 'contact_data'],
    ARRAY['users'],
    ARRAY['resend'],
    ARRAY['usa'],
    '1_year',
    ARRAY['encryption', 'access_control']
),
(
    'Analytics and Improvement',
    'Analyzing usage patterns to improve the service',
    'legitimate_interest',
    ARRAY['usage_data', 'preference_data'],
    ARRAY['users'],
    ARRAY['supabase'],
    ARRAY['eu'],
    '2_years',
    ARRAY['anonymization', 'access_control']
)
ON CONFLICT DO NOTHING;

-- =====
-- ROW LEVEL SECURITY (RLS)
-- =====

-- Enable RLS on all GDPR tables
ALTER TABLE public.data_processing_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_subject_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_breaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.privacy_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_consents
CREATE POLICY "Users can view their own consents" ON public.user_consents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own consents" ON public.user_consents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own consents" ON public.user_consents
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for data_subject_requests
CREATE POLICY "Users can view their own requests" ON public.data_subject_requests
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own requests" ON public.data_subject_requests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own requests" ON public.data_subject_requests
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for privacy_settings
CREATE POLICY "Users can view their own settings" ON public.privacy_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON public.privacy_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON public.privacy_settings
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for data_processing_activities (read-only for users)
CREATE POLICY "Users can view processing activities" ON public.data_processing_activities
    FOR SELECT USING (true);

-- RLS Policies for data_breaches (admin only)
CREATE POLICY "Only admins can view breaches" ON public.data_breaches
    FOR ALL USING (false); -- Will be configured with service role

-- =====
-- INDEXES FOR PERFORMANCE
-- =====

CREATE INDEX IF NOT EXISTS idx_user_consents_user_id ON public.user_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_consents_type ON public.user_consents(consent_type);
CREATE INDEX IF NOT EXISTS idx_data_subject_requests_user_id ON public.data_subject_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_data_subject_requests_status ON public.data_subject_requests(request_status);
CREATE INDEX IF NOT EXISTS idx_privacy_settings_user_id ON public.privacy_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_data_breaches_severity ON public.data_breaches(severity);
CREATE INDEX IF NOT EXISTS idx_data_breaches_status ON public.data_breaches(notification_status);

-- =====
-- TRIGGERS FOR AUDIT LOGGING
-- =====

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_data_processing_activities_updated_at
    BEFORE UPDATE ON public.data_processing_activities
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_consents_updated_at
    BEFORE UPDATE ON public.user_consents
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_data_subject_requests_updated_at
    BEFORE UPDATE ON public.data_subject_requests
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_data_breaches_updated_at
    BEFORE UPDATE ON public.data_breaches
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_privacy_settings_updated_at
    BEFORE UPDATE ON public.privacy_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
