var CREEP_INIT_ROLE = 'upgrader'

var workerLevel = {
  0: [WORK, MOVE, CARRY],
  1: [WORK, WORK, MOVE, MOVE, CARRY, CARRY],
  2: [WORK, WORK, MOVE, MOVE, CARRY, CARRY, CARRY],
  3: [WORK, WORK, WORK, MOVE, CARRY, CARRY, CARRY, CARRY],
  4: [WORK, WORK, WORK, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY],
  5: [WORK, WORK, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY],
  6: [WORK, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY],
  7: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY],
  8: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY]
}

function getWorkerLevel(spawn='Spawn1') {
  // TODO: get newest level by total energy amount
  var retLevel = workerLevel[0]
  for(var k in workerLevel) {
    if(Game.spawns[spawn].spawnCreep(workerLevel[k], 'worker' + Game.time, {
      dryRun: true }) == OK) {
      retLevel = workerLevel[k]
    } else {
      break
    }
  }
  return retLevel
}

var attackerLevel = {
  0: [ATTACK, MOVE],
  1: [ATTACK, MOVE, MOVE],
  2: [ATTACK, ATTACK, MOVE, MOVE]
}

function getAttackerLevel(spawn='Spawn1') {
  // TODO: get newest level by total energy amount
  var retLevel = attackerLevel[0]
  for(var k in attackerLevel) {
    if(Game.spawns[spawn].spawnCreep(attackerLevel[k], 'attacker' + Game.time, {
      dryRun: true }) == OK) {
      retLevel = attackerLevel[k]
    } else {
      break
    }
  }
  return retLevel
}

function getCreepsByType(type, spawn='Spawn1') {
  return Game.spawns[spawn].room.find(FIND_CREEPS, {filter: (creep) => (creep.name.startsWith(type) && creep.name.endsWith(spawn))})
}

function numOfRole(type, role, spawn='Spawn1') {
  let length = 0
  for(var room in Game.rooms) {
    creeps = Game.rooms[room].find(FIND_CREEPS, {
      filter: (c) => { return c.name.startsWith(type) && c.name.endsWith(spawn) && c.memory.role == role }
    })
    length += creeps.length
  }
  return length
}

function isHarvester(creep, spawn='Spawn1') {
  // creep.body 最大的不是 harvester，其他的都是
  let creeps = Game.spawns[spawn].room.find(FIND_CREEPS, {
    filter: (c) => { return c.name.startsWith('worker') && c.name.endsWith(spawn) }
  })
  creeps.sort((a, b) => (a.body.length > b.body.length) ? -1 : 1)

  let bigBodyLen = creeps[0].body.length
  let nonHarCreeps = creeps.filter((c) => c.body.length == bigBodyLen)
  return !nonHarCreeps.includes(creep)
}

var roleInit = {
  ensureAmount: function(type, num, spawn='Spawn1') {
    let length = 0
    for (var role of ['harvester', 'builder', 'upgrader']) {
      length += numOfRole(type, role, spawn)
    }
    console.log("creeps count of ", spawn, type, length)

    let levelFunc = getWorkerLevel
    if (type == 'attacker') {
      levelFunc = getAttackerLevel
    }

    if(length < num) {
      var newName = type + Game.time + spawn
      Game.spawns[spawn].spawnCreep(levelFunc(spawn), newName, {
        memory: { role: CREEP_INIT_ROLE }
      })
    }
  },

  autoAssign: function(spawn='Spawn1') {
    if (!Game.spawns[spawn]) {
      return
    }
    var energyTargets = Game.spawns[spawn].room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return ([STRUCTURE_EXTENSION, STRUCTURE_TOWER, STRUCTURE_SPAWN].includes(structure.structureType)) && structure.energy < structure.energyCapacity
      }
    })
    var constructTargets = Game.spawns[spawn].room.find(FIND_CONSTRUCTION_SITES)

    if(energyTargets.length == 0 && constructTargets.length == 0) {
      /* Energy targets no; construct targets: no, all act as upgraders */
      var creeps = getCreepsByType('worker', spawn)
      for(var name in creeps) {
        creeps[name].memory.role = 'upgrader'
        creeps[name].say('u')
      }
    } else if(energyTargets.length > 0 && constructTargets.length == 0) {
      /* Energy targets yes; construct targets: no, all act as harvester */
      var creeps = getCreepsByType('worker', spawn)
      var harvesters = creeps.filter(function(creep) {
        return isHarvester(creep, spawn)
      })
      var upgraders = creeps.filter(function(creep) {
        return !isHarvester(creep, spawn)
      })

      for(var i in harvesters) {
        harvesters[i].memory.role = 'harvester'
      }
      for(var j in upgraders) {
        upgraders[j].memory.role = 'upgrader'
        upgraders[j].say('u')
      }
    } else if(energyTargets.length == 0 && constructTargets.length > 0) {
      /* Energy targets no; construct targets: yes, all act as builder */
      var creeps = getCreepsByType('worker', spawn)
      for(var name in creeps) {
        creeps[name].memory.role = 'builder'
        creeps[name].say('b')
      }
    } else {
      /* Energy targets yes; construct targets: yes, half as harvester half as builder */
      var creeps = getCreepsByType('worker', spawn)
      var harvesters = creeps.filter(function(creep) {
        return isHarvester(creep, spawn)
      })
      var builders = creeps.filter(function(creep) {
        return !isHarvester(creep, spawn)
      })

      for(var i in harvesters) {
        harvesters[i].memory.role = 'harvester'
        /* harvesters[i].say('h') */
      }
      for(var i in builders) {
        builders[i].memory.role = 'builder'
        builders[i].say('b')
      }
    }

    let attackers = getCreepsByType('attacker', spawn)
    for(var i in attackers) {
      attackers[i].memory.role = 'attacker'
    }
  }
}

module.exports = roleInit
