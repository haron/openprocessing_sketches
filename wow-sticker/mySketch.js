let wow_sticker = function ( sketch ) {
    let s = sketch;
    let utils = new okdimokPrimitives(sketch);
	[s.size_x, s.size_y] = utils.getSizeFromHash()
	if (utils.parsedHash.get("ver") !== "reels") {
		s.size_y *= 250/512
	}
	// [s.size_x, s.size_y] = [512, 250]

    var disturbance = 0.3;
	s.fps = 30;
	s.capture = true;
	s.video_format = "png";
	s.loop = 3;
	if (utils.parsedHash.get("ver") == "reels") {
		s.loop = 15;
	}
	var colorPoints = [];
	var fullscreen = false;
	var spatialGradient;
	var gridSize = 30;
	var drawables = [];

	s.drawConcetric = function(p, rref, cref, pass) {
		let c = cref.copy();
		let dr = 1/512, maxr = 1.5*rref, minr = 2/512 ;
		let n = s.floor((maxr-minr)/dr);
		if (utils.parsedHash.get("ver") == "gif" && pass == "pre") {
			s.fill("#000");
			s.circle(p.x, p.y, 2*maxr);
			return 
		}
		c.setAlpha(1./n*2);
		for (let i = minr; i < maxr; i+=dr) {
			s.fill(c)
			s.circle(p.x, p.y, 2*i);
		}
		c.setAlpha(1.);
		s.fill(c)
		s.circle(p.x, p.y, 0.99*rref);
	}

	class LightPath {
		constructor(shift) {
			// this.rad = 10;
			this.rad = 10/512;
			// h is the total height  in diameters
			// w is the width of the middle bar in diameters
			let r = this.rad;
			this.setPath();
			this.total_n ??= s.floor(this.path.getTotalLength()/2/r/1.3);
			this.colors = new Array(this.total_n).fill(0).map(() => [
				utils.randomIn(0., 1.),
				utils.randomIn(0.8, 1.),
				utils.randomIn(0.5, 0.6),
				1.
			])
			this.shift ??= shift ?? s.floor(this.total_n/3);
			this.colors_shifted = Array.prototype.concat(
				this.colors.slice(this.shift, this.colors.length),
				this.colors.slice(0, this.shift),
			);

			this.progress = 0
			this.addProgressTween()
			this.afterConstructor()
		}

		afterConstructor() {}

		addProgressTween() {
			this.progressTween = p5.tween.manager.addTween(this)
			.setSketch(s)
			.addMotionSeconds('progress', 0.2, s.loop/2)
			.addLastMotion('progress', 0)
			.startLoop()
		}

		setPath() {
			let r = this.rad;
			let h = 10, w = 3;
			this.path = new utils.Path()
				.addPoint(new p5.Vector(-w*r, r))
				.addPoint(new p5.Vector(w*r, r))
				.close();
		}

		beforeDraw() {}

		draw() {
			s.push();
			s.noFill();
			this.beforeDraw();
			this.path.display()
			if (utils.parsedHash.get("ver") == "gif") {
				for (var i = 0., j = 0; j < this.total_n; i+=1./this.total_n, j++) {
					let p = this.path.getPosAtT(i + this.progress);
					s.drawConcetric(p, this.rad*1.3, utils.newUnitColor(s.HSL, this.colors[j]), "pre")
				}
			}
			for (var i = 0., j = 0; j < this.total_n; i+=1./this.total_n, j++) {
				let p = this.path.getPosAtT(i + this.progress);
				let c1 = this.colors[j], c2 = this.colors_shifted[j];
				let c = utils.lerpTwoUnitHSLTriplets([c1, 1 - s.animLoop.progress], [c2, s.animLoop.progress])
				s.drawConcetric(p, this.rad, utils.newUnitColor(s.HSL, c))
			}
			s.pop()
		}

	}
	
	class WPath extends LightPath {
		beforeDraw() {
			s.translate(-10*this.rad, 0);
		}

		addProgressTween() {
			this.progressTween = p5.tween.manager.addTween(this)
				.setSketch(s)
				.addLastMotion('progress', 1/3.)
				.startLoop()
		}

		afterConstructor() {
		}

		setPath() {
			let r = this.rad;
			let ht = 5, hb = 5;
			let dx = 3; // in diameters per one vertical
			this.path = new utils.Path()
				.addPoint(new p5.Vector(-2*dx*r, -ht*r))
				.addPoint(new p5.Vector(-dx*r, hb*r))
				.addPoint(new p5.Vector(0, -ht*r))
				.addPoint(new p5.Vector(dx*r, hb*r))
				.addPoint(new p5.Vector(2*dx*r, -ht*r))
				// .close();
			this.total_n = 52;
		}
		
	}

	class WRightPath extends WPath {
		beforeDraw() {
			s.translate(+10*this.rad, 0);
		}
	}

	class OPath extends WPath {

		addProgressTween() {
			this.progressTween = p5.tween.manager.addTween(this)
				.setSketch(s)
				.addLastMotion('progress', 1.)
				.startLoop()
		}

		beforeDraw() {}

		setPath () {
			let r = this.rad;
			let ht = 5, hb = 5;
			let dx = 2.; // in diameters per one vertical
			this.path = new utils.Path()
				.addPoint(new p5.Vector(0, -ht*r))
				.addPoint(new p5.Vector(dx*r, 0))
				.addPoint(new p5.Vector(0, hb*r))
				.addPoint(new p5.Vector(-dx*r, 0))
				.close();
			this.total_n = 36;
			this.shift = 0;
		}

	}

	class ITopPath extends LightPath {
		setPath() {
			this.rad = 10;
			// hb is the height of the bottom in diameters
			// ht is the height of the top in diameters
			let r = this.rad;
			let hb = 10, ht = 3;
			this.path = new utils.Path()
				.addPoint(new p5.Vector(-r, -hb*(r-2)))
				.addPoint(new p5.Vector(r, -hb*(r-2)))
				.addPoint(new p5.Vector(r, -hb*r))
				.addPoint(new p5.Vector(-r, -hb*r))
				// .close();
			this.total_n = 4;
		}

		addProgressTween() {
			this.progressTween = p5.tween.manager.addTween(this)
			.setSketch(s)
			.addLastMotion('progress', 3)
			.startLoop()
		}

	}

	class ShiftedDrawable {
		constructor(shift, drawable) {
			this.shift = shift
			this.drawable = drawable
		}

		draw(){
			s.push();
			s.translate(this.shift[0], this.shift[1])
			this.drawable.draw()
			s.pop()
		}
	}

	function shift_and_instantiate (shift, classes) {
		return classes.map(cls => new ShiftedDrawable(shift, new cls()));
	}


	s.drawBg = function() { s.background("#000"); }

	s.prepareNewSeeds = function(){
		drawables = [new WPath(), new WRightPath(), new OPath()]
		if (utils.parsedHash.get("ver") == "reels") {
			drawables = drawables.concat(shift_and_instantiate([0, -0.2], [WPath, WRightPath, OPath]))
			drawables = drawables.concat(shift_and_instantiate([0, -0.4], [WPath, WRightPath, OPath]))
			drawables = drawables.concat(shift_and_instantiate([0, -0.6], [WPath, WRightPath, OPath]))
			drawables = drawables.concat(shift_and_instantiate([0, 0.2], [WPath, WRightPath, OPath]))
			drawables = drawables.concat(shift_and_instantiate([0, 0.4], [WPath, WRightPath, OPath]))
			drawables = drawables.concat(shift_and_instantiate([0, 0.6], [WPath, WRightPath, OPath]))
			// drawables = drawables.concat(shift_and_instantiate([0, -0.2], [WPath, WRightPath, OPath]))
		}
		p5.tween.manager.restartAll();
	}

	s.stepDynamics = function(){
		p5.tween.manager.update(s.deltaTime);
		if (s.animLoop.elapsedFrames === 0) { p5.tween.manager.restartAll(); }
	}

	s.drawOnce = function(){
		s.clear();
		// s.background("#0f0");
		// s.text(s.millis(), 0, 0)
		// s.text(s.deltaTime, 0, 30)
		// s.scale(1./512., 1./512.)
		s.scale(s.size_x, s.size_x)
		s.scale(0.95, 0.95)
		for (var d of Object.values(drawables)) {
			d.draw()			
		}

	}

    s.setup = function() {
        s.createCanvas(s.size_x, s.size_y);
        // s.drawBg();
        s.noStroke();
		s.frameRate(s.fps);
		s.createLoop(s.loop);
		s.prepareNewSeeds();

    }

	s.drawFrame = function() {
		s.clear()
		s.translate(0.5 * s.size_x, s.size_y/2)
		s.scale(1.5)
		s.stepDynamics();
		s.drawOnce();
	}

	utils.add_default_behaviors(this, s);




}