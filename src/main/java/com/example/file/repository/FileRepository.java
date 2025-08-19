package com.example.file.repository;

import com.example.file.entity.FileEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FileRepository extends JpaRepository<FileEntity, Long> {
    
    // Find files by uploader
    Page<FileEntity> findByUploadedByAndIsActiveTrue(String uploadedBy, Pageable pageable);
    
    // Find public files
    Page<FileEntity> findByIsPublicTrueAndIsActiveTrue(Pageable pageable);
    
    // Find files by type
    Page<FileEntity> findByFileTypeAndIsActiveTrue(String fileType, Pageable pageable);
    
    // Find files by uploader and type
    Page<FileEntity> findByUploadedByAndFileTypeAndIsActiveTrue(String uploadedBy, String fileType, Pageable pageable);
    
    // Search files by original filename (case-insensitive)
    @Query("SELECT f FROM FileEntity f WHERE LOWER(f.originalFileName) LIKE LOWER(CONCAT('%', :keyword, '%')) AND f.isActive = true")
    Page<FileEntity> searchByFileName(@Param("keyword") String keyword, Pageable pageable);
    
    // Search files by description (case-insensitive)
    @Query("SELECT f FROM FileEntity f WHERE LOWER(f.description) LIKE LOWER(CONCAT('%', :keyword, '%')) AND f.isActive = true")
    Page<FileEntity> searchByDescription(@Param("keyword") String keyword, Pageable pageable);
    
    // Find file by stored filename
    Optional<FileEntity> findByStoredFileNameAndIsActiveTrue(String storedFileName);
    
    // Count files by uploader
    long countByUploadedByAndIsActiveTrue(String uploadedBy);
    
    // Count files by type
    long countByFileTypeAndIsActiveTrue(String fileType);
    
    // Find recent files
    @Query("SELECT f FROM FileEntity f WHERE f.isActive = true ORDER BY f.createdAt DESC")
    List<FileEntity> findRecentFiles(Pageable pageable);
    
    // Find all active files
    @Query("SELECT f FROM FileEntity f WHERE f.isActive = true")
    Page<FileEntity> findByIsActiveTrue(Pageable pageable);
}
