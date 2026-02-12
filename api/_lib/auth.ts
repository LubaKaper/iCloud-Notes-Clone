import type { VercelRequest } from '@vercel/node';
import { verifyToken } from './jwt';

export function getAuthUserId(req: VercelRequest): string | null {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return null;
  try {
    const { userId } = verifyToken(auth.slice(7));
    return userId;
  } catch {
    return null;
  }
}
