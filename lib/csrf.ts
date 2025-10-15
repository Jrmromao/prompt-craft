import crypto from 'crypto';

const CSRF_SECRET = process.env.CSRF_SECRET || crypto.randomBytes(32).toString('hex');

export function generateCSRFToken(sessionId: string): string {
  const timestamp = Date.now().toString();
  const data = `${sessionId}:${timestamp}`;
  const signature = crypto.createHmac('sha256', CSRF_SECRET).update(data).digest('hex');
  return Buffer.from(`${data}:${signature}`).toString('base64');
}

export function validateCSRFToken(token: string | null, sessionId: string): boolean {
  if (!token) return false;
  
  try {
    const decoded = Buffer.from(token, 'base64').toString();
    const [session, timestamp, signature] = decoded.split(':');
    
    if (session !== sessionId) return false;
    
    const age = Date.now() - parseInt(timestamp);
    if (age > 3600000) return false; // 1 hour expiry
    
    const expected = crypto.createHmac('sha256', CSRF_SECRET)
      .update(`${session}:${timestamp}`)
      .digest('hex');
    
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}
