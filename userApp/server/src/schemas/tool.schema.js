import { z } from "zod";

export const dnsResolverQuerySchema = z.object({
  domain: z.string().min(1, "Domain is required"),
  type: z.enum(['A', 'AAAA', 'ANY', 'CNAME', 'MX', 'NAPTR', 'NS', 'PTR', 'SOA', 'SRV', 'TXT', 'ALL'], {
    errorMap: () => ({ message: "Invalid DNS record type." }),
  }).optional().default('A'),
});
