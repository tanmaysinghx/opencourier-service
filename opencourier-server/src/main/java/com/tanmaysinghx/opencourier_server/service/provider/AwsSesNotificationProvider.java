package com.tanmaysinghx.opencourier_server.service.provider;

import com.tanmaysinghx.opencourier_server.domain.ProviderConfig;
import org.springframework.stereotype.Component;

@Component
public class AwsSesNotificationProvider implements NotificationProvider {

	@Override
	public String getProviderType() {
		return "AWS_SES";
	}

	@Override
	public boolean sendEmail(ProviderConfig config, String recipient, String subject, String htmlBody) throws Exception {
		// Mock/simulated AWS SES dispatch integration
		System.out.println("[AWS SES Dispatch] To: " + recipient + " Subject: " + subject + " via " + config.getFromEmail());
		Thread.sleep(30);
		return true;
	}
}
