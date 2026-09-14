package com.tanmaysinghx.opencourier_server.service.provider;

import com.tanmaysinghx.opencourier_server.domain.ProviderConfig;
import org.springframework.stereotype.Component;

@Component
public class MailgunNotificationProvider implements NotificationProvider {

	@Override
	public String getProviderType() {
		return "MAILGUN";
	}

	@Override
	public boolean sendEmail(ProviderConfig config, String recipient, String subject, String htmlBody) throws Exception {
		// Mock/simulated Mailgun v3 API dispatch integration
		System.out.println("[Mailgun Dispatch] To: " + recipient + " Subject: " + subject + " via Mailgun domain");
		Thread.sleep(20);
		return true;
	}
}
