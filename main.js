var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleAttacker = require('role.attacker');
var roleInit = require('role.init');
var towerAction = require('tower.action');
var cons = require('constants');

module.exports.loop = function () {
  /* delete memorys */
  for(var name in Memory.creeps) {
    if(!Game.creeps[name]) {
      delete Memory.creeps[name]
    }
  }

  /* tower action */
  for (var spawn of cons.SPAWNS) {
    var towers = Game.spawns[spawn].room.find(FIND_STRUCTURES, {
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
  }

  /* init creep amount and duty */
  roleInit.ensureAmount('worker', 7, 'Spawn1')
  roleInit.ensureAmount('worker', 6, 'Spawn2')
  /* roleInit.ensureAmount('attacker', 1) */
  roleInit.autoAssign('Spawn1')
  roleInit.autoAssign('Spawn2')

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
    if(creep.memory.role == 'attacker') {
      roleAttacker.run(creep);
    }
  }
}
