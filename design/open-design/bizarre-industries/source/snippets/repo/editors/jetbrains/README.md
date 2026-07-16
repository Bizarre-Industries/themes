# Bizarre Industries — JetBrains IDEs

`BZR / JetBrains / V0.2`

Works in IntelliJ IDEA, PyCharm, WebStorm, GoLand, Rider, RubyMine, RustRover, etc.

## Install

`Settings → Editor → Color Scheme → ⚙ → Import Scheme…` and pick a `.icls` file.

Or drop directly:

```bash
# Replace <IDE> with the installed IDE's config directory name.

# macOS
mkdir -p "$HOME/Library/Application Support/JetBrains/<IDE>/colors"
cp editors/jetbrains/*.icls "$HOME/Library/Application Support/JetBrains/<IDE>/colors/"

# Linux
mkdir -p "$HOME/.config/JetBrains/<IDE>/colors"
cp editors/jetbrains/*.icls "$HOME/.config/JetBrains/<IDE>/colors/"
```

CATCH THE STARS.
