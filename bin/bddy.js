#!/usr/bin/env node

"use strict";

const path = require("path");
const cli = require("../cli");
const bddydef = require(path.join(process.cwd(), "bddy.js"));
cli(bddydef);
