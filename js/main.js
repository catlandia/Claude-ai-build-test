/**
 * Main Entry Point
 * Initialize simulation and set up event handlers
 */

// Global simulation instance
let simulation;

/**
 * Initialize on page load
 */
document.addEventListener('DOMContentLoaded', () => {
    // Create simulation
    simulation = new Simulation('simulationCanvas', 'nnCanvas');

    // Initialize with default settings
    simulation.init({
        populationSize: 50,
        mutationRate: 0.1,
        trackType: 'oval',
        loadSaved: false
    });

    // Set up control event handlers
    setupControls();

    // Auto-start the simulation
    simulation.start();
    updateButtonStates(true);

    console.log('AI 2D Car Learning Simulation started!');
});

/**
 * Set up UI control event handlers
 */
function setupControls() {
    // Start button
    document.getElementById('startBtn').addEventListener('click', () => {
        simulation.start();
        updateButtonStates(true);
    });

    // Pause button
    document.getElementById('pauseBtn').addEventListener('click', () => {
        simulation.pause();
        const btn = document.getElementById('pauseBtn');
        btn.textContent = simulation.paused ? 'Resume' : 'Pause';
    });

    // Reset button
    document.getElementById('resetBtn').addEventListener('click', () => {
        simulation.reset({
            populationSize: parseInt(document.getElementById('populationSize').value),
            mutationRate: parseInt(document.getElementById('mutationRate').value) / 100,
            trackType: document.getElementById('trackSelect').value,
            loadSaved: false
        });
        updateButtonStates(false);
        document.getElementById('pauseBtn').textContent = 'Pause';
    });

    // Next Generation button
    document.getElementById('nextGenBtn').addEventListener('click', () => {
        simulation.nextGeneration();
    });

    // Population size slider
    const popSlider = document.getElementById('populationSize');
    const popValue = document.getElementById('populationSizeValue');
    popSlider.addEventListener('input', () => {
        popValue.textContent = popSlider.value;
    });

    // Mutation rate slider
    const mutSlider = document.getElementById('mutationRate');
    const mutValue = document.getElementById('mutationRateValue');
    mutSlider.addEventListener('input', () => {
        mutValue.textContent = mutSlider.value + '%';
        simulation.setMutationRate(parseInt(mutSlider.value) / 100);
    });

    // Simulation speed slider
    const speedSlider = document.getElementById('simulationSpeed');
    const speedValue = document.getElementById('simulationSpeedValue');
    speedSlider.addEventListener('input', () => {
        speedValue.textContent = speedSlider.value + 'x';
        simulation.setSpeed(parseInt(speedSlider.value));
    });

    // Show sensors checkbox
    document.getElementById('showSensors').addEventListener('change', (e) => {
        simulation.toggleSensors(e.target.checked);
    });

    // Show all cars checkbox
    document.getElementById('showAllCars').addEventListener('change', (e) => {
        simulation.toggleAllCars(e.target.checked);
    });

    // Track selection
    document.getElementById('trackSelect').addEventListener('change', (e) => {
        simulation.changeTrack(e.target.value);
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        switch (e.key.toLowerCase()) {
            case ' ':
                e.preventDefault();
                simulation.pause();
                document.getElementById('pauseBtn').textContent =
                    simulation.paused ? 'Resume' : 'Pause';
                break;
            case 's':
                if (!simulation.running) {
                    simulation.start();
                    updateButtonStates(true);
                }
                break;
            case 'r':
                simulation.reset({
                    populationSize: parseInt(document.getElementById('populationSize').value),
                    mutationRate: parseInt(document.getElementById('mutationRate').value) / 100,
                    trackType: document.getElementById('trackSelect').value,
                    loadSaved: false
                });
                updateButtonStates(false);
                break;
            case 'n':
                simulation.nextGeneration();
                break;
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
                const speed = parseInt(e.key);
                document.getElementById('simulationSpeed').value = speed;
                document.getElementById('simulationSpeedValue').textContent = speed + 'x';
                simulation.setSpeed(speed);
                break;
        }
    });
}

/**
 * Update button states based on simulation state
 */
function updateButtonStates(isRunning) {
    document.getElementById('startBtn').disabled = isRunning;
    document.getElementById('startBtn').style.opacity = isRunning ? '0.5' : '1';
}

/**
 * Save current best brain to localStorage
 */
function saveBrain() {
    simulation.saveBrain();
    alert('Best brain saved!');
}

/**
 * Load saved brain from localStorage
 */
function loadBrain() {
    simulation.loadBrain();
    alert('Brain loaded!');
}

/**
 * Export brain as JSON file
 */
function exportBrain() {
    if (simulation.ga.bestBrain) {
        const data = JSON.stringify(simulation.ga.bestBrain.toJSON(), null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `car-brain-gen${simulation.ga.generation}.json`;
        a.click();

        URL.revokeObjectURL(url);
    }
}

/**
 * Debug function to log current state
 */
function debugState() {
    console.log('=== Simulation State ===');
    console.log('Running:', simulation.running);
    console.log('Paused:', simulation.paused);
    console.log('Generation:', simulation.ga.generation);
    console.log('Cars alive:', simulation.cars.filter(c => c.alive).length);
    console.log('Best fitness:', simulation.ga.bestFitness);
    console.log('Average fitness:', simulation.ga.averageFitness);
    console.log('=========================');
}
