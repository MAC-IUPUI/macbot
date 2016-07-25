function handle(res, env) {
    env.getPersonFromSlack(res.match[1], function(id) {
        if (id === null) {
            res.reply("Still not sure what your username is. Please contact a dev for help!");
            return;
        }
        env.data.users[res.message.user.name] = id;
        env.saveData();
        res.reply("Thanks! Your IU username is " + res.match[1] + ".");
    });
}

module.exports = {
    "useIU": false,
    "regex": /my username is ([a-zA-Z0-9]+)/i,
    "callback": handle
};
