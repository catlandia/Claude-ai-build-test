/**
 * Genetic Algorithm for Evolving Neural Networks
 * Handles selection, crossover, and mutation of car populations
 */

class GeneticAlgorithm {
    constructor(options = {}) {
        this.populationSize = options.populationSize || 50;
        this.mutationRate = options.mutationRate || 0.1;
        this.elitismCount = options.elitismCount || 5; // Top performers that pass unchanged
        this.crossoverRate = options.crossoverRate || 0.7;

        this.generation = 1;
        this.bestFitness = 0;
        this.bestBrain = null;
        this.averageFitness = 0;
        this.fitnessHistory = [];
    }

    /**
     * Create initial population of cars
     */
    createPopulation(startX, startY, startAngle) {
        const population = [];

        for (let i = 0; i < this.populationSize; i++) {
            // If we have a best brain from previous generation, use it for some
            if (this.bestBrain && i < this.elitismCount) {
                const brain = this.bestBrain.clone();
                if (i > 0) {
                    // Mutate all except the very best
                    brain.mutate(this.mutationRate);
                }
                population.push(new Car(startX, startY, startAngle, brain));
            } else {
                population.push(new Car(startX, startY, startAngle));
            }
        }

        return population;
    }

    /**
     * Evolve population to create next generation
     */
    evolve(population) {
        // Sort by fitness (descending)
        population.sort((a, b) => b.fitness - a.fitness);

        // Record statistics
        this.bestFitness = population[0].fitness;
        this.bestBrain = population[0].brain.clone();
        this.averageFitness = population.reduce((sum, car) => sum + car.fitness, 0) / population.length;
        this.fitnessHistory.push({
            generation: this.generation,
            best: this.bestFitness,
            average: this.averageFitness
        });

        // Create new population
        const newPopulation = [];

        // Elitism: Keep top performers unchanged
        for (let i = 0; i < this.elitismCount; i++) {
            const elite = new Car(
                population[0].x,
                population[0].y,
                population[0].angle,
                population[i].brain.clone()
            );
            newPopulation.push(elite);
        }

        // Fill rest with offspring
        while (newPopulation.length < this.populationSize) {
            // Tournament selection for parents
            const parent1 = this.tournamentSelect(population);
            const parent2 = this.tournamentSelect(population);

            let childBrain;

            // Crossover
            if (Math.random() < this.crossoverRate) {
                childBrain = parent1.brain.crossover(parent2.brain);
            } else {
                // Clone better parent
                childBrain = parent1.fitness > parent2.fitness ?
                    parent1.brain.clone() : parent2.brain.clone();
            }

            // Mutation
            childBrain.mutate(this.mutationRate);

            const child = new Car(
                population[0].x,
                population[0].y,
                population[0].angle,
                childBrain
            );

            newPopulation.push(child);
        }

        this.generation++;
        return newPopulation;
    }

    /**
     * Tournament selection - select best from random subset
     */
    tournamentSelect(population, tournamentSize = 5) {
        const tournament = [];

        for (let i = 0; i < tournamentSize; i++) {
            const randomIndex = Math.floor(Math.random() * population.length);
            tournament.push(population[randomIndex]);
        }

        // Return the fittest from tournament
        tournament.sort((a, b) => b.fitness - a.fitness);
        return tournament[0];
    }

    /**
     * Roulette wheel selection (fitness-proportionate)
     */
    rouletteSelect(population) {
        const totalFitness = population.reduce((sum, car) => sum + car.fitness, 0);

        if (totalFitness === 0) {
            return population[Math.floor(Math.random() * population.length)];
        }

        let random = Math.random() * totalFitness;
        let cumulative = 0;

        for (const car of population) {
            cumulative += car.fitness;
            if (cumulative >= random) {
                return car;
            }
        }

        return population[population.length - 1];
    }

    /**
     * Reset for new simulation
     */
    reset() {
        this.generation = 1;
        this.bestFitness = 0;
        this.bestBrain = null;
        this.averageFitness = 0;
        this.fitnessHistory = [];
    }

    /**
     * Save best brain to localStorage
     */
    saveBestBrain() {
        if (this.bestBrain) {
            localStorage.setItem('bestCarBrain', JSON.stringify(this.bestBrain.toJSON()));
            localStorage.setItem('bestCarGeneration', this.generation.toString());
            console.log('Best brain saved to localStorage');
        }
    }

    /**
     * Load best brain from localStorage
     */
    loadBestBrain() {
        const saved = localStorage.getItem('bestCarBrain');
        if (saved) {
            this.bestBrain = NeuralNetwork.fromJSON(JSON.parse(saved));
            const gen = localStorage.getItem('bestCarGeneration');
            if (gen) {
                this.generation = parseInt(gen, 10);
            }
            console.log('Best brain loaded from localStorage');
            return true;
        }
        return false;
    }

    /**
     * Clear saved brain
     */
    clearSavedBrain() {
        localStorage.removeItem('bestCarBrain');
        localStorage.removeItem('bestCarGeneration');
        console.log('Saved brain cleared');
    }

    /**
     * Get statistics summary
     */
    getStats() {
        return {
            generation: this.generation,
            bestFitness: Math.round(this.bestFitness),
            averageFitness: Math.round(this.averageFitness),
            populationSize: this.populationSize,
            mutationRate: this.mutationRate,
            history: this.fitnessHistory
        };
    }
}
