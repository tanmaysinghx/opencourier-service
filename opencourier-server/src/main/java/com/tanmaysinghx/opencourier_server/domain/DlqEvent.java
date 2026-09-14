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
@Table(name = "dlq_events")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DlqEvent {

	@Id
	private String id;

	@Column(name = "tenant_id", nullable = false)
	private String tenantId;

	@Column(name = "template_id")
	private String templateId;

	@Column(nullable = false)
	private String recipient;

	@Lob
	private String payload;

	@Column(name = "retry_count", nullable = false)
	private int retryCount;

	@Lob
	@Column(name = "failure_reason")
	private String failureReason;

	@Column(name = "created_at", nullable = false)
	private LocalDateTime createdAt;
}
