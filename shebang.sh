#!/bin/bash

echo 'prepending shebang to ./dist/cli-script.js'

echo '0a
#!/bin/sh
":" //# comment; exec /usr/bin/env node --allow-natives-syntax "$0" "$@"
.
w' | ed ./dist/cli-script.js