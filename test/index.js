const { exec } = require("child_process");
const fs = require("fs");
const test = require("tape");

function trimNLines(text, n) {
	const lines = text.split("\n");
	const trimmed = lines.splice(-1 * n);
	return [lines.join("\n"), trimmed];
}

test("tap-spek output matches snapshot", (t) => {
	const snapshot = fs.readFileSync(`${__dirname}/snapshots/mixed.txt`);
	const [trimmedSnapshot] = trimNLines(snapshot.toString(), 3);

	exec(
		`node ${__dirname}/create-mixed-tap.js | ${__dirname}/../bin/tap-spek`,
		(error, stdout, stderr) => {
			const [trimmedOut, durationLines] = trimNLines(stdout, 3);

			t.notOk(stderr, "stderr should be empty");
			t.equal(error.code, 1, "exit code 1 for failing tests");
			t.equal(trimmedOut, trimmedSnapshot, "output matches snapshot");
			t.match(durationLines.join(""), /[0-9]+\s[ms|s]/, "contains a duration");

			t.end();
		}
	);
});
