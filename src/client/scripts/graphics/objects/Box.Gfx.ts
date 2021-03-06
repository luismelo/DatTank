/*
 * @author ohmed
 * DatTank Box graphics class
*/

import * as THREE from 'three';

import { GfxCore } from '../Core.Gfx';
import { BoxObject } from '../../objects/core/Box.Object';
import { ResourceManager } from '../../managers/other/Resource.Manager';
import { BoxManager } from '../../managers/objects/Box.Manager';

//

export class BoxGfx {

    private animTime: number = 600 * Math.random() * Math.PI * 2;
    private mesh: THREE.Mesh;
    private box: BoxObject;

    private pickedAnimation = {
        enabled:    false,
        progress:   0,
        duration:   600,
    };

    //

    public dispose () : void {

        GfxCore.coreObjects['boxes'].remove( this.mesh );

    };

    public pick () : void {

        const sound = new THREE.PositionalAudio( GfxCore.audioListener );
        sound.setBuffer( ResourceManager.getSound( this.box.pickSound ) as THREE.AudioBuffer );
        sound.setRefDistance( 40 );

        this.mesh.add( sound );
        sound.play();
        this.pickedAnimation.enabled = true;

    };

    public update ( time: number, delta: number ) : void {

        if ( ! this.pickedAnimation.enabled ) {

            this.animTime += delta;
            this.mesh.rotation.y = Math.sin( this.animTime / 600 );
            this.mesh.position.y = Math.sin( this.animTime / 300 ) + 20;
            this.mesh.updateMatrixWorld( true );

        } else {

            this.mesh.scale.setScalar( Math.max( this.mesh.scale.x - 0.5 * delta / 16, 0.2 ) );
            this.mesh.position.y += 1 * delta / 16;
            this.mesh.material[0]['opacity'] -= 0.03 * delta / 16;
            this.mesh.updateMatrixWorld( true );
            this.pickedAnimation.progress += delta / this.pickedAnimation.duration;

        }

        if ( this.pickedAnimation.progress >= 1 ) {

            BoxManager.remove( [ this.box.id ] );
            this.pickedAnimation.enabled = false;

        }

    };

    public init ( box: BoxObject ) : void {

        const boxModel = ResourceManager.getModel( 'boxes/' + box.type )!;

        this.box = box;
        this.mesh = new THREE.Mesh( boxModel.geometry, [ boxModel.material[0].clone() ] );
        this.mesh.material[0].transparent = true;
        this.mesh.material[0].map = ResourceManager.getTexture('Boxes.jpg');
        this.mesh.name = box.type;
        this.mesh.scale.set( 20, 20, 20 );

        this.mesh.position.x = box.position.x;
        this.mesh.position.y = box.position.y;
        this.mesh.position.z = box.position.z;
        this.mesh.updateMatrixWorld( true );

        //

        if ( ! GfxCore.coreObjects['boxes'] ) {

            GfxCore.coreObjects['boxes'] = new THREE.Object3D();
            GfxCore.coreObjects['boxes'].name = 'Boxes';
            GfxCore.scene.add( GfxCore.coreObjects['boxes'] );

        }

        GfxCore.coreObjects['boxes'].add( this.mesh );

    };

};
