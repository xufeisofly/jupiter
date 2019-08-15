var rolePathFinder = {
  run: function(creep, target) {
    let goal = { pos: target.pos, range: 1 }

    let ret = PathFinder.search(
      creep.pos, goal,
      {
        plainCost: 2,
        swampCost: 10,
        roomCallback: function(roomName) {
          let room = Game.rooms[roomName]
          if(!room) return

          let costs = new PathFinder.CostMatrix

          room.find(FIND_STRUCTURES).forEach(function(struct) {
            if(struct.structureType == STRUCTURE_ROAD) {
              costs.set(struct.pos.x, struct.pos.y, 1)
            } else if(struct.structureType != STRUCTURE_CONTAINER && (struct.structureType != STRUCTURE_RAMPART || !struct.my)) {
              costs.set(struct.pos.x, struct.pos.y, 0xff)
            }
          })

          room.find(FIND_CREEPS).forEach(function(creep) {
            costs.set(creep.pos.x, creep.pos.y, 0xff)
          })

          return costs
        }
      }
    )

    return ret
  }
}

module.exports = rolePathFinder;
