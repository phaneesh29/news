import { fromNodeHeaders } from "better-auth/node";

import { auth } from "../lib/auth.js";

export const getSession = async (req, res, next) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    res.status(200).json({
      status: "success",
      data: {
        session,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = (req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      user: req.auth.user,
      session: req.auth.session,
    },
  });
};
