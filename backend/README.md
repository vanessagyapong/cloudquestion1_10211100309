# E-commerce Backend API

## Base URL

```
http://localhost:5000/api
```

## API Endpoints

## Authentication

Most endpoints require authentication via JWT token. The token should be included in either:

- HTTP Cookie (automatically handled after login)
- Authorization header: `Bearer <token>`

## Error Responses

All endpoints follow this error format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (only in development)",
  "errors": {
    "field": "Field-specific error message"
  }
}
```

## Endpoints

### Authentication

#### Register

```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "phone": "+1234567890",
  "gender": "male",
  "dateOfBirth": "1990-01-01"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "isActive": true
    },
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token"
    }
  }
}
```

#### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token"
    }
  }
}
```

#### Logout

```http
POST /auth/logout
Authorization: Bearer <token>
```

Response:

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### Refresh Token

```http
POST /auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "current_refresh_token"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "accessToken": "new_access_token",
    "refreshToken": "new_refresh_token"
  }
}
```

### User Management

#### Get Profile

```http
GET /users/profile
Authorization: Bearer <token>
```

Response:

```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "gender": "male",
    "dateOfBirth": "1990-01-01",
    "role": "user",
    "store": {
      "_id": "store_id",
      "name": "John's Store",
      "description": "Amazing products",
      "status": "approved"
    },
    "wishlist": [
      {
        "_id": "product_id",
        "name": "Product Name",
        "price": 99.99
      }
    ],
    "cart": {
      "items": [
        {
          "product": {
            "_id": "product_id",
            "name": "Product Name",
            "price": 99.99
          },
          "quantity": 2
        }
      ],
      "totalItems": 2,
      "totalAmount": 199.98
    }
  }
}
```

#### Update Profile

```http
PUT /users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Smith",
  "phone": "+1987654321",
  "bio": "Love shopping!"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Smith",
    "email": "john@example.com",
    "phone": "+1987654321",
    "bio": "Love shopping!"
  }
}
```

#### Change Password

```http
PUT /users/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

Response:

```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

#### Become a Seller

```http
POST /users/become-seller
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John's Store",
  "description": "Best products in town",
  "contactEmail": "store@example.com",
  "contactPhone": "+1234567890",
  "address": "123 Store St, City, Country"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "_id": "store_id",
    "name": "John's Store",
    "description": "Best products in town",
    "status": "pending",
    "isActive": false
  },
  "message": "Store created successfully. Pending admin approval."
}
```

### Products

#### Create Product (Sellers only)

```http
POST /products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Amazing Product",
  "description": "This is an amazing product",
  "price": 99.99,
  "stock": 100,
  "category": "Electronics",
  "images": [
    "image1.jpg",
    "image2.jpg"
  ]
}
```

Response:

```json
{
  "success": true,
  "data": {
    "_id": "product_id",
    "name": "Amazing Product",
    "description": "This is an amazing product",
    "price": 99.99,
    "stock": 100,
    "category": "Electronics",
    "images": ["image1.jpg", "image2.jpg"],
    "store": "store_id",
    "isActive": true
  }
}
```

#### Get All Products

```http
GET /products
```

Response:

```json
{
  "data": [
    {
      "_id": "product_id",
      "name": "Amazing Product",
      "description": "This is an amazing product",
      "price": 99.99,
      "store": {
        "name": "John's Store",
        "logo": "logo.jpg",
        "rating": 4.5
      }
    }
  ]
}
```

#### Search Products

```http
GET /products/search?query=amazing&category=Electronics
```

Response:

```json
{
  "data": [
    {
      "_id": "product_id",
      "name": "Amazing Product",
      "description": "This is an amazing product",
      "price": 99.99,
      "store": {
        "name": "John's Store",
        "logo": "logo.jpg",
        "rating": 4.5
      }
    }
  ]
}
```

#### Get Seller's Products

```http
GET /products/seller
Authorization: Bearer <token>
```

