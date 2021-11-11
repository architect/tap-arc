#!/usr/bin/env node

const fastdiff = require("fast-diff");
const JSON5 = require("json5");
const Parser = require("tap-parser");
const through = require("through2");
const {
	bgGreen,
	bgRed,
	black,
	blue,
	bold,
	dim,
	green,
	red,
	underline,
	yellow,
} = require("picocolors");

const RESULT_COMMENTS = ["tests ", "pass ", "skip", "todo", "fail ", "failed ", "ok"];
const OKAY = green("✔");
const FAIL = red("✖");

function createPad(character) {
	return (count = 1, char) => {
		return dim(char || character).repeat(count);
	};
}

function prettyMs(start) {
	const ms = Date.now() - start;
	return ms < 1000 ? `${ms} ms` : `${ms / 1000} s`;
}

function makeDiff(actual, expected, indent = "  ") {
	let msg = [];
	let isJson = true;
	let actualJson = actual;
	let expectedJson = expected;

	try {
		actualJson = JSON5.parse(actual);
		expectedJson = JSON5.parse(expected);
	} catch (e) {
		isJson = false;
	}

	const diff = fastdiff(
		JSON.stringify(isJson ? actualJson : actual, null, indent),
		JSON.stringify(isJson ? expectedJson : expected, null, indent)
	);

	for (const part of diff) {
		// the diff objects can span lines
		// separate lines before styling for tidier output
		const lines = part[1].split("\n");

		if (part[0] === 1) msg.push(lines.map((s) => black(bgGreen(s))).join("\n"));
		else if (part[0] === -1) msg.push(lines.map((s) => black(bgRed(s))).join("\n"));
		else msg.push(lines.map((s) => s.replace(new RegExp(indent, "g"), dim(indent))).join("\n"));
	}

	return msg.join("").split(/\n/); // as separate lines
}

function usage() {
	console.log(`
Usage:
  tap-spek <options>

Parses TAP data from stdin, and outputs a "spec-like" formatted result.

Options:

	-v | --verbose
		Output full stack trace

	-p | --pessimistic | --bail
		Immediately exit upon encountering a failure
		example: tap-spek -p

	--padding [space, dot, <custom characters>]
		String to use when padding output (default="  ")
		example: tap-spek --padding "••"
		example: tap-spek --padding dot

	--indent [space, dot, <custom characters>]
		String to use when indenting Object diffs (default="··")
		example: tap-spek --indent ">>"
		example: tap-spek --indent space
	`);
	process.exit();
}

const options = { pessimistic: false, verbose: false, indent: "··", padding: "  " };
const args = process.argv.slice(2);

for (let i = 0; i < args.length; i++) {
	const arg = args[i];

	if (arg === "-v" || arg === "--verbose") options.verbose = true;
	else if (arg === "-p" || arg === "--pessimistic" || arg === "--bail") options.pessimistic = true;
	else if (arg === "-h" || arg === "--help") usage();
	else if (arg === "--indent") {
		let val = args[i + 1];
		switch (val) {
			case "dot":
				options.indent = "··";
				break;
			case "space":
				options.indent = "  ";
				break;
			default:
				options.indent = val;
				break;
		}
		i += 1;
	} else if (arg === "--padding") {
		let val = args[i + 1];
		switch (val) {
			case "dot":
				options.padding = "··";
				break;
			case "space":
				options.padding = "  ";
				break;
			default:
				options.padding = val;
				break;
		}
		i += 1;
	} else {
		console.error(`Unrecognized arg: ${arg}`);
		process.exit(1);
	}
}

let { indent, pessimistic, padding, verbose } = options;

const parser = new Parser({ bail: pessimistic });
const tapSpek = through();
const pad = createPad(padding);
const cwd = process.cwd();
const start = Date.now();

parser.on("pass", (pass) => {
	tapSpek.push(`${pad(2)}${OKAY} ${dim(pass.name)}\n`);
});

parser.on("skip", (skip) => {
	tapSpek.push(`${pad(2)}${dim(`SKIP ${skip.name}`)}\n`);
});

parser.on("extra", (extra) => {
	if (extra.trim().length > 0) tapSpek.push(`${pad(2)}${yellow(`> ${extra}`)}`);
});

parser.on("comment", (comment) => {
	// Log test-group name
	if (!RESULT_COMMENTS.some((c) => comment.startsWith(c, 2)))
		tapSpek.push(`\n${pad()}${underline(comment.trimEnd().replace(/^(# )/, ""))}\n`);
});

