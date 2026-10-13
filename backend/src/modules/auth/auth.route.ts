import { Router } from 'express';
import * as controller from './auth.controller';
import { validate } from '../../middlewares/validate.middleware';
import { loginSchema, registerSchema } from './auth.validation';

export const authRouter = Router();
authRouter.post('/register', validate(registerSchema), controller.register);
authRouter.post('/login', validate(loginSchema), controller.login);
authRouter.post('/refresh', controller.refreshToken);

