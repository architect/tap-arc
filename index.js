const Diff = require("diff");
const duplexify = require("duplexify");
const Parser = require("tap-parser");
const pc = require("picocolors");
const through = require("through2");
const { black, blue, bold, dim, green, red, underline, yellow } = pc;

const RESULT_COMMENTS = ["tests ", "pass ", "skip", "todo", "fail ", "failed ", "ok"];

function pad(count = 1) {
	return "  ".repeat(count);
}

function prettyMs(start) {
	const ms = Date.now() - start;
	return ms < 1000 ? `${ms} ms` : `${ms / 1000} s`;
}

module.exports = function spek() {
	const start = Date.now();
	const tap = new Parser();
	const output = through();
	const stream = duplexify(tap, output);

	tap.on("pass", (p) => output.push(`${pad(2)}${green("✔")} ${dim(p.name)}\n`));
	tap.on("extra", (e) => output.push(`${pad(2)}${yellow(`> ${e}`)}`));
	tap.on("skip", (s) => output.push(`${pad(2)}${dim(`SKIP ${s.name}`)}\n`));

	tap.on("comment", (comment) => {
		// Log test-group name
		if (!RESULT_COMMENTS.some((c) => comment.startsWith(c, 2)))
			output.push(`\n${pad()}${underline(comment.trimEnd().replace(/^(# )/, ""))}\n`);
	});

	tap.on("todo", (t) =>
		output.push(`${pad(2)}${pc[t.ok ? "yellow" : "red"]("TODO")} ${dim(t.name)}\n`)
	);

	tap.on("fail", (fail) => {
		output.push(`${pad(2)}${red("✖")} #${fail.id} ${red(fail.name)}\n`);

		if (fail.diag) {
			const { actual, at, expected, operator } = fail.diag;
			const msg = [];

			if (["equal", "deepEqual"].includes(operator)) {
				if (typeof expected === "string" && typeof actual === "string") {
					// TODO: test for parsable JSON
					const changes = Diff.diffChars(expected, actual);
					let diff = [];

					for (const part of changes) {
						let color = "reset";
						if (part.added) color = "bgGreen";
						if (part.removed) color = "bgRed";
						diff.push(`${black(pc[color](part.value))}`);
					}

					msg.push(diff.join("") + "\n");
				} else if (typeof expected === "object" && typeof actual === "object") {
					// probably an array
					const changes = Diff.diffJson(expected, actual);
					let diff = [];

					for (const part of changes) {
						const leadingSpace = part.value.match(/^[\s]+/) || "";
						let color = "reset";
						if (part.added) color = "bgGreen";
						if (part.removed) color = "bgRed";
						diff.push([leadingSpace, black(pc[color](part.value.trim())), "\n"].join(""));
					}

					msg.push(`${diff.join("").replace(/\n/g, `\n${pad(3)}`)}\n`);
				} else if (typeof expected === "number" || typeof actual === "number") {
					msg.push(`Expected ${green(expected)} but got ${red(actual)}\n`);
				} else {
					// mixed types
					msg.push(`operator: ${red(operator)}\n`);
					msg.push(`expected: ${green(expected)} <${typeof expected}>\n`);
					msg.push(`actual: ${red(actual)} <${typeof actual}>\n`);
				}
			} else if (["notEqual", "notDeepEqual"].includes(operator)) {
				msg.push("Expected values to differ\n");
			} else if (operator === "ok") {
				msg.push(`Expected ${green("truthy")} but got ${red(actual)}\n`);
			} else if (operator === "match") {
				msg.push(`Expected ${red(actual)} to match ${blue(expected)}\n`);
			} else if (operator === "doesNotMatch") {
				msg.push(`Expected ${red(actual)} to not match ${blue(expected)}\n`);
			} else if (operator === "throws" && actual && actual !== "undefined") {
				// this combination is ~doesNotThrow
				msg.push(`Expected to not throw, received "${red(actual)}"\n`);
			} else if (operator === "throws") {
				msg.push("Expected to throw\n");
			} else if (operator === "error") {
				msg.push(`Expected error to be ${green("falsy")}\n`);
			} else if (operator === "fail") {
				msg.push("Explicit fail\n");
			} else if (expected && !actual) {
				msg.push(`Expected ${red(operator)} but got nothing\n`);
			} else if (actual && !expected) {
				msg.push(`Expected ${green("nothing")} but got ${red(actual)}\n`);
			} else if (expected && actual) {
				msg.push(`Expected ${green(expected)} but got ${red(actual)}\n`);
			} else if (!expected && !actual) {
				msg.push(`operator: ${red(operator)}\n`);
			} else {
				// unlikely
				msg.push(`operator: ${red(operator)}\n`);
				msg.push(`expected: ${green(expected)}\n`);
				msg.push(`actual: ${red(actual)}\n`);
			}

			if (at) msg.push(`${dim(`At: ${at.replace(process.cwd(), "")}`)}`);

			msg.push("\n\n");

			output.push(pad(3) + msg.join(pad(3)));
		}
	});

	tap.on("complete", (result) => {
		stream.count = result.count;
		stream.failures = result.failures;

		if (!result.ok && result.fail > 0) {
			let failureSummary = "\n\n";
			failureSummary += `${pad()}${red("Failed tests:")}`;
			failureSummary += ` There ${result.fail > 1 ? "were" : "was"} `;
			failureSummary += red(result.fail);
			failureSummary += ` failure${result.fail > 1 ? "s" : ""}\n\n`;

			output.push(failureSummary);

			for (const fail of result.failures) {
				output.push(`${pad(2)}${red("✖")} #${fail.id} ${dim(fail.name)}\n`);
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
