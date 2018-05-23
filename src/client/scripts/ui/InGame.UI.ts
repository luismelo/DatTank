/*
 * @author ohmed
 * DatTank In Game UI module
*/

import * as OMath from "./../OMath/Core.OMath";
import { Arena } from "./../core/Arena.Core";
import { UI } from "./../ui/Core.UI";
import { Game } from "./../Game";
import { TeamCore } from "./../core/Team.Core";
import { GfxCore } from "./../graphics/Core.Gfx";
import { SoundManager } from "./../managers/Sound.Manager";

//

class UIInGameModule {

    public init () {

        $('#viewport-graphics-quality').click( UI.changeQuality.bind( UI ) );
        $('#viewport-sound-on-off').click( UI.changeSound.bind( UI ) );
        $('#viewport-fullscreen-on-off').click( UI.toggleFullscreenMode.bind( UI ) );

    };

    public updateTankStat ( event ) {

        if ( Arena.me.tank.health <= 0 ) return;

        let tank = Arena.me.tank;
        let statName = ( typeof event === 'string' ) ? event : event.target.parentNode.className.replace( 'bonus ', '' );
        Arena.me.updateStats( statName );
        var levelsStats = {
            speed:          [ 5, 3, 2, 2, 2, 3, 1, 3, 3, 2, 5, 3, 3, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
            rpm:            [ 30, 20, 20, 15, 10, 15, 20, 20, 30, 40, 30, 20, 10, 10, 20, 30, 20, 10, 20, 20, 20, 10, 15 ],
            armour:         [ 40, 30, 20, 20, 30, 40, 50, 20, 30, 50, 30, 20, 10, 10, 20, 20, 30, 20, 10, 15, 20, 10, 10 ],
            gun:            [ 20, 15, 15, 20, 15, 10, 5, 5, 10, 15, 20, 30, 35, 40, 20, 10, 15, 15, 20, 10, 10, 10, 30 ],
            ammoCapacity:   [ 30, 20, 20, 40, 30, 20, 5, 5, 10, 20, 15, 20, 15, 30, 20, 10, 15, 15, 10, 10, 10, 20, 30 ]
        };

        //

        $('.stats-update-block .bonus.speed .bonus-title span').html( tank.speed + ' -> ' + ( tank.speed + levelsStats['speed'][ tank.player.level ] ) );
        $('.stats-update-block .bonus.rpm .bonus-title span').html( tank.rpm + ' -> ' + ( tank.rpm + levelsStats['rpm'][ tank.player.level ] ) );
        $('.stats-update-block .bonus.armour .bonus-title span').html( tank.armour + ' -> ' + ( tank.armour + levelsStats['armour'][ tank.player.level ] ) );
        $('.stats-update-block .bonus.gun .bonus-title span').html( tank.bullet + ' -> ' + ( tank.bullet + levelsStats['gun'][ tank.player.level ] ) );
        $('.stats-update-block .bonus.ammo-capacity .bonus-title span').html( tank.ammoCapacity + ' -> ' + ( tank.ammoCapacity + levelsStats['ammoCapacity'][ tank.player.level ] ) );

        SoundManager.playSound('MenuClick');

        //

        Arena.me.bonusLevels --;
        $('.stats-update-block .title').html( 'You have ' + Arena.me.bonusLevels + ' bonus levels.' );

        if ( Arena.me.bonusLevels === 0 ) {

            this.hideTankStatsUpdate();

        }

    };

    public showTankStatsUpdate ( bonusLevels ) {

        if ( Arena.me.tank.health <= 0 ) return;

        let tank = Arena.me.tank;

        var levelsStats = {
            speed:          [ 5, 3, 2, 2, 2, 3, 1, 3, 3, 2, 5, 3, 3, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
            rpm:            [ 30, 20, 20, 15, 10, 15, 20, 20, 30, 40, 30, 20, 10, 10, 20, 30, 20, 10, 20, 20, 20, 10, 15 ],
            armour:         [ 40, 30, 20, 20, 30, 40, 50, 20, 30, 50, 30, 20, 10, 10, 20, 20, 30, 20, 10, 15, 20, 10, 10 ],
            gun:            [ 20, 15, 15, 20, 15, 10, 5, 5, 10, 15, 20, 30, 35, 40, 20, 10, 15, 15, 20, 10, 10, 10, 30 ],
            ammoCapacity:   [ 30, 20, 20, 40, 30, 20, 5, 5, 10, 20, 15, 20, 15, 30, 20, 10, 15, 15, 10, 10, 10, 20, 30 ]
        };

        $('.stats-update-block .bonus .increase').off();

        $('.stats-update-block .bonus.speed .bonus-title span').html( tank.speed + ' -> ' + ( tank.speed + levelsStats['speed'][ tank.player.level ] ) );
        $('.stats-update-block .bonus.rpm .bonus-title span').html( tank.rpm + ' -> ' + ( tank.rpm + levelsStats['rpm'][ tank.player.level ] ) );
        $('.stats-update-block .bonus.armour .bonus-title span').html( tank.armour + ' -> ' + ( tank.armour + levelsStats['armour'][ tank.player.level ] ) );
        $('.stats-update-block .bonus.gun .bonus-title span').html( tank.bullet + ' -> ' + ( tank.bullet + levelsStats['gun'][ tank.player.level ] ) );
        $('.stats-update-block .bonus.ammo-capacity .bonus-title span').html( tank.ammoCapacity + ' -> ' + ( tank.ammoCapacity + levelsStats['ammoCapacity'][ tank.player.level ] ) );

        $('.stats-update-block').show();
        $('.level-indicator-block').hide();
        $('.stats-update-block .title').html( 'You have ' + bonusLevels + ' bonus levels.' );
        $('.stats-update-block .bonus .increase').click( this.updateTankStat.bind( this ) );

        $( document ).bind( 'keypress', this.statsUpdateByKey.bind( this ) );

    };

    private statsUpdateByKey ( event ) {

        switch ( event.keyCode ) {

            case 49:

                this.updateTankStat('speed');
                break;

            case 50:

                this.updateTankStat('rpm');
                break;

            case 51:

                this.updateTankStat('armour');
                break;

            case 52:

                this.updateTankStat('gun');
                break;

            case 53:

                this.updateTankStat('ammoCapacity');
                break;

        }

    };

    public updateLevelProgress () {

        let levels = [ 0, 10, 30, 60, 100, 150, 250, 340, 500, 650, 1000, 1400, 1900, 2500, 3000, 3800, 4500, 5500, 6700, 7200, 8700, 9800, 12000 ];
        let level = 0;

        while ( levels[ level ] <= Arena.me.score ) {

            level ++;

        }

        level --;

        let levelProgress = 100 * ( Arena.me.score - levels[ level ] ) / ( levels[ level + 1 ] - levels[ level ] );
        $('.level-indicator-block .title').html( 'Level ' + level + ' (' + Math.floor( levelProgress ) + '%)' );
        $('.level-indicator-block .progress-bar .progress-indicator').css( 'width', levelProgress + '%' );

    };

    public hideTankStatsUpdate () {

        $('.stats-update-block').hide();
        $('.level-indicator-block').show();
        $( document ).unbind( 'keypress' );

    };

    public showContinueBox ( username, color ) {

        this.hideTankStatsUpdate();

        $('#viewport #renderport').addClass('dead');

        $('#continue-box-wrapper #continue-btn').off();
        $('#continue-box-wrapper #continue-btn').click( () => {

            Arena.me.triggerRespawn();

        });

        $('#continue-box-wrapper').show();
        $('#continue-box-wrapper #continue-box-wrapper-title').html('<p>Killed by <span style="color:'+ color + '">' + username +'</span></p>');
        $('#continue-box-wrapper #change-tank').click( Game.garage.show.bind( Game.garage ) );

        setTimeout( () => {

            $('#continue-box-wrapper').css( 'opacity', 1 );

        }, 100 );

    };

    public hideContinueBox () {

        $('#viewport #renderport').removeClass('dead');
        $('#continue-box-wrapper').css( 'opacity', 0 );

        setTimeout( () => {

            $('#continue-box-wrapper').hide();

        }, 200);

    };

    public showDisconectMessage () {

        $('.disconnect-warning').show();

    };

    public updateHealth ( value: number ) {

        $('#health-number').html( value + "" );
        $('#empty-health-image').css( 'height', ( 100 - value ) + '%' );

    };

    public updateAmmo ( value: number ) {

        $('#ammo-number').html( value + "" );

    };

    public setAmmoReloadAnimation ( duration: number ) {

        var element = $('#empty-ammo-image');
        // -> removing the class
        element.removeClass('ammo-animation');
        element.css( 'height', '100%' );

        // -> triggering reflow / The actual magic /
        // without this it wouldn't work. Try uncommenting the line and the transition won't be retriggered.
        element[0].offsetWidth;
        element.css( 'background-image', 'url(../resources/img/ammo.png)' );

        // -> and re-adding the class
        element.addClass('ammo-animation');
        element.css( 'animation-duration', 1.2 * duration + 'ms' );

    };

    public showKills = function ( killer: string, killed: string, killerColor: string, killedColor: string ) {

        $('#kill-events').append( '<p><span style="color:' + killerColor + '">' + killer +'</span> killed <span style="color:' + killedColor + '">' + killed + '</span>!</p>');

        if ( $('#kill-events').children().length > 5 ) {

            $('#kill-events p').first().remove();

        }

    };

    public updateLeaderboard ( players ) {

        let me = Arena.me;
        let names = $('#top-killers .player-name');
        let kills = $('#top-killers .kills');
        let teams = $('#top-killers .players-team-image');
        let rows = $('#top-killers .killer-outer');
        let meInTop = false;

        rows.removeClass('myplace');

        for ( let i = 0; i < 5; i ++ ) {

            if ( i < players.length ) {

                $( names[ i ] ).html( players[ i ].login );
                $( kills[ i ] ).html( players[ i ].score + '/' + players[ i ].kills );
                $( teams[ i ] ).css( 'background-color', OMath.intToHex( TeamCore.colors[ players[ i ].team ] ) );
                $( rows[ i ] ).show();

                if ( me && players[ i ].id === me.id ) {

                    $( rows[ i ] ).addClass('myplace');
                    meInTop = true;
                    me.score = players[ i ].score;
                    me.kills = players[ i ].kills;

                }

            } else {

                $( rows[ i ] ).hide();

            }

        }

        //

        if ( ! meInTop ) {

            let rank = 0;

            for ( let i = 0, il = players.length; i < il; i ++ ) {

                if ( me && players[ i ].id === me.id ) {

                    rank = i + 1;
                    me.score = players[ i ].score;
                    me.kills = players[ i ].kills;
                    break;

                }

            }

            if ( rank === 0 ) return;

            $('#top-killers .killer-outer.last .player-counter').html( '#' + rank );
            $('#top-killers .killer-outer.last .player-name').html( me.username );
            $('#top-killers .killer-outer.last .kills').html( me.score + '/' + me.kills );
            $('#top-killers .killer-outer.last .players-team-image').css( 'background-color', OMath.intToHex( me.team.color ) );

            $('#top-killers #divider').show();
            $('#top-killers .killer-outer.last').show();
            $('#top-killers .killer-outer.last').addClass('myplace');

        } else {

            $('#top-killers #divider').hide();
            $('#top-killers .killer-outer.last').hide();

        }

        this.updateLevelProgress();

    };

    public updateTeamScore ( teams ) {

        let list = $( '#team-params .team-number' );

        for ( let i = 0, il = list.length; i < il; i ++ ) {

            $( list[ i ] ).html( teams[ i ].score + '%' );

        }

    };

    public showViewport () {

        $('#viewport').show();

    };

};

//

export { UIInGameModule };
