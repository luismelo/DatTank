/*
 * @author ohmed
 * DatTank Player core
*/

import * as OMath from "./../OMath/Core.OMath";
import { Logger } from "./../utils/Logger";
import { TowerObject } from "./../objects/core/Tower.Object";
import { TankObject } from "./../objects/core/Tank.Object";
import { TankList as Tanks } from "./../objects/core/Tank.Object";
import { Arena } from "./Arena.Core";
import { TeamCore } from "./Team.Core";
import { TeamManager } from "./../managers/Team.Manager";
import { PlayerNetwork } from "./../network/Player.Network";
import { UI } from "./../ui/Core.UI";
import { TowerManager } from "../managers/Tower.Manager";
import { PlayerManager } from "../managers/Player.Manager";

//

class PlayerCore {

    public id: number;
    public username: string;

    public team: TeamCore;
    public tank: TankObject;

    public kills: number;
    public score: number;
    public bonusLevels: number;

    public level: number = 0;

    private network: PlayerNetwork = new PlayerNetwork();

    //

    public newLevel ( bonusLevels: number ) {

        setTimeout( () => {

            UI.InGame.showTankStatsUpdate( bonusLevels );

        }, 3000 );

        this.bonusLevels = bonusLevels;

    };

    public updateStats ( name: string ) {

        if ( Arena.me.id === this.id ) {

            Logger.newEvent( 'LevelUp', 'game' );

        }

        //

        let stats = {
            'speed':        0,
            'rpm':          1,
            'armour':       2,
            'gun':          3,
            'ammoCapacity': 4
        };
        var levelsStats = {
            speed:          [ 5, 3, 2, 2, 2, 3, 1, 3, 3, 2, 5, 3, 3, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
            rpm:            [ 30, 20, 20, 15, 10, 15, 20, 20, 30, 40, 30, 20, 10, 10, 20, 30, 20, 10, 20, 20, 20, 10, 15 ],
            armour:         [ 40, 30, 20, 20, 30, 40, 50, 20, 30, 50, 30, 20, 10, 10, 20, 20, 30, 20, 10, 15, 20, 10, 10 ],
            gun:            [ 20, 15, 15, 20, 15, 10, 5, 5, 10, 15, 20, 30, 35, 40, 20, 10, 15, 15, 20, 10, 10, 10, 30 ],
            ammoCapacity:   [ 30, 20, 20, 40, 30, 20, 5, 5, 10, 20, 15, 20, 15, 30, 20, 10, 15, 15, 10, 10, 10, 20, 30 ]
        };

        switch ( name ) {

            case 'speed':

                this.tank.speed += levelsStats['speed'][ this.level ];
                break;

            case 'rpm':

                this.tank.rpm += levelsStats['rpm'][ this.level ];
                break;

            case 'armour':

                this.tank.armour += levelsStats['armour'][ this.level ];
                break;

            case 'gun':

                this.tank.bullet += levelsStats['gun'][ this.level ];
                break;

            case 'ammoCapacity':

                this.tank.ammoCapacity += levelsStats['ammoCapacity'][ this.level ];
                break;

            default:

                return false;

        }

        this.network.statsUpdate( stats[ name ] );
        this.level ++;

    };

    private setTank ( params ) {

        let tankName = Tanks.getById( params.typeId );

        if ( tankName ) {

            this.tank = new Tanks[ tankName ]( params );
            this.tank.player = this;

        }

    };

    public triggerRespawn () {

        let tankName = localStorage.getItem( 'currentTank' ) || 'IS2';
        this.network.respawn( Tanks[ tankName ].tid );

        //

        Logger.newEvent( 'Respawn', 'game' );

    };

    public respawn ( params ) {

        if ( Arena.me.id === this.id ) {

            this.tank.dispose();
            this.setTank( params.tank );
            this.tank.init();
            this.level = 0;

            UI.InGame.updateHealth( this.tank.health );
            UI.InGame.updateAmmo( this.tank.ammo );
            UI.InGame.hideContinueBox();
            UI.InGame.refreshAds();

        } else {

            Arena.removePlayer( this );

        }

    };

    public die ( trigger: number ) {

        let killer = PlayerManager.getById( trigger ) || TowerManager.getById( trigger );

        if ( killer ) {

            if ( killer instanceof PlayerCore ) {

                UI.InGame.showKills( killer['username'], this.username, OMath.intToHex( killer.team.color ), OMath.intToHex( this.team.color ) );

            } else {

                UI.InGame.showKills( 'Tower', this.username, OMath.intToHex( killer.team.color ), OMath.intToHex( this.team.color ) );

            }

        }

        if ( this.id === Arena.me.id ) {

            setTimeout( () => {

                if ( killer instanceof TowerObject ) {

                    UI.InGame.showContinueBox( '<br>' + killer.team.name + ' team tower', OMath.intToHex( killer.team.color ) );

                } else if ( killer instanceof TankObject ) {

                    UI.InGame.showContinueBox( killer.player.username, OMath.intToHex( killer.player.team.color ) );

                } else {

                    UI.InGame.showContinueBox( '<br>stray bullet', '#555' );

                }

            }, 1400 );

        }

    };

    public dispose () {

        if ( this.tank ) {

            this.tank.dispose();
            this.tank = null;

        }

        this.network.dispose();

    };

    public update ( time: number, delta: number ) {

        this.tank.update( time, delta );

    };

    public init () {

        this.tank.init();
        this.network.init( this );

        //

        if ( Arena.me && Arena.me.id === this.id ) {

            UI.InGame.updateHealth( this.tank.health );
            UI.InGame.updateAmmo( this.tank.ammo );

        }

    };

    //

    constructor ( params ) {

        this.id = params.id;
        this.username = params.login;
        this.team = TeamManager.getById( params.team );
        this.setTank( params.tank );

    };

};

//

export { PlayerCore };
