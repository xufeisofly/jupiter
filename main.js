var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleInit = require('role.init');
var towerAction = require('tower.action');
var cons = require('constants')


module.exports.loop = function () {
  /* delete memorys */
  for(var name in Memory.creeps) {
    if(!Game.creeps[name]) {
      delete Memory.creeps[name]
    }
  }

  /* tower action */
  var towers = Game.spawns['Spawn1'].room.find(FIND_STRUCTURES, {
    filter: (structure) => {
      return (structure.structureType == STRUCTURE_TOWER)
    }
  })
  if(towers.length > 0) {
    for(var i in towers) {
      towerAction.tryRepair(towers[i])
      towerAction.tryAttack(towers[i])
    }
  }

  /* init creep amount and duty */
  roleInit.ensureAmount('worker', cons.MIN_WORKER_NUM)
  roleInit.autoAssign()

  /* creep run by role */
  for(var name in Game.creeps) {
    var creep = Game.creeps[name];
    if(creep.memory.role == 'harvester') {
      roleHarvester.run(creep);
    }
    if(creep.memory.role == 'upgrader') {
      roleUpgrader.run(creep);
    }
    if(creep.memory.role == 'builder') {
      roleBuilder.run(creep);
    }
  }
}
