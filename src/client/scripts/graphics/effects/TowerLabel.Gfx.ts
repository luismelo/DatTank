/*
 * @author ohmed
 * DatTank Tower label graphics class
*/

import * as THREE from 'three';

import * as OMath from "./../../OMath/Core.OMath";

//

class TowerLabelGfx {

    private tower;
    private canvas;
    private ctx;
    private sprite: THREE.Sprite;

    //

    public update ( health: number, armour: number, teamColor: number ) {

        let width = this.canvas.width;
        let height = this.canvas.height;

        this.ctx.clearRect( 0, 0, width, height );

        this.ctx.shadowColor = '#000';
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        this.ctx.shadowBlur = 4;
    
        // draw health red bg

        this.ctx.fillStyle = OMath.intToHex( OMath.darkerColor( teamColor, 0.3 ) );
        this.ctx.fillRect( 0, 0, 300, 10 );

        // draw health green indicator

        this.ctx.fillStyle = OMath.intToHex( teamColor );
        this.ctx.fillRect( 0, 0, width * ( health / 100 ), 10 );

        // draw health 'amout' lines based on armour

        this.ctx.strokeStyle = 'rgba( 0, 0, 0, 0.3 )';

        for ( var i = 0, il = 3 * armour / 50; i < il; i ++ ) {

            this.ctx.beginPath();
            this.ctx.moveTo( i * width / il, 0 );
            this.ctx.lineTo( i * width / il, 10 );
            this.ctx.stroke();
    
        }

        // draw team color rect

        this.ctx.fillStyle = OMath.intToHex( teamColor );
        this.ctx.fillRect( 0, 15, 25, 25 );

        // draw player login

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '26px Tahoma';
        this.ctx.textAlign = 'left';

        // this.ctx.fillText( login, 30, 35 );

        this.sprite.material.map.needsUpdate = true;

    };

    public init ( target: THREE.Object3D ) {

        target.add( this.sprite );

    };

    //

    constructor () {

        this.canvas = document.createElement( 'canvas' );
        this.canvas.width = 256;
        this.canvas.height = 64;

        this.ctx = this.canvas.getContext('2d');
        let material = new THREE.SpriteMaterial({ map: new THREE.Texture( this.canvas ), color: 0xffffff, fog: true });
        this.sprite = new THREE.Sprite( material );

        this.sprite.position.set( 0, 35, 0 );
        this.sprite.scale.set( 52, 13, 1 );

    };

};

//

export { TowerLabelGfx };
