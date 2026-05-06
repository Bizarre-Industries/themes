#let bizarre-bg = rgb("#0E0E0E")
#let bizarre-fg = rgb("#E4E4E4")
#let bizarre-accent = rgb("#C6FF24")
#let bizarre-border = rgb("#3D3D3D")
#let bizarre-heading(body) = text(fill: bizarre-accent, weight: "bold", body)
#let bizarre-page(body) = page(fill: bizarre-bg)[
  #set text(fill: bizarre-fg, font: "Monaspace Argon")
  #body
]
#let bizarre-rule = line(length: 100%, stroke: 1pt + bizarre-border)
