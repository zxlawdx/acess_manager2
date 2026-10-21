from contextvars import ContextVar
operation = ContextVar('infrastructure_operation', default=None)
