import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

export const configurePassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await prisma.user.upsert({
            where: { googleId: profile.id },
            update: { googleAccessToken: accessToken },
            create: {
              googleId: profile.id,
              googleAccessToken: accessToken,
              googleRefreshToken: refreshToken,
              username: profile.emails?.[0].value || '',
              password: '', // You may want to handle password creation differently
            },
          });
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
};
