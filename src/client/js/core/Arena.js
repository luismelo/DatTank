/*
 * @author ohmed
 * DatTank Arena object
*/

DT.Arena = function () {

    this.players = [];
    this.teams = [];
    this.me = false;

    //

    this.resetTime = false;
    this.currentTime = false;
    this.time = false;

    this.timeInterval = false;

    //

    this.pathFinder = new DT.PathFinder();

};

DT.Arena.prototype = {};

DT.Arena.prototype.init = function ( params ) {

    this.id = params.id;
    this.reset( params );

};

DT.Arena.prototype.updateTime = function () {

    this.time = this.time + 1000;

    ui.updateArenaTime( Math.floor( this.time / 1000 ) );

};

DT.Arena.prototype.clear = function () {

    this.teams = [];

    for ( var i = 0, il = this.players.length; i < il; i ++ ) {

        this.players[ i ].dispose();

    }

    this.players = [];

};

DT.Arena.prototype.reset = function ( params ) {

    this.me = ( params.me !== undefined ) ? params.me : false;

    // init obstacles

    this.pathFinder.reset();
    ui.clearKills();

    view.addObsticles( params.obstacles );

    // add / init existing players

    for ( var i = 0, il = params.players.length; i < il; i ++ ) {

        var playerParams = params.players[ i ];
        var player = new DT.Player( this, playerParams );

        this.addPlayer( player );

    }

    // add teams

    for ( var i = 0; i < 4; i ++ ) {

        this.teams.push( new DT.Team( params.teams[ i ] ) );

    }

    //

    this.resetTime = params.resetTime;
    this.currentTime = params.currentTime;
    this.time = params.currentTime - params.resetTime;

    this.updateTime();

    //

    ui.updateLeaderboard( this.players, this.me );
    ui.updateTeamScore( this.teams );

    ui.updateAmmo( this.me.ammo );
    ui.updateHealth( this.me.health );

    //

    clearInterval( this.timeInterval );
    this.timeInterval = setInterval( this.updateTime.bind( this ), 1000 );

};

DT.Arena.prototype.getPlayerById = function ( playerId ) {

    for ( var i = 0, il = this.players.length; i < il; i ++ ) {

        if ( this.players[ i ].id === playerId ) {

            return this.players[ i ];

        }

    }

    return false;

};

DT.Arena.prototype.addPlayer = function ( player ) {

    if ( player.id === this.me ) {

        this.me = player;

        view.sunLight.position.set( player.position.x - 100, view.sunLight.position.y, player.position.z + 100 );
        view.sunLight.target = player.tank.object;
        view.sunLight.target.updateMatrixWorld();

    }

    this.players.push( player );

    //

    ui.updateLeaderboard( this.players, this.me );

};

DT.Arena.prototype.removePlayer = function ( player ) {

    var newPlayersList = [];

    for ( var i = 0, il = this.players.length; i < il; i ++ ) {

        if ( this.players[ i ].id === player.id ) continue;

        newPlayersList.push( this.players[ i ] );

    }

    player.dispose();

    this.players = newPlayersList;

};

DT.Arena.prototype.clear = function () {

    clearInterval( this.timeInterval );
    this.players = [];
    this.teams = [];

};
