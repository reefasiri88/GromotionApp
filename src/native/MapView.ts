/**
 * Native MapView Module for GroMotion
 * Provides real GPS mapping functionality
 */

export interface MapPoint {
  latitude: number;
  longitude: number;
  altitude?: number;
}

export interface MapRoute {
  points: MapPoint[];
  color: string;
  width: number;
}

export interface MapMarker {
  id: string;
  position: MapPoint;
  title?: string;
  icon?: string;
  color?: string;
}

export interface MapConfig {
  center: MapPoint;
  zoom: number;
  showUserLocation: boolean;
  showCompass: boolean;
  showScale: boolean;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

class MapViewEngine {
  private mapContainer: HTMLElement | null = null;
  private userLocation: MapPoint | null = null;
  private userLocationMarker: MapMarker | null = null;
  private routes: MapRoute[] = [];
  private markers: MapMarker[] = [];
  private watchId: number | null = null;
  private onLocationUpdateCallback: ((location: MapPoint) => void) | null = null;
  private onMapClickCallback: ((point: MapPoint) => void) | null = null;
  private isInitialized = false;

  async initialize(config: MapConfig): Promise<boolean> {
    try {
      // Initialize user location
      await this.initializeLocation();
      
      // Set up location tracking
      this.startLocationTracking();
      
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('MapView initialization failed:', error);
      return false;
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
          this.userLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            altitude: position.coords.altitude || undefined
          };
          
          this.userLocationMarker = {
            id: 'user-location',
            position: this.userLocation,
            title: 'Your Location',
            color: '#00ff00'
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
    });
  }

  private startLocationTracking(): void {
    if (!navigator.geolocation) return;

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation: MapPoint = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          altitude: position.coords.altitude || undefined
        };
        
        this.userLocation = newLocation;
        
        if (this.userLocationMarker) {
          this.userLocationMarker.position = newLocation;
        }
        
        if (this.onLocationUpdateCallback) {
          this.onLocationUpdateCallback(newLocation);
        }
        
