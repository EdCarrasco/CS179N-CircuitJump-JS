let player
let line1
let line2
let line3
let line4

let lines = []

let railManager = null

function setup() {
	//frameRate(1)
	createCanvas(640,480)
	railManager = new RailManager()

	let pos = createVector(width/2,height/2)
	player = new Player(pos)

	//line0 = new Rail(createVector(50,300), createVector(600,300))

	line1 = new Rail(createVector(100,400), createVector(200,400), 'red')
	line2 = new Rail(createVector(300,400), createVector(500,100), 'blue')
	line3 = new Rail(createVector(200,400), createVector(300,400), 'green')

	//line4 = new Rail(createVector(300,350), createVector(50,301))
	//line5 = new Rail(createVector(150,150), createVector(500,300))
	//line6 = new Rail(createVector(150,300), createVector(500,150))

	
	railManager.add(line1)
	railManager.add(line2)
	railManager.add(line3)
	//railManager.add(line4)
	//railManager.add(line5)
	//railManager.add(line6)

	//railManager.add(line0)
}

function draw() {
	background(51)
	frameRate(60)

	player.preUpdate()
	railManager.update()
	player.update()

	railManager.draw()
	player.draw()

	let speed = .2
	let jump = 2

	if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
		//console.log("right")
		player.addForce(railManager.closestRail.getDirection().normalize().mult(speed))
	}
	if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
		//console.log("left")
		player.addForce(railManager.closestRail.getDirection().normalize().mult(-speed))
	}
	if (player.onRail) {
		if (keyIsDown(UP_ARROW) || keyIsDown(87)) {
			//console.log("up")
			player.addForce(railManager.closestRail.getNormal().mult(jump))
		}
		if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) {
			//console.log("up")
			player.addForce(railManager.closestRail.getNormal().mult(-jump))
		}
	}
}
/*function mousePressed() {
	let mouse = createVector(mouseX, mouseY)
	let vector = p5.Vector.sub(mouse, player.pos)
	vector.normalize().mult(10)
	player.addForce(vector)
}*/

/* ==================================================== */

class Player {
	constructor(pos) {
		this.pos = pos
		this.vel = createVector(0,0)
		this.acc = createVector(0,0)

		this.onRail = false
		this.color = 'black'
	}

	addForce(force) {
		this.acc.add(force)


	}

	preUpdate() {
		//this.onRail = true
	}

	update() {
		this.vel.add(this.acc)
		this.pos.add(this.vel)
		this.acc.mult(0) // reset

		//this.pos = createVector(mouseX,mouseY)
	}

	draw() {
		push()
		noStroke()
		//if (this.onRail) fill('gold')
		//else fill('white')
		fill(this.color)
		ellipse(this.pos.x,this.pos.y,25)
		pop()

		push()
		fill('white')
		text(this.onRail, 50,50)
		pop()
	}
}

/* ==================================================== */

class RailManager {
	constructor() {
		this.rails = []
		this.closestRail = null
	}

	add(rail) {
		this.rails.push(rail)
	}

	calcClosestRail_OLD() {
		let lowestSqDistance = Infinity
		this.closestRail = null
		for (let rail of this.rails) {
			let sqDistance = rail.getHorizontalDistance()**2 + rail.getVerticalDistance()**2
			if (sqDistance < lowestSqDistance) {
				lowestSqDistance = sqDistance
				this.closestRail = rail
			}
		}
	}

