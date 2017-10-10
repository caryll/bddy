# *bddy*: Build Directly

*bddy* is a simple building toolkit written in Node.JS.

## Installation

Install as a global command: `npm install bddy -g`;

Install locally: `npm install bddy`.

## Writing recipe

```js
// bddy.js
module.exports = function(ctx, the, argv){
    the.file(`out/*.js`).def(async function(target, $){
        const [_, $in] = await $.need(target.dir, `src/${target.$1}.js`);
        await $.run(`uglify`, $in, [`-o`, ${target}]);
    })
    the.virt(`start`).def(async function(target, $){
        await $.need(`out/a.js`, `out/b.js`, `out/c.js`)
    })
}
```

Type command `bddy` to initiate the build.

### Programmatically use *bddy*

```js
#!/usr/bin/env node

"use strict";
const cli = require("bddy/cli");
cli(require("./bddy"), ['start']);
```

