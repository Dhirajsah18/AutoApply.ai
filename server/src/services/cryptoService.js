import crypto from 'crypto';
import { ENV } from '../config/env.js';

const ALGORITHM = 'aes-256-gcm';
const SALT = 'autoapply_vault_salt_2026';
const PREFIX = 'enc:v1:';

// Derive 32-byte key from JWT_SECRET
const getMasterKey = () => {
  const secret = ENV.JWT_SECRET || 'fallback_secret_key_32_bytes_len!';
  return crypto.scryptSync(secret, SALT, 32);
};

/**
 * Encrypts a sensitive string (e.g. API key, SMTP password) using AES-256-GCM
 * @param {string} text - Plain text to encrypt
 * @returns {string} Encrypted string in format enc:v1:<iv>:<authTag>:<cipher>
 */
export const encryptSecret = (text) => {
  if (!text || typeof text !== 'string') return text || '';
  const trimmed = text.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith(PREFIX)) return trimmed; // Already encrypted

  const iv = crypto.randomBytes(12); // 96-bit IV recommended for GCM
  const cipher = crypto.createCipheriv(ALGORITHM, getMasterKey(), iv);

  let encrypted = cipher.update(trimmed, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return `${PREFIX}${iv.toString('hex')}:${authTag}:${encrypted}`;
};

/**
 * Decrypts an encrypted string
 * @param {string} encryptedText - Formatted encrypted string or plain text
 * @returns {string} Decrypted plain text
 */
export const decryptSecret = (encryptedText) => {
  if (!encryptedText || typeof encryptedText !== 'string') return encryptedText || '';
  const trimmed = encryptedText.trim();
  if (!trimmed) return '';
  if (!trimmed.startsWith(PREFIX)) return trimmed; // Plain text fallback

  try {
    const parts = trimmed.slice(PREFIX.length).split(':');
    if (parts.length !== 3) return trimmed;

    const [ivHex, authTagHex, cipherHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, getMasterKey(), iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(cipherHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.warn('[cryptoService] Failed to decrypt secret, returning original:', err.message);
    return trimmed;
  }
};
