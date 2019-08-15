var CREEP_INIT_ROLE = 'upgrader'
var workerLevel = {
  1: [WORK, MOVE, CARRY],
  2: [WORK, WORK, MOVE, MOVE, CARRY],
  3: [WORK, WORK, WORK, MOVE, MOVE, CARRY],
  4: [WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, CARRY, CARRY]
}

function getWorkerLevel() {
  // TODO: get newest level by total energy amount
  var retLevel = workerLevel[1]
  for(var k in workerLevel) {
    if(Game.spawns['Spawn1'].spawnCreep(workerLevel[k], 'worker' + Game.time, { dryRun: true }) == OK) {
      retLevel = workerLevel[k]
    } else {
      break
    }
  }
  return retLevel
}

var roleInit = {
  ensureAmount: function(type, num) {
    /* create a new worker when creeps number is lower than MIN */
    var creeps = Game.spawns['Spawn1'].room.find(FIND_CREEPS, {filter: (creep) => creep.name.startsWith(type)})
    if(creeps.length < num) {
      var newName = type + Game.time
      Game.spawns['Spawn1'].spawnCreep(getWorkerLevel(), newName, {
        memory: { role: CREEP_INIT_ROLE }
      })
    }

    /* screen notice */
    if(Game.spawns['Spawn1'].spawning) {
      var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name]
      Game.spawns['Spawn1'].room.visual.text(
        'Making: ' + spawningCreep.memory.role,
        Game.spawns['Spawn1'].pos.x + 2,
        Game.spawns['Spawn1'].pos.y,
        { align: 'left', opacity: 0.8 }
      )
    }
  },

  autoAssign: function() {
    var energyTargets = Game.spawns['Spawn1'].room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return ([STRUCTURE_EXTENSION, STRUCTURE_TOWER, STRUCTURE_SPAWN].includes(structure.structureType)) && structure.energy < structure.energyCapacity
      }
    })
    var constructTargets = Game.spawns['Spawn1'].room.find(FIND_CONSTRUCTION_SITES)

    if(energyTargets.length == 0 && constructTargets.length == 0) {
      /* Energy targets no; construct targets: no, all act as upgraders */
      for(var name in Game.creeps) {
        Game.creeps[name].memory.role = 'upgrader'
        Game.creeps[name].say('=> upgrader')
      }
    } else if(energyTargets.length > 0 && constructTargets.length == 0) {
      /* Energy targets yes; construct targets: no, all act as harvester */
      for(var name in Game.creeps) {
        Game.creeps[name].memory.role = 'harvester'
        Game.creeps[name].say('=> harvester')
      }
    } else if(energyTargets.length == 0 && constructTargets.length > 0) {
      /* Energy targets no; construct targets: yes, all act as builder */
      for(var name in Game.creeps) {
        Game.creeps[name].memory.role = 'builder'
        Game.creeps[name].say('=> builder')
      }
    } else {
      /* Energy targets yes; construct targets: yes, half as harvester half as builder */
      var creeps = Game.spawns['Spawn1'].room.find(FIND_CREEPS, {filter: (creep) => creep.name.startsWith('worker')})
      var harvesters = creeps.splice(0, creeps.length / 2)
      var builders = creeps.splice(creeps.length / 2, creeps.length)

      for(var i in harvesters) {
        harvesters[i].memory.role = 'harvester'
        harvesters[i].say('=> harvester')
      }
      for(var i in builders) {
        builders[i].memory.role = 'builder'
        builders[i].say('=> builder')
      }
    }
  }
}

module.exports = roleInit
