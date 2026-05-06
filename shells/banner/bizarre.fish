# Bizarre Industries - shell banner (fish)
# CATCH THE STARS.

status is-interactive; or exit

set -l _bzr_dir (status dirname)
set -l _bzr_root (realpath "$_bzr_dir/../..")
set -l _bzr_manifesto "$_bzr_root/shells/manifesto.txt"
set -l _bzr_cache (test -n "$XDG_CACHE_HOME"; and echo $XDG_CACHE_HOME; or echo "$HOME/.cache")
set -l _bzr_stamp "$_bzr_cache/bizarre-banner.stamp"

function _bzr_should_show --argument-names stamp --inherit-variable BIZARRE_BANNER
  if test "$BIZARRE_BANNER" = "0"; return 1; end
  if test "$BIZARRE_BANNER" = "1"; return 0; end
  set -l today (date +%Y-%m-%d)
  if test -r "$stamp"; and test (cat "$stamp") = "$today"; return 1; end
  mkdir -p (dirname "$stamp") 2>/dev/null
  echo $today > "$stamp"
  return 0
end

function bizarre_banner --argument-names manifesto
  set -l lime (printf '\e[38;2;198;255;36m')
  set -l glow (printf '\e[38;2;232;255;138m')
  set -l gray (printf '\e[38;2;122;122;122m')
  set -l fg (printf '\e[38;2;228;228;228m')
  set -l dim (printf '\e[2m')
  set -l b (printf '\e[1m')
  set -l r (printf '\e[0m')
  echo
  printf '%s%s ██████╗ ██╗███████╗ █████╗ ██████╗ ██████╗ ███████╗%s\n' $lime $b $r
  printf '%s%s ██╔══██╗██║╚══███╔╝██╔══██╗██╔══██╗██╔══██╗██╔════╝%s\n' $lime $b $r
  printf '%s%s ██████╔╝██║  ███╔╝ ███████║██████╔╝██████╔╝█████╗  %s\n' $lime $b $r
  printf '%s%s ██╔══██╗██║ ███╔╝  ██╔══██║██╔══██╗██╔══██╗██╔══╝  %s\n' $lime $b $r
  printf '%s%s ██████╔╝██║███████╗██║  ██║██║  ██║██║  ██║███████╗%s\n' $lime $b $r
  printf '%s%s ╚═════╝ ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝%s\n' $lime $b $r
  echo
  printf '%s ██╗███╗   ██╗██████╗ ██╗   ██╗███████╗████████╗██████╗ ██╗███████╗███████╗%s\n' $gray $r
  printf '%s ██║████╗  ██║██╔══██╗██║   ██║██╔════╝╚══██╔══╝██╔══██╗██║██╔════╝██╔════╝%s\n' $gray $r
  printf '%s ██║██╔██╗ ██║██║  ██║██║   ██║███████╗   ██║   ██████╔╝██║█████╗  ███████╗%s\n' $gray $r
  printf '%s ██║██║╚██╗██║██║  ██║██║   ██║╚════██║   ██║   ██╔══██╗██║██╔══╝  ╚════██║%s\n' $gray $r
  printf '%s ██║██║ ╚████║██████╔╝╚██████╔╝███████║   ██║   ██║  ██║██║███████╗███████║%s\n' $gray $r
  printf '%s ╚═╝╚═╝  ╚═══╝╚═════╝  ╚═════╝ ╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚══════╝╚══════╝%s\n' $gray $r
  echo
  set -l month_year (date +'%b %Y' | tr '[:lower:]' '[:upper:]')
  printf '  %s%sBZR / SHELL / V0.2 / %s%s   %s%s✦%s   %shost: %s%s\n' $dim $gray $month_year $r $glow $b $r $gray (hostname -s) $r
  if test -r "$manifesto"
    set -l lines (cat "$manifesto")
    set -l n (count $lines)
    if test $n -gt 0
      set -l idx (random 1 $n)
      printf '\n  %s%s%s%s\n' $fg $b $lines[$idx] $r
    end
  end
  printf '\n  %s%sCATCH THE STARS.%s\n\n' $lime $b $r
end

if _bzr_should_show "$_bzr_stamp"
  bizarre_banner "$_bzr_manifesto"
end
