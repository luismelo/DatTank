/*
 * @author ohmed
 * DatTank Player Object Network handler
*/

import { Network } from "./../network/Core.Network";
import { PlayerCore } from "./../core/Player.Core";
import { ArenaCore } from "./../core/Arena.Core";

//

class PlayerNetwork {

    private player: PlayerCore;
    private arena: ArenaCore;
    private buffers: object = {};

    //

    private filter ( data: Int16Array ) : boolean {

        let playerId = data[0];
        if ( this.player.id !== playerId ) return true;
        return false;

    };

    // network events handlers

    private setRespawn ( data: Int16Array ) {

        if ( this.filter( data ) ) return;

        let tankTypeId = data[1];
        let tankList = { 0: 'IS2', 1: 'T29', 2: 'T44', 3: 'T54' };
        let tankName = tankList[ tankTypeId ];
        this.player.respawn( tankName );

    };

    // send via network

    public confirmRespawn () {

        this.arena.network.sendEventToAllPlayers( 'PlayerRespawn', null, this.player.toJSON() );

    };

    public updateLevel () {

        this.buffers['NewLevel'] = this.buffers['NewLevel'] || {};
        let buffer = this.buffers['NewLevel'].buffer || new ArrayBuffer( 6 );
        let bufferView = this.buffers['NewLevel'].bufferView || new Int16Array( buffer );
        this.buffers['NewLevel'].buffer = buffer;
        this.buffers['NewLevel'].bufferView = bufferView;

        //

        bufferView[ 1 ] = this.player.id;
        bufferView[ 2 ] = this.player.bonusLevels;

        Network.send( 'PlayerNewLevel', this.player.socket, buffer, bufferView );

    };

    //

    constructor ( player: PlayerCore ) {

        this.player = player;
        this.arena = player.arena;

        //

        this.setRespawn = this.setRespawn.bind( this );

        //

        Network.addMessageListener( 'PlayerRespawn', this.setRespawn );

    };

};

//

export { PlayerNetwork };
