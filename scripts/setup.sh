#!/usr/bin/env bash
# setup.sh — Otaku Channels first-run setup helper
#
# Usage:
#   ./scripts/setup.sh          # interactive mode
#   ./scripts/setup.sh --mock   # frontend-only (mock data, no backend)
#   ./scripts/setup.sh --full   # full stack (Docker + backend + frontend)
#
# Requirements:
#   - Node.js 20+
#   - pnpm 9+ (auto-installed if missing)
#   - Docker (only for --full mode)

set -euo pipefail

# ── Colours ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# ── Helpers ───────────────────────────────────────────────────────────────────
info()    { echo -e "${CYAN}${BOLD}[setup]${RESET} $*"; }
ok()      { echo -e "${GREEN}✔${RESET} $*"; }
warn()    { echo -e "${YELLOW}⚠${RESET}  $*"; }
error()   { echo -e "${RED}✖${RESET} $*" >&2; }
die()     { error "$*"; exit 1; }
heading() { echo -e "\n${BOLD}${BLUE}━━ $* ━━${RESET}"; }

require_cmd() {
  command -v "$1" &>/dev/null || die "'$1' is required but not found. $2"
}

version_gte() {
  # Returns 0 (true) if $1 >= $2 (semver major.minor.patch)
  local a b
  IFS='.' read -ra a <<< "${1//[^0-9.]}"
  IFS='.' read -ra b <<< "${2//[^0-9.]}"
  local i
  for i in 0 1 2; do
    local av=${a[$i]:-0} bv=${b[$i]:-0}
    (( av > bv )) && return 0
    (( av < bv )) && return 1
  done
  return 0
}

copy_env_if_missing() {
  local src="$1" dst="$2"
  if [[ ! -f "$dst" ]]; then
    cp "$src" "$dst"
    ok "Created $dst from $src"
  else
    ok "$dst already exists — skipping"
  fi
}

# ── Prerequisites ─────────────────────────────────────────────────────────────
check_prerequisites() {
  heading "Checking prerequisites"

  # Node.js
  require_cmd node "Install from https://nodejs.org (v20 LTS recommended)"
  local node_ver
  node_ver="$(node -v | tr -d 'v')"
  if version_gte "$node_ver" "20.0.0"; then
    ok "Node.js $node_ver"
  else
    die "Node.js 20+ is required (found $node_ver). Install from https://nodejs.org"
  fi

  # pnpm — install automatically if missing
  if ! command -v pnpm &>/dev/null; then
    warn "pnpm not found — installing via npm..."
    npm install -g pnpm || die "Failed to install pnpm. Run: npm install -g pnpm"
    ok "pnpm installed"
  else
    local pnpm_ver
    pnpm_ver="$(pnpm -v)"
    ok "pnpm $pnpm_ver"
  fi
}

check_docker() {
  if ! command -v docker &>/dev/null; then
    warn "Docker not found — required for full-stack mode."
    warn "Install from https://docs.docker.com/get-docker/ then re-run this script."
    return 1
  fi
  if ! docker info &>/dev/null 2>&1; then
    warn "Docker daemon is not running. Start Docker Desktop and try again."
    return 1
  fi
  ok "Docker $(docker --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')"
  return 0
}

# ── Choose setup mode ─────────────────────────────────────────────────────────
choose_mode() {
  # Check for CLI flags first
  for arg in "$@"; do
    case "$arg" in
      --mock) echo "mock"; return ;;
      --full) echo "full"; return ;;
    esac
  done

  heading "Choose a setup mode"
  echo ""
  echo "  ${BOLD}1) Frontend only${RESET} — No database or backend needed."
  echo "     Uses mock anime data. Great for exploring the UI."
  echo ""
  echo "  ${BOLD}2) Full stack${RESET} — Postgres + Redis (via Docker) + Fastify backend."
  echo "     Real database, auth, search, job queues. Requires Docker."
  echo ""

  local choice
  while true; do
    read -rp "$(echo -e "${CYAN}Enter choice [1/2]:${RESET} ")" choice
    case "$choice" in
      1) echo "mock"; return ;;
      2) echo "full"; return ;;
      *) warn "Please enter 1 or 2." ;;
    esac
  done
}

