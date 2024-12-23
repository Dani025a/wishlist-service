// src/test/UnitTest/controllers/wishlistController.test.ts

import { addToWishlist } from '../../../controllers/wishlistController';
import { Request, Response } from 'express';
import { prisma } from '../../../models';
import { MESSAGES } from '../../../utils/messages';

// Mock the prisma client
jest.mock('../../../models/index');

describe('Wishlist Controller - addToWishlist', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    res = {
      status: statusMock,
    };
    req = {
      body: {},
      user: { userId: "user123" },
    } as Partial<Request>;
    jest.clearAllMocks();
  });

  it('should return 400 if product is missing', async () => {
    req.body = {};

    await addToWishlist(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid product or missing product ID' });
  });

  it('should return 200 if product already exists in wishlist', async () => {
    const product = { id: 1, name: 'Product 1' };
    req.body = { product };

    (prisma.wishlist.findUnique as jest.Mock).mockResolvedValue({
      userId: 'user123',
      products: [{ product }],
    });

    await addToWishlist(req as Request, res as Response);

    expect(prisma.wishlist.findUnique).toHaveBeenCalledWith({
      where: { userId: 'user123' },
    });
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({ error: MESSAGES.WISHLIST_ALREADY_EXISTS });
  });

  it('should add product to existing wishlist and return 200', async () => {
    const product = { id: 2, name: 'Product 2' };
    req.body = { product };

    const existingWishlist = {
      userId: 'user123',
      products: [{ product: { id: 1, name: 'Product 1' } }],
    };

    const updatedWishlist = {
      ...existingWishlist,
      products: [...existingWishlist.products, { product }],
    };

    (prisma.wishlist.findUnique as jest.Mock).mockResolvedValue(existingWishlist);
    (prisma.wishlist.update as jest.Mock).mockResolvedValue(updatedWishlist);

    await addToWishlist(req as Request, res as Response);

    expect(prisma.wishlist.update).toHaveBeenCalledWith({
      where: { userId: 'user123' },
      data: { products: updatedWishlist.products },
    });
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith(updatedWishlist);
  });

  it('should create a new wishlist if none exists and return 201', async () => {
    const product = { id: 3, name: 'Product 3' };
    req.body = { product };

    (prisma.wishlist.findUnique as jest.Mock).mockResolvedValue(null);
    const newWishlist = {
      userId: 'user123',
      products: [{ product }],
    };
    (prisma.wishlist.create as jest.Mock).mockResolvedValue(newWishlist);

    await addToWishlist(req as Request, res as Response);

    expect(prisma.wishlist.create).toHaveBeenCalledWith({
      data: {
        userId: 'user123',
        products: [{ product }],
      },
    });
    expect(statusMock).toHaveBeenCalledWith(201);
    expect(jsonMock).toHaveBeenCalledWith(newWishlist);
  });

  it('should handle errors and return 500', async () => {
    const product = { id: 4, name: 'Product 4' };
    req.body = { product };

    (prisma.wishlist.findUnique as jest.Mock).mockRejectedValue(new Error('Database error'));

    await addToWishlist(req as Request, res as Response);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({ error: MESSAGES.WISHLIST_FETCH_ERROR });
  });
});
