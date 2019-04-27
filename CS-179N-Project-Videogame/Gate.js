

class Gate {
	constructor(pos, type) {
		this.pos = pos
		this.active = null
		this.width = 50
		this.height = 50
		this.maxX = this.pos.x + this.width
		this.maxY = this.pos.y + this.height
		this.type = type // AND, OR, NOT, XOR, NAND, ...

		this.inputRails = []
		this.outputRails = []
		this.inputColor = 'gray'
		this.outputColor = 'gray'

		this.isPowered = false
		this.count = 0
	}

	hasCollisionWithPos(pos) {
		let insideX = pos.x >= this.pos.x && pos.x <= this.pos.x + this.width
		let insideY = pos.y >= this.pos.y && pos.y <= this.pos.y + this.height
		return insideX && insideY
	}

	teleport(pos) {
		this.pos = pos
	}

	update() {
		// Determine which rail's endpoints are touching the gate
		this.inputRails = []
		for (let rail of railManager.rails) {
			if (this.hasCollisionWithPos(rail.endPos)) {
				this.inputRails.push(rail)
			}
		}

		// Determine which rails' startpoints are touching the ate
		this.outputRails = []
		for (let rail of railManager.rails) {
			if (this.hasCollisionWithPos(rail.startPos)) {
				this.outputRails.push(rail)
			}
		}

		this.checkPower()

		// Update gate colors
		this.inputColor = (this.inputRails.length > 0) ? this.inputRails[0].color : color(0,0,0,25)
		this.outputColor = (this.outputRails.length > 0) ? this.outputRails[0].color : color(0,0,0,25)
	}

	checkPower() {
		this.count = 0
		for (let i = 0; i < this.inputRails.length; i++) {
			if (this.inputRails[i].isPowered) {
				this.count += 1
			}
		}

		let count = this.count
		let total = this.inputRails.length
		switch(this.type) {
			case 'AND':
				this.isPowered = (count == total && total > 0)
				break
			case 'OR':
				this.isPowered = (count >= 1)
				break
			case 'NOT':
				this.isPowered = (count == 0)
				break
			case 'XOR':
				this.isPowered = (count == 1)
				break
			case 'NAND':
				this.isPowered = (count != total)
				break
			case 'NOR':
				this.isPowered = (count == 0)
				break
			case 'XNOR':
				this.isPowered = (count == 0 || count == total)
				break
			case 'ODD':
				this.isPowered = (count % 2 != 0)
				break
			case 'EVEN':
				this.isPowered = (count % 2 == 0)
				break
			default:
				this.isPowered = false
		}
	}

	draw() {
		let halfWidth = this.width/2
		let halfHeight = this.height/2
		push()
		noStroke()
		fill(this.inputColor)
		rect(this.pos.x, this.pos.y, halfWidth, this.height)
		fill(this.outputColor)
		rect(this.pos.x+halfWidth, this.pos.y, halfWidth, this.height)
		fill('black')
		textStyle(BOLD)
		textAlign(CENTER,CENTER)
		let str = this.type + "\n" + this.count + " // " + this.inputRails.length
		str += (this.isPowered) ? ("\n"+"OPEN") : ""
		text(str, this.pos.x + this.width/2,this.pos.y + this.height/2)
		pop()

		push()
		noFill()
		if (this.isPowered) noStroke()
		else strokeWeight(3)
		rect(this.pos.x, this.pos.y, this.width, this.height)
		pop()
	}
}