	calcClosestRail() {
		// Iterate through the array to calculate which rail is closest to the player
		// First, use the distance formula (x^2 + y^2) to determine distance
		// Then, if there's another within a similar distance, use the horizontal distance to break the tie
		let lowestSqDistance = Infinity
		//this.closestRail = null
		let closestHorDistance = Infinity
		for (let rail of this.rails) {
			rail.isClosest = false
			let horDistance = rail.getHorizontalDistance()
			let verDistance = rail.getVerticalDistance()
			let sqDistance = horDistance**2 + verDistance**2
			/*if (sqDistance < lowestSqDistance) {
				if (this.closestRail) this.closestRail.isClosest = false
				lowestSqDistance = sqDistance
				this.closestRail = rail
				closestHorDistance = horDistance
				rail.isClosest = true
			} else if (sqDistance >= lowestSqDistance*0.95 && sqDistance <= lowestSqDistance*1) {
				if (horDistance < closestHorDistance) {
					if (this.closestRail) this.closestRail.isClosest = false
					lowestSqDistance = sqDistance
					this.closestRail = rail
					closestHorDistance = horDistance
					rail.isClosest = true
				}
			}*/


			if (sqDistance < lowestSqDistance && horDistance == 0) {
				if (this.closestRail) this.closestRail.isClosest = false
				lowestSqDistance = sqDistance
				this.closestRail = rail
				closestHorDistance = horDistance
				rail.isClosest = true
			}

			/*let hasSmallerDistance = sqDistance < lowestSqDistance
			let isSimilar = sqDistance >= lowestSqDistance*0.95 && sqDistance <= lowestSqDistance*1.0
			let hasSmallerHorDistance = false//horDistance < closestHorDistance
			if (hasSmallerDistance || (isSimilar && hasSmallerHorDistance)) {
				if (this.closestRail) this.closestRail.isClosest = false
				lowestSqDistance = sqDistance
				this.closestRail = rail
				closestHorDistance = horDistance
				rail.isClosest = true
			}*/
		}
	}

	update() {
		for (let rail of this.rails) {
			rail.update()
		}
		this.calcClosestRail();
	}

	draw() {
		for (let rail of this.rails) {
			rail.draw()
		}
	}
}

/* ==================================================== */

class Rail {
	constructor(startPos, endPos, color) {
		this.startPos = startPos // vector3
		this.endPos = endPos // vector3

		this.isClosest = false // bool
		this.dot = 0 // float
		this.color = color
	}

	getDirection() { // vector3
		return p5.Vector.sub(this.endPos, this.startPos)
	}

	getNormal() { // vector3
		let dir = this.getDirection().copy().normalize()
		return createVector(dir.y,-dir.x)
	}

	getProjection(vector) { //
		let a = (vector) ? vector : p5.Vector.sub(this.startPos, player.pos)
		let b = this.getDirection()
		let factor = a.dot(b)/b.dot(b)
		let projection = p5.Vector.mult(b,factor)
		return projection
	}

	getVelocityProjection() {
		let a = player.vel
		let b = this.getDirection()
		return p5.Vector.mult(b,a.dot(b)/b.dot(b))
	}

	getVelocityRejection() {
		let a = player.vel
		let b = this.direction
		let proj = this.getVelocityProjection()
		return p5.Vector.sub(a,proj)
	}

	getClosestProjection() {
		let a1 = p5.Vector.sub(this.startPos, player.pos)
		let a2 = p5.Vector.sub(this.endPos, player.pos)
		let proj1 = this.getProjection(a1)
		let proj2 = this.getProjection(a2)
		return proj1.mag() <= proj2.mag() ? proj1 : proj2;
	}

	getProjection_StartPos() {
		return this.getProjection(p5.Vector.sub(this.startPos, player.pos))
	}

	getProjection_EndPos() {
		return this.getProjection(p5.Vector.sub(this.endPos, player.pos))
	}

	getRejection() {
		let a = p5.Vector.sub(this.endPos, player.pos)
		let b = this.getDirection()
		let factor = a.dot(b)/b.dot(b)
		let rejection = p5.Vector.sub(a, p5.Vector.mult(b,factor))
		return rejection

		/*let a = p5.Vector.sub(this.endPos, player.pos)
		let b = this.vector
		let factor = a.dot(b)/b.dot(b)
		this.rejection = p5.Vector.sub(a, p5.Vector.mult(b,factor))*/
	}

	getHorizontalDistance() {
		// return the distance between the player and the closest endpoint of the rail
		// if the player is within the two endpoints, return 0 instead
		let length =  this.getDirection().mag()
		let startDistance = this.getProjection_StartPos().mag()
		let endDistance = this.getProjection_EndPos().mag()
		if (startDistance+endDistance > length*1.01)
			return min(startDistance,endDistance)
		else
			return 0
	}

