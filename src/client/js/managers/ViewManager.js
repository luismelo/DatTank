/*
 * @author ohmed
 * DatTank Scene Rendering core
*/

var MOBILE;

Game.ViewManager = function () {

    this.SCREEN_WIDTH = false;
    this.SCREEN_HEIGHT = false;

    this.prevRenderTime = false;

    //

    MOBILE = new MobileDetect( window.navigator.userAgent );
    MOBILE = MOBILE.mobile() || MOBILE.phone() || MOBILE.tablet();

    if ( MOBILE ) {

        $('.error-on-mobile').show();
        return;

    }

    //

    this.scene = false;
    this.camera = false;
    this.renderer = false;

    this.selectionCircle = false;

    this.cameraOffset = new THREE.Vector3();
    this.shakeInterval = false;

    //

    this.raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3(), 0, 10000 );

};

Game.ViewManager.prototype = {};

Game.ViewManager.prototype.setupScene = function () {

    this.quality = 1;
    this.SCREEN_WIDTH = window.innerWidth;
    this.SCREEN_HEIGHT = window.innerHeight;

    // setup camera and scene

    this.scene = new THREE.Scene();
    this.scene.intersections = [];
    this.camera = new THREE.PerspectiveCamera( 60, this.SCREEN_WIDTH / this.SCREEN_HEIGHT, 1, 10000 );

    this.camera.position.set( 180, 400, 0 );
    this.camera.lookAt( new THREE.Vector3() );

    this.scene.add( this.camera );

    this.scene.fog = new THREE.Fog( 0x050303, 350, 1900 );

    // setup sound listener

    if ( ! this.sound ) {

        this.sound = {};
        this.sound.listener = new THREE.AudioListener();
        this.camera.add( this.sound.listener );

    }

    // add light

    this.scene.add( new THREE.AmbientLight( 0xffffff ) );

    // user event handlers

    window.addEventListener( 'resize', this.resize.bind( this ) );

    this.updateRenderer();
    this.render();

    //

    console.log( '>Scene inited.' );

};

Game.ViewManager.prototype.addDecorations = function ( decorations ) {

    var tree = resourceManager.getModel( 'tree.json' );
    tree.material[0].alphaTest = 0.5;

    var stone = resourceManager.getModel( 'stone.json' );
    var model;
    var mesh;
    var decoration;

    //

    for ( var i = 0, il = decorations.length; i < il; i ++ ) {

        decoration = decorations[ i ];

        switch ( decoration.type ) {

            case 'tree':
                model = tree;
                break;

            case 'rock':
                model = stone;
                break;

            default:
                console.log('No proper decoration model.');

        }

        mesh = new THREE.Mesh( model.geometry, new THREE.MultiMaterial( model.material ) );
        mesh.scale.set( decoration.scale.x, decoration.scale.y, decoration.scale.z );
        mesh.position.set( decoration.position.x, decoration.position.y, decoration.position.z );
        mesh.name = decoration.type;
        view.scene.add( mesh );
        view.scene.intersections.push( mesh );

    }

};

