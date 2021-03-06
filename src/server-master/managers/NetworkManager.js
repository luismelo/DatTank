/*
 * @author ohmed
 * DatTank master-server network manager
*/

var http = require('http');
var https = require('https');
var express = require('express');
var compression = require('compression');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var MongoStore = require('connect-mongo')( session );
var nunjucks = require('nunjucks');
var fs = require('fs');

var ApiManager = require('./ApiManager');

//

var NetworkManager = function () {

    this.app = false;
    this.server = false;

    //

    this.init();

};

NetworkManager.prototype = {};

//

NetworkManager.prototype.init = function () {

    this.app = express();
    this.server = http.createServer( this.app );

    // redirect http -> https

    this.app.use( ( req, res, next ) => {

        if ( req.get('host') === 'beta.dattank.com' ) {

            return res.redirect( 'https://dattank.io' + req.url );

        }

        if ( ! req.secure && req.get('x-forwarded-proto') !== 'https' && environment.name === 'Production environment' ) {

            return res.redirect( 'https://' + req.get('host') + req.url );

        }

        return next();

    });

    //

    this.app.use( cookieParser() );
    this.app.use( bodyParser.urlencoded({ extended: false }) );
    this.app.use( passport.initialize() );
    this.app.use( passport.session() );

    // setuping fb-passport for login sys

    this.app.use( session({
        secret: 'aloha secret unicorns06',
        maxAge: new Date( Date.now() + 365 * 24 * 3600000 ), // 1 year
        resave: true,
        saveUninitialized: true,
        store: new MongoStore( { mongooseConnection: DB.mongoose.connection }, function ( err ) {

            console.log( err || 'connect-mongodb setup ok' );

        })
    }) );

    passport.serializeUser( function ( user, done ) {

        done( null, user );

    });

    passport.deserializeUser( function ( obj, done ) {

        done( null, obj );

    });

    passport.use( new FacebookStrategy({
        clientID: environment.fbApp.key,
        clientSecret: environment.fbApp.secret,
        callbackURL: environment.fbApp.cbUrl
    }, function ( accessToken, refreshToken, profile, done ) {

        process.nextTick( function () {

            return done( null, profile );

        });

    }));

    nunjucks.configure( __dirname + '/../../client/views', {
        autoescape: true,
        express: this.app
    });

    this.app.get( '/', function ( req, res ) {

        var pid = req.cookies['dt-pid'];
        var sid = req.cookies['dt-sid'];

        if ( ! pid || ! sid ) {

            DT.playerManager.register( ( params ) => {

                res.cookie( 'dt-pid', params.pid, { maxAge: 365 * 24 * 1000 * 3600 });
                res.cookie( 'dt-sid', params.sid, { maxAge: 365 * 24 * 1000 * 3600 });
                return res.render( 'index.html', params );

            });

        } else {

            DT.playerManager.auth( pid, sid, ( params ) => {

                res.cookie( 'dt-pid', params.pid, { maxAge: 365 * 24 * 1000 * 3600 });
                res.cookie( 'dt-sid', params.sid, { maxAge: 365 * 24 * 1000 * 3600 });
                return res.render( 'index.html', params );

            });

        }

    });

    this.app.get( '/auth/facebook', passport.authenticate('facebook', {
        scope : [ 'public_profile', 'email' ]
    }));

    this.app.get('/auth/facebook/callback', passport.authenticate( 'facebook', {
        failureRedirect: '/login'
    }), function ( req, res ) {

        var pid = req.cookies['dt-pid'];
        var sid = req.cookies['dt-sid'];
        var fbUser = req.user;

        DT.playerManager.linkFB( pid, sid, fbUser, ( pid, sid ) => {

            res.cookie( 'dt-pid', pid, { maxAge: 900000 });
            res.cookie( 'dt-sid', sid, { maxAge: 900000 });
            res.redirect('/');

        });

    });

    this.app.get( '/logout', function ( req, res ) {

        req.logout();
        res.clearCookie('dt-pid');
        res.clearCookie('dt-sid');
        res.redirect('/');

    });

    // handling requests from clients

    this.app.get( '/api/stats', ApiManager.getStats );
    this.app.get( '/api/getFreeArena', ApiManager.getFreeArena );
    this.app.get( '/api/getTopPlayers', ApiManager.getTopPlayers );
    this.app.get( '/api/garage/getObjects', ApiManager.getGarageObjects );
    this.app.post( '/api/garage/buyObject/:type/:oid', ApiManager.authCheck, ApiManager.buyObject );
    this.app.post( '/api/garage/upgradeObject/:type/:oid', ApiManager.authCheck, ApiManager.upgradeObject );

    //

    this.app.use( compression() );
    this.app.use( express.static( __dirname + './../../client' ) );

    this.app.use( '/terms', express.static( __dirname + './../../client/terms.html') );
    this.app.use( '/policy', express.static( __dirname + './../../client/policy.html') );
    this.app.use( '/changelog', express.static( __dirname + './../../client/changelog.html') );
    this.app.use( '/*', express.static( __dirname + './../../client/notfound.html') );

    //

    this.server.listen( environment.web.port );

    // HTTPS

    if ( environment.name === 'Production environment' ) {

        // certificate

        const privateKey = fs.readFileSync('/etc/letsencrypt/live/dattank.io/privkey.pem', 'utf8');
        const certificate = fs.readFileSync('/etc/letsencrypt/live/dattank.io/cert.pem', 'utf8');
        const ca = fs.readFileSync('/etc/letsencrypt/live/dattank.io/chain.pem', 'utf8');

        const credentials = {
            key: privateKey,
            cert: certificate,
            ca: ca
        };

        // Starting both http & https servers

        const httpsServer = https.createServer( credentials, this.app );
        httpsServer.listen( 443 );

    }

};

//

module.exports = NetworkManager;
