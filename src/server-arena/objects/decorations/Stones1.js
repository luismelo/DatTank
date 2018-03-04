/*
 * @author ohmed
 * Stones1 map decoration
*/

var Stones1 = function ( arena, params ) {

    this.arena = arena;
    this.id = Stones1.numIds ++;
    Game.Decoration.call( this, arena, params );

    this.size.set( 0.8, 0.8, 0.8 );
    this.type = 'Stones1';

    this.init();

};

Stones1.prototype = Object.create( Game.Decoration.prototype );

Stones1.prototype.init = function () {

    var sizeXZ = 5 * Math.random() + 20;
    this.scale = new Game.Vec3( sizeXZ, 5 * Math.random() + 20, sizeXZ );

    this.sizeX = this.size.x * this.scale.x;
    this.sizeY = this.size.y * this.scale.y;
    this.sizeZ = this.size.z * this.scale.z;
    this.rotation = 0;

    this.arena.collisionManager.addObject( { position: { x: this.position.x + 45, z: this.position.z }, radius: 15 }, 'circle' );
    this.arena.collisionManager.addObject( { position: { x: this.position.x - 45, z: this.position.z }, radius: 15 }, 'circle' );

};

Stones1.prototype.toJSON = function () {

    return {
        id:         this.id,
        name:       this.name,
        type:       'stone1',
        position:   this.position.toJSON(),
        rotation:   this.rotation,
        scale:      this.scale.toJSON()
    };

};

//

Stones1.canPlace = function ( arena, x, z ) {

    return arena.collisionManager.isPlaceFree( { x: x + 45, y: z }, 15, 0 ) && arena.collisionManager.isPlaceFree( { x: x - 45, y: z }, 15, 0 );

};

//

module.exports = Stones1;