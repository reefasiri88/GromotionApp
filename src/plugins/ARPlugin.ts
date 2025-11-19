import { WebPlugin } from '@capacitor/core';
import type { CapacitorPlugin } from '@capacitor/core';

export interface ARPluginInterface {
  attachViewBehindWebView(): Promise<void>;
  detachView(): Promise<void>;
  startSession(options: { worldTracking: boolean; planeDetection: boolean; lightEstimation: boolean }): Promise<void>;
  stopSession(): Promise<void>;
  addAnchor(options: { position: { x: number; y: number; z: number }; attachToPlane?: boolean }): Promise<{ anchorId: string }>;
  removeAnchor(options: { anchorId: string }): Promise<void>;
  loadModel(options: { uri: string }): Promise<{ modelId: string }>;
  attachModelToAnchor(options: { anchorId: string; modelId: string; scale?: number; rotationEuler?: { x: number; y: number; z: number } }): Promise<{ modelId: string }>;
  removeModel(options: { modelId: string }): Promise<void>;
  animateModel(options: { modelId: string; type: string; durationMs: number }): Promise<void>;
  drawPath(options: { points: { x: number; y: number; z: number }[]; color: string; width: number; opacity: number }): Promise<void>;
  onFrame(callback: (frame: any) => void): Promise<{ id: string }>;
  removeFrameSubscription(options: { id: string }): Promise<void>;
  getCameraPose(): Promise<{ position: { x: number; y: number; z: number }; rotation: { x: number; y: number; z: number; w: number } }>;
}

export class ARPluginWeb extends WebPlugin implements ARPluginInterface {
  async attachViewBehindWebView(): Promise<void> {
    throw this.unimplemented('Not implemented on web');
  }
  
  async detachView(): Promise<void> {
    throw this.unimplemented('Not implemented on web');
  }
  
  async startSession(): Promise<void> {
    throw this.unimplemented('Not implemented on web');
  }
  
  async stopSession(): Promise<void> {
    throw this.unimplemented('Not implemented on web');
  }
  
  async addAnchor(): Promise<{ anchorId: string }> {
    throw this.unimplemented('Not implemented on web');
  }
  
  async loadModel(): Promise<{ modelId: string }> {
    throw this.unimplemented('Not implemented on web');
  }
  
  async attachModelToAnchor(): Promise<{ modelId: string }> {
    throw this.unimplemented('Not implemented on web');
  }
  
  async removeModel(): Promise<void> {
    throw this.unimplemented('Not implemented on web');
  }
  
  async animateModel(): Promise<void> {
    throw this.unimplemented('Not implemented on web');
  }
  
  async drawPath(): Promise<void> {
    throw this.unimplemented('Not implemented on web');
  }
  
  async onFrame(): Promise<{ id: string }> {
    throw this.unimplemented('Not implemented on web');
  }
  
  async removeFrameSubscription(): Promise<void> {
    throw this.unimplemented('Not implemented on web');
  }
  
  async getCameraPose(): Promise<{ position: { x: number; y: number; z: number }; rotation: { x: number; y: number; z: number; w: number } }> {
    throw this.unimplemented('Not implemented on web');
  }
  
  async removeAnchor(): Promise<void> {
    throw this.unimplemented('Not implemented on web');
  }
}

const AR = new ARPluginWeb();

export { AR };