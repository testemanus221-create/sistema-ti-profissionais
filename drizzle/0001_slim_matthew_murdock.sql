CREATE TABLE `areas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome_area` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `areas_id` PRIMARY KEY(`id`),
	CONSTRAINT `areas_nome_area_unique` UNIQUE(`nome_area`)
);
--> statement-breakpoint
CREATE TABLE `cidades` (
	`id` int AUTO_INCREMENT NOT NULL,
	`estado_id` int NOT NULL,
	`nome_cidade` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cidades_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `estados` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome_estado` varchar(255) NOT NULL,
	`uf` varchar(2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `estados_id` PRIMARY KEY(`id`),
	CONSTRAINT `estados_nome_estado_unique` UNIQUE(`nome_estado`),
	CONSTRAINT `estados_uf_unique` UNIQUE(`uf`)
);
--> statement-breakpoint
CREATE TABLE `municipios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cidade_id` int NOT NULL,
	`nome_municipio` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `municipios_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tecnico_municipios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tecnico_id` int NOT NULL,
	`municipio_id` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tecnico_municipios_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tecnicos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`usuario_id` int NOT NULL,
	`area_id` int NOT NULL,
	`estado_id` int NOT NULL,
	`cidade_id` int NOT NULL,
	`whatsapp` varchar(20) NOT NULL,
	`email` varchar(320) NOT NULL,
	`disponivel` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tecnicos_id` PRIMARY KEY(`id`),
	CONSTRAINT `tecnicos_usuario_id_unique` UNIQUE(`usuario_id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);--> statement-breakpoint
ALTER TABLE `cidades` ADD CONSTRAINT `cidades_estado_id_estados_id_fk` FOREIGN KEY (`estado_id`) REFERENCES `estados`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `municipios` ADD CONSTRAINT `municipios_cidade_id_cidades_id_fk` FOREIGN KEY (`cidade_id`) REFERENCES `cidades`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tecnico_municipios` ADD CONSTRAINT `tecnico_municipios_tecnico_id_tecnicos_id_fk` FOREIGN KEY (`tecnico_id`) REFERENCES `tecnicos`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tecnico_municipios` ADD CONSTRAINT `tecnico_municipios_municipio_id_municipios_id_fk` FOREIGN KEY (`municipio_id`) REFERENCES `municipios`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tecnicos` ADD CONSTRAINT `tecnicos_usuario_id_users_id_fk` FOREIGN KEY (`usuario_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tecnicos` ADD CONSTRAINT `tecnicos_area_id_areas_id_fk` FOREIGN KEY (`area_id`) REFERENCES `areas`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tecnicos` ADD CONSTRAINT `tecnicos_estado_id_estados_id_fk` FOREIGN KEY (`estado_id`) REFERENCES `estados`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `tecnicos` ADD CONSTRAINT `tecnicos_cidade_id_cidades_id_fk` FOREIGN KEY (`cidade_id`) REFERENCES `cidades`(`id`) ON DELETE no action ON UPDATE no action;