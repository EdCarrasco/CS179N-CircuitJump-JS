class RailManager {
	constructor() {
		this.rails = []
		this.closestRail = null
	}

	calcClosestRail() {
		if (this.rails.length < 1) {
			return
		}
		
		for (let rail of this.rails) {
			rail.updateValues() // only updates values
		}
		this.rails.sort((a,b) => (a.distance > b.distance) ? 1 : -1)
		this.closestRail = this.rails[0]
		this.closestPoint = (this.closestRail) ? this.closestRail.closestPoint : null

		if (this.closestRail) this.closestRail.isPowered = true
	}

	update() {
		if (this.rails.length < 1) {
			return
		}

		for (let rail of this.rails) {
			rail.update()
		}
		this.rails.sort((a,b) => (a.distance > b.distance) ? 1 : -1)
		this.closestRail = this.rails[0]
		this.closestPoint = (this.closestRail) ? this.closestRail.closestPoint : null
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