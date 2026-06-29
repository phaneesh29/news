import { Router } from "express";
import { resolveDns } from "../controllers/tool.controller.js";
import requireAuth from "../middlewares/requireAuth.js";
import validate from "../middlewares/validate.js";
import { dnsResolverQuerySchema } from "../schemas/tool.schema.js";

const router = Router();

router.get("/dns-resolver", requireAuth, validate(dnsResolverQuerySchema, "query"), resolveDns);

export default router;
