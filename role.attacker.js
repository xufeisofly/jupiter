var creepAction = require('creep.action')

var roleAttacker = {
  run: function(creep) {
    creepAction.findAndAttack(creep)
  }
}

module.exports = roleAttacker
