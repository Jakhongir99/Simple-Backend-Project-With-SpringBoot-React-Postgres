# File Upload and Download System

## Overview

This document describes the comprehensive file upload and download system implemented in the Java Simple CRUD project. The system provides secure file storage, user-based access control, and a modern web interface for file management.

## Features

### ✅ **Core Functionality**

- **File Upload**: Support for multiple file types with size validation
- **File Download**: Secure file downloads with proper access control
- **File Management**: Edit metadata, toggle visibility, and delete files
- **Search & Filter**: Find files by name, description, or type
- **Pagination**: Efficient handling of large file collections

### ✅ **Security Features**

- **Authentication Required**: All operations require valid JWT tokens
- **Access Control**: Users can only access their own files or public files
- **File Type Validation**: Restricted to safe file types
- **Size Limits**: Configurable file size restrictions
- **Soft Delete**: Files are marked inactive rather than permanently removed

### ✅ **User Experience**

- **Modern UI**: Built with Mantine UI components
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Immediate feedback on all operations
- **File Previews**: Visual indicators for different file types
- **Drag & Drop**: Intuitive file selection interface

## Backend Architecture

### **Database Schema**

```sql
CREATE TABLE files (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    original_file_name VARCHAR(255) NOT NULL,
    stored_file_name VARCHAR(255) NOT NULL UNIQUE,
    file_path VARCHAR(1000) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    description TEXT,
    uploaded_by VARCHAR(100) NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_files_uploaded_by (uploaded_by),
    INDEX idx_files_file_type (file_type),
    INDEX idx_files_is_public (is_public),
    INDEX idx_files_is_active (is_active),
    INDEX idx_files_created_at (created_at),
    INDEX idx_files_stored_file_name (stored_file_name)
);
```

### **File Storage Strategy**

- **Local Storage**: Files are stored in the `./uploads/` directory
- **Unique Naming**: Each file gets a UUID-based filename to prevent conflicts
- **Metadata Storage**: File information is stored in the database
- **Path Management**: Full file paths are stored for efficient access

### **Supported File Types**

```properties
file.upload.allowed-types=pdf,doc,docx,txt,jpg,jpeg,png,gif,xls,xlsx,zip,rar
```

- **Documents**: PDF, Word, Excel, Text files
- **Images**: JPG, PNG, GIF formats
- **Archives**: ZIP, RAR files
- **Customizable**: Easy to add/remove file types

### **File Size Limits**

```properties
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=50MB
```

- **Individual File**: Maximum 10MB per file
- **Total Request**: Maximum 50MB per upload request
- **Configurable**: Adjustable in application.properties

## API Endpoints

### **File Upload**

```http
POST /api/files/upload
Content-Type: multipart/form-data
Authorization: Bearer {token}

Parameters:
- file: MultipartFile (required)
- description: String (required)
- isPublic: Boolean (required)
```

### **File Download**

```http
GET /api/files/download/{fileId}
Authorization: Bearer {token}

Response: File stream with proper headers
```

### **File Management**

```http
GET    /api/files/my-files          # Get user's files
GET    /api/files/public            # Get public files
GET    /api/files/search            # Search files
GET    /api/files/type/{fileType}   # Filter by type
PUT    /api/files/{fileId}          # Update metadata
DELETE /api/files/{fileId}          # Delete file
PATCH  /api/files/{fileId}/toggle-visibility  # Toggle public/private
```

### **File Information**

```http
GET /api/files/{fileId}             # Get file details
GET /api/files/stats/my-count       # User's file count
GET /api/files/stats/total-count    # Total file count
GET /api/files/check-access/{fileId} # Check access permissions
```

## Frontend Components

### **FileManagement Component**

The main component that provides:

- **File Upload Modal**: Drag & drop file selection with metadata
- **File Grid**: Responsive card-based file display
- **Search & Filters**: Find files by keyword or type
- **Action Buttons**: Download, edit, delete, and visibility toggle
- **Pagination**: Handle large file collections efficiently

### **Key Features**

1. **File Upload Interface**

   - File selection with type validation
   - Description and visibility settings
   - Progress indication and error handling

2. **File Display**

   - Visual file type indicators (emojis)
   - File size and upload date information
   - Public/private status badges

3. **File Actions**

   - Download files with proper naming
   - Edit file descriptions and visibility
   - Toggle between public and private access
   - Soft delete with confirmation

4. **Search & Organization**
   - Real-time search by filename or description
   - Filter by file type
   - Sort by upload date
   - Clear filters functionality

## Security Implementation

### **Authentication & Authorization**

```java
@PreAuthorize("hasRole('USER')")
public class FileController {
    // All endpoints require valid JWT token
}
```

### **Access Control**

