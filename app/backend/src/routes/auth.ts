import { Router, Request, Response } from 'express';
import { userService } from '../services/userService.js';
import { generateTokens } from '../utils.js';
import { authMiddleware } from '../middleware/auth.js';
import {
  RegisterSchema,
  LoginSchema,
  UpdateProfileSchema,
  ChangePasswordSchema,
} from '../types.js';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const validation = RegisterSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validación fallida',
        details: validation.error.errors,
      });
    }

    const user = await userService.register(validation.data);
    const { accessToken, refreshToken } = generateTokens(user);

    res.status(201).json({
      user,
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const validation = LoginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validación fallida',
        details: validation.error.errors,
      });
    }

    const user = await userService.validateCredentials(
      validation.data.email,
      validation.data.password
    );

    if (!user) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    res.json({
      user,
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users/profile
router.get('/profile', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = await userService.getUserById(req.userId!);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/users/profile
router.put('/profile', authMiddleware, async (req: Request, res: Response) => {
  try {
    const validation = UpdateProfileSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validación fallida',
        details: validation.error.errors,
      });
    }

    const user = await userService.updateProfile(req.userId!, validation.data);
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/users/change-password
router.post('/change-password', authMiddleware, async (req: Request, res: Response) => {
  try {
    const validation = ChangePasswordSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validación fallida',
        details: validation.error.errors,
      });
    }

    await userService.changePassword(req.userId!, validation.data);
    res.json({ message: 'Contraseña cambiada exitosamente' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