	getVerticalDistance() {
		return this.getRejection().mag()
	}

	getSquaredDistance() {
		return this.getHorizontalDistance()**2 + this.getVerticalDistance()**2
	}

	getDistance() {
		return Math.sqrt(this.getSquaredDistance())
	}

	calcDotProduct() {
		let a = p5.Vector.sub(player.pos, this.endPos)
		let b = this.getNormal()
		this.dot = a.dot(b)
	}

	update() {
		//this.endPos = createVector(mouseX,mouseY)
		let factor = Math.sign(this.dot) * -1.0 // float
		let force = this.getNormal().mult(factor) // vector3
		if (this.isClosest) {
			player.color = this.color
			player.addForce(force)
			let prevDot = this.dot // float
			this.calcDotProduct()

			push()
			//translate(createVector(width/2,height/2))
			translate(player.pos)
			let _proj = this.getVelocityProjection()
			let _rej = this.getVelocityRejection()
			/*rect(100,100, 200,150)
			text("proj.x " + _proj.x, 100,100+15)
			text("proj.y " + _proj.y, 100,100+30)
			text("rej.x " + _rej.x, 100,100+45)
			text("rej.y " + _rej.y, 100,100+60)
			text("vel.x " + player.vel.x, 100,100+75)
			text("vel.y " + player.vel.y, 100,100+90)
			let test = p5.Vector.add(_proj,_rej).sub(player.vel)
			
			text("test x " + test.x, 100, 100+105)
			text("test y " + test.y, 100, 100+120)*/
			/*_proj.mult(20)
			_rej.mult(20)
			ellipse(0,0,5)
			stroke('blue')
			line(0,0, _rej.x, _rej.y)
			stroke('green')
			line(0,0, _proj.x, _proj.y)
			stroke('white')
			let vel = player.vel.copy().mult(20)
			line(0,0,vel.x,vel.y)
			*/
			pop()


			if (this.dot * prevDot < 0) {
				let rej = this.getVelocityRejection()
				let proj = this.getVelocityProjection()
				//let direction = this.getDirection().normalize().mult(0.01)
				//player.vel.mult(0)
				player.vel.set(rej.mult(-0.1))
				player.vel.add(proj)
				player.onRail = true
			} else if (this.getVerticalDistance() > 20 ) {
				player.onRail = false
			}
			
		}

		//this.endPos = createVector(mouseX,mouseY)

		
	}

	draw() {
		// Line from player to center of rail
		push()
		let centerPos = p5.Vector.add(this.startPos, this.getDirection().mult(1/2))
		line(player.pos.x, player.pos.y, centerPos.x, centerPos.y)
		pop()

		// Draw the rail itself
		push()
		let dir = this.getDirection()
		strokeWeight(5)
		if (this.isClosest) {
			strokeWeight(5)
		}
		else strokeWeight(2)
		stroke(this.color)
		line(this.startPos.x,this.startPos.y,this.endPos.x,this.endPos.y)
		pop()

		if (!this.isClosest)
			return

		/*push()
		translate(this.startPos)
		let normal = this.getNormal().mult(20)
		stroke('green')
		line(0,0,normal.x,normal.y)
		pop()

		push()
		translate(player.pos)
		stroke('red')
		let projection = this.getClosestProjection()
		line(0,0,projection.x,projection.y)
		pop()

		push()
		translate(player.pos)
		stroke('blue')
		let rejection = this.getRejection().mult(20)
		line(0,0,rejection.x,rejection.y)
		pop()*/

		/*push()
		translate(this.startPos)
		rect(0,0, 60,75)
		text("hor "+floor(this.getHorizontalDistance()), 5, 15)
		text("ver "+floor(this.getVerticalDistance()), 5, 35)
		text("dist "+floor(this.getDistance()),5,55)
		pop()*/
	}
}