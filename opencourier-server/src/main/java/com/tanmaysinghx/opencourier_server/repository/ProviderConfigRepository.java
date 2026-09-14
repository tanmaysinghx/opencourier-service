package com.tanmaysinghx.opencourier_server.repository;

import com.tanmaysinghx.opencourier_server.domain.ProviderConfig;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProviderConfigRepository extends JpaRepository<ProviderConfig, String> {
	List<ProviderConfig> findByTenantId(String tenantId);
	Optional<ProviderConfig> findByTenantIdAndIsDefaultTrue(String tenantId);
}
