class RailManager {
	constructor() {
		this.rails = []
		this.closestRail = null
	}

	calcClosestRail() {
		for (let rail of this.rails) {
			rail.updateValues() // only updates values
		}
		this.rails.sort((a,b) => (a.distance > b.distance) ? 1 : -1)
		this.closestRail = this.rails[0]
		this.closestPoint = this.closestRail.closestPoint

		this.closestRail.isPowered = true
	}

	update() {
		for (let rail of this.rails) {
			rail.update()
		}
		this.rails.sort((a,b) => (a.distance > b.distance) ? 1 : -1)
		this.closestRail = this.rails[0]
		this.closestPoint = this.closestRail.closestPoint
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