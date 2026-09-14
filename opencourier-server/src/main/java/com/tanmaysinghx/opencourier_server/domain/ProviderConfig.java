package com.tanmaysinghx.opencourier_server.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "provider_configs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProviderConfig {

	@Id
	private String id;

	@Column(name = "tenant_id", nullable = false)
	private String tenantId;

	@Column(name = "provider_type", nullable = false)
	private String providerType; // SMTP, AWS_SES, SENDGRID, MAILGUN, POSTMARK, RESEND, BREVO

	@Column(nullable = false)
	private String name;

	@Column(name = "api_key_or_password")
	private String apiKeyOrPassword;

	@Column(name = "endpoint_or_host")
	private String endpointOrHost;

	private Integer port;

	@Column(name = "from_email", nullable = false)
	private String fromEmail;

	@Column(name = "is_default", nullable = false)
	private boolean isDefault;

	@Column(name = "created_at", nullable = false)
	private LocalDateTime createdAt;
}
