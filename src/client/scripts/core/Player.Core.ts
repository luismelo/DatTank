/*
 * @author ohmed
 * DatTank Player core
*/

import { Logger } from '../utils/Logger';
import { TankObject } from '../objects/core/Tank.Object';
import { Arena } from './Arena.Core';
import { TeamCore } from './Team.Core';
import { TeamManager } from '../managers/Team.Manager';
import { PlayerNetwork } from '../network/Player.Network';
import { UI } from '../ui/Core.UI';

//

export class PlayerCore {

    public id: number;
    public username: string;

    public team: TeamCore;
    public tank: TankObject | null;

    public coins: number;
    public xp: number;
    public level: number = 0;
    public kills: number = 0;
    public score: number = 0;
    public arenaLevel: number = 0;
    public bonusArenaLevels: number = 0;

    private network: PlayerNetwork = new PlayerNetwork();

    //

    public updateStats ( xp: number, coins: number ) : void {

        Arena.myCoins = coins;
        Arena.myXP = xp;

        window['userData'].coins = coins;
        window['userData'].xp = xp;

        UI.InGame.updateXPCoins( xp, coins );

    };

    public newArenaLevel ( bonusArenaLevels: number ) : void {

        setTimeout( () => {

            UI.InGame.tankUpgradeMenu.showUpgradeMenu( bonusArenaLevels );

        }, 3000 );

        this.bonusArenaLevels = bonusArenaLevels;

    };

    private prepareTank ( params: any ) : void {

        this.tank = new TankObject( params );
        this.tank.player = this;

    };

    public triggerRespawn () : void {

        if ( ! this.tank ) return;

        this.network.respawn({
            base:       this.tank.base.nid,
            cannon:     this.tank.cannon.nid,
            armor:      this.tank.armor.nid,
            engine:     this.tank.engine.nid,
        });

        //

        Logger.newEvent( 'Respawn', 'game' );

    };

    public respawn ( params: any ) : void {

        if ( Arena.me.id === this.id && this.tank ) {

            this.prepareTank( params.tank );
            this.tank.init();

            UI.InGame.updateHealth( this.tank.health );
            UI.InGame.updateAmmo( this.tank.ammo );
            UI.InGame.hideContinueBox();
            UI.InGame.refreshAds();

        } else {

            Arena.removePlayer( this );

        }

    };

    public dispose () : void {

        if ( this.tank ) {

            this.tank.dispose();
            this.tank = null;

        }

        this.network.dispose();

    };

    public update ( time: number, delta: number ) : void {

        if ( this.tank ) {

            this.tank.update( time, delta );

        }

    };

    public init () : void {

        if ( ! this.tank ) {

            return;

        }

        this.tank.init();
        this.network.init( this );

        //

        if ( Arena.me && Arena.me.id === this.id ) {

            UI.InGame.updateHealth( this.tank.health );
            UI.InGame.updateAmmo( this.tank.ammo );

        }

    };

    //

    constructor ( params: any ) {

        this.id = params.id;
        this.username = params.login;
        this.level = params.level;

        //

        const team = TeamManager.getById( params.team );

        if ( team ) {

            this.team = team;
            this.prepareTank( params.tank );

        }

    };

};
