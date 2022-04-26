//Object with a position in space
class Node{
    constructor(x, y, id){
      this.x = x;
      this.y = y;
      this.id = id;
      this.neighbors = [];
    }
    
    display(c=[180, 180, 180], r=(radius-1), x_off=0, y_off=0){
      stroke(200);
      strokeWeight(stroke_weight);
      //noStroke();
      fill(c);
      
      ellipse(this.x+x_off, this.y+y_off, r*2)
    }
    
    vectorTo(other){
      let v1 = createVector(this.x, this.y);
      let v2 = createVector(other.x, other.y);
      return (v2.sub(v1));
    }
  }
    
  //Object that can connect two nodes
  class Edge{
    constructor(nodeA, nodeB){
      this.nodeA = nodeA;
      this.nodeB = nodeB;
    }
    
    display(x_off=0, y_off=0){
      stroke(200);
      strokeWeight(stroke_weight);
      line(this.nodeA.x+x_off, this.nodeA.y+y_off, this.nodeB.x+x_off, this.nodeB.y+y_off);
    }
  }
  
  //Object containing a list of nodes and edges 
  class Graph{
    constructor(nodes=[], edges=[], w=gal_size/gal_cols, h=gal_size/gal_rows){
      this.nodes = nodes;
      this.edges = edges;
      
      this.w = w-radius*2;
      this.h = h-radius*2;  
    }
    
    display(c=[180, 180, 180], x_off=0, y_off=0){
      for(let j of this.edges){
        j.display(x_off, y_off);
      }
      
      for(let i of this.nodes){
        i.display(c, radius-stroke_weight, x_off, y_off);
      } 
    }
    
    //Returns nodes one degree away
    getNeighbors(node){
      let neighbors = [];
      
      for(let i of this.edges){
         if(node == i.nodeA){
          append(neighbors, i.nodeB);
        }
        else if(node == i.nodeB){
          append(neighbors, i.nodeA);  
        }
      }
      
      let n = [];
      for(let i of neighbors){
        append(n, i.id);
      }
      node.neighbors = n;
      
      return neighbors;
    }
    
    getDegree(node){
      return this.getNeighbors(node).length;
    }
    
    //Returns all nodes not one degree away
    getNonNeighbors(node){
      let neighbors = this.getNeighbors(node);
      
      let non_neighbors = [];
      for(let i of this.nodes){
        if(i!= node && neighbors.includes(i) == false){
          append(non_neighbors, i);
        }
      }
      
      return non_neighbors;
    }
  
    relax(c1, c2, c3, c4){
      let forces = [];
      
      //print("    ",c2);
      c2 = map(c2, 0, 1, 0, 10);
      
      for(const [i, n] of this.nodes.entries()){
        let force = createVector(0, 0);
  
        //Calculate Spring Forces
        for(let i of this.getNeighbors(n)){
          let d = dist(n.x, n.y, i.x, i.y);
          d = map(d, 0, this.w, 0, 10);
  
          let neighforce = n.vectorTo(i).normalize();
          neighforce.mult(c1*log(d/c2));
          force.add(neighforce);
        }
  
        //Calculate Repulsive forces
        let nonNeighbors = this.getNonNeighbors(n);
        for(let j of nonNeighbors){
          let currforce = j.vectorTo(n).normalize();  
          let d = dist(n.x, n.y, j.x, j.y);
          d = map(d, 0, this.w, 0, 10);
          if(d == 0){
            d = 0.000001;
          }
          
          currforce.mult(c3/(d*d));
          force.add(currforce);
        }  
  
        forces[i] = force;   
      }
      this.updateNodePos(forces, c4);
    }
    
    updateNodePos(forces, c4){
      for(let o = 0; o<this.nodes.length; o++){
        
        let d_x = map(c4*forces[o].x, 0, 10, 0, this.w);
        let d_y = map(c4*forces[o].y, 0, 10, 0, this.h);
        
        this.nodes[o].x += d_x;
        this.nodes[o].y += d_y;
        
        //Keep in Bounds
        if(this.nodes[o].x<0){
          this.nodes[o].x=0;
        }
        if(this.nodes[o].y<0){
          this.nodes[o].y=0;
        }
  
        if(this.nodes[o].x>this.w){
          this.nodes[o].x = this.w;
        }
  
        if(this.nodes[o].y>this.h){
          this.nodes[o].y = this.h;
        }
      }
    }
  }
  
  class RGG extends Graph{
     constructor(w, h, n, thresh){
       super();
       
       this.w = w-(radius*2)
       this.h = h-(radius*2)
       
       this.nodes = this.randNodes(n, this.w, this.h);
       this.edges = this.distanceEdges(this.nodes, thresh);
     }
    
    
    //Draw Nodes on canvas randomly (Used for Random Geometric Graphs) 
    randNodes(n, w=0, h=0){
      let nodes = [];
      for(let i = 0; i<n; i++){
        let n = new Node(random()*w, random()*h, i);
        append(nodes, n);
      }
      return nodes;
    }
  
    //See if edge exists in unfinalized list to avoid duplicates
    containsEdge(edges, n1, n2){
      for(let i of edges){
        if(i.nodeA == n1 && i.nodeB == n2){
          return true;
        }
        else if(i.nodeB == n1 && i.nodeA == n2){
          return true;
        }
      }
      return false;
    }
    
    //Draw Edges based on Euclidean Distance (Used for Random Geometric Graphs) 
    distanceEdges(nodes, thresh){
      let edges = [];
      for(let [idx_i, i] of nodes.entries()){
        for(let [idx_j, j] of nodes.entries()){
          let thre = map(thresh, 0, 1, 0, this.w);
          if(idx_i != idx_j && dist(i.x, i.y, j.x, j.y)<thre){
            let e = new Edge(i, j);
            if(this.containsEdge(edges, i, j) == false){
              append(edges, e);
            }
  
          }
        }
      }
      return edges;
    }
   }
  
  class BarAlbert extends RGG{
    constructor(w, h, rgg_n, rgg_thresh, ba_n, a){
      super();
          
      this.w = w-(radius*2); //canvas x
      this.h = h-(radius*2); //canvas y
      
      this.rgg_n = rgg_n; //Number initial rgg nodes
      this.ba_n = ba_n; //Number of additional BA model nodes
  
      this.a = a; //Preferential attatchement parameter
      
      this.nodes = this.randNodes(rgg_n, this.w, this.h);
      this.edges = this.distanceEdges(this.nodes, rgg_thresh);
      
      this.degrees= [];
      this.addNodesByPreference(ba_n);
    }
    
    
    getProbs(){
      let degrees = this.degrees;
      
      let probs = [];
      for(let d of degrees){
        
        if(d==0){
          d=1;
        }
        
        let currProb = pow(d, this.a);
        append(probs, currProb);
      }
      
      let sum = 0;
      for(let i of probs){
        sum+=i;
      }
      
      for(let i= 0; i<probs.length; i++){
        probs[i]/=sum;
      }
      
      return probs;
    }
    
    //Calculare probability based on degree and alpha param
    addNodesByPreference(numNodes){
      for(let [idx, n] of this.nodes.entries()){
        this.degrees[idx] = this.getDegree(n);
      }
      
      let probs = this.getProbs();
  
      for(let n=0; n<numNodes; n++){
        let nodeA = new Node(random()*this.w, random()*this.h, this.rgg_n+n);
        let nodeB;
        
        //Find nodeB by prob
        let x = random();
        let s = 0;
        for(let [idx, p] of probs.entries()){
          s+=p;
          if(x<s){
            nodeB = this.nodes[idx];
            
            this.degrees[idx]+=1;
            append(this.degrees, 1);
            
            probs = this.getProbs();
            break;
          }
        }
        
        let e = new Edge(nodeA, nodeB);
        append(this.nodes, nodeA);
        append(this.edges, e); 
      } 
    }
  }