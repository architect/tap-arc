const { exec } = require("child_process");
const { scripts } = require("../package.json");

const commands = Object.keys(scripts).filter((key) => key.indexOf("spek:") === 0);

for (const command of commands) {
	const name = command.split(":")[1];

	exec(`npm run --silent ${command} > test/snapshots/${name}.txt`, (_error, _stdout, stderr) => {
		if (stderr) console.log(`Unexpected stderror: ${stderr}`);
		console.log(`Snapped ${name}`);
	});
}