/*
 * @author ohmed
 * Tower object class
*/

var Tower = function ( arena, params ) {

    if ( Tower.numIds > 1000 ) Tower.numIds = 0;

    this.id = Tower.numIds ++;

    this.arena = arena;
    this.team = params.team || false;
    this.health = 100;
    this.shootTime = Date.now();
    this.cooldown = 2000;

    this.target = false;
    this.hits = {};

    this.rotation = 0;
    this.position = {
        x: params.position.x || 0,
        y: params.position.y || 0,
        z: params.position.z || 0
    };

    this.range = 200;
    this.armour = 300;

};

Tower.prototype = {};

Tower.prototype.init = function () {

    // todo

};

Tower.prototype.reset = function () {

    // todo

};

Tower.prototype.shoot = (function () {

    var buffer = new ArrayBuffer( 6 );
    var bufferView = new Uint16Array( buffer );

    return function ( target ) {

        if ( ! target ) return;

        //

        var dx = this.position.x - target.position[0];
        var dz = this.position.z - target.position[2];
        var rotation = ( dz === 0 && dx !== 0 ) ? ( Math.PI / 2 ) * Math.abs( dx ) / dx : Math.atan2( dx, dz );
        var delta;

        rotation = utils.formatAngle( rotation );
        delta = rotation - this.rotation;

        if ( Math.abs( delta ) > 0.3 ) return;

        //

        if ( Date.now() - this.shootTime < this.cooldown ) {

            return;

        }

        this.shootTime = Date.now();

        //

        bufferView[1] = this.id;
        bufferView[2] = Tower.numShootId;

        Tower.numShootId = ( Tower.numShootId > 1000 ) ? 0 : Tower.numShootId + 1;

        DT.Network.announce( this.arena, 'ShootTower', buffer, bufferView );

    };

}) ();

Tower.prototype.hit = (function () {

    var buffer = new ArrayBuffer( 6 );
    var bufferView = new Uint16Array( buffer );

    return function ( killer ) {

        var amount = Math.floor( 40 * ( killer.tank.bullet / this.armour ) * ( 0.5 * Math.random() + 0.5 ) );

        if ( this.health - amount <= 0 ) {

            this.health = 0;
            this.changeTeam( killer.team );
            return;

        }

        //

        this.health -= amount;

        bufferView[ 1 ] = this.id + 10000;
        bufferView[ 2 ] = this.health;

        DT.Network.announce( this.arena, 'hit', buffer, bufferView );

    };

}) ();

Tower.prototype.changeTeam = (function () {

    var buffer = new ArrayBuffer( 6 );
    var bufferView = new Uint16Array( buffer );

    return function ( team ) {

        this.team = team;
        this.health = 100;

        bufferView[ 1 ] = this.id;
        bufferView[ 2 ] = team.id;

        DT.Network.announce( this.arena, 'TowerChangeTeam', buffer, bufferView );

    };

}) ();

Tower.prototype.checkForTarget = function ( players ) {

    var dist;
    var target = this.target || false;
    this.target = false;

    if ( target && target.status === DT.Player.Alive ) {
    
        dist = utils.getDistance( this.position, { x: target.position[0], y: target.position[1], z: target.position[2] });

        if ( dist < this.range ) {

            return target;

        }

    }

    target = false;
    var minDistance = false;

    for ( var i = 0, il = players.length; i < il; i ++ ) {

        if ( this.team !== Tower.Neutral && players[ i ].team.id === this.team.id || players[ i ].status !== DT.Player.Alive ) {

            continue;

        }

        //

        dist = utils.getDistance( this.position, { x: players[ i ].position[0], y: players[ i ].position[1], z: players[ i ].position[2] });

        if ( dist > this.range ) continue;

        if ( ! minDistance || dist < minDistance ) {

            minDistance = dist;
            target = players[ i ];

        }

    }

    //

    return target;

};

Tower.prototype.rotateTop = (function () {

    var buffer = new ArrayBuffer( 6 );
    var bufferView = new Uint16Array( buffer );

    return function ( target ) {

        var dx = this.position.x - target.position[0];
        var dz = this.position.z - target.position[2];
        var rotation = ( dz === 0 && dx !== 0 ) ? ( Math.PI / 2 ) * Math.abs( dx ) / dx : Math.atan2( dx, dz );
        var delta;

        rotation = utils.formatAngle( rotation );
        delta = rotation - this.rotation;

        //

        if ( Math.abs( delta ) > 0.1 ) {

            if ( delta > 0 ) {

                this.rotation += 0.05;

            } else {

                this.rotation -= 0.05;

            }

            //

            bufferView[1] = this.id;
            bufferView[2] = Math.floor( 100 * this.rotation );

            DT.Network.announce( this.arena, 'TowerRotateTop', buffer, bufferView );

        }

    };

}) ();

Tower.prototype.update = function () {

    var target = this.checkForTarget( this.arena.players );
    if ( ! target ) return;
    this.target = target;

    //

    this.rotateTop( target );
    this.shoot( target );

};

Tower.prototype.toJSON = function () {

    return {

        id:         this.id,
        team:       this.team.id,
        health:     this.health,
        position:   { x: this.position.x, y: this.position.y, z: this.position.z }

    };

};

//

Tower.numIds = 0;
Tower.numShootId = 0;
Tower.Alive = 100;
Tower.Dead = 101;

//

module.exports = Tower;
