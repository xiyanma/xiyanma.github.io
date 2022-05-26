declare class SocketManager {
  socket: any;
  responseMap: {
    [key: string]: {
      resolve: (value: unknown) => void;
      reject: (value: unknown) => void;
      data?: any;
    };
  };
  constructor(socket: any);
  send(data: any): Promise<unknown>;
  listening(data: { port: any }): void;
  disconnect(): void;
}
export default SocketManager;
