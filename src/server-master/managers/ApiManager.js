/*
 * @author ohmed
 * Server api methods layer
*/

var GarageConfig = require('./../core/GarageConfig.js');

//

var ApiManager = {

    getStats: function ( req, res ) {

        var info = [];

        for ( var aid in DT.arenaServersManager.arenaServers ) {

            var arenaServer = DT.arenaServersManager.arenaServers[ aid ];

            info.push({
                id:             arenaServer.aid,
                ip:             arenaServer.ip,
                players:        arenaServer.players,
                bots:           arenaServer.bots,
                boxes:          arenaServer.boxes,
                bullets:        arenaServer.bullets,
                cannonObjects:  arenaServer.cannonObjects,
                arenas:         arenaServer.arenas
            });

        }

        return res.send( info );

    },

    getFreeArena: function ( req, res ) {

        var arena = DT.arenaServersManager.getFreeServer();

        if ( ! arena ) {

            return res.send({ error: 1, 'message': 'No available arenas.' });

        } else {

            return res.send( arena );

        }

    },

    getTopPlayers: function ( req, res ) {

        DT.playerManager.getTopBoard( function ( playersTop ) {

            return res.send( playersTop );

        });

    },

    getGarageObjects: function ( req, res ) {

        return res.send( GarageConfig );

    },

    buyObject: function ( req, res ) {

        var pid = req.cookies['dt-pid'];
        var objectId = req.params.oid;
        var objectType = req.params.type;

        //

        DT.playerManager.buyObject( pid, objectType, objectId, function ( result, message ) {

            return res.send({ success: result, message: message });

        });

    },

    upgradeObject: function ( req, res ) {

        var pid = req.cookies['dt-pid'];
        var objectId = req.params.oid;
        var objectType = req.params.type;

        //

        DT.playerManager.upgradeObject( pid, objectType, objectId, function ( result, message ) {

            return res.send({ success: result, message: message });

        });

    },

    authCheck: function ( req, res, next ) {

        var pid = req.cookies['dt-pid'];
        var sid = req.cookies['dt-sid'];

        //

        DT.playerManager.authCheck( pid, sid, function () {

            return next();

        }, function () {

            return res.send({ error: 'bad auth' });

        });

    }

};

//

module.exports = ApiManager;
