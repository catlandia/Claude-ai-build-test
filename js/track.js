/**
 * Track System for AI Car Simulation
 * Defines track boundaries, checkpoints, and collision detection
 */

class Track {
    constructor(canvasWidth, canvasHeight, trackType = 'oval') {
        this.width = canvasWidth;
        this.height = canvasHeight;
        this.trackType = trackType;

        // Track boundaries
        this.outerBoundary = [];
        this.innerBoundary = [];
        this.borders = [];

        // Checkpoints for fitness calculation
        this.checkpoints = [];

        // Starting position and angle
        this.startX = 0;
        this.startY = 0;
        this.startAngle = 0;

        this.generateTrack();
    }

    /**
     * Generate track based on type
     */
    generateTrack() {
        switch (this.trackType) {
            case 'oval':
                this.generateOvalTrack();
                break;
            case 'complex':
                this.generateComplexTrack();
                break;
            case 'zigzag':
                this.generateZigzagTrack();
                break;
            default:
                this.generateOvalTrack();
        }

        this.generateBorders();
        this.generateCheckpoints();
    }

    /**
     * Generate an oval/ellipse track
     */
    generateOvalTrack() {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const outerRadiusX = this.width * 0.4;
        const outerRadiusY = this.height * 0.35;
        const innerRadiusX = outerRadiusX - 70;
        const innerRadiusY = outerRadiusY - 70;
        const segments = 60;

        this.outerBoundary = [];
        this.innerBoundary = [];

        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * 2 * Math.PI;

            this.outerBoundary.push({
                x: centerX + Math.cos(angle) * outerRadiusX,
                y: centerY + Math.sin(angle) * outerRadiusY
            });

            this.innerBoundary.push({
                x: centerX + Math.cos(angle) * innerRadiusX,
                y: centerY + Math.sin(angle) * innerRadiusY
            });
        }

