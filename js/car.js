/**
 * 2D Car with Physics, Sensors, and Neural Network Brain
 */

class Car {
    constructor(x, y, angle, brain = null) {
        // Position and orientation
        this.x = x;
        this.y = y;
        this.angle = angle;

        // Dimensions
        this.width = 20;
        this.height = 40;

        // Physics
        this.speed = 0;
        this.maxSpeed = 5;
        this.acceleration = 0.2;
        this.friction = 0.05;
        this.turnSpeed = 0.05;

        // State
        this.alive = true;
        this.fitness = 0;
        this.distance = 0;
        this.checkpointsPassed = 0;
        this.lastCheckpoint = -1;
        this.timeSinceLastCheckpoint = 0;
        this.maxIdleTime = 300; // Frames before dying if no progress (5 seconds)

        // Sensors
        this.sensorCount = 5;
        this.sensorLength = 150;
        this.sensorSpread = Math.PI / 2; // 90 degrees spread
        this.sensors = [];
        this.sensorReadings = [];

        // Neural Network Brain
        // Inputs: 5 sensors + current speed
        // Hidden: 6 neurons
        // Outputs: 2 (forward/backward, left/right)
        if (brain) {
            this.brain = brain;
        } else {
            this.brain = new NeuralNetwork([this.sensorCount + 1, 6, 2]);
        }

        // Visual properties
        this.color = this.generateColor();
        this.polygon = [];

        // Initialize
        this.updatePolygon();
    }

    /**
     * Generate a random color for the car
     */
    generateColor() {
        const hue = Math.random() * 360;
        return `hsl(${hue}, 70%, 50%)`;
    }

    /**
     * Update car polygon (corners) for collision detection
     */
    updatePolygon() {
        const rad = Math.hypot(this.width, this.height) / 2;
        const alpha = Math.atan2(this.width, this.height);

        this.polygon = [
            {
                x: this.x - Math.sin(this.angle - alpha) * rad,
                y: this.y - Math.cos(this.angle - alpha) * rad
            },
            {
                x: this.x - Math.sin(this.angle + alpha) * rad,
                y: this.y - Math.cos(this.angle + alpha) * rad
            },
            {
                x: this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
                y: this.y - Math.cos(Math.PI + this.angle - alpha) * rad
            },
            {
                x: this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
                y: this.y - Math.cos(Math.PI + this.angle + alpha) * rad
            }
        ];
    }

    /**
     * Update sensors - cast rays to detect track borders
     */
    updateSensors(track) {
        this.sensors = [];
        this.sensorReadings = [];

        for (let i = 0; i < this.sensorCount; i++) {
            // Calculate sensor angle
            const ratio = this.sensorCount === 1 ? 0.5 :
                i / (this.sensorCount - 1);
            const sensorAngle = Utils.lerp(
                this.sensorSpread / 2,
                -this.sensorSpread / 2,
                ratio
            ) + this.angle;

            // Sensor start and end points
            const start = { x: this.x, y: this.y };
            const end = {
                x: this.x - Math.sin(sensorAngle) * this.sensorLength,
                y: this.y - Math.cos(sensorAngle) * this.sensorLength
            };

            this.sensors.push({ start, end, angle: sensorAngle });

            // Get distance to nearest border
            const result = track.getRayDistance(start, end);

            if (result.point) {
                // Normalize reading (0 = far, 1 = close)
                const reading = 1 - (result.distance / this.sensorLength);
                this.sensorReadings.push(reading);
            } else {
                this.sensorReadings.push(0);
            }
        }
    }

    /**
     * Use neural network to decide actions
     */
    think() {
        // Prepare inputs: sensor readings + normalized speed
        const inputs = [
            ...this.sensorReadings,
            this.speed / this.maxSpeed
        ];

        // Get neural network outputs
        const outputs = this.brain.feedForward(inputs);

        // Output 0: acceleration (-1 to 1) -> brake/accelerate
        // Output 1: steering (-1 to 1) -> left/right
        return {
            throttle: outputs[0],
            steering: outputs[1]
        };
    }

