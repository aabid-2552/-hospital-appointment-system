package com.aabid.hospitalappointmentsystem.dto;

import lombok.Data;
import java.time.DayOfWeek;
import java.time.LocalTime;

@Data
public class AvailabilityRequest {
    private DayOfWeek dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
}