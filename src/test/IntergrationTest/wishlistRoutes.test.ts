// src/test/IntegrationTest/wishlistRoutes.test.ts

import request from 'supertest';
import app from '../../app';
import { prisma } from '../../models/';
import jwt from 'jsonwebtoken';

// Mock the prisma client
jest.mock('../../models/index');

// Set up environment variables for testing
process.env.USER_JWT_SECRET = 'testsecret';

// Helper function to generate JWT
const generateToken = (userId: string) => {
  return jwt.sign({ userId }, process.env.USER_JWT_SECRET!);
};

describe('Wishlist Routes', () => {
  let token: string;

  beforeAll(() => {
    token = generateToken('user123');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/wishlist', () => {
    it('should add a product to the wishlist', async () => {
      const product = { id: 1, name: 'Product 1' };

      // Mock findUnique to return existing wishlist
      (prisma.wishlist.findUnique as jest.Mock).mockResolvedValue({
        userId: 'user123',
        products: [],
      });

      // Mock update to return updated wishlist
      (prisma.wishlist.update as jest.Mock).mockResolvedValue({
        userId: 'user123',
        products: [{ product }],
      });

      const res = await request(app)
        .post('/api/wishlist')
        .set('Authorization', `Bearer ${token}`)
        .send({ product });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        userId: 'user123',
        products: [{ product }],
      });
      expect(prisma.wishlist.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user123' },
      });
      expect(prisma.wishlist.update).toHaveBeenCalled();
    });

    it('should return 400 if product is missing', async () => {
      const res = await request(app)
        .post('/api/wishlist')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Invalid product or missing product ID' });
    });

    it('should return 401 if token is missing', async () => {
      const res = await request(app)
        .post('/api/wishlist')
        .send({});

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ message: 'Token missing' });
    });

    // Add more test cases as needed
  });

  describe('GET /api/wishlist', () => {
    it('should retrieve the user wishlist', async () => {
      const wishlist = {
        userId: 'user123',
        products: [{ product: { id: 1, name: 'Product 1' } }],
      };

      (prisma.wishlist.findUnique as jest.Mock).mockResolvedValue(wishlist);

      const res = await request(app)
        .get('/api/wishlist')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(wishlist);
      expect(prisma.wishlist.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user123' },
      });
    });

    it('should return empty products if wishlist does not exist', async () => {
      (prisma.wishlist.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .get('/api/wishlist')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ products: [] });
    });
  });

  describe('DELETE /api/wishlist/:productId', () => {
    it('should remove a product from the wishlist', async () => {
      const existingWishlist = {
        userId: 'user123',
        products: [{ product: { id: 1, name: 'Product 1' } }],
      };

      const updatedWishlist = {
        userId: 'user123',
        products: [],
      };

      (prisma.wishlist.findUnique as jest.Mock).mockResolvedValue(existingWishlist);
      (prisma.wishlist.update as jest.Mock).mockResolvedValue(updatedWishlist);

      const res = await request(app)
        .delete('/api/wishlist/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(updatedWishlist);
      expect(prisma.wishlist.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user123' },
      });
      expect(prisma.wishlist.update).toHaveBeenCalledWith({
        where: { userId: 'user123' },
        data: { products: [] },
      });
    });

    it('should return 404 if wishlist does not exist', async () => {
      (prisma.wishlist.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .delete('/api/wishlist/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Wishlist item not found' });
    });

    it('should return 404 if product is not in wishlist', async () => {
      const existingWishlist = {
        userId: 'user123',
        products: [{ product: { id: 2, name: 'Product 2' } }],
      };

      (prisma.wishlist.findUnique as jest.Mock).mockResolvedValue(existingWishlist);

      const res = await request(app)
        .delete('/api/wishlist/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Wishlist item not found' });
    });
  });
});