    /**
     * Update car physics and state
     */
    update(track) {
        if (!this.alive) return;

        // Update sensors
        this.updateSensors(track);

        // Get actions from neural network
        const actions = this.think();

        // Apply throttle
        if (actions.throttle > 0) {
            this.speed += this.acceleration * actions.throttle;
        } else {
            this.speed += this.acceleration * actions.throttle * 0.5; // Slower reverse
        }

        // Apply friction
        if (this.speed > 0) {
            this.speed -= this.friction;
            if (this.speed < 0) this.speed = 0;
        } else if (this.speed < 0) {
            this.speed += this.friction;
            if (this.speed > 0) this.speed = 0;
        }

        // Clamp speed
        this.speed = Utils.clamp(this.speed, -this.maxSpeed / 2, this.maxSpeed);

        // Apply steering (only when moving)
        if (Math.abs(this.speed) > 0.1) {
            const steerFactor = this.speed > 0 ? 1 : -1;
            this.angle += actions.steering * this.turnSpeed * steerFactor;
        }

        // Update position
        this.x -= Math.sin(this.angle) * this.speed;
        this.y -= Math.cos(this.angle) * this.speed;

        // Update polygon
        this.updatePolygon();

        // Track distance traveled
        this.distance += Math.abs(this.speed);

        // Check for checkpoint
        const newCheckpoint = track.checkCheckpoint(this.polygon, this.lastCheckpoint);
        if (newCheckpoint !== this.lastCheckpoint) {
            this.lastCheckpoint = newCheckpoint;
            this.checkpointsPassed++;
            this.timeSinceLastCheckpoint = 0;
        } else {
            this.timeSinceLastCheckpoint++;
        }

        // Check for collision
        if (track.checkCollision(this.polygon)) {
            this.alive = false;
        }

        // Check for idle timeout
        if (this.timeSinceLastCheckpoint > this.maxIdleTime) {
            this.alive = false;
        }

        // Update fitness
        this.calculateFitness();
    }

    /**
     * Calculate fitness score
     */
    calculateFitness() {
        // Fitness based on checkpoints passed (primary)
        // and distance traveled (secondary)
        this.fitness = (this.checkpointsPassed * 1000) + this.distance;
    }

    /**
     * Reset car to starting position
     */
    reset(x, y, angle) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = 0;
        this.alive = true;
        this.fitness = 0;
        this.distance = 0;
        this.checkpointsPassed = 0;
        this.lastCheckpoint = -1;
        this.timeSinceLastCheckpoint = 0;
        this.updatePolygon();
    }

    /**
     * Clone this car with same brain
     */
    clone() {
        const clone = new Car(this.x, this.y, this.angle, this.brain.clone());
        return clone;
    }

    /**
     * Draw the car on canvas
     */
    draw(ctx, showSensors = false, isBest = false) {
        if (!this.alive && !isBest) return;

        // Draw sensors (only for best car or if enabled)
        if (showSensors && this.alive) {
            for (let i = 0; i < this.sensors.length; i++) {
                const sensor = this.sensors[i];
                const reading = this.sensorReadings[i];

                // Sensor line
                ctx.strokeStyle = `rgba(255, 255, 0, ${0.3 + reading * 0.5})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(sensor.start.x, sensor.start.y);

                if (reading > 0) {
                    // Draw to detection point
                    const dist = (1 - reading) * this.sensorLength;
                    const endX = sensor.start.x - Math.sin(sensor.angle) * dist;
                    const endY = sensor.start.y - Math.cos(sensor.angle) * dist;
                    ctx.lineTo(endX, endY);

                    // Detection point
                    ctx.strokeStyle = '#ff0000';
                    ctx.fillStyle = '#ff0000';
                    ctx.fillRect(endX - 3, endY - 3, 6, 6);
                } else {
                    ctx.lineTo(sensor.end.x, sensor.end.y);
                }
                ctx.stroke();
            }
        }

        // Draw car body
        const alpha = this.alive ? 1 : 0.3;

        ctx.fillStyle = isBest ?
            `rgba(0, 255, 255, ${alpha})` :
            this.color.replace(')', `, ${alpha})`).replace('hsl', 'hsla');

        ctx.beginPath();
        ctx.moveTo(this.polygon[0].x, this.polygon[0].y);
        for (let i = 1; i < this.polygon.length; i++) {
            ctx.lineTo(this.polygon[i].x, this.polygon[i].y);
        }
        ctx.closePath();
        ctx.fill();

        // Draw outline for best car
        if (isBest) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw direction indicator
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            const frontX = (this.polygon[0].x + this.polygon[1].x) / 2;
            const frontY = (this.polygon[0].y + this.polygon[1].y) / 2;
            ctx.arc(frontX, frontY, 4, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}
