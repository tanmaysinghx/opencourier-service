package com.tanmaysinghx.opencourier_server.web.rest;

import com.tanmaysinghx.opencourier_server.config.security.TenantContextHolder;
import com.tanmaysinghx.opencourier_server.domain.NotificationTemplate;
import com.tanmaysinghx.opencourier_server.repository.NotificationTemplateRepository;
import com.tanmaysinghx.opencourier_server.service.engine.ThymeleafTemplateService;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/templates")
@CrossOrigin(origins = "*")
public class TemplateController {

	private final NotificationTemplateRepository templateRepository;
	private final ThymeleafTemplateService templateService;

	public TemplateController(NotificationTemplateRepository templateRepository, ThymeleafTemplateService templateService) {
		this.templateRepository = templateRepository;
		this.templateService = templateService;
	}

	@GetMapping
	public ResponseEntity<List<NotificationTemplate>> getAllTemplates() {
		String tenantId = TenantContextHolder.getTenantId();
		return ResponseEntity.ok(templateRepository.findByTenantId(tenantId));
	}

	@GetMapping("/{id}")
	public ResponseEntity<NotificationTemplate> getTemplateById(@PathVariable String id) {
		String tenantId = TenantContextHolder.getTenantId();
		return templateRepository.findByIdAndTenantId(id, tenantId)
			.map(ResponseEntity::ok)
			.orElse(ResponseEntity.notFound().build());
	}

	@PostMapping
	public ResponseEntity<NotificationTemplate> createTemplate(@RequestBody NotificationTemplate template) {
		String tenantId = TenantContextHolder.getTenantId();
		if (template.getId() == null || template.getId().isBlank()) {
			template.setId("tmpl_" + UUID.randomUUID().toString());
		}
		template.setTenantId(tenantId);
		template.setCreatedAt(LocalDateTime.now());
		return ResponseEntity.ok(templateRepository.save(template));
	}

	@PostMapping("/preview")
	public ResponseEntity<Map<String, String>> previewTemplate(@RequestBody Map<String, String> request) {
		String sourceHtml = request.get("htmlContent");
		String jsonPayload = request.get("sampleJsonPayload");
		String renderedHtml = templateService.renderHtml(sourceHtml, jsonPayload);
		return ResponseEntity.ok(Map.of("renderedHtml", renderedHtml));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteTemplate(@PathVariable String id) {
		templateRepository.deleteById(id);
		return ResponseEntity.noContent().build();
	}
}
