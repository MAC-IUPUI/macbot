var fs = require("fs");
var mysql = require("mysql");
var env = {
    config: null,
    db: null,
    data: null,
    sql: {},
    robot: null
};

env.saveData = function() {
    fs.writeFileSync("./data.json", JSON.stringify(env.data));
};

env.loadData = function() {
    try {
        fs.accessSync("./data.json");
    } catch (ex) {
        fs.writeFileSync("./data.json", "{}");
    }
    env.data = JSON.parse(fs.readFileSync("./data.json"));
    if (!env.data.users) {
        env.data.users = {}; // {slackUsername : iuUsername}
    }
    env.saveData();
};

env.getPersonFromSlack = function(slackName, callback) {
    if (env.data.users[slackName]) { // already found and cached
        callback(env.data.users[slackName]);
        return;
    }
    env.db.query("SELECT id FROM Person WHERE username = ?", [slackName], function(err, rows) {
        if (err) {
            env.robot.logger.info(err.message);
            callback(null);
            return;
        }
        if (rows.length === 0) {
            callback(null);
            return;
        }
        env.data.users[slackName] = rows[0].id;
        env.saveData();
        callback(rows[0].id);
    });
};

env.onMessage = function(callback) {
    return function(res) {
        env.getPersonFromSlack(res.message.user.name, function(id) {
            if (id === null) {
                res.reply("Tell me what your IU username is, like this: \"@macbot my username is YOUR_USERNAME_HERE_PLEASE_THANKS\"");
                return;
            }
            callback(res, env, id);
        });
    };
};

env.loadSQL = function() {
    var files = fs.readdirSync("./sql");
    for (var i = 0; i < files.length; i++) {
        env.sql[files[i].split(".")[0]] = fs.readFileSync("./sql/" + files[i]).toString();
    }
};

env.loadDatabase = function() {
    env.db = mysql.createConnection(env.config.db);
    env.db.on("error", function(err) {
        env.robot.logger.info("Database error: " + err.code);
    });
    env.db.connect(function(err) {
        if (err) {
            env.robot.logger.info("Error connecting to MAC database: " + err.code);
        } else {
            env.robot.logger.info("MAC database connected.");
        }
    });
};

env.loadHandlers = function() {
    var files = fs.readdirSync("./handlers");
    for (var i = 0; i < files.length; i++) {
        var handler = require("../handlers/" + files[i]);
        var callback = handler.useIU ? env.onMessage(handler.callback) : handler.callback;
        env.robot.respond(handler.regex, callback);
    }
};

module.exports = function(robot) {
    env.config = JSON.parse(fs.readFileSync("./config/config.json").toString());
    env.robot = robot;
    env.loadSQL();
    env.loadData();
    env.loadDatabase();
    env.loadHandlers();
};