Game.ViewManager.prototype.addMap = function () {

    var size = 2430;
    var offset = 100;
    var wallWidth = 30;

    var groundTexture = resourceManager.getTexture( 'Ground.jpg' );
    groundTexture.wrapS = THREE.RepeatWrapping;
    groundTexture.wrapT = THREE.RepeatWrapping;

    if ( localStorage.getItem('hq') === 'true' ) {

        groundTexture.repeat.set( 25, 25 );

    } else {

        groundTexture.repeat.set( 10, 10 );

    }

    var ground = new THREE.Mesh( new THREE.PlaneBufferGeometry( size + 1800, size + 1800 ), new THREE.MeshBasicMaterial({ map: groundTexture, color: 0x555555 }) );
    ground.rotation.x = - Math.PI / 2;
    this.scene.add( ground );
    this.scene.ground = ground;

    ground.name = 'ground';
    this.ground = ground;

    var edgeTexture = resourceManager.getTexture( 'brick.jpg' );
    edgeTexture.wrapS = THREE.RepeatWrapping;
    edgeTexture.wrapT = THREE.RepeatWrapping;
    edgeTexture.repeat.set( 100, 1 );
    var material = new THREE.MeshBasicMaterial({ color: 0x999999, map: edgeTexture });

    var border1 = new THREE.Mesh( new THREE.BoxGeometry( size + 2 * offset + wallWidth, wallWidth, wallWidth ), material );
    border1.rotation.y += Math.PI / 2;
    border1.position.set( size / 2 + offset, 1, 0 );
    this.scene.add( border1 );

    var border2 = new THREE.Mesh( new THREE.BoxGeometry( size + 2 * offset + wallWidth, wallWidth, wallWidth ), material );
    border2.rotation.y = - Math.PI / 2;
    border2.position.set( - size / 2 - offset, 1, 0 );
    this.scene.add( border2 );

    var border3 = new THREE.Mesh( new THREE.BoxGeometry( size + 2 * offset - wallWidth, wallWidth, wallWidth ), material );
    border3.position.set( 0, 1, size / 2 + offset );
    this.scene.add( border3 );

    var border4 = new THREE.Mesh( new THREE.BoxGeometry( size + 2 * offset - wallWidth, wallWidth, wallWidth ), material );
    border4.position.set( 0, 1, - size / 2 - offset );
    this.scene.add( border4 );

};

Game.ViewManager.prototype.addTeamZone = function () {

    var team;
    var name, color, x, z;
    var plane;

    for ( var i = 0, il = Game.arena.teamManager.teams.length; i < il; i ++ ) {

        if ( Game.arena.teamManager.teams[ i ].id >= 1000 ) continue;

        team = Game.arena.teamManager.teams[ i ];

        name = team.name;
        color = + team.color.replace('#', '0x');
        x = team.spawnPosition.x;
        z = team.spawnPosition.z;

        plane = new THREE.Mesh( new THREE.PlaneGeometry( 200, 200 ), new THREE.MeshBasicMaterial({ color: color, transparent: true }) );
        plane.rotation.x = - Math.PI / 2;
        plane.material.opacity = 0.2;
        plane.position.set( x, 1, z );
        this.scene.add( plane );
        plane.name = 'team-spawn-plane-' + name;

    }

};

Game.ViewManager.prototype.clean = function () {

    if ( this.scene ) {

        this.camera.position.y = 400;

        for ( var i = 0, il = this.scene.children.length; i < il; i ++ ) {

            if ( this.shakeInterval !== false ) {

                clearInterval( this.shakeInterval );
                this.shakeInterval = false;

            }

            this.cameraOffset.set( 0, 0, 0 );
            this.scene.remove( this.scene.children[ i ] );

        }

    }

};

Game.ViewManager.prototype.updateRenderer = function () {

    var antialias = false;
    this.quality = 0.7;

    if ( localStorage.getItem('hq') === 'true' ) {

        antialias = true;
        this.quality = 1;

    }

    this.renderer = new THREE.WebGLRenderer({ canvas: Utils.ge('#renderport'), antialias: antialias });
    this.renderer.setSize( this.quality * this.SCREEN_WIDTH, this.quality * this.SCREEN_HEIGHT );
    this.renderer.setClearColor( 0x000000 );

};

Game.ViewManager.prototype.resize = function () {

    this.SCREEN_WIDTH = window.innerWidth;
    this.SCREEN_HEIGHT = window.innerHeight;

    //

    this.camera.aspect = this.SCREEN_WIDTH / this.SCREEN_HEIGHT;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize( this.quality * this.SCREEN_WIDTH, this.quality * this.SCREEN_HEIGHT );

};

