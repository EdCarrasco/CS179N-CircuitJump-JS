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
		this.isPowered = false // bool

		this.radius = 5
	}

	updateValues() {
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

		//this.isPowered = false
	}

	update() {
		this.updateValues()

		// If this is the closest rail to the player
		// Apply a force to the player
		/*if (this.isClosest) {
			let sign = Math.sign(this.dotProduct) // float
			let forceFactor = 1/(1+this.horizontalDistance)// float
			let force = p5.Vector.mult(this.normal2D, sign*forceFactor) // vector3
			player.color = this.color
			player.addForce(force)

			// If the current and previous dot products are different
			// that means that the player has just moved through the Rail
			if (this.playerHasCrossed){ //this.dotProduct * this.prevDotProduct <= 0) {
				// Set its vertical velocity (Rejection) to zero and add a slight force in the opposite direction
				// Keep its horizontal velocity (Projection)
				player.vel.mult(0)
				player.vel.add(this.velocityRejection.copy().mult(-0.1))
				player.addForce(this.velocityProjection)
			}
		}*/
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

	hasStartPosCollisionWithPoint(pos) {
		let r = this.radius
		let insideStartX = pos.x >= this.startPos.x-r && pos.x <= this.startPos.x+r
		let insideStartY = pos.y >= this.startPos.y-r && pos.y <= this.startPos.y+r
		return insideStartX && insideStartY
	}

	hasEndPosCollisionWithPoint(pos) {
		let r = this.radius
		let insideEndX = pos.x >= this.endPos.x-r && pos.x <= this.endPos.x+r
		let insideEndY = pos.y >= this.endPos.y-r && pos.y <= this.endPos.y+r
		return insideEndX && insideEndY
	}

	draw() {
		//this.drawHorizontalArea()
		this.drawRail()
		this.drawClosestPoint()

		push()
		translate(this.centerPos)
		let angle = (this.angle > HALF_PI || this.angle < -HALF_PI) ? this.angle+PI : this.angle
		rotate(angle)
		let string = (this.isPowered) ? "POWERED" : "unpowered"
		textAlign(CENTER,CENTER)
		text(string, 0,-5)
		pop()
	}

	drawRail() {
		push()
		translate(this.startPos)
		if (this == railManager.closestRail) strokeWeight(3)
		else strokeWeight(.5)
		stroke(this.color)
		line(0,0,this.vector.x,this.vector.y)
		pop()
	}

	drawClosestPoint() {
		push()
		translate(this.closestPoint)
		noStroke()
		fill(this.color)
		ellipse(0, 0, 8)
		pop()
	}

	drawHorizontalArea() {
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
	}
}