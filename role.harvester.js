var roleHarvester = {

  /** @param {Creep} creep **/
  run: function(creep) {
	if(creep.carry.energy < creep.carryCapacity) {
      /* var sources = creep.room.find(FIND_SOURCES); */
      var closestSource = creep.pos.findClosestByRange(FIND_SOURCES)
      if(creep.harvest(closestSource) == ERR_NOT_IN_RANGE) {
        creep.moveTo(closestSource, {visualizePathStyle: {stroke: '#ffaa00'}});
      }
    }
    else {
      var targets = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
          return ([STRUCTURE_EXTENSION, STRUCTURE_TOWER, STRUCTURE_SPAWN].includes(structure.structureType)) &&
                 structure.energy < structure.energyCapacity;
        }
      });
      if(targets.length > 0) {
        if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
        }
      } else {
        /* leave the source when no job */
        creep.moveTo(Game.spawns['Spawn1'])
      }
    }
  }
};

module.exports = roleHarvester;
