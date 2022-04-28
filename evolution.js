/**
 * @file evolution.js
 * @author Cole Sohn
 * @description Contains classes and functions for evolving a Population class, which contains a set of Agents.
 * Each agent, which represents a set of parameters for drawing a graph, is assigned a fitness value.
 * The top x agents with the highest fitness values become part of the mating pool, where their parameters influence
 * the next generation of the population.
 */

/**
 * @description A single sample from a Population
 * In evolutionary terms: a single organism.
 */
 class Agent {
  constructor(chromosome = [], fitness = 0) {
    this.chromosome = chromosome;
    this.fitness = fitness;
    this.color = [255, 255, 255];
  }

  /**
   * @description Initialize a generation 0 agent's local vars
   * @param  {Array 2D (Size Nx2)}  gene_ranges An array of bounds on gene values
   */
  init_starting_agent(gene_ranges) {
    this.fitness = 0;
    this.color = random(node_cols);

    this.chromosome = [];
    for (let [i, p] of gene_ranges.entries()) {
      this.chromosome[i] = random(p[0], p[1]);
    }

    this.chromosome[0] = floor(this.chromosome[0]); //Number of initial nodes
    this.chromosome[2] = floor(this.chromosome[2]); //Number of additional BA nodes
  }
}

/**
 * @description Contains a generation, which is a list of Agent objects.
 * Updates generation using Agents from the previous generation.
 */
class Population {
  constructor(
    population_count,
    gene_ranges,
    survive_ratio = 0.3,
    mutant_prob = 0.111,
    mutation_amt = 0.2
  ) {
    this.population_count = population_count;
    this.survive_ratio = survive_ratio;
    this.gene_ranges = gene_ranges;
    this.mutant_prob = mutant_prob;
    this.mutation_amt = mutation_amt;

    this.gen_num = 0;
    this.generation = [];
    this.generation_next = [];

    this.init_gen_0(this.population_count);
    this.museum = new Museum(this.generation, this.gen_num);
  }

  /**
   * @description Initializes generation 0 agents
   */
  init_gen_0() {
    for (let n = 0; n < this.population_count; n++) {
      let a = new Agent();
      a.init_starting_agent(this.gene_ranges);
      this.generation[n] = a;
    }
  }

  /**
   * @description Updates generation.
   * Produces the next list of agents from the current.
   */
  next_gen() {
    this.cull_mating_pool(); //remove unfit agents
    this.select_and_mate_parents(); //produce next generation
    this.gen_num++;

    this.museum = new Museum(this.generation, this.gen_num); //Update UI
  }

  /**
   * @description Reduce generation to a mating pool (subset of the current
   * generation) based on fitness value.
   */
  cull_mating_pool() {
    this.generation.sort((a, b) => b.f - a.f);
    this.generation = this.generation.slice(
      0,
      this.generation.length * this.survive_ratio
    );
  }

  /**
   * @description Select random parents from the mating pool and appends resulting
   * child to mating pool.
   */
  select_and_mate_parents() {
    let new_gen = [];

    while (new_gen.length < this.population_count) {
      let p1 = random(this.generation);
      let p2 = random(this.generation);

      while (p2 == p1) {
        p2 = random(this.generation);
      }

      let child = this.mate(p1, p2);

      append(new_gen, child);
    }

    this.generation = new_gen;
  }

  /**
   * @description Create a child Agent object from two parent objects based on their
   * chromosomes. Randomly choose chromosomes from either parent for the child Agent,
   * with some mutation probability (extra noise)
   * @param {Agent} parent_1 An Agent from the current generation's mating pool
   * @param {Agent} parent_2 Another Agent from the current generation's mating pool
   * @returns {Agent} child A new Agent whose genes are a combination of parent_1 and parent_2 
   * with probability of additional mutation.
   */
  mate(parent_1, parent_2) {
    //Step 1: Create child Agent from input parent Agents.  
    //For each chromosome, choose randomly from either parent
    let genes = [];
    for (let i = 0; i < parent_1.chromosome.length; i++) {
      if (random() < 0.5) {
        genes[i] = parent_1.chromosome[i];
      } else {
        genes[i] = parent_2.chromosome[i];
      }
    }

    //Create new child Agent object with genes, fitnesses, and color inherited from parents
    let fitness = parent_1.fitness + parent_2.fitness;
    let child = new Agent(genes, fitness);
    child.color = random([parent_1.color, parent_2.color]);

    //Chance of a random tweak to gene output
    this.mutate(child)
    
    return child;
  }

  /**
   * @description Mutations: With a probability of this.mutant_prob, a random gene from the child is tweaked
   */
  mutate(child){
    let genes = child.chromosome
    let mut_amt = this.mutation_amt;
    if (random() < this.mutant_prob) {
      let gene_index = floor(random(0, genes.length)); //Mutant Gene
      //Remap from gene space to [0, 1]
      let gene_val = map(
        genes[gene_index],
        this.gene_ranges[gene_index][0],
        this.gene_ranges[gene_index][1],
        0,
        1
      );
      
      //Mutation can be (+) or (-)
      if (random() > 0.5) {
        mut_amt *= -1;
      }

      // Apply mutation and clamp values between 0 and 1
      gene_val = constrain(gene_val + mut_amt, 0, 1);

      //Remap back to gene space
      genes[gene_index] = map(
        gene_val,
        0,
        1,
        this.gene_ranges[gene_index][0],
        this.gene_ranges[gene_index][1]
      );

      child.color = random(node_cols); //Assign new random color if a mutant
      child.chromosome = genes; //Assign new chromosome
    }
  }
}
