#!/usr/bin/env bash
set -euo pipefail

variant="${1:-bizarre-void}"

case "$variant" in
  bizarre-void)
    name="Bizarre Void"
    bg="#0E0E0E"
    fg="#E4E4E4"
    cursor="#C6FF24"
    selection_bg="#2B3A0E"
    selection_fg="#F9F8F2"
    palette="#1A1A1A:#F0525B:#3FB950:#E8A33D:#5B9FFF:#D88AE0:#7AD9D9:#E4E4E4:#3D3D3D:#FF6F77:#C6FF24:#FFB85C:#7BB3FF:#E8A8EE:#9DEAEA:#FFFFFF"
    ;;
  bizarre-void-hicontrast)
    name="Bizarre Void Hi-Contrast"
    bg="#000000"
    fg="#F9F8F2"
    cursor="#C6FF24"
    selection_bg="#3A4D0E"
    selection_fg="#F9F8F2"
    palette="#000000:#F0525B:#3FB950:#E8A33D:#5B9FFF:#D88AE0:#7AD9D9:#E4E4E4:#3D3D3D:#FF6F77:#C6FF24:#FFB85C:#7BB3FF:#E8A8EE:#9DEAEA:#FFFFFF"
    ;;
  bizarre-workshop)
    name="Bizarre Workshop"
    bg="#1A1815"
    fg="#E4E2DA"
    cursor="#C6FF24"
    selection_bg="#3A3618"
    selection_fg="#F9F8F2"
    palette="#1A1815:#F0525B:#3FB950:#E8A33D:#5B9FFF:#D88AE0:#7AD9D9:#E4E4E4:#3D3D3D:#FF6F77:#C6FF24:#FFB85C:#7BB3FF:#E8A8EE:#9DEAEA:#FFFFFF"
    ;;
  bizarre-paper)
    name="Bizarre Paper"
    bg="#F9F8F2"
    fg="#1F1F1F"
    cursor="#5F8A0F"
    selection_bg="#DCEFA8"
    selection_fg="#0E0E0E"
    palette="#1A1A1A:#C13039:#3F7A1F:#9F4A0E:#1F4FB0:#7E2A9A:#0F6E6E:#545454:#7A7568:#E04050:#5F8A0F:#C28225:#3D78C7:#A55EAF:#4FA3A3:#0E0E0E"
    ;;
  bizarre-bone)
    name="Bizarre Bone"
    bg="#F5F2EA"
    fg="#2B2B2B"
    cursor="#5F8A0F"
    selection_bg="#D4E89F"
    selection_fg="#0E0E0E"
    palette="#2B2B2B:#C13039:#3F7A1F:#9F4A0E:#1F4FB0:#7E2A9A:#0F6E6E:#545454:#7A7568:#E04050:#5F8A0F:#C28225:#3D78C7:#A55EAF:#4FA3A3:#0E0E0E"
    ;;
  *)
    echo "unknown Bizarre variant: $variant" >&2
    exit 2
    ;;
esac

profile_id="$(uuidgen | tr '[:upper:]' '[:lower:]')"
profile_path="org/gnome/terminal/legacy/profiles:/:$profile_id/"
base="/org/gnome/terminal/legacy/profiles:/:$profile_id/"
list="$(gsettings get org.gnome.Terminal.ProfilesList list | tr -d "[]',")"
profiles="["
for item in $list; do profiles="$profiles'$item', "; done
profiles="$profiles'$profile_id']"

gsettings set org.gnome.Terminal.ProfilesList list "$profiles"
gsettings set org.gnome.Terminal.ProfilesList default "$profile_id"
dconf write "$base"visible-name "'$name'"
dconf write "$base"use-theme-colors "false"
dconf write "$base"background-color "'$bg'"
dconf write "$base"foreground-color "'$fg'"
dconf write "$base"cursor-colors-set "true"
dconf write "$base"cursor-background-color "'$cursor'"
dconf write "$base"cursor-foreground-color "'$selection_fg'"
dconf write "$base"highlight-colors-set "true"
dconf write "$base"highlight-background-color "'$selection_bg'"
dconf write "$base"highlight-foreground-color "'$selection_fg'"
dconf write "$base"palette "['${palette//:/', '}']"
echo "installed $name as $profile_path"
