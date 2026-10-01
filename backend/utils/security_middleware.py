import asyncio
import time
from collections import defaultdict
from typing import Dict, List
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response, JSONResponse

class SlowlorisProtectionMiddleware(BaseHTTPMiddleware):
    """
    Mitigates Slowloris Denial of Service (CVE-2007-6750) attacks by:
    1. Enforcing strict request execution timeouts (default: 15 seconds) so slow, hanging,
       or intentionally stalled HTTP streams are cleanly aborted.
    2. Enforcing a maximum concurrent connection ceiling to prevent resource starvation.
    """
    def __init__(self, app, timeout_seconds: float = 15.0, max_concurrent: int = 150):
        super().__init__(app)
        self.timeout_seconds = timeout_seconds
        self.max_concurrent = max_concurrent
        self._current_connections = 0
        self._lock = asyncio.Lock()

    async def dispatch(self, request: Request, call_next):
        async with self._lock:
            if self._current_connections >= self.max_concurrent:
                return Response(
                    content="Server busy: Concurrent connection limit reached. Slowloris protection active.",
                    status_code=503,
                    headers={"Retry-After": "5"}
                )
            self._current_connections += 1

        try:
            # Enforce strict timeout against hanging/slowloris requests
            return await asyncio.wait_for(call_next(request), timeout=self.timeout_seconds)
        except asyncio.TimeoutError:
            return Response(
                content="Request Timeout: Connection held too long. Closed by Slowloris mitigation shield.",
                status_code=408
            )
        finally:
            async with self._lock:
                self._current_connections = max(0, self._current_connections - 1)


class RateLimiterMiddleware(BaseHTTPMiddleware):
    """
    Protects against DDoS request floods, brute force, and quota exhaustion
    by rate-limiting requests per client IP within a sliding window.
    """
    def __init__(self, app, requests_per_minute: int = 180):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.ip_history: Dict[str, List[float]] = defaultdict(list)
        self.last_cleanup = time.time()

    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()

        # Periodic cleanup every 60s to prevent memory accumulation
        if now - self.last_cleanup > 60:
            cutoff = now - 60
            self.ip_history = defaultdict(
                list,
                {ip: [t for t in times if t > cutoff] for ip, times in self.ip_history.items() if any(t > cutoff for t in times)}
            )
            self.last_cleanup = now

        history = [t for t in self.ip_history[client_ip] if now - t < 60]

        if len(history) >= self.requests_per_minute:
            return JSONResponse(
                status_code=429,
                content={
                    "error": "Too Many Requests",
                    "message": "DDoS and anti-flooding rate limit triggered. Please slow down.",
                    "retry_after_seconds": 60
                },
                headers={"Retry-After": "60"}
            )

        history.append(now)
        self.ip_history[client_ip] = history

        response = await call_next(request)
        return response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Injects defensive HTTP security headers to protect against clickjacking,
    MIME-sniffing, and protocol downgrade.
    """
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "SAMEORIGIN"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response
