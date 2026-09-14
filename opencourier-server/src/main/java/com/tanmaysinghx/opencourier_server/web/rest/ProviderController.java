package com.tanmaysinghx.opencourier_server.web.rest;

import com.tanmaysinghx.opencourier_server.config.security.TenantContextHolder;
import com.tanmaysinghx.opencourier_server.domain.ProviderConfig;
import com.tanmaysinghx.opencourier_server.repository.ProviderConfigRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/providers")
@CrossOrigin(origins = "*")
public class ProviderController {

	private final ProviderConfigRepository providerConfigRepository;

	public ProviderController(ProviderConfigRepository providerConfigRepository) {
		this.providerConfigRepository = providerConfigRepository;
	}

	@GetMapping
	public ResponseEntity<List<ProviderConfig>> getAllProviders() {
		String tenantId = TenantContextHolder.getTenantId();
		return ResponseEntity.ok(providerConfigRepository.findByTenantId(tenantId));
	}

	@PostMapping
	public ResponseEntity<ProviderConfig> saveProvider(@RequestBody ProviderConfig config) {
		String tenantId = TenantContextHolder.getTenantId();
		if (config.getId() == null || config.getId().isBlank()) {
			config.setId("prov_" + UUID.randomUUID().toString());
		}
		config.setTenantId(tenantId);
		config.setCreatedAt(LocalDateTime.now());
		return ResponseEntity.ok(providerConfigRepository.save(config));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteProvider(@PathVariable String id) {
		providerConfigRepository.deleteById(id);
		return ResponseEntity.noContent().build();
	}
}
