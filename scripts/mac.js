var fs = require("fs");
var mysql = require("mysql");
var config;
var db;
var data;
var robot;

function saveData() {
    fs.writeFileSync("./data.json", JSON.stringify(data));
}

function loadData() {
    try {
        fs.accessSync("./data.json");
    } catch (ex) {
        fs.writeFileSync("./data.json", "{}");
    }
    data = JSON.parse(fs.readFileSync("./data.json"));
    if (!data.users) {
        data.users = {}; // {slackUsername : iuUsername}
    }
    saveData();
}

function getPersonFromSlack(slackName, callback) {
    if (data.users[slackName]) { // already found and cached
        callback(data.users[slackName]);
        return;
    }
    db.query("SELECT id FROM Person WHERE username = ?", [slackName], function(err, rows) {
        if (err) {
            robot.logger.info(err.message);
            callback(null);
            return;
        }
        if (rows.length === 0) {
            callback(null);
            return;
        }
        data.users[slackName] = rows[0].id;
        saveData();
        callback(rows[0].id);
    });
}

function onClarify(res) {
    getPersonFromSlack(res.match[1], function(id) {
        if (id === null) {
            res.reply("Still not sure what your username is. Please contact a dev for help!");
            return;
        }
        data.users[res.message.user.name] = id;
        saveData();
        res.reply("Thanks! Your IU username is " + res.match[1] + ".");
    });
}

function onWorkingWithMe(res) {
    getPersonFromSlack(res.message.user.name, function(id) {
        if (id === null) {
            res.reply("Tell me what your IU username is, like this: \"@macbot my username is YOUR_USERNAME_HERE_PLEASE_THANKS\"");
            return;
        }
        res.reply("Hello, " + id);
        // do stuff here
    });
}

var commands = [
    {
        "regex": /.*working with me today.*/i,
        "callback": onWorkingWithMe,
        "type": "respond"
    },
    {
        "regex": /my username is ([a-zA-Z0-9]+)/i,
        "callback": onClarify,
        "type": "respond"
    }
];

module.exports = function(_robot) {
    config = JSON.parse(fs.readFileSync("./config/config.json").toString());
    loadData();
    robot = _robot;
    db = mysql.createConnection(config.db);
    db.on("error", function(err) {
        robot.logger.info("Database error: " + err.code);
    });
    db.connect(function(err) {
        if (err) {
            robot.logger.info("Error connecting to MAC database: " + err.code);
        } else {
            robot.logger.info("MAC database connected.");
        }
    });
    for (var i = 0; i < commands.length; i++) {
        (robot[commands[i].type])(commands[i].regex, commands[i].callback);
    }
};
