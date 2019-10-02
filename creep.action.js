var cons = require('constants');
var rolePathFinder = require('role.pathfinder');

var isInMainRoom = function(creep) {
  let spawn = creep.name.match(/.*(.{6})/)[1]
  if (!Game.spawns[spawn]) {
    return true
  }
  return creep.room == Game.spawns[spawn].room
}

var returnMainRoom = function(creep) {
  let spawn = creep.name.match(/.*(.{6})/)[1]
  if (!Game.spawns[spawn]) {
    return
  }
  if(!isInMainRoom(creep)) {
    creep.moveTo(new RoomPosition(34, 33, Game.spawns[spawn].room.name))
    creep.say('Cover Me')
  } else {
    console.log('Creep Already in main room')
  }
}

function shouldGoToSecRoom(creep) {
  /* Num of creeps who are harvesting */
  let thisRoomHarvCreeps = Game.spawns['Spawn1'].room.find(FIND_CREEPS, {
    filter: (creep) => {
      return (creep.memory.role == 'harvester' && creep.memory.harvesting == true) ||
             (creep.memory.role == 'builder' && creep.memory.building == false) ||
             (creep.memory.role == 'upgrader' && creep.memory.upgrading == false)
    }
  })
  console.log("harvester count in main room: ", thisRoomHarvCreeps.length)
  return thisRoomHarvCreeps.length > cons.MAX_ROOM_HARV_CREEPS_NUM
      && creep.room == Game.spawns['Spawn1'].room
      && _.sum(creep.carry) == 0
}

function moveToRoom(creep, room) {
  let newRoomPos = new RoomPosition(40, 26, room)
  creep.moveTo(newRoomPos)
  creep.say('Follow Me')
}

function _transfer(creep, target) {
  if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
    let ret = rolePathFinder.run(creep, target)
    creep.move(creep.pos.getDirectionTo(ret.path[0]))
  }
}

function _attack(creep, target) {
  if(creep.attack(target) == ERR_NOT_IN_RANGE) {
    let ret = rolePathFinder.run(creep, target)
    creep.move(creep.pos.getDirectionTo(ret.path[0]))
  }
}

function _claim(creep, controller) {
  if (controller) {
    if (creep.claimController(controller) == ERR_NOT_IN_RANGE) {
      let ret = rolePathFinder.run(creep, controller)
      creep.move(creep.pos.getDirectionTo(ret.path[0]))
    }
  }
}

var creepAction = {
  harvest: function(creep) {
    let closestSource = creep.pos.findClosestByRange(FIND_SOURCES)
    if (shouldGoToSecRoom(creep) || closestSource.energy < 10) {
      /* move to another room */
      moveToRoom(creep, 'E2S16')
    } else {
      if(!isInMainRoom(creep)) {
        creep.say('❤️')
      }

      if(creep.harvest(closestSource) == ERR_NOT_IN_RANGE) {
        let ret = rolePathFinder.run(creep, closestSource)
        creep.move(creep.pos.getDirectionTo(ret.path[0]))
      }
    }
  },
  transfer: function(creep) {
    if(isInMainRoom(creep)) {
      var targets = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
          return ([STRUCTURE_TOWER, STRUCTURE_EXTENSION, STRUCTURE_SPAWN].includes(structure.structureType)) &&
                 structure.energy < structure.energyCapacity;
        }
      });
      if (targets.length > 0) {
        _transfer(creep, targets[0])
      } else {
        let storages = creep.room.find(FIND_STRUCTURES, {
          filter: { structureType: STRUCTURE_STORAGE }
        })
        console.log(storages)
        for (var id in storages) {
          var thisStorage = storages[id]
          if (thisStorage.store[RESOURCE_ENERGY] < thisStorage.storeCapacity) {
            _transfer(creep, thisStorage)
          }
        }
      }
    } else {
      returnMainRoom(creep)
    }
  },
  build: function(creep) {
    var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
    if(isInMainRoom(creep) || (targets.length > 0)) {
      if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
        let ret = rolePathFinder.run(creep, targets[0])
        creep.move(creep.pos.getDirectionTo(ret.path[0]))
      }
    } else {
      returnMainRoom(creep)
    }
  },
  upgrade: function(creep) {
    if(isInMainRoom(creep)) {
      if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
        let ret = rolePathFinder.run(creep, creep.room.controller)
        creep.move(creep.pos.getDirectionTo(ret.path[0]))
      }
    } else {
      returnMainRoom(creep)
    }
  },
  findAndAttack: function(creep) {
    if(isInMainRoom(creep)) {
      moveToRoom(creep, 'E2S16')
    } else {
      _claim(creep, creep.room.controller)
      var closestHostile = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
      if(closestHostile) {
        _attack(creep, closestHostile)
        creep.memory.attacking = true
      } else {
        creep.memory.attacking = false
        /* returnMainRoom(creep) */
      }
      creep.say('❤️')
    }
  },
  claimController: function(creep, controller) {
    _claim(creep, controller)
  }
}

module.exports = creepAction;
