/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ProductService } from './product/product.service';
import { PurchaseService } from './purchase/purchase.service';
import { SaleService } from './sale/sale.service';
import { BulksaleService } from './bulksale/bulksale.service';
import { Injectable } from '@nestjs/common';

@WebSocketGateway({ cors: true })
@Injectable()
export class SyncGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly productService: ProductService,
    private readonly purchaseService: PurchaseService,
    private readonly saleService: SaleService,
    private readonly bulksaleService: BulksaleService,
  ) {}

  @SubscribeMessage('sync')
  async handleSync(
    @MessageBody() data: { actions: any[] },
    @ConnectedSocket() client: Socket,
  ) {
    const results: { action: any; result: any; error: any }[] = [];
    for (const action of data.actions) {
      try {
        let result;
        switch (action.entity) {
          case 'product':
            switch (action.type) {
              case 'create':
                result = await this.productService.create(action.payload);
                break;
              case 'update':
                result = await this.productService.update(
                  action.payload.id,
                  action.payload,
                );
                break;
              case 'delete':
                result = await this.productService.remove(action.payload.id);
                break;
            }
            break;
          case 'purchase':
            switch (action.type) {
              case 'create':
                result = await this.purchaseService.create(action.payload);
                break;
              case 'update':
                result = await this.purchaseService.update(
                  action.payload.id,
                  action.payload,
                );
                break;
              case 'delete':
                result = await this.purchaseService.remove(action.payload.id);
                break;
            }
            break;
          case 'sale':
            switch (action.type) {
              case 'create':
                result = await this.saleService.create(action.payload);
                break;
              case 'update':
                result = await this.saleService.update(
                  action.payload.id,
                  action.payload,
                );
                break;
              case 'delete':
                result = await this.saleService.remove(action.payload.id);
                break;
            }
            break;
          case 'bulksale':
            switch (action.type) {
              case 'create':
                result = await this.bulksaleService.create(action.payload);
                break;
              case 'update':
                result = await this.bulksaleService.update(
                  action.payload.id,
                  action.payload,
                );
                break;
              case 'delete':
                result = await this.bulksaleService.remove(action.payload.id);
                break;
            }
            break;
          default:
            result = { error: 'Unknown entity' };
        }
        results.push({ action, result, error: null });
      } catch (error) {
        results.push({ action, result: null, error: error.message });
      }
    }
    client.emit('sync', { status: 'ok', results });
  }
}
