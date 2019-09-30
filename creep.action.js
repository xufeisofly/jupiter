var cons = require('constants');
var rolePathFinder = require('role.pathfinder');

var isInMainRoom = function(creep) {
  return creep.room == Game.spawns['Spawn1'].room
}

var returnMainRoom = function(creep) {
  if(!isInMainRoom(creep)) {
    creep.moveTo(new RoomPosition(34, 33, Game.spawns['Spawn1'].room.name))
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

var creepAction = {
  harvest: function(creep) {
    if (shouldGoToSecRoom(creep)) {
      /* move to another room */
      let newRoomPos = new RoomPosition(46, 22, 'E2S16')
      creep.moveTo(newRoomPos)
      creep.say('Follow Me')
    } else {
      if(!isInMainRoom(creep)) {
        creep.say('Hold This Position')
      }
      let closestSource = creep.pos.findClosestByRange(FIND_SOURCES)
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
    } else {
      returnMainRoom(creep)
    }
  },
  build: function(creep) {
    if(isInMainRoom(creep)) {
      var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
      if(targets.length > 0) {

        if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
          let ret = rolePathFinder.run(creep, targets[0])
          creep.move(creep.pos.getDirectionTo(ret.path[0]))
        }
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
    /* if(isInMainRoom(creep)) { */
      let newRoomPos = new RoomPosition(46, 22, 'E1S14')
      creep.moveTo(newRoomPos)
    /* } else { */
      var closestHostile = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
      if(closestHostile) {
        if(creep.attack(closestHostile) == ERR_NOT_IN_RANGE) {
          creep.moveTo(closestHostile);
        }
        creep.memory.attacking = true
      } else {
        creep.memory.attacking = false
        /* returnMainRoom(creep) */
      }
    creep.say('love you')
    /* } */
  }
}

module.exports = creepAction;
