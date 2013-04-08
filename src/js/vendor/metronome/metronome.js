/*global Raphael */

var metronome = function(opts) {
    //primary variables
    var l = typeof opts.l !== "undefined" ? opts.l : 200, // length of metronome arm
        r = typeof opts.r !== "undefined" ? opts.r : 20, //max angle from upright 
        tick_func = typeof opts.tick !== "undefined" ? opts.tick : function() {}, //function to call with each tick
        end_func = typeof opts.complete !== "undefined" ? opts.complete : function() {}, //function to call on completion
        paper = typeof opts.paper !== "undefined" ? opts.paper : Raphael(0, 0, opts.l + 50, opts.l + 50), //function to call on completion
        playSound = typeof opts.sound !== "undefined" ? opts.sound : true //function to call on completion
        
    // initialize audio
    var sound = document.createElement('audio');
    sound.setAttribute('src', 'src/img/tick.wav');
    sound.setAttribute('id', 'tick');
    document.body.appendChild(sound);
    
    // derivative variables
    var y0 = l * Math.cos(Math.PI * r / 180),
        x0 = l * Math.sin(Math.PI * r / 180),    
        y = l + 10,
        x = x0 + 10,    
        tick_count = 0;
    
    var outline = paper.path("M"+x+","+y+"l-"+x0+",-"+y0+"a"+l+","+l+" "+2*r+" 0,1 "+2*x0+",0L"+x+","+y).attr({
        fill: "#EEF",
        'stroke-width': 0    
    });
    
    var arm = paper.path("M" + x + "," + y + "v-" + l).attr({
        'stroke-width': 5,
        stroke: "#999"
    }).data("id", "arm");
        
    var weight = paper.path("M" + x + "," + (y-100) + "h12l-3,18h-18l-3-18h12").attr({
        'stroke-width': 0,
        fill: '#666'
    }).data("id", "weight");

    var vertex = paper.circle(x, y, 7).attr({
        'stroke-width': 0,
        fill: '#CCC'
    }).data("id", "vertex");

    var label = paper.text(x, y + 20, "").attr({
        "text-anchor": "center",
        "font-size": 14
    });

    var mn = paper.set(arm, weight);
    
    Raphael.easing_formulas.sinoid = function(n) { return Math.sin(Math.PI * n / 2) };

    function tick(obj, repeats, callback) {      
        //Raphael summons the callback on each of the three objects in the set, so we
        //have to only call the sound once per iteration by associating it with one of the objects.
        //doesn't matter which one
        if (obj.data("id") === "arm") {
            tick_count += 1;
            if (playSound) {    
                document.getElementById("tick").play();
            }        
            
            label.attr("text", tick_count);    
            
            tick_func();
            
            if (tick_count >= repeats) {
                mn.attr("transform", "R0 " + x + "," + y);    
                end_func();
            }    
        }
    }    

    return {
        start: function(interval, repeats) {
            tick_count = 0;
            mn.attr("transform", "R-20 " + x + "," + y);                
            //animation            
            var ticktock = Raphael.animation({
                "50%": { transform:"R20 " + x + "," + y, easing: "sinoid", callback: function() { tick(this, repeats, done); }},
                "100%": { transform:"R-20 " + x + "," + y, easing: "sinoid", callback: function() { tick(this, repeats, done); }}
            }, interval).repeat(repeats / 2);
            
            arm.animate(ticktock);
            weight.animateWith(arm, ticktock, ticktock);            
        },
        stop: function() {
            mn.stop();
            mn.attr("transform", "R0 " + x + "," + y);                
            end_func();
        }
    };
};