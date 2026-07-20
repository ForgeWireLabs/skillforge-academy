const FORMAT = "apex-encrypted-backup";
const VERSION = 1;
const ITERATIONS = 210_000;
/** Reject pathological KDF costs from hostile backup envelopes. */
const MIN_ITERATIONS = 100_000;
const MAX_ITERATIONS = 500_000;
/** Soft ceiling for import/export payloads (encrypted envelope or legacy JSON). */
export const MAX_BACKUP_CHARS = 5 * 1024 * 1024;
const SALT_BYTES = 16;
const IV_BYTES = 12;

export interface EncryptedBackup {
  format: typeof FORMAT;
  version: typeof VERSION;
  kdf: "PBKDF2-SHA256";
  iterations: number;
  cipher: "AES-256-GCM";
  salt: string;
  iv: string;
  data: string;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
  const binary = atob(value);
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}

async function deriveKey(passphrase: string, salt: Uint8Array, iterations: number) {
  const material = await crypto.subtle.importKey("raw", encoder.encode(passphrase), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export function isEncryptedBackup(value: unknown): value is EncryptedBackup {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<EncryptedBackup>;
  return item.format === FORMAT && item.version === VERSION && item.kdf === "PBKDF2-SHA256" &&
    item.cipher === "AES-256-GCM" && typeof item.salt === "string" && typeof item.iv === "string" &&
    typeof item.data === "string" && Number.isInteger(item.iterations) &&
    (item.iterations ?? 0) >= MIN_ITERATIONS && (item.iterations ?? 0) <= MAX_ITERATIONS;
}

function isEncryptedBackupEnvelope(value: unknown): boolean {
  return !!value && typeof value === "object" && (value as Partial<EncryptedBackup>).format === FORMAT;
}

function assertBackupSize(raw: string): void {
  if (raw.length > MAX_BACKUP_CHARS) {
    throw new Error("Backup file is too large to import safely.");
  }
}

export async function encryptBackup(value: unknown, passphrase: string): Promise<string> {
  if (passphrase.length < 8) throw new Error("Passphrase must be at least 8 characters.");
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
  const key = await deriveKey(passphrase, salt, ITERATIONS);
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoder.encode(JSON.stringify(value)));
  const envelope: EncryptedBackup = {
    format: FORMAT, version: VERSION, kdf: "PBKDF2-SHA256", iterations: ITERATIONS, cipher: "AES-256-GCM",
    salt: toBase64(salt), iv: toBase64(iv), data: toBase64(new Uint8Array(encrypted))
  };
  const serialized = JSON.stringify(envelope, null, 2);
  assertBackupSize(serialized);
  return serialized;
}

export async function decryptBackup(raw: string, passphrase: string): Promise<unknown> {
  assertBackupSize(raw);
  let envelope: unknown;
  try {
    envelope = JSON.parse(raw);
  } catch {
    throw new Error("Backup file is not valid JSON.");
  }
  if (isEncryptedBackupEnvelope(envelope) && !isEncryptedBackup(envelope)) {
    throw new Error("Unsupported or invalid encrypted backup format.");
  }
  if (!isEncryptedBackup(envelope)) return envelope;
  if (!passphrase) throw new Error("Enter the backup passphrase.");
  try {
    const salt = fromBase64(envelope.salt);
    const iv = fromBase64(envelope.iv);
    if (salt.byteLength !== SALT_BYTES || iv.byteLength !== IV_BYTES) {
      throw new Error("bad crypto params");
    }
    const key = await deriveKey(passphrase, salt, envelope.iterations);
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, fromBase64(envelope.data));
    return JSON.parse(decoder.decode(decrypted));
  } catch (error) {
    if (error instanceof Error && /too large|passphrase|valid JSON|Unsupported/i.test(error.message)) throw error;
    throw new Error("The passphrase is incorrect or the backup is damaged.");
  }
}
