var creepAction = {
  harvest: function(creep) {
    var closestSource = creep.pos.findClosestByRange(FIND_SOURCES)
    if(creep.harvest(closestSource) == ERR_NOT_IN_RANGE) {
      let ret = rolePathFinder.run(creep, closestSource)
      creep.move(creep.pos.getDirectionTo(ret.path[0]))
    }
  },
  transfer: function(creep) {
    var targets = creep.room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return ([STRUCTURE_EXTENSION, STRUCTURE_TOWER, STRUCTURE_SPAWN].includes(structure.structureType)) &&
               structure.energy < structure.energyCapacity;
      }
    });
    if(targets.length > 0) {
      if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        let ret = rolePathFinder.run(creep, targets[0])
        creep.move(creep.pos.getDirectionTo(ret.path[0]))
      }
    }
  },
  build: function(creep) {
    var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
    if(targets.length > 0) {

      if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
        let ret = rolePathFinder.run(creep, targets[0])
        creep.move(creep.pos.getDirectionTo(ret.path[0]))
      }
    }
  },
  upgrade: function(creep) {
    if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
      let ret = rolePathFinder.run(creep, creep.room.controller)
      creep.move(creep.pos.getDirectionTo(ret.path[0]))
    }
  }
}

module.exports = creepAction;
