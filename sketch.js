//Design Gallery Setup
let radius = 6.5;
let gal_size = 600;
let gal_rows = 3;
let gal_cols = gal_rows;
let gal_num = 4;

let tile_size = gal_size/gal_cols;
let tile_range = tile_size-(2*radius);

//File IO
let export_precision = 9;


//Aesthetics
let stroke_weight = 1;

//Colors
let node_cols = [[174, 129, 255], [166, 226, 46], [249, 38, 114], 
                 [102, 217, 239], [253, 151, 31]];

//UI
let footer_height = 30;
let header_height = footer_height;
let button_w = gal_size/gal_cols;
let button_h = footer_height;

//Global Variables
let pop;
let visible_gallery;
let gallery_enter = 0;
let relaxing = false;


function setup() {
  createCanvas(gal_size, gal_size+footer_height*2);
  background(50);
  frameRate(60);
  
  noStroke();
  fill(bg_1);
  rect(0, height-footer_height, width, height);
  
  pop = new Population();
    
  drawButton(bg_2);
  
  //Disable context menu on right click
  for (let element of document.getElementsByClassName("p5Canvas")) {
    element.addEventListener("contextmenu", (e) => e.preventDefault());
  }
}

function museumNext(){
  if(hooverButton()){
    pop.museum.nextGallery();
  }
}

function mousePressed(){
  if(!relaxing){
    visible_gallery.clicked();
    museumNext();
    }
}

function drawButton(c = bg_2){
    noStroke();
    fill(c);
    rect(width/2-button_w/2, height-footer_height/2-button_h/2, button_w, button_h);
    
    fill(txt_1);
    textAlign(CENTER, CENTER);
    text("Continue →", width/2-button_w/2, height-footer_height/2-button_h/2, button_w, button_h);
}

function hooverButton(){
  if(height-footer_height < mouseY && mouseY<height){
    if(width/2-button_w/2<mouseX && mouseX<width/2+button_w/2){
    return true;
    }
  }
  return false;
}

//draw function called every frame
function draw() {
  //relax graphs
  if(frameCount<gallery_enter+100){
      relaxing = true;
      visible_gallery.relaxAgents();
  }
  else{
    relaxing = false;
  }
  
  //handle "contine" button
  if(hooverButton() && !mouseIsPressed){
    drawButton(bg_3);
  }
  else{
    drawButton(bg_2);
  }
}