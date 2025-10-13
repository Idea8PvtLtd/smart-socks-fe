#!/bin/bash
set -euo pipefail

python Backend/mock.py &
BACK_PID=$!

nginx -g "daemon off;" &
NGINX_PID=$!

terminate() {
    kill -TERM "$BACK_PID" 2>/dev/null || true
    kill -TERM "$NGINX_PID" 2>/dev/null || true
}

trap terminate SIGINT SIGTERM

wait -n "$BACK_PID" "$NGINX_PID"
EXIT_CODE=$?

terminate
wait "$BACK_PID" 2>/dev/null || true
wait "$NGINX_PID" 2>/dev/null || true

exit "$EXIT_CODE"
