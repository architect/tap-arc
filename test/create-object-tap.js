const test = require("tape");
const { paul, duncan, gurney, vladimir } = require("./characters");

test("Object deepEqual fail", function (t) {
	t.deepEqual(paul, duncan, "Bros");
	t.deepEqual(gurney, vladimir, "Not bros");
	t.end();
});
