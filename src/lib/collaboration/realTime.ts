
export interface CodeUpdate {
    path: string;
    content: string;
    changeType: 'insert' | 'delete' | 'replace';
}

export class RealTimeCollaboration {
  private socket: WebSocket | null = null;
  private callbacks: Record<string, Function[]> = {};
   
  async joinRealRoom(userId: string, projectId: string): Promise<void> { 
    if (typeof window === 'undefined') return;

    // Real WebSocket connection (Replace with your actual WS server URL)
    // For now, we point to a generic echo server or localhost if running locally
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || `ws://${window.location.host}/api/collab`;
    
    this.socket = new WebSocket(`${wsUrl}?userId=${userId}&projectId=${projectId}`); 
     
    this.socket.onopen = () => {
        console.log("[COLLAB] Connected to Real-time Server");
    };

    this.socket.onmessage = (event) => { 
      try {
          const data = JSON.parse(event.data); 
          this.emit(data.type, data);
      } catch (e) {
          console.error("Failed to parse WS message", e);
      }
    }; 
  } 
   
  async sendRealUpdate(userId: string, update: CodeUpdate): Promise<void> { 
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ 
            type: 'code_update', 
            userId, 
            update, 
            timestamp: Date.now() 
        })); 
    }
  } 

  on(event: string, callback: Function) {
      if (!this.callbacks[event]) this.callbacks[event] = [];
      this.callbacks[event].push(callback);
  }

  private emit(event: string, data: any) {
      if (this.callbacks[event]) {
          this.callbacks[event].forEach(cb => cb(data));
      }
  }
}
