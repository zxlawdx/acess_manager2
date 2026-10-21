"""Address scope is evidence about the address, never the location of NAT."""
import ipaddress


def classify_address(value):
    try:
        ip = ipaddress.ip_address(value)
    except (ValueError, TypeError):
        return 'UNKNOWN'
    if ip.version == 6:
        if ip in ipaddress.ip_network('fc00::/7'): return 'IPV6_ULA'
        if ip.is_link_local: return 'IPV6_LINK_LOCAL'
        return 'IPV6_GLOBAL' if ip.is_global and not ip.is_multicast else 'RESERVED'
    for network, kind in (
        ('100.64.0.0/10', 'CGNAT_SHARED'),
        ('10.0.0.0/8', 'RFC1918_PRIVATE'),
        ('172.16.0.0/12', 'RFC1918_PRIVATE'),
        ('192.168.0.0/16', 'RFC1918_PRIVATE'),
        ('169.254.0.0/16', 'LINK_LOCAL'),
        ('127.0.0.0/8', 'LOOPBACK'),
        ('192.0.2.0/24', 'DOCUMENTATION'),
        ('198.51.100.0/24', 'DOCUMENTATION'),
        ('203.0.113.0/24', 'DOCUMENTATION'),
    ):
        if ip in ipaddress.ip_network(network): return kind
    return 'PUBLIC_IPV4' if ip.is_global and not ip.is_multicast else 'RESERVED'
