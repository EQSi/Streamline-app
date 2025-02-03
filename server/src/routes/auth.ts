

import { Router } from "express";
import { NextApiRequest, NextApiResponse } from "next";
import { handler } from "../../../client/src/app/api/auth/[...nextauth]/route"; // Import the NextAuth handler

const authRouter = Router();

// Forward all NextAuth requests to the Next.js handler
authRouter.all("/api/auth/*", (req, res) => {
  return handler(req as NextApiRequest, res as NextApiResponse);
});

export default authRouter;
