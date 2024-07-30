package com.example.demo.fileupload;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FileUploadService {
    private final FileUploadRepository fileUploadRepository;

    @Autowired
    public FileUploadService(FileUploadRepository fileUploadRepository) {
        this.fileUploadRepository = fileUploadRepository;
    }

    public void saveFileUpload(FileUpload fileUpload) {
        fileUpload.setUploadedAt(LocalDateTime.now());
        fileUploadRepository.save(fileUpload);
    }

    public List<FileUpload> getUserFiles(String userId) {
        return fileUploadRepository.findByUserId(userId);
    }

    public String getFileDataByUserIdAndFileName(String userId, String fileName) {
        Optional<FileUpload> fileUpload = fileUploadRepository.findByUserIdAndFileName(userId, fileName);
        if (fileUpload.isPresent()) {
            String fileData = fileUpload.get().getFileData();
            if (fileData != null && !fileData.isEmpty()) {
                return extractLabResults(fileData);
            }
        }
        return null; // Or handle the case where no fileData is found
    }

    private String extractLabResults(String fileData) {
        StringBuilder extractedText = new StringBuilder();

        // Split the fileData by lines
        String[] lines = fileData.split("\n");

        // Iterate through each line and extract the lab results
        for (String line : lines) {
            line = line.trim();
            if (line.startsWith("-")) {
                extractedText.append(line.substring(2)).append("\n"); // Append the lab result, excluding the "- "
            } else if (line.matches("^\\w+: .*$")) {
                extractedText.append(line).append("\n"); // Append lines that match the lab result format
            }
        }

        return extractedText.toString().trim();
    }

    public void deleteFileUpload(Long fileId) {
        fileUploadRepository.deleteById(fileId);
    }

    // Other service methods as needed
}
