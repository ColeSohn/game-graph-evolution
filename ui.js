let bg_1 = [28, 28, 28];
let bg_2 = [16, 16, 16];
let bg_3 = [45, 45, 45];
let txt_1 = [253, 253, 253];

class Masterpiece{
  constructor(x, y, w, h){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    
    this.c = 0;
    this.ba;
    this.agent;
    
    this.status = 0;

  }
  
  display_bg(c){
    this.c = c;
    noStroke();
    fill(c);
    rect(this.x, this.y, this.w, this.h);
  }
  
  displayAgent(agent){
    this.agent = agent;
    let c = agent.c;
    this.ba = new BarAlbert(this.w, this.h, c[0], c[1], c[2], c[3]);
    this.ba.display(agent.color, this.x+radius, this.y+radius);
  }
  
  relaxAgent(agent){
    this.display_bg(this.c);
    let c = agent.c;
    this.ba.relax(c[4], c[5], c[6], c[7]);
    this.ba.display(agent.color, this.x+radius, this.y+radius);
  }
  
  clicked(){
    this.display_bg(this.c);
    this.ba.display(this.agent.color, this.x+radius, this.y+radius);
    if(this.status == 0){
      noStroke();
      fill([100, 180, 100, 100]);
      rect(this.x, this.y, this.w, this.h);
      this.status = 1;
    }
    else if(this.status == 1){
      noStroke();
      fill([180, 100, 100, 100]);
      rect(this.x, this.y, this.w, this.h);
      this.status = -1;
    }
    else{
      this.status = 0;
    }
  }
}

class Gallery{
  constructor(r=gal_rows, c=gal_cols, x = 0, y =30, w = 600/3, h = 600/3){
    this.r = r;
    this.c = c;
    
    this.m_pieces = [];
    this.agents = [];
    
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    
    let grid_w = w/r;
    let grid_h = h/c;

    for(let i = 0; i<r; i++){
      for(let j = 0; j<c; j++){
        let m_piece = new Masterpiece(x+j*grid_w, y+i*grid_h, grid_w, grid_h);
        append(this.m_pieces, m_piece);
      }
    }  
  }
  
  clicked(){
    if(this.y<mouseY && mouseY<(this.y+this.h) && this.x<mouseX && mouseX<(this.x+this.w)){
      let x = mouseX-this.x;
      let y = mouseY-this.y;

      let clickedX = floor((x/this.w)/(1/this.r));
      let clickedY = floor((y/this.h)/(1/this.c));
      
      let selected = this.c*clickedY+clickedX;
      
      if(mouseButton == LEFT){
       this.m_pieces[selected].clicked();
       
       this.agents[selected].d_f = this.m_pieces[selected].status;
      }
      else if(mouseButton == RIGHT){
        let m = this.m_pieces[selected];
        let j = this.setupSaveFile(m);
        saveJSON(j, "graph");
      }
    }
  }
  
  setupSaveFile(m){
    let json = {};
    json.params = m.agent.c;
    
    let nodes = m.ba.nodes;
    
    for(let n of nodes){
      n.x = map(n.x, 0, m.ba.w, 0, 1);
      n.y = map(n.y, 0, m.ba.h, 0, 1);
    }
    json.nodes = nodes;
    
    
    
//     let edges_array = m.ba.edges;
//     let edges = [];
    
//     for(let e of edges_array){
//       let edge = {};
//       edge.nodeA =  e.nodeA.id;
//       edge.nodeB =  e.nodeB.id;
//       append(edges, edge);
//     }
    
    
    //json.edges = edges;
    return json; 
  }
  
  displayBg(){
    let odd = (this.c%2 == 1);
    
    //Background Checkers
    if(odd){
      for(let [idx, m] of this.m_pieces.entries()){
        let col = bg_1;
        if(idx % 2 == 0){
          col = bg_2;
        }
        m.display_bg(col);
      }  
    }
    else{
      let p = 0;

      for(let [idx, m] of this.m_pieces.entries()){
        if(idx%this.c == 0){
          p-=1;
        }
        
        let col = bg_1;
        if(p%2 ==0){
          col = bg_2;
        }
        m.display_bg(col);
        p++
      }  
    }
  }
  
  fill(curr_agents){
    console.assert(curr_agents.length == this.r*this.c);
    //print(curr_agents.length);
    for(let [i, agent] of curr_agents.entries()){
      this.agents[i] = agent;
    }
  }
  
  displayAgents(){
    for(let i = 0; i<this.m_pieces.length; i++){
      this.m_pieces[i].displayAgent(this.agents[i]);
    }
  }
  
  relaxAgents(){
    for(let i = 0; i<this.m_pieces.length; i++){
      this.m_pieces[i].relaxAgent(this.agents[i]);
    }
  }
}


class Museum{
  constructor(generation, gen_num = 0){
    
    this.agents = generation;
    this.drawHeader(" Graph Evolution", gen_num);
    //this.drawFooter();

    this.curr_gal = 0;
    this.galleries = this.createGalleries();
    
    gallery_enter = frameCount;
    visible_gallery = this.galleries[0];
    this.galleries[0].displayBg();
    this.galleries[0].displayAgents();
  }
  
    
  createGalleries(){
    let tot_agents = this.agents.length;
    let agents_per_gal = gal_rows*gal_cols;
    let tot_gals = tot_agents/agents_per_gal;
    let gals = [];

    for(let i = 0; i<tot_gals; i++){
      let curr_agents = this.agents.slice(i*agents_per_gal, (i+1)*agents_per_gal);
      gals[i] = new Gallery(gal_rows, gal_cols, 0, header_height, width, 600); 
      gals[i].fill(curr_agents);
    }
    return gals;
  }
  
  nextGallery(){
    
    // let statuses = []
    // for(let m of visible_gallery.m_pieces){
    //   append(statuses, m.status);
    // }
    //print(statuses);
    
    
    for(let m of visible_gallery.m_pieces){
       m.agent.f+=m.status;
    }
    
    
    
    this.curr_gal+=1;
    
    if(this.curr_gal < this.galleries.length){
      gallery_enter = frameCount;
      visible_gallery = this.galleries[this.curr_gal];
      visible_gallery.displayBg();
      visible_gallery.displayAgents();
    }
    else{
      pop.nextGen();
    }
  }

  
  drawHeader(app_info, gen_num){
    //Rectangle
    noStroke();
    fill(bg_1);
    rect(0, 0, width, header_height);
    
    //Text
    textFont("consolas");
    fill(txt_1);
    textAlign(LEFT, CENTER);
    text(app_info, 0, 0, width,header_height);
    
    textAlign(RIGHT, CENTER);
    let gen_text = "Generation: "+ gen_num.toString()+" ";
    text(gen_text, 0, 0, width,header_height);
  }
}