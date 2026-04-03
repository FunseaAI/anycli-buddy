#!/usr/bin/env bash
# Codex hook: lightweight event forwarding to buddy panel.
# No node invocation, no blocking — minimal impact on agent performance.
SOCKET="$HOME/.codex/buddy/buddy.sock"

# Fast path: if socket doesn't exist, buddy panel isn't running — exit immediately
[ -S "$SOCKET" ] || exit 0

# Read event JSON from stdin
EVENT_JSON=$(cat)

# Send to buddy panel in background (non-blocking)
echo "$EVENT_JSON" | nc -U "$SOCKET" 2>/dev/null &

exit 0
