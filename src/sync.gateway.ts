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
import { JwtService } from '@nestjs/jwt';
import { UserService } from './user/user.service';
import { ShopService } from './shop/shop.service';
import { Shop } from './shop/shop.entity';
import { User } from './user/user.entity';
@WebSocketGateway({ cors: { origin: '*' } })
@Injectable()
export class SyncGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly productService: ProductService,
    private readonly purchaseService: PurchaseService,
    private readonly saleService: SaleService,
    private readonly bulksaleService: BulksaleService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly shopService: ShopService,
  ) {}

  async handleAction(action: any, user: User, shop: Shop) {
    const id = `${shop.id}-${action.payload.id}`;
    action.payload.id = id;
    action.payload.shopId = shop.id;
    switch (action.entity) {
      case 'product':
        switch (action.type) {
          case 'create':
            return await this.productService.create({
              ...action.payload,
              shopId: shop.id,
            });
          case 'update':
            return await this.productService.update(
              action.payload.id,
              action.payload,
            );
          case 'delete':
            return await this.productService.remove(action.payload.id);
        }
        break;
      case 'purchase':
        switch (action.type) {
          case 'create':
            return await this.purchaseService.create({
              ...action.payload,
              shopId: shop.id,
            });
          case 'update':
            return await this.purchaseService.update(
              action.payload.id,
              action.payload,
            );
          case 'delete':
            return await this.purchaseService.remove(action.payload.id);
        }
        break;
      case 'sale':
        switch (action.type) {
          case 'create':
            return await this.saleService.create(action.payload);
          case 'update':
            return await this.saleService.update(
              action.payload.id,
              action.payload,
            );
          case 'delete':
            return await this.saleService.remove(action.payload.id);
        }
        break;
      case 'bulksale':
        switch (action.type) {
          case 'create':
            return await this.bulksaleService.create({
              ...action.payload,
              shopId: shop.id,
            });
          case 'update':
            return await this.bulksaleService.update(
              action.payload.id,
              action.payload,
            );
          case 'delete':
            return await this.bulksaleService.remove(action.payload.id);
        }
        break;
      case 'bulkpurchase':
        switch (action.type) {
          case 'create':
            return await this.purchaseService.create(action.payload);
          case 'update':
            return await this.purchaseService.update(
              action.payload.id,
              action.payload,
            );
          case 'delete':
            return await this.purchaseService.remove(action.payload.id);
        }
        break;
    }
  }

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

  async getUserAndShop(token: string) {
    const decoded = this.jwtService.verify(token);
    const user = await this.userService.findByEmail(decoded.email);
    if (!user) {
      throw new Error('User not found');
    }
    const shop = await this.shopService.findByOwnerId(user.id);
    if (!shop) {
      throw new Error('Shop not found');
    }
    return { user, shop };
  }

  @SubscribeMessage('action')
  async handleActionMessage(
    @MessageBody() data: { action: any },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const token = client.handshake.auth.token; // Access the token here
      if (token) {
        const { user, shop } = await this.getUserAndShop(token);
        const result = await this.handleAction(data.action, user, shop);
        return { status: 'ok', result };
      } else {
        client.disconnect(true);
        console.log('Client connected without a token:', client.id);
        return { status: 'error', result: null };
      }
    } catch (error) {
      console.log(error, 'error socket');
      return { status: 'error', result: null };
    }
  }

  // on client connect
  onConnect(client: Socket) {
    console.log('Client connected');
    client.emit('sync', { status: 'ok', results: [] });
  }

  onDisconnect(client: Socket) {
    console.log('Client disconnected');
  }

  @SubscribeMessage('connect-message')
  handleConnect(
    @MessageBody() data: { actions: any[] },
    @ConnectedSocket() client: Socket,
  ) {
    console.log('Client connected');
    client.emit('sync', { status: 'ok', results: [] });
  }
}
