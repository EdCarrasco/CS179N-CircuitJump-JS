let player
let line1
let line2
let line3
let line4

let lines = []

let railManager = null
FRAMERATE = 60

function setup() {
	createCanvas(640,480)
	railManager = new RailManager()

	player = new Player(createVector(250,400-10))

	//line0 = new Rail(createVector(50,300), createVector(600,300))

	line1 = new Rail(createVector(100,300), createVector(200,400), 'red')
	line2 = new Rail(createVector(400,400), createVector(400,100), 'blue')
	line3 = new Rail(createVector(200,400), createVector(400,400), 'green')

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
	background('lightyellow')
	frameRate(FRAMERATE)

	// UPDATE PHASE
	player.controls()
	player.preUpdate()
	
	railManager.update()
	player.update()

	player.postUpdate()

	// DRAW PHASE
	player.draw()
	railManager.draw()

	
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

		this.moveSpeed = 0.2
		this.jumpSpeed = 2

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
		
	}

	postUpdate() {
		this.vel.add(this.acc)
		this.pos.add(this.vel)
		this.acc.mult(0) // reset

		//this.pos = createVector(mouseX,mouseY)
	}

	controls() {
		if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
		//console.log("right")
		player.addForce(railManager.closestRail.direction.copy().mult(this.moveSpeed))
	}
	if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
		//console.log("left")
		player.addForce(railManager.closestRail.direction.copy().mult(-this.moveSpeed))
	}
	if (player.onRail) {
		if (keyIsDown(UP_ARROW) || keyIsDown(87)) {
			//console.log("up")
			player.addForce(railManager.closestRail.normal2D.copy().mult(this.jumpSpeed))
		}
		if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) {
			//console.log("up")
			player.addForce(railManager.closestRail.normal2D.copy().mult(-this.jumpSpeed))
		}
	}
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
		fill('black')
		text("onRail: "+this.onRail, 50,50)
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
		let lowestDistance = Infinity
		//this.closestRail = null
		let closestHorDistance = Infinity
		for (let rail of this.rails) {
			rail.isClosest = false
			/*let horDistance = rail.horizontalDistance
			let verDistance = rail.verticalDistance
			let sqDistance = horDistance**2 + verDistance**2*/
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


			if (rail.distance < lowestDistance && rail.horizontalDistance == 0) {
				if (this.closestRail) this.closestRail.isClosest = false
				lowestDistance = rail.distance
				this.closestRail = rail
				closestHorDistance = rail.horizontalDistance
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

		this.vector = null // vector3
		this.direction = null // vector3
		this.normal2D = null // vector3
		this.centerPos = null // vector3
		this.playerToCenter = null // vector3

		this.velocityProjection = null // vector3
		this.velocityRejection = null // vector3
		this.prevDotProduct = 0 // float
		this.dotProduct = 0 // float

		this.verticalDistance = Infinity // float
		this.horizontalDistance = Infinity // float

		this.isClosest = false // bool
		this.color = color // p5.Color

		this.playerToStart = null
		this.playerToEnd = null
	}

	

	getVerticalDistance() {
		let v = this.rejection(this.playerToCenter, this.direction)
		/*push()
		translate(player.pos)
		line(0,0,v.x,v.y)
		pop()*/
		return v.mag()
	}

	getHorizontalDistance() {
		// return the distance between the player and the closest endpoint of the rail
		// if the player is within the two endpoints, return 0 instead
		let length =  this.vector.mag()
		let startProj = this.projection(this.playerToStart, this.direction)//.mult(-1)
		let endProj = this.projection(this.playerToEnd, this.direction)
		/*if (this.isClosest) {
			push()
			translate(player.pos)
			stroke('red')
			line(0,0, startProj.x, startProj.y)
			stroke('black')
			line(0,0, endProj.x, endProj.y)
			pop()
		}*/
		let startDistance = startProj.mag()
		let endDistance = endProj.mag()
		if (startDistance+endDistance > length*1.01)
			return min(startDistance,endDistance)
		else
			return 0
	}

	update() {
		// Update all the variables for this object
		this.vector = p5.Vector.sub(this.endPos, this.startPos)
		this.direction = this.vector.copy().normalize()
		this.normal2D = createVector(this.direction.y, -1*this.direction.x) // points 90deg counterclockwise from this.direction
		this.centerPos = p5.Vector.add(this.startPos, p5.Vector.mult(this.vector, 0.5))

		/*this.playerToCenter = p5.Vector.sub(player.pos, this.centerPos)
		this.playerToStart = p5.Vector.sub(player.pos, this.startPos)
		this.playerToEnd = p5.Vector.sub(player.pos, this.endPos)*/

		this.playerToCenter = p5.Vector.sub(this.centerPos, player.pos)
		this.playerToStart = p5.Vector.sub(this.startPos, player.pos)
		this.playerToEnd = p5.Vector.sub(this.endPos, player.pos)

		this.prevDotProduct = this.dotProduct
		this.dotProduct = this.playerToCenter.dot(this.normal2D)

		this.velocityProjection = this.projection(player.vel, this.direction) //this.getVelocityProjection()
		this.velocityRejection = this.rejection(player.vel, this.direction) //this.getVelocityRejection()

		this.verticalDistance = this.getVerticalDistance()
		this.horizontalDistance = this.getHorizontalDistance()
		this.distance = Math.sqrt(this.horizontalDistance**2 + this.verticalDistance**2)

		// If this is the closest rail to the player
		// Apply a force to the player
		if (this.isClosest) {
			let sign = Math.sign(this.dotProduct) // float
			let forceFactor = 0.5 // float
			let force = p5.Vector.mult(this.normal2D, sign*forceFactor) // vector3
			player.color = this.color
			player.addForce(force)

			// If the current and previous dot products are different, the player has crossedw the rail
			// Set its vertical velocity (Rejection) to zero and add a slight force in the opposite direction
			// Keep its horizontal velocity (Projection)
			if (this.dotProduct * this.prevDotProduct < 0) {
				player.vel.mult(0)
				player.vel.add(this.velocityRejection.copy().mult(-0.1))
				player.vel.add(this.velocityProjection)
				player.onRail = true
			} else if (this.verticalDistance > 20 ) {
				player.onRail = false
			}
		}
	}

	projection(a,b) {
		let factor = a.dot(b) / b.dot(b)
		let proj = p5.Vector.mult(b, factor)
		return proj
	}

	rejection(a,b) {
		let proj = this.projection(a,b)
		let rej = p5.Vector.sub(a,proj) // vector3
		return rej
	}

	

	draw() {
		// Line from player to center of rail
		push()
		//line(player.pos.x, player.pos.y, this.centerPos.x, this.centerPos.y)
		pop()

		// Draw the rail itself
		push()
		translate(this.startPos)
		//let dir = this.vector
		strokeWeight(5)
		if (this.isClosest) strokeWeight(5)
		else strokeWeight(2)
		stroke(this.color)
		line(0,0,this.vector.x,this.vector.y)
		pop()

		/*push()
		translate(this.centerPos)
		stroke('black')
		strokeWeight(3)
		let projection = this.getProjection().copy().mult(1)
		line(0,0,projection.x,projection.y)
		pop()*/

		if (!this.isClosest)
			return

		//console.log()
		text("vertical distance: " + this.verticalDistance, 50,100)
		text("horizont distance: " + this.horizontalDistance, 50, 120)

		/*push()
		translate(this.startPos)
		let normal = this.normal2D.copy().mult(20)
		stroke('green')
		line(0,0,normal.x,normal.y)
		pop()
		*/
		
		
		
		
		/*push()
		translate(player.pos)
		stroke('red')
		strokeWeight(3)
		let rejection = this.velocityRejection.copy().mult(20)
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

	/*getVector() { // vector3
		return p5.Vector.sub(this.endPos, this.startPos)
	}*/

	/*getNormal() { // vector3
		return createVector(this.direction.y, -this.direction.x)
	}*/

	/*getDotProduct() {
		let a = this.playerToCenter//p5.Vector.sub(player.pos, this.centerPos)
		let b = this.normal2D
		return a.dot(b)
	}*/

	/*getRejection() {
		let a = p5.Vector.sub(player.pos, this.endPos)
		//let a = p5.Vector.sub(this.endPos, player.pos)
		let b = this.vector
		let factor = a.dot(b)/b.dot(b)
		let proj = p5.Vector.mult(b,factor)
		let rej =  p5.Vector.sub(a, proj)
		return rej
	}*/


	/*getVelocityProjection() {
		let a = player.vel
		let b = this.direction
		let factor = a.dot(b)/b.dot(b)
		let projection = p5.Vector.mult(b, factor) // vector3
		return projection
	}*/

	

	

	/*getProjection_StartPos() {
		//return this.getProjection(p5.Vector.sub(player.pos,this.startPos))
		return this.getProjection(p5.Vector.sub(this.startPos, player.pos))
	}*/

	/*getProjection_EndPos() {
		//return this.getProjection(p5.Vector.sub(player.pos,this.endPos))
		return this.getProjection(p5.Vector.sub(this.endPos, player.pos))
	}*/

	/*getClosestProjection() {
		let a1 = p5.Vector.sub(this.startPos, player.pos)
		let a2 = p5.Vector.sub(this.endPos, player.pos)
		let proj1 = this.getProjection(a1, this.direction)
		let proj2 = this.getProjection(a2, this.direction)
		return proj1.mag() <= proj2.mag() ? proj1 : proj2;
	}*/

	

	/*getVelocityRejection() {
		let a = player.vel
		let b = this.direction
		let projection = this.getVelocityProjection()
		return p5.Vector.sub(a, projection)
	}*/

	/*getProjection(vector) {
		// 
		let a = (vector) ? vector : this.playerToCenter//p5.Vector.sub(this.startPos, player.pos)
		let b = this.direction
		let factor = a.dot(b)/b.dot(b)
		return p5.Vector.mult(b,factor) // vector3
	}*/

	/*getSquaredDistance() {
		return this.horizontalDistance**2 + this.verticalDistance**2
	}

	getDistance() {
		return Math.sqrt(this.getSquaredDistance())
	}*/
}