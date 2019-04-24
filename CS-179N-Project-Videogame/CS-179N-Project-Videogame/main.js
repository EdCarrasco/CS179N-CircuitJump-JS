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

	//player = new Player(createVector(150+0,200-0))
	player = new Player(createVector(250+40,400-0))

	//line0 = new Rail(createVector(50,300), createVector(600,300))

	line0 = new Rail(createVector(450,400), createVector(550,400), 'lightgreen')
	line1 = new Rail(createVector(200,400), createVector(450,400), 'green')
	line2 = new Rail(createVector(100,300), createVector(200,400), 'red')
	line3 = new Rail(createVector(100,200), createVector(100,300), 'orange')
	line4 = new Rail(createVector(200,100), createVector(100,200), 'blue')
	line5 = new Rail(createVector(450,100), createVector(200,100), 'pink')

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

	//railManager.add(line6)
	//railManager.add(line7)

	//railManager.add(line8)
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
		this.pos = pos
		this.vel = createVector(0,0)
		this.acc = createVector(0,0)

		this.moveSpeed = 0.1
		this.jumpSpeed = 4

		this.onRail = false
		this.color = 'black'

		this.rail = null
		
		this.velHorizontalMag = 0
		this.velVerticalMag = 0
	}

	addForce(force) {
		this.acc.add(force)


	}

	preUpdate() {
		//this.onRail = true
	}

	update() {
		this.rail = railManager.closestRail
	}

	postUpdate() {
		/*push()
		fill(0)
		ellipse(width/2,height/2, 5)
		fill(0)
		noStroke()
		ellipse(width/2-50,height/2-50, 3)
		pop()*/
		push()
		noStroke()
		fill(this.color)
		ellipse(this.pos.x,this.pos.y,25) // size
		pop()
		//drawVector(player.pos, this.acc, 'black', 10, 3)
		this.vel.add(this.acc)
		//drawVector(player.pos, this.vel, 'black', 1, 3)
		this.pos.add(this.vel)
		this.acc.mult(0) // reset

		this.pos = createVector(mouseX,mouseY)
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

	magnetized() {
		if (this.rails == 0)
			return
	}

	draw() {
		/*push()
		noStroke()
		fill(this.color)
		ellipse(this.pos.x,this.pos.y,25) // size
		pop()*/
	}
}

/* ==================================================== */

class RailManager {
	constructor() {
		this.rails = []
		this.closestRail = null
		this.prevClosestRail = null

		this.zeroRails = []
		this.influenceRails = []

		this.closestPoint = null
	}

	update() {
		for (let rail of this.rails) {
			rail.update()
		}

		this.calcRailsWithZeroHorizontal()
		this.calcInfluenceRails()
		//this.calcCombinedInfluence()

		this.calcClosestRail()
		if (this.closestRail != this.prevClosestRail) {
			//this.adjustPlayer()
		}
		player.onRail = (this.closestRail 
					&& this.closestRail.verticalDistance < 20
					&& this.closestRail.horizontalDistance <= 0)
		/*if (!player.onRail) {
			console.log("onRail = false")
		}*/

		// Closest rail
		this.influenceRails = []
		this.rails.sort((a,b) => (a.distance > b.distance) ? 1 : -1)
		this.influenceRails.push(this.rails[0])

		this.closestPoint = this.influenceRails[0].closestPoint
		drawVector(player.pos, this.influenceRails[0].playerToClosest)
	}

	calcRailsWithZeroHorizontal() {
		this.zeroRails = []
		for (let rail of this.rails) {
			if (rail.horizontalDistance <= 0) {
				this.zeroRails.push(rail)
			}
		}
	}

