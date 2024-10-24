import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Order from '../model/orderModel.js';
import { isAuth, isAdmin } from '../utils.js';
import User from '../model/userModel.js';
import Product from '../model/productModel.js';




const orderRouter = express.Router();

orderRouter.get(
  '/',
  isAuth,
  isAdmin,
async (req, res) => {
    const orders = await Order.find().populate('user', 'name');
    res.send(orders);
  }
);

orderRouter.post(
  '/',
  isAuth,
async (req, res) => {
    const newOrder = new Order({
      orderItems: req.body.orderItems.map((x) => ({ ...x, product: x._id })),
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod,
      itemsPrice: req.body.itemsPrice,
      shippingPrice: req.body.shippingPrice,
      taxPrice: req.body.taxPrice,
      totalPrice: req.body.totalPrice,
      user: req.user._id,
    });

    const order = await newOrder.save();
    res.status(201).send({ message: 'New Order Created', order });
  }
);

orderRouter.get(
  '/summary',
  isAuth,
  isAdmin,
  (async (req, res) => {
    const orders = await Order.find();
    const users = await User.find();
    const products = await Product.find();
    res.send({ users, orders, products });
  })
);


orderRouter.get(
  '/mine',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.send(orders);
  })
);


orderRouter.get(
  '/:id',
  isAuth,
async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      res.send(order);
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  }
);

orderRouter.put(
  '/:id/pay',
  async (req, res) => {
    const order = await Order.findById(req.params.id)
    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();

      const updatedOrder = await order.save();

      res.send({ message: 'Order Paid', order: updatedOrder });
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  }
);



orderRouter.put(
  '/:id/deliver',
  isAuth,
async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      await order.save();
      res.send({ message: 'Order Delivered' });
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  }
);


orderRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      await order.remove();
      res.send({ message: 'Order Deleted' });
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  }
);

export default orderRouter;