/*
 * @author ohmed
 * DatTank Bot Core
*/

import * as OMath from "./../OMath/Core.OMath";
import { ArenaCore } from "./Arena.Core";
import { PlayerCore } from "./Player.Core";

//

class BotCore {

    private static LoginBase = [
        null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null,
        'calzone', 'augmenton', 'celianaro', 'pantor', 'elementalium', 'gazer', 'velent', 'oddio', 'taker', 'windmill',
        'soliter', 'roadkiller', 'bambuno', 'tratatar', 'sulfurio', 'helioss', 'seba', 'tracy', 'sandman', 'wooka', 'killdrop', 'warang',
        'HEqpOPMaJI', 'X_A_M', 'Vadic', '@did@s', 'Alliance', 'TRAKTORIST', 'MaJoR$', 'DeRJkiY', ']{olyan@', 'kaban', 'Semkiv', 'Agent',
        'CJIeCaPb', 'Delros',  'T0rM@Z', 'MAKAROV', 'T0rM@Z', 'Adas', 'bandit', 'Chetkii', 'Artuomchik', 'buben', 'DonKarleone', 'accura2k_',
        'GOPNIK', 'KabaniyKlyk', 'Kermit', 'KoLяN4Uk', 'KraCaV4nK', 'limon4ello', 'master_of_ceremony', 'Mr_Zaza', 'Biwen', 'ne_zli', 'NURCHIK',
        'StrannicK', 'Tîgrrr', 'Timent', 'Vision', 'X_A_M_E_P', 'Marckiz', 'bigman', 'creed', 'DarkFantastik', 'SlowPok', 'NaGiBatoR',
        'FRESH_MEAT', 'LegendarY', 'Rabbit_wolf', 'iJseven', 'Ha_KoJleHu_OJleHu', 'Vertyxan', 'kirpa', 'dindi', 'dildo', 'moskva', 'opz',
        'x_Evil_x', 'cTaTucT_kycToDpoT', 'TaNkIsT228', 'LaRDeN', 'EHOT', 'CruzTanks', 'Mazay_Ded', 'Dark_Foch', 'FL1pSTaR', 'SkyDog',
        'Nevrox', 'AWAJA', 'GrizeR', 'Jove_V_KyStax', 'Zybinjo', 'Pro1004EloVe4Ek', 'Ben_Laden', 'DeLviR', 'SkyLiTeR', '_fly_', '4ypa-4yps',
        'your mom', 'ok', 'ffff', '123', 'lol', 'lalaka', 'burzum', 'zeka', 'korb', 'zimba', 'koss', 'russka kurva', 'kol', 'atari', 'kombo',
        'per4uk', 'qwddcc', 'qwerty', 'zopa', 'timba', 'karramba', 'abdul', 'dx', 'ed', 'eddy', 'freeman', 'wow', 'tom', 'sin', 'cos', 'io',
        'datkiller', 'paul', 'lucifer', 'zomb', 'zombie', 'zombie666', 'devil', 'moskal', 'USSR', 'ripper', 'felix', '911', 'mamal', 'sdf',
        'kiss', 'die_wegan', 'jelly', 'oppa', 'dizer', 'dendy', 'paranoid', 'android', 'mathafaka', 'sirian', 'ajar', 'asian', 'nervos',
        'gblz', 'trevor', 'lol poney', 'matardar', 'diego', 'sniper', 'kemper', 'datend', 'kiba', 'andromeda', 'feedback', 'shotback',
        'wtf', 'dat kurwa', 'dfbgnhg', 'andy', 'фффф', 'опачик', 'pavel', 'T52', 'NZT', 'D3', 'Bimba', 'makaka', 'мразь', '...', 'kibaba',
        'kebab', 'nazzi', 'nippy', 'romb', 'opa', 'zip', 'rarka', 'limbo', '21k', 'kilo', 'jesus', 'kepasa', 'kantor', '456453425', 'upyr',
        'kinchasa', 'lover', 'marta', 'ochkar', 'poseidon', 'zeus', 'stalker', 'vova', 'vovchik', 'poop', 'yamaha', 'сука', 'упячка',
        'танк', 'кузя', 'kolyan', 'zadrot', 'lamp', 'kozavka', 'dikar', 'artist', 'kopa', 'chicken', 'orbea', 'z358', 'hjgdfd', 'sdfdgdg'
    ];

    //

    public id: number;
    public player: PlayerCore;
    public removed: boolean = false;
    public login: string;

    private moveDuration: number = null;
    private rotateBaseDuration: number = null;
    private maxKills: number;
    private lastTopRotate: number;

    private arena: ArenaCore;

    //

    public levelUp () {

        let statId = Math.floor( Math.random() * 4 );
        this.player.tank.updateStats( statId );

    };

    public die () {

        let players = this.arena.playerManager.getPlayers();
        let bots = this.arena.botManager.getBots();
        let botNum = this.arena.botManager.botNum;

        if ( players.length - bots.length < botNum && this.player.kills < this.maxKills ) {

            setTimeout( this.player.respawn.bind( this.player ), 3000 );

        } else {

            setTimeout( () => {

                if ( this.arena.disposed ) return;
                this.arena.botManager.remove( this );

            }, 2000 );

        }

    };

