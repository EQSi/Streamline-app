import passport from 'passport';
import { Strategy as GoogleStrategy, Profile as GoogleProfile } from 'passport-google-oauth20';
import { Strategy as LocalStrategy } from 'passport-local';
import { PrismaClient } from '@prisma/client';

interface User {
    id: number;
    username: string;
    password: string;
    roles: string;
    googleId: string;
    googleAccessToken: string;
    googleRefreshToken: string;
    isAdmin: boolean;
    createdAt: Date;
    updatedAt: Date;
}
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

passport.serializeUser((user: any, done: (err: any, id?: number) => void) => {
    done(null, user.id);
});

passport.deserializeUser(async (id: number, done: (err: any, user?: any) => void) => {
    try {
        const user = await prisma.user.findUnique({ 
            where: { id },
            include: { employee: true }
        });
        if (!user) {
            return done(new Error('User not found'));
        }
        done(null, user);
    } catch (err) {
        done(err);
    }
});

export const configurePassport = () => {

    passport.use(new LocalStrategy(
        {
            usernameField: 'username',
            passwordField: 'password'
        },
        async (username: string, password: string, done: (err: any, user?: User | false, info?: { message: string }) => void) => {
            try {
                const user = await prisma.user.findUnique({ 
                    where: { username },
                    include: { employee: true }
                });
                
                if (!user) {
                    return done(null, false, { message: 'Invalid username' });
                }

                const isValid = await bcrypt.compare(password, user.password);
                if (!isValid) {
                    return done(null, false, { message: 'Invalid password' });
                }

                return done(null, user);
            } catch (err) {
                return done(err);
            }
        }
    ));

    passport.use(new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: process.env.GOOGLE_CALLBACK_URL!,
        },
        async (accessToken: string, refreshToken: string, profile: GoogleProfile, done: (err: any, user?: User | false) => void) => {
            try {
                const user = await prisma.user.upsert({
                    where: { googleId: profile.id },
                    update: {
                        googleAccessToken: accessToken,
                        googleRefreshToken: refreshToken || ''
                    },
                    create: {
                        username: profile.emails![0].value,
                        googleId: profile.id,
                        googleAccessToken: accessToken,
                        googleRefreshToken: refreshToken || '',
                        password: '',
                        roles: 'Employee'
                    }
                });
                return done(null, user);
            } catch (err) {
                return done(err);
            }
        }
    ));
};