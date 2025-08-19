package com.example.file.service;

import com.example.file.dto.FileDto;
import com.example.file.dto.FileUploadRequest;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface FileService {
    
    FileDto uploadFile(MultipartFile file, FileUploadRequest request, String uploadedBy);
    
    Resource downloadFile(Long fileId, String requestedBy);
    
    Resource downloadFileByStoredName(String storedFileName, String requestedBy);
    
    FileDto getFileById(Long fileId, String requestedBy);
    
    FileDto getFileByStoredName(String storedFileName, String requestedBy);
    
    Page<FileDto> getFilesByUser(String username, Pageable pageable);
    
    Page<FileDto> getPublicFiles(Pageable pageable);
    
    Page<FileDto> getAllFiles(Pageable pageable);
    
    Page<FileDto> searchFiles(String keyword, Pageable pageable);
    
    Page<FileDto> getFilesByType(String fileType, Pageable pageable);
    
    List<FileDto> getRecentFiles(int limit);
    
    FileDto updateFileMetadata(Long fileId, FileUploadRequest request, String requestedBy);
    
    void deleteFile(Long fileId, String requestedBy);
    
    void toggleFileVisibility(Long fileId, String requestedBy);
    
    long getFileCountByUser(String username);
    
    long getTotalFileCount();
    
    boolean isFileAccessible(Long fileId, String requestedBy);
}
