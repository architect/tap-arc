const test = require("tape");
const { duncan, gurney, paul, vladimir } = require("./characters.js");

test("create 'todo' tests", { todo: true }, (t) => {
	t.plan(1);
	t.ok(vladimir);
});

test("create ok and notOk, some without messages", (t) => {
	t.plan(2);
	t.ok(duncan.died);
	t.notOk(paul.died, "Sand power");
});

test("create equal, notEqual, and pass", (t) => {
	t.plan(3);
	t.equal(paul.house, duncan.house, "Atreides bros");
	t.notEqual(
		paul.physical.height,
		duncan.physical.height,
		"Different statures"
	);
	t.pass("the spice");
});

test("create match, doesNotMatch, and skip", (t) => {
	t.plan(3);
	t.match(duncan.title, /master|sword/, "Duncan is a master of the sword");
	t.skip("WIP");
	t.doesNotMatch(gurney.house, /a+/, "A+");
});

test("create deepEqual, notDeepEqual, comment, and a log", (t) => {
	t.plan(2);
	t.deepEqual(paul, { ...paul }, "Begun, the clone wars have.");
	console.log("Wrong universe");
	t.notDeepEqual(gurney, duncan, "but Gurney isn't Duncan");
});

test("create throws, doesNotThrow, and fail", async (t) => {
	t.plan(3);
	t.throws(() => paul.fight(), "Kick rocks");
	t.doesNotThrow(() => gurney.fight(), "Thanks other dad");
	t.pass("fin");
});
