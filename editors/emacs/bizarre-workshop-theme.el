;;; bizarre-workshop-theme.el --- Bizarre Workshop theme

(deftheme bizarre-workshop "Bizarre Workshop for Emacs.")

(let ((class '((class color) (min-colors 89)))
      (bg "#1A1815")
      (bg2 "#23211C")
      (bg3 "#2D2A23")
      (fg "#E4E2DA")
      (dim "#9C9A91")
      (ghost "#545040")
      (accent "#C6FF24")
      (cursor "#C6FF24")
      (sel "#3A3618")
      (line "#23211C"))
  (custom-theme-set-faces
   'bizarre-workshop
   `(default ((,class (:background bg :foreground fg))))
   `(cursor ((,class (:background cursor))))
   `(region ((,class (:background sel))))
   `(fringe ((,class (:background bg :foreground ghost))))
   `(highlight ((,class (:background bg2))))
   `(hl-line ((,class (:background line))))
   `(minibuffer-prompt ((,class (:foreground accent :weight bold))))
   `(mode-line ((,class (:background bg2 :foreground fg :box (:line-width 1 :color "#3D3A33")))))
   `(mode-line-inactive ((,class (:background bg2 :foreground ghost :box (:line-width 1 :color "#3D3A33")))))
   `(font-lock-comment-face ((,class (:foreground "#6F6F6F" :slant italic))))
   `(font-lock-doc-face ((,class (:foreground "#9AB585" :slant italic))))
   `(font-lock-string-face ((,class (:foreground "#E8A33D"))))
   `(font-lock-keyword-face ((,class (:foreground "#FF8FCF" :weight bold))))
   `(font-lock-builtin-face ((,class (:foreground "#E8A33D"))))
   `(font-lock-function-name-face ((,class (:foreground "#C6FF24" :weight bold))))
   `(font-lock-variable-name-face ((,class (:foreground "#E4E4E4"))))
   `(font-lock-type-face ((,class (:foreground "#7AD9D9"))))
   `(font-lock-constant-face ((,class (:foreground "#9DD0FF"))))
   `(font-lock-warning-face ((,class (:foreground "#FFB85C" :weight bold))))
   `(link ((,class (:foreground "#7BB3FF" :underline t))))
   `(error ((,class (:foreground "#FF6F77" :weight bold))))
   `(warning ((,class (:foreground "#FFB85C"))))
   `(success ((,class (:foreground "#5BD06B"))))
   `(line-number ((,class (:foreground ghost :background bg))))
   `(line-number-current-line ((,class (:foreground accent :background bg :weight bold))))
   `(show-paren-match ((,class (:foreground accent :weight bold :underline t))))
   `(isearch ((,class (:background accent :foreground "#0E0E0E"))))))

(custom-theme-set-variables
 'bizarre-workshop
 '(ansi-color-names-vector ["#1A1815" "#F0525B" "#3FB950" "#E8A33D" "#5B9FFF" "#D88AE0" "#7AD9D9" "#E4E4E4"]))

(provide-theme 'bizarre-workshop)
;;; bizarre-workshop-theme.el ends here
