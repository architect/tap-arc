const test = require("tape");

test("Object deepEqual fail", function (t) {
	t.deepEqual(
		["foo", "bar", "baz", "thing"],
		["foo", "bar", "foobar baz"],
		"Single dimension array failure"
	);
	t.deepEqual(
		{ a: "foo", b: [11, 9], c: { foo: "bar" } },
		{ a: "bar", b: [12, 9], c: "foobar" },
		"A small object deepEqual failure"
	);
	t.deepEqual(
		{
			name: "Gurney",
			house: "Atreides",
			play: () => {
				"🎸";
			},
		},
		{
			name: "Duncan",
			house: "Atreides",
			fight: () => {
				"⚔️";
			},
		},
		"Object with fn deepEqual failure will be diffed as a string"
	);
	t.end();
});
