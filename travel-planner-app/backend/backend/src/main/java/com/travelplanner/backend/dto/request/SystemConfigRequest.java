package com.travelplanner.backend.dto.request;

import lombok.Data;
import java.util.Map;

@Data
public class SystemConfigRequest {

    private String configKey;

    private String configValue;

    private Map<String, Object> settings;

    private Boolean restartRequired = false;
}