import { Request, Response } from 'express';

export const login = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    // Add your authentication logic here
    if (username === 'admin' && password === 'password') {
        res.status(200).json({ message: 'Login successful' });
    } else {
        res.status(401).json({ message: 'Invalid username or password' });
    }
};