        // Starting position (right side of track, pointing down/counterclockwise)
        this.startX = centerX + (outerRadiusX + innerRadiusX) / 2;
        this.startY = centerY;
        this.startAngle = Math.PI; // Pointing down (following track counterclockwise)
    }

    /**
     * Generate a complex track with turns
     */
    generateComplexTrack() {
        const trackWidth = 70;
        const margin = 50;

        // Define center path points
        const centerPath = [
            { x: margin + 100, y: this.height - margin - 50 },
            { x: this.width - margin - 100, y: this.height - margin - 50 },
            { x: this.width - margin - 50, y: this.height - margin - 120 },
            { x: this.width - margin - 50, y: margin + 150 },
            { x: this.width - margin - 150, y: margin + 50 },
            { x: this.width / 2 + 50, y: margin + 50 },
            { x: this.width / 2, y: margin + 150 },
            { x: this.width / 2, y: this.height / 2 },
            { x: margin + 200, y: this.height / 2 },
            { x: margin + 100, y: this.height / 2 - 80 },
            { x: margin + 100, y: margin + 100 },
            { x: margin + 50, y: margin + 50 },
            { x: margin + 50, y: this.height - margin - 120 }
        ];

        // Generate smooth boundaries
        this.outerBoundary = [];
        this.innerBoundary = [];

        for (let i = 0; i < centerPath.length; i++) {
            const curr = centerPath[i];
            const prev = centerPath[(i - 1 + centerPath.length) % centerPath.length];
            const next = centerPath[(i + 1) % centerPath.length];

            // Calculate perpendicular direction
            const dx = next.x - prev.x;
            const dy = next.y - prev.y;
            const len = Math.sqrt(dx * dx + dy * dy);
            const perpX = -dy / len;
            const perpY = dx / len;

            this.outerBoundary.push({
                x: curr.x + perpX * trackWidth / 2,
                y: curr.y + perpY * trackWidth / 2
            });

            this.innerBoundary.push({
                x: curr.x - perpX * trackWidth / 2,
                y: curr.y - perpY * trackWidth / 2
            });
        }

        // Starting position
        this.startX = centerPath[0].x;
        this.startY = centerPath[0].y;
        this.startAngle = 0;
    }

    /**
     * Generate a zigzag track
     */
    generateZigzagTrack() {
        const trackWidth = 80;
        const margin = 60;
        const segments = 5;

        const centerPath = [];
        const segmentHeight = (this.height - 2 * margin) / segments;

        for (let i = 0; i <= segments; i++) {
            const y = margin + i * segmentHeight;
            const x = (i % 2 === 0) ?
                margin + 100 :
                this.width - margin - 100;
            centerPath.push({ x, y });
        }

        // Add connecting points for smoother turns
        const smoothPath = [];
        for (let i = 0; i < centerPath.length - 1; i++) {
            const curr = centerPath[i];
            const next = centerPath[i + 1];

            smoothPath.push(curr);

            // Add intermediate points
            const midY = (curr.y + next.y) / 2;
            smoothPath.push({ x: curr.x, y: midY - 30 });
            smoothPath.push({ x: (curr.x + next.x) / 2, y: midY });
            smoothPath.push({ x: next.x, y: midY + 30 });
        }
        smoothPath.push(centerPath[centerPath.length - 1]);

        // Close the loop
        smoothPath.push({
            x: this.width / 2,
            y: this.height - margin + 20
        });
        smoothPath.push({
            x: centerPath[0].x,
            y: this.height - margin + 20
        });

        this.outerBoundary = [];
        this.innerBoundary = [];

        for (let i = 0; i < smoothPath.length; i++) {
            const curr = smoothPath[i];
            const prev = smoothPath[(i - 1 + smoothPath.length) % smoothPath.length];
            const next = smoothPath[(i + 1) % smoothPath.length];

            const dx = next.x - prev.x;
            const dy = next.y - prev.y;
            const len = Math.sqrt(dx * dx + dy * dy) || 1;
            const perpX = -dy / len;
            const perpY = dx / len;

            this.outerBoundary.push({
                x: curr.x + perpX * trackWidth / 2,
                y: curr.y + perpY * trackWidth / 2
            });

            this.innerBoundary.push({
                x: curr.x - perpX * trackWidth / 2,
                y: curr.y - perpY * trackWidth / 2
            });
        }

        this.startX = centerPath[0].x;
        this.startY = centerPath[0].y + 40;
        this.startAngle = Math.PI / 2;
    }

    /**
     * Generate border line segments from boundaries
     */
    generateBorders() {
        this.borders = [];

        // Outer boundary segments
        for (let i = 0; i < this.outerBoundary.length; i++) {
            const next = (i + 1) % this.outerBoundary.length;
            this.borders.push([
                this.outerBoundary[i],
                this.outerBoundary[next]
            ]);
        }

        // Inner boundary segments
        for (let i = 0; i < this.innerBoundary.length; i++) {
            const next = (i + 1) % this.innerBoundary.length;
            this.borders.push([
                this.innerBoundary[i],
                this.innerBoundary[next]
            ]);
        }
    }

    /**
     * Generate checkpoints for fitness calculation
     */
    generateCheckpoints() {
        this.checkpoints = [];
        const numCheckpoints = Math.min(this.outerBoundary.length, 30);
        const step = Math.floor(this.outerBoundary.length / numCheckpoints);

        for (let i = 0; i < numCheckpoints; i++) {
            const idx = (i * step) % this.outerBoundary.length;
            this.checkpoints.push([
                this.outerBoundary[idx],
                this.innerBoundary[idx]
            ]);
        }
    }

    /**
     * Check if a point collides with track borders
     */
    checkCollision(polygon) {
        for (const border of this.borders) {
            for (let i = 0; i < polygon.length; i++) {
                const next = (i + 1) % polygon.length;
                const intersection = Utils.getIntersection(
                    polygon[i],
                    polygon[next],
                    border[0],
                    border[1]
                );
                if (intersection) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Get distance to nearest border from a ray
     */
    getRayDistance(start, end) {
        let minDistance = Infinity;
        let closestPoint = null;

        for (const border of this.borders) {
            const intersection = Utils.getIntersection(
                start,
                end,
                border[0],
                border[1]
            );
            if (intersection) {
                const dist = Utils.distance(start, intersection);
                if (dist < minDistance) {
                    minDistance = dist;
                    closestPoint = intersection;
                }
            }
        }

        return { distance: minDistance, point: closestPoint };
    }

    /**
     * Check which checkpoint a car has reached
     */
    checkCheckpoint(carPolygon, lastCheckpoint) {
        const nextCheckpoint = (lastCheckpoint + 1) % this.checkpoints.length;
        const checkpoint = this.checkpoints[nextCheckpoint];

        for (let i = 0; i < carPolygon.length; i++) {
            const next = (i + 1) % carPolygon.length;
            const intersection = Utils.getIntersection(
                carPolygon[i],
                carPolygon[next],
                checkpoint[0],
                checkpoint[1]
            );
            if (intersection) {
                return nextCheckpoint;
            }
        }

        return lastCheckpoint;
    }

    /**
     * Draw the track on canvas
     */
    draw(ctx) {
        // Draw track surface
        ctx.fillStyle = '#2a2a3a';
        ctx.beginPath();
        ctx.moveTo(this.outerBoundary[0].x, this.outerBoundary[0].y);
        for (const point of this.outerBoundary) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.closePath();
        ctx.fill();

        // Cut out inner area
        ctx.fillStyle = '#1a1a2a';
        ctx.beginPath();
        ctx.moveTo(this.innerBoundary[0].x, this.innerBoundary[0].y);
        for (const point of this.innerBoundary) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.closePath();
        ctx.fill();

        // Draw outer boundary
        ctx.strokeStyle = '#ff4444';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.outerBoundary[0].x, this.outerBoundary[0].y);
        for (const point of this.outerBoundary) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.closePath();
        ctx.stroke();

        // Draw inner boundary
        ctx.strokeStyle = '#ff4444';
        ctx.beginPath();
        ctx.moveTo(this.innerBoundary[0].x, this.innerBoundary[0].y);
        for (const point of this.innerBoundary) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.closePath();
        ctx.stroke();

        // Draw checkpoints (subtle)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        for (const checkpoint of this.checkpoints) {
            ctx.beginPath();
            ctx.moveTo(checkpoint[0].x, checkpoint[0].y);
            ctx.lineTo(checkpoint[1].x, checkpoint[1].y);
            ctx.stroke();
        }

        // Draw start line
        if (this.checkpoints.length > 0) {
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(this.checkpoints[0][0].x, this.checkpoints[0][0].y);
            ctx.lineTo(this.checkpoints[0][1].x, this.checkpoints[0][1].y);
            ctx.stroke();
        }

        // Draw center line (dashed)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        for (let i = 0; i < this.outerBoundary.length; i++) {
            const outer = this.outerBoundary[i];
            const inner = this.innerBoundary[i];
            const centerX = (outer.x + inner.x) / 2;
            const centerY = (outer.y + inner.y) / 2;
            if (i === 0) {
                ctx.moveTo(centerX, centerY);
            } else {
                ctx.lineTo(centerX, centerY);
            }
        }
        ctx.closePath();
        ctx.stroke();
        ctx.setLineDash([]);
    }
}
