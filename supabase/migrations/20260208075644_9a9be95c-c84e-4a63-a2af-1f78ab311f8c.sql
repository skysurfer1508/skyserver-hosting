-- Update encrypt_credential function to include extensions schema in search_path
CREATE OR REPLACE FUNCTION public.encrypt_credential(plaintext text, encryption_key text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
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
$function$;

-- Update decrypt_credential function to include extensions schema in search_path
CREATE OR REPLACE FUNCTION public.decrypt_credential(ciphertext text, encryption_key text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
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
$function$;