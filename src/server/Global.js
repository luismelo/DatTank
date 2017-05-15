/*
 * @author ohmed
 * Global params for server
*/

var os = require('os');
var argparse = require('argparse');

//

var parser = new argparse.ArgumentParser();

parser.addArgument(['--debug'], {
    action: 'storeTrue',
    defaultValue: false
});

var args = parser.parseArgs();

global.DEBUG = args.debug;
global.SOCKET_PORT = 8085;

//

global.utils = require('./utils/Utils');
global.Game = require('./core/Game');
global.Game.Vec2 = require('./utils/Vector2');
global.Game.Vec3 = require('./utils/Vector3');

// import game managers

global.Game.DecorationManager = require('./managers/DecorationManager');
global.Game.PathManager = require('./managers/PathManager');
global.Game.BoxManager = require('./managers/BoxManager');
global.Game.NetworkManager = require('./managers/NetworkManager');
global.Game.PlayerManager = require('./managers/PlayerManager');
global.Game.BotManager = require('./managers/BotManager');
global.Game.TeamManager = require('./managers/TeamManager');
global.Game.TowerManager = require('./managers/TowerManager');
global.Game.ArenaManager = require('./managers/ArenaManager');
global.Game.CollisionManager = require('./managers/CollisionManager');

// import main objects

global.Game.EventDispatcher = require('./core/EventDispatcher');
global.Game.Arena = require('./core/Arena');
global.Game.Team = require('./core/Team');
global.Game.Player = require('./core/Player');
global.Game.Bot = require('./core/Bot');

// import tank units

global.Game.Tower = require('./objects/core/Tower');

global.Game.Tank = require('./objects/core/Tank');

global.Game.Tank.USAT54 = require('./objects/tanks/USA-T54');
global.Game.Tank.UKBlackPrince = require('./objects/tanks/UK-BlackPrince');
global.Game.Tank.D32 = require('./objects/tanks/D-32');

global.Game.Decoration = require('./objects/core/Decoration');

global.Game.Decoration.Tree = require('./objects/decorations/Tree');
global.Game.Decoration.Tree1 = require('./objects/decorations/Tree1');
global.Game.Decoration.Tree2 = require('./objects/decorations/Tree2');
global.Game.Decoration.Tree3 = require('./objects/decorations/Tree3');
global.Game.Decoration.Stones = require('./objects/decorations/Stones');
global.Game.Decoration.Stones1 = require('./objects/decorations/Stones1');
global.Game.Decoration.Stones2 = require('./objects/decorations/Stones2');
global.Game.Decoration.OldCastle = require('./objects/decorations/OldCastle');

// import Improvement boxes

global.Game.Box = require('./objects/core/Box');
global.Game.Box.Health = require('./objects/boxes/Health');
global.Game.Box.Ammo = require('./objects/boxes/Ammo');

//

global.game = new Game();
global.networkManager = new Game.NetworkManager();
