/*
 * @authour ohmed
 * OldCastle map decoration
*/

var OldCastle = function ( arena, params ) {

    this.id = OldCastle.numIds ++;
    Game.Decoration.call( this, arena, params );

    this.size.set( 4.5, 4.5, 4.5 );
    this.type = 'OldCastle';

    this.init();

};

OldCastle.prototype = Object.create( Game.Decoration.prototype );

OldCastle.prototype.init = function () {

    this.scale = new Game.Vec3( 5 * Math.random() + 20, 15, 5 * Math.random() + 20 );

    this.sizeX = this.size.x * this.scale.x;
    this.sizeY = this.size.y * this.scale.y;
    this.sizeZ = this.size.z * this.scale.z;

    this.arena.collisionManager.addObject( this, 'box' );

};

OldCastle.prototype.toJSON = function () {

    return {
        id:         this.id,
        name:       this.name,
        type:       'oldCastle',
        position:   this.position.toJSON(),
        rotation:   this.rotation,
        scale:      this.scale.toJSON()
    };

};

//

OldCastle.canPlace = function ( arena, x, z ) {

    return arena.collisionManager.isPlaceFree( { x: x, y: z }, 4.5 * 25, 0 );

};

//

module.exports = OldCastle;