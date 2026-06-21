const fs = require("fs");
const path = require("path");

const logger = (req, res, next) => {

    const log = `
Time   : ${new Date().toLocaleString()}
Method : ${req.method}
URL    : ${req.originalUrl}
IP     : ${req.ip}
----------------------------------`;

    fs.appendFile(
        path.join(__dirname, "../logs/data.txt"),
        log,
        (err) => {
            if (err) console.log(err);
        }
    );

    next();
};

module.exports = logger;