        // Update map center to follow user
        if (this.mapContainer) {
          this.renderMap();
        }
      },
      (error) => {
        console.error('Location tracking failed:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  }

  renderMap(container?: HTMLElement): void {
    if (container) {
      this.mapContainer = container;
    }
    
    if (!this.mapContainer || !this.userLocation) return;

    // Create map canvas if it doesn't exist
    let mapCanvas = this.mapContainer.querySelector('canvas') as HTMLCanvasElement;
    if (!mapCanvas) {
      mapCanvas = document.createElement('canvas');
      mapCanvas.style.width = '100%';
      mapCanvas.style.height = '100%';
      mapCanvas.style.position = 'absolute';
      mapCanvas.style.top = '0';
      mapCanvas.style.left = '0';
      this.mapContainer.appendChild(mapCanvas);
    }

    // Set canvas size
    const rect = this.mapContainer.getBoundingClientRect();
    mapCanvas.width = rect.width * window.devicePixelRatio;
    mapCanvas.height = rect.height * window.devicePixelRatio;

    const ctx = mapCanvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);

    // Render map background (simplified street map)
    this.renderMapBackground(ctx, mapCanvas.width, mapCanvas.height);
    
    // Render routes
    this.renderRoutes(ctx, mapCanvas.width, mapCanvas.height);
    
    // Render markers
    this.renderMarkers(ctx, mapCanvas.width, mapCanvas.height);
    
    // Render user location
    if (this.userLocationMarker) {
      this.renderUserLocation(ctx, mapCanvas.width, mapCanvas.height);
    }
  }

  private renderMapBackground(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    // Simplified street map background
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, width, height);
    
    // Draw grid lines to simulate streets
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    
    const gridSize = 50;
    for (let x = 0; x <= width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }

  private renderRoutes(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    if (!this.userLocation) return;

    this.routes.forEach(route => {
      ctx.strokeStyle = route.color;
      ctx.lineWidth = route.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.beginPath();
      
      route.points.forEach((point, index) => {
        const screenPos = this.latLngToScreen(point, width, height);
        
        if (index === 0) {
          ctx.moveTo(screenPos.x, screenPos.y);
        } else {
          ctx.lineTo(screenPos.x, screenPos.y);
        }
      });
      
      ctx.stroke();
    });
  }

  private renderMarkers(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    this.markers.forEach(marker => {
      const screenPos = this.latLngToScreen(marker.position, width, height);
      
      // Draw marker pin
      ctx.fillStyle = marker.color || '#ff0000';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      
      // Marker body
      ctx.beginPath();
      ctx.arc(screenPos.x, screenPos.y - 10, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Marker pointer
      ctx.beginPath();
      ctx.moveTo(screenPos.x, screenPos.y);
      ctx.lineTo(screenPos.x - 6, screenPos.y - 10);
      ctx.lineTo(screenPos.x + 6, screenPos.y - 10);
      ctx.closePath();
      ctx.fill();
      
      // Marker title
      if (marker.title) {
        ctx.fillStyle = '#333333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(marker.title, screenPos.x, screenPos.y + 20);
      }
    });
  }

  private renderUserLocation(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    if (!this.userLocationMarker) return;
    
    const screenPos = this.latLngToScreen(this.userLocationMarker.position, width, height);
    
    // Draw pulsing user location marker
    const time = Date.now() / 1000;
    const pulseRadius = 15 + Math.sin(time * 3) * 5;
    
    // Outer pulse
    ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, pulseRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Inner dot
    ctx.fillStyle = '#00ff00';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  private latLngToScreen(point: MapPoint, width: number, height: number): { x: number; y: number } {
    if (!this.userLocation) return { x: width / 2, y: height / 2 };
    
    // Simple mercator projection (simplified for demo)
    const scale = 1000; // pixels per degree at current zoom
    const centerX = width / 2;
    const centerY = height / 2;
    
    const deltaLat = point.latitude - this.userLocation.latitude;
    const deltaLng = point.longitude - this.userLocation.longitude;
    
    // Convert to screen coordinates (Y is inverted for screen)
    const x = centerX + (deltaLng * scale);
    const y = centerY - (deltaLat * scale * Math.cos(this.userLocation.latitude * Math.PI / 180));
    
    return { x, y };
  }

  // Public API methods
  addRoute(route: MapRoute): void {
    this.routes.push(route);
    if (this.mapContainer) {
      this.renderMap();
    }
  }

  addMarker(marker: MapMarker): void {
    this.markers.push(marker);
    if (this.mapContainer) {
      this.renderMap();
    }
  }

  removeMarker(markerId: string): void {
    this.markers = this.markers.filter(m => m.id !== markerId);
    if (this.mapContainer) {
      this.renderMap();
    }
  }

  clearRoutes(): void {
    this.routes = [];
    if (this.mapContainer) {
      this.renderMap();
    }
  }

  clearMarkers(): void {
    this.markers = [];
    if (this.mapContainer) {
      this.renderMap();
    }
  }

  getUserLocation(): MapPoint | null {
    return this.userLocation ? { ...this.userLocation } : null;
  }

  onLocationUpdate(callback: (location: MapPoint) => void): void {
    this.onLocationUpdateCallback = callback;
  }

  onMapClick(callback: (point: MapPoint) => void): void {
    this.onMapClickCallback = callback;
    
    if (this.mapContainer) {
      this.mapContainer.addEventListener('click', (event) => {
        const rect = this.mapContainer!.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Convert screen coordinates back to lat/lng
        if (this.userLocation && this.onMapClickCallback) {
          const point = this.screenToLatLng(x, y, rect.width, rect.height);
          this.onMapClickCallback(point);
        }
      });
    }
  }

  private screenToLatLng(x: number, y: number, width: number, height: number): MapPoint {
    if (!this.userLocation) return { latitude: 0, longitude: 0 };
    
    const scale = 1000; // pixels per degree
    const centerX = width / 2;
    const centerY = height / 2;
    
    const deltaX = x - centerX;
    const deltaY = centerY - y; // Invert Y for lat/lng
    
    const deltaLng = deltaX / scale;
    const deltaLat = deltaY / (scale * Math.cos(this.userLocation.latitude * Math.PI / 180));
    
    return {
      latitude: this.userLocation.latitude + deltaLat,
      longitude: this.userLocation.longitude + deltaLng
    };
  }

  getMapBounds(): MapBounds | null {
    if (!this.userLocation || !this.mapContainer) return null;
    
    const rect = this.mapContainer.getBoundingClientRect();
    const scale = 1000; // pixels per degree
    
    const centerLat = this.userLocation.latitude;
    const centerLng = this.userLocation.longitude;
    
    const deltaLat = (rect.height / 2) / (scale * Math.cos(centerLat * Math.PI / 180));
    const deltaLng = (rect.width / 2) / scale;
    
    return {
      north: centerLat + deltaLat,
      south: centerLat - deltaLat,
      east: centerLng + deltaLng,
      west: centerLng - deltaLng
    };
  }

  destroy(): void {
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    
    if (this.mapContainer) {
      const canvas = this.mapContainer.querySelector('canvas');
      if (canvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    }
    
    this.mapContainer = null;
    this.isInitialized = false;
  }
}

// Export singleton instance
export const mapViewEngine = new MapViewEngine();