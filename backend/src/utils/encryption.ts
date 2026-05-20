import crypto from 'crypto';
import bcrypt from 'bcrypt';

const BCRYPT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

export function generateApiKey(): { key: string; hash: string } {
  const key = `ih_${generateToken(24)}`;
  const hash = crypto.createHash('sha256').update(key).digest('hex');

  return { key, hash };
}

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
