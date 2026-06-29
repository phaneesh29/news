import { promises as dns } from 'node:dns';
import net from 'node:net';

export const resolveDns = async (req, res, next) => {
  try {
    const { domain, type } = req.query;
    const startTime = performance.now();

    if (net.isIP(domain)) {
      const hostnames = await dns.reverse(domain);
      return res.status(200).json({
        status: 'success',
        data: {
          domain,
          type: 'REVERSE',
          records: hostnames,
          queryTimeMs: Math.round(performance.now() - startTime),
        },
      });
    }

    if (type === 'ALL') {
      const promises = [
        dns.resolve4(domain).then(records => ({ type: 'A', records })).catch(() => ({ type: 'A', records: [] })),
        dns.resolve6(domain).then(records => ({ type: 'AAAA', records })).catch(() => ({ type: 'AAAA', records: [] })),
        dns.resolveCname(domain).then(records => ({ type: 'CNAME', records })).catch(() => ({ type: 'CNAME', records: [] })),
        dns.resolveMx(domain).then(records => ({ type: 'MX', records })).catch(() => ({ type: 'MX', records: [] })),
        dns.resolveNaptr(domain).then(records => ({ type: 'NAPTR', records })).catch(() => ({ type: 'NAPTR', records: [] })),
        dns.resolveNs(domain).then(records => ({ type: 'NS', records })).catch(() => ({ type: 'NS', records: [] })),
        dns.resolvePtr(domain).then(records => ({ type: 'PTR', records })).catch(() => ({ type: 'PTR', records: [] })),
        dns.resolveSoa(domain).then(records => ({ type: 'SOA', records })).catch(() => ({ type: 'SOA', records: [] })),
        dns.resolveSrv(domain).then(records => ({ type: 'SRV', records })).catch(() => ({ type: 'SRV', records: [] })),
        dns.resolveTxt(domain).then(records => ({ type: 'TXT', records })).catch(() => ({ type: 'TXT', records: [] })),
      ];

      const results = await Promise.all(promises);
      const allRecords = results.reduce((acc, curr) => {
        if (curr.records.length > 0) acc[curr.type] = curr.records;
        return acc;
      }, {});

      return res.status(200).json({
        status: 'success',
        data: {
          domain,
          type: 'ALL',
          records: allRecords,
          queryTimeMs: Math.round(performance.now() - startTime),
        },
      });
    }

    const records = await dns.resolve(domain, type);

    res.status(200).json({
      status: 'success',
      data: {
        domain,
        type,
        records,
        queryTimeMs: Math.round(performance.now() - startTime),
      },
    });
  } catch (error) {
    if (error.code === 'ENODATA' || error.code === 'ENOTFOUND') {
      return res.status(404).json({
        status: 'error',
        message: `No ${req.query.type} records found for ${req.query.domain}`,
      });
    }
    next(error);
  }
};
