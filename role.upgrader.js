var rolePathFinder = require('role.pathfinder');
var creepAction = require('creep.action');

var roleUpgrader = {

  /** @param {Creep} creep **/
  run: function(creep) {

    if(creep.memory.upgrading && creep.carry.energy == 0) {
      creep.memory.upgrading = false;
      creep.say('🔄 harvest');
	}
	if(!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
	  creep.memory.upgrading = true;
	  creep.say('⚡ upgrade');
	}

	if(creep.memory.upgrading) {
      creepAction.upgrade(creep)
    }
    else {
      creepAction.harvest(creep)
    }
  }
};

module.exports = roleUpgrader;
