package com.example.file.mapper;

import com.example.file.dto.FileDto;
import com.example.file.entity.FileEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Mapper(componentModel = "spring")
public interface FileMapper {
    
    @Mapping(target = "downloadUrl", ignore = true)
    @Mapping(target = "fileSizeFormatted", ignore = true)
    @Mapping(target = "uploadDateFormatted", ignore = true)
    FileDto toDto(FileEntity entity);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "storedFileName", ignore = true)
    @Mapping(target = "filePath", ignore = true)
    @Mapping(target = "fileType", ignore = true)
    @Mapping(target = "fileSize", ignore = true)
    @Mapping(target = "mimeType", ignore = true)
    @Mapping(target = "uploadedBy", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    FileEntity toEntity(FileDto dto);
    
    List<FileDto> toDtoList(List<FileEntity> entities);
    
    @Named("formatFileSize")
    default String formatFileSize(Long bytes) {
        if (bytes == null) return "0 B";
        
        int unit = 1024;
        if (bytes < unit) return bytes + " B";
        int exp = (int) (Math.log(bytes) / Math.log(unit));
        String pre = "KMGTPE".charAt(exp - 1) + "";
        return String.format("%.1f %sB", bytes / Math.pow(unit, exp), pre);
    }
    
    @Named("formatDate")
    default String formatDate(java.time.LocalDateTime dateTime) {
        if (dateTime == null) return "";
        return dateTime.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
    }
}
