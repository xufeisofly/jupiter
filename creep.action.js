var cons = require('constants');
var rolePathFinder = require('role.pathfinder');

var isInMainRoom = function(creep) {
  return creep.room == Game.spawns['Spawn1'].room
}

var returnMainRoom = function(creep) {
  if(!isInMainRoom(creep)) {
    creep.moveTo(new RoomPosition(34, 33, Game.spawns['Spawn1'].room.name))
    creep.say('Bye Bye')
  } else {
    console.log('Creep Already in main room')
  }
}



var creepAction = {
  harvest: function(creep) {
    /* Num of creeps who are harvesting */
    let thisRoomHarvCreeps = Game.spawns['Spawn1'].room.find(FIND_CREEPS, {
      filter: (creep) => {
        return (creep.memory.role == 'harvester' && creep.memory.harvesting == true) ||
               (creep.memory.role == 'builder' && creep.memory.building == false) ||
               (creep.memory.role == 'upgrader' && creep.memory.upgrading == false)
      }
    })
    console.log(thisRoomHarvCreeps.length)
    console.log(creep.carry.energy)
    if(thisRoomHarvCreeps.length > cons.MAX_ROOM_HARV_CREEPS_NUM && creep.room == Game.spawns['Spawn1'].room && creep.carry.enery == 0) {
      /* move to another room */
      let newRoomPos = new RoomPosition(46, 22, 'E2S16')
      creep.moveTo(newRoomPos)
    } else {
      if(!isInMainRoom(creep)) {
        creep.say('Rob Rob')
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
  }
}

module.exports = creepAction;
