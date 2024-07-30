package com.example.demo.patient;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

import java.time.LocalDate;
import java.time.Month;
import java.util.List;

@Configuration
public class PatientConfig {

    private static final Logger logger = LoggerFactory.getLogger(PatientConfig.class);

    @Bean
    @Order(1) // Ensure this runs before BloodTestConfig
    CommandLineRunner patientCommandLineRunner(PatientRepository repository) {
        return args -> {
            Patient mariam = new Patient(
                    "Mariam",
                    LocalDate.of(2000, Month.JANUARY, 23),
                    "Mariam@gmail.com"
            );
            Patient alex = new Patient(
                    "Alex",
                    LocalDate.of(2004, Month.JANUARY, 23),
                    "alex@gmail.com"
            );

            repository.saveAll(List.of(mariam, alex));
            logger.info("Patients saved: Mariam and Alex");
        };
    }
}
