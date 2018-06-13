/*
 * @author ohmed
 * Tree2 map decoration
*/

import * as OMath from "./../../../OMath/Core.OMath";
import { DecorationObject } from "./../../core/Decoration.Object";
import { ArenaCore } from "./../../../core/Arena.Core";

//

class Tree2Decoration extends DecorationObject {

    public static canPlace ( arena: ArenaCore, position: OMath.Vec3 ) {

        return arena.collisionManager.isPlaceFree( position, 40 );

    };

    //

    constructor ( arena: ArenaCore, params: any ) {

        super( arena, params );

        this.type = 'Tree2';

        let sizeXZ = 15 * Math.random() + 30;
        this.scale.set( sizeXZ, 15 * Math.random() + 30, sizeXZ );
        this.size.set( 0.8 * this.scale.x, 0.8 * this.scale.y, 0.8 * this.scale.z );
        this.rotation = Math.random() * Math.PI * 2;
        this.radius = 4;

        this.arena.collisionManager.addObject( this, 'circle', false );

    };

};

//

export { Tree2Decoration };