package com.example.file.controller;

import com.example.file.dto.FileDto;
import com.example.file.dto.FileUploadRequest;
import com.example.file.service.FileService;
import com.example.user.enums.UserRole;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.Valid;
import java.net.URLEncoder;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FileController {
    
    private final FileService fileService;
    
    @PostMapping("/upload")
    public ResponseEntity<FileDto> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("description") String description,
            @RequestParam("isPublic") Boolean isPublic) {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        FileUploadRequest request = new FileUploadRequest();
        request.setDescription(description);
        request.setIsPublic(isPublic);
        
        FileDto uploadedFile = fileService.uploadFile(file, request, username);
        log.info("File uploaded successfully by user: {}", username);
        
        return ResponseEntity.ok(uploadedFile);
    }
    
    @GetMapping("/download/{fileId}")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long fileId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        Resource resource = fileService.downloadFile(fileId, username);
        FileDto fileInfo = fileService.getFileById(fileId, username);
        
        String encodedFileName;
        try {
            encodedFileName = URLEncoder.encode(fileInfo.getOriginalFileName(), "UTF-8");
        } catch (Exception e) {
            encodedFileName = fileInfo.getOriginalFileName();
        }
        
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(fileInfo.getMimeType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + encodedFileName)
                .body(resource);
    }
    
    @GetMapping("/download/stored/{storedFileName}")
    public ResponseEntity<Resource> downloadFileByStoredName(@PathVariable String storedFileName) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        Resource resource = fileService.downloadFileByStoredName(storedFileName, username);
        FileDto fileInfo = fileService.getFileByStoredName(storedFileName, username);
        
        String encodedFileName;
        try {
            encodedFileName = URLEncoder.encode(fileInfo.getOriginalFileName(), "UTF-8");
        } catch (Exception e) {
            encodedFileName = fileInfo.getOriginalFileName();
        }
        
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(fileInfo.getMimeType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + encodedFileName)
                .body(resource);
    }
    
    @GetMapping("/{fileId}")
    public ResponseEntity<FileDto> getFile(@PathVariable Long fileId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        FileDto file = fileService.getFileById(fileId, username);
        return ResponseEntity.ok(file);
    }
    
    @GetMapping("/my-files")
    public ResponseEntity<Page<FileDto>> getMyFiles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<FileDto> files = fileService.getFilesByUser(username, pageable);
        
        return ResponseEntity.ok(files);
    }
    
    @GetMapping("/public")
    public ResponseEntity<Page<FileDto>> getPublicFiles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<FileDto> files = fileService.getPublicFiles(pageable);
        
        return ResponseEntity.ok(files);
    }
    
    @GetMapping("/search")
    public ResponseEntity<Page<FileDto>> searchFiles(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<FileDto> files = fileService.searchFiles(keyword, pageable);
        
        return ResponseEntity.ok(files);
    }
    
    @GetMapping("/type/{fileType}")
    public ResponseEntity<Page<FileDto>> getFilesByType(
            @PathVariable String fileType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<FileDto> files = fileService.getFilesByType(fileType, pageable);
        
        return ResponseEntity.ok(files);
    }
    
    @GetMapping("/recent")
    public ResponseEntity<List<FileDto>> getRecentFiles(
            @RequestParam(defaultValue = "5") int limit) {
        
        List<FileDto> files = fileService.getRecentFiles(limit);
        return ResponseEntity.ok(files);
    }
    
    @PutMapping("/{fileId}")
    public ResponseEntity<FileDto> updateFile(
            @PathVariable Long fileId,
            @Valid @RequestBody FileUploadRequest request) {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        FileDto updatedFile = fileService.updateFileMetadata(fileId, request, username);
        log.info("File metadata updated by user: {}", username);
        
        return ResponseEntity.ok(updatedFile);
    }
    
    @DeleteMapping("/{fileId}")
    public ResponseEntity<Void> deleteFile(@PathVariable Long fileId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        fileService.deleteFile(fileId, username);
        log.info("File deleted by user: {}", username);
        
        return ResponseEntity.noContent().build();
    }
    
    @PatchMapping("/{fileId}/toggle-visibility")
    public ResponseEntity<Void> toggleFileVisibility(@PathVariable Long fileId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        fileService.toggleFileVisibility(fileId, username);
        log.info("File visibility toggled by user: {}", username);
        
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/stats/my-count")
    public ResponseEntity<Long> getMyFileCount() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        long count = fileService.getFileCountByUser(username);
        return ResponseEntity.ok(count);
    }
    
    @GetMapping("/stats/total-count")
    public ResponseEntity<Long> getTotalFileCount() {
        long count = fileService.getTotalFileCount();
        return ResponseEntity.ok(count);
    }
    
    @GetMapping("/check-access/{fileId}")
    public ResponseEntity<Boolean> checkFileAccess(@PathVariable Long fileId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        
        boolean accessible = fileService.isFileAccessible(fileId, username);
        return ResponseEntity.ok(accessible);
    }
}
