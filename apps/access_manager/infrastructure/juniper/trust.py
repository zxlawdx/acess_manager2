"""Legacy Junos import compatibility; shared trust lives in common."""
from apps.access_manager.infrastructure.common.ssh_trust import HostTrust as SharedHostTrust, EndpointTrustPolicy as SharedPolicy
from .errors import JuniperError

class HostTrust(SharedHostTrust):
    error_type = JuniperError

class EndpointTrustPolicy(SharedPolicy):
    error_type = JuniperError
