using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Local.Api.Migrations
{
    /// <inheritdoc />
    public partial class SeedInitialReferenceData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "VisibilityRules",
                type: "uuid",
                nullable: false,
                defaultValueSql: "gen_random_uuid()",
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "Users",
                type: "uuid",
                nullable: false,
                defaultValueSql: "gen_random_uuid()",
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "Responses",
                type: "uuid",
                nullable: false,
                defaultValueSql: "gen_random_uuid()",
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "Residences",
                type: "uuid",
                nullable: false,
                defaultValueSql: "gen_random_uuid()",
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "Questions",
                type: "uuid",
                nullable: false,
                defaultValueSql: "gen_random_uuid()",
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "Communities",
                type: "uuid",
                nullable: false,
                defaultValueSql: "gen_random_uuid()",
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "Categories",
                type: "uuid",
                nullable: false,
                defaultValueSql: "gen_random_uuid()",
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.Sql(
                """
                INSERT INTO "Communities" ("Name")
                VALUES ('Peruana');

                INSERT INTO "Residences" ("State", "Country", "Region")
                VALUES
                    ('New York', 'United States', 'Northeastern'),
                    ('Florida', 'United States', 'Southeastern'),
                    ('Pennsylvania', 'United States', 'Northeastern');

                INSERT INTO "Categories" ("Name")
                VALUES
                    ('Restaurant'),
                    ('Emprendimientos'),
                    ('Vivienda');
                """
            );

            migrationBuilder.Sql(
                """
                INSERT INTO "VisibilityRules"
                (
                    "SourceCommunityId",
                    "SourceResidenceId",
                    "AllowedCommunityId",
                    "AllowedResidenceId"
                )
                SELECT
                    c."Id",
                    r."Id",
                    c."Id",
                    r."Id"
                FROM "Communities" c
                CROSS JOIN "Residences" r
                WHERE c."Name" = 'Peruana'
                  AND r."State" IN ('New York', 'Florida', 'Pennsylvania')
                  AND r."Country" = 'United States';
                """
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                DELETE FROM "VisibilityRules"
                WHERE "SourceCommunityId" = "AllowedCommunityId"
                  AND "SourceResidenceId" = "AllowedResidenceId"
                  AND "SourceCommunityId" IN (
                      SELECT "Id"
                      FROM "Communities"
                      WHERE "Name" = 'Peruana'
                  )
                  AND "SourceResidenceId" IN (
                      SELECT "Id"
                      FROM "Residences"
                      WHERE "State" IN ('New York', 'Florida', 'Pennsylvania')
                        AND "Country" = 'United States'
                  );
                """
            );

            migrationBuilder.Sql(
                """
                DELETE FROM "Categories"
                WHERE "Name" IN ('Restaurant', 'Emprendimientos', 'Vivienda');

                DELETE FROM "Residences"
                WHERE "State" IN ('New York', 'Florida', 'Pennsylvania')
                  AND "Country" = 'United States';

                DELETE FROM "Communities"
                WHERE "Name" = 'Peruana';
                """
            );

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "VisibilityRules",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldDefaultValueSql: "gen_random_uuid()");

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "Users",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldDefaultValueSql: "gen_random_uuid()");

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "Responses",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldDefaultValueSql: "gen_random_uuid()");

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "Residences",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldDefaultValueSql: "gen_random_uuid()");

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "Questions",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldDefaultValueSql: "gen_random_uuid()");

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "Communities",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldDefaultValueSql: "gen_random_uuid()");

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "Categories",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldDefaultValueSql: "gen_random_uuid()");
        }
    }
}