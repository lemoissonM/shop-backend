# File Upload Module

This module provides functionality for uploading files to Cloudinary and retrieving URLs.

## Features

- Upload single files
- Upload multiple files
- Upload base64 encoded images
- Upload files to local storage (with automatic resizing for large images)
- File validation (size, type)

## Setup

1. Create a Cloudinary account (https://cloudinary.com/)
2. Add your Cloudinary credentials to your environment variables:

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

3. For local file storage, make sure the `public` directory is properly served:
```
BASE_URL=https://shop-backend.harvely.com (or your domain)
```

## Usage

### Upload a single file

```
POST /file/upload
Content-Type: multipart/form-data

file: [binary file data]
```

Response:
```json
{
  "url": "https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/ai-generations/filename.jpg"
}
```

### Upload multiple files

```
POST /file/upload-multiple
Content-Type: multipart/form-data

files: [binary file data 1]
files: [binary file data 2]
...
```

Response:
```json
{
  "urls": [
    "https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/ai-generations/filename1.jpg",
    "https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/ai-generations/filename2.jpg"
  ]
}
```

### Upload base64 encoded image

```
POST /file/upload-base64
Content-Type: application/json

{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...",
  "filename": "optional-custom-filename"
}
```

Response:
```json
{
  "url": "https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/ai-generations/optional-custom-filename.jpg"
}
```

### Upload file to local storage

```
POST /file/upload-local
Content-Type: multipart/form-data

file: [binary file data]
```

Response:
```json
{
  "url": "https://shop-backend.harvely.com/images/1234567890-filename.jpg"
}
```

Note: Images larger than 2MB will be automatically resized to 1200x1200 pixels (preserving aspect ratio) and converted to JPEG format with 80% quality.

## Programmatic Usage

You can inject the FileService into any other service or controller:

```typescript
import { FileService } from '../file/file.service';

@Injectable()
export class YourService {
  constructor(private fileService: FileService) {}

  async someMethod(file: Express.Multer.File) {
    const { url } = await this.fileService.uploadFile(file);
    // Do something with the URL
  }
  
  // For local storage
  async saveLocally(file: Express.Multer.File) {
    const { url } = await this.fileService.uploadLocalFile(file);
    // Do something with the URL
  }
}
``` 