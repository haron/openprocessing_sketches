let cross_sticker = function ( sketch ) {
    let s = sketch;
    let utils = new okdimokPrimitives(sketch);
	[s.size_x, s.size_y] = utils.getSizeFromHash()

    var disturbance = 0.3;
	s.fps = 30;
	s.capture = true;
	s.video_format = "png";
	var loop = 3;
	if (utils.parsedHash.get("ver") == "reels") {
		loop = 15;
	}
	var colorPoints = [];
	var fullscreen = false;
	var mask;
	var checkmark_fill, checkmark_fill_img;
	var spatialGradient;
	var gridSize = 30;

	s.drawBg = function() { s.background("#000"); }

	s.prepareNewSpatialGradient = function(){
		var colorPoints = []; 	
		for (let i = 0; i < 15; i++) {
			colorPoints.push(
				new utils.ColorPoint(
					new utils.LoopNoiseDynamics( new p5.Vector(utils.randomIn(0, s.width),
						utils.randomIn(0, s.height)),
						new p5.Vector(s.width, s.height),
						0.01*loop
					),
					new utils.LoopNoiseDynamics(
						new p5.Vector (
							utils.randomIn(100, 255),
							utils.randomIn(0, 50),
							utils.randomIn(0, 1)
						),
						new p5.Vector(100, 100, 1),
						0.03*loop,
						true
					)
				)
			)
		}
		spatialGradient = new utils.SpatialGradient(colorPoints, 3, (v => v**(-2)), utils.lerpManyColors);
	}

	s.stepGradient = function(){
		let millis = s.millis();
		for (var cp of Object.values(spatialGradient.colorPoints)) {
			cp.p.step(millis);
			cp.c.step(millis);
		}
	}

	s.drawGradientOnce = function(s){
		const rad = s.width/gridSize;
		s.rectMode(s.CENTER)
		s.noStroke();
		for (var x = -rad; x <= s.width + 2 * rad; x +=  2*rad) {
			for (var y = -rad; y <= s.height + 2 * rad; y +=  2*rad) {
				let p = new p5.Vector(x, y);
				let c = spatialGradient.getPointColor(p);
				s.fill(c)
				s.rect(x, y, 2*rad, 2*rad);
				// s.circle(x, y, 2*rad);
			}
		}
	}

	s.prepareNewSeeds = function(){
		if (mask) {mask.remove()}
		mask = s.createGraphics(s.width, s.height);
		s.drawCross(mask, "#ffff");
		if (checkmark_fill) {checkmark_fill.remove()}
		checkmark_fill = s.createGraphics(s.width, s.height);
		s.prepareNewSpatialGradient();
		// checkmark_fill.background("red");

	}

	s.stepDynamics = function(){
		let millis = s.millis();
		s.stepGradient();
		// for (var cp of Object.values(colorPoints)) {
		// 	cp.p.step(millis);
		// 	cp.c.step(millis);
		// }
	}

	s.drawOneCross = function (img) {
		img.push()
		let w = 0.1, l = 0.3;
		img.rotate(-s.QUARTER_PI);
		// img.translate(-3/gridSize, -1/gridSize);
		img.rect(0, 0, 2*l+w, w);
		img.rect(0, 0, w, 2*l+w);
		img.pop()
	}

	s.drawCross = function (img, color) {
		img.clear()
		img.background("#0000")
		img.noStroke();
		img.fill(color)
		img.push()
		img.scale(img.width);
		img.translate(0.5, 0.5);
		img.rectMode(s.CENTER);
		
		if (utils.parsedHash.get("ver") == "margins" || 
			utils.parsedHash.get("ver") == "reels") {
			img.translate(-0.1, 0.);
			s.drawOneCross(img);
			img.translate(0.2, 0.5);
			s.drawOneCross(img);
		} else {
			s.drawOneCross(img);
		}
		img.pop()
	}

	s.drawOnce = function(){
		s.clear();
		// s.background("#000");
		if (utils.parsedHash.get("ver") == "margins") utils.showReelsMargins()
		s.drawGradientOnce(checkmark_fill);
		checkmark_fill_img = checkmark_fill.get() 
		checkmark_fill_img.mask( mask.get() );
		s.image(checkmark_fill_img, 0, 0);


	}

    s.setup = function() {
        s.createCanvas(s.size_x, s.size_y);
        // s.drawBg();
        s.noStroke();
		s.frameRate(s.fps);
		s.createLoop(loop);
		s.prepareNewSeeds();

    }


	s.drawFrame = function() {
		s.clear()
		s.stepDynamics();
		s.drawOnce();
	}

	utils.add_default_behaviors(this, s);




}