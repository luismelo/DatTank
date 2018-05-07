/*
 * @author ohmed
 * DatTank Arena tower manager
*/

import { TowerCore } from "./../core/objects/Tower.Core";
import { TowerList as Towers } from "./../core/objects/Tower.Core";

//

class TowerManagerCore {

    private static instance: TowerManagerCore;
    private towers: Array<TowerCore> = [];

    //

    public add ( params ) {

        let towerName = Towers.getById( params.tid || 0 );
        let tower = new Towers[ towerName ]( params );
        this.towers.push( tower );
        tower.init();

    };

    public remove ( towerIds: Array<number> ) {

        var newTowerList = [];

        for ( var i = 0, il = this.towers.length; i < il; i ++ ) {

            if ( towerIds.indexOf( this.towers[ i ].id ) !== -1 ) {

                this.towers[ i ].dispose();
                continue;

            }

            newTowerList.push( this.towers[ i ] );

        }

        this.towers = newTowerList;

    };

    public getById ( towerId: number ) {

        for ( var i = 0, il = this.towers.length; i < il; i ++ ) {

            if ( this.towers[ i ].id === towerId ) {

                return this.towers[ i ];

            }

        }

        return null;

    };

    public get () {

        return this.towers;

    };

    public update ( time: number, delta: number ) {

        for ( var i = 0, il = this.towers.length; i < il; i ++ ) {

            this.towers[ i ].update( time, delta );

        }

    };

    public init () {

        // todo

    };

    constructor () {

        if ( TowerManagerCore.instance ) {

            return TowerManagerCore.instance;

        }

        TowerManagerCore.instance = this;

    };

};

//

export let TowerManager = new TowerManagerCore();
