/**
 * Neural Network Implementation for AI Car
 * A simple feedforward neural network with customizable layers
 */

class NeuralNetwork {
    /**
     * Create a neural network with specified layer sizes
     * @param {number[]} layerSizes - Array of neuron counts per layer [input, hidden..., output]
     */
    constructor(layerSizes) {
        this.layers = [];
        this.layerSizes = layerSizes;

        // Create layers (weights and biases between each layer)
        for (let i = 0; i < layerSizes.length - 1; i++) {
            this.layers.push(new NeuralLayer(layerSizes[i], layerSizes[i + 1]));
        }
    }

    /**
     * Feedforward: pass inputs through the network
     * @param {number[]} inputs - Input values
     * @returns {number[]} - Output values
     */
    feedForward(inputs) {
        let outputs = inputs;
        for (const layer of this.layers) {
            outputs = layer.feedForward(outputs);
        }
        return outputs;
    }

    /**
     * Create a deep copy of this neural network
     * @returns {NeuralNetwork}
     */
    clone() {
        const clone = new NeuralNetwork(this.layerSizes);
        for (let i = 0; i < this.layers.length; i++) {
            clone.layers[i] = this.layers[i].clone();
        }
        return clone;
    }

    /**
     * Mutate the network weights and biases
     * @param {number} rate - Mutation rate (0-1)
     */
    mutate(rate = 0.1) {
        for (const layer of this.layers) {
            layer.mutate(rate);
        }
    }

    /**
     * Crossover with another neural network
     * @param {NeuralNetwork} partner - Partner network
     * @returns {NeuralNetwork} - Child network
     */
    crossover(partner) {
        const child = new NeuralNetwork(this.layerSizes);
        for (let i = 0; i < this.layers.length; i++) {
            child.layers[i] = this.layers[i].crossover(partner.layers[i]);
        }
        return child;
    }

    /**
     * Export network to JSON
     * @returns {object}
     */
    toJSON() {
        return {
            layerSizes: this.layerSizes,
            layers: this.layers.map(layer => layer.toJSON())
        };
    }

    /**
     * Import network from JSON
     * @param {object} json
     * @returns {NeuralNetwork}
     */
    static fromJSON(json) {
        const nn = new NeuralNetwork(json.layerSizes);
        for (let i = 0; i < json.layers.length; i++) {
            nn.layers[i] = NeuralLayer.fromJSON(json.layers[i]);
        }
        return nn;
    }
}

/**
 * A single layer of the neural network
 */
class NeuralLayer {
    /**
     * Create a layer with random weights and biases
     * @param {number} inputCount - Number of inputs
     * @param {number} outputCount - Number of outputs (neurons in this layer)
     */
    constructor(inputCount, outputCount) {
        this.inputCount = inputCount;
        this.outputCount = outputCount;

        // Initialize weights matrix (outputCount x inputCount)
        this.weights = [];
        for (let i = 0; i < outputCount; i++) {
            this.weights[i] = [];
            for (let j = 0; j < inputCount; j++) {
                // Xavier initialization
                this.weights[i][j] = (Math.random() * 2 - 1) * Math.sqrt(2 / inputCount);
            }
        }

        // Initialize biases
        this.biases = [];
        for (let i = 0; i < outputCount; i++) {
            this.biases[i] = (Math.random() * 2 - 1) * 0.1;
        }

        // Store last outputs for visualization
        this.lastInputs = [];
        this.lastOutputs = [];
    }

    /**
     * Pass inputs through this layer
     * @param {number[]} inputs
     * @returns {number[]}
     */
    feedForward(inputs) {
        this.lastInputs = inputs;
        const outputs = [];

        for (let i = 0; i < this.outputCount; i++) {
            let sum = this.biases[i];
            for (let j = 0; j < this.inputCount; j++) {
                sum += inputs[j] * this.weights[i][j];
            }
            // Tanh activation function (outputs between -1 and 1)
            outputs[i] = Math.tanh(sum);
        }

        this.lastOutputs = outputs;
        return outputs;
    }

    /**
     * Create a deep copy of this layer
     * @returns {NeuralLayer}
     */
    clone() {
        const clone = new NeuralLayer(this.inputCount, this.outputCount);
        for (let i = 0; i < this.outputCount; i++) {
            clone.biases[i] = this.biases[i];
            for (let j = 0; j < this.inputCount; j++) {
                clone.weights[i][j] = this.weights[i][j];
            }
        }
        return clone;
    }

