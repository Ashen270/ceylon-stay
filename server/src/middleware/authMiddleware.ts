import { JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

interface DecodedToken extends JwtPayload {
    sub: string; 
    'custom:role': string; 
}

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string; 
                role: string; 
            };
            decodedToken?: DecodedToken; 
        }
    }
}

export const authMiddleware = (allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        try {
            const decoded = jwt.decode(token) as DecodedToken;
            const userRole = decoded['custom:role'] || "";
            req.user = {
                id: decoded.sub,
                role: userRole
            };
            const hasAccess = allowedRoles.includes(userRole.toLowerCase());
            if (!hasAccess) {
                res.status(403).json({ error: 'Access Denaied' });
                return;
            }
        } catch (error) {
            console.error('failed to decode Token ', error);
            res.status(400).json({ message: 'Invalid Token' });
            return;   
        }
        next();
    }
}