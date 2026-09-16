package com.aabid.hospitalappointmentsystem.entity;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "doctors")
@NoArgsConstructor
@AllArgsConstructor
@Data

public class Doctor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id",nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    private String specialization;

    @Column(nullable = false)
    private Integer experienceYear;
}
