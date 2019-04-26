let player
let r1
let r2
let rails = []

let currentRail = null

let RAIL_FORCE_FACTOR = 1

function setup() {
	createCanvas(640,480)
	player = new Player(createVector(width/2,height/2))

	let startPos = createVector(width/2, height-50)
	let endPos = createVector(width/2+50, height+50)
	r1 = new Rail(startPos, endPos)

	let another = createVector(100,100)
	r2 = new Rail(createVector(100,100), createVector(200,200))

	rails.push(r1)
	rails.push(r2)
}

function draw() {
	background(51)

	let distance = Infinity
	for (let i = 0; i < rails.length; i++) {
		rails[i].update()
		if (rails[i].pdist < distance) {
			if (currentRail != null) currentRail.closest = false
			distance = rails[i].pdist
			currentRail = rails[i]
			currentRail.closest = true
		}
		rails[i].update2()
	}

	//let gravity = createVector(0,.01)
	//player.addForce(gravity)

	
	player.update()

	for (let i = 0; i < rails.length; i++) {
		rails[i].draw()
	}
	player.draw()
	frameRate(5)
}

function mousePressed() {
	//console.log("press")
	/*if (currentRail != null) {
		player.vel.add(currentRail.vector.copy().normalize())
	}*/
	//frameRate(5)
}

class Rail {
	constructor(startPos, endPos) {
		this.startPos = startPos
		this.endPos = endPos
		this.vector = null //p5.Vector.sub(this.endPos, this.startPos)
		this.normal = null //createVector(this.vector.y, -this.vector.x).normalize()
		this.centerPos = null //p5.Vector.add(this.startPos, p5.Vector.mult(this.vector,0.5))
		this.rejection = null
		this.projection = null
		this.dot = null
		this.vdistance = 0
		this.halfdist = 0
		this.pdist = 0
		this.closest = false
		this.projection = null

		this.update()
	}

	update() {
		if (this == r1) this.endPos = createVector(mouseX,mouseY)
		this.vector = p5.Vector.sub(this.endPos, this.startPos)
		this.normal = createVector(this.vector.y, -this.vector.x).normalize()
		this.centerPos = p5.Vector.add(this.startPos, p5.Vector.mult(this.vector,0.5))

		
		this.halfdist = p5.Vector.sub(this.centerPos, this.startPos).mag()
		push()
		strokeWeight(10)
		translate(this.startPos)
		line(0,0, this.halfdist.x, this.halfdist.y)
		pop()
		this.pdist = p5.Vector.sub(player.pos, this.centerPos).mag()

	}

	update2() {



		let a = p5.Vector.sub(this.endPos, player.pos)
		let b = this.vector
		let factor = a.dot(b)/b.dot(b)
		this.rejection = p5.Vector.sub(a, p5.Vector.mult(b,factor))
		this.projection = p5.Vector.mult(b, factor)

		let aa = player.vel
		let bb = this.vector
		let factor2 = aa.dot(bb)/bb.dot(bb)
		this.projection = p5.Vector.mult(bb,factor2)
		let proj = this.projection.copy().normalize().mult(100)

		let prevDot = this.dot
			this.dot = this.normal.dot(a)
			this.vdistance = this.rejection.mag()
		
		if (this.closest) {
			let forceFactor = Math.sign(this.dot) * 10.0
			this.force = p5.Vector.mult(this.normal, forceFactor)
			player.addForce(this.force)

			
			if (this.dot*prevDot < 0) {
				player.vel = p5.Vector.mult(this.rejection, -1.0)
			}

			let forward = this.vector.copy().normalize()
			forward.mult(1)
			if (!mouseIsPressed) {
				forward.mult(-1)
			}
			//player.addForce(forward)

		}


	}

	draw() {
		//if (this == r2) console.log("draw")
		let normalArrow = this.normal.copy().mult(20)
		push()
		translate(this.startPos)
		if (this.closest) stroke(0,0,255)
		line(0,0,this.vector.x, this.vector.y)
		stroke(255,0,0)
		//line(0,0,normalArrow.x, normalArrow.y)
		pop()
		push()
		if (this.closest) fill(0,0,255)
		else fill(0)
		ellipse(this.centerPos.x, this.centerPos.y, 5)
		pop()
	}
}

class Player {
	constructor(pos) {
		this.pos = pos
		this.vel = createVector(0,0)
		this.acc = createVector(0,0)
	}

	addForce(force) {
		this.acc.add(force)
	}

	update() {
		this.vel.add(this.acc)
		this.pos.add(this.vel)
		this.acc.mult(0)
	}

	draw() {
		push()
		translate(this.pos)
		fill(255)
		ellipse(0, 0, 5)

		let velArrow = this.vel.copy().normalize().mult(10)
		stroke(255,0,0)
		strokeWeight(3)
		//line(0,0, velArrow.x, velArrow.y)
		pop()

		push()
		let vel = player.vel.copy().normalize().mult(50)
		translate(player.pos)
		stroke(0,255,0)
		line(0,0,vel.x,vel.y)
		pop()
	}
}

function keyPressed() {
	let force = createVector(0,0)
	switch(keyCode) {
		case 68: // right
			force = createVector(1,0)
			break;
		case 65: // left
			force = createVector(-1,0)
			break;
		case 87: // up
			force = createVector(0,-1)
			break;
		case 83: // down
			force = createVector(0,1)
			break;
	}
	player.addForce(force)
}