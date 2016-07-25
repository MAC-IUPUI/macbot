var fs = require("fs");

function handle(res, env) {
    var slothUrl = env.sloths[env.getRandomInt(0, env.sloths.length)];
    res.reply(slothUrl);
}

function init(env) {
    env.sloths = JSON.parse(fs.readFileSync("./config/sloths.json").toString());
}

module.exports = {
    "useIU": false,
    "regex": /.*sloth me.*/i,
    "callback": handle,
    "init": init
};
