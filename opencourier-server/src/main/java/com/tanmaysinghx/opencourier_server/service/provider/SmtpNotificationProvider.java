package com.tanmaysinghx.opencourier_server.service.provider;

import com.tanmaysinghx.opencourier_server.domain.ProviderConfig;
import jakarta.mail.internet.MimeMessage;
import java.util.Properties;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

@Component
public class SmtpNotificationProvider implements NotificationProvider {

	@Override
	public String getProviderType() {
		return "SMTP";
	}

	@Override
	public boolean sendEmail(ProviderConfig config, String recipient, String subject, String htmlBody) throws Exception {
		JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
		mailSender.setHost(config.getEndpointOrHost() != null ? config.getEndpointOrHost() : "localhost");
		mailSender.setPort(config.getPort() != null ? config.getPort() : 25);
		if (config.getApiKeyOrPassword() != null && !config.getApiKeyOrPassword().isBlank()) {
			mailSender.setPassword(config.getApiKeyOrPassword());
		}

		Properties props = mailSender.getJavaMailProperties();
		props.put("mail.transport.protocol", "smtp");
		props.put("mail.smtp.auth", "false");
		props.put("mail.smtp.starttls.enable", "true");

		MimeMessage message = mailSender.createMimeMessage();
		MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
		helper.setFrom(config.getFromEmail());
		helper.setTo(recipient);
		helper.setSubject(subject);
		helper.setText(htmlBody, true);

		mailSender.send(message);
		return true;
	}
}
