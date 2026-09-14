package com.tanmaysinghx.opencourier_server.web.rest;

import com.tanmaysinghx.opencourier_server.config.security.TenantContextHolder;
import com.tanmaysinghx.opencourier_server.domain.DispatchLog;
import com.tanmaysinghx.opencourier_server.domain.DlqEvent;
import com.tanmaysinghx.opencourier_server.repository.DispatchLogRepository;
import com.tanmaysinghx.opencourier_server.service.dispatch.DeadLetterQueueService;
import com.tanmaysinghx.opencourier_server.service.dispatch.VirtualThreadDispatchService;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/dispatch")
@CrossOrigin(origins = "*")
public class DispatchController {

	private final VirtualThreadDispatchService dispatchService;
	private final DispatchLogRepository dispatchLogRepository;
	private final DeadLetterQueueService dlqService;

	public DispatchController(
			VirtualThreadDispatchService dispatchService,
			DispatchLogRepository dispatchLogRepository,
			DeadLetterQueueService dlqService) {
		this.dispatchService = dispatchService;
		this.dispatchLogRepository = dispatchLogRepository;
		this.dlqService = dlqService;
	}

	@PostMapping("/send")
	public ResponseEntity<Map<String, Object>> triggerDispatch(@RequestBody Map<String, Object> request) {
		String tenantId = TenantContextHolder.getTenantId();
		String templateId = (String) request.get("templateId");
		@SuppressWarnings("unchecked")
		List<String> recipients = (List<String>) request.get("recipients");
		String jsonPayload = (String) request.get("jsonPayload");

		if (recipients == null || recipients.isEmpty()) {
			return ResponseEntity.badRequest().body(Map.of("error", "Recipients array cannot be empty"));
		}

		dispatchService.dispatchBatch(tenantId, templateId, recipients, jsonPayload);

		return ResponseEntity.ok(Map.of(
			"message", "Dispatch queued successfully",
			"batchSize", recipients.size(),
			"status", "QUEUED"
		));
	}

	@GetMapping("/logs")
	public ResponseEntity<List<DispatchLog>> getLogs() {
		String tenantId = TenantContextHolder.getTenantId();
		return ResponseEntity.ok(dispatchLogRepository.findByTenantIdOrderByDispatchedAtDesc(tenantId));
	}

	@GetMapping("/dlq")
	public ResponseEntity<List<DlqEvent>> getDlqEvents() {
		String tenantId = TenantContextHolder.getTenantId();
		return ResponseEntity.ok(dlqService.getEventsForTenant(tenantId));
	}
}
