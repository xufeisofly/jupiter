var towerAction = {
  tryAttack: function(tower) {
    var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
    if(closestHostile) {
      tower.attack(closestHostile)
    }
  },
  tryRepair: function(tower) {
    var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
      filter: (structure) => structure.hits < structure.hitsMax
    })
    if(closestDamagedStructure) {
      tower.repair(closestDamagedStructure)
    }
  }
}

module.exports = towerAction