Game.ViewManager.prototype.showDestinationPoint = (function() {

    var interval;

    return function ( position ) {

        var scope = this;
        clearInterval( interval );

        if ( ! this.selectionCircle ) {

            this.selectionCircle = new THREE.Mesh( new THREE.PlaneGeometry( 1.8, 1.8 ), new THREE.MeshBasicMaterial({ transparent: true, map: resourceManager.getTexture( 'SelectionSprite.png' ) }) );
            this.selectionCircle.rotation.x = - Math.PI / 2;
            this.scene.add( this.selectionCircle );

        }

        this.selectionCircle.position.set( position.x, 1, position.z );
        this.selectionCircle.scale.set( 10, 10, 10 );
        this.selectionCircle.material.opacity = 1;

        var iter = 100;

        interval = setInterval( function () {

            scope.selectionCircle.scale.set( iter / 10, iter / 10, iter / 10 );
            scope.selectionCircle.material.opacity = iter / 100;

            iter -= 2;

            if ( iter === 0 ) {

                clearInterval( interval );

            }

        }, 16 );

    };

}) ();

var intersections = false;

Game.ViewManager.prototype.animate = function ( delta ) {

    if ( ! Game.arena ) return;

    // update camera position

    this.camera.position.set( Game.arena.me.position.x + 180 + this.cameraOffset.x, this.camera.position.y + this.cameraOffset.y, Game.arena.me.position.z + this.cameraOffset.z );
    this.camera.lookAt( Game.arena.me.position );

    //

    if ( Game.arena.boxManager ) {

        Game.arena.boxManager.update( delta );

    }

    for ( var i = 0, il = Game.arena.towerManager.towers.length; i < il; i ++ ) {

        Game.arena.towerManager.towers[ i ].update( delta );

    }

    if ( ! intersections || Game.arena.me.movePath.length || Math.abs( controls.mousePos.x - controls.prevMousePos.x ) > 0.02 || Math.abs( controls.mousePos.y - controls.prevMousePos.y ) > 0.02 ) {

        view.raycaster.setFromCamera( controls.mousePos, view.camera );
        intersections = view.raycaster.intersectObjects( [ view.ground ] );

        controls.prevMousePos.set( controls.mousePos.x, controls.mousePos.y );

        if ( intersections.length ) {

            var me = Game.arena.me;
            var angle = Math.atan2( intersections[0].point.x - me.position.x, intersections[0].point.z - me.position.z ) - Math.PI / 2;

            if ( Math.abs( angle - me.topRotation ) > 0.03 ) {

                controls.rotateTop( angle );

            }

        }

    }

};

Game.ViewManager.prototype.changeGraficQuality = function () {

    var antialias = false;
    var quality = 0.7;

    if ( localStorage.getItem('hq') === 'true' ) {

        antialias = true;
        quality = 1;

    }

    if ( ! this.renderer ) {

        this.renderer = new THREE.WebGLRenderer({ canvas: Utils.ge('#renderport'), antialias: antialias });
        this.renderer.setSize( quality * this.SCREEN_WIDTH, quality * this.SCREEN_HEIGHT );
        this.renderer.setClearColor( 0x000000 );

        this.render();

    }

};

Game.ViewManager.prototype.addCameraShake = function ( duration, intencity ) {

    var iter = 0;
    var scope = this;

    if ( this.shakeInterval !== false ) {

        clearInterval( this.shakeInterval );
        this.cameraOffset.set( 0, 0, 0 );

    }

    this.shakeInterval = setInterval( function () {

        scope.cameraOffset.x = intencity * ( Math.random() - 0.5 ) * iter / 2;
        scope.cameraOffset.y = intencity * ( Math.random() - 0.5 ) * iter / 2;
        scope.cameraOffset.z = intencity * ( Math.random() - 0.5 ) * iter / 2;

        iter ++;

        if ( iter > Math.floor( ( duration - 100 ) / 40 ) ) {

            clearInterval( scope.shakeInterval );
            scope.cameraOffset.set( 0, 0, 0 );
            scope.shakeInterval = false;

        }

    }, 40 );

};

Game.ViewManager.prototype.render = function () {

    if ( ! this.prevRenderTime ) this.prevRenderTime = performance.now();

    var delta = performance.now() - this.prevRenderTime;
    this.prevRenderTime = performance.now();

    this.animate( delta );

    this.renderer.render( this.scene, this.camera );

    //

    requestAnimationFrame( this.render.bind( this ) );

};