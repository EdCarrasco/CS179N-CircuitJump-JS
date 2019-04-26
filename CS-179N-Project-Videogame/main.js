let player
let line1
let line2
let line3
let line4

let gate1

let lines = []
//let gates = []
let gateManager = null
let railManager = null
FRAMERATE = 60

function setup() {
	createCanvas(640,480)
	railManager = new RailManager()
	gateManager = new GateManager()
	//player = new Player(createVector(150+0,200-0))
	player = new Player(createVector(250+40,400-50))

	//line0 = new Rail(createVector(50,300), createVector(600,300))

	line0 = new Rail(createVector(350,400), createVector(550,400), 'lightgreen')
	line1 = new Rail(createVector(200,400), createVector(450,400), 'green')
	line2 = new Rail(createVector(100,300), createVector(200,400), 'red')
	line3 = new Rail(createVector(100,200), createVector(100,300), 'orange')
	line4 = new Rail(createVector(200,100), createVector(100,200), 'blue')
	line5 = new Rail(createVector(350,100), createVector(200,100), 'pink')
	line6 = new Rail(createVector(250,300), createVector(350,500), 'brown')

	//line6 = new Rail(createVector(550,400), createVector(550,100), 'blue')
	//line7 = new Rail(createVector(550,100), createVector(200,100), 'purple')
	//line8 = new Rail(createVector(300,350), createVector(50,301))
	//line9 = new Rail(createVector(150,150), createVector(500,300))
	//line10 = new Rail(createVector(150,300), createVector(500,150))

	railManager.add(line0)
	railManager.add(line1)
	railManager.add(line2)
	railManager.add(line3)
	railManager.add(line4)
	railManager.add(line5)
	railManager.add(line6)

	//railManager.add(line6)
	//railManager.add(line7)

	//railManager.add(line8)

	gate1 = new Gate(createVector(100,0), 'AND')
	gateManager.add(gate1)
}

function draw() {
	background('lightyellow')
	frameRate(FRAMERATE)

	// UPDATE PHASE
	player.controls()
	
	railManager.update()
	player.update()

	// DRAW PHASE
	player.draw()
	railManager.draw()

	gate1.draw()
}

/* =================================== */

function projection(a,b) {
	let factor = a.dot(b) / b.dot(b) // float
	let proj = p5.Vector.mult(b, factor) // vector3
	return proj
}

function rejection(a,b) {
	let proj = this.projection(a,b) // float
	let rej = p5.Vector.sub(a,proj) // vector3
	return rej
}

function drawVector(origin, vector, color='black', factor=1, weight=1) {
	push()
	translate(origin)
	stroke(color)
	strokeWeight(weight)
	let v = vector.copy().mult(factor)
	line(0, 0, v.x, v.y)
	pop()
}


/*function mousePressed() {
	let mouse = createVector(mouseX, mouseY)
	let vector = p5.Vector.sub(mouse, player.pos)
	vector.normalize().mult(10)
	player.addForce(vector)
}*/

/* ==================================================== */


/* ==================================================== */

class Player {
	constructor(pos) {
		this.collision = false
		this.pos = pos
		this.vel = createVector(0,0)
		this.acc = createVector(0,0)

		this.moveSpeed = 0.1
		this.jumpSpeed = 4

		this.onRail = false
		this.color = 'black'

		this.rail = null
		
		this.velProjection = null // horizontal
		this.velRejection = null // vertical
	}

	addForce(force) {
		this.acc.add(force)


	}

	update() {
		this.rail = railManager.closestRail
		if (!this.collision){
			this.vel.add(this.acc)
			this.pos.add(this.vel)
			this.acc.mult(0) // reset
		

			this.velProjection = projection(this.vel, this.rail.direction)
			this.velRejection = rejection(this.vel, this.rail.direction)

			this.tetherToRail()
			this.adjustCoords()
			this.pos = createVector(mouseX,mouseY)

		}
		gateManager.checkcollision(this)
	}

