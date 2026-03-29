#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="${ROOT_DIR}/backend"
FRONTEND_DIR="${ROOT_DIR}/frontend"

BACKEND_PORT="${BACKEND_PORT:-3000}"
BACKEND_HEALTH_URL="${BACKEND_HEALTH_URL:-http://localhost:${BACKEND_PORT}/api/health}"
BACKEND_WAIT_SECONDS="${BACKEND_WAIT_SECONDS:-30}"

BACKEND_PID=""
FRONTEND_PID=""
BACKEND_PGID=""
FRONTEND_PGID=""

log() {
  printf '[start-dev] %s\n' "$1"
}

stop_process() {
  local pid="$1"
  local pgid="$2"

  if [[ -n "${pgid}" ]]; then
    kill -TERM -- "-${pgid}" 2>/dev/null || true
    wait "${pid}" 2>/dev/null || true
    return
  fi

  if [[ -n "${pid}" ]] && kill -0 "${pid}" 2>/dev/null; then
    if command -v pkill >/dev/null 2>&1; then
      pkill -TERM -P "${pid}" 2>/dev/null || true
    fi
    kill "${pid}" 2>/dev/null || true
    wait "${pid}" 2>/dev/null || true
  fi
}

cleanup() {
  stop_process "${FRONTEND_PID}" "${FRONTEND_PGID}"
  stop_process "${BACKEND_PID}" "${BACKEND_PGID}"
}

wait_for_any_exit() {
  # wait -n exists on newer Bash (>= 4.3), but macOS default Bash is 3.2.
  if (( BASH_VERSINFO[0] > 4 || (BASH_VERSINFO[0] == 4 && BASH_VERSINFO[1] >= 3) )); then
    wait -n "${BACKEND_PID}" "${FRONTEND_PID}"
    return
  fi

  while true; do
    if ! kill -0 "${BACKEND_PID}" 2>/dev/null; then
      wait "${BACKEND_PID}" 2>/dev/null || true
      return
    fi

    if ! kill -0 "${FRONTEND_PID}" 2>/dev/null; then
      wait "${FRONTEND_PID}" 2>/dev/null || true
      return
    fi

    sleep 1
  done
}

trap cleanup EXIT INT TERM

if [[ ! -d "${BACKEND_DIR}" || ! -d "${FRONTEND_DIR}" ]]; then
  log "Expected backend/ and frontend/ directories in ${ROOT_DIR}."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  log "npm is required but was not found in PATH."
  exit 1
fi

log "Starting backend (backend -> npm run dev)..."
if command -v setsid >/dev/null 2>&1; then
  setsid bash -c "cd \"${BACKEND_DIR}\" && exec npm run dev" &
  BACKEND_PID="$!"
  BACKEND_PGID="${BACKEND_PID}"
else
  (
    cd "${BACKEND_DIR}"
    exec npm run dev
  ) &
  BACKEND_PID="$!"
fi

if command -v curl >/dev/null 2>&1; then
  log "Waiting for backend health check at ${BACKEND_HEALTH_URL}..."
  for ((i = 1; i <= BACKEND_WAIT_SECONDS; i++)); do
    if curl -fsS "${BACKEND_HEALTH_URL}" >/dev/null 2>&1; then
      log "Backend is ready."
      break
    fi

    if ! kill -0 "${BACKEND_PID}" 2>/dev/null; then
      log "Backend exited before becoming healthy."
      exit 1
    fi

    if [[ "${i}" -eq "${BACKEND_WAIT_SECONDS}" ]]; then
      log "Timed out waiting for backend after ${BACKEND_WAIT_SECONDS}s."
      exit 1
    fi

    sleep 1
  done
else
  log "curl not found; waiting 3 seconds before starting frontend."
  sleep 3
fi

log "Starting frontend (frontend -> npm run dev)..."
if command -v setsid >/dev/null 2>&1; then
  setsid bash -c "cd \"${FRONTEND_DIR}\" && exec npm run dev" &
  FRONTEND_PID="$!"
  FRONTEND_PGID="${FRONTEND_PID}"
else
  (
    cd "${FRONTEND_DIR}"
    exec npm run dev
  ) &
  FRONTEND_PID="$!"
fi

log "Both services started. Press Ctrl+C to stop."

wait_for_any_exit
log "One service exited. Shutting down the other service..."
