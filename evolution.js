let p_range = //Node Spawning
              [[1, 10], //Number RGG Nodes
               [0, 1], //Distance threshold for RGG Edges
               [0, 8], //Number BA Nodes
               [0, 2], //BA attractedness
               
               //Forces
               [0, 2], //Spring Force
               [0.1, 0.8], //Spring Length
               [0.1, 1], //Non-Adjacent Repulsion
               [0, 0.2]]; //Position Step Size from forces


let mutant_prob = 1/9;
let mutation_amt = 0.2;

//Ratios closer to 1 kill off more pop each gen
let cull_ratio = 0.7;

class Agent{
  constructor(chromosome=[], fitness=0){
    this.c = chromosome;
    this.f = fitness;
    this.d_f = 0;
    this.color = [255, 255, 255];
  }
  
  initStartingAgent(){
    
    this.c = [];
    for(let [i,p] of p_range.entries()){
      this.c[i] = random(p[0], p[1]);
    }
    
    this.c[0] = floor(this.c[0]);
    this.c[2] = floor(this.c[2]);
    
    this.f = 0;
    this.color = random(node_cols);
  }
}

class Population{
  constructor(){
    
    //Size of each generation
    this.pop_num = gal_rows*gal_cols*gal_num;
    //Percent that survive each generation
    this.cull_ratio = cull_ratio;
    
    this.gen_num = 0;
    this.generation = [];
    this.generation_next = [];
    
    this.initGen0(this.pop_num);
    this.museum = new Museum(this.generation,this.gen_num);
  }
  
  initGen0(num){
    for(let n = 0; n<num; n++){
      let a = new Agent();
      a.initStartingAgent();
      this.generation[n]=a;
    }
  }
  
  
  nextGen(){
    //Kill unfit
    this.cullMatingPool();
    
    
    //Debug display info about each gen
    let info = [];
    for(let agent of this.generation){
       append(info, agent.f);
    }
    //print(info);
    
    //Mate Parents
    this.selectandMateParents();
    
    //Update Gen Number
    this.gen_num++;
    
    //Update UI
    this.museum = new Museum(this.generation,this.gen_num);
  }
  
  cullMatingPool(){
    this.generation.sort((a, b) => b.f-a.f);
    this.generation = this.generation.slice(0, this.generation.length*(1-this.cull_ratio));
  }
  
  selectandMateParents(){
    let new_gen = [];
    
    while(new_gen.length < this.pop_num){
    //Freeforall Parent selection
      let p1 = random(this.generation);
      let p2 = random(this.generation);
    
      while(p2 == p1){
        p2 = random(this.generation);
      }
      
      let child = this.mate(p1, p2);
      
      //Mutate Child Here
      
      append(new_gen, child);
    }
    
    this.generation = new_gen;
  }
  
  mate(p1, p2){
    let genes = [];
    
    for(let i = 0; i<p1.c.length; i++){
      let r = random();
      
      if(r<0.5){
        genes[i] = p1.c[i];  
      }
      else{
        genes[i] = p2.c[i];  
      }
    }
    
    let fitness = p1.f+p2.f;
    
    let baby = new Agent(genes, fitness);
    
    let parent_colors = [p1.color, p2.color];
    
    baby.color = random(parent_colors);
    let mut_amt = mutation_amt;
    if(random()<mutant_prob){
      let g = floor(random(0, genes.length)); //Mutant Gene
      let gene_val = map(genes[g], p_range[g][0], p_range[g][1], 0, 1);
      
      if(random()>0.5){ mut_amt*=-1;}
      
      gene_val = constrain(gene_val+mut_amt, 0, 1);
      genes[g]=map(gene_val, 0, 1, p_range[g][0], p_range[g][1]);
      
      baby.color = random(node_cols);
      baby.c = genes;
    }
    return baby;
  }
}