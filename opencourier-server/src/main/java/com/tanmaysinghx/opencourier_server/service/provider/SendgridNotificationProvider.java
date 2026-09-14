package com.tanmaysinghx.opencourier_server.service.provider;

import com.tanmaysinghx.opencourier_server.domain.ProviderConfig;
import org.springframework.stereotype.Component;

@Component
public class SendgridNotificationProvider implements NotificationProvider {

	@Override
	public String getProviderType() {
		return "SENDGRID";
	}

	@Override
	public boolean sendEmail(ProviderConfig config, String recipient, String subject, String htmlBody) throws Exception {
		// Mock/simulated SendGrid REST API v3 dispatch integration
		System.out.println("[SendGrid Dispatch] To: " + recipient + " Subject: " + subject + " via API Key");
		Thread.sleep(25);
		return true;
	}
}
