const duplexify = require("duplexify");
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

function makeDiff(actual, expected) {
	const diff = fastdiff(JSON.stringify(actual, null, "··"), JSON.stringify(expected, null, "··"));
	const msg = [];

	for (const part of diff) {
		const str = part[1].split("\n");

		if (part[0] === 1) msg.push(str.map((s) => `${black(bgGreen(s))}`).join("\n"));
		else if (part[0] === -1) msg.push(str.map((s) => `${black(bgRed(s))}`).join("\n"));
		else msg.push(str.map((s) => dim(s)).join("\n"));
	}

	return msg.join("").split(/\n/); // lines
}

module.exports = function spek(options = { spacer: "  " }) {
	const start = Date.now();

	let { spacer } = options;
	if (spacer === "dot") spacer = "··";

	const tap = new Parser();
	const output = through();
	const stream = duplexify(tap, output);
	const pad = createPad(spacer);
	const cwd = process.cwd();

	tap.on("pass", (pass) => {
		output.push(`${pad(2)}${OKAY} ${dim(pass.name)}\n`);
	});

	tap.on("skip", (skip) => {
		output.push(`${pad(2)}${dim(`SKIP ${skip.name}`)}\n`);
	});

	tap.on("extra", (extra) => {
		if (extra.trim().length > 0) output.push(`${pad(2)}${yellow(`> ${extra}`)}`);
	});

	tap.on("comment", (comment) => {
		// Log test-group name
		if (!RESULT_COMMENTS.some((c) => comment.startsWith(c, 2)))
			output.push(`\n${pad()}${underline(comment.trimEnd().replace(/^(# )/, ""))}\n`);
	});

	tap.on("todo", (t) => {
		if (t.ok) output.push(`${pad(2)}${yellow("TODO")} ${dim(t.name)}\n`);
		else output.push(`${pad(2)}${red("TODO")} ${dim(t.name)}\n`);
	});

	tap.on("fail", (fail) => {
		output.push(`${pad(2)}${FAIL} ${dim(`#${fail.id}`)} ${red(fail.name)}\n`);

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
						const objectDiff = makeDiff(actualJson, expectedJson);
						msg = [...msg, ...objectDiff];
					} else {
						const stringDiff = makeDiff(actual, expected);
						msg = [...msg, ...stringDiff];
					}
				} else if (typeof expected === "object" && typeof actual === "object") {
					// probably an array
					const diff = makeDiff(actual, expected);
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

			msg = msg.map((line) => `${pad(3)}${line}\n`);

			msg.push("\n\n");

			output.push(msg.join(""));
		}
	});

	tap.on("complete", (result) => {
		stream.count = result.count;
		stream.failures = result.failures;

		if (!result.ok && result.fail > 0) {
			let failureSummary = "\n";
			failureSummary += `${pad()}${red("Failed tests:")}`;
			failureSummary += ` There ${result.fail > 1 ? "were" : "was"} `;
			failureSummary += red(result.fail);
			failureSummary += ` failure${result.fail > 1 ? "s" : ""}\n\n`;

			output.push(failureSummary);

			for (const fail of result.failures) {
				output.push(`${pad(2)}${FAIL} ${dim(`#${fail.id}`)} ${fail.name}\n`);
			}
		}

		output.push(`\n${pad()}total:     ${result.count}\n`);
		if (result.pass > 0) output.push(green(`${pad()}passing:   ${result.pass}\n`));
		if (result.fail > 0) output.push(red(`${pad()}failing:   ${result.fail}\n`));
		if (result.skip > 0) output.push(`${pad()}skipped:   ${result.skip}\n`);
		if (result.todo > 0) output.push(`${pad()}todo:      ${result.todo}\n`);
		if (result.bailout) output.push(`${pad()}${bold(underline(red("BAILED")))}!\n`);

		output.end(`${dim(`${pad()}${prettyMs(start)}`)}\n\n`);
	});

	return stream;
};