    private pickLogin () {

        let login = '';
        let bots = this.arena.botManager.getBots();

        while ( login === '' ) {

            login = BotCore.LoginBase[ Math.floor( BotCore.LoginBase.length * Math.random() ) ];

            if ( ! login ) {

                for ( let i = 0; i < bots.length; i ++ ) {

                    if ( login === bots[ i ].login ) {

                        login = '';

                    }

                }

            }

        }

        return login;

    };

    private init () {

        let tank;
        let rnd = Math.random();

        if ( rnd <= 0.25 ) {

            tank = 'IS2';

        } else if ( rnd > 0.25 && rnd <= 0.5 ) {

            tank = 'T29';

        } else if ( rnd > 0.5 && rnd <= 0.75 ) {

            tank = 'T44';

        } else {

            tank = 'T54';

        }

        this.player = this.arena.addPlayer({ login: this.login, tank: tank, socket: false });
        this.player.tank.ammo = 10000000;
        this.player.bot = this;

    };

    public update ( delta: number, time: number ) {

        if ( this.player.tank.health <= 0 ) return;

        if ( ! this.player.tank.moveDirection.x ) {

            let x = ( Math.random() > 0.5 ) ? 1 : -1;
            this.player.tank.setMovement( x, this.player.tank.moveDirection.y );
            this.moveDuration = Math.floor( 8000 * Math.random() ) + 1000;

        }

        if ( this.rotateBaseDuration === null ) {

            let y = Math.floor( 3 * Math.random() ) - 1;
            this.player.tank.setMovement( this.player.tank.moveDirection.x, y );
            this.rotateBaseDuration = Math.floor( 500 * Math.random() ) + 500;

        }

        //

        if ( this.moveDuration !== null || this.rotateBaseDuration !== null ) {

            this.moveDuration = ( this.moveDuration !== null ) ? this.moveDuration - 40 : null;
            this.rotateBaseDuration = ( this.rotateBaseDuration !== null ) ? this.rotateBaseDuration - 40 : null;

            if ( this.moveDuration <= 0 && this.moveDuration !== null ) {

                this.player.tank.setMovement( 0, this.player.tank.moveDirection.y );
                this.moveDuration = null;

            }

            if ( this.rotateBaseDuration <= 0 && this.rotateBaseDuration !== null ) {

                this.player.tank.setMovement( this.player.tank.moveDirection.x, 0 );
                this.rotateBaseDuration = null;

            }

        }

        //

        let target = null;
        let minDist = 1000;
        let tanks = this.arena.tankManager.getTanks();
        let towers = this.arena.towerManager.getTowers();
        let distance;

        // search for Player target

        for ( let i = 0, il = tanks.length; i < il; i ++ ) {

            let tank = tanks[ i ];

            if ( tank.team === this.player.team || tank.health <= 0 ) continue;

            distance = tank.position.distanceTo( this.player.tank.position );

            if ( distance <= minDist ) {

                minDist = distance;
                target = tank;

            }

        }

        // if ! target search for Tower target

        if ( ! target || minDist > 280 ) {

            minDist = 1000;

            for ( let i = 0, il = towers.length; i < il; i ++ ) {

                let tower = towers[ i ];

                if ( tower.team === this.player.team ) continue;

                distance = this.player.tank.position.distanceTo( tower.position );

                if ( distance <= minDist ) {

                    minDist = distance;
                    target = tower;

                }

            }

        }

        //

        if ( target && minDist < 280 ) {

            let dx = this.player.tank.position.x - target.position.x;
            let dz = this.player.tank.position.z - target.position.z;
            let rotation, deltaAngle;

            rotation = Math.atan2( dx, dz ) + Math.PI / 2 - this.player.tank.rotation;
            deltaAngle = OMath.formatAngle( rotation ) - OMath.formatAngle( this.player.tank.rotationTop );
            deltaAngle = ( deltaAngle > Math.PI ) ? deltaAngle - 2 * Math.PI : deltaAngle;
            deltaAngle = ( deltaAngle < - Math.PI ) ? - deltaAngle + 2 * Math.PI : deltaAngle;

            if ( Math.abs( deltaAngle ) > 0.1 && Date.now() - this.lastTopRotate > 40 ) {

                this.player.tank.setTopRotation( this.player.tank.rotationTop + Math.sign( deltaAngle ) / 15 );
                this.lastTopRotate = Date.now();

            }

            if ( deltaAngle < 0.2 && minDist < 280 ) {

                this.player.tank.makeShot();

            }

        }

    };

    //

    constructor ( arena: ArenaCore ) {

        this.arena = arena;
        this.maxKills = Math.floor( Math.random() * 60 ) + 8;
        this.login = this.pickLogin();
        this.lastTopRotate = Date.now();

        this.init();

    };

};

//

export { BotCore };