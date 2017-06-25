$(document).ready(function() {
	var canvas = $('#map')[0];
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	$("#zoom").on("input", function(){
		zoom(parseInt($(this).val()), 0, 0);
	});
	var press = false;
	var startX = 0;
	var startY = 0;
	$(canvas)
	.mousedown(function(e){
        press = true;
		startX = e.originalEvent.clientX;
		startY = e.originalEvent.clientY;
    })
    .mousemove(function(e){
        if(press){
			offsetX(ox + (e.originalEvent.clientX - startX));
			offsetY(oy + (e.originalEvent.clientY - startY));
			startX = e.originalEvent.clientX;
			startY = e.originalEvent.clientY;
		}
		// console.clear();
		// console.log("px: "+e.originalEvent.clientX+", py: "+e.originalEvent.clientY);
		// console.log("cx: "+x(e.originalEvent.clientX)+", cy: "+y(e.originalEvent.clientY));
		// console.log("gx: "+gx+", gy: "+gy);
     })
    .mouseup(function(){
        press = false;
    });
	$(window).bind('mousewheel DOMMouseScroll', function(event){
		startX = event.originalEvent.clientX;
		startY = event.originalEvent.clientY;
	    if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) {
	        zoom(z + z*0.1, startX, startY);
	    }
	    else {
	        zoom(z - z*0.1, startX, startY);
	    }
	});
	window.onresize = function(){ resize(); }
	$('body').css('top', -(document.documentElement.scrollTop) + 'px').addClass('noscroll');

	if(canvas.getContext){
		var ctx = canvas.getContext('2d'); //canvas context
		var cw = 1000, ch = 1000; //canvas size
		var w = 0, h = 0; //width and height of window
		var ox = 0, oy = 0; //offset x and offset y
		var z = 1; //zoom level
		var m = 1; //multiplier
		var mz = 20; //max-zoom
		var gx = 0; //
		var gy = 0; //
		var systems = new Array();

		function setup(){
			resize();
			zoom(1, 0, 0);
			offsetX(0);
			offsetY(0);
			gx = x(0)-((w-cw)/2);
			gy = y(0)-((h-ch)/2);
			$.ajax({
        		type: "GET", url: "systems.csv", dataType: "text",
		        success: function(file){ read(file); }
     		});
		}
		function resize(){
			ctx.clearRect(0, 0, w, h);
			w = canvas.width = window.innerWidth;
			h = canvas.height = window.innerHeight;
			var dw = cw/w;
			var dh = ch/h;
			m = Math.max(dw, dh);
			draw();
		}
		function read(file){
    		var lines = file.split(/\r\n|\n/);
			var headers = lines[0].split(',');
			for (var i=1; i<lines.length; i++) {
		        var inst = lines[i].split(',');
		        if (inst.length == headers.length)
		            systems.push(new system(inst[0], inst[1], inst[2], inst[3], inst[4]));
		    }
		}
		function loop(){
			window.requestAnimationFrame(loop);
			draw();
		}

		function zoom(level, posX, posY){
			if(level<1) z = 1;
			else if(level>mz) z = mz;
			else{
				var difX = (ox+(posX/z)) - ((ox+(posX/level)));
				var difY = (oy+(posY/z)) - ((oy+(posY/level)));
				z = level;
				offsetX(ox-difX);
				offsetY(oy-difY);
			}
			// console.log("l: " + level);
		}
		function offsetX(inX){
			if(inX<-(w-(w/z))) ox = -(w-(w/z));
			else if(inX>0) ox = 0;
			else ox = inX;
			if(cw*z<w) ox += (w-(cw*z))/2;
		}
		function offsetY(inY){
			if(inY<-(ch-(ch/z))) oy = -(ch-(ch/z));
			else if(inY>0) oy = 0;
			else oy = inY;
			if(ch*z<h) oy += (h-(ch*z))/2;
		}
		function x(inX){ return ((inX+ox)*z)/m; }
		function y(inY){ return ((inY+oy)*z)/m; }
		function r(inR){ return ((inR)*z)/m; }
		function x2(inX){ return ((inX+ox)*((z/2)+0.5))/m; }
		function y2(inY){ return ((inY+oy)*((z/2)+0.5))/m; }

		function draw(){
			ctx.clearRect(0, 0, w, h);
			ctx.fillStyle = "rgb(0,0,0)";
			ctx.fillRect(0, 0, w, h);
			ctx.globalAlpha = 0.5;
			ctx.drawImage(document.getElementById('background'), (w/2)-h, 0, (w/2)+h, h);
			ctx.globalAlpha = (1-(z/mz))/2;
			ctx.drawImage(document.getElementById('nebula'), (w/2)-h, 0, (w/2)+h, h);//x(0)-gx, y(0)-gy, x(cw)+gx, y(ch)+gy);
			ctx.globalAlpha = 1.0;
			for(var i=0; i<=60; ++i) drawLine(i*(cw/60), 0, i*(cw/60), ch, "rgb(50,50,50)");
			for(var i=0; i<=60; ++i) drawLine(0, i*(ch/60), cw, i*(ch/60), "rgb(50,50,50)");
			drawSystems();
		}

		function drawSystems(){
			drawCirc(cw/2, ch/2, 10, 0, "rgb(255,255,255)");
			for(var i=0; i<systems.length; ++i){
				switch(systems[i].colour){
					case orange:
						drawCirc(systems[1], systems[2], systems[3]*10, "rgb(255,155,55)");
						break;
					case white:
						drawCirc(systems[1], systems[2], systems[3]*10, "rgb(255,255,255)");
						break;
					default:
						drawCirc(systems[1], systems[2], systems[3]*10, "rgb(255,255,255)");
						break;
				}
			}
		}

		function drawLine(x1, y1, x2, y2, stroke, colour){
			ctx.strokeStyle = colour;
			ctx.lineWidth = stroke;
			ctx.lineCap = "round";
			ctx.beginPath();
			ctx.moveTo(x(x1), y(y1));
			ctx.lineTo(x(x2), y(y2));
			ctx.stroke();
		}
		function drawRect(x1, y1, x2, y2, stroke, colour){
			ctx.fillStyle = colour;
			ctx.strokeStyle = colour;
			ctx.lineWidth = stroke;
			var rectangle = new Path2D();
    		rectangle.rect(x(x1), y(y1), x(x2), y(y2));
			if(stroke==0) ctx.fill(rectangle);
			else ctx.stroke(rectangle);
		}
		function drawCirc(x1, y1, r1, stroke, colour){
			ctx.fillStyle = colour;
			ctx.strokeStyle = colour;
			ctx.lineWidth = stroke;
			var circle = new Path2D();
    		circle.arc(x(x1), y(y1), r(r1), 0, 2 * Math.PI);
			if(stroke==0) ctx.fill(circle);
			else ctx.stroke(circle);
			// console.log("drawn circle at "+x(x1)+", "+y(y1)+" of radius "+r(r1)+", colour: "+colour);
		}
	}

	function system(name, x, y, sm, type){
		var name = this.name;
		var x = this.x;
		var y = this.y;
		var sm = this.sm;
		var type = this.type;
		function star(){

		}
	}

	setup();
});
