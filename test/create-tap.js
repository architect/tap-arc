const test = require("tape");

test("Sample passing tests", function (t) {
	t.plan(5);

	t.match("Idaho", /^[a-zA-z]{5}$/, "Sub-test match pass");
	console.log("Arbitrary logs supported");
	t.doesNotMatch("Gurney", /^G[a-zA-Z]y$/, "Sub-test doesNotMatch pass");
	t.deepEqual([3, 4, 5], [3, 4, 2 + 3], "A deeply equal array");
	t.skip("A skipped test", 2, [3]);
	t.deepEqual({ a: 7, b: [8, 9] }, { a: 3 + 4, b: [4 * 2].concat(3 * 3) }, "A deeply equal object");
});

test("Some failing tests", function (t) {
	t.plan(4);

	t.equal(7 * 8 + 10, 666);
	t.deepEqual(
		{ a: "foo", b: [11, 9] },
		{ a: "bar", b: [4 * 3].concat(3 * 3) },
		"An small object deepEqual failure"
	);
	console.log("Large object diff: WIP");

	t.test(function (st) {
		st.match("atreides", /^A/, "Sub-test match fail");
		st.deepEqual(["foo", "bar", "baz"], ["foo", "bar", "foobar baz"], "An array failure");
		st.end();
	}, "Nested tests");

	t.test(
		function (st) {
			st.pass("Passing TODOs are yellow");
			st.fail("Failing TODOs are red");
			st.end();
		},
		{ todo: true },
		"Nested todo tests"
	);
});
