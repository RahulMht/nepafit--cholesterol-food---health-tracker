# NepaFit - Heart Health Management App

A React Native app built with Expo for managing cholesterol and heart health through smart food tracking and AI coaching.

## Quick Start

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
Create a `.env` file in the root directory:
```env
EXPO_PUBLIC_RORK_API_BASE_URL=http://localhost:3000
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

3. **Start the development server:**
```bash
npm run start
```

4. **Test the app:**
- Use test credentials: `test@example.com` / `password123`
- Or register a new account
- Or use Google OAuth (requires setup)

## Features

- 📱 Cross-platform (iOS, Android, Web)
- 🍽️ Food logging with image and text input
- 📊 Cholesterol and heart-healthy macro tracking
- 🤖 AI-powered heart health coaching
- 📈 Weekly insights and history
- 🔄 Offline support with sync
- 👥 Multi-profile support
- 🔐 Secure authentication with Google OAuth
- 📷 Camera integration for food photos
- ☁️ Image storage with URL-based delivery

## Backend Integration

This app uses mock data by default for most features, but **food logging now uses a real webhook with image storage**. 

### Image Upload Flow

1. **Image Capture/Selection**: User takes photo or selects from gallery
2. **Image Upload**: Image is uploaded to your storage service first
3. **URL Generation**: Storage service returns a URL for the uploaded image
4. **Webhook Request**: Food data with image URL is sent to the webhook
5. **Food Analysis**: Webhook processes the image URL and returns nutrition data

### Current Webhook Configuration

The food intake webhook is configured and working:
```typescript
const FOOD_INTAKE_WEBHOOK = "https://foothaven.app.n8n.cloud/webhook-test/4f5c25b0-30cf-408c-83f9-a37266cc6788";
```

### Required Configuration

Update these endpoints in `context/AppStateContext.tsx`:

```typescript
// Replace with your actual image storage service
const IMAGE_UPLOAD_ENDPOINT = "https://your-storage-service.com/upload";

// Replace these webhook URLs with your actual API endpoints
const LOGIN_WEBHOOK = "https://your-api.com/auth/login";
const REGISTER_WEBHOOK = "https://your-api.com/auth/register"; 
const GOOGLE_AUTH_WEBHOOK = "https://your-api.com/auth/google";
const CHAT_WEBHOOK = "https://your-api.com/chat";
const SUMMARY_WEBHOOK = "https://your-api.com/summary";
```

### Image Storage Service Setup

You need to set up an image storage service that accepts multipart form uploads and returns URLs. Popular options:

#### AWS S3
```javascript
// Example S3 upload endpoint response
{
  "url": "https://your-bucket.s3.amazonaws.com/food-images/image-123.jpg",
  "key": "food-images/image-123.jpg"
}
```

#### Cloudinary
```javascript
// Example Cloudinary response
{
  "url": "https://res.cloudinary.com/your-cloud/image/upload/v123/food-image.jpg",
  "public_id": "food-image",
  "secure_url": "https://res.cloudinary.com/your-cloud/image/upload/v123/food-image.jpg"
}
```

#### Custom Storage Service
Your storage service should:
- Accept `multipart/form-data` uploads
- Handle both web (blob) and native (file URI) formats
- Return a publicly accessible URL
- Support common image formats (jpg, png, webp)

### API Endpoints

#### 1. Image Upload
**Request to:** `YOUR_IMAGE_UPLOAD_ENDPOINT`
```
POST /upload
Content-Type: multipart/form-data

image: [binary file data]
timestamp: "1642284600000"
```

**Expected Response:**
```json
{
  "url": "https://your-storage.com/images/food-image-123.jpg",
  "id": "image-123"
}
```

#### 2. Food Logging (Updated)
**Request to:** `https://foothaven.app.n8n.cloud/webhook-test/4f5c25b0-30cf-408c-83f9-a37266cc6788`

```json
{
  "description": "Grilled salmon with steamed vegetables",
  "imageUrl": "https://your-storage.com/images/food-image-123.jpg",
  "mealType": "Dinner",
  "servings": 1.5,
  "timestamp": "2024-01-15T18:30:00Z"
}
```

**Expected Response:**
```json
{
  "id": "meal_123",
  "description": "Grilled salmon with steamed vegetables",
  "mealType": "Dinner",
  "servings": 1.5,
  "calories": 380,
  "saturatedFat": 4,
  "cholesterol": 75,
  "fiber": 5,
  "protein": 40,
  "foodidentified": true,
  "timestamp": "2024-01-15T18:30:00Z"
}
```

#### 3. Authentication
**Login Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Login Response:**
```json
{
  "token": "jwt-token-here",
  "profile": {
    "name": "John Doe",
    "email": "user@example.com"
  }
}
```

### Implementation Steps

1. **Set up Image Storage**: ✅ Code ready - configure your storage service endpoint
2. **Food Logging**: ✅ Already working with real webhook + image URLs
3. **Replace Mock Functions**: Update remaining mock functions with real API calls
4. **Add Error Handling**: Implement proper error handling for network failures
5. **Add Authentication Headers**: Include JWT tokens in API requests
6. **Test Cross-Platform**: Ensure image upload works on iOS, Android, and Web

### Heart Health Focus

The app tracks key nutrients for cholesterol management:

- **Saturated Fat**: Target <20g daily (lower is better)
- **Cholesterol**: Target <200mg daily (lower is better)  
- **Fiber**: Target 25g+ daily (higher is better)
- **Protein**: Target varies by user (lean sources preferred)

### Testing

**Test Credentials:**
- Email: `test@example.com`
- Password: `password123`

**Image Upload Testing:**
1. Take a photo or select from gallery
2. Add description (optional if image provided)
3. Select meal type and servings
4. Tap "Analyze Now"
5. Image uploads to storage first, then URL sent to webhook

### Troubleshooting

#### Common Issues

1. **Image upload fails**: Check your storage service endpoint and credentials
2. **Binary data errors**: The app now uses URLs instead of binary data
3. **Cross-platform issues**: Image handling is now unified across platforms
4. **Network errors**: Check both storage service and webhook endpoints

#### Platform-Specific Notes

- **iOS**: Handles file URIs and converts to proper upload format
- **Android**: Handles file URIs and converts to proper upload format  
- **Web**: Converts image data to blob format for upload

### Current Status

✅ **Working Features:**
- Image upload to storage service with URL generation
- Food logging with real webhook integration (using image URLs)
- Cross-platform image handling (iOS, Android, Web)
- Offline support with sync
- Cholesterol-focused nutrition tracking

🔄 **Mock Features (Ready for Integration):**
- User authentication (login/register)
- AI coaching chat
- Dashboard summary data
- Weekly insights

The image upload system is now production-ready! Just configure your storage service endpoint and you're good to go.