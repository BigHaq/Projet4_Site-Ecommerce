import express from 'express';
import * as usersController from '../controllers/users.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate, addressSchema } from '../middleware/validate.js';
import { z } from 'zod';

const router = express.Router();
router.use(authenticate);

// Profil
router.get('/profile', usersController.getProfile);
router.put('/profile', validate(z.object({
  body: z.object({
    firstName: z.string().min(2).max(50).optional(),
    lastName: z.string().min(2).max(50).optional(),
    phone: z.string().regex(/^\+[1-9]\d{7,14}$/).optional(),
  }),
})), usersController.updateProfile);

router.put('/password', validate(z.object({
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
  }),
})), usersController.changePassword);

// Adresses
router.get('/addresses', usersController.getAddresses);
router.post('/addresses', validate(addressSchema), usersController.addAddress);
router.put('/addresses/:id', validate(addressSchema), usersController.updateAddress);
router.delete('/addresses/:id', usersController.deleteAddress);

export default router;
