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
	t.plan(1);

	t.ok(3 > 4 || 5 > 2);
});

test("negatives", function (t) {
	t.plan(3);
	t.notEqual(1 + 2, 5);
	t.notDeepEqual([1, 2], [12]);
	t.notOk(false);
});

test("empty map", function (t) {
	[].map(function (x) {
		t.fail("this callback should never fire");
	});

	t.end();
});

test("map with elements", function (t) {
	t.plan(2);

	[2, 3].map(function (x) {
		t.pass();
	});
});

test("more info", function (t) {
	t.plan(2);

	t.equal(1 + 2, 3, "basic arithmetic still works");
	t.ok(3 + 4 > 5, "inequalities are as we might expect");
});

test("asynchronous results", function (t) {
	t.plan(2);

	t.equal(2 + 3, 5);

	setTimeout(function () {
		t.equal(5 + 5, 10);
	}, 500);
});

test("nested", function (t) {
	t.test(function (st) {
		st.plan(1);
		st.equal(1 + 2, 3);
	});

	t.test(function (st) {
		st.plan(1);
		setTimeout(function () {
			st.pass();
		}, 100);
	});
});
