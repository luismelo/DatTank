/*
 * @author ohmed
 * DatTank Player Object Network handler
*/

import * as ws from 'ws';

import { GarageManager } from '../managers/core/Garage.Manager';
import { Network } from '../network/Core.Network';
import { PlayerCore } from '../core/Player.Core';
import { ArenaCore } from '../core/Arena.Core';

//

export class PlayerNetwork {

    private player: PlayerCore;
    private arena: ArenaCore;
    private buffers: object = {};

    //

    private filter ( data: Int16Array, socket: ws ) : boolean {

        const playerId = data[0];
        if ( this.player.id !== playerId ) return true;
        if ( socket['player'].id !== playerId ) return true;
        return false;

    };

    // network events handlers

    private setRespawn ( data: Int16Array, socket: ws ) : void {

        if ( this.filter( data, socket ) ) return;

        const hullId = data[1];
        const cannonId = data[2];
        const armorId = data[3];
        const engineId = data[4];

        const hull = GarageManager.getHullById( hullId );
        const cannon = GarageManager.getCannonById( cannonId );
        const armor = GarageManager.getArmorById( armorId );
        const engine = GarageManager.getEngineById( engineId );

        if ( ! hull || ! cannon || ! armor || ! engine ) return;

        //

        this.player.respawn({ hull: hull.id, cannon: cannon.id, armor: armor.id, engine: engine.id });

    };

    // send via network

    public updateStats () : void {

        this.buffers['UpdateStats'] = this.buffers['UpdateStats'] || {};
        const buffer = this.buffers['UpdateStats'].buffer || new ArrayBuffer( 12 );
        const bufferView = this.buffers['UpdateStats'].bufferView || new Int16Array( buffer );
        this.buffers['UpdateStats'].buffer = buffer;
        this.buffers['UpdateStats'].bufferView = bufferView;

        //

        bufferView[ 1 ] = this.player.id;
        bufferView[ 2 ] = this.player.xp % 10000;
        bufferView[ 3 ] = Math.floor( this.player.xp / 10000 );
        bufferView[ 4 ] = this.player.coins % 10000;
        bufferView[ 5 ] = Math.floor( this.player.coins / 10000 );

        Network.send( 'PlayerStatsUpdate', this.player.socket, buffer, bufferView );

    };

    public warnCheater () : void {

        // nothing here yet
        console.log('Cheater detected.');

    };

    public confirmRespawn () : void {

        this.arena.network.sendEventToAllPlayers( 'PlayerRespawn', null, this.player.toJSON() );

    };

    public updateArenaSkill () : void {

        this.buffers['NewArenaSkill'] = this.buffers['NewArenaSkill'] || {};
        const buffer = this.buffers['NewArenaSkill'].buffer || new ArrayBuffer( 6 );
        const bufferView = this.buffers['NewArenaSkill'].bufferView || new Int16Array( buffer );
        this.buffers['NewArenaSkill'].buffer = buffer;
        this.buffers['NewArenaSkill'].bufferView = bufferView;

        //

        bufferView[ 1 ] = this.player.id;
        bufferView[ 2 ] = this.player.bonusArenaSkills;

        Network.send( 'PlayerNewArenaSkill', this.player.socket, buffer, bufferView );

    };

    public updateLevel () : void {

        this.buffers['PlayerUpdateLevel'] = this.buffers['PlayerUpdateLevel'] || {};
        const buffer = this.buffers['PlayerUpdateLevel'].buffer || new ArrayBuffer( 8 );
        const bufferView = this.buffers['PlayerUpdateLevel'].bufferView || new Int16Array( buffer );
        this.buffers['PlayerUpdateLevel'].buffer = buffer;
        this.buffers['PlayerUpdateLevel'].bufferView = bufferView;

        //

        bufferView[ 1 ] = this.player.id;
        bufferView[ 2 ] = this.player.level;
        bufferView[ 3 ] = this.player.levelBonuses;

        this.arena.network.sendEventToPlayersInRange( this.player.tank.position, 'PlayerUpdateLevel', buffer, bufferView );

    };

    public killSerie ( serie: number ) : void {

        this.arena.network.sendEventToPlayersInRange( this.player.tank.position, 'ArenaKillSerie', null, {
            id:     this.player.id,
            login:  this.player.login,
            team:   this.player.team.id,
            serie,
        });

    };

    //

    public dispose () : void {

        Network.removeMessageListener( 'PlayerRespawn', this.setRespawn );

    };

    constructor ( player: PlayerCore ) {

        this.player = player;
        this.arena = player.arena;

        //

        this.setRespawn = this.setRespawn.bind( this );

        //

        Network.addMessageListener( 'PlayerRespawn', this.setRespawn );

    };

};
