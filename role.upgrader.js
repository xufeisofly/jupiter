var rolePathFinder = require('role.pathfinder');

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
      if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
        /* creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}}); */
        let ret = rolePathFinder.run(creep, creep.room.controller)
        creep.move(creep.pos.getDirectionTo(ret.path[0]))
      }
    }
    else {
      /* var sources = creep.room.find(FIND_SOURCES); */
      var closestSource = creep.pos.findClosestByRange(FIND_SOURCES)
      if(creep.harvest(closestSource) == ERR_NOT_IN_RANGE) {
        /* creep.moveTo(closestSource, {visualizePathStyle: {stroke: '#ffaa00'}}); */
        let ret = rolePathFinder.run(creep, closestSource)
        creep.move(creep.pos.getDirectionTo(ret.path[0]))
      }
    }
  }
};

module.exports = roleUpgrader;
