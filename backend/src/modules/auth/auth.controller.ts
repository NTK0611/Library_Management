import { NextFunction, Request, Response } from 'express';
import * as service from './auth.service';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try { res.status(201).json(await service.register(req.body)); } catch (error) { next(error); }
};
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await service.login(req.body)); } catch (error) { next(error); }
};
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try { res.json(await service.refreshToken(req.body.refreshToken)); } catch (error) { next(error); }
};