    /**
     * Mutate weights and biases
     * @param {number} rate - Mutation rate
     */
    mutate(rate) {
        for (let i = 0; i < this.outputCount; i++) {
            // Mutate biases
            if (Math.random() < rate) {
                this.biases[i] += (Math.random() * 2 - 1) * 0.5;
            }
            // Mutate weights
            for (let j = 0; j < this.inputCount; j++) {
                if (Math.random() < rate) {
                    this.weights[i][j] += (Math.random() * 2 - 1) * 0.5;
                }
            }
        }
    }

    /**
     * Crossover with another layer
     * @param {NeuralLayer} partner
     * @returns {NeuralLayer}
     */
    crossover(partner) {
        const child = new NeuralLayer(this.inputCount, this.outputCount);
        for (let i = 0; i < this.outputCount; i++) {
            // Randomly pick bias from either parent
            child.biases[i] = Math.random() < 0.5 ? this.biases[i] : partner.biases[i];
            for (let j = 0; j < this.inputCount; j++) {
                // Randomly pick weight from either parent
                child.weights[i][j] = Math.random() < 0.5 ?
                    this.weights[i][j] : partner.weights[i][j];
            }
        }
        return child;
    }

    /**
     * Export layer to JSON
     * @returns {object}
     */
    toJSON() {
        return {
            inputCount: this.inputCount,
            outputCount: this.outputCount,
            weights: this.weights.map(row => [...row]),
            biases: [...this.biases]
        };
    }

    /**
     * Import layer from JSON
     * @param {object} json
     * @returns {NeuralLayer}
     */
    static fromJSON(json) {
        const layer = new NeuralLayer(json.inputCount, json.outputCount);
        layer.weights = json.weights.map(row => [...row]);
        layer.biases = [...json.biases];
        return layer;
    }
}

/**
 * Visualize a neural network on a canvas
 */
class NeuralNetworkVisualizer {
    static draw(ctx, network, width, height) {
        const margin = 20;
        const layerCount = network.layerSizes.length;
        const layerWidth = (width - 2 * margin) / (layerCount - 1);

        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, width, height);

        // Draw connections and neurons for each layer
        for (let l = 0; l < network.layers.length; l++) {
            const layer = network.layers[l];
            const x1 = margin + l * layerWidth;
            const x2 = margin + (l + 1) * layerWidth;

            const inputSpacing = (height - 2 * margin) / (layer.inputCount + 1);
            const outputSpacing = (height - 2 * margin) / (layer.outputCount + 1);

            // Draw weights (connections)
            for (let i = 0; i < layer.outputCount; i++) {
                const y2 = margin + (i + 1) * outputSpacing;
                for (let j = 0; j < layer.inputCount; j++) {
                    const y1 = margin + (j + 1) * inputSpacing;
                    const weight = layer.weights[i][j];

                    // Color based on weight value
                    const intensity = Math.abs(weight);
                    const alpha = Math.min(intensity * 0.5, 1);

                    if (weight > 0) {
                        ctx.strokeStyle = `rgba(0, 255, 100, ${alpha})`;
                    } else {
                        ctx.strokeStyle = `rgba(255, 100, 0, ${alpha})`;
                    }

                    ctx.lineWidth = Math.min(Math.abs(weight) * 2, 3);
                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.stroke();
                }
            }
        }

        // Draw neurons
        for (let l = 0; l <= network.layers.length; l++) {
            const x = margin + l * layerWidth;
            let neuronCount, values;

            if (l === 0) {
                neuronCount = network.layerSizes[0];
                values = network.layers[0].lastInputs;
            } else {
                neuronCount = network.layers[l - 1].outputCount;
                values = network.layers[l - 1].lastOutputs;
            }

            const spacing = (height - 2 * margin) / (neuronCount + 1);

            for (let i = 0; i < neuronCount; i++) {
                const y = margin + (i + 1) * spacing;
                const value = values[i] || 0;

                // Neuron color based on activation
                const brightness = Math.floor((value + 1) / 2 * 255);
                ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;

                ctx.beginPath();
                ctx.arc(x, y, 8, 0, 2 * Math.PI);
                ctx.fill();

                ctx.strokeStyle = '#00d4ff';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
    }
}
