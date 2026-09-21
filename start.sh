#!/usr/bin/env bash
#
# Start the local development server on port 4000.
#
# It does the three things that otherwise have to be remembered every time:
# brings the local Supabase stack up when it is not already answering, stops an
# older `next dev` that is still holding this repository — Next refuses a second
# instance for the same directory, so a stale one blocks every later start — and
# puts back the AGENTS.md that `next dev` regenerates on boot, so the working
# tree stays clean while you work.

set -euo pipefail

cd "$(dirname "$0")"

port="${PORT:-4000}"
restart=0
test_support=0
extra_count=0

usage() {
  cat <<'TXT'
Usage: ./start.sh [options] [-- <next dev args>]

  -p, --port <n>     Port to serve on (default 4000, or $PORT).
      --test-support Set PF_ENABLE_TEST_SUPPORT=1, which is what the
                     /test-support/* browser-test harness routes need.
      --restart      Replace a dev server already serving this port instead
                     of leaving it alone.
  -h, --help         Show this.

Examples:
  ./start.sh                     http://localhost:4000
  ./start.sh -p 3000             another port
  ./start.sh --test-support      with the harness routes reachable
TXT
}

while [ $# -gt 0 ]; do
  case "$1" in
    -p | --port)
      port="${2:?--port needs a number}"
      shift 2
      ;;
    --port=*)
      port="${1#*=}"
      shift
      ;;
    --test-support)
      test_support=1
      shift
      ;;
    --restart)
      restart=1
      shift
      ;;
    -h | --help)
      usage
      exit 0
      ;;
    --)
      shift
      extra_count=$#
      break
      ;;
    *)
      echo "start.sh: unknown argument '$1' — see ./start.sh --help" >&2
      exit 2
      ;;
  esac
done

case "$port" in
  '' | *[!0-9]*)
    echo "start.sh: '$port' is not a port number" >&2
    exit 2
    ;;
esac

# ----- prerequisites --------------------------------------------------------

if [ -f .nvmrc ]; then
  want_node="$(tr -d 'v \t\n' <.nvmrc)"
  have_node="$(node -v 2>/dev/null | tr -d 'v' || true)"
  if [ -n "$have_node" ] && [ "$have_node" != "$want_node" ]; then
    echo "start.sh: node $have_node is installed, .nvmrc asks for $want_node" >&2
  fi
fi

if [ ! -d node_modules ]; then
  echo "start.sh: no node_modules — running npm ci"
  npm ci
fi

# ----- the local database ---------------------------------------------------

# The URL the application itself will use, so the check and the app agree.
supabase_url='http://127.0.0.1:54321'
if [ -f .env.local ]; then
  from_env="$(sed -n 's/^SUPABASE_URL=//p' .env.local | head -1 | tr -d '"\r' | tr -d "'")"
  if [ -n "$from_env" ]; then
    supabase_url="$from_env"
  fi
fi

# True when something answered at all, whatever the status. A refused
# connection makes curl print 000 *and* exit non-zero, so the exit status is
# swallowed and only the code is read — appending a fallback here would
# concatenate onto that 000 and make every dead port look alive.
reachable() {
  local code
  code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 3 "$1" 2>/dev/null || true)"
  case "$code" in
    '' | 000) return 1 ;;
    *) return 0 ;;
  esac
}

if reachable "$supabase_url/rest/v1/"; then
  echo "start.sh: Supabase is up at $supabase_url"
else
  echo "start.sh: Supabase is not answering at $supabase_url — starting it"
  npm run db:start
fi

# ----- an older dev server for this repository ------------------------------

# The lock names the innermost `next-server`, which is a grandchild of the
# `npm exec next dev` that owns it — signalling only that pid leaves the two
# wrappers alive and they put a new server straight back on the port. So climb
# to the outermost process that is still part of this dev server and signal
# that one together with everything under it. Walking the tree rather than the
# process group keeps this right however the old server was launched.
dev_root() {
  local pid="$1" parent cmd
  while :; do
    parent="$(ps -o ppid= -p "$pid" 2>/dev/null | tr -d ' ')"
    case "$parent" in
      '' | 0 | 1 | *[!0-9]*) break ;;
    esac
    cmd="$(ps -o command= -p "$parent" 2>/dev/null || true)"
    case "$cmd" in
      *'next dev'* | *next-server*) pid="$parent" ;;
      *) break ;;
    esac
  done
  printf '%s' "$pid"
}

dev_tree() {
  local pid="$1" kid
  printf '%s\n' "$pid"
  for kid in $(ps -eo pid=,ppid= | awk -v p="$pid" '$2 == p { print $1 }'); do
    dev_tree "$kid"
  done
}

stop_tree() {
  local pid sig target
  target="$(dev_root "$1")"
  sig="$2"
  for pid in $(dev_tree "$target"); do
    kill "-$sig" "$pid" 2>/dev/null || true
  done
}

# Poll a condition command for up to 10s, stopping as soon as it fails.
wait_until_gone() {
  local i
  for i in $(seq 1 20); do
    "$@" || return 0
    sleep 0.5
  done
  return 1
}

alive() { kill -0 "$1" 2>/dev/null; }

lock='.next/dev/lock'
if [ -f "$lock" ]; then
  lock_pid="$(sed -n 's/.*"pid":[[:space:]]*\([0-9]*\).*/\1/p' "$lock")"
  lock_port="$(sed -n 's/.*"port":[[:space:]]*\([0-9]*\).*/\1/p' "$lock")"

  if [ -n "$lock_pid" ] && alive "$lock_pid"; then
    if [ "$lock_port" = "$port" ] && [ "$restart" -eq 0 ]; then
      echo "start.sh: already serving this repository on http://localhost:$port (pid $lock_pid)"
      echo "start.sh: pass --restart to replace it"
      exit 0
    fi
    echo "start.sh: stopping the dev server on port ${lock_port:-?} (pid $lock_pid)"
    stop_tree "$lock_pid" TERM
    if ! wait_until_gone alive "$lock_pid"; then
      stop_tree "$lock_pid" KILL
      wait_until_gone alive "$lock_pid" || true
    fi
    # The socket can outlive the process for a moment, and Next would then
    # quietly serve on a different port than the one asked for.
    wait_until_gone reachable "http://localhost:$port/" || true
  fi
fi

if reachable "http://localhost:$port/"; then
  echo "start.sh: something that is not this project is already listening on port $port" >&2
fi

# ----- AGENTS.md ------------------------------------------------------------

# `next dev` regenerates AGENTS.md as it boots, which dirties the working tree
# for the whole session. If it was clean when we started, put it back once the
# server has written it. (`agentRules: false` in next.config.ts turns the
# generation off altogether, if that is ever preferred to restoring it.)
if git rev-parse --is-inside-work-tree >/dev/null 2>&1 &&
  git diff --quiet -- AGENTS.md 2>/dev/null; then
  (
    for _ in $(seq 1 60); do
      sleep 1
      if ! git diff --quiet -- AGENTS.md 2>/dev/null; then
        git checkout -- AGENTS.md 2>/dev/null || true
        break
      fi
    done
  ) >/dev/null 2>&1 &
fi

# ----- serve ----------------------------------------------------------------

if [ "$test_support" -eq 1 ]; then
  export PF_ENABLE_TEST_SUPPORT=1
  echo "start.sh: PF_ENABLE_TEST_SUPPORT=1 — /test-support/* routes are reachable"
fi

echo "start.sh: starting Next on http://localhost:$port"

if [ "$extra_count" -gt 0 ]; then
  exec npx next dev -p "$port" "$@"
fi
exec npx next dev -p "$port"
