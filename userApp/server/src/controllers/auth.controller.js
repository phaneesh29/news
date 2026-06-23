import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth.js";
import { db } from "../db/index.js";
import { user } from "../db/schema.js";
import { eq } from "drizzle-orm";

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

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.auth.user.id;
    
    await db.delete(user).where(eq(user.id, userId));
    
    res.status(200).json({
      status: "success",
      message: "Account successfully deleted.",
    });
  } catch (error) {
    console.error("Account Deletion Error:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to delete account.",
    });
  }
};
