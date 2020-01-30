//Tool to play with art in web browser with genetic algorithm
//Created by Nick Harris

//--------- Constants --------------- //
CANVAS_WIDTH = 700;
CANVAS_HEIGHT = 600;
POPULATION = [];
BEST_GENOME = [];
BEST_FITNESS = 0.0;
SAMPLE_RGBA = [];
SAMPLE_RGBA_FLAT = [];
SAMPLE_IMAGE = [];

IMAGE_SELECTED_FLAG = false;
SAMPLE_INITIALIZED_FLAG = false;

//Constants for art
POINT_RADIUS = 5;

//Constants for Mutation
PROB_POINT_MUTATE = 0.1; //gaussian mutation for point style
PROB_FULL_MUTATE = 0.0001;  //fully mutate all aspects of a chromosome

//Constants for GA parameters
ELITISM_RATIO = 0.85;  //ratio of best genomes preserved through elitism


//--------- Classes --------------- //
class genome //genome for a discrete chunk of image that evolves with others to produce a picture
{
    constructor(style)
    {
        this.style = style;
        this.fitness = 0.0;
        this.chromosome = [];
        
        //initialize chromosome and rgba field depending on selected style
        if (style == "point")
        {
            //Values in chrom are a point with an rgb value, a location (expressed as ratio of width and height, and an alpha)
            this.chromosome = [Math.floor(Math.random()*255), Math.floor(Math.random()*255), Math.floor(Math.random()*255), Math.random(), Math.random(), Math.random()];
            
        }
    }
    mutate()
    {
        //Mutate chromosomes depending on style
        if (this.style == "point")
        {
            //Mutate chromosome
            if (Math.random() < PROB_POINT_MUTATE)
            {
                var e1 = gaussian(this.chromosome[0], 50);
                if (e1 > 255) {
                    e1 = 255;
                }
                else if (e1 < 0)
                {
                    e1 = 0;
                }
                var e2 = gaussian(this.chromosome[1], 50);
                if (e2 > 255) {
                    e2 = 255;
                }
                else if (e2 < 0)
                {
                    e2 = 0;
                }
                var e3 = gaussian(this.chromosome[2], 50);
                if (e3 > 255) {
                    e3 = 255;
                }
                else if (e3 < 0)
                {
                    e3 = 0;
                }
                var e4 = gaussian(this.chromosome[4], CANVAS_WIDTH*0.08);
                if (e4 > CANVAS_WIDTH) {
                    e4 = CANVAS_WIDTH - 1;
                }
                else if (e4 < 0)
                {
                    e4 = 0;
                }
                var e5 = gaussian(this.chromosome[5], CANVAS_HEIGHT*0.08);
                if (e5 > CANVAS_HEIGHT) {
                    e5 = CANVAS_HEIGHT - 1;
                }
                else if (e5 < 0)
                {
                    e5 = 0;
                }
                var e6 = gaussian(this.chromosome[6], 0.1);
                if (e6 > 1) {
                    e6 = 1;
                }
                else if (e6 < 0)
                {
                    e6 = 0;
                }
                this.chromosome[i] = [e1 , e2, e3, e4, e5, e6];
            }  

            if (Math.random() < PROB_FULL_MUTATE)
            {
                this.chromosome = [Math.floor(Math.random()*255), Math.floor(Math.random()*255), Math.floor(Math.random()*255), Math.random(), Math.random(), Math.random()];
            }
        }
    }
}

var myDrawArea = 
{
    canvas : document.createElement("canvas"),
    start : function() 
    {
      this.canvas.width = CANVAS_WIDTH;
      this.canvas.height = CANVAS_HEIGHT;
      this.canvas.id = "canvas";
      this.canvas.style = "border:1px solid #000000";
      this.canvas.parentElement = "parent";
      this.context = this.canvas.getContext("2d");
      document.body.insertBefore(this.canvas, document.body.childNodes[2]);
      this.canvas.class = "main-element";
    }
}

//--------- Functions --------------- //

