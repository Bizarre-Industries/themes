;;; bizarre-void-hicontrast-theme.el --- Bizarre Void Hi-Contrast theme

(deftheme bizarre-void-hicontrast "Bizarre Void Hi-Contrast for Emacs.")

(let ((class '((class color) (min-colors 89)))
      (bg "#000000")
      (bg2 "#0E0E0E")
      (bg3 "#1F1F1F")
      (fg "#F9F8F2")
      (dim "#B8B8B8")
      (ghost "#545454")
      (accent "#C6FF24")
      (cursor "#C6FF24")
      (sel "#3A4D0E")
      (line "#0E0E0E"))
  (custom-theme-set-faces
   'bizarre-void-hicontrast
   `(default ((,class (:background bg :foreground fg))))
   `(cursor ((,class (:background cursor))))
   `(region ((,class (:background sel))))
   `(fringe ((,class (:background bg :foreground ghost))))
   `(highlight ((,class (:background bg2))))
   `(hl-line ((,class (:background line))))
   `(minibuffer-prompt ((,class (:foreground accent :weight bold))))
   `(mode-line ((,class (:background bg2 :foreground fg :box (:line-width 1 :color "#545454")))))
   `(mode-line-inactive ((,class (:background bg2 :foreground ghost :box (:line-width 1 :color "#545454")))))
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
 'bizarre-void-hicontrast
 '(ansi-color-names-vector ["#000000" "#F0525B" "#3FB950" "#E8A33D" "#5B9FFF" "#D88AE0" "#7AD9D9" "#E4E4E4"]))

(provide-theme 'bizarre-void-hicontrast)
;;; bizarre-void-hicontrast-theme.el ends here
