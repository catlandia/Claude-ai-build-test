# AI 2D Car Learning Simulation

An interactive simulation where cars learn to drive on a track using neural networks and genetic algorithms.

## Features

- **Neural Networks**: Each car has a brain (feedforward neural network) that controls steering and acceleration
- **Genetic Algorithm**: Cars evolve over generations - best performers pass their genes to offspring
- **Multiple Tracks**: Choose from Oval, Complex, or Zigzag tracks
- **Real-time Visualization**: Watch cars learn in real-time with sensor visualization
- **Customizable Parameters**: Adjust population size, mutation rate, and simulation speed

## How It Works

### The Car
- Each car has 5 sensors that detect distance to track boundaries
- Sensors spread in a 90-degree arc in front of the car
- The car can accelerate, brake, and steer left/right

### Neural Network
- **Input Layer**: 6 neurons (5 sensor readings + current speed)
- **Hidden Layer**: 6 neurons
- **Output Layer**: 2 neurons (throttle, steering)
- Uses tanh activation function

### Genetic Algorithm
1. **Fitness**: Cars are scored based on checkpoints passed and distance traveled
2. **Selection**: Tournament selection picks parents based on fitness
3. **Crossover**: Child networks inherit weights from both parents
4. **Mutation**: Random changes to weights help explore new solutions
5. **Elitism**: Top performers pass unchanged to next generation

## Controls

### Buttons
- **Start**: Begin the simulation
- **Pause**: Pause/Resume simulation
- **Reset**: Reset to generation 1
- **Next Generation**: Force evolution to next generation

### Sliders
- **Population Size**: Number of cars per generation (10-200)
- **Mutation Rate**: Probability of random changes (1-50%)
- **Simulation Speed**: How fast the simulation runs (1-10x)

### Checkboxes
- **Show Sensors**: Display sensor rays on best car
- **Show All Cars**: Display all cars or just the best

### Keyboard Shortcuts
- `Space`: Pause/Resume
- `S`: Start simulation
- `R`: Reset
- `N`: Next generation
- `1-5`: Set simulation speed

## Getting Started

1. Open `index.html` in a modern web browser
2. Click **Start** to begin the simulation
3. Watch as cars learn to navigate the track over generations
4. Experiment with different settings and tracks

## Files Structure

```
├── index.html              # Main HTML page
├── css/
│   └── styles.css          # Styling
├── js/
│   ├── utils.js            # Utility functions
│   ├── neural-network.js   # Neural network implementation
│   ├── track.js            # Track generation and collision
│   ├── car.js              # Car physics and sensors
│   ├── genetic-algorithm.js # GA implementation
│   ├── simulation.js       # Main simulation loop
│   └── main.js             # Entry point and controls
└── README.md               # This file
```

## Tips for Better Learning

1. **Start with the Oval track** - It's the easiest for cars to learn
2. **Use lower mutation rates (5-15%)** for fine-tuning after initial learning
3. **Use higher mutation rates (20-30%)** if cars get stuck in local optima
4. **Increase population** for better exploration of solutions
5. **Be patient** - It may take 20-50+ generations for good performance

## Technologies Used

- Pure JavaScript (no external libraries)
- HTML5 Canvas for rendering
- CSS3 for styling

## License

MIT License - Feel free to use and modify!
