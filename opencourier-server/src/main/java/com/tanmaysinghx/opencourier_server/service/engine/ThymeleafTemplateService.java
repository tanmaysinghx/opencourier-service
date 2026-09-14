package com.tanmaysinghx.opencourier_server.service.engine;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.HashMap;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.StringTemplateResolver;

@Service
public class ThymeleafTemplateService {

	private final TemplateEngine templateEngine;
	private final ObjectMapper objectMapper;

	public ThymeleafTemplateService() {
		this.objectMapper = new ObjectMapper();
		StringTemplateResolver templateResolver = new StringTemplateResolver();
		templateResolver.setTemplateMode(TemplateMode.HTML);
		templateResolver.setCacheable(false);

		this.templateEngine = new TemplateEngine();
		this.templateEngine.setTemplateResolver(templateResolver);
	}

	public String renderHtml(String templateSource, String jsonPayload) {
		try {
			Map<String, Object> variables = new HashMap<>();
			if (jsonPayload != null && !jsonPayload.isBlank()) {
				variables = objectMapper.readValue(jsonPayload, new TypeReference<Map<String, Object>>() {});
			}
			Context context = new Context();
			context.setVariables(variables);
			return templateEngine.process(templateSource, context);
		} catch (Exception e) {
			return "<div style='color:red; font-family:sans-serif;'><strong>Template Rendering Error:</strong> " 
				+ e.getMessage() + "</div>";
		}
	}
}
