/*
 * @author ohmed
 * Tower object class
*/

Game.Tower = function ( arena, params ) {

    EventDispatcher.call( this );

    this.id = params.id;
    this.arena = arena;

    this.team = this.arena.teamManager.getById( params.team ) || false;
    this.health = params.health;

    this.bullets = [];

    this.object = new THREE.Object3D();
    this.rotation = params.rotation || 0;
    this.position = new THREE.Vector3( params.position.x, params.position.y, params.position.z );

    this.animations = {};
    this.healthBar = false;
    this.bulletSpeed = 1.5;

    this.label = false;

    this.changeTeamAnimationTime = false;

    //

    this.initBullets();
    this.initChangeTeamEffect();
    this.init();

    //

    this.changeTeam( this.team.id, true );

};

Game.Tower.prototype = Object.create( EventDispatcher.prototype );

//

Game.Tower.prototype.init = function () {

    var towerBaseModel = resourceManager.getModel('Tower_base.json');
    var towerTopModel = resourceManager.getModel('Tower_top.json');

    //

    var base = new THREE.Mesh( towerBaseModel.geometry, towerBaseModel.material );
    base.geometry.computeFlatVertexNormals();
    base.rotation.y = 0;
    base.scale.set( 27, 27, 27 );

    for ( var i = 0, il = base.material.length; i < il; i ++ ) {

        base.material[ i ] = base.material[ i ].clone();

    }

    //

    var materials = [];
    for ( var i = 0, il = towerTopModel.material.length; i < il; i ++ ) {

        materials.push( towerTopModel.material[ i ].clone() );
        materials[ materials.length - 1 ].morphTargets = true;

    }

    var top = new THREE.Mesh( towerTopModel.geometry, materials );
    top.geometry.computeFlatVertexNormals();
    top.rotation.y = this.rotation;
    top.scale.set( 27, 27, 27 );

    //

    this.object.add( base );
    this.object.base = base;

    this.object.add( top );
    this.object.top = top;

    view.scene.add( this.object );

    //

    this.object.position.set( this.position.x, this.position.y, this.position.z );

    //

    this.mixer = new THREE.AnimationMixer( top );

    var shotAction = this.mixer.clipAction( towerTopModel.geometry.animations[0], top );
    shotAction.setDuration( 0.5 ).setLoop( THREE.LoopOnce );
    this.animations.shotAction = shotAction;

    //

    this.initLabel();
    this.rotateTop( this.rotation, this.rotation );

    this.addEventListeners();

};

Game.Tower.prototype.initLabel = function () {

    var canvas, ctx, sprite, material;
    this.label = {};

    canvas = document.createElement( 'canvas' );
    canvas.width = 256;
    canvas.height = 64;

    ctx = canvas.getContext('2d');
    material = new THREE.SpriteMaterial({ map: new THREE.Texture( canvas ), color: 0xffffff, fog: true });

    sprite = new THREE.Sprite( material );
    sprite.position.set( 0, 35, 0 );
    sprite.scale.set( 52, 13, 1 );

    this.label.canvas = canvas;
    this.label.ctx = ctx;
    this.label.material = material;
    this.label.sprite = sprite;

    this.object.add( sprite );

};

Game.Tower.prototype.updateLabel = function () {

    // draw health red bg

    this.label.ctx.fillStyle = '#9e0e0e';
    this.label.ctx.fillRect( 0, 0, 300, 10 );

    // draw health green indicator

    this.label.ctx.fillStyle = '#00ff00';
    this.label.ctx.fillRect( 0, 0, 300 * ( this.health / 100 ), 10 );

    // draw health 'amout' lines based on armour

    this.label.ctx.strokeStyle = 'rgba( 0, 0, 0, 0.3 )';

    for ( var i = 0, il = 10; i < il; i ++ ) {

        this.label.ctx.beginPath();
        this.label.ctx.moveTo( i * 300 / il, 0 );
        this.label.ctx.lineTo( i * 300 / il, 10 );
        this.label.ctx.stroke();

    }

    // draw team color rect

    // this.label.ctx.fillStyle = this.player.team.color;
    // this.label.ctx.fillRect( 0, 15, 25, 25 );

    // draw player login

    // this.label.ctx.fillStyle = '#ffffff';
    // this.label.ctx.font = '26px Tahoma';
    // this.label.ctx.textAlign = 'left';
    // this.label.ctx.fillText( this.player.login, 30, 35 );

    this.label.material.map.needsUpdate = true;

};

