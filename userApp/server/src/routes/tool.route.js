import { Router } from "express";
import { resolveDns, getWhois } from "../controllers/tool.controller.js";
import requireAuth from "../middlewares/requireAuth.js";
import validate from "../middlewares/validate.js";
import { dnsResolverQuerySchema, whoisQuerySchema } from "../schemas/tool.schema.js";

const router = Router();

router.get("/dns-resolver", requireAuth, validate(dnsResolverQuerySchema, "query"), resolveDns);
router.get("/whois", requireAuth, validate(whoisQuerySchema, "query"), getWhois);

export default router;
