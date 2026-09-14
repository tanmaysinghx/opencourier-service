package com.tanmaysinghx.opencourier_server.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "dispatch_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DispatchLog {

	@Id
	private String id;

	@Column(name = "tenant_id", nullable = false)
	private String tenantId;

	@Column(name = "template_id")
	private String templateId;

	@Column(nullable = false)
	private String recipient;

	@Column(nullable = false)
	private String channel; // EMAIL, SMS, PUSH, WEBHOOK

	@Column(name = "provider_name")
	private String providerName;

	@Column(nullable = false)
	private String status; // SENT, QUEUED, FAILED, RETRIED

	@Column(name = "latency_ms")
	private Long latencyMs;

	@Lob
	@Column(name = "error_details")
	private String errorDetails;

	@Column(name = "dispatched_at", nullable = false)
	private LocalDateTime dispatchedAt;
}
