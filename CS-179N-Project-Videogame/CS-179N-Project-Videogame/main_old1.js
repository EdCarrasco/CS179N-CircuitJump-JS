let r1 = null
let player = null
let rails = []
//let fr = 1

let NODE_DISTANCE = 20
let PLAYER_SPEED = .1

let closestNode = null

function setup() {
	createCanvas(640,480)

	player = new Player(createVector(400,200))

	r1 = new Rail(createVector(100,200), createVector(400,200))

	rT = new Rail(createVector(100,100), createVector(300,100))
	rB = new Rail(createVector(100,300), createVector(490,300))

	
	rails.push(rT)
	rails.push(rB)
	rails.push(r1)
	

	player.attachToRail(r1)


	r1.linkNodes(0, rT, 0, "top")
	r1.linkNodes(1, rB, 0, "bot")
}



function draw() {
	//frameRate(fr)
	background(51)

	for (let i = 0; i < rails.length; i++) {
		rails[i].update()
	}
	player.update()

	for (let i = 0; i < rails.length; i++) {
		rails[i].draw()
	}
	player.draw()

	if (closestNode) {
		push()
		fill(255,0,0)
		ellipse(closestNode.position.x, closestNode.position.y, 5)
		pop()
	}
}

/* ============================================ */

function mousePressed() {
	let lastRail = rails[rails.length-1]
	let rail = new Rail(lastRail.endPosition, createVector(mouseX,mouseY))
	lastRail.link(rail)
	rails.push(rail)

	//fr++
}

function keyPressed() {
	console.log("tap!")
	if (keyCode == 87)
		player.changeRails("top")
	else if (keyCode == 83)
		player.changeRails("bottom")
}

function linesIntersection(a,b,c,d) {
	let CmP = createVector(c.x-a.x, c.y-a.y)
	let r   = createVector(b.x-a.x, b.y-a.y)
	let s   = createVector(d.x-c.x, d.y-c.y)

	let CmPxr = CmP.x*r.y - CmP.y*r.x
	let CmPxs = CmP.x*s.y - CmP.y*s.x
	let rxs = r.x*s.y - r.y*s.x

	if (CmPxr == 0) {
		return ((c.x - a.x < 0) != (c.x - b.x < 0)) ||
			   ((c.y - a.y < 0) != (c.y - b.y < 0))
	}
	if (rxs == 0) {
		return false
	}
	let rxsr = 1/rxs
	let t = CmPxs * rxsr
	let u = CmPxr * rxsr

	return (t >= 0) && (t <= 1) && (u >= 0) && (u <= 1)
}

/*function linesIntersection_OLD(a,b,c,d) {
	let CmP = p5.Vector.sub(c,a)
	let r = p5.Vector.sub(b,a)
	let s = p5.Vector.sub(d,c)

	let CmPxr = p5.Vector.cross(CmP, r)
	let CmPxs = p5.Vector.cross(CmP, s)
	let rxs = p5.Vector.cross(r,s)

	if (CmPxr == 0) {
		return ((c.x - a.x < 0) != (c.x - b.x < 0)) ||
			   ((c.y - a.y < 0) != (c.y - b.y < 0))
	}
	if (rxs == 0) {
		return false
	}
	let rxsr = 1/rxs
	let t = CmPxs * rxsr
	let u = CmPxr * rxsr

	return (t >= 0) && (t <= 1) && (u >= 0) && (u <= 1)
}*/

/* ============================================ */

class Player {
	constructor(position) {
		this.rail = null
		this.position = position
		this.speed = 0.5
		this.t = 0
		this.t_step = 0

		this.velocity = 0
		this.direction = null

/*		this.topRail = null
		this.botRail = null*/
	}

/*	findTopBotRails() {
		let x = this.direction.x
		let y = this.direction.y
		this.topRail = createVector(y, -x)
		this.botRail = createVector(-y, x)
		this.topRail.mult(100)
		this.botRail.mult(100)
		push()
		translate(this.position)
		stroke(255,0,0)
		line(0, 0, this.topRail.x, this.topRail.y)
		stroke(0,255,0)
		line(0, 0, this.botRail.x, this.botRail.y)
		pop()
	}*/

	attachToRail(rail) {
		this.rail = rail
		rail.player = this

		this.position = this.rail.startPosition
		this.t_step = this.rail.t_step
		this.t = 0
	}

	moveToNextRail(t) {
		if (this.rail.nextRail != null) {
			this.rail.player = null
			this.attachToRail(this.rail.nextRail)
		} else {
			this.t = 1
			this.t_step = 0
		}
	}

	changeRails(direction) {
		let node = this.rail.getClosestNode(this.t)
		let newNode = direction == "top" ? node.top : node.bottom
		console.log(newNode)
		if (newNode != null) {
			this.rail = newNode.rail
			this.position = newNode.position
		}
	}

