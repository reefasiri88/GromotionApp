/**
 * Native AR Engine for GroMotion
 * Provides real AR functionality using device camera and sensors
 */

export interface ARConfig {
  enableCamera: boolean;
  enableLocation: boolean;
  enablePlaneDetection: boolean;
  enableHitTesting: boolean;
}

export interface ARPoint {
  x: number;
  y: number;
  z: number;
  latitude?: number;
  longitude?: number;
}

export interface ARCoin {
  id: string;
  position: ARPoint;
  collected: boolean;
  value: number;
}

export interface ARPath {
  points: ARPoint[];
  width: number;
  color: string;
}

export interface ARHitTestResult {
  hit: boolean;
  position?: ARPoint;
  distance?: number;
}

class AREngine {
  private isInitialized = false;
  private cameraStream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private canvasElement: HTMLCanvasElement | null = null;
  private glContext: WebGLRenderingContext | null = null;
  private coins: ARCoin[] = [];
  private userPosition: ARPoint = { x: 0, y: 0, z: 0 };
  private userHeading = 0;
  private arPath: ARPath | null = null;
  private animationFrameId: number | null = null;
  private onCoinCollectedCallback: ((coin: ARCoin) => void) | null = null;
  private onQuizTriggeredCallback: (() => void) | null = null;

  async initialize(config: ARConfig): Promise<boolean> {
    try {
      if (config.enableCamera) {
        await this.initializeCamera();
      }
      
      if (config.enableLocation) {
        await this.initializeLocation();
      }
      
      this.initializeCanvas();
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('AR Engine initialization failed:', error);
      return false;
    }
  }

  private async initializeCamera(): Promise<void> {
    try {
      this.cameraStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      this.videoElement = document.createElement('video');
      this.videoElement.srcObject = this.cameraStream;
      this.videoElement.playsInline = true;
      this.videoElement.muted = true;
      
      await this.videoElement.play();
    } catch (error) {
      console.error('Camera initialization failed:', error);
      throw error;
    }
  }

