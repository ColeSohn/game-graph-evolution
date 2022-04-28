/**
 * @file evolution.js
 * @author Cole Sohn
 * @description Contains classes and functions for evolving a Population class, which contains a set of Agents.
 * Each agent, which represents a set of parameters for drawing a graph, is assigned a fitness value.
 * The top x agents with the highest fitness values become part of the mating pool, where there parameters influnce
 * the next generation of the population.
 */

/**
 * @description A single sample from in a Population
 * In evolutionary terms: a single organism.
 */
 class Agent {
  constructor(chromosome = [], fitness = 0) {
    this.chromosome = chromosome;
    this.fitness = fitness;
    this.color = [255, 255, 255];
  }

  /**
   * @description Initializes a generation 0 agent's local vars
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
    this.chromosome[2] = floor(this.chromosome[2]); //Number additional BA nodes
  }
}

/**
 * @description Contains a generation, which is a list of Agent objects.
 * Updates generation using Agents from the previous.
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
   * @description Reduces generation to a mating pool (subset of the current
   * generation) based on fitness value,
   */
  cull_mating_pool() {
    this.generation.sort((a, b) => b.f - a.f);
    this.generation = this.generation.slice(
      0,
      this.generation.length * this.survive_ratio
    );
  }

  /**
   * @description Selects random parents from the mating pool and appends resulting
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
   * @description Creates a child Agent object from two parent objects based on their
   * chromosomes.
   */
  mate(p1, p2) {
    let genes = [];

    for (let i = 0; i < p1.chromosome.length; i++) {
      let r = random();

      if (r < 0.5) {
        genes[i] = p1.chromosome[i];
      } else {
        genes[i] = p2.chromosome[i];
      }
    }

    let fitness = p1.fitness + p2.fitness;

    let child = new Agent(genes, fitness);

    let parent_colors = [p1.color, p2.color];

    child.color = random(parent_colors);
    let mut_amt = this.mutation_amt;
    if (random() < this.mutant_prob) {
      let g = floor(random(0, genes.length)); //Mutant Gene
      let gene_val = map(
        genes[g],
        this.gene_ranges[g][0],
        this.gene_ranges[g][1],
        0,
        1
      );

      if (random() > 0.5) {
        mut_amt *= -1;
      }

      gene_val = constrain(gene_val + mut_amt, 0, 1);
      genes[g] = map(
        gene_val,
        0,
        1,
        this.gene_ranges[g][0],
        this.gene_ranges[g][1]
      );

      child.color = random(node_cols);
      child.chromosome = genes;
    }
    return child;
  }
}
