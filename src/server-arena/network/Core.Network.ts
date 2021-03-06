/*
 * @author ohmed
 * DatTank Network Core sys
*/

import * as ws from 'ws';
import * as fs from 'fs';
import * as https from 'https';

import { TextEncoder } from '../utils/TextEncoder';
import { Environment } from '../environments/Detect.Environment';

//

enum EventDir { IN = 'in', OUT = 'out' };
enum EventType { BIN = 0, JSON = 1 };

//

class NetworkCore {

    private static instance: NetworkCore;

    private io: any;
    private sslIo: any;

    private messageListeners = {};
    private events = {
        in:     {},
        out:    {},
    };

    //

    private registerEvent ( eventName: string, eventDir: EventDir, dataType: EventType, eventId: number ) : void {

        if ( eventDir === EventDir.OUT ) {

            this.events.out[ eventName ] = {
                id:         eventId,
                name:       eventName,
                dataType,
            };

        } else if ( eventDir === EventDir.IN ) {

            this.events.in[ eventId ] = {
                id:         eventId,
                name:       eventName,
                dataType,
            };

        } else {

            console.warn('NetworkCore: Unknown Event Direction type.');

        }

    };

    private onConnect ( socket: ws ) : void {

        socket.on( 'message', this.onMessage.bind( this, socket ) );
        socket.on( 'error', this.onError.bind( this, socket ) );
        socket.on( 'close', this.onDisconnect.bind( this, socket ) );

    };

    private onDisconnect ( socket: ws ) : void {

        const arena = socket['arena'];
        const player = socket['player'];

        if ( arena && player ) {

            player.socket = false;

            setTimeout( () => {

                arena.removePlayer( player );

            }, 4000 );

        }

    };

    private onError ( socket: ws, error: any ) : void {

        console.warn( 'NetworkCore ws error: ', error );

    };

    private onMessage ( socket: ws, data: any ) : void {

        if ( ! data.buffer ) return;
        const arrayBuffer = data.buffer.slice( data.byteOffset, data.byteOffset + data.byteLength );
        const eventId = new Int16Array( arrayBuffer, 0, 1 )[ 0 ];
        const content = new Int16Array( arrayBuffer, 2 );

        this.triggerMessageListener( eventId, content, socket );

    };

    public send ( eventName: string, socket: ws, data: any, dataView?: any ) : boolean {

        if ( ! socket || socket.readyState !== 1 ) return false;

        if ( ! this.events.out[ eventName ] ) {

            console.error( '[NETWORK:SEND_MESSAGE] No event "' + eventName + '" registered.' );
            return false;

        }

        //

        if ( ! data ) {

            data = JSON.stringify( dataView );
            data = TextEncoder.encode( data );

            const newData = new Int16Array( data.length + 1 );

            for ( let i = 0, il = data.length; i < il; i ++ ) {

                newData[ i + 1 ] = data[ i ];

            }

            data = newData;
            data[0] = this.events.out[ eventName ].id;

        } else {

            dataView[0] = this.events.out[ eventName ].id;

        }

        socket.send( data, { binary: true } );
        return true;

    };

    public addMessageListener ( eventName: string, callback: ( data: any, socket: ws ) => void ) : void {

        this.messageListeners[ eventName ] = this.messageListeners[ eventName ] || [];
        this.messageListeners[ eventName ].push( callback );

    };

    public removeMessageListener ( eventName: string, callback: ( data: any, socket: ws ) => void ) : void {

        const newMassageListenersList = [];

        for ( let i = 0, il = this.messageListeners[ eventName ].length; i < il; i ++ ) {

            if ( this.messageListeners[ eventName ][ i ] === callback ) continue;
            newMassageListenersList.push( this.messageListeners[ eventName ][ i ] );

        }

        this.messageListeners[ eventName ] = newMassageListenersList;

    };

    private triggerMessageListener ( eventId: number, data: any, socket: ws ) : void {

        if ( ! this.events.in[ eventId ] ) {

            console.warn( '[NETWORK] Event with ID:' + eventId + ' not found.' );
            return;

        }

        //

        const eventName = this.events.in[ eventId ].name;
        const eventType = this.events.in[ eventId ].dataType;
        const listeners = this.messageListeners[ eventName ] || [];

        if ( eventType === EventType.JSON ) {

            data = TextEncoder.decode( data );
            data = JSON.parse( data );

        }

        for ( let i = 0, il = listeners.length; i < il; i ++ ) {

            if ( listeners[ i ] ) {

                listeners[ i ]( data, socket, eventName );

            }

        }

    };

    private gotPing ( data: Int16Array, socket: ws ) : void {

        const buffer = new ArrayBuffer( 4 );
        const bufferView = new Uint16Array( buffer );
        bufferView[1] = data[0];
        this.send( 'PONG', socket, buffer, bufferView );

    };

