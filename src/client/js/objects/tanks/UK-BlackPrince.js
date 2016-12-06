/*
 * @author ohmed
 * Tank "USA-T54" unit class
*/

DT.Tank.UKBlackPrince = function ( params ) {

    DT.Tank.call( this, params );

    //

    this.model = {
        top:    'Tank02_top.json',
        base:   'Tank02_base.json'
    };

    this.name = 'UK-Black-Prince';

};

DT.Tank.UKBlackPrince.prototype = Object.create( DT.Tank.prototype );

DT.Tank.UKBlackPrince.prototype.speed = 30;
DT.Tank.UKBlackPrince.prototype.range = 160;
DT.Tank.UKBlackPrince.prototype.armour = 252;
DT.Tank.UKBlackPrince.prototype.bullet = 77;

DT.Tank.UKBlackPrince.prototype.initModel = function () {

    this.object = new THREE.Object3D();

    var tankBaseModel = resourceManager.getModel( this.model.base );
    var tankTopModel = resourceManager.getModel( this.model.top );

    //

    var base = new THREE.Mesh( tankBaseModel.geometry, new THREE.MeshFaceMaterial( tankBaseModel.material ) );
    base.castShadow = true;
    base.rotation.y = 0;
    base.receiveShadow = true;
    base.scale.set( 20, 20, 20 );
    this.object.add( base );
    this.object.base = base;

    for ( var i = 0, il = base.material.materials.length; i < il; i ++ ) {

        base.material.materials[ i ].morphTargets = true;

    }

    //

    var top = new THREE.Mesh( tankTopModel.geometry, new THREE.MeshFaceMaterial( tankTopModel.material ) );
    top.castShadow = true;
    top.receiveShadow = true;
    top.position.y = 0;
    top.scale.set( 20, 20, 20 );

    for ( var i = 0, il = top.material.materials.length; i < il; i ++ ) {

        top.material.materials[ i ].morphTargets = true;

    }

    this.object.add( top );

    //

    var box = new THREE.Mesh( new THREE.BoxGeometry( 30, 40, 60 ), new THREE.MeshLambertMaterial({ transparent: true, opacity: 0 }) );
    box.position.y = 10;
    box.name = 'tank';
    box.owner = this.player;
    box.material.visible = false;
    this.object.add( box );
    view.scene.intersections.push( box );
    this.object.top = top;

    //

    this.mixer = new THREE.AnimationMixer( top );

    var shotAction = this.mixer.clipAction( tankTopModel.geometry.animations[0], top );
    shotAction.setDuration( 0.5 ).setLoop( THREE.LoopOnce );
    this.animations.shotAction = shotAction;

    var deathAction1 = this.mixer.clipAction( tankTopModel.geometry.animations[1], top );
    deathAction1.setDuration( 1 ).setLoop( THREE.LoopOnce );
    this.animations.deathAction1 = deathAction1;

    var deathAction2 = this.mixer.clipAction( tankBaseModel.geometry.animations[0], base );
    deathAction2.setDuration( 2 ).setLoop( THREE.LoopOnce );
    this.animations.deathAction2 = deathAction2;

    //

    view.scene.add( this.object );

};

DT.Tank.UKBlackPrince.prototype.destroy = function () {

    var scope = this;

    this.animations.deathAction1.stop();
    this.animations.deathAction1.play();

    this.animations.deathAction2.stop();
    this.animations.deathAction2.play();

    this.moveProgress = false;
    this.movementDurationMap = [];
    this.moveProgress = 0;

    setTimeout( function () {

        scope.animations.deathAction1.paused = true;
        scope.animations.deathAction2.paused = true;

    }, 1100 );

    if ( localStorage.getItem('sound') !== 'false' ) {

        this.sounds.explosion.play();

    }

};

//

DT.Tank.list[ 'UKBlackPrince' ] = {
    title:      'UK-Black-Prince',
    speed:      DT.Tank.UKBlackPrince.prototype.speed,
    range:      DT.Tank.UKBlackPrince.prototype.range,
    armour:     DT.Tank.UKBlackPrince.prototype.armour,
    bullet:     DT.Tank.UKBlackPrince.prototype.bullet
};