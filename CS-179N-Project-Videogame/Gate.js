class Gate {
	constructor(pos, type) {
		this.pos = pos
		this.active = null
		this.width = 50
		this.height = 50
		this.maxX = this.pos.x + this.width
		this.maxY = this.pos.y + this.height
		this.type = type
		this.inputRails = []
		this.outputRails = null
	}

	update() {

	}

	draw() {
		push()
		fill('red')
		rect(this.pos.x, this.pos.y, 50, 50)
		fill('black')
		textAlign(CENTER,CENTER)
		text(this.type,this.pos.x + this.width/2,this.pos.y + this.height/2)
		pop()
	}
}