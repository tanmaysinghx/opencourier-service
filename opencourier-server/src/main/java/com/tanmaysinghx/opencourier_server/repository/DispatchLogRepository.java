package com.tanmaysinghx.opencourier_server.repository;

import com.tanmaysinghx.opencourier_server.domain.DispatchLog;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface DispatchLogRepository extends JpaRepository<DispatchLog, String> {
	List<DispatchLog> findByTenantIdOrderByDispatchedAtDesc(String tenantId);
	long countByTenantIdAndStatus(String tenantId, String status);

	@Query("SELECT AVG(d.latencyMs) FROM DispatchLog d WHERE d.tenantId = :tenantId AND d.status = 'SENT'")
	Double findAverageLatencyByTenantId(String tenantId);
}