parser.on("todo", (todo) => {
	if (todo.ok) tapSpek.push(`${pad(2)}${yellow("TODO")} ${dim(todo.name)}\n`);
	else tapSpek.push(`${pad(2)}${red("TODO")} ${dim(todo.name)}\n`);
});

parser.on("fail", (fail) => {
	tapSpek.push(`${pad(2)}${FAIL} ${dim(`${fail.id})`)} ${red(fail.name)}\n`);

	if (fail.diag) {
		const { actual, at, expected, operator, stack } = fail.diag;
		let msg = []; // individual lines of output

		if (["equal", "deepEqual"].includes(operator)) {
			if (typeof expected === "string" && typeof actual === "string") {
				msg = [...msg, ...makeDiff(actual, expected, indent)];
			} else if (typeof expected === "object" && typeof actual === "object") {
				// probably an array
				msg = [...msg, ...makeDiff(actual, expected, indent)];
			} else if (typeof expected === "number" || typeof actual === "number") {
				msg.push(`Expected ${green(expected)} but got ${red(actual)}`);
			} else {
				// mixed types
				msg.push(`operator: ${red(operator)}`);
				msg.push(`expected: ${green(expected)} <${typeof expected}>`);
				msg.push(`actual: ${red(actual)} <${typeof actual}>`);
			}
		} else if (["notEqual", "notDeepEqual"].includes(operator)) {
			msg.push("Expected values to differ");
		} else if (operator === "ok") {
			msg.push(`Expected ${green("truthy")} but got ${red(actual)}`);
		} else if (operator === "match") {
			msg.push(`Expected ${red(actual)} to match ${blue(expected)}`);
		} else if (operator === "doesNotMatch") {
			msg.push(`Expected ${red(actual)} to not match ${blue(expected)}`);
		} else if (operator === "throws" && actual && actual !== "undefined") {
			// this combination is ~doesNotThrow
			msg.push(`Expected to not throw, received "${red(actual)}"`);
		} else if (operator === "throws") {
			msg.push("Expected to throw");
		} else if (operator === "error") {
			msg.push(`Expected error to be ${green("falsy")}`);
		} else if (expected && !actual) {
			msg.push(`Expected ${red(operator)} but got nothing`);
		} else if (actual && !expected) {
			msg.push(`Expected ${green("falsy")} but got ${red(actual)}`);
		} else if (expected && actual) {
			msg.push(`Expected ${green(expected)} but got ${red(actual)}`);
		} else if (operator === "fail") {
			msg.push("Explicit fail");
		} else if (!expected && !actual) {
			msg.push(`operator: ${red(operator)}`);
		} else {
			// unlikely
			msg.push(`operator: ${red(operator)}`);
			msg.push(`expected: ${green(expected)}`);
			msg.push(`actual: ${red(actual)}`);
		}

		if (at) msg.push(`${dim(`At: ${at.replace(cwd, "")}`)}`);

		if (verbose && stack) {
			msg.push("");
			stack.split("\n").forEach((s) => {
				msg.push(dim(s.trim().replace(cwd, "")));
			});
		}

		msg.push("");

		// final formatting, each entry must be a single line
		msg = msg.map((line) => `${pad(3)}${line}\n`);

		tapSpek.push(msg.join(""));
	}
});

parser.on("complete", (result) => {
	if (!result.ok) {
		let failureSummary = "\n";
		failureSummary += `${pad()}${red("Failed tests:")}`;
		failureSummary += ` There ${result.fail > 1 ? "were" : "was"} `;
		failureSummary += red(result.fail);
		failureSummary += ` failure${result.fail > 1 ? "s" : ""}\n\n`;

		tapSpek.push(failureSummary);

		for (const fail of result.failures) {
			tapSpek.push(`${pad(2)}${FAIL} ${dim(`${fail.id})`)} ${fail.name}\n`);
		}
	}

	tapSpek.push(`\n${pad()}total:     ${result.count}\n`);
	if (result.pass > 0) tapSpek.push(green(`${pad()}passing:   ${result.pass}\n`));
	if (result.fail > 0) tapSpek.push(red(`${pad()}failing:   ${result.fail}\n`));
	if (result.skip > 0) tapSpek.push(`${pad()}skipped:   ${result.skip}\n`);
	if (result.todo > 0) tapSpek.push(`${pad()}todo:      ${result.todo}\n`);
	if (result.bailout) tapSpek.push(`${pad()}${bold(underline(red("BAILED!")))}\n`);

	tapSpek.end(`${dim(`${pad()}${prettyMs(start)}`)}\n\n`);

	process.exit(result.ok ? 0 : 1);
});

process.stdin.pipe(parser).pipe(tapSpek).pipe(process.stdout);
