package com.tanmaysinghx.opencourier_server.web.rest;

import com.tanmaysinghx.opencourier_server.domain.Tenant;
import com.tanmaysinghx.opencourier_server.repository.TenantRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/tenants")
@CrossOrigin(origins = "*")
public class TenantController {

	private final TenantRepository tenantRepository;

	public TenantController(TenantRepository tenantRepository) {
		this.tenantRepository = tenantRepository;
	}

	@GetMapping
	public ResponseEntity<List<Tenant>> getAllTenants() {
		List<Tenant> tenants = tenantRepository.findAll();
		if (tenants.isEmpty()) {
			Tenant defaultTenant = Tenant.builder()
				.id("tenant_default")
				.name("Default Tenant")
				.createdAt(LocalDateTime.now())
				.build();
			tenantRepository.save(defaultTenant);
			tenants = List.of(defaultTenant);
		}
		return ResponseEntity.ok(tenants);
	}

	@PostMapping
	public ResponseEntity<Tenant> createTenant(@RequestBody Tenant tenant) {
		if (tenant.getId() == null || tenant.getId().isBlank()) {
			tenant.setId("tenant_" + UUID.randomUUID().toString().substring(0, 8));
		}
		tenant.setCreatedAt(LocalDateTime.now());
		return ResponseEntity.ok(tenantRepository.save(tenant));
	}
}
