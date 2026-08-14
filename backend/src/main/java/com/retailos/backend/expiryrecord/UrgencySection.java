package com.retailos.backend.expiryrecord;

import java.util.List;

public record UrgencySection(Urgency urgency, int count, List<DashboardRow> dashboardRowList) {
}
