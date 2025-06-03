import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

import { TaskStatusResponseDto } from '../dtos';

interface WsResponse {
  event: string;
  data: {
    taskId: string;
  };
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'tasks',
})
export class TaskStatusGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TaskStatusGateway.name);
  private readonly taskSubscriptions = new Map<string, Set<string>>();

  handleConnection(client: Socket): void {
    this.logger.debug(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.debug(`Client disconnected: ${client.id}`);

    for (const [taskId, subscribers] of this.taskSubscriptions.entries()) {
      subscribers.delete(client.id);
      if (subscribers.size === 0) {
        this.taskSubscriptions.delete(taskId);
        this.logger.debug(`Removed empty subscription for task ${taskId}`);
      }
    }
  }

  @SubscribeMessage('subscribeToTask')
  handleSubscribeToTask(client: Socket, taskId: string): WsResponse {
    this.logger.debug(`Client ${client.id} subscribed to task ${taskId}`);
    if (!this.taskSubscriptions.has(taskId)) {
      this.taskSubscriptions.set(taskId, new Set());
    }
    this.taskSubscriptions.get(taskId)?.add(client.id);
    return { event: 'subscribed', data: { taskId } };
  }

  @SubscribeMessage('unsubscribeFromTask')
  handleUnsubscribeFromTask(client: Socket, taskId: string): WsResponse {
    this.logger.debug(`Client ${client.id} unsubscribed from task ${taskId}`);
    const subscribers = this.taskSubscriptions.get(taskId);

    if (subscribers) {
      subscribers.delete(client.id);
      if (subscribers.size === 0) {
        this.taskSubscriptions.delete(taskId);
        this.logger.debug(`Removed empty subscription for task ${taskId}`);
      }
    }

    return { event: 'unsubscribed', data: { taskId } };
  }

  notifyTaskStatusUpdate(taskId: string, status: TaskStatusResponseDto): void {
    const subscribers = this.taskSubscriptions.get(taskId);
    if (subscribers && subscribers.size > 0) {
      const clientIds = Array.from(subscribers);
      this.logger.debug(`Notifying ${clientIds.length} clients about task ${taskId} status update`);
      this.server.to(clientIds).emit('taskStatusUpdate', {
        taskId,
        ...status,
      });
    }
  }
}
