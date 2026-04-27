import * as usersService from '../services/users.service.js';

export async function getProfile(req, res, next) {
  try {
    const user = await usersService.getProfile(req.user.id);
    return res.status(200).json({ success: true, data: { user } });
  } catch (err) { next(err); }
}

export async function updateProfile(req, res, next) {
  try {
    const user = await usersService.updateProfile(req.user.id, req.body);
    return res.status(200).json({ success: true, message: 'Profil mis à jour.', data: { user } });
  } catch (err) { next(err); }
}

export async function changePassword(req, res, next) {
  try {
    await usersService.changePassword(req.user.id, req.body);
    return res.status(200).json({ success: true, message: 'Mot de passe modifié.' });
  } catch (err) { next(err); }
}

export async function getAddresses(req, res, next) {
  try {
    const addresses = await usersService.getAddresses(req.user.id);
    return res.status(200).json({ success: true, data: { addresses } });
  } catch (err) { next(err); }
}

export async function addAddress(req, res, next) {
  try {
    const address = await usersService.addAddress(req.user.id, req.body);
    return res.status(201).json({ success: true, message: 'Adresse ajoutée.', data: { address } });
  } catch (err) { next(err); }
}

export async function updateAddress(req, res, next) {
  try {
    const address = await usersService.updateAddress(req.user.id, req.params.id, req.body);
    return res.status(200).json({ success: true, data: { address } });
  } catch (err) { next(err); }
}

export async function deleteAddress(req, res, next) {
  try {
    await usersService.deleteAddress(req.user.id, req.params.id);
    return res.status(200).json({ success: true, message: 'Adresse supprimée.' });
  } catch (err) { next(err); }
}
