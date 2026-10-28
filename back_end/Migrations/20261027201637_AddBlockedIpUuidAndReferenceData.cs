
using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Local.Api.Migrations
{
    public partial class AddBlockedIpUuidAndReferenceData : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "BlockedIps",
                type: "uuid",
                nullable: false,
                defaultValueSql: "gen_random_uuid()",
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.Sql(
                """
                UPDATE "Communities"
                SET "Name" = 'Peru'
                WHERE "Name" = 'Peruana'
                  AND NOT EXISTS (
                      SELECT 1
                      FROM "Communities"
                      WHERE "Name" = 'Peru'
                  );
                """
            );

            migrationBuilder.Sql(
                """
                INSERT INTO "Residences"
                    ("State", "Country", "Region")
                SELECT
                    'New Jersey',
                    'United States',
                    'Northeastern'
                WHERE NOT EXISTS (
                    SELECT 1
                    FROM "Residences"
                    WHERE "State" = 'New Jersey'
                      AND "Country" = 'United States'
                );
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
                WHERE c."Name" = 'Peru'
                  AND r."State" IN (
                      'New York',
                      'New Jersey',
                      'Florida',
                      'Pennsylvania'
                  )
                  AND r."Country" = 'United States'
                  AND NOT EXISTS (
                      SELECT 1
                      FROM "VisibilityRules" v
                      WHERE v."SourceCommunityId" = c."Id"
                        AND v."SourceResidenceId" = r."Id"
                        AND v."AllowedCommunityId" = c."Id"
                        AND v."AllowedResidenceId" = r."Id"
                  );
                """
            );
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "BlockedIps",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldDefaultValueSql: "gen_random_uuid()");

            migrationBuilder.Sql(
                """
                UPDATE "Communities"
                SET "Name" = 'Peruana'
                WHERE "Name" = 'Peru'
                  AND NOT EXISTS (
                      SELECT 1
                      FROM "Communities"
                      WHERE "Name" = 'Peruana'
                  );
                """
            );

        }
    }
}
