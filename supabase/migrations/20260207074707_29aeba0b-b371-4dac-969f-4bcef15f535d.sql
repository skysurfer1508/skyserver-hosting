-- Enable pgcrypto extension for encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create a secure function to encrypt sensitive data
-- Uses symmetric encryption with a server-side secret key
CREATE OR REPLACE FUNCTION public.encrypt_credential(plaintext text, encryption_key text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF plaintext IS NULL OR plaintext = '' THEN
    RETURN NULL;
  END IF;
  -- Encrypt using AES and encode as base64
  RETURN encode(
    pgp_sym_encrypt(plaintext, encryption_key),
    'base64'
  );
END;
$$;

-- Create a secure function to decrypt sensitive data
CREATE OR REPLACE FUNCTION public.decrypt_credential(ciphertext text, encryption_key text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF ciphertext IS NULL OR ciphertext = '' THEN
    RETURN NULL;
  END IF;
  -- Decrypt from base64 encoded ciphertext
  RETURN pgp_sym_decrypt(
    decode(ciphertext, 'base64'),
    encryption_key
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Return NULL if decryption fails (invalid key or corrupt data)
    RETURN NULL;
END;
$$;

-- Add columns to track encrypted status
ALTER TABLE public.server_requests
ADD COLUMN IF NOT EXISTS credentials_encrypted boolean DEFAULT false;

-- Comment to document the encryption status
COMMENT ON COLUMN public.server_requests.credentials_encrypted IS 'Indicates whether panel_password, panel_username, panel_url, and assigned_ip are encrypted';