Game.Tower.prototype.initChangeTeamEffect = function () {

    this.changeTeamEffectPipe = new THREE.Object3D();
    this.changeTeamEffectPipe.position.set( this.position.x, 100, this.position.z );
    view.scene.add( this.changeTeamEffectPipe );

    var pipe = new THREE.Mesh( new THREE.CylinderBufferGeometry( 50, 50, 800, 10 ), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.0, depthWrite: false }) );
    pipe.renderOrder = 100;
    this.changeTeamEffectPipe.pipe = pipe;
    this.changeTeamEffectPipe.add( pipe );
    this.changeTeamEffectPipe.visible = false;

};

Game.Tower.prototype.initBullets = function () {

    for ( var i = 0; i < 5; i ++ ) {

        var bullet = new THREE.Mesh( new THREE.BoxGeometry( 2.5, 2.5, 2.5 ), new THREE.MeshBasicMaterial({ color: 0xff3333 }) );
        bullet.visible = false;
        this.bullets.push( bullet );
        view.scene.add( bullet );

        var bulletTrace = new THREE.Mesh( new THREE.PlaneGeometry( 2, 2 ), new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.5, transparent: true }) );
        bulletTrace.visible = false;
        bulletTrace.rotation.x = - Math.PI / 2;
        view.scene.add( bulletTrace );
        bullet.trace = bulletTrace;
        bullet.trace.renderOrder = 5;

        bullet.soundShooting = new THREE.PositionalAudio( view.sound.listener );
        bullet.soundShooting.setBuffer( resourceManager.getSound('tank_shooting.wav') );
        bullet.soundShooting.loop = false;
        bullet.soundShooting.setRefDistance( 30 );
        bullet.soundShooting.autoplay = false;
        bullet.soundShooting.setVolume(0.5);

        this.object.add( bullet.soundShooting );

    }

};

Game.Tower.prototype.rotateTop = function ( oldAngle, newAngle ) {

    this.newRotation = newAngle;

    this.rotation = oldAngle;
    this.object.top.rotation.y = oldAngle;

};

Game.Tower.prototype.shoot = function ( bulletId ) {

    var bullet = false;

    for ( var i = 0, il = this.bullets.length; i < il; i ++ ) {

        bullet = this.bullets[ i ];
        bullet.bulletId = bulletId;
        if ( bullet.visible === false ) break;

    }

    //

    this.animations.shotAction.stop();
    this.animations.shotAction.play();

    //

    bullet.directionRotation = - this.object.top.rotation.y - this.object.rotation.y - 1.57;

    var offsetDist = 55;
    var offsetX = offsetDist * Math.cos( bullet.directionRotation );
    var offsetZ = offsetDist * Math.sin( bullet.directionRotation );

    bullet.startPos = new THREE.Vector3( this.object.position.x + offsetX, 25, this.object.position.z + offsetZ );
    bullet.position.set( this.object.position.x + offsetX, 25, this.object.position.z + offsetZ );
    bullet.trace.position.set( this.object.position.x + offsetX, 25, this.object.position.z + offsetZ );
    bullet.trace.rotation.z = - bullet.directionRotation;
    bullet.trace.scale.set( 1, 1, 1 );

    //

    if ( bullet.soundShooting.buffer ) {

        if ( bullet.soundShooting.isPlaying ) {

            bullet.soundShooting.stop();
            bullet.soundShooting.startTime = 0;
            bullet.soundShooting.isPlaying = false;

        }

        if ( localStorage.getItem('sound') !== 'false' ) {

            bullet.soundShooting.play();

        }

    }

    //

    bullet.visible = true;
    bullet.trace.visible = true;

};

