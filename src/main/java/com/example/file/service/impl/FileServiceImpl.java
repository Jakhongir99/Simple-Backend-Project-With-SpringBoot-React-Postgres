package com.example.file.service.impl;

import com.example.file.dto.FileDto;
import com.example.file.dto.FileUploadRequest;
import com.example.file.entity.FileEntity;
import com.example.file.exception.FileNotFoundException;
import com.example.file.exception.FileStorageException;
import com.example.file.exception.InsufficientPrivilegesException;
import com.example.file.mapper.FileMapper;
import com.example.file.repository.FileRepository;
import com.example.file.service.FileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class FileServiceImpl implements FileService {
    
    private final FileRepository fileRepository;
    private final FileMapper fileMapper;
    
    @Value("${file.upload.path}")
    private String uploadPath;
    
    @Value("${file.upload.allowed-types}")
    private String allowedTypes;
    
    @Override
    public FileDto uploadFile(MultipartFile file, FileUploadRequest request, String uploadedBy) {
        try {
            // Validate file
            validateFile(file);
            
            // Create upload directory if it doesn't exist
            Path uploadDir = Paths.get(uploadPath);
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }
            
            // Generate unique filename
            String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
            String fileExtension = getFileExtension(originalFileName);
            String storedFileName = UUID.randomUUID().toString() + "." + fileExtension;
            
            // Save file to disk
            Path targetLocation = uploadDir.resolve(storedFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            
            // Create file entity
            FileEntity fileEntity = FileEntity.builder()
                    .originalFileName(originalFileName)
                    .storedFileName(storedFileName)
                    .filePath(targetLocation.toString())
                    .fileType(fileExtension.toLowerCase())
                    .fileSize(file.getSize())
                    .mimeType(file.getContentType())
                    .description(request.getDescription())
                    .uploadedBy(uploadedBy)
                    .isPublic(request.getIsPublic())
                    .isActive(true)
                    .build();
            
            FileEntity savedFile = fileRepository.save(fileEntity);
            log.info("File uploaded successfully: {} by user: {}", originalFileName, uploadedBy);
            
            return fileMapper.toDto(savedFile);
            
        } catch (IOException e) {
            log.error("Failed to store file: {}", file.getOriginalFilename(), e);
            throw new FileStorageException("Failed to store file: " + file.getOriginalFilename());
        }
    }
    
    @Override
    public Resource downloadFile(Long fileId, String requestedBy) {
        FileEntity fileEntity = getFileEntityById(fileId);
        validateFileAccess(fileEntity, requestedBy);
        return getFileResource(fileEntity.getFilePath());
    }
    
    @Override
    public Resource downloadFileByStoredName(String storedFileName, String requestedBy) {
        FileEntity fileEntity = fileRepository.findByStoredFileNameAndIsActiveTrue(storedFileName)
                .orElseThrow(() -> new FileNotFoundException("File not found: " + storedFileName));
        validateFileAccess(fileEntity, requestedBy);
        return getFileResource(fileEntity.getFilePath());
    }
    
    @Override
    public FileDto getFileById(Long fileId, String requestedBy) {
        FileEntity fileEntity = getFileEntityById(fileId);
        validateFileAccess(fileEntity, requestedBy);
        return fileMapper.toDto(fileEntity);
    }
    
    @Override
    public FileDto getFileByStoredName(String storedFileName, String requestedBy) {
        FileEntity fileEntity = fileRepository.findByStoredFileNameAndIsActiveTrue(storedFileName)
                .orElseThrow(() -> new FileNotFoundException("File not found: " + storedFileName));
        validateFileAccess(fileEntity, requestedBy);
        return fileMapper.toDto(fileEntity);
    }
    
    @Override
    public Page<FileDto> getFilesByUser(String username, Pageable pageable) {
        Page<FileEntity> files = fileRepository.findByUploadedByAndIsActiveTrue(username, pageable);
        return files.map(fileMapper::toDto);
    }
    
    @Override
    public Page<FileDto> getPublicFiles(Pageable pageable) {
        Page<FileEntity> files = fileRepository.findByIsPublicTrueAndIsActiveTrue(pageable);
        return files.map(fileMapper::toDto);
    }
    
    @Override
    public Page<FileDto> getAllFiles(Pageable pageable) {
        Page<FileEntity> files = fileRepository.findByIsActiveTrue(pageable);
        return files.map(fileMapper::toDto);
    }
    
    @Override
    public Page<FileDto> searchFiles(String keyword, Pageable pageable) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getPublicFiles(pageable);
        }
        
        Page<FileEntity> filesByName = fileRepository.searchByFileName(keyword.trim(), pageable);
        Page<FileEntity> filesByDescription = fileRepository.searchByDescription(keyword.trim(), pageable);
        
        // Combine results (this is a simple approach - in production you might want more sophisticated merging)
        if (filesByName.hasContent()) {
            return filesByName.map(fileMapper::toDto);
        }
        return filesByDescription.map(fileMapper::toDto);
    }
    
    @Override
    public Page<FileDto> getFilesByType(String fileType, Pageable pageable) {
        Page<FileEntity> files = fileRepository.findByFileTypeAndIsActiveTrue(fileType.toLowerCase(), pageable);
        return files.map(fileMapper::toDto);
    }
    
    @Override
    public List<FileDto> getRecentFiles(int limit) {
        List<FileEntity> files = fileRepository.findRecentFiles(Pageable.ofSize(limit));
        return fileMapper.toDtoList(files);
    }
    
    @Override
    public FileDto updateFileMetadata(Long fileId, FileUploadRequest request, String requestedBy) {
        FileEntity fileEntity = getFileEntityById(fileId);
        validateFileOwnership(fileEntity, requestedBy);
        
        fileEntity.setDescription(request.getDescription());
        fileEntity.setIsPublic(request.getIsPublic());
        fileEntity.setUpdatedAt(LocalDateTime.now());
        
        FileEntity updatedFile = fileRepository.save(fileEntity);
        log.info("File metadata updated: {} by user: {}", fileEntity.getOriginalFileName(), requestedBy);
        
        return fileMapper.toDto(updatedFile);
    }
    
    @Override
    public void deleteFile(Long fileId, String requestedBy) {
        FileEntity fileEntity = getFileEntityById(fileId);
        validateFileOwnership(fileEntity, requestedBy);
        
        // Soft delete - mark as inactive
        fileEntity.setIsActive(false);
        fileEntity.setUpdatedAt(LocalDateTime.now());
        fileRepository.save(fileEntity);
        
        log.info("File deleted (soft): {} by user: {}", fileEntity.getOriginalFileName(), requestedBy);
    }
    
    @Override
    public void toggleFileVisibility(Long fileId, String requestedBy) {
        FileEntity fileEntity = getFileEntityById(fileId);
        validateFileOwnership(fileEntity, requestedBy);
        
        fileEntity.setIsPublic(!fileEntity.getIsPublic());
        fileEntity.setUpdatedAt(LocalDateTime.now());
        fileRepository.save(fileEntity);
        
        log.info("File visibility toggled: {} to {} by user: {}", 
                fileEntity.getOriginalFileName(), fileEntity.getIsPublic(), requestedBy);
    }
    
    @Override
    public long getFileCountByUser(String username) {
        return fileRepository.countByUploadedByAndIsActiveTrue(username);
    }
    
    @Override
    public long getTotalFileCount() {
        return fileRepository.count();
    }
    
    @Override
    public boolean isFileAccessible(Long fileId, String requestedBy) {
        try {
            FileEntity fileEntity = getFileEntityById(fileId);
            return fileEntity.getIsPublic() || fileEntity.getUploadedBy().equals(requestedBy);
        } catch (Exception e) {
            return false;
        }
    }
    
    // Private helper methods
    
    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new FileStorageException("Cannot upload empty file");
        }
        
        String fileExtension = getFileExtension(file.getOriginalFilename());
        if (!isFileTypeAllowed(fileExtension)) {
            throw new FileStorageException("File type not allowed: " + fileExtension);
        }
        
        if (file.getSize() > 10 * 1024 * 1024) { // 10MB limit
            throw new FileStorageException("File size too large. Maximum allowed: 10MB");
        }
    }
    
    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf(".") + 1);
    }
    
    private boolean isFileTypeAllowed(String fileExtension) {
        if (allowedTypes == null || allowedTypes.trim().isEmpty()) {
            return true; // Allow all if not specified
        }
        
        String[] allowed = allowedTypes.split(",");
        for (String type : allowed) {
            if (type.trim().equalsIgnoreCase(fileExtension)) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Check if the file is an image
     */
    private boolean isImageFile(String fileExtension) {
        String[] imageTypes = {"jpg", "jpeg", "png", "gif", "bmp", "webp"};
        for (String type : imageTypes) {
            if (type.equalsIgnoreCase(fileExtension)) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Get file category based on file type
     */
    private String getFileCategory(String fileExtension) {
        if (isImageFile(fileExtension)) {
            return "image";
        } else if (Arrays.asList("pdf").contains(fileExtension.toLowerCase())) {
            return "document";
        } else if (Arrays.asList("doc", "docx", "txt").contains(fileExtension.toLowerCase())) {
            return "text";
        } else if (Arrays.asList("xls", "xlsx").contains(fileExtension.toLowerCase())) {
            return "spreadsheet";
        } else if (Arrays.asList("zip", "rar", "7z").contains(fileExtension.toLowerCase())) {
            return "archive";
        } else {
            return "other";
        }
    }
    
    private FileEntity getFileEntityById(Long fileId) {
        return fileRepository.findById(fileId)
                .orElseThrow(() -> new FileNotFoundException("File not found with id: " + fileId));
    }
    
    private void validateFileAccess(FileEntity fileEntity, String requestedBy) {
        if (!fileEntity.getIsActive()) {
            throw new FileNotFoundException("File is not available");
        }
        
        if (!fileEntity.getIsPublic() && !fileEntity.getUploadedBy().equals(requestedBy)) {
            throw new InsufficientPrivilegesException("Access denied to file: " + fileEntity.getOriginalFileName());
        }
    }
    
    private void validateFileOwnership(FileEntity fileEntity, String requestedBy) {
        if (!fileEntity.getIsActive()) {
            throw new FileNotFoundException("File is not available");
        }
        
        if (!fileEntity.getUploadedBy().equals(requestedBy)) {
            throw new InsufficientPrivilegesException("Only file owner can modify file: " + fileEntity.getOriginalFileName());
        }
    }
    
    private Resource getFileResource(String filePath) {
        try {
            Path path = Paths.get(filePath);
            Resource resource = new UrlResource(path.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new FileNotFoundException("File not found or not readable: " + filePath);
            }
        } catch (MalformedURLException e) {
            throw new FileNotFoundException("File not found: " + filePath, e);
        }
    }
}
