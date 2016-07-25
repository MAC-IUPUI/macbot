function handle(res, env, id) {
    env.db.query(env.sql.WhoIsManager, [], function(err, rows) {
        if (err) {
            env.robot.logger.info(err.message);
            res.reply("There was an internal error. Sorry!");
            return;
        }
        var response = "\n";
        for (var i = 0; i < rows.length; i++) {
            response += "[" + rows[i].center + "] " + rows[i].firstName + " is working from " + rows[i].start + " to " + rows[i].end + "\n";
        }
        res.reply(response);
    });
}

module.exports = {
    "useIU": true,
    "regex": /.*manager today.*/i,
    "callback": handle
};