Game.Tower.prototype.changeTeam = function ( team, init ) {

    team = this.arena.teamManager.getById( team );
    if ( ! team ) return;

    this.team = team;

    this.object.top.material[1].color.setHex( + team.color.replace('#', '0x') );
    this.object.base.material[1].color.setHex( + team.color.replace('#', '0x') );

    if ( ! init ) {

        this.health = 100;

        this.changeTeamAnimationTime = 0;
        this.changeTeamEffectPipe.pipe.material.color.setHex( + team.color.replace('#', '0x') );
        this.changeTeamEffectPipe.pipe.material.opacity = 0;
        this.changeTeamEffectPipe.scale.set( 0.1, 0.1, 0.1 );
        this.changeTeamEffectPipe.visible = true;

    }

    this.updateLabel();

};

Game.Tower.prototype.updateHealth = function ( health ) {

    this.health = health;
    this.updateLabel();

};

Game.Tower.prototype.dispose = function () {

    view.scene.remove( this.object );
    view.scene.remove( this.changeTeamEffectPipe );

    for ( var i = 0, il = this.bullets.length; i < il; i ++ ) {

        view.scene.remove( this.bullets[ i ] );
        view.scene.remove( this.bullets[ i ].trace );

    }

};

//

Game.Tower.prototype.animate = function ( delta ) {

    if ( this.changeTeamEffectPipe.visible ) {

        var progress = this.changeTeamAnimationTime / 2000;
        this.changeTeamAnimationTime += delta;

        if ( progress > 0.5 ) {

            this.changeTeamEffectPipe.pipe.material.opacity = 1 - progress;

        } else {
        
            this.changeTeamEffectPipe.pipe.material.opacity = progress / 2;
            this.changeTeamEffectPipe.scale.set( progress, progress, progress );

        }

        if ( progress > 1 ) {

            this.changeTeamAnimationTime = false;
            this.changeTeamEffectPipe.visible = false;

        }

    }

    //

    if ( this.mixer ) {

        this.mixer.update( delta / 1000 );

    }

};

Game.Tower.prototype.update = function ( delta ) {

    this.animate( delta );

    //

    var deltaRot = Utils.formatAngle( this.newRotation ) - Utils.formatAngle( this.rotation );

    if ( deltaRot > Math.PI ) {

        if ( deltaRot > 0 ) {

            deltaRot = - 2 * Math.PI + deltaRot;

        } else {

            deltaRot = 2 * Math.PI + deltaRot;

        }

    }

    if ( Math.abs( deltaRot ) > 0.01 ) {

        this.rotation = Utils.formatAngle( this.rotation + Math.sign( deltaRot ) / 30 * ( delta / 50 ) );
        this.object.top.rotation.y = this.rotation;

    }

    for ( var bulletId in this.bullets ) {

        var bullet = this.bullets[ bulletId ];

        if ( bullet.visible === true ) {

            var x = bullet.position.x + this.bulletSpeed * Math.cos( bullet.directionRotation ) * delta;
            var z = bullet.position.z + this.bulletSpeed * Math.sin( bullet.directionRotation ) * delta;
            bullet.position.set( x, bullet.position.y, z );

            bullet.trace.position.set( ( x + bullet.startPos.x ) / 2, bullet.position.y, ( z + bullet.startPos.z ) / 2 );
            var dx = x - bullet.startPos.x;
            var dz = z - bullet.startPos.z;
            bullet.trace.scale.x = Math.sqrt( dx * dx + dz * dz ) / 3;
            bullet.trace.material.opacity = Math.max( 0.5 - bullet.trace.scale.x / 280, 0 );

        }

    }

};

Game.Tower.prototype.addEventListeners = function () {

    var scope = this;

    this.addEventListener( 'TowerRotateTop', function ( event ) { scope.rotateTop( event.data[1] / 1000, event.data[2] / 1000 ); });
    this.addEventListener( 'TowerShoot', function ( event ) { scope.shoot( event.data[1] ); });
    this.addEventListener( 'TowerChangeTeam', function ( event ) { scope.changeTeam( event.data[1] ); });
    this.addEventListener( 'TowerUpdateHealth', function ( event ) { scope.updateHealth( event.data[1] ); });

};
