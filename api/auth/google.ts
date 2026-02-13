import type { VercelRequest, VercelResponse } from '@vercel/node';
import { OAuth2Client } from 'google-auth-library';
import { ensureDbInitialized } from '../_lib/db';
import { upsertUser } from '../_lib/models/User';
import { signToken } from '../_lib/jwt';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await ensureDbInitialized();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { idToken } = req.body;
    if (typeof idToken !== 'string') {
      return res.status(400).json({ error: 'idToken is required' });
    }

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.sub) {
      return res.status(401).json({ error: 'Invalid Google token' });
    }

    const user = await upsertUser(
      payload.sub,
      payload.email || null,
      payload.name || null,
      payload.picture || null
    );

    const token = signToken(user.id);

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        pictureUrl: user.picture_url,
      },
    });
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
