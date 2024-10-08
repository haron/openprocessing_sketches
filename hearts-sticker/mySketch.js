let hearts_sticker = function ( sketch ) {
    let s = sketch;
    let utils = new okdimokPrimitives(sketch);
	[s.size_x, s.size_y] = utils.getSizeFromHash()

	s.fps = 30;
	s.capture = true;
	s.video_format = "png";
	s.loop = 3;

	s.drawHeart = function(scale) {
		// https://svg2p5.com/ 
		s.push()
		s.scale(scale??1);
		s.rotate(s.PI)
		s.translate(-15, -1631.5);
		s.translate(3.05, 3.5);
		s.beginShape();
		s.vertex(14.9,1631.5);
		s.bezierVertex(15.7,1631.5,16.5,1631.2,17.2,1630.6);
		s.bezierVertex(17.5,1630.3,17.8,1629.9,18,1629.5);
		s.bezierVertex(18.2,1629,18.3,1628.6,18.3,1628);
		s.bezierVertex(18.3,1626.6,17.7,1625.4,16.5,1624.4);
		s.bezierVertex(16,1624,15.2,1623.2,13.9,1622.2);
		s.bezierVertex(12.6,1621.2,12,1620.7,12,1620.7);
		s.vertex(7.4,1624.5);
		s.bezierVertex(6.9,1625,6.4,1625.5,6.1,1626.1);
		s.bezierVertex(5.8,1626.7,5.6,1627.3,5.6,1627.9);
		s.bezierVertex(5.6,1628.4,5.7,1629.,5.8,1629.4);
		s.bezierVertex(6.0,1630.1,6.5,1630.7,7.1,1631.1);
		s.bezierVertex(7.7,1631.5,8.3,1631.7,9,1631.7);
		s.bezierVertex(10.2,1631.7,11.2,1631.2,11.9,1630.2);
		s.bezierVertex(12.8,1631,13.8,1631.5,14.9,1631.5);	
		s.endShape(s.CLOSE);


		s.pop()
		
		// s.rectMode(s.CENTER)
		// s.fill('blue')
		// s.rect(0,0, 2, 100)
		// s.rect(0,0, 100, 2)
		
	}


	s.getSinColorLoopColorAtT = function (t) {
		 let c_from_ph = function (ph) {
			return s.map(s.cos(t + ph), -1, 1, 0, 255)
		}
		let ph = s.TWO_PI/3
		return s.color(c_from_ph(1.5*s.PI),
			c_from_ph(0),
			c_from_ph(s.PI),
		)
	}
	
	class Hearts {
		constructor(){
			this.n_pixels = 5;
			this.final_scale = 30;
			this.gradient_steps = 400;
			this.total_phase_shift = s.PI/2;
			this.t = 0;
			this.n_per_period = 4;
			this.tween = p5.tween.manager.addTween(this)
				.setSketch(s)
				.addMotionsSeconds([
					{ key: 't', target: s.TWO_PI },
				], s.loop/this.n_per_period, 'linear')
				.startLoop()
			
		}

		draw_one_gradient(phase, scale_factor) {
			scale_factor ??=1
			for (let i = this.gradient_steps; i >= 1; i--) {
				s.fill(s.getSinColorLoopColorAtT(phase + i*this.total_phase_shift/this.gradient_steps))
				s.drawHeart(i*this.final_scale/this.gradient_steps*scale_factor)
			}
		}

		draw_text(){
			s.textSize(200)
			s.textAlign(s.CENTER, s.CENTER)
			let phase_shift = 0.3*s.PI
			let text_vs_t_phase = 0;
			let y_shift = 3;
			let y0 = 50;
			// s.fill(s.getSinColorLoopColorAtT(this.t + text_vs_t_phase + phase_shift))
			// s.text("S", 0, y0+y_shift)
			// s.fill(s.getSinColorLoopColorAtT(this.t + text_vs_t_phase - phase_shift))
			// s.text("S", 0, y0-y_shift)
			// s.fill(s.getSinColorLoopColorAtT(this.t + text_vs_t_phase))
			s.fill("#000")
			s.text("S", 0, y0)
			s.pop()
		}

		draw () {
			s.push()
			// s.background("#888")
			// s.fill("#E1D22D");
			s.fill("#888");
			// s.fill("#A68");
			s.fill(s.getSinColorLoopColorAtT(this.t + s.PI));
			s.ellipse(0,0,s.width)
			s.fill("#888");
			s.ellipse(0,0,s.width-30)
			s.translate(0, -40)
			// s.drawHeart(this.final_scale*1.35)
			this.draw_one_gradient(this.t, 1.015);
			this.draw_one_gradient(this.t + this.total_phase_shift);
			// this.draw_text()
			// this.draw_future();
			// s.fill(s.getSinColorLoopColorAtT(this.t))
			// s.drawHeart()
			s.pop()
		}
	}
	var hearts;

	s.drawBg = function() { s.background("#000"); }

	s.prepareNewSeeds = function(){
		hearts = new Hearts();
	}

	s.stepDynamics = function(){
		p5.tween.manager.update(s.deltaTime);
		if (s.animLoop.elapsedFrames === 0) { p5.tween.manager.restartAll();}
	}

	s.drawOnce = function(){
		// s.background("#888");
		s.resetMatrix()
		s.translate(s.width/2, s.height/2)
		s.scale(s.size_x/512)
		// s.drawHeart()
		hearts.draw();

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
		if (utils.parsedHash.get("ver") == "black") s.background("#000");
		if (utils.parsedHash.get("ver") == "margins") utils.showReelsMargins()
		s.stepDynamics();
		s.drawOnce();
	}

	utils.add_default_behaviors(this, s);

}