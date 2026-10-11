#!/usr/bin/env bash
# Stop hook: after a turn that changed UI-relevant files, ask Claude to run the
# design-reviewer subagent once per distinct working-tree state.
set -u

input=$(cat)
cd "${CLAUDE_PROJECT_DIR:-$(pwd)}" || exit 0

# Already continuing because of a Stop hook: never loop.
if [ "$(printf '%s' "$input" | jq -r '.stop_hook_active // false')" = "true" ]; then
    exit 0
fi

git rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0

paths=(src public index.html)
changed=$(git status --porcelain -- "${paths[@]}" 2>/dev/null)
[ -z "$changed" ] && exit 0

# Fingerprint tracked diff + untracked file contents.
fingerprint=$(
    {
        git diff HEAD -- "${paths[@]}"
        git ls-files -o --exclude-standard -- "${paths[@]}" | while read -r f; do
            printf '%s\n' "$f"
            cat "$f"
        done
    } | sha1sum | cut -d' ' -f1
)

state=.claude/.design-review-state
if [ -f "$state" ] && [ "$(cat "$state")" = "$fingerprint" ]; then
    exit 0
fi
printf '%s' "$fingerprint" >"$state"

files=$(printf '%s\n' "$changed" | head -30 | sed 's/^/- /')
reason="Design review required before finishing. Use the Agent tool with subagent_type \"design-reviewer\" to validate the latest state of the components and pages (see .claude/agents/design-reviewer.md). Changed files:
${files}
Pass this list in the prompt. If the reviewer reports problems, fix them (or tell the user why you will not) and summarize its verdict in your final answer."

jq -n --arg reason "$reason" '{decision: "block", reason: $reason}'