//function to render the population on the canvas
function render_population(ctx)
{
    var rgba_field = [];

    //initialize rgba field
    for(var i = 0; i < CANVAS_WIDTH; i++)
    {
        var line = [];
        for (var j = 0; j < CANVAS_HEIGHT; j++)
        {
            line.push([255, 255, 255, 1])
        }
        rgba_field.push(line);
    } 
    
    //fill out rgba field after chromosome is known
    var index = 0;
    var center = [0, 0];
    for(var i = 0; i < POPULATION.length; i++)
    {
        center = [POPULATION[i].chromosome[3]*CANVAS_WIDTH, POPULATION[i].chromosome[4]*CANVAS_HEIGHT];
        index = [center[0] - POINT_RADIUS, center[1] - POINT_RADIUS];
        for(var j = 0; j < 2*POINT_RADIUS; j++)
        {
            index[1] = center[1] - POINT_RADIUS;
            for (var k = 0; k < 2*POINT_RADIUS; k++)
            {
                if (Math.round(index[0]) >= 0 && Math.round(index[0]) < CANVAS_WIDTH && Math.round(index[1]) >= 0 && Math.round(index[1]) < CANVAS_HEIGHT
                    && Math.sqrt( (index[0] - center[0])**2 + (index[1] - center[1])**2 ) < POINT_RADIUS)
                {
                    rgba_field[Math.round(index[0])][Math.round(index[1])] = pixel_overlay([POPULATION[i].chromosome[0], POPULATION[i].chromosome[1], POPULATION[i].chromosome[2], POPULATION[i].chromosome[5]], rgba_field[Math.round(index[0])][Math.round(index[1])]);
                }
                index[1] += 1;
            }
            index[0] += 1;
        }
    }  
    
    for (var i = 0; i < CANVAS_WIDTH; i++)
    {
        for (var j = 0; j < CANVAS_HEIGHT; j++)
        {
            var r = rgba_field[i][j][0];
            var g = rgba_field[i][j][1];
            var b = rgba_field[i][j][2];
            var a = rgba_field[i][j][3];

            ctx.fillStyle = "rgba("+r+","+g+","+b+", "+a+")"; 
            ctx.fillRect( j, i, 1, 1 );
        }
    }
}
//function to find the resultant rgba value of a pixel from 2 overlayed rgba values
function pixel_overlay(pixel_a, pixel_b)
{
    //premultiply rgb's with their associated alpha value
    for(var i = 0; i  < 3; i++)
    {
        pixel_a[i] *= pixel_a[3];
        pixel_b[i] *= pixel_b[3];
    }

    //compute resultant pixel color and alpha
    var pixel_c = [0, 0, 0, 0];
    for (var i = 0; i < 3; i++)
    {
        pixel_c[i] = pixel_a[i] + pixel_b[i]*(1 - pixel_a[3]);
    }

    pixel_c[3] = pixel_a[3] + pixel_b[3]*(1 - pixel_a[3]);

    return pixel_c;
}

function render_canvas()
{
  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext("2d");

  //clear
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  //draw population
  render_population(ctx);
}

function initialize_population(style, pop_length)
{
    for (var i = 0; i < pop_length; i++)
    {
        POPULATION.push(new genome("point"));
    }
    BEST_GENOME = POPULATION[0];
}

// return a gaussian random number
// returns a gaussian random function with the given mean and stdev.
function gaussian(mean, stdev) {
    var y2;
    var use_last = false;
    return function() {
        var y1;
        if(use_last) {
           y1 = y2;
           use_last = false;
        }
        else {
            var x1, x2, w;
            do {
                 x1 = 2.0 * Math.random() - 1.0;
                 x2 = 2.0 * Math.random() - 1.0;
                 w  = x1 * x1 + x2 * x2;               
            } while( w >= 1.0);
            w = Math.sqrt((-2.0 * Math.log(w))/w);
            y1 = x1 * w;
            y2 = x2 * w;
            use_last = true;
       }

       var retval = mean + stdev * y1;
       if(retval > 0) 
           return retval;
       return -retval;
   }
}

//Function to get the Mean squared error between 2 of our rgba fields
function MSE(image1, image2)
{
    var sum = 0.0;
    var difference = 0.0;
    for (var i = 0; i < CANVAS_WIDTH; i++)
    {
        for (var j = 0; j < CANVAS_HEIGHT; j++)
        {
            difference = 0.0;
            for (var k = 0; k < 4; k++)
            {
                difference += Math.abs(image1[i][j][k] - image2[i][j][k]);
            }
            sum += difference*difference;
        }
    }

    mse = sum/(CANVAS_WIDTH * CANVAS_HEIGHT);

    return mse;
}

