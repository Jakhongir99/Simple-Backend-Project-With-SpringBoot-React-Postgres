package com.example.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import springfox.documentation.builders.ApiInfoBuilder;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.service.ApiInfo;
import springfox.documentation.service.Contact;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger2.annotations.EnableSwagger2;

@Configuration
@EnableSwagger2
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
    public Docket api() {
        return new Docket(DocumentationType.SWAGGER_2)
                .select()
                .apis(RequestHandlerSelectors.basePackage("com.example.controller"))
                .paths(PathSelectors.any())
                .build()
                .apiInfo(apiInfo());
    }

    private ApiInfo apiInfo() {
        return new ApiInfoBuilder()
                .title(apiTitle)
                .description(apiDescription)
                .version(apiVersion)
                .termsOfServiceUrl(termsOfServiceUrl)
                .contact(new Contact(contactName, contactUrl, contactEmail))
                .license(licenseName)
                .licenseUrl(licenseUrl)
                .build();
    }
}
