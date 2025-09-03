import React, { useEffect, useRef } from 'react';

interface FluidEffectProps {
  className?: string;
}

const FluidEffect: React.FC<FluidEffectProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Variables to track cleanup handlers
    let resizeHandler: (() => void) | null = null;
    let mouseHandler: ((e: PointerEvent) => void) | null = null;
    let renderer: any = null;
    let rtTexture: any = null;
    let rtTexture2: any = null;

    // Check if Three.js is available
    if (typeof (window as any).THREE === 'undefined') {
      // Load Three.js dynamically
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/88/three.min.js';
      script.onload = () => initFluidEffect();
      document.head.appendChild(script);
      
      return () => {
        cleanup();
        if (script.parentNode) {
          document.head.removeChild(script);
        }
      };
    } else {
      initFluidEffect();
    }

    function initFluidEffect() {
      const THREE = (window as any).THREE;
      let camera: any, scene: any;
      let uniforms: any;

      const divisor = 1 / 10;
      let newmouse = { x: 0, y: 0 };

      // Vertex shader
      const vertexShader = `
        void main() {
          gl_Position = vec4( position, 1.0 );
        }
      `;

      // Fragment shader
      const fragmentShader = `
        uniform vec2 u_resolution;
        uniform vec2 u_mouse;
        uniform float u_time;
        uniform sampler2D u_noise;
        uniform sampler2D u_buffer;
        uniform bool u_renderpass;
          
        const float blurMultiplier = 0.95;
        const float circleSize = .25;
        const float blurStrength = .98;
        const float threshold = .5;
        const float scale = 4.;
        
        #define PI 3.141592653589793
        #define TAU 6.283185307179586

        vec2 hash2(vec2 p) {
          // Simple hash for noise when texture is not available
          return fract(sin(vec2(dot(p, vec2(127.1,311.7)), dot(p, vec2(269.5,183.3)))) * 43758.5453);
        }
        
        vec3 hsb2rgb( in vec3 c ){
          vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0), 6.0)-3.0)-1.0, 0.0, 1.0 );
          rgb = rgb*rgb*(3.0-2.0*rgb);
          return c.z * mix( vec3(1.0), rgb, c.y);
        }
        
        vec3 domain(vec2 z){
          return vec3(hsb2rgb(vec3(atan(z.y,z.x)/TAU,1.,1.)));
        }

        #define pow2(x) (x * x)

        const int samples = 8;
        const float sigma = float(samples) * 0.25;

        float gaussian(vec2 i) {
          return 1.0 / (2.0 * PI * pow2(sigma)) * exp(-((pow2(i.x) + pow2(i.y)) / (2.0 * pow2(sigma))));
        }

        vec3 hash33(vec3 p){ 
          float n = sin(dot(p, vec3(7, 157, 113)));    
          return fract(vec3(2097152, 262144, 32768)*n); 
        }

        vec3 blur(sampler2D sp, vec2 uv, vec2 scale) {
          vec3 col = vec3(0.0);
          float accum = 0.0;
          float weight;
          vec2 offset;
          
          for (int x = -samples / 2; x < samples / 2; ++x) {
            for (int y = -samples / 2; y < samples / 2; ++y) {
              offset = vec2(x, y);
              weight = gaussian(offset);
              col += texture2D(sp, uv + scale * offset).rgb * weight;
              accum += weight;
            }
          }
          
          return col / accum;
        }

        void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
          uv *= scale;
          vec2 mouse = u_mouse * scale;
          
          vec2 ps = vec2(1.0) / u_resolution.xy;
          vec2 sample = gl_FragCoord.xy / u_resolution.xy;
          vec2 o = mouse*.2+vec2(.65, .5);
          float d = .98;
          sample = d * (sample - o);
          sample += o;
          sample += vec2(sin((u_time+uv.y * .5)*10.)*.001, -.00);
          
          vec3 fragcolour;
          vec4 tex;
          
          if(u_renderpass) {
            tex = vec4(blur(u_buffer, sample, ps*blurStrength) * blurMultiplier, 1.);
            float df = length(mouse - uv);
            fragcolour = vec3( smoothstep( circleSize, 0., df ) );
          } else {
            tex = texture2D(u_buffer, sample, 2.) * .98;
            tex = vec4(
              smoothstep(0.0, threshold - fwidth(tex.x), tex.x),
              smoothstep(0.2, threshold - fwidth(tex.y) + .2, tex.y),
              smoothstep(-0.05, threshold - fwidth(tex.z) - .2, tex.z),
              1.);
            vec3 n = hash33(vec3(uv, u_time*.1));
            tex.rgb += n * .2 - .1;
          }

          gl_FragColor = vec4(fragcolour,1.0);
          gl_FragColor += tex;
        }
      `;

      function createNoiseTexture() {
        // Create a simple noise texture programmatically - reduced size for performance
        const size = 128; // Reduced from 256 to 128
        const data = new Uint8Array(size * size * 4);
        
        for (let i = 0; i < size * size; i++) {
          const stride = i * 4;
          const noise = Math.random();
          data[stride] = noise * 255;
          data[stride + 1] = Math.random() * 255;
          data[stride + 2] = Math.random() * 255;
          data[stride + 3] = 255;
        }
        
        const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.minFilter = THREE.LinearFilter;
        texture.needsUpdate = true;
        
        return texture;
      }

      function init() {
        camera = new THREE.Camera();
        camera.position.z = 1;

        scene = new THREE.Scene();

        const geometry = new THREE.PlaneBufferGeometry(2, 2);
        
        // Further reduce resolution for better performance
        const resolutionScale = Math.min(window.devicePixelRatio, 1) * 0.15; // Reduced from 0.2 to 0.15
        rtTexture = new THREE.WebGLRenderTarget(window.innerWidth * resolutionScale, window.innerHeight * resolutionScale);
        rtTexture2 = new THREE.WebGLRenderTarget(window.innerWidth * resolutionScale, window.innerHeight * resolutionScale);

        const noiseTexture = createNoiseTexture();

        uniforms = {
          u_time: { type: "f", value: 1.0 },
          u_resolution: { type: "v2", value: new THREE.Vector2() },
          u_noise: { type: "t", value: noiseTexture },
          u_buffer: { type: "t", value: rtTexture.texture },
          u_mouse: { type: "v2", value: new THREE.Vector2() },
          u_renderpass: { type: 'b', value: false }
        };

        const material = new THREE.ShaderMaterial({
          uniforms: uniforms,
          vertexShader: vertexShader,
          fragmentShader: fragmentShader
        });
        material.extensions.derivatives = true;

        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Cap pixel ratio for performance
        renderer.setClearColor(0x000000, 0); // Transparent background

        if (container) {
          container.appendChild(renderer.domElement);
        }

        onWindowResize();
        
        // Create event handlers that we can properly remove later
        resizeHandler = onWindowResize;
        
        // Throttled mouse handler for better performance
        let mouseThrottle = 0;
        mouseHandler = (e: PointerEvent) => {
          if (!container) return;
          // Throttle mouse updates to every 3rd frame (~20fps instead of 60fps)
          if (++mouseThrottle % 3 !== 0) return;
          
          const rect = container.getBoundingClientRect();
          const ratio = window.innerHeight / window.innerWidth;
          newmouse.x = ((e.clientX - rect.left) - window.innerWidth / 2) / window.innerWidth / ratio * 0.5;
          newmouse.y = ((e.clientY - rect.top) - window.innerHeight / 2) / window.innerHeight * -0.5;
        };

        window.addEventListener('resize', resizeHandler, false);
        document.addEventListener('pointermove', mouseHandler, { passive: true });
      }

      function onWindowResize() {
        if (renderer && uniforms) {
          // Scale down resolution on larger screens for better performance
          const scale = Math.min(1.0, 1200 / Math.max(window.innerWidth, window.innerHeight));
          const renderWidth = window.innerWidth * scale;
          const renderHeight = window.innerHeight * scale;
          
          renderer.setSize(renderWidth, renderHeight);
          renderer.domElement.style.width = window.innerWidth + 'px';
          renderer.domElement.style.height = window.innerHeight + 'px';
          uniforms.u_resolution.value.x = renderer.domElement.width;
          uniforms.u_resolution.value.y = renderer.domElement.height;
          
          rtTexture = new THREE.WebGLRenderTarget(window.innerWidth * 0.15, window.innerHeight * 0.15);
          rtTexture2 = new THREE.WebGLRenderTarget(window.innerWidth * 0.15, window.innerHeight * 0.15);
        }
      }

      function renderTexture() {
        const odims = uniforms.u_resolution.value.clone();
        uniforms.u_resolution.value.x = window.innerWidth * 0.15;
        uniforms.u_resolution.value.y = window.innerHeight * 0.15;

        uniforms.u_buffer.value = rtTexture2.texture;
        uniforms.u_renderpass.value = true;

        renderer.setRenderTarget(rtTexture);
        renderer.render(scene, camera, rtTexture, true);

        const buffer = rtTexture;
        rtTexture = rtTexture2;
        rtTexture2 = buffer;

        uniforms.u_buffer.value = rtTexture.texture;
        uniforms.u_resolution.value = odims;
        uniforms.u_renderpass.value = false;
      }

      function render() {
        uniforms.u_mouse.value.x += (newmouse.x - uniforms.u_mouse.value.x) * divisor;
        uniforms.u_mouse.value.y += (newmouse.y - uniforms.u_mouse.value.y) * divisor;
        
        uniforms.u_time.value = Date.now() * 0.0005;
        renderer.render(scene, camera);
        renderTexture();
      }

      function animate() {
        animationRef.current = requestAnimationFrame(animate);
        render();
      }

      init();
      animate();
    }

    function cleanup() {
      // Cancel animation frame
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = 0;
      }
      
      // Remove event listeners properly with error catching
      try {
        if (resizeHandler) {
          window.removeEventListener('resize', resizeHandler);
          resizeHandler = null;
        }
        if (mouseHandler) {
          document.removeEventListener('pointermove', mouseHandler);
          mouseHandler = null;
        }
      } catch (e) {
        // Silently catch any event listener removal errors
      }
      
      // Clean up Three.js objects and DOM
      try {
        if (container && container.firstChild) {
          container.removeChild(container.firstChild);
        }
      } catch (e) {
        // Silently catch DOM manipulation errors
      }
      
      // Clean up Three.js resources
      try {
        if (renderer) {
          renderer.dispose();
          renderer = null;
        }
        if (rtTexture) {
          rtTexture.dispose();
          rtTexture = null;
        }
        if (rtTexture2) {
          rtTexture2.dispose();
          rtTexture2 = null;
        }
      } catch (e) {
        // Silently catch Three.js disposal errors
      }
    }

    // Use setTimeout to ensure cleanup happens after any pending browser operations
    return () => {
      setTimeout(cleanup, 0);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 2,
        opacity: 0.6, // Subtle overlay effect
        mixBlendMode: 'screen' // Blend with background
      }}
    />
  );
};

export default FluidEffect;