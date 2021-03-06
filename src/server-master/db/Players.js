/*
 * @author ohmed
 * DatTank players mongoDB schema
*/

var mongoose = require('mongoose');

//

var PlayersSchema = mongoose.Schema({

    fid: {
        type: String
    },
    pid: {
        type: String,
    },
    sid: {
    	type: String
    },
    coins: {
        type: Number
    },
    params: {
        type: Object,
        default: {
            hull:      { 'IS2001': { active: true, level: 1 } },
            cannon:    { 'Plasma-g1': { active: true, level: 1 } },
            engine:    { 'KX-v8': { active: true, level: 1 } },
            armor:     { 'X-shield': { active: true, level: 1 } }
        }
    },
    xp: {
        type: Number
    },
    level: {
        type: Number
    },
    levelBonuses: {
        type: Number
    },
    lastVisit: {
        type: Date
    }

});

//

module.exports = mongoose.model( 'Players', PlayersSchema );
