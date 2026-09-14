package com.tanmaysinghx.opencourier_server.service.provider;

import com.tanmaysinghx.opencourier_server.domain.ProviderConfig;

public interface NotificationProvider {
	String getProviderType();
	boolean sendEmail(ProviderConfig config, String recipient, String subject, String htmlBody) throws Exception;
}
