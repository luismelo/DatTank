/*
 * @author ohmed
 * DatTank Resource manager
*/

import * as THREE from 'three';
import * as JSZip from 'JSZip';

//

class ResourceManagerCore {

    private static instance: ResourceManagerCore;

    private models = [];
    private textures = [];
    private sounds = [];

    private loadedModels: number = 0;
    private loadedTextures: number = 0;
    private loadedSounds: number = 0;
    public loadedPacks: Array<string> = [];

    private modelLoader: THREE.JSONLoader = new THREE.JSONLoader();
    private textureLoader: THREE.TextureLoader = new THREE.TextureLoader();
    private audioLoader: THREE.AnyLoader = new THREE.AudioLoader();

    //

    private modelsList = [];

    private texturesList = [
        'smoke.png',
        'Grass.png',
        'brick.jpg',

        'shadows.png',

        'Tank-shadow.png',

        'explosion1.png',
        'explosion2.png',
        'explosion3.png',
        'tower-texture.png',
        'Decorations.jpg',
        'Boxes.jpg',

        'IS2.jpg',
        'T29.jpg',
        'T44.jpg',
        'T54.jpg',

        'Tank1.png'
    ];

    private soundsList = [
        'tank_shooting.wav',
        'tank_moving.wav',
        'tank_explosion.wav',
        'box_pick.wav'
    ];

    private packsList = [
        'ingame'
    ];

    private packs = {
        garage: {
            url: '/resources/garage.pack',
            models: [
                'Garage',
                'tanks/Tank1'
                // 'tanks/IS2-bottom',
                // 'tanks/IS2-top',
                // 'tanks/T29-bottom',
                // 'tanks/T29-top',
                // 'tanks/T44-bottom',
                // 'tanks/T44-top',
                // 'tanks/T54-bottom',
                // 'tanks/T54-top'
            ]
        },
        ingame: {
            url: '/resources/ingame.pack',
            models: [
                'decorations/Rock1',
                'decorations/Rock2',
                'decorations/Rock3',
                'decorations/Rock4',
                'decorations/Tree1',
                'decorations/Tree2',
                'decorations/Tree3',
                'decorations/Tree4',
                'decorations/Tree5',
                'decorations/Tree6',
                'decorations/Tree7',
                'decorations/Tree8',
                // 'decorations/Ruin1',
                'boxes/AmmoBox',
                'boxes/HealthBox',
                'towers/T1-bottom',
                'towers/T1-top'
            ]
        }
    };

    //

    public init () {

        console.log( 'ResourceManager inited.' );

        this.loadPack('garage', function () {

            // nothing here

        });

    };

    private loadPack ( packName: string, callback ) {

        let processedItems = 0;
        let request = new XMLHttpRequest();
        let pack = this.packs[ packName ];

        request.addEventListener( 'load', ( event ) => {

            let data = event.target['response'];
            let decoder = new JSZip();
            decoder.loadAsync( data ).then( ( zip ) => {

                for ( let i = 0, il = pack.models.length; i < il; i ++ ) {

                    let modelName = pack.models[ i ];

                    zip.file( modelName + '.conf' ).async('text').then( ( configData ) => {

                        let config = JSON.parse( configData );

                        zip.file( modelName + '.bin' ).async('arraybuffer').then( ( buffer ) => {

                            let model = {
                                name:       modelName + '.json',
                                geometry:   new THREE.BufferGeometry(),
                                material:   []
                            };

                            for ( let i = 0, il = config['meta'].materials; i < il; i ++ ) {

                                model.material.push( new THREE.MeshLambertMaterial({ color: 0xaaaaaa }) );

                            }

                            //

                            let facesCount = config['meta']['faces'];
                            let verticesCount = facesCount * 3;

                            // set model attributes

                            let position = new Int16Array( buffer, 0, 3 * verticesCount );
                            let newPos = new Float32Array( position.length );
                            let positionAttr = new THREE.BufferAttribute( newPos, 3 );

                            for ( var j = 0, jl = position.length; j < jl; j ++ ) {

                                newPos[ j ] = position[ j ] / 1000;

                            }

                            model.geometry.addAttribute( 'position', positionAttr );
                            model.geometry.computeVertexNormals();

                            if ( config.meta.uvs !== false ) {

                                let uvs = new Int16Array( buffer, 2 * 3 * verticesCount, 2 * verticesCount );
                                let newUvs = new Float32Array( uvs.length );
                                let uvsAttr = new THREE.BufferAttribute( newUvs, 2 );

                                for ( var j = 0, jl = uvs.length; j < jl; j ++ ) {

                                    newUvs[ j ] = uvs[ j ] / 10000;

                                }

                                model.geometry.addAttribute( 'uv', uvsAttr );

                            }

                            // set model groups

                            for ( let i = 0, il = config.groups.length; i < il; i ++ ) {

                                model.geometry.groups.push({
                                    start:          config.groups[ i ][0],
                                    materialIndex:  config.groups[ i ][1],
                                    count:          config.groups[ i ][2]
                                });

                            }

                            // set model morph buffers if needed

                            var morphTargetsCount = config['meta']['morphTargets'];

                            if ( morphTargetsCount ) {

                                model.geometry.morphAttributes.position = [];
                                model.geometry['morphTargets'] = [];

                                for ( let i = 0, il = config.animations.length; i < il; i ++ ) {

                                    for ( let j = 0, jl = config.animations[ i ].end - config.animations[ i ].start; j < jl; j ++ ) {
                                    
                                        model.geometry['morphTargets'].push({ name: config.animations[ i ].name + j });

                                    }

                                }

                                for ( var j = 0; j < morphTargetsCount; j ++ ) {

                                    let morphInput = new Int16Array( buffer, 2 * ( 5 + 3 * j ) * verticesCount, 3 * verticesCount );
                                    let morph = new Float32Array( morphInput.length );

                                    for ( var k = 0, kl = morphInput.length; k < kl; k ++ ) {

                                        morph[ k ] = morphInput[ k ] / 1000;

                                    }

                                    let morphAttr = new THREE.Float32BufferAttribute( morph, 3 );
                                    model.geometry.morphAttributes.position.push( morphAttr );

                                }

                            }

                            //

                            this.models.push( model );
                            processedItems ++;

                            if ( processedItems === pack.models.length ) {

                                callback();
                                this.loadedPacks.push( packName );

                            }

                        });

                    });

                }

            });

        });

        request.open( 'GET', pack.url, true );
        request.responseType = 'arraybuffer';
        request.send( null );

    };

