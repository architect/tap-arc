const duplexer = require("duplexer3");
const Parser = require("tap-parser");
const pico = require("picocolors");
const through = require("through2");

const RESULT_COMMENTS = ["tests ", "pass ", "skip", "todo", "fail ", "failed ", "ok"];

function indent(count) {
	const INDENT = "  ";
	return INDENT.repeat(count);
}

module.exports = function spek() {
	const start = new Date();
	const tap = new Parser();
	const output = through();
	const stream = duplexer(tap, output);

	tap.on("comment", (comment) => {
		if (!RESULT_COMMENTS.some((c) => comment.includes(c, 2)))
			output.push(`\n${indent(1)}${pico.underline(comment.replace(/^(# )/, ""))}\n`);
	});

	tap.on("pass", (pass) => {
		output.push(`${indent(2)}${pico.green("✔")} ${pico.dim(pass.name)}\n`);
	});

	tap.on("fail", (fail) => {
		output.push(`${indent(2)}${pico.red(`✖ ${fail.name}`)}\n`);

		if (fail.diag) {
			output.push(`${indent(3)}operator: ${pico.red(fail.diag.operator)}\n`);
			output.push(`${indent(3)}expected: ${pico.red(fail.diag.expected)}\n`);
			output.push(`${indent(3)}actual: ${pico.red(fail.diag.actual)}\n`);
			output.push(`${indent(3)}${pico.dim(fail.diag.at)}\n\n`);
		}
	});

	tap.on("complete", (result) => {
		stream.count = result.count;
		stream.failures = result.failures;

		if (result.fail > 0) {
			let failureSummary = "\n\n";
			failureSummary += `${indent(1)}${pico.red("Failed tests:")}`;
			failureSummary += ` There ${result.fail > 1 ? "were" : "was"} `;
			failureSummary += pico.red(result.fail);
			failureSummary += ` failure${result.fail > 1 ? "s" : ""}\n\n`;

			output.push(failureSummary);

			for (const failure of result.failures) {
				output.push(`${indent(2)}${pico.red("✖")} ${pico.dim(failure.name)}\n`);
			}
		}

		output.push(`\n${indent(1)}total:     ${result.count}\n`);
		if (result.pass > 0) output.push(pico.green(`${indent(1)}passing:   ${result.pass}\n`));
		if (result.fail > 0) output.push(pico.red(`${indent(1)}failing:   ${result.fail}\n`));
		if (result.skip > 0) output.push(`${indent(1)}skipped:   ${result.skip}\n`);
		if (result.todo > 0) output.push(`${indent(1)}todo:      ${result.todo}\n`);
		if (result.bailout) output.push(`${indent(1)}BAILED!\n`);

		output.end(`${indent(1)}duration:  ${new Date() - start} ms\n\n`);
	});

	return stream;
};
