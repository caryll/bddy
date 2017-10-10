#!/usr/bin/env node

"use strict";

const path = require("path");
const cli = require("../cli");
const bddydef = require(path.join(process.cwd(), "bddy.js"));
const yargs = require("yargs");

if (bddydef instanceof Function) {
	cli(bddydef);
} else {
	cli(bddydef.recipe, bddydef.Argv(yargs));
}