Response:

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "product_id",
      "name": "Amazing Product",
      "description": "This is an amazing product",
      "price": 99.99,
      "stock": 100,
      "category": "Electronics",
      "images": ["image1.jpg", "image2.jpg"]
    }
  ]
}
```

#### Update Product (Sellers only)

```http
PUT /products/:productId
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Product",
  "price": 89.99,
  "stock": 150
}
```

Response:

```json
{
  "success": true,
  "data": {
    "_id": "product_id",
    "name": "Updated Product",
    "price": 89.99,
    "stock": 150
  }
}
```

#### Delete Product (Sellers only)

```http
DELETE /products/:productId
Authorization: Bearer <token>
```

Response:

```json
{
  "success": true,
  "message": "Product deleted"
}
```

### Wishlist

#### Get Wishlist

```http
GET /api/wishlist
Authorization: Bearer <token>
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "_id": "product_id",
      "name": "Product Name",
      "description": "Product Description",
      "price": 99.99,
      "images": ["image1.jpg"],
      "store": {
        "name": "Store Name",
        "logo": "logo.jpg"
      }
    }
  ]
}
```

#### Toggle Product in Wishlist (Add/Remove)

```http
POST /api/wishlist/:productId
Authorization: Bearer <token>
```

Response (After Adding):

```json
{
  "success": true,
  "data": [
    {
      "_id": "product_id",
      "name": "Product Name",
      "description": "Product Description",
      "price": 99.99,
      "images": ["image1.jpg"]
    }
  ]
}
```

Response (After Removing):

```json
{
  "success": true,
  "data": [] // Updated wishlist without the removed product
}
```

#### Remove from Wishlist

```http
DELETE /api/wishlist/:productId
Authorization: Bearer <token>
```

Response:

```json
{
  "success": true,
  "data": [] // Updated wishlist without the removed product
}
```

Error Responses:

```json
{
  "success": false,
  "message": "Product not found in wishlist"
}
```

```json
{
  "success": false,
  "message": "User not found"
}
```

Notes:

1. All wishlist endpoints require authentication
2. The toggle endpoint (POST) will add the product if it's not in the wishlist, or remove it if it already exists
3. The remove endpoint (DELETE) will return a 404 error if the product is not in the wishlist
4. Wishlist items are populated with product details when returned

### Cart

#### Add to Cart

```http
POST /cart
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "product_id",
  "quantity": 2
}
```

Response:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "product": {
          "_id": "product_id",
          "name": "Amazing Product",
          "price": 99.99
        },
        "quantity": 2
      }
    ],
    "totalItems": 2,
    "totalAmount": 199.98
  }
}
```

#### Update Cart Item

```http
PUT /cart/:productId
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 3
}
```

Response:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "product": {
          "_id": "product_id",
          "name": "Amazing Product",
          "price": 99.99
        },
        "quantity": 3
      }
    ],
    "totalItems": 3,
    "totalAmount": 299.97
  }
}
```

#### Remove from Cart

```http
DELETE /cart/:productId
Authorization: Bearer <token>
```

Response:

```json
{
  "success": true,
  "data": {
    "items": [],
    "totalItems": 0,
    "totalAmount": 0
  }
}
```

#### Clear Cart

```http
DELETE /cart
Authorization: Bearer <token>
```

Response:

```json
{
  "success": true,
  "message": "Cart cleared",
  "data": {
    "items": [],
    "totalItems": 0,
    "totalAmount": 0
  }
}
```

### Orders

#### Get Seller Orders

```http
GET /api/orders/seller
Authorization: Bearer <token>
```

Response:

```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "order_id",
      "user": {
        "_id": "user_id",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "items": [
        {
          "product": {
            "_id": "product_id",
            "name": "Product Name",
            "price": 99.99,
            "images": ["image1.jpg"]
          },
          "quantity": 2,
          "price": 99.99
        }
      ],
      "status": "pending",
      "paymentStatus": "pending",
      "total": 199.98,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

Error Responses:

```json
{
  "success": false,
  "message": "Store not found"
}
```

```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

Notes:

1. This endpoint is only accessible to users with the "seller" role
2. Only returns orders containing products from the seller's store
3. Items are filtered to only include products from the seller's store
4. Orders are sorted by creation date (newest first)
5. Response includes basic user information and product details

## Notes

1. All authenticated routes require a valid JWT token
2. Dates should be in ISO format (YYYY-MM-DD)
3. Prices are in USD
4. Images should be valid URLs
5. Product categories are case-sensitive
6. Store status can be: "pending", "approved", or "rejected"
7. User roles can be: "user", "seller", or "admin"
