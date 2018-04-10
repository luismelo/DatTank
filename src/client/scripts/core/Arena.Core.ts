/*
 * @author ohmed
 * DatTank Arena core
*/

import { TeamManager } from "./../managers/Team.Manager";
import { PlayerManager } from "./../managers/Player.Manager";
import { TowerManager } from "./../managers/Tower.Manager";
import { BoxManager } from "./../managers/Box.Manager";

import { PlayerCore } from "./Player.Core";

//

class ArenaCore {

    private serverIP: string;
    private serverID: string;

    public teams: TeamManager = new TeamManager();
    public players: PlayerManager = new PlayerManager();
    public towers: TowerManager = new TowerManager();
    public boxes: BoxManager = new BoxManager();

    public me: PlayerCore;

    private prevUpdateTime: number;
    private time: number;
    private updateTimeRemainder: number = 0;
    private updateInterval: number;
    private updateIntervalDuration: number = 20;

    //

    public preInit ( ip: string, id: string ) {

        this.serverIP = ip;
        this.serverID = id;

    };

    public init ( data ) {

        this.prevUpdateTime = Date.now();
        this.time = Date.now();
        this.updateInterval = setInterval( this.update.bind( this ), this.updateIntervalDuration );

    };

    public newTowers ( data ) {

        // todo

    };

    public newPlayers ( data ) {

        // todo

    };

    public newBoxes ( data ) {

        // todo

    };

    public dispose () {

        clearInterval( this.updateInterval );

    };

    private update ( time: number, delta: number ) {

        var time = Date.now();
        var delta = time - this.prevUpdateTime + this.updateTimeRemainder;

        this.updateTimeRemainder = delta % this.updateIntervalDuration;
        delta = delta - this.updateTimeRemainder;
        this.prevUpdateTime = time;

        //

        for ( var i = 0, il = Math.floor( delta / this.updateIntervalDuration ); i < il; i ++ ) {

            this.time += delta;
            this.update( this.time, this.updateIntervalDuration );
    
        }

    };

};

//

export { ArenaCore };
