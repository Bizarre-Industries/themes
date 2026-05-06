#!/usr/bin/env bash
# Bizarre Industries - shell banner (bash)
# CATCH THE STARS.

[[ $- != *i* ]] && return

_BZR_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
_BZR_ROOT="$( cd -- "$_BZR_DIR/../.." &> /dev/null && pwd )"
_BZR_MANIFESTO="$_BZR_ROOT/shells/manifesto.txt"
_BZR_STAMP="${XDG_CACHE_HOME:-$HOME/.cache}/bizarre-banner.stamp"

_bzr_should_show() {
  [[ "$BIZARRE_BANNER" == "0" ]] && return 1
  [[ "$BIZARRE_BANNER" == "1" ]] && return 0
  local today
  today="$(date +%Y-%m-%d)"
  if [[ -r "$_BZR_STAMP" ]] && [[ "$(cat "$_BZR_STAMP")" == "$today" ]]; then return 1; fi
  mkdir -p "$(dirname "$_BZR_STAMP")" 2>/dev/null
  echo "$today" > "$_BZR_STAMP"
  return 0
}

bizarre_banner() {
  local lime=$'\e[38;2;198;255;36m'
  local glow=$'\e[38;2;232;255;138m'
  local gray=$'\e[38;2;122;122;122m'
  local fg=$'\e[38;2;228;228;228m'
  local dim=$'\e[2m'
  local b=$'\e[1m'
  local r=$'\e[0m'
  printf '\n'
  printf '%s%s ██████╗ ██╗███████╗ █████╗ ██████╗ ██████╗ ███████╗%s\n' "$lime" "$b" "$r"
  printf '%s%s ██╔══██╗██║╚══███╔╝██╔══██╗██╔══██╗██╔══██╗██╔════╝%s\n' "$lime" "$b" "$r"
  printf '%s%s ██████╔╝██║  ███╔╝ ███████║██████╔╝██████╔╝█████╗  %s\n' "$lime" "$b" "$r"
  printf '%s%s ██╔══██╗██║ ███╔╝  ██╔══██║██╔══██╗██╔══██╗██╔══╝  %s\n' "$lime" "$b" "$r"
  printf '%s%s ██████╔╝██║███████╗██║  ██║██║  ██║██║  ██║███████╗%s\n' "$lime" "$b" "$r"
  printf '%s%s ╚═════╝ ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝%s\n' "$lime" "$b" "$r"
  printf '\n'
  printf '%s ██╗███╗   ██╗██████╗ ██╗   ██╗███████╗████████╗██████╗ ██╗███████╗███████╗%s\n' "$gray" "$r"
  printf '%s ██║████╗  ██║██╔══██╗██║   ██║██╔════╝╚══██╔══╝██╔══██╗██║██╔════╝██╔════╝%s\n' "$gray" "$r"
  printf '%s ██║██╔██╗ ██║██║  ██║██║   ██║███████╗   ██║   ██████╔╝██║█████╗  ███████╗%s\n' "$gray" "$r"
  printf '%s ██║██║╚██╗██║██║  ██║██║   ██║╚════██║   ██║   ██╔══██╗██║██╔══╝  ╚════██║%s\n' "$gray" "$r"
  printf '%s ██║██║ ╚████║██████╔╝╚██████╔╝███████║   ██║   ██║  ██║██║███████╗███████║%s\n' "$gray" "$r"
  printf '%s ╚═╝╚═╝  ╚═══╝╚═════╝  ╚═════╝ ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚══════╝╚══════╝%s\n' "$gray" "$r"
  printf '\n'
  local month_year
  month_year=$(date +'%b %Y' | tr '[:lower:]' '[:upper:]')
  printf '  %s%sBZR / SHELL / V0.2 / %s%s   %s%s✦%s   %shost: %s%s\n' "$dim" "$gray" "$month_year" "$r" "$glow" "$b" "$r" "$gray" "$(hostname -s)" "$r"
  if [[ -r "$_BZR_MANIFESTO" ]]; then
    local count line
    count=$(wc -l < "$_BZR_MANIFESTO")
    if (( count > 0 )); then
      line=$(sed -n "$((RANDOM % count + 1))p" "$_BZR_MANIFESTO")
      printf '\n  %s%s%s%s\n' "$fg" "$b" "$line" "$r"
    fi
  fi
  printf '\n  %s%sCATCH THE STARS.%s\n\n' "$lime" "$b" "$r"
}

if _bzr_should_show; then bizarre_banner; fi
