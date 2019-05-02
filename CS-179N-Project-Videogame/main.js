let player
let player2
let line1
let line2
let line3
let line4

let gate1

let gateManager = null
let railManager = null
let FRAMERATE = 60

let MIN_SPEED = 0.1
let BASE_SPEED = 5
let MAX_SPEED = 10
let _CENTER = null
let _CENTERTOP = null

let mousePressedPos = null
let mouseReleasedPos = null
let mouseMode = 'MOVE'
let gateType = 'AND' // gate type for when a gate is created using the mouse
let capturedGates = []
let capturedRailStart = []
let capturedRailEnd = []
let mousePrev = null
let newRailColor = 'red'

function setup() {
	let canvas = createCanvas(720,640)
	_CENTER = createVector(width/2,height/2)
	_CENTERTOP = createVector(width/2,height/2-100)

	railManager = new RailManager()
	gateManager = new GateManager()
	player = new Player(createVector(250+0,200-50))

	player2 = new Player(createVector(200,420))

	line0 = new Rail(createVector(450,400), createVector(550,400), 'lightblue')
	line1 = new Rail(createVector(200,400), createVector(450,400), 'green')
	line2 = new Rail(createVector(100,300), createVector(200,400), 'red')
	line2a = new Rail(createVector(100,320), createVector(200,420), 'red')
	line3 = new Rail(createVector(100,200), createVector(100,300), 'orange')
	line4 = new Rail(createVector(200,100), createVector(100,200), 'blue')
	line5 = new Rail(createVector(350,100), createVector(200,100), 'pink')
	line6 = new Rail(createVector(250,350), createVector(350,500), 'brown')
	line7 = new Rail(createVector(550,400), createVector(650,250), 'lightgreen')
	line8 = new Rail(createVector(550,100), createVector(350,100), 'red')
	line9 = new Rail(createVector(650,250), createVector(550,100), 'orange')

	railManager.add(line0)
	railManager.add(line1)
	railManager.add(line2)
	railManager.add(line2a)
	railManager.add(line3)
	railManager.add(line4)
	railManager.add(line5)
	railManager.add(line6)
	railManager.add(line7)
	railManager.add(line8)
	railManager.add(line9)
	

	//gate1 = new Gate(createVector(100,0), 'OR')
	//gateManager.add(gate1)
}

function draw() {
	if (frameCount == 1) {
		mouseXprev = mouseX
		mouseYprev = mouseY
	}

	background('lightyellow')
	frameRate(FRAMERATE)

	// UPDATE PHASE
	let mouse = createVector(mouseX, mouseY)
	//gate1.teleport(mouse)

	player.controls()
	railManager.update()
	gateManager.update()
	
	player.update()
	player2.update()
	


	// DRAW PHASE
	railManager.draw()
	gateManager.draw()
	
	player.draw()
	player2.draw()

	push()
	let vmapped = (player.vel.mag() >= MIN_SPEED) ? map(player.vel.mag(), MIN_SPEED,MAX_SPEED, 0,100) : 0
	fill('white')
	rect(25,25,100,25)
	fill('green')
	rect(25,25,vmapped,25)
	fill('black')
	text("speed",15,22)
	pop()

	if (mouseIsPressed) objectDragged()
	drawMouseTool()

	mouseXprev = mouseX
	mouseYprev = mouseY


	/*if (mouseReleasedPos) {
		push()
		translate(mouseReleasedPos)
		fill('green')
		ellipse(0,0,20)
		pop()
	}*/
}

function projection(a,b) {
	let factor = a.dot(b) / b.dot(b) // float
	let proj = p5.Vector.mult(b, factor) // vector3
	return proj // vector3
}

