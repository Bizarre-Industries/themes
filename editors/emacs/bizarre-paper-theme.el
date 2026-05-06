;;; bizarre-paper-theme.el --- Bizarre Paper theme

(deftheme bizarre-paper "Bizarre Paper for Emacs.")

(let ((class '((class color) (min-colors 89)))
      (bg "#F9F8F2")
      (bg2 "#F2F0EA")
      (bg3 "#E6E3DA")
      (fg "#1F1F1F")
      (dim "#3D3D3D")
      (ghost "#A8A395")
      (accent "#5F8A0F")
      (cursor "#5F8A0F")
      (sel "#DCEFA8")
      (line "#F2F0EA"))
  (custom-theme-set-faces
   'bizarre-paper
   `(default ((,class (:background bg :foreground fg))))
   `(cursor ((,class (:background cursor))))
   `(region ((,class (:background sel))))
   `(fringe ((,class (:background bg :foreground ghost))))
   `(highlight ((,class (:background bg2))))
   `(hl-line ((,class (:background line))))
   `(minibuffer-prompt ((,class (:foreground accent :weight bold))))
   `(mode-line ((,class (:background bg2 :foreground fg :box (:line-width 1 :color "#D8D4C7")))))
   `(mode-line-inactive ((,class (:background bg2 :foreground ghost :box (:line-width 1 :color "#D8D4C7")))))
   `(font-lock-comment-face ((,class (:foreground "#9A9482" :slant italic))))
   `(font-lock-doc-face ((,class (:foreground "#5C7A2A" :slant italic))))
   `(font-lock-string-face ((,class (:foreground "#9F4A0E"))))
   `(font-lock-keyword-face ((,class (:foreground "#B8276F" :weight bold))))
   `(font-lock-builtin-face ((,class (:foreground "#9F4A0E"))))
   `(font-lock-function-name-face ((,class (:foreground "#5F8A0F" :weight bold))))
   `(font-lock-variable-name-face ((,class (:foreground "#1A1A1A"))))
   `(font-lock-type-face ((,class (:foreground "#0F6E6E"))))
   `(font-lock-constant-face ((,class (:foreground "#2F5DC2"))))
   `(font-lock-warning-face ((,class (:foreground "#9F4A0E" :weight bold))))
   `(link ((,class (:foreground "#1F4FB0" :underline t))))
   `(error ((,class (:foreground "#B8276F" :weight bold))))
   `(warning ((,class (:foreground "#9F4A0E"))))
   `(success ((,class (:foreground "#3F7A1F"))))
   `(line-number ((,class (:foreground ghost :background bg))))
   `(line-number-current-line ((,class (:foreground accent :background bg :weight bold))))
   `(show-paren-match ((,class (:foreground accent :weight bold :underline t))))
   `(isearch ((,class (:background accent :foreground "#F9F8F2"))))))

(custom-theme-set-variables
 'bizarre-paper
 '(ansi-color-names-vector ["#1A1A1A" "#C13039" "#3F7A1F" "#9F4A0E" "#1F4FB0" "#7E2A9A" "#0F6E6E" "#545454"]))

(provide-theme 'bizarre-paper)
;;; bizarre-paper-theme.el ends here
