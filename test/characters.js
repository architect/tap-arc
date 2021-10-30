exports.paul = {
	name: "Paul Atreides",
	title: "Duke",
	house: "Atreides",
	physical: {
		eyes: "hazel",
		hair: "black",
		height: 178,
	},
	fight() {
		throw "pound sand";
	},
};
exports.duncan = {
	name: "Duncan Idaho",
	title: "Swordmaster",
	house: "Atreides",
	physical: {
		eyes: "green",
		hair: "brown",
		height: 193,
	},
	died: "10191 AG", // spoilers!
	fight() {
		throw new Error("⚔️");
	},
};
exports.vladimir = {
	house: "Harkonnen",
	title: "Baron",
	died: null,
	async fight() {
		return Promise.resolve("👻");
	},
};
exports.gurney = {
	house: "Atreides",
	fight() {
		return "👊";
	},
};