function rejection(a,b) {
	let proj = this.projection(a,b) // float
	let rej = p5.Vector.sub(a,proj) // vector3
	return rej // vector3
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

function constraintVector(vector, min, max) {
	let newMag = vector.mag()
	if (newMag > max) newMag = max
	else if (newMag < min) newMag = min
	return vector.copy().normalize().mult(newMag)



	/*if (vmag > max_speed)
		return vector.copy().normalize().mult(max_speed)
	else if (vmag < min_speed)
		return vector.copy().normalize().mult(min_speed)*/
	
	//vector.set(Math.max(Math.min(vector.mag(), max_speed), min_speed))
}

function objectDragged() {
	switch (mouseMode) {
		case 'CREATE_GATE':
			break
		case 'CREATE_RAIL':
		case 'MOVE':
			push()
			stroke(0,50)
			if (mousePressedPos) {
				line(mousePressedPos.x, mousePressedPos.y, mouseX,mouseY)
			}
			pop()
			break
		default:
			break
	}
}

function drawMouseTool() {
	let gateSize = 25
	switch (mouseMode) {
		case 'CREATE_GATE':
			push()
			translate(mouseX,mouseY)
			fill(0,0)
			stroke(0,50)
			rect(0,0,gateSize*2,gateSize*2)
			textAlign(CENTER,CENTER)
			text("create\ngate",gateSize,gateSize)
			pop()
			break
		case 'CREATE_RAIL':
		case 'MOVE':
			push()
			translate(mouseX,mouseY)
			fill(0,0)
			stroke(0,50)
			if (capturedGates.length > 0) {
				rect(0,0,50,50)
			} else {
				ellipse(0,0, 10)
			}
			pop()
			break
		default:
			break
	}
}

function mousePressed() {
	if (!mouseInside()) {
		return
	}
	//console.log("pressed")
	let mousePos = createVector(mouseX, mouseY)
	switch (mouseMode) {
		case 'CREATE_RAIL':
			
			push()
			fill('red')
			ellipse(mouseX,mouseY, 5)
			pop()
			let clickedRail = false
			newRailColor = 'black'
			mousePressedPos = mousePos
			for (let rail of railManager.rails) {
				if (rail.hasStartPosCollisionWithPoint(mousePos)) {
					mousePressedPos = rail.startPos
					clickedRail = true
					newRailColor = rail.color
				}
				if (rail.hasEndPosCollisionWithPoint(mousePos)) {
					mousePressedPos = rail.endPos
					clickedRail = true
					newRailColor = rail.color
				}
			}
			//console.log("clickedRail = " + clickedRail)
			break
		case 'CREATE_GATE':
			mousePressedPos = createVector(mouseX, mouseY)
			break
		case 'MOVE':
			mousePressedPos = createVector(mouseX, mouseY)
			capturedGates = []
			for (let gate of gateManager.gates) {
				if (gate.hasCollisionWithCircle(mousePressedPos, 25)) {
					capturedGates.push(gate)
				}
			}
			if (capturedGates.length > 0) {
				break
			}
			
			capturedRailStart = []
			capturedRailEnd = []
			for (let rail of railManager.rails) {
				mousePressedPos = mousePos
				if (rail.hasStartPosCollisionWithPoint(mousePos)) {
					capturedRailStart.push(rail)
				}
				if (rail.hasEndPosCollisionWithPoint(mousePos)) {
					capturedRailEnd.push(rail)
				}
			}
			
			break
		default:
			mousePressedPos = createVector(mouseX, mouseY)
			break
	}
}

function mouseReleased() {
	if (!mouseInside()) {
		return
	}
	//console.log("released")
	mouseReleasedPos = createVector(mouseX, mouseY)
	switch (mouseMode) {
		case 'CREATE_RAIL':
			let mousePos = createVector(mouseX, mouseY)
			let clickedRail = false
			for (let rail of railManager.rails) {
				mouseReleasedPos = mousePos
				if (rail.hasStartPosCollisionWithPoint(mousePos)) {
					mouseReleasedPos = rail.startPos
					clickedRail = true
				}
				if (rail.hasEndPosCollisionWithPoint(mousePos)) {
					mouseReleasedPos = rail.endPos
					clickedRail = true
				}
			}
			let rail = new Rail(mousePressedPos, mouseReleasedPos, newRailColor)
			rail.updateValues()
			if (rail.vector.mag() >= 5) {
				railManager.add(rail)
			}
			//console.log("clickedRail = " + clickedRail)
			break
		case 'CREATE_GATE':
			let gate = new Gate(mouseReleasedPos, gateType)
			gateManager.add(gate)
			break
		case 'MOVE':
			for (let obj of capturedGates) {
				obj.pos = mouseReleasedPos
			}
			capturedGates = []
			console.log("release -- captured: [" + (capturedRailStart.length+capturedRailEnd.length) + "]  mouse: (" + mouseReleasedPos.x + ", " + mouseReleasedPos.y + ")")
			for (let rail of capturedRailStart) {
				rail.startPos = mouseReleasedPos
			}
			for (let rail of capturedRailEnd) {
				rail.endPos = mouseReleasedPos
			}
			capturedRailStart = []
			capturedRailEnd = []
			break
		default:
			//console.log("Mouse released -- default -- " + mouseMode + " -- " + gateType)
			break
	}
}

function mouseInside() {
	let insideX = mouseX >= 0 && mouseX <= width
	let insideY = mouseY >= 0 && mouseY <= height
	return insideX && insideY
}