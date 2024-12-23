import { Router } from 'express';
import { authenticateJWT } from '../middleware/authMiddleware';
import { getUserWishlist, removeFromWishlist, addToWishlist } from '../controllers/wishlistController'

const router = Router();

router.get('/wishlist',authenticateJWT, getUserWishlist);
router.delete('/wishlist/:productId', authenticateJWT, removeFromWishlist)
router.post('/wishlist',authenticateJWT, addToWishlist);

export default router;
