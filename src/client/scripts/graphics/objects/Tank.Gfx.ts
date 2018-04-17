/*
 * @author ohmed
 * DatTank Tank graphics class
*/

import * as THREE from 'three';

import * as OMath from "./../../OMath/Core.OMath";
import { GfxCore } from "./../Core.Gfx";
import { TankLabelGfx } from "./TankLabel.Gfx";
import { TankCore } from "./../../core/objects/Tank.Core";
import { ResourceManager } from "./../../managers/Resource.Manager";

//

class TankGfx {

    private object: THREE.Object3D = new THREE.Object3D();
    private topMesh: THREE.Mesh;
    private baseMesh: THREE.Mesh;
    private mixer: THREE.AnimationMixer;
    private tank: TankCore;
    private label: TankLabelGfx = new TankLabelGfx();

    private animations = {};
    private sounds = {};

    //

    private initSounds () {

        let movingSound = new THREE.PositionalAudio( GfxCore.audioListener );
        movingSound.setBuffer( ResourceManager.getSound('tank_moving.wav') );
        movingSound.setRefDistance( 11 );
        movingSound.autoplay = false;
        this.object.add( movingSound );
        this.sounds['moving'] = movingSound;
    
        // this.sounds.explosion = new THREE.PositionalAudio( view.sound.listener );
        // this.sounds.explosion.setBuffer( resourceManager.getSound('tank_explosion.wav') );
        // this.sounds.explosion.loop = false;
        // this.sounds.explosion.setRefDistance( 15 );
        // this.sounds.explosion.autoplay = false;
        // if ( this.player.id !== Game.arena.me ) this.sounds.explosion.setVolume(0.4);
    
        // this.object.add( this.sounds.explosion );

    };

    public toggleMovementSound ( enable: boolean ) {

        let sound = this.sounds['moving'];

        if ( sound.buffer ) {

            if ( ! sound.isPlaying && enable ) {

                sound.play();
                sound.isPlaying = true;

            }

            if ( sound.isPlaying && ! enable ) {

                sound.stop();
                sound.startTime = false;
                sound.isPlaying = false;

            }

        }

    };

    public get2DPosition () {

        let vector = new THREE.Vector3();
        vector.setFromMatrixPosition( this.topMesh.matrixWorld );
        vector.project( GfxCore.camera );

        return vector;

    };

    public setPosition ( position: OMath.Vec3 ) {

        this.object.position.x = position.x;
        this.object.position.y = position.y;
        this.object.position.z = position.z;

    };

    public setRotation ( angle: number ) {

        this.object.rotation.y = angle;

    };

    public setTopRotation ( angle: number ) {

        this.topMesh.rotation.y = angle + Math.PI / 2;

    };
    
    public update ( time: number, delta: number ) {

        let tank = this.tank;

        // if tank moves update tracks

        let track1Map = this.baseMesh.material[1].map;
        let track2Map = this.baseMesh.material[2].map;

        if ( tank.moveDirection.x ) {

            track1Map.offset.y = track1Map.offset.y - 0.005 * tank.moveDirection.x;
            if ( track1Map.offset.y > 1 ) track1Map.offset.y = 0;
            // track1Map.needsUpdate = true;

            track2Map.offset.y = track2Map.offset.y - 0.005 * tank.moveDirection.x;
            if ( track2Map.offset.y > 1 ) track2Map.offset.y = 0;

        } else if ( tank.moveDirection.y === -1 ) {

            track1Map.offset.y = track1Map.offset.y - 0.005;
            if ( track1Map.offset.y > 1 ) track1Map.offset.y = 0;

            track2Map.offset.y = track2Map.offset.y + 0.005;
            if ( track2Map.offset.y > 1 ) track2Map.offset.y = 0;

        } else if ( tank.moveDirection.y === 1 ) {

            track1Map.offset.y = track1Map.offset.y + 0.005;
            if ( track1Map.offset.y > 1 ) track1Map.offset.y = 0;

            track2Map.offset.y = track2Map.offset.y - 0.005;
            if ( track2Map.offset.y > 1 ) track2Map.offset.y = 0;

        }

        //

        if ( this.mixer ) {

            this.mixer.update( delta / 1000 );

        }

    };

