import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export const configurePassport = () => {
    passport.use(new LocalStrategy(
        { usernameField: "username", passwordField: "password" },
        async (username, password, done) => {
            try {
                const user = await prisma.user.findUnique({ where: { username } });
                if (!user || !(await bcrypt.compare(password, user.password))) {
                    return done(null, false, { message: "Invalid credentials" });
                }
                return done(null, user);
            } catch (err) {
                return done(err);
            }
        }
    ));

    passport.serializeUser((user, done) => {
        done(null, (user as any).id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await prisma.user.findUnique({ where: { id: Number(id) } });
            done(null, user);
        } catch (err) {
            done(err);
        }
    });
};
