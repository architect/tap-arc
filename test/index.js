const { exec } = require("child_process");
const fs = require("fs");
const test = require("tape");

function trimNLines(text, n) {
	const lines = text.split("\n");
	const trimmed = lines.splice(-1 * n);
	return [lines.join("\n"), trimmed];
}

for (const snapshot of ["mixed", "object", "passing", "simple"]) {
	test(`"${snapshot}" tap-spek output matches "${snapshot}" snapshot`, (t) => {
		const fullSnapshot = fs.readFileSync(`${__dirname}/snapshots/${snapshot}.txt`);
		const [trimmedSnapshot] = trimNLines(fullSnapshot.toString(), 3);

		exec(
			`node ${__dirname}/create-${snapshot}-tap.js | ${__dirname}/../bin/tap-spek`,
			(error, stdout, stderr) => {
				const [trimmedOut, durationLines] = trimNLines(stdout, 3);

				if (error) t.equal(error.code, 1, `exit code 1 for "${snapshot}" tests`);
				t.notOk(stderr, "stderr should be empty");
				t.equal(trimmedOut, trimmedSnapshot, "output matches snapshot");
				t.match(durationLines.join(""), /[0-9]+\s[ms|s]/, "contains a duration");

				t.end();
			}
		);
	});
}

test("passing tests do not error", (t) => {
	exec(
		`node ${__dirname}/create-passing-tap.js | ${__dirname}/../bin/tap-spek`,
		(error, stdout, stderr) => {
			t.notOk(error, "error should be undefined");
			t.notOk(stderr, "stderror should be empty");
			t.ok(stdout.indexOf("fail") < 0, '"fail" should not occur in output');
			t.end();
		}
	);
});
