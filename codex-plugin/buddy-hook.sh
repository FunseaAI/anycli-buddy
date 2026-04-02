#!/usr/bin/env bash
# Codex hook: 把事件发送给 buddy 面板（通过 Unix socket）
SOCKET="$HOME/.codex/buddy/buddy.sock"
EVENT_JSON=$(cat)
[ -S "$SOCKET" ] && echo "$EVENT_JSON" | nc -U "$SOCKET" 2>/dev/null || true
exit 0
