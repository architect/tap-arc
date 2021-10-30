const Diff = require("diff");
const duplexer = require("duplexer3");
const Parser = require("tap-parser");
const pico = require("picocolors");
const through = require("through2");

const RESULT_COMMENTS = ["tests ", "pass ", "skip", "todo", "fail ", "failed ", "ok"];

function pad(count = 1) {
	const INDENT = "  ";
	return INDENT.repeat(count);
}

module.exports = function spek() {
	const start = Date.now();
	const tap = new Parser();
	const output = through();
	const stream = duplexer(tap, output);

	tap.on("comment", (comment) => {
		// Log test group name
		if (!RESULT_COMMENTS.some((c) => comment.startsWith(c, 2)))
			output.push(`\n${pad()}${pico.underline(comment.trim().replace(/^(# )/, ""))}\n`);
	});

	tap.on("pass", (pass) => {
		output.push(`${pad(2)}${pico.green("✔")} ${pico.dim(pass.name)}\n`);
	});

	tap.on("fail", (fail) => {
		output.push(`${pad(2)}${pico.red(`✖ ${fail.name}`)}\n`);

		if (fail.diag) {
			const { actual, at, expected, operator } = fail.diag;
			const failure = [];

			if (["equal", "deepEqual"].includes(operator)) {
				// TODO: better diff for parsable objects
				if (typeof expected === "string" && typeof actual === "string") {
					const changes = Diff.diffChars(expected, actual);
					let diff = [];
					for (const part of changes) {
						let color = "reset";
						if (part.added) color = "bgGreen";
						if (part.removed) color = "bgRed";
						diff.push(`${pico[color](part.value)}`);
					}
					failure.push(diff.join("") + "\n");
				} else {
					failure.push(`operator: ${pico.red(operator)}\n`);
					failure.push(`expected: ${pico.green(expected)}\n`);
					failure.push(`actual: ${pico.red(actual)}\n\n`);
				}
			} else if (["notEqual", "notDeepEqual"].includes(operator)) {
				failure.push("Expected values to differ\n");
			} else if (operator === "ok") {
				failure.push(`Expected ${pico.green("truthy")} but got ${pico.red(actual)}\n`);
			} else if (operator === "match") {
				failure.push(`Expected ${pico.red(actual)} to match ${pico.blue(expected)}\n`);
			} else if (operator === "doesNotMatch") {
				failure.push(`Expected ${pico.red(actual)} to not match ${pico.blue(expected)}\n`);
			} else if (operator === "throws" && actual && actual !== "undefined") {
				// this combination is ~doesNotThrow
				failure.push(`Expected to not throw, received ${pico.red(actual)}\n`);
			} else if (operator === "throws") {
				failure.push("Expected to throw\n");
			} else if (expected && !actual) {
				failure.push(`Expected ${pico.red(operator)} but got nothing\n`);
			} else if (actual && !expected) {
				failure.push(`Expected ${pico.green("nothing")} but got ${pico.red(actual)}\n`);
			} else if (expected && actual) {
				failure.push(`Expected ${pico.green(expected)} but got ${pico.red(actual)}\n`);
			} else if (!expected && !actual) {
				failure.push(`operator: ${pico.red(operator)}\n`);
			} else {
				failure.push(`operator: ${pico.red(operator)}\n`);
				failure.push(`expected: ${pico.green(expected)}\n`);
				failure.push(`actual: ${pico.red(actual)}\n\n`);
			}

			if (at) failure.push(`${pad()}${pico.dim(`At: ${at}`)}`);

			failure.push("\n");

			output.push(pad(3) + failure.join(pad(3)));
		}
	});

	tap.on("skip", (skip) => {
		output.push(`${pad(2)}${pico.dim(`SKIP ${skip.name}`)}\n`);
	});

	tap.on("todo", (todo) => {
		const color = todo.ok ? "green" : "red";
		output.push(`${pad(2)}${pico[color]("TODO")} ${pico.dim(todo.name)}\n`);
	});

	tap.on("extra", (extra) => {
		output.push(`${pad(2)}${pico.yellow(`> ${extra}`)}`);
	});

	tap.on("complete", (result) => {
		stream.count = result.count;
		stream.failures = result.failures;

		if (result.fail > 0) {
			let failureSummary = "\n\n";
			failureSummary += `${pad()}${pico.red("Failed tests:")}`;
			failureSummary += ` There ${result.fail > 1 ? "were" : "was"} `;
			failureSummary += pico.red(result.fail);
			failureSummary += ` failure${result.fail > 1 ? "s" : ""}\n\n`;

			output.push(failureSummary);

			for (const failure of result.failures) {
				output.push(`${pad(2)}${pico.red("✖")} ${pico.dim(failure.name)}\n`);
			}
		}

		output.push(`\n${pad()}total:     ${result.count}\n`);
		if (result.pass > 0) output.push(pico.green(`${pad()}passing:   ${result.pass}\n`));
		if (result.fail > 0) output.push(pico.red(`${pad()}failing:   ${result.fail}\n`));
		if (result.skip > 0) output.push(`${pad()}skipped:   ${result.skip}\n`);
		if (result.todo > 0) output.push(`${pad()}todo:      ${result.todo}\n`);
		if (result.bailout) output.push(`${pad()}BAILED!\n`);

		output.end(`${pad()}duration:  ${Date.now() - start} ms\n\n`);
	});

	return stream;
};
