export type DnsRecordType = 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS' | 'SRV' | 'CAA';

export interface DnsRecord {
  id: string;
  name: string; // hostname or @
  type: DnsRecordType;
  value: string;
  ttl: number;
  priority?: number; // for MX, SRV
}

export const generateSoaSerial = (d: Date = new Date()): string => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}01`;
};

// Validate records for RFC conflicts (e.g. CNAME cannot coexist with other records per RFC 1912)
export const validateDnsRecords = (records: DnsRecord[]): string[] => {
  const warnings: string[] = [];
  const nameMap = new Map<string, DnsRecordType[]>();

  records.forEach((r) => {
    const n = r.name.toLowerCase();
    const existing = nameMap.get(n) || [];
    existing.push(r.type);
    nameMap.set(n, existing);
  });

  nameMap.forEach((types, name) => {
    if (types.includes('CNAME') && types.length > 1) {
      warnings.push(`RFC 1912 Violation: '${name}' has a CNAME record and cannot coexist with other record types.`);
    }
  });

  return warnings;
};

// Generate standard BIND 9 zone file content
export const generateBindZone = (
  domain: string,
  defaultTtl: number,
  soaSerial: string,
  records: DnsRecord[]
): string => {
  const origin = domain.endsWith('.') ? domain : `${domain}.`;
  let out = `; BIND 9 Zone File for ${origin}\n`;
  out += `; Generated offline via DomoDomo DNS Zone Studio\n`;
  out += `$ORIGIN ${origin}\n`;
  out += `$TTL ${defaultTtl}\n\n`;

  // SOA Record
  out += `@ IN SOA ns1.${origin} hostmaster.${origin} (\n`;
  out += `        ${soaSerial} ; Serial\n`;
  out += `        7200         ; Refresh (2 hours)\n`;
  out += `        3600         ; Retry (1 hour)\n`;
  out += `        1209600      ; Expire (2 weeks)\n`;
  out += `        3600         ; Minimum TTL\n`;
  out += `)\n\n`;

  // Format records into aligned columns
  records.forEach((r) => {
    const nameCol = r.name.padEnd(16);
    const ttlCol = String(r.ttl).padEnd(6);
    const typeCol = r.type.padEnd(6);

    if (r.type === 'MX') {
      out += `${nameCol} ${ttlCol} IN ${typeCol} ${r.priority || 10} ${r.value}\n`;
    } else {
      out += `${nameCol} ${ttlCol} IN ${typeCol} ${r.value}\n`;
    }
  });

  return out;
};
