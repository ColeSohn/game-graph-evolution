/**
 * @file graph.js
 * @author Cole Sohn
 * @description Contains classes and functions for drawing force directed graphs.
 * Random Geometric Graph (RGG) is a graph initialized with random node positions and 
 * edges based on distance.
 * Barabasi Albert Graphs are graphs were nodes are more likely to be added to popular 
 * nodes with many connections. Here this extends an RGG. 
 */

/**
 * @description A Node is a point in space connected to "neighbor" nodes by edges.
 */
 class Node{
  constructor(x, y, id){
    this.x = x;
    this.y = y;
    this.id = id;
    this.neighbors = [];
  }
  
  /**
  * @description Nodes are drawn to the canvas as circles
  */
  display(c=[180, 180, 180], r=(radius-1), x_off=0, y_off=0){
    stroke(200);
    strokeWeight(stroke_weight);
    fill(c);
    ellipse(this.x+x_off, this.y+y_off, r*2)
  }
  
  /**
  * @param  {Node}  other Another Node
  * @returns {Array}  A vector from current node to another
  */
  vector_to(other){
    let v1 = createVector(this.x, this.y);
    let v2 = createVector(other.x, other.y);
    return (v2.sub(v1));
  }
}
  
/**
 * @description An Edge is an object that connects two nodes
 */
class Edge{
  constructor(nodeA, nodeB){
    this.nodeA = nodeA;
    this.nodeB = nodeB;
  }
  
    
  /**
   * @description An Edge can be displayed to the canvas as a line
  */
  display(x_off=0, y_off=0){
    stroke(200);
    strokeWeight(stroke_weight);
    line(this.nodeA.x+x_off, this.nodeA.y+y_off, this.nodeB.x+x_off, this.nodeB.y+y_off);
  }
}

/**
 * @description An object contaning nodes and edges
 */
class Graph{
  constructor(nodes=[], edges=[], w=gal_size/gal_cols, h=gal_size/gal_rows){
    this.nodes = nodes;
    this.edges = edges;
    
    this.w = w-radius*2;
    this.h = h-radius*2;  
  }
  
  /**
  * @description Calls display function for all nodes and edges
  */
  display(c=[180, 180, 180], x_off=0, y_off=0){
    for(let j of this.edges){
      j.display(x_off, y_off);
    }
    
    for(let i of this.nodes){
      i.display(c, radius-stroke_weight, x_off, y_off);
    } 
  }
  
  /**
  * @description Returns nodes one connection away
  */
  get_neighbors(node){
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
  
  /**
  * @description Returns degree of node (number of connections)
  */
  get_degree(node){
    return this.get_neighbors(node).length;
  }
  
  /**
  * @description Returns all nodes in the graph that are not one connection away
  */
  get_non_neighbors(node){
    let neighbors = this.get_neighbors(node);
    
    let non_neighbors = [];
    for(let i of this.nodes){
      if(i!= node && neighbors.includes(i) == false){
        append(non_neighbors, i);
      }
    }
    
    return non_neighbors;
  }

  /**
  * @description Updates forces on each node of the graph and calls function to update positions
  */
  relax(c1, c2, c3, c4){
    let forces = [];
    
    c2 = map(c2, 0, 1, 0, 10);
    
    for(const [i, n] of this.nodes.entries()){
      let force = createVector(0, 0);

      //Calculate Spring Forces
      for(let i of this.get_neighbors(n)){
        let d = dist(n.x, n.y, i.x, i.y);
        d = map(d, 0, this.w, 0, 10);

        let neighforce = n.vector_to(i).normalize();
        neighforce.mult(c1*log(d/c2));
        force.add(neighforce);
      }

      //Calculate Repulsive forces
      let non_neighbors = this.get_non_neighbors(n);
      for(let j of non_neighbors){
        let currforce = j.vector_to(n).normalize();  
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
    this.update_node_pos(forces, c4);
  }
  
  /**
  * @description Updates node positions due to forces
  */
  update_node_pos(forces, c4){
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

/**
* @description Random Geometric Graph (RGG) is a graph initialized with random node positions and 
* edges based on distance.
*/
class RGG extends Graph{
   constructor(w, h, n, thresh){
     super();
     
     this.w = w-(radius*2)
     this.h = h-(radius*2)
     
     this.nodes = this.rand_nodes(n, this.w, this.h);
     this.edges = this.distance_edges(this.nodes, thresh);
   }
  
  
  /**
  * @description Draw Nodes on canvas randomly (Used for Random Geometric Graphs) 
  */
  rand_nodes(n, w=0, h=0){
    let nodes = [];
    for(let i = 0; i<n; i++){
      let n = new Node(random()*w, random()*h, i);
      append(nodes, n);
    }
    return nodes;
  }

  /**
  * @description Check if edge exists in unfinalized list to avoid duplicates
  */
  contains_edge(edges, n1, n2){
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
  
  /**
  * @description Draw Edges based on Euclidean Distance (Used for Random Geometric Graphs) 
  */
  distance_edges(nodes, thresh){
    let edges = [];
    for(let [idx_i, i] of nodes.entries()){
      for(let [idx_j, j] of nodes.entries()){
        let thre = map(thresh, 0, 1, 0, this.w);
        if(idx_i != idx_j && dist(i.x, i.y, j.x, j.y)<thre){
          let e = new Edge(i, j);
          if(this.contains_edge(edges, i, j) == false){
            append(edges, e);
          }

        }
      }
    }
    return edges;
  }
 }

/**
* @description Barabasi Albert Graphs are graphs were nodes are more likely to be added to popular 
* nodes with many connections. Here this extends an RGG. 
*/
class BarAlbert extends RGG{
  constructor(w, h, rgg_n, rgg_thresh, ba_n, a){
    super();
        
    this.w = w-(radius*2); //canvas x
    this.h = h-(radius*2); //canvas y
    
    this.rgg_n = rgg_n; //Number initial rgg nodes
    this.ba_n = ba_n; //Number of additional BA model nodes

    this.a = a; //Preferential attatchement parameter
    
    this.nodes = this.rand_nodes(rgg_n, this.w, this.h);
    this.edges = this.distance_edges(this.nodes, rgg_thresh);
    
    this.degrees= [];
    this.add_nodes_by_preference(ba_n);
  }
  
  /**
  * @description Probability of connection based on degrees
  */
  get_probs(){
    let degrees = this.degrees;
    
    let probs = [];
    for(let d of degrees){
      
      if(d==0){
        d=1;
      }
      
      let curr_prob = pow(d, this.a);
      append(probs, curr_prob);
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
  
  /**
  * @description Adds additional BA nodes to the graph
  */
  add_nodes_by_preference(num_nodes){
    for(let [idx, n] of this.nodes.entries()){
      this.degrees[idx] = this.get_degree(n);
    }
    
    let probs = this.get_probs();

    for(let n=0; n<num_nodes; n++){
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
          
          probs = this.get_probs();
          break;
        }
      }
      
      let e = new Edge(nodeA, nodeB);
      append(this.nodes, nodeA);
      append(this.edges, e); 
    } 
  }
}