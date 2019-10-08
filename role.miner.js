var creepAction = require('creep.action')

var roleMiner = {
  run: function(creep) {
    if (creep.carry.energy == 0) {
      creep.memory.harvesting = true
    }

	if(creep.carry.energy < creep.carryCapacity && creep.memory.harvesting == true) {
      creepAction.harvest(creep)
      creep.memory.harvesting = true
    }
    else {
      creepAction.transfer(creep)
      creep.memory.harvesting = false
    }
  }
}

module.exports = roleMiner
