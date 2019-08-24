var rolePathFinder = require('role.pathfinder');
var creepAction = require('creep.action');

var roleHarvester = {

  /** @param {Creep} creep **/
  run: function(creep) {
	if(creep.carry.energy < creep.carryCapacity) {
      creepAction.harvest(creep)
    }
    else {
      creepAction.transfer(creep)
    }
  }
};

module.exports = roleHarvester;
