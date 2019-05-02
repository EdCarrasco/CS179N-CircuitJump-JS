

class Gate {
	constructor(pos, type) {
		this.pos = pos
//		this.active = null
		this.width = 50
		this.height = 50
//		this.maxX = this.pos.x + this.width
//		this.maxY = this.pos.y + this.height
		this.type = type // AND, OR, NOT, XOR, NAND, ...

		this.inputRails = []
		this.outputRails = []
		this.inputColor = 'gray'
		this.outputColor = 'gray'

		this.hasCollidedWithPlayer = false

		this.isPowered = false
		this.count = 0 // amount of inputRails that are powered
	}

	hasCollisionWithPoint(pos) {
		let insideX = pos.x >= this.pos.x && pos.x <= this.pos.x + this.width
		let insideY = pos.y >= this.pos.y && pos.y <= this.pos.y + this.height
		return insideX && insideY
	}

	hasCollisionWithCircle(pos, r) {
		let insideX = pos.x+r >= this.pos.x && pos.x-r <= this.pos.x + this.width
		let insideY = pos.y+r >= this.pos.y && pos.y-r <= this.pos.y + this.height
		return insideX && insideY
	}

	teleport(pos) {
		this.pos = pos
	}

	getPlayerCollision() {
		let touching = this.hasCollisionWithCircle(player.pos, player.radius)
		return touching && !this.isPowered
	}

	update() {
		this.inputRails = this.getInputRails()
		this.outputRails = this.getOutputRails()
		this.count = this.getCount()
		this.isPowered = this.logicGate(this.count, this.inputRails.length)

		this.hasCollidedWithPlayer = this.getPlayerCollision()
		//text(this.collision, _CENTER.x, _CENTER.y)

		// Update gate colors
		this.inputColor = (this.inputRails.length > 0) ? this.inputRails[0].color : color(0,0,0,25)
		this.outputColor = (this.outputRails.length > 0) ? this.outputRails[0].color : color(0,0,0,25)
	}

	getInputRails() {
		// Determine which rail's endpoints are touching the gate
		let inputRails = []
		for (let rail of railManager.rails) {
			if (this.hasCollisionWithPoint(rail.endPos)) {
				inputRails.push(rail)
			}
		}
		return inputRails
	}

	getOutputRails() {
		// Determine which rails' startpoints are touching the ate
		let outputRails = []
		for (let rail of railManager.rails) {
			if (this.hasCollisionWithPoint(rail.startPos)) {
				outputRails.push(rail)
			}
		}
		return outputRails
	}

	getCount() {
		let count = 0
		for (let rail of this.inputRails) {
			if (rail.isPowered) {
				count++
			}
		}
		return count
	}

	logicGate(count, total) {
		let isPowered = false
		switch(this.type) {
			case 'AND':
				isPowered = (count == total && total > 0)
				break
			case 'OR':
				isPowered = (count >= 1)
				break
			case 'NOT':
				isPowered = (count == 0)
				break
			case 'XOR':
				isPowered = (count == 1)
				break
			case 'NAND':
				isPowered = (count != total)
				break
			case 'NOR':
				isPowered = (count == 0)
				break
			case 'XNOR':
				isPowered = (count == 0 || count == total)
				break
			case 'ODD':
				isPowered = (count % 2 != 0)
				break
			case 'EVEN':
				isPowered = (count % 2 == 0)
				break
			default:
				isPowered = false
		}
		return isPowered
	}

	draw() {
		let halfWidth = this.width/2
		let halfHeight = this.height/2
		push()
		noStroke()
		fill(red(this.inputColor),green(this.inputColor),blue(this.inputColor),50)
		rect(this.pos.x, this.pos.y, halfWidth, this.height)
		fill(red(this.outputColor),green(this.outputColor),blue(this.outputColor),50)
		rect(this.pos.x+halfWidth, this.pos.y, halfWidth, this.height)
		fill('black')
		textStyle(BOLD)
		textAlign(CENTER,CENTER)
		let str = this.type + " GATE" + "\n\n" + this.count + " // " + this.inputRails.length
		str += (this.isPowered) ? ("\n\n"+"open") : ("\n\n"+"closed")
		text(str, this.pos.x + this.width/2,this.pos.y + this.height/2)
		pop()

		push()
		noFill()
		if (this.isPowered) noStroke()
		else strokeWeight(1)
		rect(this.pos.x, this.pos.y, this.width, this.height)
		pop()
	}
}