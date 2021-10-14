const duplexer = require("duplexer3");
const Parser = require("tap-parser");
const pico = require("picocolors");
const through = require("through2");

const RESULT_COMMENTS = ["# tests ", "# pass ", "# fail ", "# failed ", "# ok"];

module.exports = function () {
	const start = new Date();
	const tap = new Parser();
	const output = through();
	const stream = duplexer(tap, output);

	tap.on("comment", (comment) => {
		if (!RESULT_COMMENTS.some((c) => comment.includes(c, 0)))
			output.push(`\n${pico.underline(comment.replace(/^(# )/, ""))}\n`);
	});

	tap.on("pass", (pass) => {
		output.push(`  ${pico.green("✔")} ${pico.dim(pass.name)}\n`);
	});

	tap.on("complete", (result) => {
		stream.count = result.count;
		stream.failures = result.failures;

		if (result.fail > 0) {
			let failureSummary = "\n\n";
			failureSummary += pico.red("Failed tests:");
			failureSummary += " There were ";
			failureSummary += pico.red(result.fail);
			failureSummary += " failures\n\n";

			output.push(failureSummary);

			for (const failure of result.failures) {
				output.push(`  ${pico.red("✖")} ${pico.dim(failure.name)}\n`);
			}
		}

		output.push(`\ntotal:    ${result.count}\n`);
		if (result.pass > 0) output.push(pico.green(`passing:  ${result.pass}\n`));
		if (result.fail > 0) output.push(pico.red(`failing:  ${result.fail}\n`));
		if (result.skip > 0) output.push(`skipped:  ${result.skip}\n`);
		if (result.todo > 0) output.push(`todo:     ${result.todo}\n`);
		if (result.bailout) output.push(`BAILED!\n`);

		output.end(`duration: ${new Date() - start} ms\n`);
	});

	return stream;
};
