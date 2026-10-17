from .common import *


@api.get("/device/mesh/port-forwarding/candidates")
def mesh_port_forwarding_candidates(context=None):
    from apps.access_manager.composition import mesh_port_forwarding
    return safe(mesh_port_forwarding.candidates)


@api.post("/device/mesh/port-forwarding/preview")
def mesh_port_forwarding_preview(context=None):
    from apps.access_manager.composition import mesh_port_forwarding
    return safe(lambda: mesh_port_forwarding.preview(body(context)))


@api.post("/device/mesh/port-forwarding/apply")
def mesh_port_forwarding_apply(context=None):
    from apps.access_manager.composition import mesh_port_forwarding
    return safe(lambda: mesh_port_forwarding.apply(body(context)))
