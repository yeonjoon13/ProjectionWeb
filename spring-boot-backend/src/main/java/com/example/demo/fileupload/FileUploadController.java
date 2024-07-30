package com.example.demo.fileupload;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/file-upload")
public class FileUploadController {
    private final FileUploadService fileUploadService;

    @Autowired
    public FileUploadController(FileUploadService fileUploadService) {
        this.fileUploadService = fileUploadService;
    }

    // POST method to save file upload
    @PostMapping
    public void saveFileUpload(@RequestBody FileUpload fileUpload) {
        fileUploadService.saveFileUpload(fileUpload);
    }

    // GET method to fetch user's files
    @GetMapping("/{userId}")
    public List<FileUpload> getUserFiles(@PathVariable String userId) {
        return fileUploadService.getUserFiles(userId);
    }

    // DELETE method to delete a file by its ID
    @DeleteMapping("/{fileId}")
    public void deleteFileUpload(@PathVariable Long fileId) {
        fileUploadService.deleteFileUpload(fileId);
    }
    @GetMapping("/fileData/{userId}/{fileName}")
    public String getFileDataByUserIdAndFileName(@PathVariable String userId, @PathVariable String fileName) {
        return fileUploadService.getFileDataByUserIdAndFileName(userId, fileName);
    }
}
