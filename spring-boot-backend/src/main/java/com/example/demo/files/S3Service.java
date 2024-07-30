package com.example.demo.files;

import com.amazonaws.services.s3.AmazonS3;
import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class S3Service {

    @Autowired
    private AmazonS3 amazonS3;

    private final String bucketName;

    // Load the environment variables using Dotenv
    private final Dotenv dotenv = Dotenv.load();

    public S3Service() {
        this.bucketName = dotenv.get("AWS_BUCKET_NAME");
    }

    public String uploadFile(MultipartFile file) throws IOException {
        String fileName = file.getOriginalFilename();
        amazonS3.putObject(bucketName, fileName, file.getInputStream(), null);
        return amazonS3.getUrl(bucketName, fileName).toString();
    }
}
