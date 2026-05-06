#!/usr/bin/env zsh
# ─────────────────────────────────────────────────────────────
#  BIZARRE INDUSTRIES — shell banner (zsh)
#  CATCH THE STARS.
#
#  Usage: source ~/dotfiles/bizarre/shells/banner/bizarre.zsh
#
#  Shows the wordmark + a rotating manifesto line on the FIRST
#  shell of the day. Set BIZARRE_BANNER=1 to force, =0 to disable.
# ─────────────────────────────────────────────────────────────

# Don't run in non-interactive shells (scp, scripts, etc.)
[[ $- != *i* ]] && return

# Resolve script dir even when sourced
_BZR_DIR="${${(%):-%x}:A:h}"
_BZR_ROOT="${_BZR_DIR:h:h}"
_BZR_MANIFESTO="${_BZR_ROOT}/shells/manifesto.txt"
_BZR_STAMP="${XDG_CACHE_HOME:-$HOME/.cache}/bizarre-banner.stamp"

# Decide whether to show
_bzr_should_show() {
  [[ "$BIZARRE_BANNER" == "0" ]] && return 1
  [[ "$BIZARRE_BANNER" == "1" ]] && return 0
  # default: first shell of the day
  local today
  today="$(date +%Y-%m-%d)"
  if [[ -r "$_BZR_STAMP" ]] && [[ "$(<"$_BZR_STAMP")" == "$today" ]]; then
    return 1
  fi
  mkdir -p "${_BZR_STAMP:h}" 2>/dev/null
  print -- "$today" > "$_BZR_STAMP"
  return 0
}

bizarre_banner() {
  local lime=$'\e[38;2;198;255;36m'
  local glow=$'\e[38;2;232;255;138m'
  local gray=$'\e[38;2;120;120;120m'
  local fg=$'\e[38;2;228;228;228m'
  local dim=$'\e[2m'
  local b=$'\e[1m'
  local r=$'\e[0m'

  printf "\n"
  printf "%s%s ██████╗ ██╗███████╗ █████╗ ██████╗ ██████╗ ███████╗%s\n"   "$lime" "$b" "$r"
  printf "%s%s ██╔══██╗██║╚══███╔╝██╔══██╗██╔══██╗██╔══██╗██╔════╝%s\n"   "$lime" "$b" "$r"
  printf "%s%s ██████╔╝██║  ███╔╝ ███████║██████╔╝██████╔╝█████╗  %s\n"   "$lime" "$b" "$r"
  printf "%s%s ██╔══██╗██║ ███╔╝  ██╔══██║██╔══██╗██╔══██╗██╔══╝  %s\n"   "$lime" "$b" "$r"
  printf "%s%s ██████╔╝██║███████╗██║  ██║██║  ██║██║  ██║███████╗%s\n"   "$lime" "$b" "$r"
  printf "%s%s ╚═════╝ ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝%s\n"   "$lime" "$b" "$r"
  printf "\n"
  printf "%s ██╗███╗   ██╗██████╗ ██╗   ██╗███████╗████████╗██████╗ ██╗███████╗███████╗%s\n" "$gray" "$r"
  printf "%s ██║████╗  ██║██╔══██╗██║   ██║██╔════╝╚══██╔══╝██╔══██╗██║██╔════╝██╔════╝%s\n" "$gray" "$r"
  printf "%s ██║██╔██╗ ██║██║  ██║██║   ██║███████╗   ██║   ██████╔╝██║█████╗  ███████╗%s\n" "$gray" "$r"
  printf "%s ██║██║╚██╗██║██║  ██║██║   ██║╚════██║   ██║   ██╔══██╗██║██╔══╝  ╚════██║%s\n" "$gray" "$r"
  printf "%s ██║██║ ╚████║██████╔╝╚██████╔╝███████║   ██║   ██║  ██║██║███████╗███████║%s\n" "$gray" "$r"
  printf "%s ╚═╝╚═╝  ╚═══╝╚═════╝  ╚═════╝ ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚══════╝╚══════╝%s\n" "$gray" "$r"
  printf "\n"

  # eyebrow
  local eyebrow="BZR / SHELL / V0.1 / $(date +'%b %Y' | tr '[:lower:]' '[:upper:]')"
  printf "  %s%s%s   %s%s✦%s   %s%s%s\n" \
    "$dim$gray" "$eyebrow" "$r" \
    "$glow" "$b" "$r" \
    "$gray" "host: $(hostname -s)" "$r"

  # manifesto rotation
  if [[ -r "$_BZR_MANIFESTO" ]]; then
    local lines=("${(@f)$(< "$_BZR_MANIFESTO")}")
    local n=${#lines[@]}
    if (( n > 0 )); then
      local idx=$((RANDOM % n + 1))
      local line="${lines[idx]}"
      printf "\n  %s%s%s\n" "$fg$b" "$line" "$r"
    fi
  fi

  # slogan, standing alone (BRAND rule)
  printf "\n  %s%sCATCH THE STARS.%s\n\n" "$lime" "$b" "$r"
}

if _bzr_should_show; then
  bizarre_banner
fi
