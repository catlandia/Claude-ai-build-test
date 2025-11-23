/**
 * Simulation Manager
 * Handles the main simulation loop, rendering, and coordination
 */

class Simulation {
    constructor(canvasId, nnCanvasId) {
        // Main canvas
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');

        // Neural network visualization canvas
        this.nnCanvas = document.getElementById(nnCanvasId);
        this.nnCtx = this.nnCanvas.getContext('2d');

        // Resize canvas to container
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Simulation state
        this.running = false;
        this.paused = false;
        this.simulationSpeed = 1;
        this.frameCount = 0;
        this.generationTime = 0;
        this.maxGenerationTime = 1000; // Max frames per generation

        // Display options
        this.showSensors = true;
        this.showAllCars = true;

        // Initialize components
        this.track = null;
        this.cars = [];
        this.ga = null;

        // Animation frame
        this.animationId = null;
    }

    /**
     * Resize canvas to fit container
     */
    resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth - 20;
        this.canvas.height = 500;
    }

    /**
     * Initialize simulation with settings
     */
    init(settings = {}) {
        // Create track
        const trackType = settings.trackType || 'oval';
        this.track = new Track(this.canvas.width, this.canvas.height, trackType);

        // Create genetic algorithm
        this.ga = new GeneticAlgorithm({
            populationSize: settings.populationSize || 50,
            mutationRate: settings.mutationRate || 0.1
        });

        // Try to load saved brain
        if (settings.loadSaved) {
            this.ga.loadBestBrain();
        }

        // Create initial population
        this.cars = this.ga.createPopulation(
            this.track.startX,
            this.track.startY,
            this.track.startAngle
        );

        this.frameCount = 0;
        this.generationTime = 0;
    }

    /**
     * Start simulation
     */
    start() {
        if (this.running) return;

        this.running = true;
        this.paused = false;
        this.loop();
    }

    /**
     * Pause simulation
     */
    pause() {
        this.paused = !this.paused;
    }

    /**
     * Stop simulation
     */
    stop() {
        this.running = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    /**
     * Reset simulation
     */
    reset(settings = {}) {
        this.stop();
        this.ga.reset();
        this.init(settings);
        this.render();
    }

    /**
     * Force next generation
     */
    nextGeneration() {
        this.evolveAndReset();
    }

    /**
     * Evolve population and reset positions
     */
    evolveAndReset() {
        // Evolve to next generation
        this.cars = this.ga.evolve(this.cars);

        // Reset all cars to start
        for (const car of this.cars) {
            car.reset(this.track.startX, this.track.startY, this.track.startAngle);
        }

        this.generationTime = 0;

        // Update UI
        this.updateStats();
    }

    /**
     * Main simulation loop
     */
    loop() {
        if (!this.running) return;

        if (!this.paused) {
            // Run multiple updates per frame based on speed
            for (let i = 0; i < this.simulationSpeed; i++) {
                this.update();
            }
        }

        this.render();

        this.animationId = requestAnimationFrame(() => this.loop());
    }

    /**
     * Update simulation state
     */
    update() {
        this.frameCount++;
        this.generationTime++;

        // Update all cars
        let aliveCars = 0;
        for (const car of this.cars) {
            if (car.alive) {
                car.update(this.track);
                aliveCars++;
            }
        }

        // Check for generation end
        if (aliveCars === 0 || this.generationTime >= this.maxGenerationTime) {
            this.evolveAndReset();
        }

        // Update stats display
        if (this.frameCount % 10 === 0) {
            this.updateStats();
        }
    }

    /**
     * Render simulation
     */
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#1a1a2a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw track
        this.track.draw(this.ctx);

        // Find best alive car
        let bestCar = null;
        let bestFitness = -1;
        for (const car of this.cars) {
            if (car.alive && car.fitness > bestFitness) {
                bestFitness = car.fitness;
                bestCar = car;
            }
        }

        // If no alive cars, show the overall best
        if (!bestCar) {
            bestCar = this.cars.reduce((best, car) =>
                car.fitness > best.fitness ? car : best, this.cars[0]);
        }

        // Draw all cars (except best)
        if (this.showAllCars) {
            for (const car of this.cars) {
                if (car !== bestCar) {
                    car.draw(this.ctx, false, false);
                }
            }
        }

        // Draw best car last (on top) with sensors
        if (bestCar) {
            bestCar.draw(this.ctx, this.showSensors, true);

            // Draw neural network visualization
            NeuralNetworkVisualizer.draw(
                this.nnCtx,
                bestCar.brain,
                this.nnCanvas.width,
                this.nnCanvas.height
            );
        }

        // Draw generation info on canvas
        this.drawInfo();
    }

    /**
     * Draw info overlay on canvas
     */
    drawInfo() {
        const padding = 10;

        ctx = this.ctx;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(padding, padding, 150, 60);

        ctx.fillStyle = '#00d4ff';
        ctx.font = '14px monospace';
        ctx.fillText(`Gen: ${this.ga.generation}`, padding + 10, padding + 20);
        ctx.fillText(`Best: ${Math.round(this.ga.bestFitness)}`, padding + 10, padding + 38);
        ctx.fillText(`Alive: ${this.cars.filter(c => c.alive).length}/${this.cars.length}`,
            padding + 10, padding + 55);
    }

    /**
     * Update statistics display in UI
     */
    updateStats() {
        const stats = this.ga.getStats();

        document.getElementById('generation').textContent = stats.generation;
        document.getElementById('aliveCars').textContent =
            `${this.cars.filter(c => c.alive).length}/${this.cars.length}`;
        document.getElementById('bestFitness').textContent = stats.bestFitness;
        document.getElementById('avgFitness').textContent = stats.averageFitness;
        document.getElementById('timeElapsed').textContent =
            `${Math.round(this.generationTime / 60)}s`;
    }

    /**
     * Set simulation speed
     */
    setSpeed(speed) {
        this.simulationSpeed = speed;
    }

    /**
     * Set mutation rate
     */
    setMutationRate(rate) {
        this.ga.mutationRate = rate;
    }

    /**
     * Toggle sensor display
     */
    toggleSensors(show) {
        this.showSensors = show;
    }

    /**
     * Toggle showing all cars
     */
    toggleAllCars(show) {
        this.showAllCars = show;
    }

    /**
     * Change track type
     */
    changeTrack(trackType) {
        this.track = new Track(this.canvas.width, this.canvas.height, trackType);

        // Reset cars to new starting position
        for (const car of this.cars) {
            car.reset(this.track.startX, this.track.startY, this.track.startAngle);
        }

        this.generationTime = 0;
    }

    /**
     * Save current best brain
     */
    saveBrain() {
        this.ga.saveBestBrain();
    }

    /**
     * Load saved brain
     */
    loadBrain() {
        if (this.ga.loadBestBrain()) {
            // Recreate population with loaded brain
            this.cars = this.ga.createPopulation(
                this.track.startX,
                this.track.startY,
                this.track.startAngle
            );
            this.generationTime = 0;
            this.updateStats();
        }
    }
}