	controls() {
		if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
			this.moveHorizontally()
		}
		if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
			this.moveHorizontally(-1)
		}
		if (player.onRail) {
			if (keyIsDown(UP_ARROW) || keyIsDown(87)) {
				//this.moveVertically()
				this.teleportVertically()
			}
			if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) {
				this.moveVertically(-1)
			}
		}
	}

	tetherToRail() {
		// This should be called after the player has updated its position
		// Ensures that the player position is always exactly on a rail
		for (let rail of railManager.rails) {
			rail.updateValues()
		}
		railManager.rails.sort((a,b) => (a.closestDistance > b.closestDistance ? 1 : -1))
		let point = railManager.rails[0].closestPoint.copy()
		ellipse(point.x, point.y, 50)
		let diff = p5.Vector.sub(point, player.pos)
		drawVector(player.pos, diff)
		this.pos.add(diff)
	}

	adjustCoords() {
		railManager.calcClosestRail()
		this.rail = railManager.closestRail

		// Always adjust coordinate system so that:
		// The player's velocity is along the direction of the rail
		let newVelProj = projection(this.vel, this.rail.direction)
		let newVelRej = rejection(this.vel, this.rail.direction)

		newVelProj.normalize().mult(this.velProjection.mag())
		newVelRej.normalize().mult(this.velRejection.mag())

		this.vel.mult(0)
		this.vel.add(newVelProj)
		this.vel.add(newVelRej)
	}

	moveHorizontally(sign=1) {
		let direction = railManager.closestRail.direction
		let force = p5.Vector.mult(direction, sign*this.moveSpeed)
		player.addForce(force)
	}

	moveVertically(sign=1) {
		let direction = railManager.closestRail.normal2D
		let force = p5.Vector.mult(direction, sign*this.jumpSpeed)
		player.addForce(force)
		this.findPosition(force)
	}

	teleportVertically(sign=1) {
		let direction = railManager.closestRail.normal2D
		let force = p5.Vector.mult(direction, sign*this.jumpSpeed)
		
		let position = this.findPosition(force)
		if (position) {
			this.pos = position
		}
	}

	findPosition(movementForce) {
		for (let rail of railManager.rails) {
			let v = rail.playerToClosest//createVector(rail.playerToClosest.y, -1*rail.playerToClosest.x)
			let a = movementForce.copy().normalize()
			let b = v.normalize()
			let dot = a.dot(b)
			if (dot == 1) {
				text("dot: "+dot, rail.closestPoint.x+20, rail.closestPoint.y-20)
				return rail.closestPoint
			}
		}
	}

	draw() {
		push()
		noStroke()
		fill(this.color)
		ellipse(this.pos.x,this.pos.y,25) // size
		pop()

		drawVector(createVector(width/2,height/2),this.vel)
	}
}

/* ==================================================== */

class RailManager {
	constructor() {
		this.rails = []
		this.closestRail = null
	}

	calcClosestRail() {
		for (let rail of this.rails) {
			rail.updateValues()
		}
		this.rails.sort((a,b) => (a.distance > b.distance) ? 1 : -1)
		this.closestRail = this.rails[0]
		this.closestPoint = this.closestRail.closestPoint
	}

	update() {
		for (let rail of this.rails) {
			rail.update()
		}
		this.rails.sort((a,b) => (a.distance > b.distance) ? 1 : -1)
		this.closestRail = this.rails[0]
		this.closestPoint = this.closestRail.closestPoint
		drawVector(player.pos, this.closestRail.playerToClosest, "red")
	}

	add(rail) {
		this.rails.push(rail)
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
		this.playerToStart = null // vector3
		this.playerToEnd = null // vector3
		this.playerToClosest = null // vector3
		this.closestPoint = null // vector3

		this.velocityProjection = null // vector3
		this.velocityRejection = null // vector3
		this.prevDotProduct = 0 // float
		this.dotProduct = 0 // float

		this.verticalDistance = Infinity // float
		this.horizontalDistance = Infinity // float
		this.distance = Infinity // float
		this.closestDistance = Infinity // float
 
		this.isClosest = false // bool
		this.color = color // p5.Color
		this.angle = 0 // float

		this.playerMovedThrough = false // bool
	}

	updateValues() {
		// Update all the variables for this object
		this.vector = p5.Vector.sub(this.endPos, this.startPos)
		this.direction = this.vector.copy().normalize()
		this.normal2D = createVector(this.direction.y, -1*this.direction.x) // points 90deg counterclockwise from this.direction
		this.centerPos = p5.Vector.add(this.startPos, p5.Vector.mult(this.vector, 0.5))

		this.playerToCenter = p5.Vector.sub(this.centerPos, player.pos)
		this.playerToStart = p5.Vector.sub(this.startPos, player.pos)
		this.playerToEnd = p5.Vector.sub(this.endPos, player.pos)

		this.prevDotProduct = this.dotProduct
		this.dotProduct = this.playerToCenter.dot(this.normal2D)

		this.velocityProjection = projection(player.vel, this.direction) //this.getVelocityProjection()
		this.velocityRejection = rejection(player.vel, this.direction) //this.getVelocityRejection()

		this.verticalDistance = this.getVerticalDistance()
		this.horizontalDistance = this.getHorizontalDistance()
		this.distance = Math.sqrt(this.horizontalDistance**2 + this.verticalDistance**2)

		this.playerHasCrossed = (this.dotProduct * this.prevDotProduct <= 0) && (this.horizontalDistance == 0)
		this.angle = atan2(this.direction.y, this.direction.x)

		this.closestPoint = this.getClosestPoint()
		this.playerToClosest = p5.Vector.sub(this.closestPoint, player.pos)
		this.closestDistance = this.playerToClosest.mag()
	}

