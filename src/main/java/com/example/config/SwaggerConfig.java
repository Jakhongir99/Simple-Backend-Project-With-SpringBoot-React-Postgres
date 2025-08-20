package com.example.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Value("${swagger.api.title:Java Simple CRUD API}")
    private String apiTitle;

    @Value("${swagger.api.description:REST API for CRUD operations}")
    private String apiDescription;

    @Value("${swagger.api.version:1.0.0}")
    private String apiVersion;

    @Value("${swagger.api.terms:https://example.com/terms}")
    private String termsOfServiceUrl;

    @Value("${swagger.contact.name:Your Name}")
    private String contactName;

    @Value("${swagger.contact.url:https://your-website.example}")
    private String contactUrl;

    @Value("${swagger.contact.email:your.email@example.com}")
    private String contactEmail;

    @Value("${swagger.license.name:Apache 2.0}")
    private String licenseName;

    @Value("${swagger.license.url:https://www.apache.org/licenses/LICENSE-2.0}")
    private String licenseUrl;

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title(apiTitle)
                        .description(apiDescription)
                        .version(apiVersion)
                        .termsOfService(termsOfServiceUrl)
                        .contact(new Contact()
                                .name(contactName)
                                .url(contactUrl)
                                .email(contactEmail))
                        .license(new License()
                                .name(licenseName)
                                .url(licenseUrl)));
    }
}
