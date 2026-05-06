#!/usr/bin/env sh
# Bizarre Void for SketchyBar
export BIZARRE_BG="#0E0E0E"
export BIZARRE_BG2="#1A1A1A"
export BIZARRE_FG="#E4E4E4"
export BIZARRE_DIM="#9C9C9C"
export BIZARRE_ACCENT="#C6FF24"
export BIZARRE_BORDER="#3D3D3D"

sketchybar --bar color="$BIZARRE_BG" border_color="$BIZARRE_BORDER"
sketchybar --default background.color="$BIZARRE_BG2" icon.color="$BIZARRE_FG" label.color="$BIZARRE_DIM"
sketchybar --set front_app label.color="$BIZARRE_ACCENT"
