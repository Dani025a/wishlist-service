import { Request, Response } from 'express';
import { MESSAGES } from '../utils/messages';
import { prisma } from '../models';
import { Product, WishlistProduct } from '../types/types';

export const addToWishlist = async (req: Request, res: Response) => {
  const { product } = req.body;
  const tokenUserId = req.user.userId;

  if (!product || !product.id) {
      console.error('Invalid product or missing product ID');
      return res.status(400).json({ error: 'Invalid product or missing product ID' });
  }

  console.log(`Adding product with ID: ${product.id} to the wishlist`);

  try {
      let wishlist = await prisma.wishlist.findUnique({
          where: { userId: String(tokenUserId) },
      });

      if (wishlist) {
          wishlist.products = wishlist.products.map((wishlistProduct: any) => ({
              product: {
                  ...wishlistProduct.product,
                  id: wishlistProduct.product.id,
              },
          }));


          const productExists = wishlist.products.some(
              (wishlistProduct: WishlistProduct) => wishlistProduct.product.id === product.id
          );

          if (productExists) {
              return res.status(200).json({ error: MESSAGES.WISHLIST_ALREADY_EXISTS });
          }

          const updatedProducts = [...wishlist.products, { product }];
          console.log('Updated products array:', updatedProducts);

          const updatedWishlist = await prisma.wishlist.update({
              where: { userId: String(tokenUserId) },
              data: { products: updatedProducts },
          });

          console.log('Updated wishlist:', updatedWishlist);
          return res.status(200).json(updatedWishlist);
      }

      const newWishlist = await prisma.wishlist.create({
          data: {
              userId: String(tokenUserId),
              products: [{ product }],
          },
      });

      console.log('Created new wishlist:', newWishlist);
      return res.status(201).json(newWishlist);
  } catch (error) {
      console.error('Error adding to wishlist:', error);
      return res.status(500).json({ error: MESSAGES.WISHLIST_ADD_ERROR });
  }
};



export const removeFromWishlist = async (req: Request, res: Response) => {
  const { productId } = req.params;
  const tokenUserId = req.user.userId;

  try {
      const existingWishlist = await prisma.wishlist.findUnique({
          where: { userId: String(tokenUserId) },
      });

      if (!existingWishlist) {
          return res.status(404).json({ error: MESSAGES.WISHLIST_ITEM_NOT_FOUND });
      }

      const updatedProducts = existingWishlist.products.filter(
          (product: { product: { id: number } }) => product.product.id !== Number(productId)
      );

      if (updatedProducts.length === existingWishlist.products.length) {
          return res.status(404).json({ error: MESSAGES.WISHLIST_ITEM_NOT_FOUND });
      }

      const updatedWishlist = await prisma.wishlist.update({
          where: { userId: String(tokenUserId) },
          data: { products: updatedProducts },
      });

      res.status(200).json(updatedWishlist);
  } catch (error) {
      console.error("Error removing from wishlist:", error);
      res.status(500).json({ error: MESSAGES.WISHLIST_REMOVE_ERROR });
  }
};


export const getUserWishlist = async (req: Request, res: Response) => {
    const tokenUserId = req.user.userId;

    try {
        const wishlist = await prisma.wishlist.findUnique({
            where: { userId: String(tokenUserId) },
        });

        if (!wishlist) {
            return res.status(200).json({ products: [] });
        }

        res.status(200).json(wishlist);
    } catch (error) {
        console.error("Error fetching wishlist:", error);
        res.status(500).json({ error: MESSAGES.WISHLIST_FETCH_ERROR });
    }
};
