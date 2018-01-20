/*
 * @author ohmed
 * DatTank mouse/keys controls
*/

Game.ControlsManager = function () {

    this.pressedKey = {};
    this.pressedMouseKey = false;

    this.mousePos = new THREE.Vector2( 0.5, 0.5 );
    this.prevMousePos = new THREE.Vector2( 0.5, 0.5 );

    this.moveX = 0;
    this.moveZ = 0;

    this.notMoveX = 0;
    this.notMoveZ = 0;

    this.stopMovingUp = false;
    this.stopMovingDown = false;
    this.stopMovingLeft = false;
    this.stopMovingRight = false;

};

Game.ControlsManager.prototype = {};

Game.ControlsManager.prototype.mouseInit = function () {

    var scope = this;

    // disable right mouse click

    document.oncontextmenu = function () { return false; };

    //

    function mouseDown ( event ) {

        var mouseX = event.clientX;
        var mouseY = event.clientY;

        scope.mousePos.x = ( event.clientX / view.SCREEN_WIDTH ) * 2 - 1;
        scope.mousePos.y = - ( event.clientY / view.SCREEN_HEIGHT ) * 2 + 1;

        var mouseKeyPressed = event.which;

        switch ( mouseKeyPressed ) {

            case 1:
            case 2:
            case 3:

                clearInterval( scope.fireTime );
                scope.fireTime = setInterval( function () {

                    scope.shoot();

                }, 100);

                scope.shoot();

                break;

        }

    };

    function mouseMove ( event ) {

        var mouseX = event.clientX;
        var mouseY = event.clientY;

        scope.mousePos.x = ( event.clientX / view.SCREEN_WIDTH ) * 2 - 1;
        scope.mousePos.y = - ( event.clientY / view.SCREEN_HEIGHT ) * 2 + 1;

    };

    function mouseUp ( event ) {

        var mouseX = event.clientX;
        var mouseY = event.clientY;

        scope.mousePos.x = ( event.clientX / view.SCREEN_WIDTH ) * 2 - 1;
        scope.mousePos.y = - ( event.clientY / view.SCREEN_HEIGHT ) * 2 + 1;

        var mouseKeyPressed = event.which;

        switch ( mouseKeyPressed ) {

            case 1:

                scope.stopShooting();

                break;

        }

    };

    //

    var viewport = Utils.ge('#viewport');

    viewport.addEventListener( 'mousedown', mouseDown );
    viewport.addEventListener( 'mousemove', mouseMove );
    viewport.addEventListener( 'mouseup', mouseUp );

};

Game.ControlsManager.prototype.stopShooting = function () {

    var scope = this;
    clearInterval( scope.fireTime );
    scope.fireTime = false;

};

