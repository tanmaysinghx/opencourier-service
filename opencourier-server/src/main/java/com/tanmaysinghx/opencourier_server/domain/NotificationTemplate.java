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
@Table(name = "notification_templates")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationTemplate {

	@Id
	private String id;

	@Column(name = "tenant_id", nullable = false)
	private String tenantId;

	@Column(nullable = false)
	private String name;

	@Column(nullable = false)
	private String subject;

	@Column(name = "template_type", nullable = false)
	private String templateType;

	@Lob
	@Column(name = "html_content", nullable = false)
	private String htmlContent;

	@Lob
	@Column(name = "sample_json_payload")
	private String sampleJsonPayload;

	@Column(name = "created_at", nullable = false)
	private LocalDateTime createdAt;

	@Column(name = "updated_at")
	private LocalDateTime updatedAt;
}
