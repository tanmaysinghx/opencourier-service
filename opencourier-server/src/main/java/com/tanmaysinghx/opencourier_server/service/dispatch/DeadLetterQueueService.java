package com.tanmaysinghx.opencourier_server.service.dispatch;

import com.tanmaysinghx.opencourier_server.domain.DlqEvent;
import com.tanmaysinghx.opencourier_server.repository.DlqEventRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class DeadLetterQueueService {

	private final DlqEventRepository dlqEventRepository;

	public DeadLetterQueueService(DlqEventRepository dlqEventRepository) {
		this.dlqEventRepository = dlqEventRepository;
	}

	public void recordFailure(String tenantId, String templateId, String recipient, String payload, int retryCount, String reason) {
		DlqEvent event = DlqEvent.builder()
			.id("dlq_" + UUID.randomUUID().toString())
			.tenantId(tenantId)
			.templateId(templateId)
			.recipient(recipient)
			.payload(payload)
			.retryCount(retryCount)
			.failureReason(reason)
			.createdAt(LocalDateTime.now())
			.build();
		dlqEventRepository.save(event);
	}

	public List<DlqEvent> getEventsForTenant(String tenantId) {
		return dlqEventRepository.findByTenantIdOrderByCreatedAtDesc(tenantId);
	}

	public void deleteDlqEvent(String id) {
		dlqEventRepository.deleteById(id);
	}

	public DlqEvent getEventById(String id) {
		return dlqEventRepository.findById(id).orElse(null);
	}
}