//Function to measure MSE on part of the image (rectangle) (points inclusive)
function MSE_partial(image1, image2, x_min, x_max, y_min, y_max)
{
    var sum = 0.0;
    var difference = 0.0;
    for (var i = x_min; i <= x_max; i++)
    {
        for (var j = y_min; j <= y_max; j++)
        {
            if (i >= 0 && j >=0 && i < CANVAS_WIDTH && j < CANVAS_HEIGHT)
            {
                difference = 0.0;
                for (var k = 0; k < 4; k++)
                {
                    difference += Math.abs(image1[i][j][k] - image2[i][j][k]);
                }
                sum += difference*difference;
            }
        }
    }

    mse = sum/((x_max - x_min) * (y_max - y_min));

    return mse;
}

//sort population by fitness
function sort_by_fitness(genomes)
{
    return genomes.sort(function(a, b) {
        var x = a.fitness;
        var y = b.fitness;
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}

//Function to compute a new generation of genomes from old, given their fitnesses
function next_generation(myPop)
{
    //sort population by fitness
    myPop = sort_by_fitness(myPop); //fitnesses in ascending order

    //console.log(myPop[0].fitness, " , ", myPop[myPop.length - 1].fitness);

    BEST_FITNESS = myPop[myPop.length - 1].fitness;

    //Reassign fitness of individual to their ranking
    for (var i = 0; i < myPop.length; i++)
    {   
        myPop[i].fitness = i + 1;
    }
    
    var fitnessTotal = ((myPop.length)*(myPop.length + 1))/2.0; //Thx Gauss


    var new_pop = [];     
        

    //Select genomes to create new population
    while (new_pop.length < Math.floor(myPop.length * (1 - ELITISM_RATIO)))
    {
        //Ranking Proportional Selection
        var spin1 = Math.random() * fitnessTotal; 
        var spin2 = Math.random() * fitnessTotal;

        //get parent chromosomes defined by roulette wheel spins
        var j = 0;
        var marker = 0;
        while( marker + myPop[j].fitness < spin1)
        {
            marker += myPop[j].fitness;
            j += 1;
        }
            
        var k = 0;
        marker = 0;
        while( marker + myPop[k].fitness < spin2)
        {
            marker += myPop[k].fitness;
            k += 1;
        }
            
        //perform crossover
        var child_sequence = new genome(myPop[j].style);

        //half from parent 1, half from parent 2
        for (var y = 0; y < myPop[j].chromosome.length; y++)
        {
            if ( y != 3 && y != 4)
            {
                if(Math.random() < 0.5)
                {
                    child_sequence.chromosome[y] = myPop[j].chromosome[y];
                }
                else
                {
                    child_sequence.chromosome[y] = myPop[k].chromosome[y];
                }    
            }    
        }

        
        if (Math.random() < 0.5)
        {
            child_sequence[3] = myPop[j].chromosome[3];
            child_sequence[4] = myPop[j].chromosome[4];
        }
        else
        {
            child_sequence[3] = myPop[k].chromosome[3];
            child_sequence[4] = myPop[k].chromosome[4];
        }

        //mutate location by force to stop stacking exactly on top of one another
        child_sequence[3] = gaussian(child_sequence[3], CANVAS_WIDTH*0.10);
        child_sequence[4] = gaussian(child_sequence[4], CANVAS_HEIGHT*0.10); 

        //mutate genome with some probability
        child_sequence.mutate();

        //Add individual to new popultaion
        new_pop.push(child_sequence);
    }

    //preserve some genomes through elitism  
    for (var x = 0; x < Math.ceil(myPop.length * ELITISM_RATIO); x++)
    {
        if (x == 0)
        {
            BEST_GENOME = myPop[myPop.length - 1 - x];
        }
        myPop[myPop.length - 1 - x].fitness = 0.0;
        new_pop.push(myPop[myPop.length - 1 - x]);  
    }
    return new_pop;
}

function initialize_sample(ctx)
{
    SAMPLE_RGBA = [];
    ctx.drawImage(SAMPLE_IMAGE, 0 ,0, CANVAS_WIDTH, CANVAS_HEIGHT);
    SAMPLE_RGBA_FLAT = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    var index = 0;
    for(var i = 0; i < CANVAS_WIDTH; i++)
    {
        var line = [];
        for (var j = 0; j < CANVAS_HEIGHT; j++)
        {
            line.push([SAMPLE_RGBA_FLAT.data[index], SAMPLE_RGBA_FLAT.data[index + 1], SAMPLE_RGBA_FLAT.data[index + 2], SAMPLE_RGBA_FLAT.data[index + 3]]);
            index += 4;
        }
        SAMPLE_RGBA.push(line);
    }

}
        


//-------------- Listeners -----------------------------//
window.addEventListener('load', function() {
    document.querySelector('input[type="file"]').addEventListener('change', function() {
        if (this.files && this.files[0]) {
            SAMPLE_IMAGE = document.querySelector('img');  // $('img')[0]
            SAMPLE_IMAGE.src = URL.createObjectURL(this.files[0]); // set src to blob url
            SAMPLE_IMAGE.onload = imageIsLoaded;
        }
    });
  });
  
  function imageIsLoaded() { 
    alert(this.src);  // blob url
        CANVAS_HEIGHT = SAMPLE_IMAGE.height;
        CANVAS_WIDTH = SAMPLE_IMAGE.width;

        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;

        IMAGE_SELECTED_FLAG = true;

  }

//-------------- Action Loop that drives the application ------------------//
function action_loop()
{
   if(IMAGE_SELECTED_FLAG == true)
   {
    if (SAMPLE_INITIALIZED_FLAG == false)
    {
        SAMPLE_INITIALIZED_FLAG = true;
        var ctx = canvas.getContext("2d");
        initialize_sample(ctx);
    }
    console.log("gen: " + counter.toString(10));
   
    //render board
    render_canvas();
 
    //console.log("render done");
    
    old_best = BEST_FITNESS
 
    //initialize rgba field
    for(var i = 0; i < CANVAS_WIDTH; i++)
     {
         for (var j = 0; j < CANVAS_HEIGHT; j++)
         {
             rgba_field[i][j] = [255, 255, 255, 1];
         }
     }
 
     
    //evaluate genomes
    for (var p = 0; p < POPULATION.length; p++)
    { 
 
        //fill out rgba field and measure impact of each genome
        var index = 0;
        var center = [0, 0];
        
         center = [POPULATION[p].chromosome[3]*CANVAS_WIDTH, POPULATION[p].chromosome[4]*CANVAS_HEIGHT];
 
         x_min = Math.round(center[0] - POINT_RADIUS);
         x_max = Math.round(center[0] + POINT_RADIUS);
 
         y_min = Math.round(center[1] - POINT_RADIUS);
         y_max = Math.round(center[1] + POINT_RADIUS);
 
         var old_difference = MSE_partial(rgba_field, SAMPLE_RGBA, x_min, x_max, y_min, y_max);
 
         index = [center[0] - POINT_RADIUS, center[1] - POINT_RADIUS];
         for(var j = 0; j < 2*POINT_RADIUS; j++)
         {
             index[1] = center[1] - POINT_RADIUS;
             for (var k = 0; k < 2*POINT_RADIUS; k++)
             {
                 if (Math.round(index[0]) >= 0 && Math.round(index[0]) < CANVAS_WIDTH && Math.round(index[1]) >= 0 && Math.round(index[1]) < CANVAS_HEIGHT
                     && Math.sqrt( (index[0] - center[0])**2 + (index[1] - center[1])**2 ) < POINT_RADIUS)
                 {
                     rgba_field[Math.round(index[0])][Math.round(index[1])] = pixel_overlay([POPULATION[p].chromosome[0], POPULATION[p].chromosome[1], POPULATION[p].chromosome[2], POPULATION[p].chromosome[5]], rgba_field[Math.round(index[0])][Math.round(index[1])]);
                 }
                 index[1] += 1;
             }
             index[0] += 1;
         }
 
        var new_difference = MSE_partial(rgba_field, SAMPLE_RGBA, x_min, x_max, y_min, y_max);
        POPULATION[p].fitness = (new_difference - old_difference) * -1;
        //console.log(POPULATION[p].fitness);
    }
 
    //console.log("evaluation done");
 
    //create next generation
    POPULATION = next_generation(POPULATION);
 
    //console.log("GA done");
 
    //console.log("Best fitness: " + BEST_FITNESS.toString());
   
    counter += 1;
   //do it again
   }
   
  window.requestAnimationFrame(action_loop);
}

//-------------- Main Initialization ------------------//
myDrawArea.start();

initialize_population("point",  12000);

//initialize rgba field
rgba_field = [];
for(var i = 0; i < CANVAS_WIDTH; i++)
{
    var line = [];
    for (var j = 0; j < CANVAS_HEIGHT; j++)
    {
        line.push([255, 255, 255, 1])
    }
    rgba_field.push(line);
} 
old_best = 0.0;
render_canvas();
counter = 0;
window.requestAnimationFrame(action_loop);  //launches action- and rendering-loop
//-------------- ------------------//