from .base import BaseProfileTranslator


class HuaweiProfileTranslator(BaseProfileTranslator):
    """Huawei translation boundary.

    Device-specific payload construction remains inside Huawei protocol/services;
    this translator never embeds AMP/BBSP/API endpoints.
    """
