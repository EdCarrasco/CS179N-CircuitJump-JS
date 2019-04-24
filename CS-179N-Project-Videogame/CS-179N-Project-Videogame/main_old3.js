let a
let b

function setup() {
	createCanvas(640,480)

	a = createVector(100,-100)
	b = createVector(200,0)
}

function draw() {
	background(51)
	a = createVector(mouseX-width/2,mouseY-height/2)
	let projection = p5.Vector.mult(b,a.dot(b)/b.dot(b))
	let rejection = p5.Vector.sub(a,projection)

	push()
	translate(width/2,height/2)
	stroke('green')
	line(0,0, a.x, a.y)
	stroke('white')
	line(0,0, b.x, b.y)
	stroke('red')
	line(0,0, projection.x, projection.y)
	stroke('blue')
	line(0,0, rejection.x, rejection.y)
	pop()
}