	calcInfluenceRails() {
		this.influenceRails = []
		if (this.rails.length == 0) {
			return
		}

		if (this.zeroRails.length == 0) {
			// If the player is not in the horizontal zone of any rail,
			// its influence rail becomes the closest one by distance
			this.rails.sort((a,b) => (a.distance > b.distance) ? 1 : -1)
			this.influenceRails.push(this.rails[0])
		} else if (this.zeroRails.length == 1) {
			// If the player is inside the horizontal zone of one rail,
			// by default, that becomes its influence rail
			this.influenceRails.push(this.zeroRails[0])
		} else {
			// If the player is inside the horizontal zone of two or more rails
			// Sort those rails by distance
			// The closest one becomes the main influence rail
			// Any other 
			this.zeroRails.sort((a,b) => (a.distance > b.distance) ? 1 : -1)
			this.influenceRails.push(this.zeroRails[0])

			//drawVector(player.pos, this.influenceRails[0].playerToClosest, 'blue', 1, 12)
			let a = this.influenceRails[0].playerToClosest.copy().normalize()
			for (let i = 1; i < this.zeroRails.length; i++) {
				let b = this.zeroRails[i].playerToClosest.copy().normalize()
				
				let ab = a.dot(b)
				if (ab > 0) {
					//drawVector(player.pos, this.zeroRails[i].playerToClosest, 'green', 1, 4)
					this.influenceRails.push(this.zeroRails[i])
				} else if (ab == 0) {
					//drawVector(player.pos, this.zeroRails[i].playerToClosest, 'orange', 1, 4)
				} else {
					//drawVector(player.pos, this.zeroRails[i].playerToClosest, 'red', 1, 4)
				}
			}
		}
		/*for (let i = 0; i < this.influenceRails.length; i++) {
			if (i == 0)
				drawVector(player.pos, this.influenceRails[0].playerToClosest, 'red', 1, 12)
			else
				drawVector(player.pos, this.zeroRails[i].playerToClosest, 'green', 1, 4)
		}*/
		text("influenceRails: "+this.influenceRails.length, 10,20+20)
		
	}

	calcCombinedInfluence() {
		let combined = createVector(0,0)
		let totalMag = 0
		//console.log(this.influenceRails)
		if (this.influenceRails.length > 0) {
			//let combined = createVector(0,0)
			for (let rail of this.influenceRails) {
				totalMag = rail.playerToClosest.mag()
				//drawVector(player.pos, rail.playerToClosest.copy().normalize(), 'purple', 1, 2)
				combined.add(rail.playerToClosest.copy().normalize())
			}
			
		}
		combined.normalize().mult(totalMag)
		drawVector(player.pos, combined, 'purple', 1, 6)
	}

	adjustPlayer() {
		if (this.prevClosestRail == null || this.closestRail == null)
			return

		let vector = player.acc
		let prevHor = projection(player.acc, this.prevClosestRail.direction)
		let prevVer = rejection(player.acc, this.prevClosestRail.direction)
		let newHor = projection(player.acc, this.closestRail.direction)
		let newVer = rejection(player.acc, this.closestRail.direction)

		newHor.normalize().mult(prevHor.mag())
		//console.log("newHor = "+newHor.mag()+" velHor = " + projection(player.vel, this.closestRail.direction).mag())
		newVer.normalize().mult(prevVer.mag())
		player.acc.mult(0)
		player.acc.add(newHor)
		player.acc.add(newVer)
	}

	add(rail) {
		this.rails.push(rail)
	}

	/*calcClosestRail_OLD() {
		let lowestSqDistance = Infinity
		this.closestRail = null
		for (let rail of this.rails) {
			let sqDistance = rail.getHorizontalDistance()**2 + rail.getVerticalDistance()**2
			if (sqDistance < lowestSqDistance) {
				lowestSqDistance = sqDistance
				this.closestRail = rail
			}
		}
	}*/

	calcClosestRail_OLD2() {
		// Iterate through the array to calculate which rail is closest to the player
		// First, use the distance formula (x^2 + y^2) to determine distance
		// Then, if there's another within a similar distance, use the horizontal distance to break the tie
		let lowestDistance = Infinity
		//this.closestRail = null
		let closestHorDistance = Infinity
		let changedRail = false
		this.prevClosestRail = this.closestRail
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
				if (this.closestRail) {
					this.closestRail.isClosest = false
				}
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
		//console.log(changedRail)
		
	}

	calcClosestRail() {

		let smallestDistance = Infinity
		let closestRail = null
		for (let rail of this.rails) {
			rail.isClosest = false
			if (rail.distance < smallestDistance) {
				smallestDistance = rail.distance
				closestRail = rail
			}
		}

		this.prevClosestRail = this.closestRail
		this.closestRail = closestRail
		this.closestRail.isClosest = true
	}
	

	draw() {
		for (let rail of this.rails) {
			rail.draw()
		}
		//drawVector(player.pos, this.closestRail.playerToCenter)
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