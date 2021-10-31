// Adapted from testling's tape guide
// https://ci.testling.com/guide/tape

var test = require("tape");

test("basic arithmetic", function (t) {
	t.equal(2 + 3, 5);
	t.equal(7 * 8 + 10, 666);

	t.end();
});

test("deep equality", function (t) {
	t.plan(4);

	t.deepEqual([3, 4, 5], [3, 4, 2 + 3], "An Array pass");
	t.deepEqual(
		{ a: 7, b: [8, 9] },
		{ a: 3 + 4, b: [4 * 2].concat(3 * 3) },
		"And Object pass"
	);
	t.deepEqual([3, 4, 6], [3, 4, 2 + 3], "An Array failure");
	t.deepEqual(
		{ a: 7, b: [8, 9] },
		{ a: 3 + 4, b: [4 * 3].concat(3 * 3) },
		"An Object failure"
	);
});

test("comparing booleans", function (t) {
	t.plan(2);

	t.ok(3 > 4 || 5 > 2, "A passing Boolean");
	t.ok(3 > 4 || 2 > 5, "A failing Boolean");
});

test("negatives", function (t) {
	t.plan(2);
	t.notOk(false, "A passing !Boolean");
	t.notOk(true, "A failing !Boolean");
});

test("map with elements", function (t) {
	t.plan(3);

	[2, 3].map(function (x) {
		t.pass("Simple pass");
	});

	[1].map(function (x) {
		t.fail("this callback should never fire");
	});

	t.end();
});

test("nested", function (t) {
	t.test(function (st) {
		st.plan(1);
		st.equal(1 + 2, 3, "Sub-test pass");
	});

	t.test(function (st) {
		st.plan(2);
		setTimeout(function () {
			st.pass("Delayed sub-test pass");
			st.fail("Delayed sub-test fail");
		}, 100);
	}, "Delayed sub-test");
});
