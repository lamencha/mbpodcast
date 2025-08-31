import React, { useEffect, useRef } from 'react';

// Simplified Delaunay triangulation for the particle field
const Delaunay = {
  triangulate: function(vertices: number[][]): number[] {
    const n = vertices.length;
    if (n < 3) return [];
    
    // Simple triangulation - connect each point to nearby points
    const indices: number[] = [];
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        for (let k = j + 1; k < n; k++) {
          const dx1 = vertices[j][0] - vertices[i][0];
          const dy1 = vertices[j][1] - vertices[i][1];
          const dx2 = vertices[k][0] - vertices[i][0];
          const dy2 = vertices[k][1] - vertices[i][1];
          const dist1 = Math.sqrt(dx1*dx1 + dy1*dy1);
          const dist2 = Math.sqrt(dx2*dx2 + dy2*dy2);
          
          // Only create triangles between nearby points
          if (dist1 < 200000 && dist2 < 200000) {
            indices.push(i, j, k);
          }
        }
      }
    }
    return indices;
  }
};

interface ParticleFieldProps {
  className?: string;
}

const ParticleField: React.FC<ParticleFieldProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Settings - adjusted for Marathon aesthetic
    const particleCount = 35;
    const flareCount = 8;
    const motion = 0.03;
    const color = '#00ffff'; // Cyan to match Marathon theme
    const particleSizeBase = 1;
    const particleSizeMultiplier = 0.4;
    const flareSizeBase = 80;
    const flareSizeMultiplier = 80;
    const lineWidth = 1;
    const linkChance = 85;
    const linkLengthMin = 4;
    const linkLengthMax = 6;
    const linkOpacity = 0.15;
    const linkFade = 60;
    const linkSpeed = 0.8;
    const glareAngle = -60;
    const glareOpacityMultiplier = 0.03;
    const renderParticles = true;
    const renderParticleGlare = true;
    const renderFlares = true;
    const renderLinks = true;
    const flicker = true;
    const flickerSmoothing = 20;
    const randomMotion = true;
    const noiseLength = 800;
    const noiseStrength = 0.8;

    let mouse = { x: 0, y: 0 };
    let c = 1000;
    let n = 0;
    let nAngle = (Math.PI * 2) / noiseLength;
    let nRad = 100;
    let nPos = { x: 0, y: 0 };
    let points: number[][] = [];
    let vertices: number[] = [];
    let triangles: number[][] = [];
    let links: Link[] = [];
    let particles: Particle[] = [];
    let flares: Flare[] = [];

    class Particle {
      x: number;
      y: number;
      z: number;
      color: string;
      opacity: number;
      flicker: number;
      neighbors: number[];

      constructor() {
        this.x = random(-0.1, 1.1, true);
        this.y = random(-0.1, 1.1, true);
        this.z = random(0, 4);
        this.color = color;
        this.opacity = random(0.3, 1, true);
        this.flicker = 0;
        this.neighbors = [];
      }

      render() {
        if (!context) return;
        
        const pos = position(this.x, this.y, this.z);
        const r = ((this.z * particleSizeMultiplier) + particleSizeBase) * (sizeRatio() / 1000);
        let o = this.opacity;

        if (flicker) {
          const newVal = random(-0.5, 0.5, true);
          this.flicker += (newVal - this.flicker) / flickerSmoothing;
          if (this.flicker > 0.5) this.flicker = 0.5;
          if (this.flicker < -0.5) this.flicker = -0.5;
          o += this.flicker;
          if (o > 1) o = 1;
          if (o < 0) o = 0;
        }

        context.fillStyle = this.color;
        context.globalAlpha = o;
        context.beginPath();
        context.arc(pos.x, pos.y, r, 0, 2 * Math.PI, false);
        context.fill();
        context.closePath();

        if (renderParticleGlare) {
          context.globalAlpha = o * glareOpacityMultiplier;
          context.beginPath();
          context.ellipse(pos.x, pos.y, r * 80, r, (glareAngle - ((nPos.x - 0.5) * noiseStrength * motion)) * (Math.PI / 180), 0, 2 * Math.PI, false);
          context.fill();
          context.closePath();
        }

        context.globalAlpha = 1;
      }
    }

    class Flare {
      x: number;
      y: number;
      z: number;
      color: string;
      opacity: number;

      constructor() {
        this.x = random(-0.25, 1.25, true);
        this.y = random(-0.25, 1.25, true);
        this.z = random(0, 2);
        this.color = color;
        this.opacity = random(0.001, 0.008, true);
      }

      render() {
        if (!context) return;
        
        const pos = position(this.x, this.y, this.z);
        const r = ((this.z * flareSizeMultiplier) + flareSizeBase) * (sizeRatio() / 1000);

        context.beginPath();
        context.globalAlpha = this.opacity;
        context.arc(pos.x, pos.y, r, 0, 2 * Math.PI, false);
        context.fillStyle = this.color;
        context.fill();
        context.closePath();
        context.globalAlpha = 1;
      }
    }

    class Link {
      length: number;
      verts: number[];
      stage: number;
      linked: number[];
      distances: number[];
      traveled: number;
      fade: number;
      finished: boolean;

      constructor(startVertex: number, numPoints: number) {
        this.length = numPoints;
        this.verts = [startVertex];
        this.stage = 0;
        this.linked = [startVertex];
        this.distances = [];
        this.traveled = 0;
        this.fade = 0;
        this.finished = false;
      }

      render() {
        let i: number, p: Particle, pos: {x: number, y: number}, points: number[][];

        switch (this.stage) {
          case 0:
            const last = particles[this.verts[this.verts.length - 1]];
            if (last && last.neighbors && last.neighbors.length > 0) {
              const neighbor = last.neighbors[random(0, last.neighbors.length - 1)];
              if (this.verts.indexOf(neighbor) == -1) {
                this.verts.push(neighbor);
              }
            } else {
              this.stage = 3;
              this.finished = true;
            }

            if (this.verts.length >= this.length) {
              for (i = 0; i < this.verts.length - 1; i++) {
                const p1 = particles[this.verts[i]];
                const p2 = particles[this.verts[i + 1]];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                this.distances.push(dist);
              }
              this.stage = 1;
            }
            break;

          case 1:
            if (this.distances.length > 0) {
              points = [];
              for (i = 0; i < this.linked.length; i++) {
                p = particles[this.linked[i]];
                pos = position(p.x, p.y, p.z);
                points.push([pos.x, pos.y]);
              }

              const linkSpeedRel = linkSpeed * 0.00001 * (canvas?.width || 1000);
              this.traveled += linkSpeedRel;
              const d = this.distances[this.linked.length - 1];

              if (this.traveled >= d) {
                this.traveled = 0;
                this.linked.push(this.verts[this.linked.length]);
                p = particles[this.linked[this.linked.length - 1]];
                pos = position(p.x, p.y, p.z);
                points.push([pos.x, pos.y]);

                if (this.linked.length >= this.verts.length) {
                  this.stage = 2;
                }
              } else {
                const a = particles[this.linked[this.linked.length - 1]];
                const b = particles[this.verts[this.linked.length]];
                const t = d - this.traveled;
                const x = ((this.traveled * b.x) + (t * a.x)) / d;
                const y = ((this.traveled * b.y) + (t * a.y)) / d;
                const z = ((this.traveled * b.z) + (t * a.z)) / d;

                pos = position(x, y, z);
                points.push([pos.x, pos.y]);
              }

              this.drawLine(points);
            } else {
              this.stage = 3;
              this.finished = true;
            }
            break;

          case 2:
            if (this.verts.length > 1) {
              if (this.fade < linkFade) {
                this.fade++;
                points = [];
                const alpha = (1 - (this.fade / linkFade)) * linkOpacity;
                for (i = 0; i < this.verts.length; i++) {
                  p = particles[this.verts[i]];
                  pos = position(p.x, p.y, p.z);
                  points.push([pos.x, pos.y]);
                }
                this.drawLine(points, alpha);
              } else {
                this.stage = 3;
                this.finished = true;
              }
            } else {
              this.stage = 3;
              this.finished = true;
            }
            break;

          case 3:
          default:
            this.finished = true;
            break;
        }
      }

      drawLine(points: number[][], alpha: number = linkOpacity) {
        if (points.length > 1 && alpha > 0 && context) {
          context.globalAlpha = alpha;
          context.beginPath();
          for (let i = 0; i < points.length - 1; i++) {
            context.moveTo(points[i][0], points[i][1]);
            context.lineTo(points[i + 1][0], points[i + 1][1]);
          }
          context.strokeStyle = color;
          context.lineWidth = lineWidth;
          context.stroke();
          context.closePath();
          context.globalAlpha = 1;
        }
      }
    }

    function noisePoint(i: number) {
      const a = nAngle * i;
      const cosA = Math.cos(a);
      const sinA = Math.sin(a);
      const rad = nRad;
      return {
        x: rad * cosA,
        y: rad * sinA
      };
    }

    function position(x: number, y: number, z: number) {
      const canvasWidth = canvas?.width || 1000;
      const canvasHeight = canvas?.height || 1000;
      
      return {
        x: (x * canvasWidth) + ((((canvasWidth / 2) - mouse.x + ((nPos.x - 0.5) * noiseStrength)) * z) * motion),
        y: (y * canvasHeight) + ((((canvasHeight / 2) - mouse.y + ((nPos.y - 0.5) * noiseStrength)) * z) * motion)
      };
    }

    function sizeRatio() {
      if (!canvas) return 1000;
      return canvas.width >= canvas.height ? canvas.width : canvas.height;
    }

    function random(min: number, max: number, float?: boolean): number {
      return float ?
        Math.random() * (max - min) + min :
        Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function startLink(vertex: number, length: number) {
      links.push(new Link(vertex, length));
    }

    function resize() {
      if (canvas) {
        canvas.width = window.innerWidth * (window.devicePixelRatio || 1);
        canvas.height = canvas.width * (canvas.clientHeight / canvas.clientWidth);
      }
    }

    function init() {
      resize();
      
      mouse.x = (canvas?.clientWidth ?? 0) / 2;
      mouse.y = (canvas?.clientHeight ?? 0) / 2;

      // Create particle positions
      for (let i = 0; i < particleCount; i++) {
        const p = new Particle();
        particles.push(p);
        points.push([p.x * c, p.y * c]);
      }

      // Delaunay triangulation
      vertices = Delaunay.triangulate(points);
      
      // Create triangles array
      const tri: number[] = [];
      for (let i = 0; i < vertices.length; i++) {
        if (tri.length == 3) {
          triangles.push(tri.slice());
          tri.length = 0;
        }
        tri.push(vertices[i]);
      }

      // Set up particle neighbors
      for (let i = 0; i < particles.length; i++) {
        for (let j = 0; j < triangles.length; j++) {
          const k = triangles[j].indexOf(i);
          if (k !== -1) {
            triangles[j].forEach((value) => {
              if (value !== i && particles[i].neighbors.indexOf(value) == -1) {
                particles[i].neighbors.push(value);
              }
            });
          }
        }
      }

      // Create flares
      if (renderFlares) {
        for (let i = 0; i < flareCount; i++) {
          flares.push(new Flare());
        }
      }

      // Mouse movement handler  
      mouseHandler = (e: MouseEvent) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
      };
      
      document.body.addEventListener('mousemove', mouseHandler, { passive: true });
    }

    function render() {
      if (randomMotion) {
        n++;
        if (n >= noiseLength) {
          n = 0;
        }
        nPos = noisePoint(n);
      }

      if (context && canvas) {
        context.clearRect(0, 0, canvas.width, canvas.height);
      }

      if (renderParticles) {
        for (let i = 0; i < particleCount; i++) {
          particles[i].render();
        }
      }

      if (renderLinks) {
        if (random(0, linkChance) == linkChance) {
          const length = random(linkLengthMin, linkLengthMax);
          const start = random(0, particles.length - 1);
          startLink(start, length);
        }

        for (let l = links.length - 1; l >= 0; l--) {
          if (links[l] && !links[l].finished) {
            links[l].render();
          } else {
            links.splice(l, 1);
          }
        }
      }

      if (renderFlares) {
        for (let j = 0; j < flareCount; j++) {
          flares[j].render();
        }
      }
    }

    function animate() {
      animationRef.current = requestAnimationFrame(animate);
      resize();
      render();
    }

    let mouseHandler: ((e: MouseEvent) => void) | null = null;

    init();
    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      // Clean up mouse event listener
      if (mouseHandler) {
        document.body.removeEventListener('mousemove', mouseHandler);
        mouseHandler = null;
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="stars"
      className={className}
      style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 1
      }}
    />
  );
};

export default ParticleField;