    public init () : void {

        if ( this.io ) {

            console.error('NetworkCore: Network already inited.');
            return;

        }

        // register events

        this.registerEvent( 'ArenaJoinRequest', EventDir.IN, EventType.JSON, 0 );
        this.registerEvent( 'ArenaJoinResponse', EventDir.OUT, EventType.JSON, 1 );
        this.registerEvent( 'ArenaPlayerJoined', EventDir.OUT, EventType.JSON, 2 );
        this.registerEvent( 'ArenaPlayerLeft', EventDir.OUT, EventType.BIN, 6 );
        this.registerEvent( 'ArenaLeaderboardUpdate', EventDir.OUT, EventType.JSON, 7 );
        this.registerEvent( 'ArenaPlayerDied', EventDir.OUT, EventType.JSON, 10 );
        this.registerEvent( 'ArenaTanksInRange', EventDir.OUT, EventType.BIN, 50 );
        this.registerEvent( 'ArenaTowersInRange', EventDir.OUT, EventType.BIN, 60 );
        this.registerEvent( 'ArenaBoxesInRange', EventDir.OUT, EventType.BIN, 70 );
        this.registerEvent( 'ArenaChatMessage', EventDir.IN, EventType.JSON, 75 );
        this.registerEvent( 'ArenaChatMessage', EventDir.OUT, EventType.JSON, 76 );
        this.registerEvent( 'ArenaKillSerie', EventDir.OUT, EventType.JSON, 95 );

        //

        this.registerEvent( 'PlayerRespawn', EventDir.OUT, EventType.JSON, 3 );
        this.registerEvent( 'PlayerRespawn', EventDir.IN, EventType.BIN, 4 );

        this.registerEvent( 'PlayerUpdateLevel', EventDir.OUT, EventType.BIN, 90 );
        this.registerEvent( 'PlayerNewArenaSkill', EventDir.OUT, EventType.BIN, 91 );
        this.registerEvent( 'PlayerStatsUpdate', EventDir.OUT, EventType.BIN, 92 );

        //

        this.registerEvent( 'TankFriendlyFire', EventDir.OUT, EventType.BIN, 80 );

        this.registerEvent( 'TankMove', EventDir.OUT, EventType.BIN, 111 );
        this.registerEvent( 'TankMove', EventDir.IN, EventType.BIN, 112 );

        this.registerEvent( 'TankStartShooting', EventDir.IN, EventType.BIN, 115 );
        this.registerEvent( 'TankStopShooting', EventDir.IN, EventType.BIN, 116 );
        this.registerEvent( 'TankMakeShot', EventDir.OUT, EventType.BIN, 117 );

        this.registerEvent( 'TankChangeHealth', EventDir.OUT, EventType.BIN, 118 );
        this.registerEvent( 'TankSetAmmo', EventDir.OUT, EventType.BIN, 119 );

        this.registerEvent( 'TankUpgrade', EventDir.IN, EventType.BIN, 120 );
        this.registerEvent( 'TankUpgrade', EventDir.OUT, EventType.BIN, 121 );

        this.registerEvent( 'TankSyncState', EventDir.OUT, EventType.BIN, 122 );

        this.registerEvent( 'TankStartShooting', EventDir.OUT, EventType.BIN, 123 );
        this.registerEvent( 'TankStopShooting', EventDir.OUT, EventType.BIN, 124 );

        //

        this.registerEvent( 'TowerRotateTop', EventDir.OUT, EventType.BIN, 200 );
        this.registerEvent( 'TowerMakeShot', EventDir.OUT, EventType.BIN, 201 );
        this.registerEvent( 'TowerChangeTeam', EventDir.OUT, EventType.BIN, 202 );
        this.registerEvent( 'TowerSetHealth', EventDir.OUT, EventType.BIN, 203 );

        //

        this.registerEvent( 'ArenaBulletHit', EventDir.OUT, EventType.BIN, 300 );
        this.registerEvent( 'ArenaBoxRemove', EventDir.OUT, EventType.BIN, 301 );

        //

        this.registerEvent( 'PING', EventDir.IN, EventType.BIN, 1000 );
        this.registerEvent( 'PONG', EventDir.OUT, EventType.BIN, 1001 );

        // add ping event listener

        this.addMessageListener( 'PING', this.gotPing.bind( this ) );

        // enable io

        let server;

        if ( Environment.name === 'Production environment' ) {

            server = https.createServer({
                key:    fs.readFileSync('/etc/letsencrypt/live/fr-arena-s1.dattank.io/privkey.pem', 'utf8'),
                cert:   fs.readFileSync('/etc/letsencrypt/live/fr-arena-s1.dattank.io/cert.pem', 'utf8'),
            });

            this.sslIo = new ws.Server({ server });
            this.sslIo.on( 'connection', this.onConnect.bind( this ) );
            server.listen( 443 );

        }

        this.io = new ws.Server({ port: Environment.arena.socketPort });
        this.io.on( 'connection', this.onConnect.bind( this ) );

        //

        console.log( '> DatTank ArenaServer: Network started on port ' + Environment.arena.socketPort );

    };

    //

    constructor () {

        if ( NetworkCore.instance ) {

            return NetworkCore.instance;

        }

        NetworkCore.instance = this;

    };

};

//

export let Network = new NetworkCore();
