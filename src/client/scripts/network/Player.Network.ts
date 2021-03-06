/*
 * @author ohmed
 * DatTank Player network handler
*/

import { Network } from '../network/Core.Network';
import { PlayerCore } from '../core/Player.Core';

//

export class PlayerNetwork {

    private player: PlayerCore;
    private buffers = {};

    //

    private filter ( data: any ) : boolean {

        const playerId = ( data.id ) ? data.id : data[0];
        if ( this.player.id !== playerId ) return true;

        return false;

    };

    //

    private setRespawn ( data: any ) : void {

        if ( this.filter( data ) ) return;

        this.player.respawn( data );

    };

    private setArenaSkill ( data: any ) : void {

        if ( this.filter( data ) ) return;

        const playerArenaSkill = data[1];
        this.player.newArenaSkill( playerArenaSkill );

    };

    private setStats ( data: any ) : void {

        if ( this.filter( data ) ) return;

        const xp = data[2] * 10000 + data[1];
        const coins = data[4] * 10000 + data[3];

        this.player.updateStats( xp, coins );

    };

    private updateLevel ( data: any ) : void {

        if ( this.filter( data ) ) return;

        const level = data[1];
        const levelBonus = data[2];

        this.player.updateLevel( level, levelBonus );

    };

    //

    public respawn ( params: any ) : void {

        let buffer;
        let bufferView;

        if ( ! this.buffers['Respawn'] ) {

            buffer = new ArrayBuffer( 12 );
            bufferView = new Int16Array( buffer );

            this.buffers['Respawn'] = {
                buffer,
                view:       bufferView,
            };

        } else {

            buffer = this.buffers['Respawn'].buffer;
            bufferView = this.buffers['Respawn'].view;

        }

        //

        bufferView[1] = this.player.id;
        bufferView[2] = params.hull;
        bufferView[3] = params.cannon;
        bufferView[4] = params.armor;
        bufferView[5] = params.engine;

        //

        Network.send( 'PlayerRespawn', buffer, bufferView );

    };

    public sendChatMessage ( message: string ) : void {

        Network.send( 'PlayerChatMessage', false, {
            playerId: this.player.id,
            message,
        });

    };

    //

    public dispose () : void {

        Network.removeMessageListener( 'PlayerRespawn', this.setRespawn );
        Network.removeMessageListener( 'PlayerNewArenaSkill', this.setArenaSkill );
        Network.removeMessageListener( 'PlayerStatsUpdate', this.setStats );
        Network.removeMessageListener( 'PlayerUpdateLevel', this.updateLevel );

    };

    public init ( player: PlayerCore ) : void {

        this.player = player;

        //

        this.setRespawn = this.setRespawn.bind( this );
        this.setArenaSkill = this.setArenaSkill.bind( this );
        this.setStats = this.setStats.bind( this );
        this.updateLevel = this.updateLevel.bind( this );

        //

        Network.addMessageListener( 'PlayerRespawn', this.setRespawn );
        Network.addMessageListener( 'PlayerNewArenaSkill', this.setArenaSkill );
        Network.addMessageListener( 'PlayerStatsUpdate', this.setStats );
        Network.addMessageListener( 'PlayerUpdateLevel', this.updateLevel );

    };

};
