export interface SubnetInfo {
  network: string
  broadcast: string
  firstHost: string
  lastHost: string
  netmask: string
  wildcard: string
  cidr: number
  totalAddresses: number
  usableHosts: number
}

function toOctets(n: number): string {
  return [24, 16, 8, 0].map((shift) => (n >>> shift) & 255).join('.')
}

function parseIp(ip: string): number {
  const parts = ip.split('.')
  if (parts.length !== 4) throw new Error('IPv4 needs four octets.')
  return parts.reduce((acc, part) => {
    const oct = Number(part)
    if (!Number.isInteger(oct) || oct < 0 || oct > 255) {
      throw new Error(`Invalid octet: “${part}”`)
    }
    return (acc << 8) | oct
  }, 0)
}

/** Computes subnet details from a `x.x.x.x/nn` CIDR string. */
export function calculateSubnet(input: string): SubnetInfo {
  const [ip, cidrStr] = input.trim().split('/')
  const cidr = Number(cidrStr)
  if (!Number.isInteger(cidr) || cidr < 0 || cidr > 32) {
    throw new Error('Prefix must be between /0 and /32.')
  }

  const ipNum = parseIp(ip)
  const mask = cidr === 0 ? 0 : (0xffffffff << (32 - cidr)) >>> 0
  const network = (ipNum & mask) >>> 0
  const broadcast = (network | (~mask >>> 0)) >>> 0
  const total = 2 ** (32 - cidr)
  const usable = cidr >= 31 ? total : total - 2

  return {
    network: toOctets(network),
    broadcast: toOctets(broadcast),
    firstHost: toOctets(cidr >= 31 ? network : network + 1),
    lastHost: toOctets(cidr >= 31 ? broadcast : broadcast - 1),
    netmask: toOctets(mask),
    wildcard: toOctets(~mask >>> 0),
    cidr,
    totalAddresses: total,
    usableHosts: usable,
  }
}