	update() {

		
		this.t += this.t_step
		if (this.t <= 0) this.t = 0
		if (this.t >= 1) {
			this.moveToNextRail(this.t)
		}
		
		let prevPosition = this.position
		this.position = this.rail.calcPosition(this.t, this.position, this.speed)
		this.velocity = p5.Vector.sub(this.position, prevPosition)

		this.direction = this.rail.vector.copy().normalize()
		//this.findTopBotRails()
		//console.log(this.velocity.mag())
		push()
		text(this.velocity.mag(), 50, 50)
		pop()

		/*let a = this.position
		let b = p5.Vector.add(this.topRail, this.position)
		let c = rT.startPosition
		let d = rT.endPosition
		push()
		ellipse(a.x, a.y, 10)
		ellipse(b.x, b.y, 10)
		ellipse(c.x, c.y, 10)
		ellipse(d.x, d.y, 10)
		pop()
		let t = linesIntersection(a,b,c,d)

		console.log(t)*/
	}

	draw() {
		push()
		fill(255,100)
		ellipse(this.position.x, this.position.y, 25)
		pop()
	}
}

/* ====================================================== */

class Node {
	constructor(rail, position) {
		this.position = position
		this.next = null
		this.prev = null
		this.top = null
		this.bottom = null
		this.rail = rail
	}

	update() {

	}

	draw() {
		push()
		fill(255,150)
		noStroke()
		ellipse(this.position.x, this.position.y, 5)

		stroke(0,255,0,50)
		if (this.top != null) line(this.position.x, this.position.y, this.top.position.x, this.top.position.y)
		if (this.bottom != null) line(this.position.x, this.position.y, this.bottom.position.x, this.bottom.position.y)
		pop()
		if (this.next != null) this.next.draw()
	}
}

/* ====================================================== */

class Rail {
	constructor(startPos, endPos) {
		this.startPosition = startPos
		this.endPosition = endPos
		this.vector = p5.Vector.sub(this.endPosition, this.startPosition)
		this.direction = this.vector.copy().normalize()
		this.prevRail = null
		this.nextRail = null
		this.player = null
		this.t_step = 0
		this.t_step_factor = PLAYER_SPEED

		this.head = new Node(this, this.startPosition)
		this.amountNodes = 1
		this.generateNodes()
	}

	getClosestNode(t) {
		let index = floor(this.vector.mag()*t / NODE_DISTANCE)
		if (index >= this.amountNodes)
			return -1
		let closest = this.getNode(index)
		closestNode = closest
		return closest
	}

	getNode(index) {
		let nodePtr = this.head
		let i = 0
		while (nodePtr != null) {
			if (i == index) return nodePtr
			nodePtr = nodePtr.next
			i++
		}
		return null
	}

	linkNodes(i, other, j, type) {
		let amount = min(this.amountNodes, other.amountNodes)
		for (let k = 0; k < amount; k++) {
			let node1 = this.getNode(i+k)
			let node2 = other.getNode(j+k)
			if (node1 == null || node2 == null)
				return

			if (type == "top") {
				node1.top = node2
				node2.bottom = node1
			} else {
				node1.bottom = node2
				node2.top = node1
			}
		}
	}

	generateNodes() {
		let length = this.vector.mag()
		this.amountNodes = 1 + floor(length / NODE_DISTANCE)
		let nodePtr = this.head
		//let direction = this.vector.copy().normalize()
		for (let i = 0; i < this.amountNodes - 1; i++) {
			let nextPosition = p5.Vector.add(nodePtr.position, p5.Vector.mult(this.direction, NODE_DISTANCE))
			nodePtr.next = new Node(this, nextPosition)
			nodePtr = nodePtr.next
		}
	}

	link(rail) {
		this.nextRail = rail
		rail.prevRail = this

		// rail.startPosition = this.endPosition
	}

	calcPosition(t, position, speed) {
		let point_t = p5.Vector.mult(this.vector, t)
		let newPosition = p5.Vector.add(this.startPosition, point_t)
		return newPosition
	}

	update() {
		//if (this == r1) this.endPosition = createVector(mouseX, mouseY)
		this.vector = p5.Vector.sub(this.endPosition, this.startPosition)
		this.direction = this.vector.copy().normalize()
		this.t_step = (1/this.vector.mag())*this.t_step_factor
		if (this.player != null) {
			this.player.t_step = this.t_step
		}
	}

	draw() {
		push()
		if (this.player != null) stroke(0,0,255)
		else stroke(255)
		line(this.startPosition.x, this.startPosition.y, this.endPosition.x, this.endPosition.y)
		pop()
		this.head.draw()
	}
}