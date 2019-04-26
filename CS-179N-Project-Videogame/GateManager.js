class GateManager {
	constructor(){
		this.gates = []
	}
	add(gate) {
		this.gates.push(gate)
	}
	checkcollision(player){
		for (let i = 0 ; i < this.gates.length; i++){
			if ((player.pos.x + 12.5 >=this.gates[i].pos.x )&&(player.pos.x - 12.5 <= this.gates[i].maxX)){
				if((player.pos.y + 12.5 >=this.gates[i].pos.y )&&(player.pos.y - 12.5 <= this.gates[i].maxY)){
					player.collision = true
				}
			}
		}
	}

}