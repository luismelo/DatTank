/*
 * @author ohmed
 * DatTank Tank graphics class
*/

import * as THREE from 'three';
import { MorphBlendMesh } from '../utils/MorphMesh.Gfx';

import * as OMath from '../../OMath/Core.OMath';
import { GfxCore } from '../Core.Gfx';
import { TowerLabelGfx } from '../effects/labels/TowerLabel.Gfx';
import { ResourceManager } from '../../managers/other/Resource.Manager';
import { TowerChangeTeamGfx } from '../effects/other/TowerChangeTeam.gfx';
import { TowerObject } from './../../objects/core/Tower.Object';
import { BulletCannonShotSmokeManager } from '../../graphics/managers/BulletCannonShotSmoke.Manager';

//

class TowerGfx {

    private object: THREE.Object3D = new THREE.Object3D();
    private topMesh: MorphBlendMesh;
    private baseMesh: THREE.Mesh;

    public label: TowerLabelGfx = new TowerLabelGfx();
    public changeTeamEffect: TowerChangeTeamGfx = new TowerChangeTeamGfx();

    //

    public update ( time: number, delta: number ) : void {

        this.changeTeamEffect.update( time, delta );
        this.topMesh.update( delta / 1000 );
        this.object.updateMatrixWorld( true );

    };

    public changeTeam ( color: number, skipAnimation: boolean ) : void {

        this.topMesh.material[1].color.setHex( color );
        this.baseMesh.material[1].color.setHex( color );

        //

        if ( ! skipAnimation ) {

            this.changeTeamEffect.show( color );

        }

    };

    public setTopRotation ( angle: number ) : void {

        this.topMesh.rotation.y = angle;

    };

    public setPosition ( position: OMath.Vec3 ) : void {

        this.object.position.x = position.x;
        this.object.position.y = position.y;
        this.object.position.z = position.z;

    };

    public shoot () : void {

        this.topMesh.playAnimation('shoot');

        const angle = this.topMesh.rotation.y - Math.PI;
        const pos = new OMath.Vec3( this.object.position.x + 50 * Math.sin( angle ), 23, this.object.position.z + 50 * Math.cos( angle ) );
        BulletCannonShotSmokeManager.showShotSmoke( pos, angle );

    };

    public init ( tower: TowerObject ) : void {

        let materials = [];
        const towerBaseModel = ResourceManager.getModel( 'towers/' + tower.title + '-bottom' )!;
        const towerTopModel = ResourceManager.getModel( 'towers/' + tower.title + '-top' )!;

        // tower base part

        const baseMaterials = towerBaseModel.material as THREE.MeshBasicMaterial[];

        for ( let i = 0, il = baseMaterials.length; i < il; i ++ ) {

            const material = baseMaterials[ i ].clone();
            material.map = ResourceManager.getTexture('tower-texture.png')!;
            materials.push( material );

        }

        this.baseMesh = new THREE.Mesh( towerBaseModel.geometry, materials );
        this.baseMesh.rotation.y = 0;
        this.baseMesh.scale.set( 10, 10, 10 );
        this.object.add( this.baseMesh );

        // tower top part

        materials = [];
        const topMaterials = towerTopModel.material as THREE.MeshBasicMaterial[];

        for ( let i = 0, il = topMaterials.length; i < il; i ++ ) {

            const material = topMaterials[ i ].clone();
            material.morphTargets = true;
            materials.push( material );

        }

        materials[0].map = ResourceManager.getTexture('tower-texture.png')!;

        this.topMesh = new MorphBlendMesh( towerTopModel.geometry as THREE.BufferGeometry, materials );
        this.topMesh.rotation.y = tower.rotation;
        this.topMesh.scale.set( 10, 10, 10 );
        this.object.add( this.topMesh );
        this.topMesh.setAnimationFPS( 'shoot', 6 );

        GfxCore.intersectManager.addObject( this.topMesh );
        GfxCore.intersectManager.addObject( this.baseMesh );

        //

        if ( ! GfxCore.coreObjects['towers'] ) {

            GfxCore.coreObjects['towers'] = new THREE.Object3D();
            GfxCore.coreObjects['towers'].name = 'Towers';
            GfxCore.coreObjects['towers'].userData.canIntersect = true;
            GfxCore.scene.add( GfxCore.coreObjects['towers'] );

        }

        GfxCore.coreObjects['towers'].add( this.object );

        //

        this.changeTeamEffect.init( this.object );
        this.label.init( this.object );

    };

    public dispose () : void {

        GfxCore.intersectManager.removeObject( this.topMesh );
        GfxCore.intersectManager.removeObject( this.baseMesh );

        this.label.dispose();
        GfxCore.coreObjects['towers'].remove( this.object );

    };

};

//

export { TowerGfx };
