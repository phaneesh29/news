import { fromNodeHeaders } from "better-auth/node";

import { auth } from "../lib/auth.js";
import AppError from "../utils/appError.js";

const requireAuth = async (req, res, next) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session) {
    return next(new AppError("You must be signed in to access this route.", 401));
  }

  req.auth = session;
  return next();
};

export default requireAuth;
