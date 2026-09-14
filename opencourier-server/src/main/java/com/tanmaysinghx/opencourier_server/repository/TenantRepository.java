package com.tanmaysinghx.opencourier_server.repository;

import com.tanmaysinghx.opencourier_server.domain.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TenantRepository extends JpaRepository<Tenant, String> {
}
