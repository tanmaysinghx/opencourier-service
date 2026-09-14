package com.tanmaysinghx.opencourier_server.config.security;

public class TenantContextHolder {

	private static final ThreadLocal<String> CURRENT_TENANT = new ThreadLocal<>();
	public static final String DEFAULT_TENANT_ID = "tenant_default";

	public static void setTenantId(String tenantId) {
		CURRENT_TENANT.set(tenantId);
	}

	public static String getTenantId() {
		String tenant = CURRENT_TENANT.get();
		return (tenant != null && !tenant.isBlank()) ? tenant : DEFAULT_TENANT_ID;
	}

	public static void clear() {
		CURRENT_TENANT.remove();
	}
}
