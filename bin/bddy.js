#!/usr/bin/env node

"use strict";

const argv = require("yargs").argv;

const path = require("path");
const { bddy } = require("../index");

async function build(defs, argv) {
	const bddyInst = bddy(defs, argv);
	if (argv._.length) {
		for (let wish of argv._) {
			await bddyInst.wish(wish);
		}
	} else {
		await bddyInst.wish("start");
	}
}

const bddydef = require(path.join(process.cwd(), "bddy.js"));
build(bddydef, argv);
