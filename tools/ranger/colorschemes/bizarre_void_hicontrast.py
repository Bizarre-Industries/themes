# Bizarre Void Hi-Contrast - ranger
from ranger.gui.colorscheme import ColorScheme
from ranger.gui.color import (
    black, blue, cyan, default, green, magenta, red, white, yellow,
    bold, normal, reverse,
)


class Scheme(ColorScheme):
    progress_bar_color = green

    def use(self, context):
        fg = white
        bg = default
        attr = normal

        if context.reset:
            return default, default, normal
        if context.in_browser:
            if context.selected:
                attr = reverse
            if context.empty or context.error:
                fg = red
            if context.border:
                fg = green
            if context.media:
                fg = magenta
            if context.container:
                fg = yellow
            if context.directory:
                fg = blue
                attr |= bold
            elif context.executable and not any((context.media, context.container, context.fifo, context.socket)):
                fg = green
                attr |= bold
            if context.link:
                fg = cyan
            if context.bad:
                fg = red
            if context.tag_marker:
                fg = green
                attr |= bold
        elif context.in_titlebar:
            attr = bold
            if context.hostname:
                fg = green
            elif context.directory:
                fg = blue
            elif context.link:
                fg = cyan
        elif context.in_statusbar:
            if context.permissions:
                fg = yellow
            if context.marked:
                fg = green
                attr |= bold
            if context.message:
                fg = white
            if context.loaded:
                fg = green
            if context.error:
                fg = red
                attr |= bold
            if context.warning:
                fg = yellow
        elif context.text:
            if context.highlight:
                attr = reverse
            if context.error:
                fg = red

        return fg, bg, attr
