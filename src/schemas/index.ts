// ! Gift Schemas
export {
    giftBaseSchema,
    giftSchema,
    createGiftSchema,
    updateGiftSchema,
    publicGiftSchema,
    type Gift,
    type CreateGift,
    type UpdateGift,
    type PublicGift,
} from './gift.schema';

// ! Wishlist Schemas
export {
    wishlistBaseSchema,
    wishlistSchema,
    createWishlistSchema,
    updateWishlistSchema,
    wishlistWithGiftsSchema,
    publicWishlistSchema,
    type Wishlist,
    type CreateWishlist,
    type UpdateWishlist,
    type WishlistWithGifts,
    type PublicWishlist,
} from './wishlist.schema';

// ! Reservation schemas
export {
    reservationSchema,
    type Reservation,
} from './reservation.schema';

// ! Saved schemas
export {
    savedWishlistSchema,
    savedWishlistResponseSchema,
    type SavedWishlist,
    type SavedWishlistResponse,
} from './saved.schema';