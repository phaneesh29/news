import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.js";

export const getSession = async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  res.status(200).json({
    status: "success",
    data: {
      session,
    },
  });
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


export const getActiveSessions = async (req, res) => {
  const userSessions = await auth.api.listSessions({
    headers: fromNodeHeaders(req.headers),
  });

  res.status(200).json({
    status: "success",
    data: userSessions,
  });
};

export const revokeSession = async (req, res) => {
  const { token } = req.body;

  await auth.api.revokeSession({
    body: { token },
    headers: fromNodeHeaders(req.headers),
  });

  res.status(200).json({
    status: "success",
    message: "Session successfully revoked.",
  });
};


export const revokeOtherSessions = async (req, res) => {
  await auth.api.revokeOtherSessions({
    headers: fromNodeHeaders(req.headers),
  });

  res.status(200).json({
    status: "success",
    message: "All other sessions successfully revoked.",
  });
};
