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
	const diff = fastdiff(
		JSON.stringify(actual, null, indent),
		JSON.stringify(expected, null, indent)
	);
	const msg = [];

	for (const part of diff) {
		const lines = part[1].split("\n");

		if (part[0] === 1) msg.push(lines.map((s) => black(bgGreen(s))).join("\n"));
		else if (part[0] === -1) msg.push(lines.map((s) => black(bgRed(s))).join("\n"));
		else msg.push(lines.map((s) => s.replace(new RegExp(indent, "g"), dim(indent))).join("\n"));
	}

	return msg.join("").split(/\n/); // lines
}

const options = { indent: "··", spacer: "  " };

const start = Date.now();

let { indent, spacer } = options;
if (spacer === "dot") spacer = "··";

const parser = new Parser();
const tapSpek = through();
const pad = createPad(spacer);
const cwd = process.cwd();

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

parser.on("todo", (t) => {
	if (t.ok) tapSpek.push(`${pad(2)}${yellow("TODO")} ${dim(t.name)}\n`);
	else tapSpek.push(`${pad(2)}${red("TODO")} ${dim(t.name)}\n`);
});

parser.on("fail", (fail) => {
	tapSpek.push(`${pad(2)}${FAIL} ${dim(`${fail.id})`)} ${red(fail.name)}\n`);

	if (fail.diag) {
		const { actual, at, expected, operator } = fail.diag;
		let msg = [];

		if (["equal", "deepEqual"].includes(operator)) {
			if (typeof expected === "string" && typeof actual === "string") {
				let isJson = true;
				let actualJson = actual;
				let expectedJson = expected;
				try {
					actualJson = JSON5.parse(actual);
					expectedJson = JSON5.parse(expected);
				} catch (e) {
					isJson = false;
				}

				if (isJson) {
					const objectDiff = makeDiff(actualJson, expectedJson, indent);
					msg = [...msg, ...objectDiff];
				} else {
					const stringDiff = makeDiff(actual, expected, indent);
					msg = [...msg, ...stringDiff];
				}
			} else if (typeof expected === "object" && typeof actual === "object") {
				// probably an array
				const diff = makeDiff(actual, expected, indent);
				msg = [...msg, ...diff];
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

		msg.push("");

		msg = msg.map((line) => `${pad(3)}${line}\n`);

		tapSpek.push(msg.join(""));
	}
});

parser.on("complete", (result) => {
	// stream.ok = result.ok;

	if (!result.ok && result.fail > 0) {
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
	if (result.bailout) tapSpek.push(`${pad()}${bold(underline(red("BAILED")))}!\n`);

	tapSpek.end(`${dim(`${pad()}${prettyMs(start)}`)}\n\n`);
	process.exit(parser.ok ? 0 : 1);
});

process.stdin.pipe(parser).pipe(tapSpek).pipe(process.stdout);