    public init ( tank ) {

        this.tank = tank;

        let materials = [];
        let tankBaseModel = ResourceManager.getModel( 'tanks/' + tank.title + '-bottom' );
        let tankTopModel = ResourceManager.getModel( 'tanks/' + tank.title + '-top' );

        // add tank base mesh

        for ( let i = 0, il = tankBaseModel.material.length; i < il; i ++ ) {

            let material = tankBaseModel.material[ i ].clone();
            material.map = material.map.clone();
            material.map.needsUpdate = true;
            material.morphTargets = true;
            materials.push( material );

        }

        this.baseMesh = new THREE.Mesh( tankBaseModel.geometry, materials );
        this.baseMesh.scale.set( 10, 10, 10 );
        this.object.add( this.baseMesh );

        // add tank top mesh

        materials = [];
        for ( var i = 0, il = tankTopModel.material.length; i < il; i ++ ) {

            materials.push( tankTopModel.material[ i ].clone() );
            materials[ materials.length - 1 ].morphTargets = true;

        }
    
        this.topMesh = new THREE.Mesh( tankTopModel.geometry, materials );
        this.topMesh.scale.set( 10, 10, 10 );
        this.topMesh.position.y = 20;
        this.object.add( this.topMesh );

        // add tank shadow

        var tankShadowTexture = ResourceManager.getTexture( 'shadowTank.png' );
        var tankShadow = new THREE.Mesh( new THREE.PlaneBufferGeometry( 3, 3 ), new THREE.MeshBasicMaterial({ map: tankShadowTexture, transparent: true, depthWrite: false, opacity: 0.7 }) );
        tankShadow.scale.set( 13, 20, 1 );
        tankShadow.rotation.x = - Math.PI / 2;
        tankShadow.position.y += 0.5;
        tankShadow.renderOrder = 10;
        this.object.add( tankShadow );

        //

        // this.mixer = new THREE.AnimationMixer( this.topMesh );

        // var shotAction = this.mixer.clipAction( tankTopModel.geometry.animations[0], this.topMesh );
        // shotAction.setDuration( 0.5 ).setLoop( THREE.LoopOnce, 1 );
        // this.animations['shotAction'] = shotAction;

        // var deathAction1 = this.mixer.clipAction( tankTopModel.geometry.animations[1], this.topMesh );
        // deathAction1.setDuration( 1 ).setLoop( THREE.LoopOnce, 1 );
        // this.animations['deathAction1'] = deathAction1;

        // var deathAction2 = this.mixer.clipAction( tankBaseModel.geometry.animations[0], this.baseMesh );
        // deathAction2.setDuration( 2 ).setLoop( THREE.LoopOnce, 1 );
        // this.animations['deathAction2'] = deathAction2;

        //

        this.label.init( this.object );
        this.label.update( this.tank.health, this.tank.armour, this.tank.player.team.color, this.tank.player.username );
        this.initSounds();

        //

        GfxCore.scene.add( this.object );

    };

    public destroy () {

        this.animations['deathAction1'].stop();
        this.animations['deathAction1'].play();

        this.animations['deathAction2'].stop();
        this.animations['deathAction2'].play();

        setTimeout( () => {

            this.animations['deathAction1'].paused = true;
            this.animations['deathAction2'].paused = true;

        }, 1100 );

        this.sounds['explosion'].play();

    };

    public dispose () {

        // stop all audio

        for ( var s in this.sounds ) {

            if ( this.sounds[ s ] ) this.sounds[ s ].pause();

        }

        // remove tank object from scene

        GfxCore.scene.remove( this.object );

    };

};

//

export { TankGfx };
