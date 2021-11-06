const test = require("tape");

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

test("Immediate assertions", function (t) {
	t.plan(2);

	t.pass("The first one");
	t.pass("Number 2");
});

test("Some sleepy tests", async function (t) {
	t.pass("2 more immediate passing");
	t.pass("Then a line, then sleep 3s...");

	console.log("------");
	await sleep(3000);

	t.pass("3s has passed. Sleeping 5s");

	console.log("------");
	await sleep(5000);

	t.pass("Slept 5s. Going to next group immediately");
	t.end();
});

test("Some nested sleepy tests", async function (t) {
	t.test(async function (st) {
		st.pass("2 more immediate passing");
		st.pass("Then a line, then sleep 3s...");

		console.log("------");
		await sleep(3000);

		st.pass("3s has passed. Sleeping 5s");

		console.log("------");
		await sleep(5000);

		st.pass("Slept 5s. Going to next group immediately");
		st.end();
	}, "Nested tests");

	t.test(async function (st) {
		st.pass("2 more immediate passing");
		st.pass("Then a line, then sleep 3s...");

		console.log("------");
		await sleep(3000);

		st.pass("3s has passed. Sleeping 5s");

		console.log("------");
		await sleep(5000);

		st.pass("Slept 5s. Going to next group immediately");
		st.end();
	}, "Nested todo tests");
});
