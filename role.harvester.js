var creepAction = require('creep.action');

var roleHarvester = {

  /** @param {Creep} creep **/
  run: function(creep) {
	if(creep.carry.energy < creep.carryCapacity) {
      creepAction.harvest(creep)
      creep.memory.harvesting = true
    }
    else {
      creepAction.transfer(creep)
      creep.memory.harvesting = false
    }
  }
};

module.exports = roleHarvester;