    private loadModel ( modelName: string, callback ) {

        this.modelLoader.load( 'resources/models/' + modelName, ( g, m ) => {

            let data = {
                name:       modelName,
                geometry:   null,
                material:   m
            };

            g.computeFlatVertexNormals();

            if ( modelName.indexOf('Tree') !== -1 || modelName.indexOf('Rock') !== -1 ) {

                data.geometry = new THREE.BufferGeometry().fromGeometry( g );

            } else {

                data.geometry = g;

            }

            this.models.push( data );
            this.loadedModels ++;

            callback();

        });

    };

    private loadTexture ( textureName: string, callback ) {

        this.textureLoader.load( 'resources/textures/' + textureName, ( texture ) => {

            texture.name = textureName;
            this.textures.push( texture );
            this.loadedTextures ++;

            callback();

        });

    };

    private loadSound ( soundName: string, callback ) {

        this.audioLoader.load( 'resources/sounds/' + soundName, ( buffer ) => {

            buffer.name = soundName;
            this.sounds.push( buffer );
            this.loadedSounds ++;

            callback();

        });

    };

    public load ( onProgress, onFinish ) {

        let loadedItems = this.loadedModels + this.loadedTextures + this.loadedSounds;
        let progress = loadedItems / ( loadedItems + this.soundsList.length + this.modelsList.length + this.texturesList.length );

        if ( this.packsList.length ) {

            this.loadPack( this.packsList.pop(), this.load.bind( this, onProgress, onFinish ) );

            if ( onProgress ) {

                onProgress( progress );

            }

            return;

        }

        if ( this.modelsList.length ) {

            this.loadModel( this.modelsList.pop(), this.load.bind( this, onProgress, onFinish ) );

            if ( onProgress ) {

                onProgress( progress );

            }

            return;

        }

        if ( this.texturesList.length ) {

            this.loadTexture( this.texturesList.pop(), this.load.bind( this, onProgress, onFinish ) );

            if ( onProgress ) {

                onProgress( progress );

            }

            return;

        }

        if ( this.soundsList.length ) {

            this.loadSound( this.soundsList.pop(), this.load.bind( this, onProgress, onFinish ) );

            if ( onProgress ) {

                onProgress( progress );

            }

            return;

        }

        if ( onFinish ) {

            onProgress( progress );
            onFinish();

        }

    };

    public getModel ( name: string ) {

        for ( var i = 0, il = this.models.length; i < il; i ++ ) {

            if ( this.models[ i ].name === name + '.json' ) {

                return this.models[ i ];

            }

        }

        console.warn( 'Model "' + name + '" was not found in Game.ResourceManager.' );

        return false;

    };

    public getTexture ( name: string ) {

        for ( var i = 0, il = this.textures.length; i < il; i ++ ) {

            if ( this.textures[ i ].name === name ) {

                return this.textures[ i ];

            }

        }

        console.warn( 'Texture "' + name + '" was not found in Game.ResourceManager.' );

        return false;

    };

    public getSound ( name: string ) {

        for ( var i = 0, il = this.sounds.length; i < il; i ++ ) {

            if ( this.sounds[ i ].name === name ) {

                return this.sounds[ i ];

            }

        }

        console.warn( 'Sound "' + name + '" was not found in Game.ResourceManager.' );

        return false;

    };

    //

    constructor () {

        if ( ResourceManagerCore.instance ) {

            return ResourceManagerCore.instance;

        }

        ResourceManagerCore.instance = this;

    };

};

//

export let ResourceManager = new ResourceManagerCore();