  private async initializeLocation(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userPosition = {
            x: 0,
            y: 0,
            z: 0,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          resolve();
        },
        (error) => {
          console.error('Location initialization failed:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );

      // Watch for location updates
      navigator.geolocation.watchPosition(
        (position) => {
          this.userPosition = {
            x: 0,
            y: 0,
            z: 0,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
        },
        (error) => {
          console.error('Location update failed:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    });
  }

  private initializeCanvas(): void {
    this.canvasElement = document.createElement('canvas');
    this.canvasElement.style.position = 'absolute';
    this.canvasElement.style.top = '0';
    this.canvasElement.style.left = '0';
    this.canvasElement.style.width = '100%';
    this.canvasElement.style.height = '100%';
    this.canvasElement.style.pointerEvents = 'none';
    
    const gl = this.canvasElement.getContext('webgl2') || this.canvasElement.getContext('webgl');
    if (!gl) {
      throw new Error('WebGL not supported');
    }
    this.glContext = gl;
  }

  startARSession(container: HTMLElement): void {
    if (!this.isInitialized) {
      throw new Error('AR Engine not initialized');
    }

    // Add video element as background
    if (this.videoElement) {
      this.videoElement.style.position = 'absolute';
      this.videoElement.style.top = '0';
      this.videoElement.style.left = '0';
      this.videoElement.style.width = '100%';
      this.videoElement.style.height = '100%';
      this.videoElement.style.objectFit = 'cover';
      container.appendChild(this.videoElement);
    }

    // Add canvas for AR overlays
    if (this.canvasElement) {
      container.appendChild(this.canvasElement);
    }

    this.startRenderLoop();
  }

  private startRenderLoop(): void {
    const render = () => {
      this.renderARScene();
      this.checkCoinCollisions();
      this.animationFrameId = requestAnimationFrame(render);
    };
    render();
  }

  private renderARScene(): void {
    if (!this.canvasElement || !this.glContext) return;

    const gl = this.glContext;
    const canvas = this.canvasElement;
    
    // Set canvas size to match display size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Render AR path
    if (this.arPath) {
      this.renderARPath();
    }

    // Render coins
    this.renderCoins();
  }

  private renderARPath(): void {
    if (!this.arPath || !this.glContext) return;

    const gl = this.glContext;
    
    // Simple path rendering using basic shapes
    // In a real implementation, this would use proper 3D rendering
    const pathGeometry = this.createPathGeometry(this.arPath);
    
    // Set up basic rendering state
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    
    // Render path lanes
    this.renderPathLanes(pathGeometry);
    
    // Render arrows
    this.renderPathArrows(pathGeometry);
  }

  private createPathGeometry(path: ARPath): Float32Array {
    const vertices: number[] = [];
    const width = path.width;
    
    // Create simple straight path for now
    const length = 10; // 10 meters ahead
    const segments = 50;
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const z = -t * length; // Negative Z goes forward in camera space
      
      // Left lane
      vertices.push(-width/2, 0, z);
      // Right lane
      vertices.push(width/2, 0, z);
    }
    
    return new Float32Array(vertices);
  }

  private renderPathLanes(geometry: Float32Array): void {
    if (!this.glContext) return;
    
    const gl = this.glContext;
    
    // Simple lane rendering (green color)
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    
    // Left lane
    this.renderLane(geometry, 0, 0.2, [0.0, 0.8, 0.0, 0.8]); // Green
    
    // Right lane  
    this.renderLane(geometry, 1, 0.2, [0.0, 0.6, 0.0, 0.8]); // Darker green
  }

  private renderLane(geometry: Float32Array, offset: number, width: number, color: number[]): void {
    // Simplified lane rendering
    // In a real implementation, this would use proper vertex buffers and shaders
    const canvas = this.canvasElement;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.save();
    ctx.fillStyle = `rgba(${color[0] * 255}, ${color[1] * 255}, ${color[2] * 255}, ${color[3]})`;
    
    // Convert 3D path to 2D screen coordinates
    const centerX = canvas.width / 2;
    const centerY = canvas.height * 0.7; // Path starts 70% down the screen
    
    // Draw lane as a perspective-correct rectangle
    const laneWidth = width * canvas.width;
    const laneLength = canvas.height * 0.5;
    
    ctx.beginPath();
    ctx.moveTo(centerX - laneWidth/2 + offset * laneWidth, centerY);
    ctx.lineTo(centerX - laneWidth/4 + offset * laneWidth, centerY - laneLength);
    ctx.lineTo(centerX + laneWidth/4 + offset * laneWidth, centerY - laneLength);
    ctx.lineTo(centerX + laneWidth/2 + offset * laneWidth, centerY);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
  }

  private renderPathArrows(pathGeometry: Float32Array): void {
    if (!this.canvasElement) return;
    
    const canvas = this.canvasElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    
    // Draw arrows along the path
    for (let i = 0; i < 5; i++) {
      const y = canvas.height * 0.7 - (i * canvas.height * 0.1);
      const x = canvas.width / 2;
      
      // Draw arrow pointing forward
      ctx.beginPath();
      ctx.moveTo(x, y - 10);
      ctx.lineTo(x - 8, y + 5);
      ctx.lineTo(x + 8, y + 5);
      ctx.closePath();
      ctx.fill();
    }
    
    ctx.restore();
  }

  private renderCoins(): void {
    if (!this.canvasElement) return;
    
    const canvas = this.canvasElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    this.coins.forEach(coin => {
      if (!coin.collected) {
        this.renderCoin(coin);
      }
    });
  }

  private renderCoin(coin: ARCoin): void {
    if (!this.canvasElement) return;
    
    const canvas = this.canvasElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Convert 3D position to 2D screen coordinates
    const screenPos = this.worldToScreen(coin.position);
    
    ctx.save();
    
    // Add pulsing animation to coins
    const time = Date.now() / 1000;
    const pulse = Math.sin(time * 2 + coin.position.z) * 0.1 + 1;
    
    // Coin gradient with glow effect
    const gradient = ctx.createRadialGradient(
      screenPos.x, screenPos.y, 0,
      screenPos.x, screenPos.y, 20 * pulse
    );
    gradient.addColorStop(0, '#FFD700');
    gradient.addColorStop(0.7, '#FFA500');
    gradient.addColorStop(1, 'rgba(255, 165, 0, 0.2)');
    
    // Draw outer glow
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, 25 * pulse, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
    ctx.fill();
    
    // Draw main coin
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, 15 * pulse, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Coin border with glow
    ctx.strokeStyle = '#FF8C00';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 10;
    ctx.stroke();
    
    // Reset shadow
    ctx.shadowBlur = 0;
    
    // Lightning bolt icon
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('⚡', screenPos.x, screenPos.y + 5);
    
    ctx.restore();
  }

  private worldToScreen(worldPos: ARPoint): { x: number; y: number } {
    if (!this.canvasElement) return { x: 0, y: 0 };
    
    const canvas = this.canvasElement;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Simple perspective projection
    const distance = Math.abs(worldPos.z) + 1; // Avoid division by zero
    const scale = 100 / distance; // 100 pixels per meter at 1 meter distance
    
    return {
      x: centerX + worldPos.x * scale,
      y: centerY - worldPos.y * scale // Y is inverted in screen coordinates
    };
  }

  private checkCoinCollisions(): void {
    this.coins.forEach(coin => {
      if (!coin.collected && this.isCoinCollected(coin)) {
        coin.collected = true;
        if (this.onCoinCollectedCallback) {
          this.onCoinCollectedCallback(coin);
        }
        
        // Check if we should trigger quiz
        const collectedCoins = this.coins.filter(c => c.collected).length;
        if (collectedCoins % 5 === 0 && this.onQuizTriggeredCallback) {
          this.onQuizTriggeredCallback();
        }
      }
    });
  }

  private isCoinCollected(coin: ARCoin): boolean {
    // Simple distance-based collision detection
    const distance = Math.sqrt(
      Math.pow(coin.position.x - this.userPosition.x, 2) +
      Math.pow(coin.position.y - this.userPosition.y, 2) +
      Math.pow(coin.position.z - this.userPosition.z, 2)
    );
    
    return distance < 0.5; // 0.5 meter collection radius
  }

  // Public API methods
  setARPath(path: ARPath): void {
    this.arPath = path;
  }

  spawnCoins(count: number, spacing: number = 2): void {
    this.coins = [];
    
    for (let i = 0; i < count; i++) {
      const coin: ARCoin = {
        id: `coin-${i}`,
        position: {
          x: (Math.random() - 0.5) * 2, // Random X offset within 2 meters
          y: 0, // On ground level
          z: -i * spacing // Spaced along the path
        },
        collected: false,
        value: 1
      };
      
      this.coins.push(coin);
    }
  }

  onCoinCollected(callback: (coin: ARCoin) => void): void {
    this.onCoinCollectedCallback = callback;
  }

  onQuizTriggered(callback: () => void): void {
    this.onQuizTriggeredCallback = callback;
  }

  getUserPosition(): ARPoint {
    return { ...this.userPosition };
  }

  getUserHeading(): number {
    return this.userHeading;
  }

  stopARSession(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach(track => track.stop());
      this.cameraStream = null;
    }

    if (this.videoElement && this.videoElement.parentNode) {
      this.videoElement.parentNode.removeChild(this.videoElement);
    }

    if (this.canvasElement && this.canvasElement.parentNode) {
      this.canvasElement.parentNode.removeChild(this.canvasElement);
    }
  }
}

// Export singleton instance
export const arEngine = new AREngine();