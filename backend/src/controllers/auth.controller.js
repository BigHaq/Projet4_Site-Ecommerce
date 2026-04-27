import * as authService from '../services/auth.service.js';

export async function register(req, res, next) {
  try {
    const result = await authService.register(req.body);
    return res.status(201).json({
      success: true,
      message: 'Compte créé avec succès. Bienvenue sur Marché Kora !',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    return res.status(200).json({
      success: true,
      message: 'Connexion réussie.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token requis.' });
    }
    const tokens = await authService.refreshTokens(refreshToken);
    return res.status(200).json({ success: true, data: tokens });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
    return res.status(200).json({ success: true, message: 'Déconnexion réussie.' });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res) {
  return res.status(200).json({
    success: true,
    data: { user: req.user },
  });
}
