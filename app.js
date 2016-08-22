/**
 * http://usejsdoc.org/
 */

var winston = require("winston");
var log = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({'timestamp':function (){
    	  var d = new Date();
    	  return '['+('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)+':'+('0'+d.getSeconds()).slice(-2)+']';
      },'colorize':true})
    ]
});

var cfg = require('config.json');

if (!cfg.logConsole) {
	log.info("Removed logging to console!");
	log.remove(log.transports.Console);
}

if (cfg.logFile) {
	log.info("Added logging to file ("+cfg.logFilename+")");
	log.add(log.transports.File, { filename: cfg.logFilename, timestamp:true });
}
log.level = cfg.logLevel;


log.info('Loading libraries');

//here


/** App **/

//here