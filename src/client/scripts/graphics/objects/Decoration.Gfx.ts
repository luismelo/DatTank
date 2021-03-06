/*
 * @author ohmed
 * DatTank Decoration graphics class
*/

import * as THREE from 'three';

import { GfxCore } from '../Core.Gfx';
import { DecorationObject } from '../../objects/core/Decoration.Object';
import { ResourceManager } from '../../managers/other/Resource.Manager';

//

export class DecorationGfx {

    private object: THREE.Object3D = new THREE.Object3D();

    //

    public dispose () : void {

        GfxCore.intersectManager.removeObject( this.object );
        GfxCore.coreObjects['decorations'].remove( this.object );

    };

    public update ( time: number, delta: number ) : void {

        const dx = this.object.position.x - GfxCore.camera.position.x;
        const dz = this.object.position.z - GfxCore.camera.position.z;

        if ( Math.sqrt( dx * dx + dz * dz ) < 100 ) {

            for ( let i = 0, il = this.object.children[0]['material'].length; i < il; i ++ ) {

                const object = this.object.children[0];
                const material = object['material'][ i ];

                material.side = THREE.BackSide;
                material.transparent = true;
                material.opacity = 0.2;
                material.depthWrite = false;
                material.depthTest = false;
                object.renderOrder = 10;

            }

        } else {

            for ( let i = 0, il = this.object.children[0]['material'].length; i < il; i ++ ) {

                const object = this.object.children[0];
                const material = object['material'][ i ];

                material.side = THREE.FrontSide;
                material.transparent = false;
                material.opacity = 1;
                material.depthWrite = true;
                material.depthTest = true;
                object.renderOrder = 0;

            }

        }

    };

    public init ( decoration: DecorationObject ) : void {

        const decorationModel = ResourceManager.getModel( 'decorations/' + decoration.title )!;
        const material = [];
        const materials = decorationModel.material as THREE.MeshBasicMaterial[];

        for ( let i = 0, il = materials.length; i < il; i ++ ) {

            material.push( materials[ i ].clone() );

        }

        //

        material[0].map = ResourceManager.getTexture('Decorations.jpg')!;
        material[0].map.needsUpdate = true;

        //

        const mesh = new THREE.Mesh( decorationModel.geometry, material );

        this.object.name = decoration.title;

        this.object.position.x = decoration.position.x;
        this.object.position.y = decoration.position.y;
        this.object.position.z = decoration.position.z;

        this.object.rotation.y = decoration.rotation;

        this.object.scale.x = decoration.scale.x;
        this.object.scale.y = decoration.scale.y;
        this.object.scale.z = decoration.scale.z;

        this.object.add( mesh );
        this.object.updateMatrixWorld( true );
        this.object.matrixAutoUpdate = false;

        GfxCore.intersectManager.addObject( this.object );

        //

        if ( ! GfxCore.coreObjects['decorations'] ) {

            GfxCore.coreObjects['decorations'] = new THREE.Object3D();
            GfxCore.coreObjects['decorations'].name = 'Decorations';
            GfxCore.scene.add( GfxCore.coreObjects['decorations'] );

        }

        GfxCore.coreObjects['decorations'].add( this.object );

    };

};
