exports.paul = {
	name: "Paul Atreides",
	title: "Duke",
	house: "Atreides",
	physical: {
		eyes: "hazel",
		hair: "black",
		height: 178,
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
};
exports.vladimir = {
	house: "Harkonnen",
	title: "Baron",
	died: null,
	async float() {
		return Promise.resolve("👻");
	},
};
exports.gurney = {
	house: "Atreides",
	died: undefined,
	fight() {
		return "👊";
	},
};
