from .common import *
from apps.access_manager.domain.redaction import redact_sensitive
from apps.access_manager.composition import profiles


@api.get("/profiles")
def profile_list(context=None):
    return safe(profiles.list)


@api.get("/profiles/state")
def profile_state(context=None):
    return safe(profiles.state)


@api.post("/profiles")
def profile_save(context=None):
    return safe(lambda: profiles.save(body(context)))


@api.delete("/profiles")
def profile_delete(context=None):
    data = body(context)
    return safe(lambda: profiles.delete(str(data.get("name") or "")))


@api.post("/profiles/active")
def profile_activate(context=None):
    data = body(context)
    return safe(lambda: profiles.activate(str(data.get("name") or "")))


@api.post("/profiles/capture")
def profile_capture(context=None):
    data = body(context)
    return safe(lambda: redact_sensitive(profiles.capture(str(data.get("name") or ""))))


@api.post("/profiles/preview")
def profile_preview(context=None):
    data = body(context)
    value = data.get("profile") if "profile" in data else data.get("name")
    return safe(lambda: redact_sensitive(profiles.preview(value)))


@api.post("/profiles/apply")
def profile_apply(context=None):
    data = body(context)
    value = data.get("profile") if "profile" in data else data.get("name")
    return safe(lambda: redact_sensitive(profiles.apply(value,secrets=data.get('secrets'))))