# ── Frontend-only setup ───────────────────────────────────────────────────────
setup_mock() {
  heading "Frontend-only setup (mock data)"

  cd "$REPO_ROOT"
  copy_env_if_missing ".env.example" ".env.local"

  # Ensure DATA_MODE=mock in .env.local so no backend warnings appear
  if grep -q "^DATA_MODE=" ".env.local"; then
    sed -i 's/^DATA_MODE=.*/DATA_MODE=mock/' ".env.local"
  else
    echo "DATA_MODE=mock" >> ".env.local"
  fi
  ok "DATA_MODE set to mock"

  info "Installing frontend dependencies…"
  pnpm install

  echo ""
  ok "${BOLD}All done!${RESET} Start the dev server with:"
  echo ""
  echo "   ${CYAN}pnpm dev${RESET}"
  echo ""
  echo "Then open ${BOLD}http://localhost:3000${RESET}"
  echo ""
  echo "Tip: To enable the dev logger, set ${BOLD}NEXT_PUBLIC_SHOW_LOGGER=true${RESET} in .env.local"
}

# ── Full-stack setup ──────────────────────────────────────────────────────────
setup_full() {
  heading "Full-stack setup (Postgres + Redis + Fastify)"

  # Check Docker first — exit early with a clear message if missing
  if ! check_docker; then
    echo ""
    die "Docker is required for full-stack mode. Install Docker and try again, or run with --mock."
  fi

  cd "$REPO_ROOT"

  # Frontend env
  copy_env_if_missing ".env.example" ".env.local"
  # Make sure DATA_MODE is hybrid (or backend) to actually hit the backend
  if grep -q "^DATA_MODE=" ".env.local"; then
    sed -i 's/^DATA_MODE=mock/DATA_MODE=hybrid/' ".env.local"
  fi

  # Backend env
  copy_env_if_missing "backend/.env.example" "backend/.env"

  # Start infrastructure
  heading "Starting Postgres + Redis"
  docker compose up -d
  info "Waiting for Postgres to be ready…"
  local retries=0
  until docker compose exec -T postgres pg_isready -U otaku -q 2>/dev/null; do
    (( retries++ )) || true
    if (( retries > 20 )); then
      die "Postgres did not become ready in time. Check 'docker compose logs postgres'."
    fi
    sleep 1
  done
  ok "Postgres is ready"

  # Backend deps + DB
  heading "Setting up backend"
  cd "$REPO_ROOT/backend"
  info "Installing backend dependencies…"
  npm install

  info "Running database migrations…"
  npm run db:migrate

  info "Seeding database (11 anime, 7 channels, admin account)…"
  npm run db:seed

  # Frontend deps
  heading "Setting up frontend"
  cd "$REPO_ROOT"
  info "Installing frontend dependencies…"
  pnpm install

  # Done
  echo ""
  ok "${BOLD}All done!${RESET} Start both servers in separate terminals:"
  echo ""
  echo "  ${BOLD}Terminal 1 — Backend:${RESET}"
  echo "   ${CYAN}cd backend && npm run dev${RESET}     → http://localhost:3001"
  echo "   ${CYAN}              npm run worker:dev${RESET}  → background jobs"
  echo ""
  echo "  ${BOLD}Terminal 2 — Frontend:${RESET}"
  echo "   ${CYAN}pnpm dev${RESET}                       → http://localhost:3000"
  echo ""
  echo "  ${BOLD}Other useful URLs:${RESET}"
  echo "   API docs   → http://localhost:3001/docs"
  echo "   Health     → http://localhost:3000/api/health"
  echo "   DB Studio  → cd backend && npm run db:studio"
  echo ""
  echo "  ${BOLD}Default admin credentials:${RESET}"
  echo "   Email:    admin@otakuchannels.local"
  echo "   Password: Admin1234"
  echo ""
  warn "Change the JWT_SECRET and COOKIE_SECRET in backend/.env before deploying to production!"
}

# ── Main ──────────────────────────────────────────────────────────────────────
main() {
  echo ""
  echo -e "${BOLD}${BLUE}  Otaku Channels — Setup${RESET}"
  echo -e "  ${CYAN}https://github.com/awest813/Otaku-Channels${RESET}"
  echo ""

  check_prerequisites

  local mode
  mode="$(choose_mode "$@")"

  case "$mode" in
    mock) setup_mock ;;
    full) setup_full ;;
  esac
}

main "$@"
