/*
 * @author ohmed
 * DatTank Arena collision manager
*/

import * as THREE from 'three';

import * as OMath from '../../OMath/Core.OMath';
// import { GfxCore } from '../../graphics/Core.Gfx';

//

class CollisionManagerCore {

    private static instance: CollisionManagerCore;

    private worker: any;
    private objects: any = [];
    private lastUpdateTime: number = 0;
    public updateRate: number;

    //

    public addObject ( object: any, type: string, isDynamic: boolean ) : void {

        this.worker.postMessage({ type: 'addObject', object: {
                id:         object.id,
                type:       object.type,
                radius:     object.radius,
                size:       ( type === 'box' || type === 'tank' ) ? { x: object.size.x, y: object.size.y, z: object.size.z } : { x: 0, y: 0, z: 0 },
                position:   object.position.clone(),
                rotation:   object.rotation,
                velocity:   ( object.velocityCorrection && ! object.isMe ) ? object.velocityCorrection.clone() : false,
            },
            shapeType: type,
            isDynamic,
        });

        if ( object.size ) {

            object.physicsBox = new THREE.Mesh( new THREE.BoxBufferGeometry( object.size.x + 10, object.size.y + 10, object.size.z + 10 ), new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.8, transparent: true }) );
            // GfxCore.scene.add( object.physicsBox );

        }

        this.objects.push( object );

    };

    public removeObject ( object: any ) : void {

        const newObjectList = [];

        for ( let i = 0, il = this.objects.length; i < il; i ++ ) {

            if ( this.objects[ i ].type === object.type && this.objects[ i ].id === object.id ) continue;
            newObjectList.push( this.objects[ i ] );

        }

        this.objects = newObjectList;
        this.worker.postMessage({ type: 'removeObject', id: object.type + '-' + object.id });

    };

    public update ( time: number, delta: number ) : void {

        const objects = {};

        for ( let i = 0, il = this.objects.length; i < il; i ++ ) {

            const object = this.objects[ i ];
            if ( object.type !== 'Tank' ) continue;

            objects[ object.type + '-' + object.id ] = {
                speed:              object.speed,
                health:             object.health,
                position:           object.stateNeedsCorrect ? { x: object.positionCorrection.x, y: object.positionCorrection.y, z: object.positionCorrection.z } : false,
                rotation:           object.stateNeedsCorrect ? object.rotationCorrection : false,
                velocity:           object.stateNeedsCorrect ? object.velocityCorrection : false,
                moveDirection:      { x: object.moveDirection.x, y: object.moveDirection.y },
                maxSpeed:           object.hull.speedCoef * object.engine.maxSpeed,
                power:              object.engine.power,
            };

            //

            if ( object.stateNeedsCorrect ) {

                object.rotationCorrectValue = OMath.formatAngle( object.rotationCorrection - object.gfx.object.rotation.y );
                object.rotationCorrection = 0;

                object.velocityCorrection.set( 0, 0, 0 );

                object.positionCorrectValue.set( object.positionCorrection.x - object.gfx.object.position.x, object.positionCorrection.y - object.gfx.object.position.y, object.positionCorrection.z - object.gfx.object.position.z );
                object.positionCorrection.set( 0, 0, 0 );

                object.stateNeedsCorrect = false;

            }

        }

        //

        this.worker.postMessage({ type: 'update', objects });

    };

    private workerMessage ( event: any ) : void {

        switch ( event.data.type ) {

            case 'ready':

                this.worker.postMessage({ type: 'init' });
                break;

            case 'update':

                const objects = event.data.objects;
                this.lastUpdateTime = this.lastUpdateTime || Date.now();
                const delta = Date.now() - this.lastUpdateTime;

                for ( let i = 0, il = objects.length; i < il; i ++ ) {

                    const objParent = this.getObject( objects[ i ].id, objects[ i ].type );
                    if ( ! objParent ) continue;

                    objParent.acceleration = objects[ i ].acceleration;
                    objParent.forwardVelocity = objects[ i ].forwardVelocity;
                    objParent.updateMovement( delta, objects[ i ].directionVelocity, objects[ i ].angularVelocity );

                    objParent.physicsBox.position.x = objects[ i ].position.x;
                    objParent.physicsBox.position.y = objects[ i ].position.y;
                    objParent.physicsBox.position.z = objects[ i ].position.z;
                    objParent.physicsBox.rotation.y = objects[ i ].rotation;
                    objParent.physicsBox.updateMatrixWorld( true );

                }

                this.lastUpdateTime = Date.now();
                this.updateRate = delta || 1;

                break;

        }

    };

    private getObject ( id: number, type: string ) : any {

        for ( let i = 0, il = this.objects.length; i < il; i ++ ) {

            if ( this.objects[ i ].type + '-' + this.objects[ i ].id === type + '-' + id ) {

                return this.objects[ i ];

            }

        }

        return null;

    };

    public init () : void {

        this.worker = new Worker('/scripts/workers/Collision.Worker.js');
        this.worker.onmessage = this.workerMessage.bind( this );

    };

    //

    constructor () {

        if ( CollisionManagerCore.instance ) {

            return CollisionManagerCore.instance;

        }

        CollisionManagerCore.instance = this;

        //

        this.init();

    };

};

//

export let CollisionManager = new CollisionManagerCore();
