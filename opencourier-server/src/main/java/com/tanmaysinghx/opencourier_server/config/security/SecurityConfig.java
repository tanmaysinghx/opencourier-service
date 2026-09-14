package com.tanmaysinghx.opencourier_server.config.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http
			.csrf(csrf -> csrf.disable())
			.cors(cors -> cors.configure(http))
			.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
			.authorizeHttpRequests(auth -> auth
				.requestMatchers(
					"/", "/index.html", "/favicon.ico", "/*.js", "/*.css", "/assets/**",
					"/api/public/**", "/api/v1/health", "/actuator/health", "/ws/**"
				).permitAll()
				.requestMatchers("/api/v1/**").permitAll() // Flexible local development & API key auth
				.anyRequest().permitAll()
			);

		return http.build();
	}
}
