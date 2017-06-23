#!/usr/bin/env node

"use strict";

var PrettyError = require("pretty-error");
var pe = new PrettyError();

pe.appendStyle({
	"pretty-error > header > title > kind": { display: "none" },
	"pretty-error > header > colon": { display: "none" },
	"pretty-error > header > message": {
		color: "bright-white",
		background: "cyan",
		padding: "0 0"
	},
	"pretty-error > trace > item": { marginLeft: 2, bullet: '"<grey>-</grey>"' },
	"pretty-error > trace > item > header > pointer > file": { color: "bright-cyan" },
	"pretty-error > trace > item > header > pointer > colon": { color: "cyan" },
	"pretty-error > trace > item > header > pointer > line": { color: "bright-cyan" },
	"pretty-error > trace > item > header > what": { color: "bright-white" },
	"pretty-error > trace > item > footer > addr": { display: "none" }
});

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
build(bddydef, argv).catch(function(e) {
	var renderedError = pe.render(e);
	console.log(renderedError);
	process.exit(1);
});
