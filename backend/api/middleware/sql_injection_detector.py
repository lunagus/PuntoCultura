import re
import logging

logger = logging.getLogger("sql_injection")

SQLI_PATTERNS = [
    r"(?i)\b(SELECT|INSERT|DELETE|UPDATE|DROP|UNION|--|;|OR\s+1=1)\b",
    r"' OR '1'='1",
    r"\" OR \"1\"=\"1",
]


def detect_sql_injection(value):
    return any(re.search(pattern, value) for pattern in SQLI_PATTERNS)


class SQLInjectionDetectorMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        suspicious = []

        for param_dict in [request.GET, request.POST]:
            for key, value in param_dict.items():
                if detect_sql_injection(value):
                    suspicious.append(f"{key}={value}")

        if suspicious:
            logger.warning(
                f"Posible intento de inyección SQL desde {request.META.get('REMOTE_ADDR')}: {suspicious}"
            )

        return self.get_response(request)
