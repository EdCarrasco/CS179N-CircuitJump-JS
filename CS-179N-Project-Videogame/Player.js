class Player {
	constructor(pos) {
		this.collision = false
		this.pos = pos
		this.vel = createVector(0,0)
		this.acc = createVector(0,0)
		this.radius = 12.5
		this.moveSpeed = 0.1
		this.jumpSpeed = 4

		this.onRail = false
		this.color = 'black'

		this.currentRail = null
		
		this.velProjection = null // horizontal
		this.velRejection = null // vertical

		this.hasCollidedWithGate = false
		this.sprite = null

		this.velDir = 1
		this.accDir = 1
		this.angle = 0
	}

	addForce(force) {
		this.acc.add(force)
	}

	getCollisionWithGate() {
		let collision = false
		for (let gate of gateManager.gates) {
			if (gate.hasCollidedWithPlayer) {
				collision = true
			}
		}
		return collision
	}

	update() {
		this.currentRail = railManager.closestRail
		this.hasCollidedWithGate = this.getCollisionWithGate()

		if (!this.hasCollidedWithGate) {
			this.vel.add(this.acc)
			this.vel = constraintVector(this.vel, MIN_SPEED, MAX_SPEED)
			this.pos.add(this.vel)
			
			this.velProjection = (this.currentRail) ? projection(this.vel, this.currentRail.direction) : null
			this.velRejection = (this.currentRail) ? rejection(this.vel, this.currentRail.direction) : null

			this.tetherToRail()
			this.adjustCoords()

			//this.pos = createVector(mouseX,mouseY)
		}

		this.angle = (this.currentRail) ? this.currentRail.angle : 0
		this.calcSpriteDirection()
		this.acc.mult(0) // reset acceleration
	}

	calcSpriteDirection() {
		if (this.currentRail) {
			let v = this.vel.copy().normalize()
			let a = this.acc.copy().normalize()
			let d = this.currentRail.direction.copy().normalize()
			let vdot = v.dot(d)
			let adot = a.dot(d)
			this.velDir = (vdot >= 0) ? 1 : -1
			this.accDir = (adot >= 0) ? 1 : -1
		}
	}

	controls() {
		if (this != player)
			return
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
		/*for (let rail of railManager.rails) {
			rail.updateValues()
		}
		railManager.rails.sort((a,b) => (a.closestDistance > b.closestDistance ? 1 : -1))
		let point = railManager.rails[0].closestPoint*/
		railManager.calcClosestRail()
		let point = (railManager.closestRail) ? railManager.closestRail.closestPoint : player.pos
		let diff = p5.Vector.sub(point, player.pos)
		this.pos.add(diff)
	}

	adjustCoords() {
		railManager.calcClosestRail()
		this.currentRail = railManager.closestRail

		// Always adjust coordinate system so that:
		// The player's velocity is along the direction of the rail
		if (this.currentRail) {
			let newVelProj = projection(this.vel, this.currentRail.direction)
			let newVelRej = rejection(this.vel, this.currentRail.direction)

			newVelProj.normalize().mult(this.velProjection.mag())
			newVelRej.normalize().mult(this.velRejection.mag())

			this.vel.mult(0)
			this.vel.add(newVelProj)
			this.vel.add(newVelRej)
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
				//text("dot: "+dot, rail.closestPoint.x+20, rail.closestPoint.y-20)
				return rail.closestPoint
			}
		}
	}

	draw() {
		if (this.sprite == null) {
			return
		}

		push()
		translate(this.pos)
		rotate(this.angle)
		scale(this.velDir * 0.2, 0.2)
		imageMode(CENTER)
		image(this.sprite, 0,0)
		pop()
		

		//drawVector(createVector(width/2,height/2), this.vel, 'black', 20, 5)
	}
}