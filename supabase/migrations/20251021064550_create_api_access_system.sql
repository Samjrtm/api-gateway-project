/*
  # Create API Access System

  1. New Tables
    - `api_keys`
      - `id` (uuid, primary key)
      - `key_hash` (text, unique) - Hashed API key
      - `user_id` (text) - Identifier for the key owner
      - `name` (text) - Friendly name for the key
      - `is_active` (boolean, default true) - Whether key is active
      - `rate_limit` (integer, default 100) - Requests per minute
      - `last_used_at` (timestamptz) - Last usage timestamp
      - `created_at` (timestamptz, default now())
      - `expires_at` (timestamptz) - Optional expiration date
    
    - `api_requests`
      - `id` (uuid, primary key)
      - `api_key_id` (uuid, foreign key to api_keys)
      - `endpoint` (text) - The endpoint accessed
      - `method` (text) - HTTP method
      - `status_code` (integer) - Response status
      - `ip_address` (text) - Client IP
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated access only
    - Create indexes for performance

  3. Important Notes
    - API keys are hashed before storage for security
    - Request logs help track usage and detect abuse
    - Rate limits are configurable per key
*/

-- Create api_keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key_hash text UNIQUE NOT NULL,
  user_id text NOT NULL,
  name text NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  rate_limit integer DEFAULT 100 NOT NULL,
  last_used_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  expires_at timestamptz
);

-- Create api_requests table for logging
CREATE TABLE IF NOT EXISTS api_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id uuid REFERENCES api_keys(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  method text NOT NULL,
  status_code integer NOT NULL,
  ip_address text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_requests ENABLE ROW LEVEL SECURITY;

-- Policies for api_keys
CREATE POLICY "Service role can manage all API keys"
  ON api_keys FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policies for api_requests
CREATE POLICY "Service role can manage all API requests"
  ON api_requests FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_api_requests_api_key_id ON api_requests(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_requests_created_at ON api_requests(created_at);