	update() {
		this.updateValues()

		// If this is the closest rail to the player
		// Apply a force to the player
		if (this.isClosest) {
			let sign = Math.sign(this.dotProduct) // float
			let forceFactor = 1/(this.horizontalDistance+1)// float
			let force = p5.Vector.mult(this.normal2D, sign*forceFactor) // vector3
			//drawVector(player.pos, force, 'red', 50, 3)
			player.color = this.color
			player.addForce(force)
			//console.log(force.mag())

			// If the current and previous dot products are different
			// that means that the player has just moved through the Rail
			if (this.playerHasCrossed/*this.dotProduct * this.prevDotProduct <= 0*/) {
				// Set its vertical velocity (Rejection) to zero and add a slight force in the opposite direction
				// Keep its horizontal velocity (Projection)
				player.vel.mult(0)
				player.vel.add(this.velocityRejection.copy().mult(-0))
				//player.vel.add(this.velocityProjection)
				player.addForce(this.velocityProjection)
				
				//player.onRail = true
			} /*else if (this.verticalDistance > 20 ) {
				player.onRail = false
			}*/
		}
	}

	getClosestPoint() {
		let startDistance = this.playerToStart.mag()
		let endDistance = this.playerToEnd.mag()
		if (this.horizontalDistance > 0) {
			return (startDistance < endDistance) ? this.startPos : this.endPos
		} else {
			let r = rejection(this.playerToCenter, this.direction)
			let point = p5.Vector.add(player.pos, r)
			return point
		}
	}

	getVerticalDistance() {
		let v = rejection(this.playerToCenter, this.direction)
		//drawVector(player.pos, v)
		return v.mag()
	}

	getHorizontalDistance() {
		// return the distance between the player and the closest endpoint of the rail
		// if the player is within the two endpoints, return 0 instead
		let length =  this.vector.mag()
		let startProj = projection(this.playerToStart, this.direction)//.mult(-1)
		let endProj = projection(this.playerToEnd, this.direction)
		/*if (this.isClosest) {
			drawVector(player.pos, startProj, 'red')
			drawVector(player.pos, endProj, 'black')
		}*/
		let startDistance = startProj.mag()
		let endDistance = endProj.mag()
		if (startDistance+endDistance > length*1.01)
			return min(startDistance,endDistance)
		else
			return 0
	}

	draw() {
		// Draw the magnetic area
		push()
		translate(this.centerPos)
		rotate(this.angle)
		let w = this.vector.mag()
		let h = w
		rectMode(CENTER)
		fill(0,0,0,20)
		noStroke()
		rect(0,0, w, max(width,height)*2)

		pop()

		// Draw the rail itself
		push()
		translate(this.startPos)
		if (this.isClosest) strokeWeight(5)
		else strokeWeight(2)
		stroke(this.color)
		line(0,0,this.vector.x,this.vector.y)
		pop()


		push()
		fill(this.color)
		ellipse(this.closestPoint.x, this.closestPoint.y, 15)

		pop()

		if (!this.isClosest)
			return

		//text("vertical distance: " + this.verticalDistance, 50,100)
		//text("horizont distance: " + this.horizontalDistance, 50, 120)
	}
}

class GateManager {
	constructor(){
		this.gates = []
	}
	add(gate) {
		this.gates.push(gate)
	}
	checkcollision(player){
		for (let i = 0 ; i < this.gates.length; i++){
			if ((player.pos.x >=this.gates[i].pos.x )&&(player.pos.x <= this.gates[i].maxX)){
				if((player.pos.y >=this.gates[i].pos.y )&&(player.pos.y <= this.gates[i].maxY)){
					player.collision = true
				}
			}
		}
	}

}

class Gate {
	constructor(pos, type) {
		this.pos = pos
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