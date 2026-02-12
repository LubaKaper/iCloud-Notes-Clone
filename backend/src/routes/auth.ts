import { Router, Request, Response, NextFunction } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { upsertUser } from '../models/User';
import { signToken } from '../utils/jwt';

const router = Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST /api/auth/google — exchange Google ID token for app JWT
router.post('/google', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idToken } = req.body;
    if (typeof idToken !== 'string') {
      res.status(400).json({ error: 'idToken is required' });
      return;
    }

    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.sub) {
      res.status(401).json({ error: 'Invalid Google token' });
      return;
    }

    const user = await upsertUser(
      payload.sub,
      payload.email || null,
      payload.name || null,
      payload.picture || null
    );

    const token = signToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        pictureUrl: user.picture_url,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