```java
private void validateFileAccess(FileEntity fileEntity, String requestedBy) {
    if (!fileEntity.getIsActive()) {
        throw new FileNotFoundException("File is not available");
    }

    if (!fileEntity.getIsPublic() && !fileEntity.getUploadedBy().equals(requestedBy)) {
        throw new InsufficientPrivilegesException("Access denied");
    }
}
```

### **File Validation**

```java
private void validateFile(MultipartFile file) {
    if (file.isEmpty()) {
        throw new FileStorageException("Cannot upload empty file");
    }

    String fileExtension = getFileExtension(file.getOriginalFilename());
    if (!isFileTypeAllowed(fileExtension)) {
        throw new FileStorageException("File type not allowed: " + fileExtension);
    }

    if (file.getSize() > 10 * 1024 * 1024) {
        throw new FileStorageException("File size too large. Maximum: 10MB");
    }
}
```

## Configuration

### **Application Properties**

```properties
# File Upload Configuration
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=50MB
spring.servlet.multipart.enabled=true
file.upload.path=./uploads/
file.upload.allowed-types=pdf,doc,docx,txt,jpg,jpeg,png,gif,xls,xlsx,zip,rar
```

### **Database Migration**

The system includes a Liquibase migration (`009-create-files-table.xml`) that:

- Creates the files table with proper constraints
- Adds performance indexes
- Establishes foreign key relationships
- Handles database compatibility

## Usage Examples

### **Uploading a File**

1. Navigate to File Management
2. Click "Upload File" button
3. Select file from your device
4. Add description and set visibility
5. Click "Upload" to complete

### **Downloading a File**

1. Find the file in the file grid
2. Click the download icon (📥)
3. File will download with original filename

### **Managing File Access**

1. Click the visibility toggle icon (👁️/👁️‍🗨️)
2. File switches between public and private
3. Public files are visible to all users
4. Private files are only visible to the owner

### **Searching Files**

1. Use the search bar to find files by name
2. Filter by file type using the dropdown
3. Clear filters to reset the view

## Error Handling

### **Common Error Scenarios**

1. **File Too Large**

   - Error: "File size too large. Maximum allowed: 10MB"
   - Solution: Compress or split large files

2. **Invalid File Type**

   - Error: "File type not allowed: {extension}"
   - Solution: Use supported file formats

3. **Access Denied**

   - Error: "Access denied to file: {filename}"
   - Solution: Contact file owner or use public files

4. **File Not Found**
   - Error: "File not found with id: {id}"
   - Solution: File may have been deleted or moved

### **Error Response Format**

```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "File type not allowed: .exe",
  "path": "/api/files/upload",
  "timestamp": "2025-01-18T10:30:00.000Z"
}
```

## Performance Considerations

### **Optimization Strategies**

1. **Database Indexes**: Proper indexing on frequently queried fields
2. **File Caching**: Browser-level caching for downloaded files
3. **Pagination**: Efficient handling of large file collections
4. **Lazy Loading**: Load file metadata on demand

### **Scalability**

- **Horizontal Scaling**: File storage can be moved to cloud storage (S3, etc.)
- **Database Optimization**: Query optimization and connection pooling
- **CDN Integration**: Can be extended to use content delivery networks

## Future Enhancements

### **Planned Features**

1. **Cloud Storage**: Integration with AWS S3, Google Cloud Storage
2. **File Versioning**: Track file changes and maintain history
3. **Advanced Search**: Full-text search and content indexing
4. **File Sharing**: Generate shareable links with expiration
5. **Bulk Operations**: Upload/download multiple files at once
6. **File Preview**: Generate thumbnails for images and documents

### **Integration Possibilities**

1. **Document Management**: Integration with document processing services
2. **Image Processing**: Automatic image optimization and resizing
3. **Virus Scanning**: Integration with antivirus services
4. **Backup Systems**: Automated backup and recovery procedures

## Troubleshooting

### **Common Issues**

1. **Upload Directory Not Found**

   - Ensure `./uploads/` directory exists
   - Check application permissions

2. **File Size Limits**

   - Verify `spring.servlet.multipart.max-file-size` setting
   - Check server configuration

3. **Database Connection Issues**

   - Verify database connectivity
   - Check Liquibase migration status

4. **Authentication Problems**
   - Ensure JWT token is valid
   - Check token expiration

### **Debug Information**

Enable debug logging in `application.properties`:

```properties
logging.level.com.example.file=DEBUG
logging.level.org.springframework.web=DEBUG
```

## Conclusion

The file upload and download system provides a robust, secure, and user-friendly solution for file management in the Java Simple CRUD project. With proper security measures, comprehensive error handling, and a modern user interface, it meets the needs of both developers and end-users while maintaining high performance and scalability.

The system is designed to be easily extensible and can be enhanced with additional features as requirements evolve.