Game.ControlsManager.prototype.keyInit = function () {

    var scope = this;

    function keyDown ( event ) {

        if ( scope.pressedKey[ '' + event.keyCode ] === true ) return;
        scope.pressedKey[ '' + event.keyCode ] = true;

        switch ( event.keyCode ) {

            case 38: // up
            case 87: // w

                if ( scope.moveX === 1 ) return;
                scope.moveX = 1;
                scope.stopMovingDown = false;
                scope.stopMovingLeft = false;
                scope.stopMovingRight = false;

                if ( Game.arena.me.position.x > -1267 && Game.arena.me.position.z > -1267 && Game.arena.me.position.z < 1267 && scope.stopMovingUp === false ) {

                    scope.move();

                }

                break;

            case 37: // left
            case 65: // a

                if ( scope.moveZ === 1 ) return;
                scope.moveZ = 1;
                scope.stopMovingUp = false;
                scope.stopMovingDown = false;
                scope.stopMovingRight = false;

                if ( Game.arena.me.position.z < 1267 && Game.arena.me.position.x > -1267 && Game.arena.me.position.x < 1267 && scope.stopMovingLeft === false) {

                    scope.move();

                }

                break;

            case 40: // down
            case 83: // s

                if ( scope.moveX === - 1 ) return;
                scope.moveX = - 1;
                scope.stopMovingUp = false;
                scope.stopMovingLeft = false;
                scope.stopMovingRight = false;

                if ( Game.arena.me.position.z < 1267 && Game.arena.me.position.z > -1267 && Game.arena.me.position.x < 1267 && scope.stopMovingDown === false ) {

                    scope.move();

                }

                break;

            case 39: // right
            case 68: // d

                if ( scope.moveZ === - 1 ) return;
                scope.moveZ = -1;
                scope.stopMovingUp = false;
                scope.stopMovingLeft = false;
                scope.stopMovingDown = false;

                if ( Game.arena.me.position.z > -1267 && Game.arena.me.position.x > -1267 && Game.arena.me.position.x < 1267 && scope.stopMovingRight === false ) {

                    scope.move();

                }

                break;

        }

    };

    function keyUp ( event ) {

        var newDirection;

        delete scope.pressedKey[ '' + event.keyCode ];

        switch ( event.keyCode ) {

            case 38: // up
            case 87: // w

                newDirection = ( scope.pressedKey[ 40 ] || scope.pressedKey[ 83 ] ) ? -1 : 0;
                if ( scope.moveX === newDirection ) break;
                scope.moveX = newDirection;
                if ( Game.arena.me.position.z < 1267 && Game.arena.me.position.z > -1267 && Game.arena.me.position.x > -1267 && scope.stopMovingUp === false ) {

                    scope.move();

                }
                break;

            case 37: // left
            case 65: // a

                newDirection = ( scope.pressedKey[ 39 ] || scope.pressedKey[ 68 ] ) ? -1 : 0;
                if ( scope.moveZ === newDirection ) break;
                scope.moveZ = newDirection;
                if ( Game.arena.me.position.z < 1267 && Game.arena.me.position.x > -1267 && Game.arena.me.position.x < 1267 && scope.stopMovingLeft === false) {

                    scope.move();

                }
                break;

            case 40: // down
            case 83: // s

                newDirection = ( scope.pressedKey[ 38 ] || scope.pressedKey[ 87 ] ) ? 1 : 0;
                if ( scope.moveX === newDirection ) break;
                scope.moveX = newDirection;
                if ( Game.arena.me.position.z < 1267 && Game.arena.me.position.z > -1267 && Game.arena.me.position.x < 1267 && scope.stopMovingDown === false ) {

                    scope.move();

                }
                break;

            case 39: // right
            case 68: // d

                newDirection = ( scope.pressedKey[ 37 ] || scope.pressedKey[ 65 ] ) ? 1 : 0;
                if ( scope.moveZ === newDirection ) break;
                scope.moveZ = newDirection;
                if ( Game.arena.me.position.z > -1267 && Game.arena.me.position.x > -1267 && Game.arena.me.position.x < 1267 && scope.stopMovingRight === false ) {

                    scope.move();

                }
                break;

        }

    };

    //

    document.addEventListener( 'keydown', keyDown );
    document.addEventListener( 'keyup', keyUp );

};

//

Game.ControlsManager.prototype.rotateTop = (function () {

    var buffer = new ArrayBuffer( 4 );
    var bufferView = new Int16Array( buffer );
    var lastUpdateTime = Date.now();

    return function ( angle ) {

        var me = Game.arena.me;
        if ( ! me.tank.object.top ) return;

        if ( Date.now() - lastUpdateTime > 100 ) {

            lastUpdateTime = Date.now();
            bufferView[ 1 ] = Math.floor( angle * 1000 );
            network.send( 'PlayerTankRotateTop', buffer, bufferView );

        }

    };

}) ();

Game.ControlsManager.prototype.shoot = function () {

    var buffer = new ArrayBuffer( 2 );
    var bufferView = new Int16Array( buffer );

    network.send( 'PlayerTankShoot', buffer, bufferView );

};

Game.ControlsManager.prototype.move = ( function () {

    var buffer = new ArrayBuffer( 6 );
    var bufferView = new Int16Array( buffer );

    return function () {

        var scope = this;

        bufferView[ 0 ] = 0;
        bufferView[ 1 ] = scope.notMoveX ? 0 : scope.moveX;
        bufferView[ 2 ] = scope.notMoveZ ? 0 : scope.moveZ;

        Game.arena.me.moveProgress = false;
        Game.arena.me.movePath = false;
        Game.arena.me.movementStart = false;

        network.send( 'PlayerTankMove', buffer, bufferView );

    };

}) ();

Game.ControlsManager.prototype.stop = function () {

    var scope = this;

    scope.notMoveX = true;
    scope.notMoveZ = true;

    scope.stopMovingUp = true;
    scope.stopMovingDown = true;
    scope.stopMovingLeft = true;
    scope.stopMovingRight = true;

    this.move();

    scope.notMoveX = false;
    scope.notMoveZ = false;

};
