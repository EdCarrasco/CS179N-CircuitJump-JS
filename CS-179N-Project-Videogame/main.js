let player
let line1
let line2
let line3
let line4

let gate1

let gateManager = null
let railManager = null
FRAMERATE = 60

function setup() {
	createCanvas(640,480)
	railManager = new RailManager()
	gateManager = new GateManager()
	player = new Player(createVector(250+0,200-50))

	/*line0 = new Rail(createVector(350,400), createVector(550,400), 'lightblue')
	line1 = new Rail(createVector(200,400), createVector(450,400), 'green')
	line2 = new Rail(createVector(100,300), createVector(200,400), 'red')
	line3 = new Rail(createVector(100,200), createVector(100,300), 'orange')
	line4 = new Rail(createVector(200,100), createVector(100,200), 'blue')
	line5 = new Rail(createVector(350,100), createVector(200,100), 'pink')
	line6 = new Rail(createVector(250,300), createVector(350,500), 'brown')
	line7 = new Rail(createVector(550,400), createVector(551,101), 'lightgreen')
	line8 = new Rail(createVector(551,101), createVector(350,100), 'red')

	railManager.add(line0)
	railManager.add(line1)
	railManager.add(line2)
	railManager.add(line3)
	railManager.add(line4)
	railManager.add(line5)
	railManager.add(line6)
	railManager.add(line7)
	railManager.add(line8)*/

	rail1 = new Rail(createVector(100,290), createVector(300,290), 'blue')
	rail2 = new Rail(createVector(100,320), createVector(300,320), 'green')
	rail3 = new Rail(createVector(100,400), createVector(300,400), 'orange')
	rail4 = new Rail(createVector(330,300), createVector(500,300), 'pink')

	railManager.add(rail1)
	railManager.add(rail2)
	railManager.add(rail3)
	railManager.add(rail4)

	gate1 = new Gate(createVector(100,0), 'AND')
	gateManager.add(gate1)
}

function draw() {
	background('white')
	frameRate(FRAMERATE)

	// UPDATE PHASE
	let mouse = createVector(mouseX, mouseY)
	gate1.teleport(mouse)

	player.controls()
	railManager.update()
	
	player.update()
	gate1.update()

	// DRAW PHASE
	railManager.draw()
	gate1.draw()
	player.draw()
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
