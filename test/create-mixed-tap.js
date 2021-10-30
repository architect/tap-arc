const test = require("tape");
const { duncan, gurney, paul, vladimir } = require("./characters.js");

test("create 'todo' tests", { todo: true }, (t) => {
	t.plan(2);

	t.ok(duncan.name); // pass without message
	t.true(gurney.name); // fail without message
});

test("create ok and notOk, some without messages", (t) => {
	t.plan(4); // correct plan count

	t.ok(duncan.died); // pass without message
	t.true(gurney.died); // fail without message
	t.notOk(paul.died, "Sand power"); // pass
	t.false(duncan.died, "Idaho is still kickin'"); // fail
});

test("create equal, notEqual, and pass", (t) => {
	t.plan(6); // incorrect plan count

	t.equal(paul.house, duncan.house, "Atreides bros"); // pass
	t.is(paul.title, duncan.title, "Same stations in their house"); // fail
	t.notEqual(
		paul.physical.height,
		duncan.physical.height,
		"Different statures"
	); // pass
	t.isNot(duncan.house, gurney.house, "Not great roommates"); // fail
	t.pass("the spice");

	t.end();
});

test("create match, doesNotMatch, and skip", (t) => {
	t.plan(5);

	t.match(duncan.title, /master|sword/, "Duncan is a master of the sword"); // pass
	t.match(paul.physical.eyes, /[0-9]/, "Paul's eyes are a number"); // fail
	t.skip("WIP");
	t.doesNotMatch(gurney.house, /a+/, "A+"); // pass
	t.doesNotMatch(vladimir.house, /^[A-Z]/, "harkonnen is not a proper noun"); // fail
});

test("create deepEqual, notDeepEqual, comment, and a log", (t) => {
	t.plan(4);

	t.deepEqual(paul, { ...paul }, "Begun, the clone wars have."); // pass
	console.log("Wrong universe");
	t.same(duncan.physical, paul.physical, "Samesies!"); // fail
	t.notDeepEqual(gurney, duncan, "but Gurney isn't Duncan"); // pass
	t.notSame(vladimir, vladimir, "I am Vlad"); // fail

	t.end();
});

test("create throws, doesNotThrow, and fail", async (t) => {
	t.plan(5);

	t.throws(() => paul.fight(), "Kick rocks"); // pass
	t.throws(async () => await vladimir.fight(), "Floaty boi"); // fail
	t.doesNotThrow(() => gurney.fight(), "Thanks other dad"); // pass
	t.doesNotThrow(() => duncan.fight(), "Can't fight if you're dead"); // fail
	t.fail("fin");
});
