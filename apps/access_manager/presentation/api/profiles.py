from .common import *
from apps.access_manager.composition import profiles


@api.get("/profiles")
def profile_list(context=None):
    return safe(profiles.list)


@api.post("/profiles")
def profile_save(context=None):
    return safe(lambda: profiles.save(body(context)))


@api.delete("/profiles")
def profile_delete(context=None):
    data = body(context)
    return safe(lambda: profiles.delete(str(data.get("name") or "")))


@api.post("/profiles/preview")
def profile_preview(context=None):
    data = body(context)
    value = data.get("profile") if "profile" in data else data.get("name")
    return safe(lambda: profiles.preview(value))


@api.post("/profiles/apply")
def profile_apply(context=None):
    data = body(context)
    value = data.get("profile") if "profile" in data else data.get("name")
    return safe(lambda: profiles.apply(value))
