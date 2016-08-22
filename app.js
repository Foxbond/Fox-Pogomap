/**
 * http://usejsdoc.org/
 */


/** Pre-init ***********************************************************************/
var winston = require("winston");
var log = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({'timestamp':function (){
    	  var d = new Date();
    	  return '['+('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)+':'+('0'+d.getSeconds()).slice(-2)+']';
      },'colorize':true, prettyPrint:true})
    ]
});

var spaceStore = '                                                                                                           ';

function strAlign (str, len) {
	if (str.length > len){
		return str.substring(0, (len-3))+'...';
	}
	return str+spaceStore.substring(0,(len-str.length));
}

/** Config ***************************************************************************/
var cfg = require('./config.json');


/** Init *****************************************************************************/
if (!cfg.logConsole) {
	log.info("Removed logging to console!");
	log.remove(log.transports.Console);
}

if (cfg.logFile) {
	log.info("Added logging to file ("+cfg.logFilename+")");
	log.add(log.transports.File, { filename: cfg.logFilename, timestamp:true, colorize:false, json:true, prettyPrint:false });
}
log.info('Logging level set to: '+cfg.logLevel);
log.level = cfg.logLevel;


/** Beautifier **/
if (cfg.logBeautifier) {
	log.filters.push(function(level, msg, meta) {
		if (typeof meta !== 'undefined'){
			if (typeof meta.module !== 'undefined') {
				var str = '['+strAlign(meta.module, cfg.logBeautifierLen)+'] '+msg;
				delete meta.module;
				return str;
			}
		}
		return msg;
	});
	
	log.info('Active', {module:'Beautifier'});
}

//hacky addon
var l = function (level, module, msg, meta) {
	if (typeof meta === 'undefined') {
		meta = {'module':module};
	}else if (typeof meta === 'object'){
		meta.module = module;
	}else{
		msg = module+':'+msg;
	}
	log.log(level, msg, meta);
};

/** Libs *****************************************************************************/
log.info('Loading libraries', {module:'root'});
var mysql = require('mysql');


/** App ******************************************************************************/

var db = mysql.createConnection(cfg.db.dev);

db.connect(function(err) {
	if (err) {
		l('error', 'Database', 'Connecting failed!', err);
		return;
	}
	
	l('info', 'Database', 'Connected as #'+db.threadId);
});

var Pokeio = require('pokemon-go-node-api');
var a = new Pokeio.Pokeio();

a.init('pgofandx1', 'plmokm123', {'type':'coords',coords:{latitude:52.170891, longitude:22.291843}}, 'ptc', function(err) {
    if (err) throw err;

    log.info('1[i] Current location: ' + a.playerInfo.locationName);
    log.info('1[i] lat/long/alt: : ' + a.playerInfo.latitude + ' ' + a.playerInfo.longitude + ' ' + a.playerInfo.altitude);

    a.GetProfile(function(err, profile) {
        if (err) throw err;

        log.info('1[i] Username: ' + profile.username);
        log.info('1[i] Poke Storage: ' + profile.poke_storage);
        log.info('1[i] Item Storage: ' + profile.item_storage);

        var poke = 0;
        if (profile.currency[0].amount) {
            poke = profile.currency[0].amount;
        }

        log.info('1[i] Pokecoin: ' + poke);
        log.info('1[i] Stardust: ' + profile.currency[1].amount);

        setInterval(function(){
            a.Heartbeat(function(err,hb) {
                if(err) {
                    log.info(err);
                }

                for (var i = hb.cells.length - 1; i >= 0; i--) {
                    if(hb.cells[i].NearbyPokemon[0]) {
                        //log.info(a.pokemonlist[0])
                        var pokemon = a.pokemonlist[parseInt(hb.cells[i].NearbyPokemon[0].PokedexNumber)-1];
                        log.info('1[+] There is a ' + pokemon.name + ' near.');
                    }
                }

            });
        }, 5000);

    });
});
