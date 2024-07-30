package com.example.demo.fileupload;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FileUploadRepository extends JpaRepository<FileUpload, Long> {
    List<FileUpload> findByUserId(String userId);
    Optional<FileUpload> findByUserIdAndFileName(String userId, String fileName); // or findById(Long id)
}

